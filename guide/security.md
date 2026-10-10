# ความปลอดภัย

หน้านี้อธิบาย controls ที่พบใน source และข้อจำกัดที่ยังทราบ ไม่ใช่ security certification

## Authentication และ session

- Password ถูกตรวจด้วย `bcryptjs`
- Cookie session ใช้ signed token แบบ HMAC-SHA256 ผ่าน `lib/security/session.ts`
- Token payload ระบุ user id และ expiry
- Cookie ตั้ง `httpOnly`, `sameSite: strict`, path `/`; `secure` เปิดเมื่อ `NODE_ENV=production`
- อายุ session ตั้งไว้ 7 วัน
- `SESSION_SECRET` เป็นเงื่อนไขการออก token; ถ้าไม่มีจะ fail closed
- `guardApiSession()` ป้องกัน protected API operations ด้วย authenticated session

ตัว guard ปัจจุบันตรวจ session/user ไม่ได้แยก role ต่อ operation ดังนั้นอย่าอ้างว่า role-based authorization ถูกบังคับครบทุก endpoint

## API exposure ที่ควรรู้

- Write routes และ `/api/admin/*` มี session guard ตาม policy/tests; auth/setup/bootstrap เป็นกรณียกเว้นที่มี flow เฉพาะ
- `GET /api/projects` เปิด public ตาม business policy และคืนเฉพาะ approved projection
- Page public API ต้องกรอง unpublished Pages ให้ anonymous callers
- `GET /api/staff` และบาง read endpoints เปิดให้ anonymous callers ตาม route ปัจจุบัน ควรตรวจ payload และ privacy requirements ก่อนเผยแพร่ข้อมูลจริง โดยเฉพาะข้อมูลติดต่อ
- CORS ไม่ใช่ access control: curl/server clients เรียก endpoint ได้แม้ browser จะบล็อกการอ่าน response เพราะ origin

## Cross-origin policy

`proxy.ts` อ่าน `ALLOWED_ORIGINS` และเลือก exact origin; wildcard ถูกตัดทิ้ง ไม่มี origin ใน allowlist หมายถึง response ไม่มี CORS allow header และ preflight ถูกปฏิเสธ

ปัจจุบัน Public Web ใช้ server-side fetch เป็นหลัก ดังนั้น server-to-server requests ไม่ถูก browser CORS enforcement ควบคุม

## HTML content — Sanitization ปิดแล้ว (2026-10-10)

CMS และ Public Web ใช้ `sanitize-html` allowlist + `normalizeUrl` ทั้งตอนบันทึก (`app/api/pages` ×2) และตอน render ทั้งสองทาง (`app/[slug]` + `apps/web/[slug]`) — dependency `sanitize-html@^2.18.0` ติดตั้งครบ ทดสอบผ่านใน `tests/xss-sanitization.test.mjs` ×5 · `dangerouslySetInnerHTML` ยังใช้แต่ input ถูก sanitize แล้ว

## Upload

- `/api/upload` + `/api/admin/media` กำหนด allowlist MIME: JPEG, PNG, WebP, GIF — **ตัด `image/svg+xml` ออกแล้ว** (จนกว่าจะมี SVG sanitizer ที่เชื่อถือได้) และขนาดไม่เกิน 5 MiB (CMS) / 10 MiB (admin media)
- route ใช้ session guard + rate limit (in-memory fixed-window, hard cap 10k buckets, env `UPLOAD_RATE_LIMIT_MAX`/`WINDOW_MS`)
- ตรวจ content สายตา (magic bytes) ต้องตรงกับ declared `file.type` — JPEG `FFD8FF`, PNG `89504E47`, WebP `RIFF....WEBP`, GIF `GIF8`
- ไฟล์ไม่ตรง → 400 `File content does not match its declared type`

## Automation secret

Cron runner ใช้ `AUTOMATION_CRON_SECRET` และ fail-closed เมื่อไม่ได้ตั้ง สามารถส่งผ่าน `x-automation-token` หรือ Bearer authorization header ได้ ห้ามใส่ค่าใน URL/query string หรือ logs

## Encryption at rest

`lib/security/secrets.ts` ใช้ AES-256-GCM helper สำหรับ encrypted secrets โดย derive key จาก `APP_ENCRYPTION_KEY` หากเปลี่ยน key โดยไม่มี re-encryption plan อาจถอดข้อมูลเก่าไม่ได้

## Operational checklist

- เปิด HTTPS ใน production เพื่อป้องกัน credential/session interception
- ตั้ง `SESSION_SECRET`, `APP_ENCRYPTION_KEY` และ cron secret ใน secret manager
- ใช้ exact CORS origins
- ปิด extension writes หากไม่จำเป็น; อย่าติดตั้ง extension ที่ไม่ได้ review
- ป้องกัน database/media backups และจำกัด operator access
- ห้าม log cookies, authorization headers, passwords หรือ connection strings
- ทบทวน sanitize/rate-limit findings ก่อนเปิด production

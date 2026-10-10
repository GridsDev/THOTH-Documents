# สถานะและข้อจำกัด

**ฐานข้อมูลข้อเท็จจริงในหน้านี้ตรวจจาก source ณ วันที่ 11 ตุลาคม 2026**; เอกสารนี้ไม่ใช่ประกาศ release ใหม่

## ทำแล้วตามรายงานและ source ที่ตรวจ

- CMS มี session token แบบ signed และ guard สำหรับ write/admin API; tests ตรวจ route policy
- มี Node built-in tests; **151 tests ผ่าน** (`node --test tests/*.test.mjs` — 14 ไฟล์)
- `apps/web/` มี package, routes และ API client แยกจาก CMS
- Projects public by design และ response ใช้ `PUBLIC_PROJECT_SELECT`
- Pages รองรับ `isPublished` และ public GET ปฏิเสธ draft
- **HTML sanitization:** ปิดครบ (2026-10-10) — `sanitize-html` allowlist + `normalizeUrl` ใช้ตอนบันทึก (`app/api/pages` ×2) + ตอน render ทั้งสองทาง (`app/[slug]` + `apps/web/[slug]`)
- **Upload rate limit + content sniff:** `/api/upload` + `/api/admin/media` มี session guard, rate limit, ตรวจ magic bytes ตรงกับ declared type, **ตัด SVG ออกจาก allowlist**
- **Login brute-force protection:** buckets 2 ชั้น (ต่อ IP + ต่อ account) `lib/security/login-limit.ts` · 429 + `Retry-After` · success reset account bucket
- **XSS sanitization & upload content-sniff tests:** เพิ่ม `tests/xss-sanitization.test.mjs` ×5, `tests/upload-guard.test.mjs` ×10, `tests/login-limit.test.mjs` ×8
- **Lint baseline:** 0 errors / 17 warnings (root) — CI lint gate เปิดแล้ว
- **Engine constraint:** Node `>=20.9.0` (ตรงกับ Next.js 16)

## ยังเปิดอยู่/ต้องระวัง

1. **Startup fail-fast สำหรับ `APP_ENCRYPTION_KEY`:** ยังตรวจตอนเรียกใช้ (readiness check ผ่าน `GET /api/system/bootstrap` → `features.secrets` + การ์ดบน `/admin/database`) · startup fail-fast deferred ตามมติ
2. **Public data review:** `GET /api/staff` เปิด read และ response implementation คืน staff records; ตรวจว่าข้อมูลติดต่อที่เก็บอยู่เหมาะจะเผยแพร่หรือไม่
3. **Project ทั้งหมด public:** เป็น policy ตั้งใจ ไม่ใช่ข้อบกพร่อง แต่ผู้ดูแลต้องไม่เก็บข้อมูลที่ไม่ควรเผยแพร่ใน Project fields
4. **Production cutover:** CMS ยังมี public routes ซ้ำกับ `apps/web`; ขั้น D ยังไม่ทำ
5. **Products/Dashboard ใน root CMS:** ถูกลบแล้ว (2026-10-10) — `/products` และ `/dashboard` ไม่มีใน CMS root; `apps/web/` มี `/products` redirect ไป `/projects`
6. **API versioning/pagination:** ไม่พบสัญญา versioned API หรือ pagination ทั่วไปจาก routes ที่ตรวจ
7. **Database deployment:** มี baseline migration `20261010120000_init`; Docker entrypoint รัน `prisma migrate deploy` · Production ใช้ Vercel ซึ่งไม่เรียก Dockerfile และไม่ apply migrations จาก `vercel.json` อัตโนมัติ ฐานข้อมูลเดิมที่สร้างด้วย `db push` ต้อง `prisma migrate resolve --applied 20261010120000_init` ก่อนครั้งแรก ดู [การปรับใช้ฐานข้อมูล](/guide/database-deployment) และ [การติดตั้งใช้งาน](/guide/deployment)
8. **E2E Playwright:** ยังไม่ทำ (ต้องติดตั้ง browser + dev server)
9. **Core 8–9 (roadmap):** ยังไม่อนุมัติ implementation รายเฟส

## แยก “เสร็จ” จาก “แผน”

| รายการ | สถานะตามข้อมูลที่มี |
| --- | --- |
| ขั้น 0/A/B/C ของแผนแยก Public Web | รายงานโครงการระบุว่าเสร็จ; ขั้น C เพิ่ม routes/API |
| ขั้น D: test deployment/cutover และถอด duplicate pages | ยังไม่เริ่ม |
| ขั้น E: แยก repository | ยังไม่เริ่ม |
| OpenAPI `/api/v1` | งานต่อยอด ไม่ใช่สิ่งที่ยืนยันว่ามีแล้ว |
| Extension hot-load arbitrary routes | ไม่ยืนยันว่ารองรับ |
| Core 8 (XSS sanitization) | ✅ เสร็จ (2026-10-10) |
| Core 8.2 (Rich-text/Block editor) | ✅ รอบแรกเสร็จ (2026-10-10) |
| Core 8.3 (Webhooks) / 9 (RBAC, Revision) | ยังไม่อนุมัติ implementation |

## ผลการตรวจที่เกี่ยวกับเอกสารนี้

- `npm test` ของ CMS: **151 ผ่าน, 0 ล้ม** (14 ไฟล์)
- `npx tsc --noEmit` + `npm run build` + `npm run lint` ผ่านครบทุกเฟส
- เอกสาร VitePress ยังต้องรัน build หลังติดตั้ง dependencies
- THOTH source directory ไม่มี Git metadata ตาม project context; ห้ามอ้าง diff/history จาก Git

## เมื่อใดต้องอัปเดตหน้านี้

อัปเดตหลังเปลี่ยน security controls, API policy, Project visibility, sanitizer, upload controls, routes, cutover หรือ database deployment method พร้อมระบุวันที่/หลักฐานใน source/tests
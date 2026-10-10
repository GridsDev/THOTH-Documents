# การตั้งค่า Environment

## หลักการ

- แยก environment ต่อแอปและต่อ environment: local, preview, production
- เก็บค่าจริงใน `.env.local`, platform environment variables หรือ secret manager
- ใช้ `.env.example` เป็น template ที่ไม่มี credentials จริง
- `NEXT_PUBLIC_*` เป็นค่าที่ฝัง/เปิดเผยต่อ browser ได้ ห้ามใช้กับ secret
- เปลี่ยน secret ต้องวางแผนผลกระทบต่อ session/encrypted records ก่อน

## CMS variables ที่ใช้งานจริงตาม source

| Variable | จำเป็นเมื่อ | หมายเหตุ |
| --- | --- | --- |
| `DATABASE_URL` | ใช้ Prisma/database | PostgreSQL connection URL; ห้ามเผยแพร่ |
| `SESSION_SECRET` | login/session | ใช้ HMAC sign session; ขาดแล้วไม่สามารถออก signed session ได้ |
| `APP_ENCRYPTION_KEY` | บันทึก/ถอด encrypted secret | ใช้ AES-256-GCM helper; เปลี่ยน key อาจทำให้ข้อมูลเดิมถอดรหัสไม่ได้ |
| `AUTOMATION_CRON_SECRET` | เรียก automation cron | ไม่มี secret แล้ว endpoint ปฏิเสธ request |
| `ALLOWED_ORIGINS` | browser client เรียก API ข้าม origin | comma-separated exact origins; wildcard ถูกตัดทิ้ง |
| `EXTENSIONS_DIR` | เปลี่ยนตำแหน่ง extension storage | มี default/behavior ใน registry; ตรวจ code ก่อนเปลี่ยน |
| `EXTENSIONS_WRITE_ENABLED` | อนุญาต lifecycle ที่เขียน filesystem | ค่า default ปลอดภัยควรปิดจนกว่าจะต้องใช้ |
| `STORAGE_DRIVER` | เลือก media storage | รองรับ `local`, `s3`, `r2`; default `local` |
| `LOCAL_UPLOAD_URL_BASE` | เปลี่ยน URL prefix ของ local upload | default `/uploads` |
| `S3_ENDPOINT` | ใช้ S3/R2 | endpoint ของ object storage |
| `S3_ACCESS_KEY_ID` | ใช้ S3/R2 | secret credential — ห้ามเผยแพร่ |
| `S3_SECRET_ACCESS_KEY` | ใช้ S3/R2 | secret credential — ห้ามเผยแพร่ |
| `S3_BUCKET` | ใช้ S3/R2 | bucket name |
| `S3_REGION` | ใช้ S3/R2 | default ใน adapter เป็น `auto` |
| `S3_FORCE_PATH_STYLE` | endpoint ต้องใช้ path-style | ตั้ง `true` เฉพาะเมื่อ provider ต้องการ |
| `S3_PUBLIC_URL_BASE` | ใช้ CDN/custom public URL | public base URL ไม่ใช่ credential |
| `NODE_ENV`, `PORT` | runtime | กำหนดโดย platform/container ตาม environment |

## Managed PostgreSQL (เช่น Supabase)

`DATABASE_URL` รับ connection string ของ PostgreSQL มาตรฐาน จึงใช้กับ managed provider ได้ provider อย่าง Supabase ให้ connection string หลายแบบ (direct, session pooler, transaction pooler) ซึ่งต่างกันที่พอร์ต IPv4/IPv6 และการรองรับ prepared statements

- เลือก connection mode ให้ตรงกับที่แอปรัน แล้วดูตัวอย่างและข้อควรระวังใน [การปรับใช้ฐานข้อมูล](/guide/database-deployment)
- `DIRECT_URL` เป็นตัวแปรที่ **ยังไม่ถูกใช้ใน schema ปัจจุบัน** จะใช้ได้ต้องเพิ่ม `directUrl = env("DIRECT_URL")` ใน `prisma/schema.prisma` ก่อน
- ถ้าใช้ transaction pooler ต้องเติม `?pgbouncer=true` ใน `DATABASE_URL` เพื่อปิด prepared statements
- เพิ่ม `sslmode=require` ให้ connection string และห้ามนำ Supabase `anon`/`service_role` key มาใส่ในแอป THOTH

## Public Web variable

```bash
NEXT_PUBLIC_THOTH_API_URL="http://localhost:3000"
```

ตั้งเป็น origin/base URL ของ CMS API ใน environment ของ `apps/web` ไม่มี trailing slash ตามตัวอย่าง ตัวแปรนี้ไม่ใช่ secret

## Secret rotation

### `SESSION_SECRET`

session ที่เซ็นด้วย key เก่าจะตรวจสอบด้วย key ใหม่ไม่ได้ ผู้ใช้จึงต้อง login ใหม่ วางแผน rotation และแจ้งผู้ใช้ก่อน

### `APP_ENCRYPTION_KEY`

อย่าสุ่มเปลี่ยน key โดยไม่ถอด/เข้ารหัสข้อมูลที่เก็บไว้ด้วยขั้นตอน migration ที่ปลอดภัย มิฉะนั้น encrypted secrets เก่าอาจใช้ไม่ได้

### Cron secret

เมื่อเปลี่ยน `AUTOMATION_CRON_SECRET` ให้อัปเดต secret ฝั่ง scheduler/client ในช่วงเวลาเดียวกัน endpoint ใช้ header `x-automation-token` หรือ `Authorization: Bearer ...`

## ตรวจโดยไม่เปิดเผยค่า

ตรวจเพียงว่ามีการตั้งค่า ไม่พิมพ์ค่าจริง:

```bash
node -e 'for (const k of ["DATABASE_URL","SESSION_SECRET","APP_ENCRYPTION_KEY","AUTOMATION_CRON_SECRET","ALLOWED_ORIGINS"]) console.log(`${k}: ${process.env[k] ? "set" : "missing"}`)'
```

คำสั่งนี้ตรวจ process environment เท่านั้น ไม่ได้อ่าน `.env.local` อัตโนมัติใน Node ทุกกรณี และไม่ยืนยันว่า credential ใช้งานได้

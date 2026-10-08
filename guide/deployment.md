# การติดตั้งใช้งาน

หน้านี้เป็นแนวทางที่ต้องยืนยันกับ target platform จริง ไม่ได้ระบุว่า deployment ปัจจุบันได้รับการทดสอบกับทุกผู้ให้บริการ

## ส่วนประกอบที่ deploy

| Service | รับผิดชอบ |
| --- | --- |
| CMS | Admin UI, API, Prisma, storage และ secrets ฝั่ง server |
| PostgreSQL | ข้อมูล CMS |
| Public Web | public pages; ติดต่อ CMS ผ่าน API |
| Object storage (optional) | media เมื่อเลือก S3/R2 |

สอง Next.js apps มี build/runtime แยกกันได้ Public Web ต้องตั้ง `NEXT_PUBLIC_THOTH_API_URL`; CMS เป็นตัวเดียวที่ควรถือ `DATABASE_URL`

## CMS: ตรวจ manifest และ Dockerfile ก่อน

Root Dockerfile ใช้ Node 22 Alpine ใน build stages และ build Next standalone output แต่ runner command ปัจจุบันเรียก:

```text
npx prisma db push && npm run start
```

การเรียก `db push` ทุกครั้งเมื่อ container เริ่มมีผลกับ database schema จริง อย่านำไปใช้ production โดยไม่ review/backup/approval และกำหนด migration workflow ให้ชัด

Root `docker-compose.yml` มี PostgreSQL service และ CMS service แต่ compose config มี default credentials และเผยแพร่ port 5432 ออกสู่ host ตามไฟล์ที่ตรวจ ใช้เฉพาะ local/dev หลังพิจารณาความเสี่ยง; ห้ามยกค่าตัวอย่างไป production

## Public Web: standalone

`apps/web/next.config.ts` ตั้ง `output: "standalone"` และ package start script ใช้:

```bash
node .next/standalone/server.js
```

Build จาก directory `apps/web`:

```bash
npm ci
npm run build
npm run start
```

ตั้ง `NEXT_PUBLIC_THOTH_API_URL` ก่อน build/runtime ตามวิธีที่ Next bundler ของ deployment ใช้ตรวจ environment หลีกเลี่ยงการคาดหวังว่าตัวแปร client-side จะเปลี่ยนหลัง build หาก platform inline ค่าใน build

## Release checklist

- ตั้ง `DATABASE_URL`, `SESSION_SECRET`, `APP_ENCRYPTION_KEY` และ cron secret ใน secret manager ตามการใช้งาน
- ยืนยัน database backup ก่อน schema change
- เปิด HTTPS และตั้ง host/cookie policy
- ตั้ง `ALLOWED_ORIGINS` เป็น exact browser origins ที่จำเป็นเท่านั้น
- ตรวจ S3/R2 env names ให้ตรงกับ implementation (`S3_*`)
- ตรวจ storage persistence หากใช้ local uploads
- ทดสอบ auth, public Page draft filtering, Projects whitelist และ upload controls
- เตรียม rollback images/builds แยก CMS กับ Web
- ไม่ deploy production จน HTML sanitization และ rate-limit decisions ได้รับการจัดการหรือยอมรับความเสี่ยงอย่างเป็นทางการ

## Cutover สองแอป

1. Deploy CMS/API ก่อน
2. ตรวจ read endpoints และ security headers จาก network ที่ Public Web จะใช้งาน
3. Deploy Public Web กับ CMS API URL ที่ถูกต้อง
4. ทดสอบ routes และ data ที่ publish จริง
5. ตรวจ logs โดยไม่เปิด secrets/authorization headers
6. ค่อยเปลี่ยน domain/routing และถอด duplicate CMS public pages เมื่อมี rollback plan

## ข้อจำกัดด้านหลักฐาน

เอกสาร source เดิมมี deployment examples ที่อาจไม่ตรงกับ service names/config ของ Docker Compose ในปัจจุบัน จึงต้องเทียบกับ `Dockerfile`, `docker-compose.yml`, platform config และ environment จริงก่อนใช้คำสั่ง deploy

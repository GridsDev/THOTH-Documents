# การติดตั้งใช้งาน

Production ของ THOTH CMS ใช้ Vercel ตามสถานะ deployment ล่าสุดของโครงการ ส่วน Docker เป็นทางเลือกสำหรับผู้ที่ต้องการ self-host ไม่ใช่ runtime ที่ Vercel เรียกใช้

## ส่วนประกอบที่ deploy

| Service | รับผิดชอบ |
| --- | --- |
| CMS | Admin UI, API, Prisma, storage และ secrets ฝั่ง server |
| PostgreSQL | ข้อมูล CMS |
| Public Web | public pages; ติดต่อ CMS ผ่าน API |
| Object storage (optional) | media เมื่อเลือก S3/R2 |

การเตรียมฐานข้อมูล PostgreSQL รวมถึงการใช้งานร่วมกับ managed provider อย่าง Supabase (connection string, pooling, SSL, backup) มีรายละเอียดใน [การปรับใช้ฐานข้อมูล](/guide/database-deployment)

สอง Next.js apps มี build/runtime แยกกันได้ Public Web ต้องตั้ง `NEXT_PUBLIC_THOTH_API_URL`; CMS เป็นตัวเดียวที่ควรถือ `DATABASE_URL`

## CMS: Vercel และ Docker/self-host

### Vercel (production)

Vercel ใช้ `vercel.json` และ root Next.js app เป็น build/deployment configuration โดยไม่ได้เรียกคำสั่ง `CMD` ใน Dockerfile ดังนั้น `npx prisma migrate deploy` ที่ Dockerfile ระบุ **ไม่ทำงานบน Vercel**

Vercel build/deploy ไม่ได้ apply Prisma migrations ให้อัตโนมัติจาก `vercel.json` ปัจจุบัน ผู้ดูแลต้อง apply migrations กับฐานข้อมูลก่อนหรือเป็นส่วนหนึ่งของ release workflow ที่ควบคุมได้ ดู [การปรับใช้ฐานข้อมูล](/guide/database-deployment) สำหรับขั้นตอน baseline และคำสั่ง

### Docker / self-host

Root Dockerfile ใช้ Node 22 Alpine และ build Next standalone output; เมื่อ container เริ่ม คำสั่งใน runner จะทำงานดังนี้:

```text
npx prisma migrate deploy && npm run start
```

`prisma migrate deploy` ใช้ migrations ที่ยังไม่ถูก apply กับฐานข้อมูล ก่อนเริ่มเว็บ สำหรับฐานข้อมูลใหม่จะสร้าง schema จาก migration; ฐานข้อมูลเดิมที่สร้างด้วย `prisma db push` ต้องตรวจ schema เทียบกับ baseline และบันทึก baseline ว่า apply แล้วก่อนเปิดใช้ entrypoint นี้ ดู [การปรับใช้ฐานข้อมูล](/guide/database-deployment) ก่อนทำ

`docker-compose.yml` ประกาศ PostgreSQL service ชื่อ `db` และ CMS service ชื่อ `cms`; ต้องกำหนด `POSTGRES_PASSWORD` ก่อนรัน และ compose เผยแพร่พอร์ต PostgreSQL 5432 ออกสู่ host ตาม config จึงควรทบทวนการเปิดพอร์ตและ firewall ก่อนใช้งานบน host ที่เข้าถึงจากภายนอก

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

สถานะ Production บน Vercel และการตั้งค่า Docker อ้างอิง config ของโครงการที่ตรวจล่าสุด ทั้งนี้ ก่อนรันคำสั่งหรือเปลี่ยน schema ให้ตรวจ platform/environment เป้าหมายจริงทุกครั้ง และห้ามนำ credentials ตัวอย่างไปใช้

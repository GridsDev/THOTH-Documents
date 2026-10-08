# เริ่มใช้งานอย่างรวดเร็ว

คู่มือนี้อธิบายการตั้งค่า local development ของ CMS และ Public Web แยกกัน คำสั่งฐานข้อมูลเป็นการเปลี่ยน schema ให้ใช้ local/dev database ที่ตั้งใจใช้เท่านั้น

## เครื่องมือที่ต้องมี

- Node.js รุ่นที่รองรับ Next.js 16; Docker image ของ CMS ใช้ Node 22 Alpine
- npm
- PostgreSQL ที่เข้าถึงได้จากเครื่อง dev หรือ local PostgreSQL ผ่าน Docker
- สอง terminal หากต้องการรัน CMS และ Public Web พร้อมกัน

ตรวจเวอร์ชันเครื่องมือ:

```bash
node --version
npm --version
```

ตรวจเวอร์ชัน package ปัจจุบันใน root `package.json` ก่อนแก้ tooling เพราะเวอร์ชันในคู่มือนี้อาจเปลี่ยนได้

## 1. ตั้งค่า CMS

จาก directory root ของ THOTH:

```bash
npm ci
npx prisma generate
```

`npx prisma generate` สร้าง Prisma Client จาก `prisma/schema.prisma` หาก install environment ปิด postinstall scripts ให้รันคำสั่งนี้เองตาม project instructions

ตั้ง environment ของ CMS ในไฟล์ที่ git-ignored เช่น `.env.local` โดยใช้ `.env.example` ใน repository ต้นทางของ THOTH เป็นรายการอ้างอิง:

- `DATABASE_URL` — PostgreSQL URL
- `SESSION_SECRET` — secret สำหรับเซ็น session
- `APP_ENCRYPTION_KEY` — ใช้เมื่อบันทึก encrypted secrets
- `AUTOMATION_CRON_SECRET` — ใช้กับ external cron

ใช้ placeholder ในเอกสารเท่านั้น ห้ามใส่ค่าจริงใน source control, issue, logs หรือ chat

สั่ง apply schema กับ **ฐานข้อมูล development ที่ยืนยันแล้วเท่านั้น**:

```bash
npx prisma db push
```

คำสั่งนี้ sync schema ปัจจุบันโดยตรง ไม่ใช่ migration history ที่ version-control; ดู [Database](/guide/data-model) และ [Deployment](/guide/deployment)

เริ่ม CMS:

```bash
npm run dev
```

ค่าเริ่มต้นของ Next dev server มักเป็น `http://localhost:3000`; ยืนยัน URL ที่ terminal แสดงจริง

## 2. สร้างบัญชีเริ่มต้น

1. ตรวจ bootstrap status ที่หน้า `/setup` หรือ `GET /api/auth/setup`
2. เมื่อ database schema พร้อมและยังไม่มีผู้ใช้ ให้สร้างบัญชีแรกจาก setup flow
3. ระบบสร้างบัญชี `superadmin`, ตั้ง `mustChangePassword=true` และเซ็ต signed session cookie
4. เปลี่ยนรหัสผ่านตามขั้นตอนที่ระบบบังคับ
5. ถ้าติดตั้งเสร็จแล้ว setup endpoint จะปฏิเสธการสร้างบัญชีเพิ่ม

เก็บรหัสผ่านและ session ไว้เป็นความลับ ห้ามนำข้อมูลผู้ใช้จริงใส่ fixtures หรือ docs

## 3. ตั้งค่า Public Web

เปิด terminal อีกหน้าต่างและเข้า directory `apps/web`:

```bash
cd apps/web
npm ci
```

คัดลอกค่า **ตัวอย่าง** จาก `apps/web/.env.example` ไป `.env.local` ของแอป แล้วกำหนด:

```bash
NEXT_PUBLIC_THOTH_API_URL="http://localhost:3000"
```

URL ต้องชี้ไป origin ของ CMS API และไม่มี trailing slash ตามตัวอย่าง ใช้ `.env.local` ที่ถูก ignore โดย Git และอย่าตั้ง secrets ใน `NEXT_PUBLIC_*`

เริ่ม Public Web:

```bash
npm run dev
```

ตรวจหน้า `/`, `/projects`, `/products` และ Page slug ที่มีสถานะ published

## 4. คำสั่งตรวจสอบ

Root CMS:

```bash
npx tsc --noEmit
npm run lint
npm test
npm run build
```

Public Web:

```bash
cd apps/web
npx tsc --noEmit
npm run lint
npm run build
```

อย่ารัน `db push` กับ production โดยถือว่าเป็นเพียงการตรวจสอบ; เป็นการกระทำที่เปลี่ยน schema จริง

# แก้ปัญหาเบื้องต้น

## Prisma Client ยังไม่ถูก generate

อาการเช่น Prisma Client import errors หรือ build แจ้ง client generation:

```bash
npx prisma generate
```

ตรวจว่าอยู่ root ของ CMS และ schema ใช้ datasource/env ที่ถูกต้อง ห้ามแสดง `DATABASE_URL` เพื่อ debug

## Database connection ล้มเหลว

1. ยืนยันว่า PostgreSQL รันและรับ connection
2. ตรวจ hostname/port/database/schema ใน secret manager หรือ local env โดยไม่พิมพ์ค่าออก terminal
3. ตรวจ network/firewall และ database user privileges
4. ใช้ `/api/system/bootstrap` เพื่อตรวจสถานะตาม response ที่เปิดเผย
5. อย่ารัน `prisma db push` เพื่อแก้ connection issue เพราะมันไม่แก้ network และมีผลเปลี่ยน schema

## `/setup` แจ้ง schema ยังไม่พร้อม

ตรวจ `DATABASE_URL` และ schema state ก่อน หากเป็น local/dev ที่อนุมัติแล้วจึงพิจารณา:

```bash
npx prisma db push
npx prisma generate
```

คำสั่งนี้ไม่ใช่ migration plan สำหรับ production

## Login ไม่ออก session

- ตรวจว่า `SESSION_SECRET` ถูกตั้งใน runtime ของ CMS
- ถ้าหมุน secret แล้ว browser อาจมี cookie ที่เซ็นด้วย key เก่า ให้ login ใหม่
- ตรวจเวลาของ server เมื่อ token หมดอายุหรือถูกปฏิเสธ
- ตรวจ cookie attributes/HTTPS ใน production
- ห้ามคัดลอก session cookie มาใส่ issue หรือแชท

## Automation cron ตอบ 401

- ตรวจว่า `AUTOMATION_CRON_SECRET` ถูกตั้งใน CMS runtime
- ตรวจ header `x-automation-token` หรือ `Authorization: Bearer ...`
- เทียบ secret โดยไม่พิมพ์ค่าจริง
- endpoint ออกแบบให้ fail-closed เมื่อไม่มี secret

## Public Web แสดง API configuration error

- ตรวจ `NEXT_PUBLIC_THOTH_API_URL` ใน `apps/web` environment
- ตรวจว่าค่าเป็น CMS API origin ที่ browser/server มองเห็นได้ ไม่มี trailing slash
- สำหรับ client-side requests ตรวจ `ALLOWED_ORIGINS` ที่ CMS; สำหรับ server-side fetch ตรวจ DNS/network/TLS
- restart/rebuild ตามการ inline env ของ Next.js เมื่อเปลี่ยน `NEXT_PUBLIC_*`

## Public Web ต่อ CMS ไม่ได้

`ApiNetworkError` หมายถึง fetch ล้มเหลวก่อนรับ HTTP response ตรวจ service availability, DNS, port, TLS และ firewall จาก environment ของ Web runtime

## API ตอบ 401 / 404

- 401: protected operation ไม่มี valid signed session
- 404 Page: slug ไม่มี หรือ Page เป็น draft ที่ผู้เรียกไม่มีสิทธิ์อ่าน
- 404 Project: id ไม่มี
- `/products` ใน Public Web ควร redirect 307 ไป `/projects`

## Upload ล้มเหลว

ตรวจ auth, allowed MIME type, ขนาดสูงสุด 5 MiB และ `STORAGE_DRIVER` ถ้าใช้ S3/R2 ตรวจชื่อ `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET` และ network สิทธิ์ bucket โดยห้ามพิมพ์ credentials

## Build VitePress หา link ไม่พบ

```bash
npm run docs:build
```

ตรวจ case-sensitive file names และ link paths เช่น `/guide/overview` โดยไม่ใส่ `.md` เมื่อ `cleanUrls` เปิด

# ฐานข้อมูลและโมเดล

## Database provider

Prisma datasource ประกาศ `postgresql` และอ่าน URL จาก `DATABASE_URL`; authoritative schema อยู่ใน `prisma/schema.prisma`

ใน source ที่ตรวจไม่พบโฟลเดอร์ Prisma migrations แบบมาตรฐาน ขณะที่คู่มือเก่าบางส่วนอธิบายการใช้ `prisma db push` จึงต้องตรวจ deployment flow ปัจจุบันก่อน deploy schema change

## Models

| Model | หน้าที่ |
| --- | --- |
| `Project` | ข้อมูลผลงานที่ public by design |
| `Category` | หมวดหมู่ Projects; `name` unique |
| `SiteConfig` | configuration ของ public site |
| `MenuItem` | navigation item และตำแหน่งที่แสดง |
| `Page` | เนื้อหา slug-based พร้อม `isPublished` |
| `StaffMember` | โปรไฟล์ทีมงานและ attributes |
| `StaffRepo` | links/repositories ที่สัมพันธ์กับ StaffMember |
| `User` | username, password hash, role และบังคับเปลี่ยนรหัสผ่าน |
| `Media` | metadata ของ media asset และ storage location |
| `SecretStore` | encrypted provider secrets |
| `AiAutoPostCampaign` | automation campaign configuration |
| `AiAutoPostRun` | execution records ของ campaign |

มี 12 models ใน schema ปัจจุบัน นับรวม `StaffRepo` และ AI automation models

## Relations ที่ประกาศ

- `Project.categoryId → Category.id`
- `StaffRepo.staffMemberId → StaffMember.id`, cascade delete
- `AiAutoPostRun.campaignId → AiAutoPostCampaign.id`, cascade delete

## Project: public by design

มติผู้ดูแล 2026-10-09: ไม่มี publish/status flag ใน `Project` โดยเจตนา เพราะทุก Project ถือเป็น public การอ่านผ่าน `GET /api/projects` จึงคืนทุก Project แต่จำกัด fields ด้วย `PUBLIC_PROJECT_SELECT` ใน `lib/project-data.ts`

การเปลี่ยน public field set ต้องทำอย่างตั้งใจและอัปเดต policy/test ไม่ใช่เพิ่ม fields ทั้ง model เข้า response โดยอัตโนมัติ

## Page: ต้องเคารพ `isPublished`

`Page.isPublished` default เป็น false:

- public list ต้องกรอง `isPublished=true` สำหรับผู้ไม่ล็อกอิน
- public by-slug/ID ต้องตอบ 404 เมื่อเป็น draft สำหรับผู้ไม่ล็อกอิน
- authenticated CMS users อาจอ่าน draft ผ่าน API ตาม behavior ปัจจุบัน

อย่าใช้ Project policy มาอนุมานกับ Page

## Migration / schema workflow

เมื่อแก้ schema:

1. ตรวจผลกระทบกับ relations, data migration และ API types
2. รัน Prisma Client generation หลัง schema change
3. ใช้ database development ที่ยืนยันแล้ว
4. ประเมิน `PRODUCT_CMS_SETUP.sql` หากเอกสารติดตั้งหรือผู้ใช้ยังอาศัยไฟล์นี้
5. ทดสอบ API และสองแอปหลังเปลี่ยน DTO/schema

`prisma db push` เขียน schema ไปยัง database โดยตรง ห้ามใช้กับ production โดยไม่มีกระบวนการ backup/review/approval

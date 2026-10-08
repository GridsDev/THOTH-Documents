# คำศัพท์

| คำ | ความหมายในโครงการ |
| --- | --- |
| CMS | ระบบจัดการเนื้อหา; ใน THOTH รวม Admin UI, API และ database access |
| Headless CMS | CMS ที่ให้ consumer ดึงเนื้อหาผ่าน API; THOTH มีแนวทางนี้แม้จะมี UI ของตัวเอง |
| Hybrid CMS | คำอธิบายที่ใช้กับ THOTH ซึ่งมี CMS/API และ public presentation routes ในช่วงเปลี่ยนผ่าน |
| Public Web | Next.js app ที่อยู่ `apps/web/` และเรียก CMS ผ่าน HTTP API |
| Admin UI | หน้าจัดการ content/config ที่อยู่ฝั่ง CMS |
| Route Handler | Next.js API handler ใน `app/api/**/route.ts` |
| Service layer | Domain/data functions ภายใต้ `lib/` |
| Public projection | ชุด fields ที่ API อนุญาตให้ส่งออก เช่น `PUBLIC_PROJECT_SELECT` |
| Project | Portfolio/work item; public by design ตาม policy |
| Page | เนื้อหา slug-based ที่มี `isPublished`; draft ต้องไม่ปรากฏต่อ anonymous read |
| Module | Code feature ที่ wired กับ CMS source เช่น staff-member |
| Extension | Package ตาม manifest/lifecycle ใน `extensions/` |
| CORS | Browser policy สำหรับ cross-origin requests; ไม่ใช่ authentication |
| Session token | HMAC-signed cookie token ที่อ้าง user และ expiry |
| Cutover | เปลี่ยน serving traffic จาก public routes เดิมใน CMS ไป Public Web |
| Prisma `db push` | ซิงก์ schema ไป database โดยตรง; ไม่เท่ากับ reviewed migration sequence |

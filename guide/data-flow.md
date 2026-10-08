# เส้นทางข้อมูล

หน้านี้ช่วยตามการเรียกข้อมูลจาก UI ผ่าน HTTP/service ไปยัง PostgreSQL และย้อนกลับ

## อ่าน Project จาก Public Web

1. `apps/web/app/(site)/projects/page.tsx` เรียก `api.projects.list()`
2. `apps/web/lib/api-client.ts` สร้าง URL จาก `NEXT_PUBLIC_THOTH_API_URL`
3. CMS รับ `GET /api/projects`
4. handler เรียก `getAllProjectsPublic()` ใน `lib/project-data.ts`
5. Prisma ใช้ `PUBLIC_PROJECT_SELECT` เพื่อเลือก fields ที่อนุมัติ
6. JSON response ถูก render โดย Projects page

ทุก Project เป็น public ตามมติผู้ดูแล ขอบเขต whitelist ยังคงใช้เพื่อไม่เปิดเผย fields เพิ่มโดยไม่ตั้งใจ

## อ่าน Page ตาม slug

1. Public Web เรียก `GET /api/pages/{slug}` ผ่าน `api.pages.bySlug(slug)`
2. CMS หา record ด้วย ID หรือ slug
3. ถ้าผู้เรียกไม่มี valid session และ Page ยังไม่เผยแพร่ API ตอบ 404
4. Public Web ตรวจ `isPublished` ซ้ำ และแสดง not found ถ้า false
5. เมื่อ API ตอบ 404 หน้าเรียก `notFound()`; network/API errors อื่นแสดง `ApiErrorState`

การ render `page.content` เป็น HTML ยังไม่มี sanitization ณ วันที่ตรวจ ดู [Security](/guide/security)

## อ่าน Menu และ Site Config

- Public Web ดึง `/api/menu-items` และ `/api/site-config`
- ผู้ไม่ล็อกอินได้เฉพาะ menu ที่ `isVisible=true`
- Site Config endpoint คืน configuration object ตาม route ปัจจุบัน
- ห้ามเพิ่ม secrets ลง Site Config หรือ public DTO

## เขียนข้อมูลจาก Admin

1. UI ส่ง HTTP request ไป `/api/...`
2. route ที่เขียนข้อมูลเรียก `guardApiSession()` ก่อน mutation
3. guard ตรวจ signed session และผู้ใช้ที่สอดคล้องกับ session token
4. handler ตรวจ/แปลง payload ตามที่ implementation ระบุ
5. service/Prisma บันทึกลง PostgreSQL

`guardApiSession()` เป็น session authentication guard; อ่าน implementation ก่อนสมมติว่าเป็น role-based authorization เพราะฟังก์ชันนี้ตรวจว่ามี user ที่ authenticated แต่ไม่ได้แยกสิทธิ์ตาม role

## ขอบเขต JSON

วันที่จาก Prisma จะถูก serialize เป็น ISO string ใน JSON ตัวอย่าง `createdAt` และ `date` จึงถูกประกาศเป็น string ใน public app types ห้ามแชร์ Prisma model type ตรง ๆ กับ browser โดยไม่ตั้งใจ

## การตามปัญหา

- API base URL ผิด → ตรวจ `.env.local` ของ `apps/web` โดยไม่แสดง secret
- HTTP 404 → ตรวจ endpoint/slug และ publication state ของ Page
- HTTP 401 → ตรวจ session ใน CMS และ login state
- API 500 → ตรวจ server logs และ database connectivity โดยห้ามพิมพ์ connection string
- Project ไม่ขึ้น → ตรวจ CMS API response และ category relation; ขณะฐานข้อมูลว่าง empty state เป็นผลที่คาดได้

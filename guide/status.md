# สถานะและข้อจำกัด

**ฐานข้อมูลข้อเท็จจริงในหน้านี้ตรวจจาก source ณ วันที่ 9 ตุลาคม 2026** เอกสารนี้ไม่ใช่ประกาศ release ใหม่

## ทำแล้วตามรายงานและ source ที่ตรวจ

- CMS มี session token แบบ signed และ guard สำหรับ write/admin API; tests ตรวจ route policy
- มี Node built-in tests; ชุดที่รันจาก workspace ระหว่างทำเอกสารผ่าน 30/30
- `apps/web/` มี package, routes และ API client แยกจาก CMS
- Projects public by design และ response ใช้ `PUBLIC_PROJECT_SELECT`
- Pages รองรับ `isPublished` และ public GET ปฏิเสธ draft

## ยังเปิดอยู่/ต้องระวัง

1. **HTML sanitization:** ทั้ง CMS และ Web render `Page.content` ด้วย `dangerouslySetInnerHTML` โดยไม่มี sanitizer ที่ตรวจพบ
2. **Upload rate limit:** upload route มี session guard และจำกัดไฟล์ตาม type/size แต่ไม่มี rate limiter
3. **Public data review:** `GET /api/staff` เปิด read และ response implementation คืน staff records; ตรวจว่าข้อมูลติดต่อที่เก็บอยู่เหมาะจะเผยแพร่หรือไม่
4. **Project ทั้งหมด public:** เป็น policy ตั้งใจ ไม่ใช่ข้อบกพร่อง แต่ผู้ดูแลต้องไม่เก็บข้อมูลที่ไม่ควรเผยแพร่ใน Project fields
5. **Production cutover:** CMS ยังมี public routes ซ้ำกับ `apps/web`; ขั้น D ยังไม่ทำ
6. **Products:** ไม่มี Product model/API; `/products` ใน Public Web redirect ไป `/projects`
7. **Dashboard:** ไม่ย้ายไป Public Web ตามมติ เพราะไม่มี public stats API ที่กำหนดไว้
8. **API versioning/pagination:** ไม่พบสัญญา versioned API หรือ pagination ทั่วไปจาก routes ที่ตรวจ
9. **Database deployment:** Docker entrypoint รัน `prisma db push`; schema อ่านแค่ `DATABASE_URL` (ไม่มี `directUrl`/`prisma.config.ts`) และไม่มี migrations — ต้องประเมินก่อน production และดู [การปรับใช้ฐานข้อมูล](/guide/database-deployment) สำหรับ Supabase/pooling
10. **Lint baseline:** เอกสาร project context บันทึก 30 errors / 22 warnings สำหรับ root; ตรวจผลใหม่ก่อน release

## แยก “เสร็จ” จาก “แผน”

| รายการ | สถานะตามข้อมูลที่มี |
| --- | --- |
| ขั้น 0/A/B/C ของแผนแยก Public Web | รายงานโครงการระบุว่าเสร็จ; ขั้น C เพิ่ม routes/API |
| ขั้น D: test deployment/cutover และถอด duplicate pages | ยังไม่เริ่ม |
| ขั้น E: แยก repository | ยังไม่เริ่ม |
| OpenAPI `/api/v1` | งานต่อยอด ไม่ใช่สิ่งที่ยืนยันว่ามีแล้ว |
| Extension hot-load arbitrary routes | ไม่ยืนยันว่ารองรับ |

## ผลการตรวจที่เกี่ยวกับเอกสารนี้

- `npm test` ของ CMS รันระหว่างจัดทำคู่มือ: 30 ผ่าน, 0 ล้ม
- ยังไม่ได้รัน root `tsc`, root lint, root build หรือ `apps/web` build ใน session นี้
- เอกสาร VitePress ยังต้องรัน build หลังติดตั้ง dependencies
- THOTH source directory ไม่มี Git metadata ตาม project context; ห้ามอ้าง diff/history จาก Git

## เมื่อใดต้องอัปเดตหน้านี้

อัปเดตหลังเปลี่ยน security controls, API policy, Project visibility, sanitizer, upload controls, routes, cutover หรือ database deployment method พร้อมระบุวันที่/หลักฐานใน source/tests

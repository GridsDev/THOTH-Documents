# ภาพรวมโครงการ

## THOTH คืออะไร

THOTH คือระบบจัดการเนื้อหา (CMS) ที่พัฒนาด้วย Next.js App Router, TypeScript และ Prisma โดยรวม CMS Admin, REST API และ database access ไว้ในแอปหลัก ส่วน Public Web อยู่ในแอป Next.js แยกที่ `apps/web/` และอ่านข้อมูลจาก API

คำว่า **Hybrid CMS** อธิบายรูปแบบการพัฒนาของโครงการได้: มีส่วนบริหารจัดการและ API เป็นแกน ขณะเดียวกันยังมีหน้า public อยู่ทั้งใน CMS เดิมและใน Public Web แยก การถอด public pages เดิมออกจาก CMS เป็นงาน cutover ขั้น D ที่ยังไม่เริ่มตามแผน

## โครงการและรูปแบบรายได้

ตามมติผู้ดูแล THOTH ตั้งใจเป็น open source โดยมีแผนสร้างรายได้จากการขายโมดูลและหน้าเว็บ นโยบายข้อมูลจึงกำหนดให้ **ทุก Project เป็น public by design** ไม่มีสถานะ draft/published ในโมเดล `Project` ทั้งนี้ API ยังใช้ explicit field whitelist เพื่อควบคุมขอบเขตข้อมูลที่เผยแพร่

นโยบายนี้ต่างจาก `Page`: Page มี `isPublished` และ API สำหรับผู้ไม่ล็อกอินต้องไม่เปิดเผย draft

## ความสามารถที่พบใน source

- **Pages:** หน้าเนื้อหาตาม slug, excerpt/source metadata และสถานะเผยแพร่
- **Projects:** รายการผลงานและข้อมูลประกอบ เช่น category, gallery, tools และ links
- **Categories:** การจัดหมวดหมู่ Projects
- **Staff:** โปรไฟล์ทีมงาน ทักษะ links และ repos ผ่าน module staff-member
- **Media:** metadata ของไฟล์และ storage adapter แบบ local หรือ S3-compatible/R2
- **Menu และ Site Config:** การตั้งค่า navigation, theme และข้อมูลไซต์
- **Automation:** campaign สำหรับสร้างเนื้อหาด้วย Google AI integration และการเรียก runner
- **Extensions:** manifest/registry lifecycle สำหรับการขยายระบบ โดยยังไม่ใช่ hot-load framework ทั่วไป

## Technology stack จาก manifests

| ส่วน | เทคโนโลยีที่ประกาศ |
| --- | --- |
| CMS | Next.js 16.2.0, React 19.2.4, TypeScript |
| Public Web | Next.js 16.2.0, React 19.2.4, TypeScript |
| Style | Tailwind CSS 4 |
| Database access | Prisma 6.x |
| Database provider | PostgreSQL |
| Test runner ของ CMS | Node.js built-in test runner |
| เอกสารโครงการนี้ | VitePress 1.6.4 |

เวอร์ชันเหล่านี้อ่านจาก package manifests ณ วันที่จัดทำเอกสาร ควรตรวจ `package.json`/lockfile ก่อนอัปเกรดหรืออ้างเป็นเวอร์ชันปัจจุบันในอนาคต

## สิ่งที่ไม่ควรเข้าใจผิด

- `Projects` ไม่ใช่ `Products`; ไม่มี Product model หรือ `/api/products` ใน CMS schema/API ที่ตรวจ
- `apps/web/` และ CMS ยังมี public routes ที่ซ้ำกันในช่วงก่อน cutover โดยตั้งใจ
- มี `extensions/` และ scaffold tool แต่ไม่พบ extension package จริงที่ติดตั้งอยู่ใน source ณ วันที่ตรวจ
- การมี route/API ไม่ได้แปลว่ามี pagination, versioning, OpenAPI contract หรือ production SLA

## แผนภาพองค์ประกอบ

```text
ผู้ดูแล
  │ browser + signed session cookie
  ▼
CMS app (repository root)
  ├── Admin UI
  ├── Route Handlers: /api/*
  ├── lib/* services + auth + storage + automation
  └── Prisma ───────────────► PostgreSQL

ผู้เข้าชม
  │
  ▼
apps/web (Next.js แยก build/deploy)
  │ server-side HTTP requests, NEXT_PUBLIC_THOTH_API_URL
  ▼
CMS public read API
```

ชื่อ environment ที่เริ่มด้วย `NEXT_PUBLIC_` ถูก Next.js ส่งเข้าฝั่ง client ได้ตามธรรมชาติของ framework ห้ามใส่ credential หรือ secret ในตัวแปรกลุ่มนี้

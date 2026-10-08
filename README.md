# THOTH V2 — เอกสารโครงการและคู่มือนักพัฒนา

เว็บไซต์เอกสารภาษาไทยสำหรับ THOTH CMS จัดทำด้วย VitePress แยกจาก source code ของ CMS

## เริ่มต้นใช้งาน

ต้องมี Node.js และ npm ที่รองรับ VitePress 1.6.4 และ Vite 6

```bash
npm ci
npm run docs:dev
```

เปิด URL ที่ VitePress แสดงใน terminal เพื่ออ่านและแก้ไขเอกสาร

## คำสั่ง

```bash
npm run docs:dev      # เปิด development server
npm run docs:build    # สร้าง static site ไปที่ .vitepress/dist
npm run docs:preview  # ดู static site ที่ build แล้ว
```

## โครงสร้าง

```text
.
├── .vitepress/
│   └── config.mts
├── guide/
├── reference/
├── index.md
├── package.json
└── README.md
```

## ขอบเขตและความถูกต้อง

เอกสารอธิบายพฤติกรรมที่ตรวจจาก source ของ THOTH และอ้าง path ของไฟล์ในโครงการต้นทาง การมีคู่มือหน้านี้ไม่ได้หมายความว่าฟีเจอร์ทุกส่วนพร้อม production แล้ว โดยเฉพาะ public API, HTML content, upload rate limit และสถานะการ cutover public site ดูหน้า [สถานะและข้อจำกัด](./guide/status.md)

อย่าใส่ค่า secret, connection string จริง, ข้อมูลผู้ใช้ หรือข้อมูล production ลงในเอกสาร ตัวอย่าง configuration ต้องเป็น placeholder เท่านั้น

## Dependency security

VitePress 1.6.4 เป็นรุ่น stable ล่าสุดที่ตรวจจาก npm registry ณ วันที่อัปเดต ส่วน VitePress 2 ยังเป็น prerelease จึงยังไม่เลือกใช้ โครงการ override Vite เป็น `^6.4.4` เพื่อรับรุ่นที่แก้ advisories ของ Vite และให้ใช้ esbuild รุ่นใหม่ที่ไม่อยู่ในช่วงได้รับผลกระทบ

ตรวจสถานะ dependency ก่อน build หรือ deploy ด้วย:

```bash
npm audit
npm ls vite esbuild vitepress
```

หากอัปเดต VitePress ในอนาคต ให้ทบทวน `overrides` ว่ายังจำเป็นและเข้ากันได้กับ dependency tree ใหม่หรือไม่ รัน documentation dev server เฉพาะเครื่องหรือเครือข่ายที่เชื่อถือได้ และอย่าเปิดให้เข้าถึงจากอินเทอร์เน็ตสาธารณะโดยไม่จำเป็น

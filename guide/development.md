# Workflow นักพัฒนา

## แผนที่ source ที่ควรรู้

| Path ใน THOTH | หน้าที่ |
| --- | --- |
| `app/` | Next.js routes, pages, layouts และ API |
| `app/api/` | REST route handlers |
| `app/admin/` | CMS Admin UI |
| `lib/` | auth, Prisma, services, storage, automation, extensions และ security |
| `modules/staff-member/` | implementation ของ Staff module ที่ wired เข้าระบบ |
| `extensions/` | extension packages/manifests |
| `prisma/schema.prisma` | database models และ relations |
| `tests/` | Node built-in test files ของ CMS |
| `apps/web/` | public web app แยก |

## ทำงานกับ CMS

1. ตรวจ `pwd` ให้เป็น repository root ของ THOTH
2. อ่าน project `AGENTS.md` และ docs ที่เกี่ยวข้องก่อนแก้
3. หา prior art ใน route/service ที่ใกล้เคียงก่อนเพิ่ม abstraction ใหม่
4. หากเพิ่ม API write route ให้ใช้ `guardApiSession()` ตาม policy และเพิ่ม/ปรับ tests
5. หากเพิ่ม public read ให้ระบุ field whitelist และ exposure policy ให้ชัด
6. ห้ามเพิ่ม `any`; ใช้ types/guards จาก request boundary
7. เปลี่ยน Prisma schema ต้อง generate client และพิจารณา update SQL setup artifact ที่ยังอ้างอิง

## ทำงานกับ Public Web

ทำงานจาก `apps/web/`:

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run build
```

ข้อกำหนด:

- เรียก CMS ผ่าน `apps/web/lib/api-client.ts`
- เพิ่ม/เปลี่ยน type ใน `apps/web/lib/types.ts` ให้ตรง public JSON response
- ห้าม import `@/lib/*` ของ CMS และห้ามใช้ Prisma ในแอปนี้
- จัดการ `ApiConfigError`, `ApiNetworkError`, `ApiHttpError` อย่างชัดเจน ไม่กลบ failure เป็นข้อมูลว่าง
- สร้าง URL จาก `NEXT_PUBLIC_THOTH_API_URL` เท่านั้น; ห้าม hard-code production origin

## เปลี่ยน API อย่างปลอดภัย

ก่อนเปลี่ยน response:

1. ตรวจ consumer ใน CMS Admin และ `apps/web`
2. ระบุ fields ที่เป็น public และข้อมูลที่ต้องไม่เผยแพร่
3. อัปเดต route-policy test ถ้าเปลี่ยน security/public projection
4. อัปเดต types/API docs ให้ตรง
5. รันทดสอบ/ตรวจ type/build ของทั้งสองแอปที่ได้รับผล

ไม่ควรเปลี่ยน API shape แบบเงียบ ๆ เพราะ `apps/web` deploy แยกจาก CMS ได้ และอาจอัปเดตคนละเวลา

## สไตล์และคุณภาพ

- ใช้ patterns และ naming ที่พบในโฟลเดอร์นั้น
- ใช้ `@/` alias ภายใน CMS ตาม tsconfig
- จำกัด catch ให้อยู่ขอบเขตที่จัดการ error ได้จริง; ส่ง error state ที่ช่วยวินิจฉัย
- ใช้ status code สอดคล้องผล: 400 input, 401 unauthenticated, 404 not found/not disclosed, 500 internal failure ตาม route contract
- หลีกเลี่ยง logs ที่มี token, password, API key, cookies หรือ database URL

## ทำงานในโครงการเอกสาร

แอปเอกสารเป็นโครงการ VitePress แยกใน THOTH-Documents:

```bash
npm run docs:dev
npm run docs:build
npm run docs:preview
```

ยืนยัน internal Markdown links ด้วย build และแก้เอกสารที่อ้าง source path ให้ชี้ตำแหน่งจริง

`npm audit` ที่รันขณะจัดทำรายงาน advisories ใน Vite/esbuild dependencies ของ VitePress โดยไม่มี fix ระบุใน registry ขณะนั้น ให้รัน docs dev server บน localhost/เครือข่ายที่เชื่อถือได้เท่านั้น และตรวจ audit ก่อนเผยแพร่หรืออัปเกรด dependency

## การเปลี่ยนแปลงหลายส่วน

เมื่อแก้ schema, security boundary, deployment หรือ API contract ให้ระบุขอบเขตก่อนเริ่ม ทดสอบทุก surface ที่ได้รับผล และรายงานสิ่งที่ยังไม่ยืนยัน ห้าม commit/push หรือแก้ remote โดยไม่มีคำสั่งชัดเจน

# โมดูลและ Extensions

THOTH มีแนวทางขยายสองส่วนที่ต้องแยกความหมาย:

1. `modules/` — module code ที่เชื่อมกับ application source โดยตรง เช่น `modules/staff-member/`
2. `extensions/` — package แยกที่มี manifest และ lifecycle ของ registry

ปัจจุบัน Staff Member เป็น module ที่ wired อยู่จริง ส่วน scaffold/extensions ไม่ควรถูกเข้าใจว่าเป็น plugin runtime ที่ hot-load arbitrary Next.js code ได้

## Extension layout

```text
extensions/<extension-id>/
├── extension.json
├── README.md
├── admin/
├── api/
└── hooks/
```

`extension.json` เป็นไฟล์บังคับ โฟลเดอร์ admin/api/hooks เป็น entry points ตาม scaffold/pattern และต้องสอดคล้องกับ registry/validation implementation ก่อนประกาศว่าถูก execute โดย runtime

## Manifest

```json
{
  "id": "example-extension",
  "name": "Example Extension",
  "version": "0.1.0",
  "apiVersion": "1",
  "description": "ตัวอย่าง extension",
  "author": "Your Team",
  "capabilities": ["admin-page", "api"],
  "entrypoints": {
    "adminPage": "./admin/page.tsx",
    "api": "./api/route.ts"
  }
}
```

กติกา:

- `id` เป็น lowercase kebab-case ที่ไม่ซ้ำ
- version และ `apiVersion` ต้องระบุ
- capability/entrypoint ต้องตรงกับไฟล์จริงและ schema
- ระบุ environment variables ที่ต้องใช้ใน README ของ extension โดยห้ามเขียน secret จริง

ตรวจ schema ที่ `extensions/extension.schema.json` และมาตรฐานละเอียดใน `docs/MODULE_STANDARD.md` ของ source project

## Scaffold

จาก root ของ CMS:

```bash
npm run scaffold:module -- --id example-extension --name "Example Extension"
```

script รองรับ `--author` เพิ่มเติม ค่า id จะถูก sanitize และคำสั่งหยุดหาก target directory มีอยู่แล้ว ตรวจไฟล์ทุกไฟล์ที่ generate ก่อนใช้

Scaffold สร้าง:

- `extension.json`
- `README.md`
- `admin/page.tsx`
- `api/route.ts`
- `hooks/README.md`

การสร้าง scaffold ไม่ได้ register routes เข้ากับ Next.js อัตโนมัติ

## API และข้อมูล

- Namespace extension API เช่น `/api/extensions/<extension-id>/...`
- ใช้ JSON และ response ที่เสถียร
- Write route ต้อง authenticate ผ่าน `guardApiSession()` และ validate input ที่ boundary
- public reads ต้องเลือก fields ด้วย explicit whitelist และเพิ่ม policy tests
- แยก provider-specific logic ไว้หลัง adapters
- ใช้ storage adapter สำหรับ media; อย่าเขียน arbitrary paths
- ห้ามเก็บ provider credentials เป็น plaintext

## เพิ่ม data model

1. ตรวจว่าฟิลด์นั้นเป็น generic platform concern หรือ extension-specific
2. ปรับ `prisma/schema.prisma` ตามกระบวนการ review
3. รัน `npx prisma generate`
4. ประเมิน SQL setup artifact ที่ผู้ติดตั้งใช้อยู่
5. เพิ่ม API validation, permissions, DTO whitelist และ tests
6. ระบุผล migration/rollback ก่อนใช้งาน production

## Admin UI

- วาง UI ตามแนวทาง module ที่ระบบใช้อยู่
- ใช้ Admin shell และรูปแบบ UI เดิม
- แสดงสถานะ lifecycle, validation errors และ configuration requirements
- ไม่แสดง secret ที่อ่านกลับมาได้หลังบันทึก

## Enable/disable/uninstall

เอกสาร Extensions ระบุ lifecycle actions เช่น enable, disable, validate, uninstall แต่พฤติกรรมที่ใช้ได้จริงขึ้นกับ registry/route implementation ปัจจุบัน ให้ตรวจ `lib/extensions/registry.ts`, validator และ API routes ก่อนออกแบบขั้นตอนติดตั้ง

production-safe default ตาม docs ต้นทางคือ manual filesystem install และปิด `EXTENSIONS_WRITE_ENABLED` จนกว่าจะมีเหตุผลที่ผ่าน security review

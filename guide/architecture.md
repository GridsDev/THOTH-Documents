# สถาปัตยกรรม

## สองแอปใน monorepo

```text
THOTH/
├── app/                 # CMS Next.js: Admin, API, login/setup และ legacy public routes
├── lib/                 # Prisma, services, auth, storage, automation, security
├── modules/             # โมดูลที่ wired กับแอป เช่น staff-member
├── extensions/          # packages ตาม manifest และ lifecycle ของ extension
├── prisma/schema.prisma # database schema ของ CMS
└── apps/web/            # public Next.js app ที่ build/deploy แยก
```

### CMS ที่ root

CMS เป็นเจ้าของฐานข้อมูล, Prisma Client และ credentials ฝั่ง server มีทั้ง Admin UI และ API routes:

- `app/admin/` — หน้าจัดการ
- `app/api/` — HTTP handlers
- `lib/` — service/data access และ infrastructure
- `prisma/` — schema และ Prisma tooling

Admin UI ต้องเข้าถึงข้อมูลผ่าน service หรือ API ตามรูปแบบของ component นั้น หลีกเลี่ยงการฝัง query กระจัดกระจายใน presentation code

### Public Web ใน `apps/web/`

แอปนี้มี package/config/build output แยก ไม่ควร import source ของ CMS, Prisma Client หรือเข้าถึง `DATABASE_URL` ใช้ `lib/api-client.ts` ภายในแอปเพื่อเรียก CMS API

หน้า public ที่ตรวจพบ:

- `/` — landing
- `/projects` — รายการ Projects
- `/products` — redirect ไป `/projects`
- `/{slug}` — แสดง Page ที่เผยแพร่แล้ว

CMS ยังเก็บ public routes เดิมไว้ระหว่างช่วงย้าย การถอดหน้าเดิมต้องทำหลังการตรวจ behavior/cutover ในขั้น D

## หน้าที่ของแต่ละชั้น

### `app/api/`: HTTP boundary

Route handler แปลง HTTP request/response และเลือก policy ของ endpoint เช่น session guard, public read filtering หรือ cron-token verification

### `lib/`: services และ infrastructure

ตัวอย่าง:

- `lib/prisma.ts` — Prisma client singleton
- `lib/project-data.ts` — Project queries, including public field projection
- `lib/page-data.ts` — Page queries
- `lib/auth.ts`, `lib/security/session.ts` — session flow/signing
- `lib/storage/` — local และ S3-compatible adapters
- `lib/automation/` — campaigns และ AI integration

### `modules/` กับ `extensions/`

`modules/staff-member/` เป็น code ที่ wired กับแอป ณ ปัจจุบัน ขณะที่ `extensions/` เป็นพื้นที่ packages ตาม manifest/lifecycle; การมี scaffold ไม่ได้แปลว่าระบบโหลด arbitrary Next.js routes/components แบบ dynamic ได้

## เส้นทางข้อมูล

| ผู้เรียก | วิธีเข้าถึงข้อมูล |
| --- | --- |
| Client component ใน CMS | HTTP `fetch` ไปยัง `/api/...` |
| Server component ใน CMS | service จาก `lib/` หรือ API ตามกรณี |
| Public Web Server Component | HTTP ผ่าน `apps/web/lib/api-client.ts` ไป CMS |
| API route | service/data-access ใน `lib/`; บาง route ใช้ Prisma โดยตรง |

Public Web ทำ server-side fetch อยู่ จึงไม่ต้องพึ่ง browser CORS สำหรับ request ระหว่าง server กับ server แต่ CORS ยังเกี่ยวเมื่อ browser หรือ client ภายนอกเรียก CMS โดยตรง

## คำแนะนำด้าน boundary

1. รักษา API เป็น public contract สำหรับ consumer ภายนอก
2. ใส่ session guard ที่ server handler สำหรับ write/admin operations
3. แยก public projection ออกจาก object/model ภายใน
4. อย่า import `lib/` หรือ Prisma ข้ามจาก `apps/web/` ไป CMS
5. เปลี่ยน API response ต้องตรวจ Admin UI, Public Web และ tests ที่ใช้ contract นั้น
6. ระบุพฤติกรรม CORS, cache และ error response ให้ตรงกับการเรียกใช้งานจริง

## สถานะการแยก

แผนกำหนดให้ Public Web deploy แยกได้ภายใน repository เดียวก่อน ส่วน public routes เดิมใน CMS ยังอยู่จนกว่าจะ cutover หลังจากนั้นจึงค่อยพิจารณาแยก repository ไม่ควรตีความว่า duplicate routes คือความผิดพลาดของขั้น C

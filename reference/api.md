# REST API Reference

## ข้อมูลทั่วไป

- Base path ปัจจุบัน: `/api`
- ใช้ JSON สำหรับ request/response ส่วน upload ใช้ `multipart/form-data`
- API ยังไม่ประกาศ version prefix เช่น `/api/v1`
- ไม่มี pagination contract กลางที่ยืนยันได้จาก route handlers
- รูปแบบ error response แตกต่างตาม route; อ่าน implementation ก่อนเขียน client ที่ต้องพึ่ง schema แน่นอน
- API ใช้ session cookie สำหรับ protected operations; cron endpoint ใช้ shared secret

## Page API

### `GET /api/pages`

คืน Pages เรียงตาม `createdAt` ใหม่ไปเก่า:

- anonymous caller: เฉพาะ `isPublished=true`
- caller ที่มี valid session: query ปัจจุบันสามารถคืน draft ด้วย

### `POST /api/pages`

ต้องมี session ใช้สร้าง Page จาก `title`, `slug`, `content`, `isPublished` ตาม route ปัจจุบัน หากไม่ส่ง `isPublished` handler ตั้ง default เป็น `true`; client ควรส่งค่าที่ตั้งใจชัดเจน

### `GET /api/pages/{id-or-slug}`

ค้นได้ด้วย id หรือ slug:

- draft ที่ร้องขอแบบ anonymous ตอบ 404
- authenticated request สามารถอ่าน draft

### `PATCH /api/pages/{id}`, `DELETE /api/pages/{id}`

ต้องมี session; update/delete Page

## Project API

### `GET /api/projects`

Public by design: คืนทุก Project เรียงตาม `date` descending โดย `getAllProjectsPublic()` ใช้ `PUBLIC_PROJECT_SELECT`

Whitelist ณ วันที่ตรวจ:

`id`, `title`, `description`, `categoryId`, `date`, `thumbnail`, `gallery`, `videoLink`, `projectUrl`, `toolsUsed`, `createdAt`, `updatedAt`, `category` (category เลือกเฉพาะ `id`, `name`)

### `GET /api/projects/{id}`

Public by design; คืน Project ผ่าน public projection หรือ 404

### `POST /api/projects`

ต้องมี session; required fields ตาม handler: `title`, `categoryId`, `date`

### `PATCH /api/projects/{id}`, `DELETE /api/projects/{id}`

ต้องมี session

## Category API

- `GET /api/categories` — public read
- `POST /api/categories` — session required; ต้องมี `name`
- `GET /api/categories/{id}` — public read
- `PATCH /api/categories/{id}`, `DELETE /api/categories/{id}` — session required

## Staff API

- `GET /api/staff` — public read; อ่าน response fields ก่อนเปิดข้อมูลส่วนบุคคล
- `POST /api/staff` — session required; ต้องมี `name`, `slug`, `role`
- `GET /api/staff/{id}` — public read ตาม route ปัจจุบัน
- `PATCH /api/staff/{id}`, `DELETE /api/staff/{id}` — session required

## Menu API

- `GET /api/menu-items` — anonymous caller ได้เฉพาะ `isVisible=true`; authenticated caller อ่านรายการทั้งหมด
- `POST /api/menu-items` — session required; ต้องมี `label`, `url`
- `PATCH /api/menu-items/{id}`, `DELETE /api/menu-items/{id}` — session required

## Site Config

- `GET /api/site-config` — public read
- `PATCH /api/site-config` — session required; route คัด fields จาก allowlist ก่อน update

## Auth และ setup

| Method/Path | หน้าที่ |
| --- | --- |
| `POST /api/auth/login` | ตรวจ username/password แล้วตั้ง signed session cookie |
| `POST /api/auth/logout` | ลบ session cookies |
| `POST /api/auth/change-password` | ต้อง authenticated |
| `GET /api/auth/setup` | ตรวจ setup/bootstrap status |
| `POST /api/auth/setup` | สร้าง initial superadmin เฉพาะเมื่อยังไม่มี user และ schema/database พร้อม |
| `GET /api/system/bootstrap` | รายงาน database/bootstrap status |

## Media และ upload

- `POST /api/upload` — session required; multipart field `file`; allowlist MIME และ 5 MiB limit; rate limit ยังไม่มีตามสถานะที่บันทึก
- `/api/admin/media` — session-protected media management routes

## Admin namespaces

| Namespace | Methods ที่ประกาศ | หน้าที่ |
| --- | --- | --- |
| `/api/admin/automation/config` | GET, PATCH | automation configuration |
| `/api/admin/automation/campaigns` | GET, POST | list/create campaigns |
| `/api/admin/automation/campaigns/{id}` | PATCH, DELETE | update/delete campaign |
| `/api/admin/automation/campaigns/{id}/run` | POST | run campaign |
| `/api/admin/automation/cron` | POST | run due campaigns; requires cron secret |
| `/api/admin/database` | GET, POST | database status; POST restore currently disabled |
| `/api/admin/media` | GET, POST | list/upload media |
| `/api/admin/media/{id}` | DELETE | delete media |
| `/api/admin/modules` | GET, POST | extension registry operations |
| `/api/admin/modules/{id}` | GET, PATCH, DELETE | inspect/update/lifecycle operation |

Admin routes ใช้ session guard; cron ใช้ token-specific guard

## CORS

CMS `proxy.ts` ใช้ `ALLOWED_ORIGINS` exact allowlist กับ `/api/*`:

- preflight `OPTIONS` สำหรับ origin ที่ไม่อนุญาตตอบ 403
- wildcard ไม่รองรับ
- Server-to-server fetch จาก `apps/web` ไม่ถูก browser CORS enforcement แต่ยังต้อง network reachability
- CORS ไม่ได้แทน authentication/authorization

## Consumer guidance

- ใช้เฉพาะ fields ที่ API ส่งกลับ ไม่สมมติว่าเป็น Prisma object ทั้งก้อน
- handle non-2xx และ network errors อย่างชัดเจน
- percent-encode slug/ID segments ใน URL
- อย่าเก็บ session cookie หรือ cron token ใน browser storage
- อย่าถือว่าทุก GET เป็น public-safe โดยไม่ตรวจ endpoint-specific behavior

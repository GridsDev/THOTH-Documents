# การปรับใช้ฐานข้อมูล

หน้านี้รวบรวมวิธีเตรียมและเชื่อมต่อฐานข้อมูล PostgreSQL ให้กับ CMS ของ THOTH รวมถึงการใช้งานร่วมกับ **Supabase** ซึ่งเป็นหนึ่งใน PostgreSQL provider ที่โครงการต้นทางอ้างถึง

> เนื้อหาแบ่งเป็น 2 ส่วนชัดเจน: **สิ่งที่ตรวจได้จาก source ของ THOTH** และ **พฤติกรรมของ Supabase/Prisma จากเอกสารทางการ** อย่านำคำแนะนำของ provider ไปใช้โดยไม่ตรวจกับ environment จริง

## สถานะปัจจุบันของ THOTH (ตรวจจาก source)

| หัวข้อ | ข้อเท็จจริง |
| --- | --- |
| ORM | Prisma `^6.19.2` (`@prisma/client`, `prisma`) |
| Datasource | `provider = "postgresql"`, อ่าน URL จาก `env("DATABASE_URL")` เท่านั้น |
| Generator | `prisma-client-js` (ยังไม่ใช้ driver adapter) |
| Migrations | มี baseline migration `prisma/migrations/20261010120000_init/`; Docker entrypoint ใช้ `prisma migrate deploy` |
| `prisma.config.ts` | ไม่มีในโครงการ |
| Docker entrypoint | รัน `npx prisma migrate deploy && npm run start` ทุกครั้งที่ container เริ่ม |
| Production deployment | ใช้ Vercel; Vercel build config ปัจจุบันไม่ได้เรียก Dockerfile และไม่ได้ apply migrations ให้อัตโนมัติ |

ผลที่ตามมา:

- ตัวแปรเดียวที่ schema ใช้คือ `DATABASE_URL` ยังไม่มี `DIRECT_URL`
- คำสั่ง CLI (`migrate deploy`, `db push`, `generate`, `studio`) ใช้ `DATABASE_URL` ชุดเดียวกับ runtime
- Docker/self-host ใช้ migration history; Vercel production ต้องมีขั้นตอน apply migration แยกจาก Vercel build/deploy
- `prisma migrate resolve --applied` ใช้เฉพาะการรับรู้ baseline ที่ schema มีอยู่แล้วและตรวจว่าตรงกับ migration; อย่าใช้แทนการ apply migration กับฐานข้อมูลใหม่หรือ schema ที่ไม่ตรงกัน

## ตัวเลือกฐานข้อมูล PostgreSQL

THOTH ต้องการ PostgreSQL ที่เข้าถึงได้ผ่าน connection string มาตรฐาน (`postgresql://...`) ตัวเลือกที่พบบ่อย:

- **Self-hosted / Docker** — PostgreSQL ในเครื่องหรือ VPS เหมาะกับ local/dev และระบบที่ควบคุมเอง
- **Managed PostgreSQL** — เช่น Supabase, Neon หรือผู้ให้บริการอื่นที่ให้ connection string แบบ PostgreSQL มาตรฐาน (โครงการต้นทางระบุว่ารองรับ "PostgreSQL-compatible like Neon, Supabase" ใน `RELEASE_NOTES.md`)

การเลือก provider มีผลกับเรื่อง **connection pooling**, **IPv4/IPv6**, **SSL** และ **ข้อจำกัดของ plan** ซึ่งอธิบายในหัวข้อถัดไป

## Supabase: connection string 4 แบบ

Supabase ให้ connection string สี่แบบ แต่ละแบบใช้คนละพอร์ต/โฮสต์ (อ้างอิงเอกสาร Supabase ณ ตุลาคม 2026):

| แบบ | ตัวอย่างโฮสต์:พอร์ต | ใช้เมื่อ |
| --- | --- | --- |
| Direct connection | `db.[PROJECT-REF].supabase.co:5432` | backend ที่อยู่นาน (VM, container), migration, `pg_dump` — แต่เป็น IPv6 เป็นค่าเริ่มต้น |
| Shared pooler — Session mode | `[POOLER-HOST]:5432` | เครือข่าย IPv4-only, เครื่องมือบุคคลที่สาม; รองรับ prepared statements |
| Shared pooler — Transaction mode | `[POOLER-HOST]:6543` | serverless/edge ที่เปิด connection สั้น ๆ จำนวนมาก; ไม่รองรับ prepared statements |
| Dedicated pooler | `db.[PROJECT-REF].supabase.co:6543` | plan แบบจ่ายเงิน, ใช้ transaction mode เท่านั้น |

ข้อควรรู้ที่กระทบ THOTH โดยตรง:

- **Direct connection เป็น IPv6** เว้นแต่เปิด IPv4 add-on ส่วน **shared pooler เป็น IPv4 ทุก plan** — serverless หลายเจ้าจึงต้องใช้ pooler
- ชื่อผู้ใช้ (username) ต่างกัน: direct/dedicated ใช้ `postgres`; shared pooler ใช้ `postgres.[PROJECT-REF]` และถ้าใช้ role เองจะใช้ `[ROLE].[PROJECT-REF]`
- อย่าเดาโฮสต์ของ pooler จาก region — ให้ copy จาก Dashboard ปุ่ม **Connect** เท่านั้น
- รหัสผ่านที่มีอักขระพิเศษ (`&`, `#`, `?`, ช่องว่าง) ต้อง **percent-encode** ก่อนใส่ใน URL

ดึง string จาก Dashboard: เปิด project → ปุ่ม **Connect** → เลือก method → copy แล้วแทน `[YOUR-PASSWORD]`

## ตั้งค่า `DATABASE_URL` สำหรับ THOTH

### กรณี backend อยู่นาน (VPS / container / self-host)

ใช้ **Session pooler** (พอร์ต 5432) หรือ direct connection ได้ทั้งคำสั่ง CLI และ runtime เพราะ schema ของ THOTH อ่านค่าเดียว:

```bash
# ตัวอย่าง placeholder เท่านั้น — ห้ามใส่ค่าจริงในเอกสารหรือ source control
DATABASE_URL="postgresql://prisma.[PROJECT-REF]:[YOUR-PASSWORD]@[POOLER-HOST]:5432/postgres?schema=public"
```

Session pooler ใช้ได้กับทั้ง `prisma db push` และ Prisma Client จึงเป็นตัวเลือกที่ตรงกับโครงสร้างปัจจุบันของ THOTH มากที่สุด

### กรณี serverless (เช่น Vercel Functions)

เอกสาร Supabase แนะนำให้แอปใช้ **Transaction pooler** (พอร์ต 6543) และ CLI ใช้ connection แยก:

```bash
# ใช้กับแอป (transaction mode) — ต้องเติม pgbouncer=true
DATABASE_URL="postgresql://prisma.[PROJECT-REF]:[YOUR-PASSWORD]@[POOLER-HOST]:6543/postgres?pgbouncer=true&connection_limit=1"

# ใช้กับ Prisma CLI (session mode หรือ direct)
DIRECT_URL="postgresql://prisma.[PROJECT-REF]:[YOUR-PASSWORD]@[POOLER-HOST]:5432/postgres"
```

`?pgbouncer=true` บอก Prisma ให้ปิด prepared statements ซึ่ง transaction mode ไม่รองรับ

> **ข้อจำกัดที่ต้องแก้ก่อนใช้ `DIRECT_URL` กับ THOTH:** schema ปัจจุบันไม่มี `directUrl` และไม่มี `prisma.config.ts` ถ้าต้องการให้ CLI ใช้ connection คนละตัวกับ runtime จะต้องแก้ `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // ต้องเพิ่ม — ยังไม่มีใน schema ปัจจุบัน
}
```

การแก้ datasource เป็นการเปลี่ยนสคีมา ต้องผ่านการ review และอัปเดต environment ทุกที่ (local, Vercel, Docker)

## นำ schema ขึ้นฐานข้อมูล

THOTH มี baseline migration แล้ว และ Docker entrypoint จะเรียก `prisma migrate deploy` ก่อนเริ่มแอป สำหรับการ deploy บน Vercel ต้องสั่ง apply migrations เป็นขั้นตอน release แยกต่างหาก เพราะ `vercel.json` ปัจจุบันไม่ได้เรียก Dockerfile หรือรัน migration command

ฐานข้อมูลใหม่: หลังตั้ง `DATABASE_URL` ที่ชี้ไปยังฐานข้อมูลเป้าหมายแล้ว ใน root ของ CMS ให้ apply migration:

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
```

ฐานข้อมูลเดิมที่เคยสร้างด้วย `prisma db push`: อย่าสั่ง `migrate deploy` ก่อนทำ baseline เพราะ Prisma อาจพยายามสร้างตารางที่มีอยู่แล้ว ทำขั้นตอนต่อไปนี้ครั้งเดียว **หลังตรวจสอบว่า schema ในฐานข้อมูลตรงกับ baseline `20261010120000_init` ทุกประการ**:

```bash
npx prisma migrate resolve --applied 20261010120000_init
npx prisma migrate deploy
```

หาก schema ไม่ตรงกับ baseline ให้หยุดและตรวจ diff/วางแผน migration ก่อน ห้ามแก้โดยลบตารางหรือใช้ `db push` ทับ production โดยไม่ตรวจผลกระทบและสำรองข้อมูล

ข้อบังคับเรื่อง pooler:

- **อย่ารัน `migrate deploy` หรือ DDL ผ่าน transaction pooler (พอร์ต 6543)** หากผู้ให้บริการจำกัด advisory locks/DDL ใน transaction mode; ใช้ session pooler หรือ direct connection สำหรับ migration
- `db push` ให้ใช้กับ local/dev ที่อนุมัติแล้วเท่านั้น; production ให้ใช้ migration ที่ผ่าน review พร้อม backup

## SSL และความปลอดภัย

- ตั้ง `sslmode=require` เพื่อบังคับเชื่อมต่อแบบเข้ารหัส (ค่า `prefer` อาจถอยไปส่งข้อมูลแบบ plaintext)
- ถ้าต้องการตรวจสอบ server ด้วย ให้โหลด root certificate จาก **Database settings** ของ Supabase แล้วใช้ `sslmode=verify-full` กับ `sslrootcert`
- **THOTH ไม่ใช้ Supabase Data API / client library** จึงไม่ต้องนำ `anon` key หรือ `service_role` key มาใส่ในแอป เก็บเฉพาะ connection string
- พิจารณาสร้าง database role เฉพาะสำหรับ Prisma แทนการใช้ `postgres` โดยจำกัดสิทธิ์เท่าที่จำเป็น (ดู [คำแนะนำของ Supabase](https://supabase.com/docs/guides/database/prisma))
- ถ้าใช้ Prisma เพียงอย่างเดียว (ไม่ใช้ PostgREST) พิจารณาปิด Data API ใน Project Settings
- ห้ามพิมพ์ connection string หรือรหัสผ่านออก terminal/chat/log — ตรวจแค่ว่า "ตั้งค่าแล้ว" (ดู [การตั้งค่า Environment](/guide/configuration))

## Connection pooling และ limit

- Supabase มี pooler ฝั่ง server และ Prisma มี pool ฝั่งแอปแยกกัน `connection_limit` ควบคุมจำนวน connection ที่แอปเปิด
- Serverless: ตั้ง `connection_limit=1` และสร้าง Prisma Client ที่ module scope ไม่ใช่ต่อ request
- ถ้าเจอ `Too many connections` ให้ลด `connection_limit` หรือย้ายไป transaction mode
- ศึกษา limit ของ plan (pool size และจำนวน connection สูงสุด) จาก [เอกสาร pooling ของ Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres/pooling-and-limits)

## Backup, restore และการดูแล

- ใช้ **direct connection หรือ session pooler** สำหรับ `pg_dump`/restore/replication เพราะเป็น single session และใช้คำสั่ง native ของ PostgreSQL
- ตรวจว่าระดับ backup ของ Supabase ตรงกับความต้องการธุรกิจหรือไม่ (ขึ้นกับ plan) และทดสอบ restore ไม่ใช่แค่สมมติว่ามี backup
- โครงการ Supabase บน free tier อาจ **ถูก pause เมื่อไม่มีการใช้งาน** เป็นเวลานาน — production ควรใช้ plan ที่ไม่หยุดเอง
- ก่อนเปลี่ยน schema: สำรองข้อมูล, ทดสอบกับฐานข้อมูลที่มีสำเนา, แล้วจึงเปลี่ยนจริง

## Checklist ก่อนใช้ฐานข้อมูล production

- [ ] เลือก connection mode ให้ตรงกับที่รัน (persistent → session/direct; serverless → transaction + `DIRECT_URL`)
- [ ] ตั้ง `DATABASE_URL` (และ `DIRECT_URL` ถ้าแก้ schema) ใน secret manager ของทุก environment
- [ ] ยืนยัน SSL (`sslmode=require` หรือ `verify-full`)
- [ ] สร้าง role เฉพาะและจำกัดสิทธิ์; หลีกเลี่ยง `postgres` ถ้าไม่จำเป็น
- [ ] เตรียม backup และทดสอบ restore
- [ ] Production ใช้ `migrate deploy` ใน release workflow ที่ควบคุมได้ และตรวจ baseline ก่อนครั้งแรกบน DB เดิม
- [ ] ตรวจ pool/`connection_limit` ให้เหมาะกับจำนวน instance ของแอป
- [ ] อย่าใช้ Supabase key ใด ๆ ในแอป THOTH; เก็บเฉพาะ connection string

## อ้างอิง

- [Prisma — Supabase](https://www.prisma.io/docs/orm/overview/databases/supabase) (ตรวจตุลาคม 2026)
- [Supabase — Connect to your database](https://supabase.com/docs/guides/database/connecting-to-postgres) (ตรวจตุลาคม 2026)
- [Supabase — Prisma quickstart](https://supabase.com/docs/guides/database/prisma) (ตรวจตุลาคม 2026)
- [Supabase — Connection pooling and limits](https://supabase.com/docs/guides/database/connecting-to-postgres/pooling-and-limits)
- ภายใน: [ฐานข้อมูลและโมเดล](/guide/data-model), [การตั้งค่า Environment](/guide/configuration), [การติดตั้งใช้งาน](/guide/deployment), [แก้ปัญหาเบื้องต้น](/guide/troubleshooting)

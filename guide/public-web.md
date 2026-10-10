# Public Web

## หน้าที่

`apps/web/` เป็น Next.js app สำหรับ UI ของผู้เข้าชมและแยก build/deploy จาก CMS ได้ มันเรียก CMS API ผ่าน `apps/web/lib/api-client.ts` และไม่ควรเชื่อม database หรือ import source จาก CMS

## Routes ปัจจุบัน

| Route | พฤติกรรม |
| --- | --- |
| `/` | หน้า Home |
| `/projects` | ดึง Project list จาก CMS; แสดง empty/error state |
| `/products` | redirect 307 ไป `/projects` |
| `/{slug}` | ดึง Page ด้วย slug; draft/unknown slug เป็น 404 |

**root CMS ถูกลบ `/products` และ `/dashboard` แล้ว (2026-10-10)** — คงเหลือ `/`, `/[slug]`, `/login`, `/setup`; dynamic slug route คงอยู่ในช่วงก่อน cutover

## API client

เรียก endpoint ผ่าน `apps/web/lib/api-client.ts`:

- `api.pages.list()`
- `api.pages.bySlug(slug)`
- `api.menu.list()`
- `api.siteConfig.get()`
- `api.projects.list()`

Client แยก error classes:

- `ApiConfigError` — ไม่มี `NEXT_PUBLIC_THOTH_API_URL`
- `ApiNetworkError` — ต่อ CMS ไม่สำเร็จ
- `ApiHttpError` — CMS ตอบ non-2xx และมี status

อย่ากลบ error เหล่านี้แล้วแสดงข้อมูลว่าง เพราะผู้ดูแลจะเข้าใจผิดว่าไม่มี content แทนที่จะเป็นระบบเชื่อมต่อไม่ได้

## Server-side rendering และ CORS

หน้าที่ตรวจเรียก API จาก Server Components จึง request จาก server ของ Public Web ไป CMS โดยตรง Browser CORS ไม่ได้บังคับ request แบบนี้ อย่างไรก็ตาม:

- DNS/network/TLS/firewall ต้องให้ server ของ Web ติดต่อ CMS ได้
- ถ้าเพิ่ม client-side fetch ต้องทดสอบ CORS allowlist
- ห้ามส่ง session cookie admin ไป public web
- ห้ามใส่ secret ใน `NEXT_PUBLIC_*`

## เนื้อหา HTML

Dynamic Page แสดง `page.content` เป็น HTML ด้วย `dangerouslySetInnerHTML` ปัจจุบันยังไม่มี sanitizer ที่จุด render จึงควรใช้เฉพาะข้อมูลจากผู้เขียนที่เชื่อถือได้ และต้องถือเป็น security finding ที่ยังเปิดอยู่ก่อนรับ content จากแหล่งอื่น

## เพิ่มหน้าใหม่

1. สร้าง route ภายใต้ route group ที่เหมาะสมใน `apps/web/app/`
2. เพิ่ม API operation/type ใน `apps/web/lib/api-client.ts` และ `lib/types.ts`
3. เรียก CMS ผ่าน API เท่านั้น
4. จัดการ loading/error/empty/not-found ตาม use case
5. เพิ่ม metadata, semantics, accessibility และ responsive behavior
6. ตรวจ build output และทดสอบ route จริง

## Cutover

ยังไม่ถอด public routes เดิมจาก CMS จนกว่าจะผ่านขั้น D: เทียบ SEO/metadata, assets, links, content rendering, API outage behavior, caching และ rollback path ก่อน

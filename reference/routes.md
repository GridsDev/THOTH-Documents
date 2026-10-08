# โครงสร้าง Route

รายการนี้อ้างอิง source tree ปัจจุบัน ไม่ใช่ URL availability check ของ production

## CMS Pages

| Route | หน้าที่ |
| --- | --- |
| `/` | CMS landing เดิม |
| `/products` | Legacy public products page; API ที่หน้านี้เคยเรียกไม่มีใน schema/API |
| `/dashboard` | legacy public dashboard; stats บางส่วนอ้าง endpoint ที่ไม่มี |
| `/{slug}` | legacy dynamic Page renderer |
| `/login`, `/setup` | authentication/bootstrap UI |
| `/admin` | CMS Admin dashboard |
| `/admin/projects` | Project management |
| `/admin/staff` | Staff management |
| `/admin/pages` | Page management |
| `/admin/categories` | Category management |
| `/admin/media` | Media management |
| `/admin/menu` | Menu management |
| `/admin/configuration` | general config |
| `/admin/design` | visual/site design |
| `/admin/automation` | automation |
| `/admin/modules` | module/extension admin |
| `/admin/database` | database tools/status |
| `/admin/change-password` | password change flow |

Admin pages อยู่บน CMS แม้ Public Web จะแยก deploy

## Public Web (`apps/web`)

| Route | Source | Behavior |
| --- | --- | --- |
| `/` | `apps/web/app/(site)/page.tsx` | home |
| `/projects` | `apps/web/app/(site)/projects/page.tsx` | public Project list |
| `/products` | `apps/web/app/(site)/products/page.tsx` | redirect ไป `/projects` |
| `/{slug}` | `apps/web/app/(page)/[slug]/page.tsx` | published CMS Page |

Route groups `(site)` และ `(page)` เป็น organizational folders ของ Next.js และไม่ปรากฏเป็น URL path

## API route files

| Namespace | ความสามารถ |
| --- | --- |
| `/api/auth/*` | login, logout, setup, change password |
| `/api/system/bootstrap` | database status |
| `/api/pages` | Page collection |
| `/api/pages/{id}` | read/update/delete Page; GET รับ ID หรือ slug |
| `/api/projects` | Project collection |
| `/api/projects/{id}` | Project item |
| `/api/categories` | Category collection |
| `/api/categories/{id}` | Category item |
| `/api/staff` | Staff collection |
| `/api/staff/{id}` | Staff item |
| `/api/menu-items` | Menu collection |
| `/api/menu-items/{id}` | Menu item |
| `/api/site-config` | site config |
| `/api/upload` | media upload |
| `/api/admin/automation/*` | campaigns/config/cron |
| `/api/admin/database` | database status/action |
| `/api/admin/media/*` | admin media |
| `/api/admin/modules/*` | extension/module registry |

ดู HTTP methods, access policy และ caveats ที่ [REST API Reference](/reference/api)

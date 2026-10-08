# การทดสอบและการตรวจคุณภาพ

## CMS tests

Root package ใช้ Node.js built-in test runner:

```bash
npm test
```

Test ที่มีในโครงการ ณ วันที่ตรวจ:

- `tests/session.test.mjs` — signing, tampering, expiry, missing/wrong secret
- `tests/cors-policy.test.mjs` — origin parsing และ exact allowlist behavior
- `tests/cron-auth.test.mjs` — cron auth fail-closed และ token validation
- `tests/route-policy.test.mjs` — write-route session guard, admin routes, public Page filtering, Project policy และ whitelist

ชุดทดสอบที่รันระหว่างจัดทำเอกสารผ่าน **30/30 tests** ในวันที่ 9 ตุลาคม 2026 ผลนี้ไม่ใช่การรับรองว่า runtime/API flow ทุกกรณีมี test

## Public Web

```bash
cd apps/web
npx tsc --noEmit
npm run lint
npm run build
```

Build สำเร็จไม่ได้ยืนยันว่า API origin ถูกตั้งหรือมีข้อมูลจริง ผล runtime ต้อง smoke-test แยก

## Code quality

CMS มี ESLint script และ project-level lint baseline ที่บันทึกไว้ **30 errors / 22 warnings** ในรายงานโครงการก่อนหน้า หาก output เปลี่ยน ให้ตรวจว่าเป็น pre-existing หรือเกิดจาก diff ใหม่ อย่ารายงานว่า lint ผ่านเพียงเพราะคำสั่งรันจบถ้ายังมี errors

Typecheck:

```bash
npx tsc --noEmit
```

Build:

```bash
npm run build
```

## Test policy เมื่อเพิ่ม feature

- API security change → test unauthenticated/authorized cases
- public DTO change → exact whitelist policy test
- Page visibility change → draft must remain hidden to anonymous callers
- extension lifecycle change → test invalid manifest and unsafe state
- Public Web API client → test missing config, network error, non-2xx and valid JSON
- UI route change → smoke-test 200/404/redirect and expected rendered content

Static source scan เป็น guardrail ไม่ทดแทน route-level integration test หรือ browser end-to-end test

## Smoke-test checklist

หลังมี CMS และ Public Web รันใน local environment:

1. ตรวจ CMS `/setup` และ login flow ด้วยข้อมูลทดสอบ
2. ตรวจ `GET /api/projects`, `/api/pages`, `/api/menu-items`, `/api/site-config`
3. ตรวจ draft Page ไม่เปิดเผยต่อ anonymous caller
4. ตรวจ `/`, `/projects`, `/products` redirect, published slug และ unknown slug
5. ปิด CMS ชั่วคราวเฉพาะ environment ทดสอบ แล้วตรวจ error state ของ Public Web
6. ตรวจ browser devtools ว่าไม่มี secrets และไม่มี cross-origin CORS errors เมื่อใช้ browser fetch

อย่าใช้ฐานข้อมูล production เพื่อสร้างข้อมูล smoke test โดยไม่ได้รับอนุมัติและแผน cleanup

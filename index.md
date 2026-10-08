---
layout: home
title: THOTH V2 Documentation
titleTemplate: เอกสารโครงการและคู่มือนักพัฒนา
hero:
  name: THOTH V2
  text: CMS ที่ออกแบบให้ต่อยอดได้
  tagline: จัดการเนื้อหาผ่าน Admin และ REST API พร้อมแยก public web เป็นแอปอิสระ
  actions:
    - theme: brand
      text: รู้จักโครงการ
      link: /guide/overview
    - theme: alt
      text: เริ่มพัฒนา
      link: /guide/quick-start
    - theme: alt
      text: ดู REST API
      link: /reference/api
features:
  - title: CMS + Admin
    details: จัดการ Pages, Projects, Categories, Staff, Media, เมนู และการตั้งค่าในแอป CMS
  - title: API-first integration
    details: REST API สำหรับข้อมูลสาธารณะและการจัดการ โดย write/admin routes ต้องผ่าน session guard
  - title: Public Web แยก deploy
    details: apps/web เป็น Next.js app แยก เรียก CMS ผ่าน API ไม่เชื่อม Prisma โดยตรง
  - title: ขยายด้วยโมดูล
    details: มีมาตรฐาน extension manifest, API namespace, storage adapter และข้อกำหนดด้านความปลอดภัย
  - title: PostgreSQL + Prisma
    details: โครงสร้างข้อมูลประกาศใน prisma/schema.prisma และสร้าง Prisma Client จาก schema
  - title: เอกสารตามหลักฐาน
    details: ระบุข้อจำกัดและสิ่งที่ยังไม่เสร็จ ไม่ตีความว่ารายการใน roadmap คือฟีเจอร์ที่พร้อมใช้งาน
---

## เริ่มจากจุดที่ต้องการ

| คุณคือ | เริ่มที่ |
| --- | --- |
| ผู้ติดตั้ง THOTH | [ติดตั้งและตั้งค่าครั้งแรก](/guide/quick-start) |
| ผู้พัฒนา API หรือโมดูล | [Workflow นักพัฒนา](/guide/development) และ [มาตรฐานโมดูล](/guide/modules) |
| ผู้เชื่อมต่อเว็บไซต์ | [REST API](/reference/api) และ [Public Web](/guide/public-web) |
| ผู้ดูแล production | [ความปลอดภัย](/guide/security), [Environment](/guide/configuration), [Deployment](/guide/deployment) |
| ผู้ตรวจความสามารถปัจจุบัน | [สถานะและข้อจำกัด](/guide/status) |

## สถานะของเอกสาร

เอกสารชุดนี้สร้างแยกจาก [source code ของ THOTH V2](https://github.com/Ex0-Adam/THOTH-V2) อ้างอิงข้อมูลที่ตรวจบนดิสก์ ณ วันที่ **9 ตุลาคม 2026** และแยกข้อเท็จจริงของโค้ดออกจากแผนในอนาคต

> **คำเตือน:** มี public API ที่คืนข้อมูลโดยไม่ต้อง login, HTML ของ Page ถูก render ด้วย `dangerouslySetInnerHTML` โดยไม่มี sanitization และ upload ยังไม่มี rate limit ตามสถานะที่บันทึกไว้ ตรวจหน้า [สถานะและข้อจำกัด](/guide/status) และ [ความปลอดภัย](/guide/security) ก่อนนำระบบขึ้น production

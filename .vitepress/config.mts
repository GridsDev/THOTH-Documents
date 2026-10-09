import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "th-TH",
  title: "THOTH V2",
  description: "เอกสารโครงการและคู่มือนักพัฒนา THOTH V2 CMS",
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    siteTitle: "THOTH V2 Docs",
    search: {
      provider: "local",
    },
    nav: [
      { text: "ภาพรวม", link: "/guide/overview" },
      { text: "เริ่มพัฒนา", link: "/guide/quick-start" },
      { text: "อ้างอิง API", link: "/reference/api" },
      { text: "สถานะ", link: "/guide/status" },
      { text: "เว็บไซต์เอกสาร", link: "https://thoth-documents.vercel.app/" },
      { text: "Source code", link: "https://github.com/Ex0-Adam/THOTH-V2" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "รู้จัก THOTH V2",
          items: [
            { text: "ภาพรวมโครงการ", link: "/guide/overview" },
            { text: "สถาปัตยกรรม", link: "/guide/architecture" },
            { text: "เส้นทางข้อมูล", link: "/guide/data-flow" },
            { text: "สถานะและข้อจำกัด", link: "/guide/status" },
          ],
        },
        {
          text: "ติดตั้งและพัฒนา",
          items: [
            { text: "เริ่มใช้งานอย่างรวดเร็ว", link: "/guide/quick-start" },
            { text: "Workflow นักพัฒนา", link: "/guide/development" },
            { text: "การตั้งค่า Environment", link: "/guide/configuration" },
            { text: "ฐานข้อมูลและโมเดล", link: "/guide/data-model" },
            { text: "การปรับใช้ฐานข้อมูล", link: "/guide/database-deployment" },
            { text: "การทดสอบ", link: "/guide/testing" },
          ],
        },
        {
          text: "ออกแบบและดูแลระบบ",
          items: [
            { text: "ความปลอดภัย", link: "/guide/security" },
            { text: "โมดูลและ Extensions", link: "/guide/modules" },
            { text: "Public Web", link: "/guide/public-web" },
            { text: "การติดตั้งใช้งาน", link: "/guide/deployment" },
            { text: "แก้ปัญหาเบื้องต้น", link: "/guide/troubleshooting" },
          ],
        },
      ],
      "/reference/": [
        {
          text: "Reference",
          items: [
            { text: "REST API", link: "/reference/api" },
            { text: "โครงสร้าง Route", link: "/reference/routes" },
            { text: "คำศัพท์", link: "/reference/glossary" },
          ],
        },
      ],
    },
    outline: {
      level: [2, 3],
      label: "ในหน้านี้",
    },
    docFooter: {
      prev: "หน้าก่อน",
      next: "หน้าถัดไป",
    },
    footer: {
      message: "เอกสารสำหรับนักพัฒนาและผู้ติดตั้ง THOTH V2",
      copyright: "ตรวจสอบ source ก่อนใช้งานจริง • ห้ามเผยแพร่ secrets",
    },
  },
});

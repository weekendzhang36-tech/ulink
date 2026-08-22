import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(currentDir, "index.html"), "utf8");
const homeMatch = html.match(/<section class="screen" data-screen="home"[\s\S]*?<section class="screen" data-screen="mine"/);
const homeHtml = homeMatch?.[0] ?? "";

const requiredCopy = [
  "职业规划",
  "实习实践",
  "金融底色",
  "文化交流",
  "测评、规划、简历与课程支持",
  "实训营、岗位介绍与实践机会",
  "金融沙龙、财商课与机构资源",
  "非遗文化、中外交流与研学路线",
  "请等待认证完成",
  "资料已提交，指导员确认后将开放更多成长服务",
  "名学生待认证",
  "待认证",
];

const forbiddenCopy = [
  "购买会员",
  "会员购买",
  "立即开通",
  "会员套餐",
  "第三方协作",
  "本周主线",
  "金融职业入门",
  "行业认知",
  "岗位图谱",
  "财商投教",
  "U Link 成长服务地图",
  "从校园身份出发",
  "先完成学生认证，再进入成长服务入口",
  "我的认证状态",
  "学生认证管理",
];

const missing = requiredCopy.filter((text) => !homeHtml.includes(text));
const forbidden = forbiddenCopy.filter((text) => homeHtml.includes(text));

if (!homeHtml || missing.length > 0 || forbidden.length > 0) {
  if (!homeHtml) {
    console.error("Home screen markup was not found.");
  }

  if (missing.length > 0) {
    console.error(`Missing required home content: ${missing.join(", ")}`);
  }

  if (forbidden.length > 0) {
    console.error(`Forbidden membership purchase copy found: ${forbidden.join(", ")}`);
  }

  process.exit(1);
}

console.log("Student auth home content prototype checks passed.");

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(currentDir, "index.html"), "utf8");
const homeMatch = html.match(/<section class="screen" data-screen="home"[\s\S]*?<section class="screen" data-screen="mine"/);
const homeHtml = homeMatch?.[0] ?? "";
const detailScreens = [
  {
    screen: "career-planning",
    cardTarget: 'data-screen-target="career-planning"',
    copy: ["职业规划", "测评", "规划", "简历", "课程支持"],
  },
  {
    screen: "practice",
    cardTarget: 'data-screen-target="practice"',
    copy: ["实习实践", "实训营", "岗位介绍", "实践机会"],
  },
  {
    screen: "finance-foundation",
    cardTarget: 'data-screen-target="finance-foundation"',
    copy: ["金融底色", "金融沙龙", "财商课", "机构资源"],
  },
  {
    screen: "culture-exchange",
    cardTarget: 'data-screen-target="culture-exchange"',
    copy: ["文化交流", "非遗文化", "中外交流", "研学路线"],
  },
];

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
const missingDetailTargets = detailScreens.filter((detail) => !homeHtml.includes(detail.cardTarget));
const missingDetailCopy = detailScreens.flatMap((detail) => {
  const match = html.match(new RegExp(`<section class="screen" data-screen="${detail.screen}"[\\s\\S]*?<section class="screen" data-screen=`));
  const sectionHtml = match?.[0] ?? "";

  if (!sectionHtml) {
    return [`${detail.screen}: screen missing`];
  }

  return detail.copy.filter((text) => !sectionHtml.includes(text)).map((text) => `${detail.screen}: ${text}`);
});

if (!homeHtml || missing.length > 0 || forbidden.length > 0 || missingDetailTargets.length > 0 || missingDetailCopy.length > 0) {
  if (!homeHtml) {
    console.error("Home screen markup was not found.");
  }

  if (missing.length > 0) {
    console.error(`Missing required home content: ${missing.join(", ")}`);
  }

  if (forbidden.length > 0) {
    console.error(`Forbidden membership purchase copy found: ${forbidden.join(", ")}`);
  }

  if (missingDetailTargets.length > 0) {
    console.error(`Missing module card targets: ${missingDetailTargets.map((detail) => detail.screen).join(", ")}`);
  }

  if (missingDetailCopy.length > 0) {
    console.error(`Missing module detail content: ${missingDetailCopy.join(", ")}`);
  }

  process.exit(1);
}

console.log("Student auth home content prototype checks passed.");

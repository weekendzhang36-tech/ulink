import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(currentDir, "index.html"), "utf8");
const homeMatch = html.match(/<section class="screen" data-screen="home"[\s\S]*?<section class="screen" data-screen="mine"/);
const homeHtml = homeMatch?.[0] ?? "";
const mineMatch = html.match(/<section class="screen" data-screen="mine"[\s\S]*?<section class="screen" data-screen="review"/);
const mineHtml = mineMatch?.[0] ?? "";
const detailScreens = [
  {
    screen: "career-planning",
    cardTarget: 'data-screen-target="career-planning"',
    copy: ["职业规划", "测评", "规划", "简历", "课程支持", "服务方页面占位", "3 分钟阅读"],
  },
  {
    screen: "practice",
    cardTarget: 'data-screen-target="practice"',
    copy: ["实习实践", "实训营", "岗位介绍", "实践机会", "本周五", "已预约", "剩余"],
  },
  {
    screen: "finance-foundation",
    cardTarget: 'data-screen-target="finance-foundation"',
    copy: ["金融底色", "金融沙龙", "财商课", "机构资源", "8月22日", "3 分钟阅读", "已预约"],
  },
  {
    screen: "culture-exchange",
    cardTarget: 'data-screen-target="culture-exchange"',
    copy: ["文化交流", "非遗文化", "中外交流", "研学路线", "8月22日", "已预约", "剩余"],
  },
];
const standaloneScreens = [
  {
    screen: "assessment-placeholder",
    copy: ["测评服务占位图", "测评结果由服务方提供", "服务方页面占位"],
  },
  {
    screen: "resume-placeholder",
    copy: ["简历服务占位图", "简历编辑与预览由服务方提供", "服务方页面占位"],
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
const forbiddenDetailCopy = [
  "内容详情",
  "内容结构",
  "展示重点",
  "阅读目标",
  "状态呈现",
  "核心信息",
  "成果沉淀",
  "机会信息",
  "适合阶段",
  "路线信息",
  "学习收获",
  "把岗位拆成日常任务与能力要求",
  "把可参与机会整理成清晰入口",
  "把行业问题带到线下交流场",
  "U Link 编辑部",
  "编辑部",
];
const requiredMineCopy = ["个人信息", "协议与隐私"];
const requiredMineMarkup = ['class="ios-list settings-list"', ".settings-list button", "grid-template-columns: minmax(0, 1fr) auto"];
const forbiddenMineCopy = ["学生认证管理", 'class="count-badge">12'];

const missing = requiredCopy.filter((text) => !homeHtml.includes(text));
const forbidden = forbiddenCopy.filter((text) => homeHtml.includes(text));
const missingMineCopy = requiredMineCopy.filter((text) => !mineHtml.includes(text)).map((text) => `mine: ${text}`);
const missingMineMarkup = requiredMineMarkup.filter((text) => !html.includes(text)).map((text) => `mine markup/style: ${text}`);
const forbiddenMine = forbiddenMineCopy.filter((text) => mineHtml.includes(text)).map((text) => `mine: ${text}`);
const missingDetailTargets = detailScreens.filter((detail) => !homeHtml.includes(detail.cardTarget));
const missingDetailCopy = detailScreens.flatMap((detail) => {
  const match = html.match(new RegExp(`<section class="screen" data-screen="${detail.screen}"[\\s\\S]*?<section class="screen" data-screen=`));
  const sectionHtml = match?.[0] ?? "";

  if (!sectionHtml) {
    return [`${detail.screen}: screen missing`];
  }

  return detail.copy.filter((text) => !sectionHtml.includes(text)).map((text) => `${detail.screen}: ${text}`);
});
const detailForbidden = detailScreens.flatMap((detail) => {
  const match = html.match(new RegExp(`<section class="screen" data-screen="${detail.screen}"[\\s\\S]*?<section class="screen" data-screen=`));
  const sectionHtml = match?.[0] ?? "";

  return forbiddenDetailCopy.filter((text) => sectionHtml.includes(text)).map((text) => `${detail.screen}: ${text}`);
});
const missingStandaloneCopy = standaloneScreens.flatMap((detail) => {
  const match = html.match(new RegExp(`<section class="screen" data-screen="${detail.screen}"[\\s\\S]*?<section class="screen" data-screen=`));
  const sectionHtml = match?.[0] ?? "";

  if (!sectionHtml) {
    return [`${detail.screen}: screen missing`];
  }

  return detail.copy.filter((text) => !sectionHtml.includes(text)).map((text) => `${detail.screen}: ${text}`);
});

if (
  !homeHtml ||
  missing.length > 0 ||
  forbidden.length > 0 ||
  missingMineCopy.length > 0 ||
  missingMineMarkup.length > 0 ||
  forbiddenMine.length > 0 ||
  missingDetailTargets.length > 0 ||
  missingDetailCopy.length > 0 ||
  detailForbidden.length > 0 ||
  missingStandaloneCopy.length > 0
) {
  if (!homeHtml) {
    console.error("Home screen markup was not found.");
  }

  if (missing.length > 0) {
    console.error(`Missing required home content: ${missing.join(", ")}`);
  }

  if (forbidden.length > 0) {
    console.error(`Forbidden membership purchase copy found: ${forbidden.join(", ")}`);
  }

  if (missingMineCopy.length > 0) {
    console.error(`Missing mine screen copy: ${missingMineCopy.join(", ")}`);
  }

  if (missingMineMarkup.length > 0) {
    console.error(`Missing mine screen layout guard: ${missingMineMarkup.join(", ")}`);
  }

  if (forbiddenMine.length > 0) {
    console.error(`Forbidden mine screen copy found: ${forbiddenMine.join(", ")}`);
  }

  if (missingDetailTargets.length > 0) {
    console.error(`Missing module card targets: ${missingDetailTargets.map((detail) => detail.screen).join(", ")}`);
  }

  if (missingDetailCopy.length > 0) {
    console.error(`Missing module detail content: ${missingDetailCopy.join(", ")}`);
  }

  if (detailForbidden.length > 0) {
    console.error(`Forbidden abstract module detail copy found: ${detailForbidden.join(", ")}`);
  }

  if (missingStandaloneCopy.length > 0) {
    console.error(`Missing standalone screen content: ${missingStandaloneCopy.join(", ")}`);
  }

  process.exit(1);
}

console.log("Student auth home content prototype checks passed.");

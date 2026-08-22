import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(currentDir, "index.html"), "utf8");

const requiredCopy = [
  "金融职业内容",
  "行业认知",
  "岗位图谱",
  "财商投教",
  "实习实践",
  "简历优化",
  "职业测评",
  "咨询预约",
  "待认证",
  "学生认证管理",
];

const forbiddenCopy = ["购买会员", "会员购买", "立即开通", "会员套餐"];

const missing = requiredCopy.filter((text) => !html.includes(text));
const forbidden = forbiddenCopy.filter((text) => html.includes(text));

if (missing.length > 0 || forbidden.length > 0) {
  if (missing.length > 0) {
    console.error(`Missing required home content: ${missing.join(", ")}`);
  }

  if (forbidden.length > 0) {
    console.error(`Forbidden membership purchase copy found: ${forbidden.join(", ")}`);
  }

  process.exit(1);
}

console.log("Student auth home content prototype checks passed.");

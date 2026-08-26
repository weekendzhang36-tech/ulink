# 校园数据导入

学生注册认证依赖后台的学校、学院、专业和班级数据。指导员认证管理也依赖班级中的指导员手机号配置：指导员登录并完成手机号验证后，后台按手机号匹配其负责班级。

## 导入文件

当前支持 CSV 或 TSV 文本。推荐字段：

```csv
学校,城市,学院,专业,班级,入学年份,指导员手机号
广东金融学院,广州,金融与投资学院,金融学,金融学 2026-1 班,2026,"13900000001、13900000002"
```

模板见 [docs/templates/campus-import-template.csv](./templates/campus-import-template.csv)。

字段说明：

- `学校`、`学院`、`专业`、`班级` 必填。
- `城市` 可选，写入学校城市字段。
- `入学年份` 可选；填写时应为 2000 到 2100 之间的年份。
- `指导员手机号` 可选，多个手机号可用逗号、顿号、分号或空格分隔。

英文表头也可使用：`schoolName, city, collegeName, majorName, className, entryYear, instructorPhones`。

## 导入命令

导入前先确认 `apps/cms/.env` 中的 `DATABASE_URL` 和 `PAYLOAD_SECRET` 指向正确环境。生产导入前必须先备份数据库。

```bash
pnpm import:campus docs/templates/campus-import-template.csv
```

导入规则：

- 按学校、学院、专业、班级逐级查找，已有记录不会重复创建。
- 同名班级已存在时，会更新 `entryYear` 和 `instructorPhones`。
- 指导员手机号格式不正确会中止导入，不写入后续数据。
- 同一个导入文件中，如果同一学校/学院/专业/班级重复但入学年份不同，会中止导入。

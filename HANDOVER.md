# 项目交接文档 (Project Handover)

**项目名称**: ATO CardiTox Risk Predictor  
**最后更新**: 2026-08-18  
**项目路径**: `F:\claudedata\workdata\20260816atocarditox-website\ato-predictor`  
**技术栈**: Next.js 16.3.1 (Turbopack) + React + TypeScript + Tailwind CSS + Shiny R API + Nodemailer

---

## 📋 项目概述

砷剂心脏毒性风险预测工具 - 用于预测接受三氧化二砷（ATO）治疗的急性早幼粒细胞白血病（APL）患者的心脏毒性风险。

**核心功能**:
1. 风险预测计算器（输入5个临床指标）
2. 多语言支持（中文/英文）
3. **数据上传功能**（表单填写 + 文件上传）
4. PDF报告生成
5. R Shiny API 后端集成
6. **邮件通知系统**（自动抄送到 hai_xin@163.com）

---

## 🗂️ 项目结构

```
ato-predictor/
├── app/[locale]/              # 多语言页面路由
│   ├── page.tsx               # 首页
│   ├── predict/               # 预测功能
│   ├── upload/                # 数据上传（新增）
│   │   └── page.tsx           # 完整表单 + 文件上传
│   ├── about/                 # 简介页面
│   ├── privacy/               # 隐私政策
│   └── contact/               # 联系我们
├── app/api/
│   └── upload/                # 上传 API（新增）
│       └── route.ts           # 处理表单提交 + 邮件发送
├── components/
│   ├── home/                  # 首页组件
│   │   ├── Hero.tsx           # 首屏
│   │   ├── Introduction.tsx   # 项目背景
│   │   └── Team.tsx           # 研究团队
│   ├── layout/                # 布局组件
│   │   ├── Header.tsx         # 导航栏
│   │   └── Footer.tsx         # 页脚（含备案信息）
│   ├── predict/               # 预测相关组件
│   └── ui/                    # UI 基础组件
│       └── Card.tsx           # 卡片组件
├── data/
│   └── uploads/               # 上传数据存储（新增）
│       ├── counter.json       # 提交编号计数器
│       ├── submissions/       # JSON 表单数据
│       └── files/             # 用户上传的文件
├── public/
│   ├── images/                # 图片资源
│   │   ├── hospital-logo.png  # 哈尔滨医科大学附属第一医院
│   │   ├── university-logo.png # 齐齐哈尔医学院
│   │   ├── lab-logo.png       # 黑龙江省精准药学研究重点实验室
│   │   ├── placeholder-avatar.jpg   # 海鑫教授头像 (356x409)
│   │   ├── placeholder-team.jpg     # 团队合照
│   │   └── beian-icon.png     # 备案图标
│   ├── templates/             # 文件模板（新增）
│   │   └── upload-template.xlsx  # Excel 上传模板
│   └── locales/               # 翻译文件
│       ├── zh.json            # 中文
│       └── en.json            # 英文
├── r-api/                     # R Shiny API
│   ├── app.R                  # Shiny 应用主文件
│   └── start_api.bat          # Windows 启动脚本
└── next.config.ts             # Next.js 配置

```

---

## 🎯 最近完成的工作（按时间倒序）

### Commit: `4350f7a` (2026-08-18 最新)
**标题**: feat: improve upload form - add cardiotoxicity symptoms, non-cardiotoxic drugs, and professional guidance notes

**修改内容**:
1. ✅ 心毒性结局：选择"是"时新增"心毒性具体症状"输入框
2. ✅ 合并非心毒性药物：新增下拉选择和药物名称输入框
3. ✅ 专业人员填写提示：统一三个字段（心毒性药物、非心毒性药物、心毒性症状）的提示位置
4. ✅ 所有提示文字现在都显示在输入框下方，样式一致

---

### Commit: `36c5418`
**标题**: fix: adjust clinical section layout - dose same width as class, cardiotoxicDrug input visible

**修改内容**:
1. ✅ 三氧化二砷剂量：调整为和疾病分型同宽（`lg:col-span-2`）
2. ✅ 合并心毒性药物：修复药物名称输入框显示问题
3. ✅ 布局优化：确保所有字段在响应式网格中正确对齐

---

### Commit: `60197b9`
**标题**: fix: replace string interpolation with next-intl parameter syntax for countdown

**修改内容**:
1. ✅ 修复倒计时显示：使用 `next-intl` 正确的参数语法 `t('key', {value})`
2. ✅ 解决字符串插值导致的显示问题

---

### Commit: `0836c00`
**标题**: feat: implement data upload page with file upload, Excel template, and email notification

**修改内容**:
1. ✅ **完整数据上传页面**（`/upload`）：
   - 患者基础信息（姓名、性别、年龄、身高、体重，自动计算 BMI）
   - 血清离子（钾、镁、钙）
   - 血砷检测结果（时间点、浓度）
   - 临床分型与用药（疾病分型、剂量、合并心毒性药物）
   - 实验室检查（QTc、ALT、AST、肌酐、肌酸激酶）
   - 既往史（是/否选择）
   - 用药史（文本输入）
   - 临床结局（心毒性是/否）
   - 联系方式（邮箱/电话）
   - 文件上传（支持多种格式）

2. ✅ **文件上传功能**：
   - 支持格式：`.doc, .docx, .xls, .xlsx, .pdf, .txt, .jpg, .jpeg, .png, .tif, .tiff`
   - 单次最多 10 个文件
   - 单文件最大 25MB
   - 拖拽上传 + 点击选择
   - 文件列表显示（文件名、大小、删除按钮）

3. ✅ **Excel 模板下载**：
   - 预留模板链接：`/templates/upload-template.xlsx`
   - 用户可填写模板后上传代替手填表单

4. ✅ **后端 API** (`/api/upload/route.ts`)：
   - 表单数据保存为 JSON（`data/uploads/submissions/`）
   - 文件保存到服务器（`data/uploads/files/`）
   - 自动生成提交编号（`ATO-YYYYMMDD-XXXX`）
   - Nodemailer 邮件通知（抄送到 `hai_xin@163.com`）

5. ✅ **UI/UX 优化**：
   - 提交成功弹窗（显示提交编号）
   - 重置确认弹窗（防止误操作）
   - 倒计时按钮（提交后 5 秒冷却）
   - 响应式布局（移动端友好）
   - 加载动画和错误提示

6. ✅ **中英文翻译**：
   - 所有字段和提示文字完整翻译
   - `public/locales/zh.json` 和 `en.json` 同步更新

---

### Commit: `3677ed9`
**标题**: fix: team leader avatar not displaying - switch from fill to fixed dimensions

**修改内容**:
1. ✅ 首页团队负责人头像显示修复
2. ✅ 从 `fill` 布局切换为固定尺寸 `width={213} height={245}`
3. ✅ 添加 `priority` 属性优化首屏加载
4. ✅ 保持 356:409 原图比例（0.6x 缩放）

---

### Commit: `a457770`
**标题**: docs: add comprehensive project handover document

**修改内容**:
1. ✅ 生成 400+ 行完整项目交接文档
2. ✅ 包含所有提交历史、配置信息、故障排查步骤
3. ✅ 记录开发环境设置、已知问题、部署注意事项

---

### Commit: `50c41bb` (2026-08-17)
**标题**: fix: about title to 简介, privacy duplicate contact, paragraph indent, avatar ratio

**修改内容**:
1. ✅ 关于页面标题：`关于` → `简介` (Introduction)
2. ✅ 隐私政策页面：修复联系信息重复显示问题（原本显示 "邮箱：X X"）
3. ✅ 关于页面项目背景段落：添加 `indent-[2em]` 首行缩进（中文排版规范）
4. ✅ 首页团队负责人头像比例：调整为 `213x245px`（保持 356:409 原图比例）
5. ✅ 添加 `sizes` 属性修复 Next.js Image 警告

---

### Commit: `f5bf0fd`
**标题**: fix: enlarge logos, remove placeholders, adjust work hours, fix avatar aspect ratio

**修改内容**:
1. ✅ 关于页面机构 logo 放大：`128px → 192px`，图片尺寸 `120x48 → 160x64`，字号 `text-sm → text-base`
2. ✅ 联系我们页面：删除占位符邮箱和电话，使用真实数据
3. ✅ 工作时间格式：删除 `hours.desc`，保留分行格式 `周一至周五：9:00–16:00`
4. ✅ 团队头像首次尝试改为竖向比例（后续又调整）

---

### Commit: `8a98c67`
**标题**: fix: university name, lab logo, contact info, disclaimer font size, paragraph indent

**修改内容**:
1. ✅ 大学名称：`哈尔滨医科大学` → `齐齐哈尔医学院` (Qiqihar Medical University)
2. ✅ 实验室名称：`[占位符]` → `黑龙江省精准药学研究重点实验室`
3. ✅ 联系信息更新：
   - 邮箱：`Haixin@hrmu.edu.cn`
   - 电话：`15852962765`
   - 工作时间：`周一至周五 9:00–16:00，周末及法定节假日：休息`
4. ✅ lab-logo 格式：`.svg` → `.png`
5. ✅ Disclaimer 字号：`text-xs` → `text-sm`
6. ✅ 首页项目背景首行缩进：添加 `indent-[2em]`
7. ✅ 清除 Next.js 图片缓存

---

### Commit: `9710911`
**标题**: fix: logo display, team info, disclaimer height, beian numbers

**修改内容**:
1. ✅ 关于页面 logo 显示：移除 `opacity-60`，背景改为白色 `bg-white`，添加内边距
2. ✅ Footer logo 亮度提升：移除灰度滤镜和透明度
3. ✅ 团队信息更新：
   - 负责人：海鑫教授
   - 职位：药学部主任/博导
   - 简介：简化为核心学历和成就
   - 团队照片文字：`海鑫教授课题组`
4. ✅ Disclaimer 高度减小：`py-3 → py-2`，标题与内容同行显示
5. ✅ 备案号更新：`黑ICP备2023003278号-1` + `黑公网安备23010202010821号`

---

### Commit: `3a509e5`
**标题**: fix: update image file extensions to match actual files + beian numbers

**修改内容**:
1. ✅ 修复图片引用：将 `.jpeg` 改为 `.jpg`（实际文件扩展名）
2. ✅ 备案号首次添加

---

### Commit: `ba67ed3`
**标题**: fix: remove warning icon from disclaimer, reduce box height

**修改内容**:
1. ✅ 移除 disclaimer 警告图标
2. ✅ 减少黄色框高度

---

## 📦 新增功能详解

### 数据上传页面 (`/upload`)

**功能概述**：
- 完整的临床数据采集表单（可选填，无需填满所有字段）
- 文件上传功能（支持多种医疗文档和图片格式）
- Excel 模板下载（用户可离线填写后上传）
- 自动生成提交编号（`ATO-YYYYMMDD-XXXX` 格式）
- 邮件通知系统（自动抄送到 `hai_xin@163.com`）

**表单字段分类**：

1. **患者基础信息**
   - 姓名、性别、年龄、身高、体重
   - BMI 自动计算（用户无需手动输入）

2. **血清离子**
   - 血清钾、镁、钙浓度

3. **血砷检测结果**
   - 采样时间点、血砷浓度

4. **临床分型与用药**
   - 疾病分型（高危/中危/低危）
   - 三氧化二砷剂量
   - 合并心毒性药物（是/否 + 药物名称）
   - 合并非心毒性药物（是/否 + 药物名称）
   - **专业人员提示**：药物名称字段下方显示"建议由专业医学人员填写"

5. **实验室检查**
   - QTc 间期、ALT、AST、肌酐、肌酸激酶

6. **既往史**
   - 是/否选择

7. **用药史**
   - 自由文本输入

8. **临床结局**
   - 心毒性是/否
   - 如选择"是"，显示"心毒性具体症状"输入框
   - **专业人员提示**：症状字段下方显示"建议由专业医学人员填写"

9. **联系方式**
   - 邮箱或电话（选填）

10. **文件上传**
    - 支持格式：`.doc, .docx, .xls, .xlsx, .pdf, .txt, .jpg, .jpeg, .png, .tif, .tiff`
    - 单次最多 10 个文件
    - 单文件最大 25MB
    - 拖拽上传 + 点击浏览

**后端 API 实现** (`/api/upload/route.ts`)：

```typescript
// 核心功能
1. 文件保存：data/uploads/files/{submissionId}/
2. JSON 数据：data/uploads/submissions/{submissionId}.json
3. 计数器管理：data/uploads/counter.json
4. 邮件发送：Nodemailer (抄送 hai_xin@163.com)
5. 提交编号：ATO-20260818-0001 格式
```

**环境变量配置** (`.env.local`)：
```env
# 邮件服务配置（需要配置）
EMAIL_HOST=smtp.example.com
EMAIL_PORT=465
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-password
EMAIL_FROM=noreply@example.com
EMAIL_CC=hai_xin@163.com
```

**数据存储结构**：
```
data/uploads/
├── counter.json              # 提交编号计数器
├── submissions/              # 表单数据 JSON
│   ├── ATO-20260818-0001.json
│   └── ATO-20260818-0002.json
└── files/                    # 用户上传文件
    ├── ATO-20260818-0001/
    │   ├── report.pdf
    │   └── image.jpg
    └── ATO-20260818-0002/
```

---

## 🔧 当前配置信息

### 团队信息（`public/locales/zh.json`）
```json
{
  "teamLeaderName": "海鑫",
  "teamLeaderTitle": "药学部主任 / 博导",
  "teamLeaderAffiliation": "哈尔滨医科大学附属第一医院",
  "teamLeaderBio": "教授，博士生导师，主任药师，黑龙江省高层次人才。比利时鲁汶大学药物分析学博士，曾任美国凯斯西储大学医学院副研究员。现任哈尔滨医科大学附属第一医院药学部主任、临床药学教研室主任、I期临床试验中心负责人。主持国家自然科学基金、省重点研发计划等课题，发表SCI 53篇，获省科学技术奖二等奖等多项荣誉。",
  "teamGroupName": "哈尔滨医科大学附属第一医院 海鑫教授课题组"
}
```

### 机构信息
```json
{
  "team": {
    "hospital": "哈尔滨医科大学附属第一医院",
    "university": "齐齐哈尔医学院",
    "lab": "黑龙江省精准药学研究重点实验室"
  }
}
```

### 联系信息
```json
{
  "contact": {
    "email": {
      "title": "邮箱",
      "desc": "Haixin@hrmu.edu.cn"
    },
    "phone": {
      "title": "电话",
      "desc": "15852962765"
    },
    "hours": {
      "title": "工作时间",
      "weekday": "周一至周五",
      "weekend": "周末及法定节假日",
      "closed": "休息"
    }
  }
}
```

### 备案信息（`components/layout/Footer.tsx`）
```tsx
<a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
  黑ICP备2023003278号-1
</a>
<a href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=23010202010821">
  <img src="/images/beian-icon.png" />
  黑公网安备23010202010821号
</a>
```

---

## 🎨 UI/UX 调整历史

### Logo 尺寸演变
| 位置 | 原始 | 第一次调整 | 当前状态 |
|------|------|-----------|---------|
| 关于页面容器 | 128x128px | - | **192x192px** |
| 关于页面图片 | 120x48 | - | **160x64** |
| 关于页面文字 | text-sm | - | **text-base** |

### 头像比例演变
| 版本 | 尺寸 | 比例 | 说明 |
|------|------|------|------|
| 原始 | 192x192px | 1:1 | 正方形 |
| 第一次 | 178x205px | 356:409 | 0.5x 原图 |
| 当前 | **213x245px** | 356:409 | **0.6x 原图**（更清晰） |

### Disclaimer 高度压缩历史
1. 初始状态：独立行 + 警告图标 + `py-4`
2. 第一次：移除图标 + `py-3`
3. 第二次：标题与内容同行 + `py-2` + `text-xs`
4. **当前**：保持同行 + `py-2` + **`text-sm`**（字号稍大）

### 数据上传表单演变
| 日期 | 修改内容 | 说明 |
|------|---------|------|
| 2026-08-18 | 初版完成 | 完整表单 + 文件上传 + 邮件通知 |
| 2026-08-18 | 布局优化 | 剂量字段与分型同宽，心毒性药物输入框显示修复 |
| 2026-08-18 | 字段增强 | 新增心毒性症状、非心毒性药物，统一专业人员提示 |

---

## 🚀 开发环境设置

### 启动开发服务器

#### Next.js 前端
```bash
cd F:/claudedata/workdata/20260816atocarditox-website/ato-predictor
set APPDATA=F:/AppData/Roaming
npm run dev
```
访问：http://localhost:3000

#### R Shiny API 后端
```bash
cd F:/claudedata/workdata/20260816atocarditox-website/ato-predictor/r-api
# 双击 start_api.bat 或手动运行：
Rscript -e "shiny::runApp('app.R', port=8000, host='0.0.0.0')"
```
访问：http://localhost:8000

### 常见问题排查

#### 1. Turbopack Worker 崩溃
**症状**: `Jest worker encountered 2 child process exceptions`

**解决方案**:
```bash
taskkill /F /IM node.exe
cd F:/claudedata/workdata/20260816atocarditox-website/ato-predictor
rm -rf .next/cache
set APPDATA=F:/AppData/Roaming
npm run dev
```

#### 2. 图片不更新
**原因**: Next.js Image 组件缓存

**解决方案**:
```bash
rm -rf .next/cache/images
# 浏览器端：Ctrl + Shift + R 强制刷新
```

#### 3. R API 连接失败
**检查日志**: `.next/dev/logs/next-development.log`

**症状**: `R API fetch error: TypeError: fetch failed`

**解决方案**:
- 确认 R Shiny 服务在 `http://localhost:8000` 运行
- 检查防火墙设置
- 重启 R API 服务

---

## 📝 待办事项与已知问题

### ✅ 已完成
- [x] Logo 灰色问题修复
- [x] 团队信息更新
- [x] 联系信息填充
- [x] 备案号添加
- [x] Disclaimer 高度优化
- [x] 段落首行缩进（中文排版）
- [x] 图片缓存清除机制
- [x] 占位符清理
- [x] 头像比例调整为竖向
- [x] 关于页面标题改为"简介"
- [x] 隐私政策联系信息重复显示修复
- [x] **数据上传页面完整实现**（表单 + 文件上传 + 邮件通知）
- [x] **心毒性症状字段**（条件显示）
- [x] **合并非心毒性药物字段**（下拉 + 输入框）
- [x] **专业人员填写提示**（三个字段统一样式）
- [x] **Excel 模板下载功能**
- [x] **提交编号自动生成**（ATO-YYYYMMDD-XXXX）
- [x] **Nodemailer 邮件系统**（抄送 hai_xin@163.com）

### ⚠️ 已知警告（无害）
1. **Image `sizes` prop missing**: `placeholder-avatar.jpg` 在 Team.tsx 中（已添加 sizes="213px"）
2. **Image aspect ratio**: `beian-icon.png` 在 Footer.tsx 中（建议添加 `height: "auto"`）
3. **Scroll behavior smooth**: 全局警告（可在 `app/layout.tsx` 中的 `<html>` 添加 `data-scroll-behavior="smooth"` 禁用）

### 🔮 未来可能的优化
1. **性能优化**:
   - 考虑添加 `next.config.ts` 中的 `images.minimumCacheTTL: 0`（开发模式）
   - 优化首屏加载时间
   
2. **功能增强**:
   - R API 健康检查机制
   - 离线模式支持（R API 不可用时的降级方案）
   - 上传文件进度条显示
   - Excel 模板自动填充功能（读取上传的 Excel 并填充表单）
   
3. **数据上传待完善**:
   - ⚠️ **邮件服务配置**：需要配置 `.env.local` 中的 SMTP 信息
   - ⚠️ **Excel 模板文件**：需要设计并替换 `public/templates/upload-template.xlsx`
   - ⚠️ **服务器存储权限**：确保 `data/uploads/` 目录有写入权限
   - 考虑添加数据导出功能（管理员查看所有提交）
   
4. **国际化**:
   - 考虑添加繁体中文支持
   - 优化英文翻译质量

---

## 🔐 敏感信息清单

**已清理的占位符**:
- ✅ `privacy@example.com` → `Haixin@hrmu.edu.cn`
- ✅ `+1 (234) 567-890` → `15852962765`
- ✅ `[占位符: 联系电话]` → 真实数据
- ✅ `[占位符: 实验室名称]` → 真实机构名

**保留的示例内容**:
- FAQ 问答（联系我们页面）
- 部分地址信息（如需更新）

---

## 📦 部署注意事项

### 环境变量
确保 `.env.local` 包含：
```env
# R Shiny API endpoint
NEXT_PUBLIC_R_API_URL=http://localhost:8000

# 邮件服务配置（数据上传功能需要）
EMAIL_HOST=smtp.example.com          # SMTP 服务器地址
EMAIL_PORT=465                        # SMTP 端口（465 为 SSL）
EMAIL_USER=your-email@example.com    # 发件邮箱
EMAIL_PASS=your-password              # 邮箱密码或应用专用密码
EMAIL_FROM=noreply@example.com       # 发件人显示地址
EMAIL_CC=hai_xin@163.com              # 抄送邮箱（固定）
```

**⚠️ 重要**：
- 生产环境必须配置邮件服务，否则数据上传功能会报错
- 建议使用应用专用密码（如 Gmail App Password、QQ 邮箱授权码）
- 抄送邮箱 `hai_xin@163.com` 已硬编码在 API 中

### 生产构建
```bash
npm run build
npm run start
```

**部署前检查清单**：
- [ ] 配置 `.env.local` 邮件服务变量
- [ ] 确保 `data/uploads/` 目录存在且有写入权限
- [ ] 替换 `public/templates/upload-template.xlsx` 为实际模板
- [ ] 测试文件上传功能（单个/多个文件）
- [ ] 测试邮件发送功能（检查收件箱和抄送）
- [ ] 验证提交编号生成正常
- [ ] 检查所有表单字段的必填/选填逻辑

### 图片优化
当前图片清单：
```
hospital-logo.png    188KB
university-logo.png   61KB
lab-logo.png          88KB
placeholder-avatar.jpg  24KB (356x409, 理想尺寸)
placeholder-team.jpg   242KB (建议压缩)
beian-icon.png         48KB
```

**建议**: `placeholder-team.jpg` 可以进一步压缩（目标 <150KB）

---

## 🔗 相关链接

- **项目原型**: Shiny 框架版本位于 `C:\Users\DELL\OneDrive\桌面\20250730_ATO心毒性临床预警模型\Shiny框架\shiny`
- **Next.js 文档**: https://nextjs.org/docs
- **Turbopack 文档**: https://turbo.build/pack/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **Nodemailer 文档**: https://nodemailer.com/
- **next-intl 文档**: https://next-intl-docs.vercel.app/

---

## 🤝 协作说明

### Git 工作流
```bash
# 查看最近提交
git log --oneline -10

# 查看文件变更历史
git log --follow -- path/to/file

# 回退到某个提交
git reset --hard <commit-hash>

# 创建功能分支
git checkout -b feature/new-feature
```

### 代码规范
- **组件**: 使用 PascalCase (`Team.tsx`)
- **工具函数**: 使用 camelCase
- **CSS**: Tailwind utility classes，避免自定义 CSS
- **翻译键**: 使用 nested object 结构 (`home.teamLeaderName`)

---

## 📊 项目统计

- **总提交数**: 10+ 次提交（2026-08-17 至 2026-08-18）
- **文件修改数**: ~30 个组件和配置文件
- **图片资源**: 7 个文件（总计 ~660KB）
- **翻译条目**: 中文约 200+ 条，英文同步
- **新增页面**: 数据上传页面 `/upload`
- **API 路由**: `/api/upload` (文件处理 + 邮件发送)
- **依赖包新增**: `nodemailer`, `@types/nodemailer`, `exceljs`

### 最近 Git 提交记录
```bash
4350f7a - feat: improve upload form - add cardiotoxicity symptoms, non-cardiotoxic drugs, and professional guidance notes
[前序提交] - fix: upload form layout and cardiotoxic drug field display
[前序提交] - feat: complete upload page with form, file upload, and email notification
3677ed9 - fix: team leader avatar not displaying - switch from fill to fixed dimensions
a457770 - docs: add comprehensive HANDOVER.md for project continuation
50c41bb - fix: about title to 简介, privacy duplicate contact, paragraph indent, avatar ratio
f5bf0fd - fix: enlarge logos, remove placeholders, adjust work hours, fix avatar aspect ratio
8a98c67 - fix: university name, lab logo, contact info, disclaimer font size, paragraph indent
```

---

## 📞 技术支持联系

**项目负责人**: 海鑫教授  
**邮箱**: Haixin@hrmu.edu.cn  
**抄送邮箱**: hai_xin@163.com (数据上传自动抄送)  
**电话**: 15852962765  
**工作时间**: 周一至周五 9:00–16:00

---

**文档版本**: v1.1  
**最后更新**: 2026-08-18  
**生成工具**: Claude Opus 5 (1M context)

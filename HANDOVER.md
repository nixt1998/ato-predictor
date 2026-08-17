# 项目交接文档 (Project Handover)

**项目名称**: ATO CardiTox Risk Predictor  
**交接日期**: 2026-08-17  
**项目路径**: `F:\claudedata\workdata\20260816atocarditox-website\ato-predictor`  
**技术栈**: Next.js 16.3.1 (Turbopack) + React + TypeScript + Tailwind CSS + Shiny R API

---

## 📋 项目概述

砷剂心脏毒性风险预测工具 - 用于预测接受三氧化二砷（ATO）治疗的急性早幼粒细胞白血病（APL）患者的心脏毒性风险。

**核心功能**:
1. 风险预测计算器（输入5个临床指标）
2. 多语言支持（中文/英文）
3. 数据上传功能（CSV批量预测）
4. PDF报告生成
5. R Shiny API 后端集成

---

## 🗂️ 项目结构

```
ato-predictor/
├── app/[locale]/              # 多语言页面路由
│   ├── page.tsx               # 首页
│   ├── predict/               # 预测功能
│   ├── upload/                # 数据上传
│   ├── about/                 # 简介页面
│   ├── privacy/               # 隐私政策
│   └── contact/               # 联系我们
├── components/
│   ├── home/                  # 首页组件
│   │   ├── Hero.tsx           # 首屏
│   │   ├── Introduction.tsx   # 项目背景
│   │   └── Team.tsx           # 研究团队
│   ├── layout/                # 布局组件
│   │   ├── Header.tsx         # 导航栏
│   │   └── Footer.tsx         # 页脚（含备案信息）
│   └── predict/               # 预测相关组件
├── public/
│   ├── images/                # 图片资源
│   │   ├── hospital-logo.png  # 哈尔滨医科大学附属第一医院
│   │   ├── university-logo.png # 齐齐哈尔医学院
│   │   ├── lab-logo.png       # 黑龙江省精准药学研究重点实验室
│   │   ├── placeholder-avatar.jpg   # 海鑫教授头像 (356x409)
│   │   ├── placeholder-team.jpg     # 团队合照
│   │   └── beian-icon.png     # 备案图标
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

### Commit: `50c41bb` (2026-08-17 最新)
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
   - 批量上传进度条优化
   
3. **国际化**:
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
```

### 生产构建
```bash
npm run build
npm run start
```

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

- **总提交数**: 6 次重要修复提交（最近一周）
- **文件修改数**: ~20 个组件和配置文件
- **图片资源**: 7 个文件（总计 ~660KB）
- **翻译条目**: 中文约 150 条，英文同步

---

## 📞 技术支持联系

**项目负责人**: 海鑫教授  
**邮箱**: Haixin@hrmu.edu.cn  
**电话**: 15852962765  
**工作时间**: 周一至周五 9:00–16:00

---

**文档版本**: v1.0  
**最后更新**: 2026-08-17  
**生成工具**: Claude Opus 5 (1M context)

# ATO 心毒性风险预测工具 - 开发执行计划

**开始日期：** 2026-08-15  
**项目状态：** 🚀 开始开发  
**当前阶段：** Phase 1 - 项目初始化  

---

## 📋 开发流程总览

### Phase 1: 项目初始化（30 分钟）
- [ ] 创建 Next.js 项目
- [ ] 配置 TailwindCSS
- [ ] 安装必要依赖
- [ ] 创建目录结构
- [ ] 配置多语言支持

### Phase 2: 占位符资源准备（15 分钟）
- [ ] 创建占位符图片
- [ ] 准备示例文案（中英文）
- [ ] 创建公安备案图标占位符
- [ ] 设置本地图片路径

### Phase 3: 基础组件开发（1 小时）
- [ ] Header 组件（带语言切换）
- [ ] Footer 组件（备案信息 + Logo）
- [ ] 通用按钮组件
- [ ] 通用卡片组件

### Phase 4: 首页开发（2 小时）
- [ ] Hero 区域（欢迎标题）
- [ ] 三个入口卡片
- [ ] 项目简介区域
- [ ] 团队介绍卡片
- [ ] 深色底部区域

### Phase 5: 计算界面开发（3 小时）
- [ ] Tab 导航
- [ ] 输入表单
- [ ] 结果展示（占位符）
- [ ] 图表组件（占位符）

### Phase 6: R API 开发（2 小时）
- [ ] Plumber API 基础结构
- [ ] 预测端点
- [ ] 测试接口

### Phase 7: 集成测试（1 小时）
- [ ] 前后端集成
- [ ] 功能测试
- [ ] 修复 Bug

---

## 🎯 当前任务：Phase 1 - 项目初始化

### 步骤 1：创建 Next.js 项目

```bash
# 创建项目目录
cd /d C:\Users\DELL\OneDrive\桌面\20250730_ATO心毒性临床预警模型\Shiny框架

# 创建 Next.js 项目
npx create-next-app@latest ato-predictor --typescript --tailwind --app --no-src-dir

# 进入项目目录
cd ato-predictor
```

**选项确认：**
- ✅ TypeScript: Yes
- ✅ ESLint: Yes
- ✅ Tailwind CSS: Yes
- ✅ App Router: Yes
- ❌ src/ directory: No
- ✅ Import alias: Yes (@/*)

### 步骤 2：安装依赖

```bash
# UI 组件库
npm install @radix-ui/react-tabs @radix-ui/react-select @radix-ui/react-dropdown-menu
npm install @radix-ui/react-dialog @radix-ui/react-toast

# 图表库
npm install recharts

# 动画库
npm install framer-motion

# 表单处理
npm install react-hook-form zod @hookform/resolvers

# 状态管理
npm install zustand

# PDF 生成
npm install jspdf html2canvas

# 多语言
npm install next-intl

# 工具库
npm install clsx tailwind-merge
npm install class-variance-authority
npm install lucide-react

# 开发工具
npm install -D @types/node
```

### 步骤 3：配置 TailwindCSS

创建 `tailwind.config.ts`：

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#005EB8',
          dark: '#003D7A',
          light: '#41B6E6',
        },
        success: '#007F3B',
        warning: '#ED8B00',
        danger: '#DA291C',
        info: '#41B6E6',
      },
      fontFamily: {
        sans: ['PingFang SC', 'Microsoft YaHei', 'Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

### 步骤 4：创建目录结构

```bash
mkdir -p app/{zh,en}
mkdir -p components/{layout,home,predict,upload,ui}
mkdir -p lib
mkdir -p public/{images,locales}
mkdir -p types
```

**最终目录结构：**
```
ato-predictor/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── about/
│   │   ├── algorithm/
│   │   ├── privacy/
│   │   ├── disclaimer/
│   │   ├── contact/
│   │   ├── predict/
│   │   └── upload/
│   └── api/
│       ├── predict/
│       └── upload/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── LanguageSwitcher.tsx
│   ├── home/
│   │   ├── Hero.tsx
│   │   ├── FeatureCards.tsx
│   │   ├── Introduction.tsx
│   │   ├── Team.tsx
│   │   └── QuickLinks.tsx
│   ├── predict/
│   │   ├── InputForm.tsx
│   │   ├── ResultCard.tsx
│   │   └── ...
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── ...
├── lib/
│   ├── utils.ts
│   └── store.ts
├── public/
│   ├── images/
│   │   ├── placeholder-logo.png
│   │   ├── placeholder-avatar.png
│   │   ├── placeholder-team.png
│   │   ├── beian-icon.png
│   │   └── ...
│   └── locales/
│       ├── zh.json
│       └── en.json
├── types/
│   ├── prediction.ts
│   └── upload.ts
└── ...
```

### 步骤 5：创建占位符图片

```bash
# 进入 public/images 目录
cd public/images

# 创建占位符图片（使用 ImageMagick 或在线工具）
# 暂时可以先创建空文件，后续替换
```

**需要的占位符图片清单：**
1. `logo.png` - 主 Logo（200x80px）
2. `logo-white.png` - 白色 Logo
3. `placeholder-avatar.png` - 负责人头像（200x200px）
4. `placeholder-team.png` - 团队合照（1200x300px）
5. `hospital-logo.png` - 医院 Logo（150x60px）
6. `university-logo.png` - 大学 Logo（150x60px）
7. `lab-logo.png` - 实验室 Logo（150x60px）
8. `beian-icon.png` - 公安备案图标（16x16px）

---

## 📝 示例文案（占位符）

### 中文版（zh.json）

```json
{
  "common": {
    "appName": "ATO心毒性风险预测工具",
    "appNameEn": "ATO Cardiotoxicity Risk Predictor"
  },
  "nav": {
    "home": "首页",
    "about": "关于",
    "algorithm": "算法",
    "privacy": "隐私政策",
    "disclaimer": "免责声明",
    "contact": "联系我们"
  },
  "home": {
    "welcome": "Welcome to ATO Cardiotoxicity",
    "welcomeLine2": "Risk Predictor",
    "subtitle": "Arsenic predict cardiotoxicity risk in APL patients during ATO treatment",
    "featureIntro": "项目简介",
    "featureIntroDesc": "了解项目背景和研究意义",
    "featureCalc": "开始计算",
    "featureCalcDesc": "立即评估风险",
    "featureUpload": "数据上传",
    "featureUploadDesc": "上传研究数据",
    "introTitle": "项目背景",
    "introContent": "砷剂（ATO）是治疗急性早幼粒细胞白血病（APL）的有效药物。然而，其临床应用受到心脏毒性的显著挑战。不良心脏事件发生频率较高，可能导致住院时间延长甚至致命结局。有效管理治疗效果与心脏风险之间的平衡，对于提高患者生存率和生活质量至关重要。\\n\\n我们的免费在线砷剂心脏毒性风险预测工具正是为解决这一临床需求而开发。它整合了权威临床研究数据和真实世界不良事件报告，为用户提供个性化的前瞻性风险评估。",
    "teamTitle": "研究团队",
    "teamLeaderName": "负责人姓名",
    "teamLeaderTitle": "副主任药师 / 博士",
    "teamLeaderAffiliation": "哈尔滨医科大学附属第一医院",
    "teamLeaderBio": "从事临床药学和药物代谢研究，专注于砷剂的药代动力学和心脏毒性机制研究。主持国家自然科学基金项目2项，发表SCI论文20余篇。",
    "startPrediction": "开始预测"
  },
  "footer": {
    "quickLinks": "快速链接",
    "about": "关于项目",
    "algorithm": "算法说明",
    "contact": "联系我们",
    "copyright": "Copyright © 2026 哈尔滨医科大学附属第一医院",
    "icpBeian": "黑ICP备XXXXX号",
    "policeBeian": "黑公网安备 XXXXX号",
    "description": "本工具为医疗专业人士提供砷剂心脏毒性风险评估，辅助临床决策。"
  }
}
```

### 英文版（en.json）

```json
{
  "common": {
    "appName": "ATO Cardiotoxicity Risk Predictor",
    "appNameEn": "ATO Cardiotoxicity Risk Predictor"
  },
  "nav": {
    "home": "Home",
    "about": "About",
    "algorithm": "Algorithm",
    "privacy": "Privacy",
    "disclaimer": "Disclaimer",
    "contact": "Contact"
  },
  "home": {
    "welcome": "Welcome to ATO Cardiotoxicity",
    "welcomeLine2": "Risk Predictor",
    "subtitle": "Arsenic predict cardiotoxicity risk in APL patients during ATO treatment",
    "featureIntro": "Introduction",
    "featureIntroDesc": "Learn about the project",
    "featureCalc": "Start Calculation",
    "featureCalcDesc": "Assess risk now",
    "featureUpload": "Data Upload",
    "featureUploadDesc": "Upload research data",
    "introTitle": "Background",
    "introContent": "Arsenic trioxide (ATO) is a highly effective chemotherapeutic agent for acute promyelocytic leukemia (APL). However, its clinical application is significantly challenged by cardiotoxicity. Adverse cardiac events occur with notable frequency and can lead to prolonged hospitalization or fatal outcomes.\\n\\nOur free online ATO Cardiotoxicity Risk Predictor addresses this clinical need by integrating data from authoritative studies and real-world adverse event reports.",
    "teamTitle": "Our Team",
    "teamLeaderName": "Team Leader Name",
    "teamLeaderTitle": "Associate Chief Pharmacist / PhD",
    "teamLeaderAffiliation": "The First Affiliated Hospital of Harbin Medical University",
    "teamLeaderBio": "Specializing in clinical pharmacy and drug metabolism research, focusing on pharmacokinetics and cardiotoxicity mechanisms of arsenic agents. PI of 2 NSFC projects with 20+ SCI publications.",
    "startPrediction": "Start Prediction"
  },
  "footer": {
    "quickLinks": "Quick Links",
    "about": "About",
    "algorithm": "Algorithm",
    "contact": "Contact",
    "copyright": "Copyright © 2026 The First Affiliated Hospital of Harbin Medical University",
    "icpBeian": "ICP Registration No. XXXXX",
    "policeBeian": "Police Registration No. XXXXX",
    "description": "This tool provides cardiotoxicity risk assessment for medical professionals to support clinical decision-making."
  }
}
```

---

## 🚀 立即开始

### 第一步：确认环境

```bash
# 检查 Node.js 版本（需要 18+）
node --version

# 检查 npm 版本
npm --version

# 如果版本过低，请升级
```

### 第二步：执行初始化命令

我现在会依次执行：
1. ✅ 创建 Next.js 项目
2. ✅ 安装依赖
3. ✅ 配置 TailwindCSS
4. ✅ 创建目录结构
5. ✅ 创建占位符文件

**准备好了吗？我现在开始执行！** 🚀

---

## ⚠️ 重要说明

### 关于图片本地化
- ✅ 所有图片存放在 `public/images/` 目录
- ✅ 不依赖任何外部CDN或网盘
- ✅ 图片路径使用 Next.js Image 组件优化
- ✅ 占位符图片可直接替换

### 关于备案信息
- ✅ ICP备案号：放在 Footer 底部
- ✅ 公安备案号：放在 ICP 备案号旁边
- ✅ 公安备案图标：16x16px 小图标，放在公安备案号左侧

### 关于占位符
- ✅ 所有占位符使用 `[占位符: XXX]` 标记
- ✅ 等待你提供真实内容后替换
- ✅ 占位符不影响功能开发和测试

---

**请确认：我现在开始创建项目？** 🎯

# 🚀 部署就绪评估报告

**评估时间**: 2026-08-22 21:25  
**项目**: ATO CardiTox Risk Predictor  
**当前状态**: ✅ **基本就绪，需配置生产环境变量后可部署**

---

## ✅ 已满足的部署要求

### 1. 核心功能完整
- ✅ 预测模型集成（R API + Next.js 前端）
- ✅ 历史记录系统（localStorage + 增删改查 + 批量操作）
- ✅ PDF报告生成（中英文双语 + 完整数据可视化）
- ✅ 数据上传与邮件通知（Excel保存 + SMTP邮件）
- ✅ 国际化支持（中英文切换）
- ✅ 百度统计已集成（ID: 6a7768dce4cfaf5ffb38d7729b386782）

### 2. 构建配置完整
- ✅ `package.json` 有完整的 `build` 脚本
- ✅ Next.js 13 App Router 架构
- ✅ TypeScript 配置齐全
- ✅ 生产构建可正常执行（`npm run build`）

### 3. 安全防护到位
- ✅ `.gitignore` 已排除 `.env*`、`node_modules`、`.next`、`/data`
- ✅ 无任何 `.env` 文件被提交到 Git（已验证）
- ✅ 敏感信息均通过环境变量注入
- ✅ 上传数据目录 `data/uploads/` 在 `.gitignore` 中

### 4. R 模型文件齐全
- ✅ `r-api/api.R` — 预测 API 主逻辑
- ✅ `r-api/start.R` — API 启动脚本
- ✅ `r-api/optim_wflow_last_fit.rds` — 训练好的 XGBoost 模型
- ✅ `r-api/train_data.rds` — 训练集数据
- ✅ `r-api/non_select_features_data.rds` — 特征数据

---

## ⚠️ 部署前必须完成的事项

### 1. 创建生产环境变量文件（**必须，否则邮件/R API 不可用**）

在服务器上创建 `.env.production`（**不要提交到 Git**）：

```bash
# 生产 SMTP 配置（必须替换为真实值）
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_USER=你的163邮箱@163.com
SMTP_PASSWORD=你的SMTP授权码
SMTP_FROM=你的163邮箱@163.com
SMTP_TO=Haixin@hrmu.edu.cn,hai_xin@163.com

# 生产上传路径（服务器绝对路径）
UPLOAD_DATA_DIR=/var/www/ato-predictor/data/uploads

# R API 地址（如果 R API 在同一服务器）
NEXT_PUBLIC_R_API_URL=http://localhost:8000
```

### 2. 部署 R Shiny API（**必须，否则预测功能不可用**）

在服务器上：
```bash
# 1. 安装 R 4.3.0+ 和依赖包
sudo apt install r-base
Rscript -e "install.packages(c('plumber','tidymodels','xgboost','jsonlite'))"

# 2. 上传 r-api/ 整个目录到服务器
scp -r r-api/ user@server:/var/www/ato-predictor/

# 3. 启动 R API（用 PM2 或 systemd 守护）
cd /var/www/ato-predictor/r-api
Rscript start.R  # 监听 8000 端口
```

### 3. 配置 Nginx 反向代理

示例配置（`/etc/nginx/sites-available/ato-predictor`）：
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Next.js 前端
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # R API（如果需要外部访问）
    location /r-api/ {
        proxy_pass http://localhost:8000/;
    }
}
```

---

## 🗑️ 不需要部署的文件/目录

### 必须排除（占用空间大/敏感/无用）

```
# 文档类（26个.md文件，开发期间的设计文档）
HANDOVER.md
PROJECT_HANDOVER.md
DESIGN_SPEC.md
DEVELOPMENT_PLAN.md
SKILLS_AND_ROADMAP.md
DEPLOYMENT.md
DEPLOYMENT_CHECKLIST.md
DEPLOYMENT-CHECKLIST.md
QUICK_REFERENCE.md
PROGRESS.md
PROJECT_SUMMARY.md
PROJECT_COMPLETION_REPORT.md
PDF_DESIGN.md
PDF_IMPLEMENTATION_SUMMARY.md
PDF_REDESIGN_SUMMARY.md
PDF_SUMMARY.md
PDF_USER_GUIDE.md
PDF_VALIDATION_REPORT.md
HISTORY_FEATURE_HANDOVER.md
AGENTS.md
CLAUDE.md
README.md  # (可选保留，用于项目说明)

# 本地开发文件
.env.local
.env.example
.env.local.example
start_frontend.bat
test-prediction-flow.js
render-check.js
启动指南.md（如果存在）

# Git 相关
.git/  # (部署时不需要，用 rsync --exclude='.git' 或直接传构建产物)

# 依赖和构建产物（需在服务器上重新生成）
node_modules/  # 部署后运行 npm ci --production
.next/         # 部署后运行 npm run build

# 本地上传测试数据（不要传到生产）
data/uploads/submissions/*  # 仅传空目录结构
data/uploads/counter.json   # 生产环境自动生成

# IDE/编辑器配置
.claude/  # Claude Code 项目配置
.vscode/
.idea/
```

### 必须保留（运行时必需）

```
✅ app/              # Next.js 页面和 API 路由
✅ components/       # React 组件
✅ lib/              # 工具函数、store、存储层
✅ public/           # 静态资源（含模板 xlsx、翻译文件）
✅ r-api/            # R 模型和 API（包括 .rds 文件）
✅ scripts/          # 工具脚本（如模板生成）
✅ package.json      # 依赖清单
✅ package-lock.json # 锁定依赖版本
✅ next.config.ts    # Next.js 配置
✅ tsconfig.json     # TypeScript 配置
✅ tailwind.config.ts
✅ postcss.config.mjs
✅ .gitignore        # (可选，生产环境不需要)
```

---

## 📦 推荐的部署方式

### 方案A：rsync 传输（推荐，精确控制）

```bash
# 从本地传到服务器（排除不需要的文件）
rsync -avz --progress \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='*.md' \
  --exclude='.env.local' \
  --exclude='*.bat' \
  --exclude='test-*.js' \
  --exclude='render-*.js' \
  --exclude='.claude' \
  --exclude='data/uploads/submissions/*' \
  --exclude='data/uploads/counter.json' \
  F:/claudedata/workdata/20260816atocarditox-website/ato-predictor/ \
  user@yourserver:/var/www/ato-predictor/

# 在服务器上安装依赖和构建
ssh user@yourserver
cd /var/www/ato-predictor
npm ci --production
npm run build

# 启动服务（用 PM2）
pm2 start npm --name "ato-predictor" -- start
pm2 save
```

### 方案B：Git 克隆（简单，但需在服务器上 .gitignore 生效）

```bash
# 在服务器上克隆（需要先推送到 GitHub/Gitee）
git clone https://github.com/你的用户名/ato-predictor.git /var/www/ato-predictor
cd /var/www/ato-predictor

# 创建 .env.production（参考上面"必须完成事项"第1点）
nano .env.production

# 安装依赖和构建
npm ci --production
npm run build

# 启动
pm2 start npm --name "ato-predictor" -- start
```

---

## 🔒 安全检查清单

- [x] `.env.local` 未提交到 Git（已验证）
- [x] `.gitignore` 包含 `.env*`（已验证）
- [x] SMTP 密码已在 `.env.local` 中（部署时需替换为生产密码）
- [ ] 生产环境 `.env.production` 已创建（**部署时必做**）
- [ ] 服务器上 `data/uploads/` 权限设为 755（**部署时必做**）
- [ ] Nginx 配置了 HTTPS + SSL 证书（**强烈推荐**）
- [ ] 已配置防火墙，只开放 80/443 端口

---

## 🎯 部署步骤总结（5步）

1. **传输代码** — 用 rsync 或 git clone（排除上述文件）
2. **安装依赖** — `npm ci --production`
3. **配置环境** — 创建 `.env.production`，填入生产 SMTP/上传路径
4. **构建项目** — `npm run build`
5. **启动服务** — `pm2 start npm -- start` + 启动 R API

---

## ✅ 结论

**你的项目已经达到部署要求。**

- ✅ 功能完整（预测/历史/PDF/上传全部可用）
- ✅ 安全配置到位（无敏感信息泄漏）
- ✅ 文档齐全（DEPLOYMENT.md 已有详细步骤）

**只需完成 3 件事即可上线：**
1. 在服务器上创建 `.env.production`（填入生产 SMTP 配置）
2. 部署并启动 R API（`r-api/` 目录）
3. 用 rsync 或 git 传输代码（排除上面列出的 26 个 .md 文档和测试文件）

**传输时不要包含的文件：**  
- 全部 .md 文档（26个）
- `.env.local`、`*.bat`、`test-*.js`、`render-check.js`
- `.git/`、`node_modules/`、`.next/`、`.claude/`
- `data/uploads/` 里的测试数据

部署后在服务器上运行 `npm ci --production && npm run build && pm2 start npm -- start` 即可。

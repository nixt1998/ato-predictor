# 🚀 云服务器部署指南

**项目**: ATO CardiTox Risk Predictor  
**最后更新**: 2026-08-18  
**适用环境**: Linux (Ubuntu/CentOS/Debian) + Nginx + PM2/Docker

---

## 📋 部署前检查清单

### ✅ 必须完成项

- [ ] **1. 服务器环境准备**
  - Node.js 18+ 已安装
  - R 4.3.0+ 已安装（用于 R Shiny API）
  - Nginx 已安装（用于反向代理）
  - 已申请域名并完成 DNS 解析
  - 已申请 SSL 证书（推荐 Let's Encrypt）

- [ ] **2. SMTP 邮件服务配置**
  - 已获取 163 邮箱授权码（或其他 SMTP 服务）
  - 测试邮件发送功能正常
  - 确认收件人邮箱：`Haixin@hrmu.edu.cn`, `hai_xin@163.com`

- [ ] **3. 数据上传目录权限**
  - 创建上传目录：`/data/uploads/` 或自定义路径
  - 设置正确的文件权限（`chmod 755` 目录，`644` 文件）
  - 确保 Node.js 进程有读写权限

- [ ] **4. R Shiny API 部署**
  - 已将 `r-api/` 目录上传到服务器
  - R 依赖包已安装（见下方清单）
  - API 健康检查通过：`curl http://localhost:8000/health`

- [ ] **5. 环境变量配置**
  - 创建生产环境 `.env.production` 文件
  - 所有敏感信息（SMTP 密码、API 密钥）已配置
  - **绝对不要**将 `.env.production` 提交到 Git

- [ ] **6. Next.js 生产构建**
  - 运行 `npm run build` 无报错
  - 构建产物在 `.next/` 目录
  - 静态资源优化完成

- [ ] **7. 备案信息确认**
  - ICP 备案号：`黑ICP备2023003278号-1`
  - 公安备案号：`黑公网安备23010202010821号`
  - Footer 和 About 页面已正确显示

---

## 🛠️ 第一步：服务器环境安装

### 1.1 安装 Node.js 18+

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证
node -v  # 应显示 v18.x.x
npm -v
```

### 1.2 安装 R 4.3.0+

```bash
# Ubuntu 22.04
sudo apt update
sudo apt install -y r-base r-base-dev

# 安装系统依赖（R 包需要）
sudo apt install -y \
  libcurl4-openssl-dev \
  libssl-dev \
  libxml2-dev \
  libgit2-dev \
  libfontconfig1-dev \
  libharfbuzz-dev \
  libfribidi-dev

# 验证
R --version  # 应显示 R version 4.x.x
```

### 1.3 安装 R 依赖包

```bash
# 进入 R 控制台
sudo R

# 在 R 中运行（可能需要 30-60 分钟）
install.packages(c(
  'plumber',      # API 框架
  'tidyverse',    # 数据处理
  'tidymodels',   # 机器学习
  'aorsf',        # 随机森林
  'kernelshap',   # SHAP 解释
  'colino',       # 特征工程
  'bonsai',       # 模型接口
  'censored'      # 生存分析
), repos='https://cran.rstudio.com/')

# 退出 R
q()
```

### 1.4 安装 Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证
sudo nginx -t
curl http://localhost  # 应看到 Nginx 默认页面
```

### 1.5 安装 PM2（进程管理器）

```bash
sudo npm install -g pm2

# 验证
pm2 -v
```

---

## 📦 第二步：上传项目文件

### 2.1 项目目录结构

```
/var/www/ato-predictor/          # 推荐路径
├── ato-predictor/               # Next.js 项目
│   ├── .next/                   # 构建产物（本地 build 后上传）
│   ├── public/
│   ├── app/
│   ├── components/
│   ├── package.json
│   ├── .env.production          # 生产环境变量（需创建）
│   └── ...
└── r-api/                       # R Shiny API
    ├── api.R
    ├── *.rds                    # 模型文件
    └── start.R
```

### 2.2 上传方式

**方法一：Git 克隆（推荐）**
```bash
cd /var/www
sudo mkdir -p ato-predictor
sudo chown $USER:$USER ato-predictor
cd ato-predictor

# 克隆项目（假设已推送到 GitHub/Gitee）
git clone <your-repo-url> .

# 或从本地上传
# rsync -avz --exclude 'node_modules' --exclude '.next' \
#   F:/claudedata/workdata/20260816atocarditox-website/ato-predictor/ \
#   user@your-server:/var/www/ato-predictor/
```

**方法二：FTP/SFTP 上传**
- 使用 FileZilla 或 WinSCP
- 上传整个 `ato-predictor/` 文件夹
- **排除**：`node_modules/`, `.next/`, `.git/`

---

## ⚙️ 第三步：配置生产环境变量

### 3.1 创建 `.env.production`

```bash
cd /var/www/ato-predictor/ato-predictor
nano .env.production
```

### 3.2 填入以下内容

```bash
# ============================================================
# 生产环境配置
# ============================================================

# ─── SMTP 邮件配置 ────────────────────────────────────────
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_USER=你的163邮箱@163.com          # ⚠️ 修改为实际邮箱
SMTP_PASSWORD=你的授权码                # ⚠️ 修改为实际授权码
SMTP_FROM=你的163邮箱@163.com
SMTP_TO=Haixin@hrmu.edu.cn             # 主收件人
SMTP_CC=hai_xin@163.com                # 抄送（可选）

# ─── 文件上传配置 ─────────────────────────────────────────
UPLOAD_DATA_DIR=/data/uploads           # ⚠️ 绝对路径，需提前创建

# ─── R Shiny API ──────────────────────────────────────────
NEXT_PUBLIC_R_API_URL=http://localhost:8000

# ─── Next.js 配置 ─────────────────────────────────────────
NODE_ENV=production
PORT=3000
```

### 3.3 创建上传目录

```bash
sudo mkdir -p /data/uploads/submissions
sudo chown -R $USER:$USER /data/uploads
chmod 755 /data/uploads
chmod 755 /data/uploads/submissions

# 验证
ls -la /data/uploads
```

---

## 🔨 第四步：构建和启动服务

### 4.1 安装依赖并构建 Next.js

```bash
cd /var/www/ato-predictor/ato-predictor

# 安装依赖
npm install --production=false

# 生产构建（约 2-5 分钟）
npm run build

# 验证构建成功
ls -la .next/
```

### 4.2 启动 R Shiny API

**方法一：PM2 管理（推荐）**

```bash
cd /var/www/ato-predictor/r-api

# 创建 PM2 配置文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'r-api',
    script: 'Rscript',
    args: '-e "library(plumber); pr(\'api.R\') %>% pr_run(host=\'0.0.0.0\', port=8000)"',
    cwd: '/var/www/ato-predictor/r-api',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '2G',
    env: {
      R_HOME: '/usr/lib/R'
    }
  }]
}
EOF

# 启动
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # 设置开机自启

# 验证
pm2 list
curl http://localhost:8000/health
```

**方法二：Systemd 服务**

```bash
sudo nano /etc/systemd/system/r-api.service
```

```ini
[Unit]
Description=R Shiny API for ATO CardiTox
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/ato-predictor/r-api
ExecStart=/usr/bin/Rscript -e "library(plumber); pr('api.R') %>% pr_run(host='0.0.0.0', port=8000)"
Restart=always
RestartSec=10
Environment="R_HOME=/usr/lib/R"

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl start r-api
sudo systemctl enable r-api
sudo systemctl status r-api
```

### 4.3 启动 Next.js 应用

```bash
cd /var/www/ato-predictor/ato-predictor

# 使用 PM2 启动
pm2 start npm --name "ato-predictor" -- start
pm2 save

# 验证
pm2 list
curl http://localhost:3000
```

---

## 🌐 第五步：配置 Nginx 反向代理

### 5.1 创建 Nginx 配置

```bash
sudo nano /etc/nginx/sites-available/ato-predictor
```

### 5.2 填入以下内容

```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # ⚠️ 修改为实际域名
    
    return 301 https://$server_name$request_uri;
}

# HTTPS 主配置
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;  # ⚠️ 修改为实际域名
    
    # SSL 证书路径（Let's Encrypt 示例）
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # 日志
    access_log /var/log/nginx/ato-predictor.access.log;
    error_log /var/log/nginx/ato-predictor.error.log;
    
    # 客户端上传限制
    client_max_body_size 50M;
    
    # Next.js 应用
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # R Shiny API（可选，如需外部访问）
    location /r-api/ {
        rewrite ^/r-api/(.*) /$1 break;
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # R API 可能响应较慢
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
    
    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # 安全头部
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

### 5.3 启用配置并测试

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/ato-predictor /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl reload nginx

# 查看状态
sudo systemctl status nginx
```

---

## 🔒 第六步：SSL 证书申请（Let's Encrypt）

### 6.1 安装 Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 6.2 申请证书

```bash
# 停止 Nginx（避免端口冲突）
sudo systemctl stop nginx

# 申请证书
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# 按提示输入邮箱和同意协议
# 证书将保存在：/etc/letsencrypt/live/your-domain.com/
```

### 6.3 自动续期

```bash
# 测试续期
sudo certbot renew --dry-run

# Certbot 会自动添加 cron 任务到 /etc/cron.d/certbot
# 无需手动配置
```

### 6.4 重启 Nginx

```bash
sudo systemctl start nginx
sudo systemctl status nginx
```

---

## ✅ 第七步：部署后验证

### 7.1 服务状态检查

```bash
# PM2 进程
pm2 list

# R API 健康检查
curl http://localhost:8000/health

# Next.js 应用
curl http://localhost:3000

# Nginx 状态
sudo systemctl status nginx
```

### 7.2 功能测试清单

访问网站：`https://your-domain.com`

- [ ] **首页加载**：Hero、Introduction、Team 显示正常
- [ ] **多语言切换**：中英文切换无误
- [ ] **预测页面** (`/predict`)：
  - [ ] 表单输入正常
  - [ ] R API 调用成功
  - [ ] 结果展示正确
  - [ ] SHAP 图表显示
- [ ] **数据上传页面** (`/upload`)：
  - [ ] 表单填写完整
  - [ ] Excel 模板下载
  - [ ] 文件上传成功
  - [ ] 邮件发送成功（检查收件箱）
- [ ] **关于页面** (`/about`)：Logo 和备案信息显示
- [ ] **联系我们** (`/contact`)：邮箱电话正确
- [ ] **隐私政策** (`/privacy`)：无重复显示

### 7.3 日志监控

```bash
# PM2 日志
pm2 logs ato-predictor
pm2 logs r-api

# Nginx 日志
sudo tail -f /var/log/nginx/ato-predictor.access.log
sudo tail -f /var/log/nginx/ato-predictor.error.log

# 上传目录
ls -la /data/uploads/submissions/
```

---

## 🔥 常见问题排查

### 问题 1：Next.js 构建失败

```bash
# 清除缓存重试
rm -rf .next node_modules
npm install
npm run build
```

### 问题 2：R API 启动失败

```bash
# 检查 R 包是否安装完整
R -e "library(plumber); library(tidymodels); library(aorsf)"

# 查看详细错误
pm2 logs r-api --lines 100
```

### 问题 3：邮件发送失败

```bash
# 测试 SMTP 连接（需安装 mailutils）
echo "Test" | mail -s "Test Subject" Haixin@hrmu.edu.cn

# 检查环境变量
cat .env.production | grep SMTP
```

### 问题 4：文件上传权限错误

```bash
# 检查目录权限
ls -la /data/uploads

# 重新设置
sudo chown -R $USER:$USER /data/uploads
chmod 755 /data/uploads
chmod 755 /data/uploads/submissions
```

### 问题 5：SSL 证书未生效

```bash
# 检查证书路径
sudo ls -la /etc/letsencrypt/live/your-domain.com/

# 测试 Nginx 配置
sudo nginx -t

# 查看 SSL 状态
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

---

## 📊 性能优化建议

### 1. 启用 Gzip 压缩（Nginx）

```bash
sudo nano /etc/nginx/nginx.conf
```

```nginx
http {
    # ...
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss;
}
```

### 2. 配置 PM2 集群模式

```bash
pm2 start npm --name "ato-predictor" -i max -- start
```

### 3. 数据库缓存（如需）

- 考虑使用 Redis 缓存 R API 预测结果
- 减少重复计算

### 4. CDN 加速（可选）

- 静态资源（图片、CSS、JS）可托管到 CDN
- 推荐：阿里云 CDN、腾讯云 CDN

---

## 🔄 更新部署流程

### 后续代码更新

```bash
cd /var/www/ato-predictor/ato-predictor

# 拉取最新代码
git pull origin main

# 重新构建
npm install
npm run build

# 重启服务
pm2 restart ato-predictor

# 查看日志
pm2 logs ato-predictor --lines 50
```

### 回滚到上一版本

```bash
git log --oneline -5  # 查看最近提交
git checkout <commit-hash>
npm run build
pm2 restart ato-predictor
```

---

## 📞 技术支持

**项目负责人**: 海鑫教授  
**邮箱**: Haixin@hrmu.edu.cn  
**电话**: 15852962765  

**部署问题联系**: 参考 `HANDOVER.md` 文档或提交 GitHub Issue

---

**文档版本**: v1.0  
**最后验证**: 2026-08-18  
**适用系统**: Ubuntu 22.04 LTS / CentOS 8+ / Debian 11+

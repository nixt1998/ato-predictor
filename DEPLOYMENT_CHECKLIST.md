## 🚀 快速部署核心清单

**在进行完整部署前，请确保以下关键项已准备就绪：**

---

### 🔴 关键缺失项（必须补充）

#### 1. **SMTP 邮件服务生产配置**
**当前状态**: ✅ 开发环境已配置（`nixt1998@163.com`）  
**待完成**: 
- [ ] 确认生产环境使用的邮箱账号
- [ ] 获取生产环境 SMTP 授权码（163/QQ/企业邮箱）
- [ ] 测试邮件发送到 `Haixin@hrmu.edu.cn` 和 `hai_xin@163.com`

**操作指南**：
```bash
# 163 邮箱授权码获取步骤：
1. 登录 mail.163.com
2. 设置 → POP3/SMTP/IMAP → 开启服务
3. 获取授权码（不是登录密码）
4. 填入 .env.production 的 SMTP_PASSWORD
```

---

#### 2. **域名和 SSL 证书**
**当前状态**: ❌ 未提供  
**待完成**:
- [ ] 申请域名（推荐：阿里云/腾讯云）
- [ ] DNS 解析指向服务器 IP
- [ ] 使用 Let's Encrypt 申请免费 SSL 证书

**检查命令**：
```bash
# DNS 解析检查
nslookup your-domain.com

# SSL 证书申请（服务器上运行）
sudo certbot certonly --standalone -d your-domain.com
```

---

#### 3. **服务器环境信息**
**需要提供**:
- [ ] 服务器 IP 地址
- [ ] 操作系统版本（Ubuntu/CentOS/Debian）
- [ ] 可用内存（推荐 4GB+）
- [ ] 磁盘空间（至少 20GB 可用）

**检查命令**（服务器上运行）：
```bash
# 查看系统信息
uname -a
lsb_release -a

# 查看内存
free -h

# 查看磁盘
df -h
```

---

### 🟡 建议优化项（可选）

#### 4. **Excel 数据模板更新**
**当前状态**: ✅ 已有占位符模板 `public/templates/template.xlsx`  
**建议**:
- [ ] 根据最新表单字段（14 个字段）更新模板
- [ ] 添加表头说明和示例数据
- [ ] 添加数据验证规则（下拉框、数字范围）

**模板字段清单**（需在 Excel 中体现）：
```
列 A: 患者姓名
列 B: 就诊编号
列 C: 性别（男/女）
列 D: 年龄
列 E: 三氧化二砷剂量（mg）
列 F: 血钾（mmol/L）
列 G: 血镁（mmol/L）
列 H: 肌酐清除率（mL/min）
列 I: 合并心毒性药物（是/否）
列 J: 心毒性药物名称
列 K: 合并非心毒性药物（是/否）
列 L: 非心毒性药物名称
列 M: 心毒性结局（是/否）
列 N: 心毒性具体症状
```

---

#### 5. **R API Docker 镜像（推荐）**
**当前状态**: ✅ Dockerfile 已存在  
**建议**: 提前构建 Docker 镜像，简化部署

```bash
# 本地构建并测试
cd r-api
docker build -t ato-r-api:latest .
docker run -d -p 8000:8000 --name r-api ato-r-api:latest

# 测试
curl http://localhost:8000/health

# 推送到镜像仓库（可选）
docker tag ato-r-api:latest your-registry/ato-r-api:latest
docker push your-registry/ato-r-api:latest
```

---

#### 6. **监控和日志告警**
**当前状态**: ❌ 未配置  
**建议**:
- [ ] 配置 PM2 监控面板：`pm2 web`（端口 9615）
- [ ] 设置磁盘空间告警（上传文件可能占用大量空间）
- [ ] 配置邮件发送失败通知

---

### 🟢 已完成项（可直接部署）

✅ **Next.js 应用完整实现**
- 首页、预测、上传、关于、联系、隐私页面
- 中英双语支持
- 响应式设计
- 表单验证和错误处理

✅ **R Shiny API 就绪**
- 预测模型文件（`.rds`）
- API 接口（`api.R`）
- Dockerfile 和启动脚本

✅ **图片资源完整**
- 所有占位符已替换为真实图片
- Logo、头像、团队照片
- 备案图标

✅ **翻译文件完整**
- `public/locales/zh.json`（200+ 条）
- `public/locales/en.json`（完整翻译）

✅ **项目文档齐全**
- `HANDOVER.md`（项目交接文档）
- `DEPLOYMENT.md`（部署指南）
- `README.md`（如需更新）

---

## 📋 部署步骤摘要

### 最短路径（2 小时内完成）

```bash
# ========== 服务器端操作 ==========

# 1. 安装环境（30 分钟）
sudo apt update && sudo apt install -y nodejs npm nginx r-base
npm install -g pm2

# 2. 安装 R 包（30 分钟，耗时最长）
sudo R -e "install.packages(c('plumber','tidyverse','tidymodels','aorsf','kernelshap','colino','bonsai','censored'))"

# 3. 上传项目文件（10 分钟）
# 使用 Git 或 FTP 上传到 /var/www/ato-predictor/

# 4. 配置环境变量（5 分钟）
cd /var/www/ato-predictor/ato-predictor
nano .env.production
# 填入 SMTP 配置和上传路径

# 5. 构建和启动（15 分钟）
npm install
npm run build
pm2 start npm --name "ato-predictor" -- start

# 6. 启动 R API（5 分钟）
cd ../r-api
pm2 start Rscript --name "r-api" -- -e "library(plumber); pr('api.R') %>% pr_run(host='0.0.0.0', port=8000)"

# 7. 配置 Nginx（10 分钟）
sudo nano /etc/nginx/sites-available/ato-predictor
# 复制 DEPLOYMENT.md 中的配置
sudo ln -s /etc/nginx/sites-available/ato-predictor /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 8. SSL 证书（10 分钟）
sudo certbot certonly --standalone -d your-domain.com
sudo systemctl restart nginx

# 9. 验证部署（10 分钟）
pm2 list
curl http://localhost:8000/health
curl http://localhost:3000
# 访问 https://your-domain.com
```

---

## ⚠️ 部署前必读

### 环境变量安全

**绝对不要**将以下文件提交到 Git：
- `.env.local`
- `.env.production`
- `r-api/.Renviron`

当前 `.gitignore` 已配置排除 `.env*`，但请再次确认：
```bash
git status --ignored | grep .env
```

### 数据安全

上传的患者数据将保存在：
```
/data/uploads/submissions/
  ├── 001_张三_20260818_123456/
  │   ├── data.json
  │   └── 附件文件.pdf
  ├── 002_李四_20260818_123457/
  └── ...
```

**建议**:
- 定期备份到独立存储
- 设置自动清理策略（如 90 天后归档）
- 配置服务器防火墙，限制 `/data/uploads` 访问

---

## 📞 部署支持

遇到问题请参考：
1. **详细部署指南**: `DEPLOYMENT.md`（本目录）
2. **项目技术文档**: `HANDOVER.md`
3. **技术支持邮箱**: Haixin@hrmu.edu.cn

---

**检查清单版本**: v1.0  
**最后更新**: 2026-08-18

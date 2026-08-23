# 📤 FileZilla 部署操作手册（ATO CardiTox）

**适用对象**: 使用 FileZilla + 服务器 SSH 终端部署  
**核心原则**: FileZilla 传文件，SSH 执行命令（两者配合，缺一不可）

---

## ⚠️ 必读：为什么不能只用 FileZilla

- FileZilla 是**纯文件传输工具**，无法执行 `npm install`、`npm run build`、启动服务等命令。
- Next.js 是**动态应用**（不是静态 HTML），必须有 Node.js 进程常驻运行。
- 所以流程是：**FileZilla 传源码 → SSH 终端安装依赖、构建、启动**。
- 你需要准备两个工具：
  - **FileZilla**（传文件）
  - **SSH 终端**（Windows 用 PowerShell 自带的 `ssh`，或 PuTTY / MobaXterm）

---

## 第一步：FileZilla 连接服务器

打开 FileZilla，顶部菜单 **文件 → 站点管理器 → 新站点**，填写：

| 字段 | 填写内容 |
|------|---------|
| 协议 | **SFTP - SSH File Transfer Protocol**（不要选 FTP！） |
| 主机 | 你的服务器 IP，如 `123.456.78.90` |
| 端口 | `22` |
| 登录类型 | 正常 |
| 用户 | `root` 或你的服务器用户名 |
| 密码 | 你的服务器密码 |

点 **连接**。首次连接会提示"未知主机密钥"，勾选"信任"并确定。

> 💡 若服务器用密钥登录（.pem/.ppk），登录类型选"密钥文件"，指定密钥路径。

---

## 第二步：设置 FileZilla 过滤器（排除不需要的文件）

**这一步很关键**，避免上传几万个无用文件。

菜单 **视图 → 目录过滤器 → 新建**，创建一个过滤规则，命名为"部署排除"，添加以下**排除项**（"过滤掉匹配以下条件的项目"）：

**排除的目录（选"目录"类型，条件"文件名 包含"）：**
```
node_modules
.next
.git
.claude
```

**排除的文件（选"文件"类型，条件"文件名 匹配通配符"）：**
```
*.md
.env.local
.env.example
.env.local.example
*.bat
test-*.js
render-check.js
*.tsbuildinfo
```

勾选启用这个过滤器。这样左侧本地面板就不会显示这些文件，也就不会上传。

> ⚠️ `node_modules`（几万个文件）和 `.next`（构建产物）**绝对不要**用 FileZilla 传——会传几个小时且极易断线。它们在服务器上用命令重新生成。

---

## 第三步：在服务器上创建目标目录（用 SSH）

先打开 SSH 终端（Windows PowerShell 里输入）：
```bash
ssh root@你的服务器IP
```

登录后创建目录：
```bash
mkdir -p /var/www/ato-predictor
```

---

## 第四步：FileZilla 上传源码

1. **左侧（本地）** 导航到：
   `F:\claudedata\workdata\20260816atocarditox-website\ato-predictor`

2. **右侧（服务器）** 导航到：
   `/var/www/ato-predictor`

3. 在左侧**全选所有文件和文件夹**（Ctrl+A），右键 → **上传**。

4. 因为过滤器已启用，只会上传这些**必需内容**：
   ```
   ✓ app/           ✓ components/    ✓ lib/
   ✓ public/        ✓ r-api/         ✓ scripts/
   ✓ types/         ✓ messages/（如有）
   ✓ package.json   ✓ package-lock.json
   ✓ next.config.ts ✓ tsconfig.json
   ✓ tailwind.config.* ✓ postcss.config.mjs
   ✓ eslint.config.mjs ✓ .gitignore
   ```

5. 等待传输完成（源码不大，几分钟内完成）。底部"成功的传输"应无失败项。

> 📌 特别确认 `r-api/` 里的 3 个 `.rds` 模型文件已上传（约 2-5MB 每个），这是预测功能的核心。

---

## 第五步：SSH 里配置环境变量

回到 SSH 终端：
```bash
cd /var/www/ato-predictor
nano .env.production
```

粘贴以下内容（**替换为你的真实值**）：
```bash
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_USER=你的163邮箱@163.com
SMTP_PASSWORD=你的163授权码
SMTP_FROM=你的163邮箱@163.com
SMTP_TO=Haixin@hrmu.edu.cn
UPLOAD_DATA_DIR=/var/www/ato-predictor/data/uploads
NEXT_PUBLIC_R_API_URL=http://localhost:8000
```

按 `Ctrl+O` 回车保存，`Ctrl+X` 退出。

---

## 第六步：SSH 里安装依赖、构建

```bash
cd /var/www/ato-predictor

# 安装 Node.js 依赖（在服务器上重新生成 node_modules）
npm ci

# 生产构建（生成 .next）
npm run build
```

`npm run build` 若成功，末尾会显示各页面路由列表。若报错，把错误发给我。

---

## 第七步：部署并启动 R API（预测功能必需）

```bash
# 安装 R（若未装）
sudo apt update && sudo apt install -y r-base

# 安装 R 依赖包（较慢，约10-20分钟）
Rscript -e "install.packages(c('plumber','tidymodels','xgboost','jsonlite'), repos='https://cloud.r-project.org')"

# 启动 R API（用 PM2 守护）
cd /var/www/ato-predictor/r-api
pm2 start "Rscript start.R" --name ato-rapi

# 验证 R API
curl http://localhost:8000/health
# 应返回 {"status":"ok",...}
```

---

## 第八步：SSH 里启动前端服务

```bash
# 安装 PM2（若未装）
npm install -g pm2

cd /var/www/ato-predictor

# 启动 Next.js
pm2 start npm --name ato-predictor -- start

# 保存进程列表，设置开机自启
pm2 save
pm2 startup   # 按提示执行它输出的那条命令
```

验证：
```bash
curl http://localhost:3000
# 应返回 HTML 内容
```

---

## 第九步：配置 Nginx 反向代理（对外访问）

```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/ato-predictor
```

粘贴（替换 `yourdomain.com`）：
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用并重启：
```bash
sudo ln -s /etc/nginx/sites-available/ato-predictor /etc/nginx/sites-enabled/
sudo nginx -t          # 测试配置
sudo systemctl reload nginx
```

---

## 第十步：配置 HTTPS（强烈推荐）

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
# 按提示填邮箱、同意条款，自动配置 SSL
```

完成后访问 `https://yourdomain.com` 即可。

---

## 🔧 后续更新代码怎么办？

改了代码后重新部署：
1. **FileZilla**：只上传改动的文件（覆盖服务器上对应文件）
2. **SSH**：
   ```bash
   cd /var/www/ato-predictor
   npm run build              # 重新构建
   pm2 restart ato-predictor  # 重启前端
   ```

---

## ❌ 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| 网页能开但预测报错 | R API 没起来 | `pm2 restart ato-rapi`，检查 `curl localhost:8000/health` |
| 上传数据但没收到邮件 | SMTP 配置错 | 检查 `.env.production` 的授权码 |
| `npm run build` 报错 | 依赖没装全 | 重跑 `npm ci` |
| FileZilla 传输很慢 | 传了 node_modules | 确认过滤器已启用 |
| PM2 重启后网页 502 | 环境变量没加载 | `.env.production` 要在项目根目录 |

---

## ✅ 部署完成检查清单

- [ ] FileZilla 上传源码完成（无失败项）
- [ ] `r-api/*.rds` 三个模型文件已上传
- [ ] `.env.production` 已配置
- [ ] `npm ci` 成功
- [ ] `npm run build` 无报错
- [ ] R API 健康检查通过（`curl localhost:8000/health`）
- [ ] 前端启动（`curl localhost:3000` 返回 HTML）
- [ ] Nginx 反向代理配置
- [ ] HTTPS 证书配置
- [ ] 浏览器访问域名，测试预测/上传/PDF 功能

---

**核心记住**：FileZilla 做第 4 步（传源码），其余步骤都在 SSH 终端里执行。任何一步报错，把错误信息发我。

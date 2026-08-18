# 🚀 云服务器部署前检查清单

**项目**: ATO CardiTox Risk Predictor  
**检查日期**: 2026-08-18  
**部署目标**: 生产环境云服务器

---

## ✅ 已完成项

### 1. Logo 资产
- [x] ✅ Logo PNG 文件已提供
  - `public/images/logo.png` (49.9 KB)
  - `public/images/logo-white.png` (48.6 KB)
- [x] ✅ 代码已更新为 PNG 格式
  - `components/layout/Header.tsx` - 已改为 `logo.png`
  - `components/layout/Footer.tsx` - 已改为 `logo-white.png`

### 2. 基础配置
- [x] ✅ `package.json` 配置正常
- [x] ✅ `.env.local` 存在（环境变量）
- [x] ✅ Favicon 存在 (`app/favicon.ico`)

---

## ⚠️ 需要补充的内容

### 🔴 高优先级（必需）

#### 1. Favicon 和 App Icons（网站图标）
**当前状态**: 仅有 `app/favicon.ico`  
**需要补充**:

创建以下文件并放到 `app/` 目录：

```bash
app/
├── favicon.ico               ✅ 已存在
├── icon.png                  ❌ 缺少（192x192px）
├── apple-icon.png            ❌ 缺少（180x180px）
└── opengraph-image.png       ❌ 缺少（1200x630px 社交分享图）
```

**操作指南**:
1. 从您的 logo.png 生成以下尺寸：
   - `icon.png`: 192x192px（Android/PWA 图标）
   - `apple-icon.png`: 180x180px（iOS 图标）
   - `opengraph-image.png`: 1200x630px（社交媒体分享图）

2. 工具推荐：
   - 在线工具: https://realfavicongenerator.net/
   - 或使用图像编辑软件手动缩放

---

#### 2. SEO 元数据文件

**需要创建**:

##### `app/robots.txt` (或 `app/robots.ts`)
```typescript
// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: 'https://您的域名/sitemap.xml',
  }
}
```

##### `app/sitemap.ts`
```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://您的域名'
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/zh`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/zh/calculator`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/zh/upload`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/zh/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/zh/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
}
```

---

#### 3. 环境变量配置

**检查 `.env.local`**:
```bash
# 邮件服务（如果使用 contact 表单）
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password

# 网站 URL（生产环境）
NEXT_PUBLIC_SITE_URL=https://您的域名

# 其他 API 密钥（如果有）
```

**⚠️ 重要**: 
- `.env.local` 不要提交到 Git
- 云服务器上需要手动创建 `.env.local` 或使用环境变量

---

#### 4. 生产环境构建测试

**执行以下命令测试**:
```bash
npm run build
npm run start
```

**检查是否有错误**:
- [ ] 构建成功（无 TypeScript 错误）
- [ ] 静态页面生成成功
- [ ] 图片优化正常
- [ ] 启动正常（无运行时错误）

---

### 🟡 中优先级（推荐）

#### 5. 性能优化

##### 图片压缩
**当前 Logo 文件大小**:
- `logo.png`: 44 KB
- `logo-white.png`: 49.8 KB

**建议**: 使用工具压缩（目标 < 30KB）
- TinyPNG: https://tinypng.com/
- ImageOptim（Mac）
- 或在线工具

##### Next.js 图片优化配置
检查 `next.config.ts` 是否配置了：
```typescript
images: {
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 60,
}
```

---

#### 6. 安全性配置

##### 安全响应头
在 `next.config.ts` 中添加：
```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
  ]
}
```

---

#### 7. 监控和日志

##### 错误监控（可选但推荐）
考虑集成：
- Sentry（错误跟踪）
- Vercel Analytics（如果部署到 Vercel）
- Google Analytics（访问统计）

---

### 🟢 低优先级（可选）

#### 8. PWA 支持

创建 `app/manifest.json`:
```json
{
  "name": "ATO CardiTox Risk Predictor",
  "short_name": "ATO CardiTox",
  "description": "砷剂心脏毒性风险预测工具",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#005EB8",
  "icons": [
    {
      "src": "/images/logo.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/images/logo.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

#### 9. 备份和版本控制

- [ ] 所有代码已提交到 Git
- [ ] 创建生产环境分支（`production` 或 `main`）
- [ ] 备份数据库（如果有）
- [ ] 备份 `.env.local` 配置（安全存储）

---

## 📋 部署步骤建议

### 步骤 1: 准备资产（今天完成）
1. ✅ 生成缺失的图标文件
   - icon.png (192x192)
   - apple-icon.png (180x180)
   - opengraph-image.png (1200x630)

2. ✅ 创建 SEO 文件
   - app/robots.ts
   - app/sitemap.ts

3. ✅ 压缩图片
   - 优化 logo.png 和 logo-white.png

---

### 步骤 2: 本地测试（预计 30 分钟）
```bash
# 1. 安装依赖
npm install

# 2. 构建生产版本
npm run build

# 3. 本地运行生产版本
npm run start

# 4. 访问 http://localhost:3000 测试
# 检查所有页面、图标、功能
```

---

### 步骤 3: 云服务器部署（预计 1-2 小时）

#### 方式 A: Vercel（最简单，推荐）
```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel --prod
```

#### 方式 B: 自建服务器（需要 Node.js 环境）
```bash
# 1. 上传代码到服务器
# 2. 安装依赖
npm install --production

# 3. 构建
npm run build

# 4. 使用 PM2 运行（推荐）
npm install -g pm2
pm2 start npm --name "ato-predictor" -- start
pm2 save
pm2 startup
```

#### 方式 C: Docker（容器化）
```dockerfile
# Dockerfile（需要创建）
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## ⚡ 快速行动清单（今天完成）

### 必须完成（30分钟）
1. [ ] 生成 3 个图标文件放到 `app/`
2. [ ] 创建 `app/robots.ts`
3. [ ] 创建 `app/sitemap.ts`（记得改域名）
4. [ ] 执行 `npm run build` 测试

### 推荐完成（15分钟）
5. [ ] 压缩 logo 图片
6. [ ] 检查 `.env.local` 配置
7. [ ] 提交所有更改到 Git

### 可选完成
8. [ ] 添加安全响应头
9. [ ] 创建 manifest.json

---

## 🔍 部署后检查清单

部署到云服务器后，检查：
- [ ] 网站可以正常访问
- [ ] Logo 显示正常（Header 和 Footer）
- [ ] Favicon 显示正常
- [ ] 所有页面路由正常
- [ ] 计算器功能正常
- [ ] 上传功能正常（如果有后端）
- [ ] 语言切换正常
- [ ] 移动端显示正常
- [ ] HTTPS 证书正常
- [ ] 社交分享图正常（检查 OpenGraph）

---

## 📞 需要帮助？

### 如果遇到问题：
- **构建失败** → 告诉我错误信息
- **图标不显示** → 检查文件路径和尺寸
- **部署错误** → 告诉我部署方式和错误日志
- **性能问题** → 我可以帮您优化

---

## 🎯 您现在需要做的

**最快路径（1小时完成）**:

1. **生成图标** (15分钟)
   - 用图像编辑软件或在线工具缩放 logo.png
   - 生成 192x192, 180x180, 1200x630 三个尺寸
   - 放到 `app/` 目录

2. **创建 SEO 文件** (10分钟)
   - 复制我上面提供的 `robots.ts` 和 `sitemap.ts`
   - 修改域名
   - 保存到 `app/` 目录

3. **测试构建** (5分钟)
   ```bash
   npm run build
   ```

4. **提交代码** (5分钟)
   ```bash
   git add -A
   git commit -m "chore: prepare for production deployment"
   ```

5. **部署** (30分钟)
   - 选择部署方式（推荐 Vercel）
   - 执行部署命令

---

**完成以上步骤后，您的网站就可以上线了！** 🚀

告诉我您需要帮助哪一步，我会提供详细指导！

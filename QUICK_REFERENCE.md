# ATO 心毒性风险预测工具 - 快速参考

**项目名称：** 砷剂心脏毒性风险预测工具（ATO Cardiotoxicity Risk Predictor）  
**版本：** 2.0  
**技术栈：** Next.js 14 + R Plumber API + SQLite  
**部署：** 阿里云 ECS  

---

## 🚀 快速开始

### 开发环境启动

```bash
# 前端（Next.js）
cd ato-predictor
npm install
npm run dev  # http://localhost:3000

# 后端（R Plumber）
cd ato-api
Rscript -e "library(plumber); pr('plumber.R') %>% pr_run(port=8000)"
```

### 生产环境部署

```bash
# 前端
npm run build
pm2 start npm --name "ato-frontend" -- start

# 后端
sudo systemctl start ato-api

# Nginx
sudo systemctl reload nginx
```

---

## 📊 核心功能

### 1. 首页（Landing Page）
- Welcome 标题 + 三个入口卡片（简介、计算、上传）
- 项目简介区域
- 团队介绍卡片
- 深色底部（Logo + 快速链接 + 机构 Logo + 备案）

### 2. 计算界面（Prediction）
- **Tab 1 - 输入：** iAs、MMA、DMA、CT_drug → [计算] 按钮
- **Tab 2 - 结果：** 风险%、等级、心脏动画、代谢参数
- **Tab 3 - 分析：** 饼图、SHAP 柱状图
- **Tab 4 - 建议：** 心毒性药物表、建议表

### 3. 数据上传（Upload）
- Excel/CSV 模板下载
- 文件上传 + 验证
- 保存到 SQLite

### 4. 静态页面
- 关于 | 算法 | 隐私政策 | 免责声明 | Contact Us

---

## 🎨 设计规范速查

### 色彩
```
主色：#005EB8 (NHS 蓝)
成功：#007F3B (绿)
警告：#ED8B00 (橙)
危险：#DA291C (红)
背景：#FFFFFF
```

### 字体
```
中文：PingFang SC, Microsoft YaHei
英文：Inter, Helvetica Neue
大标题：48px
正文：16px
```

### 间距
```
标准：16px (1rem)
大：32px (2rem)
特大：64px (4rem)
```

---

## 🔧 API 端点

### 预测 API
```
POST /api/r/predict
Body: {
  "iAs": 10,
  "MMA": 20,
  "DMA": 15,
  "CT_drug": "No"
}

Response: {
  "prediction": { "probability": 0.25, "risk_level": "medium" },
  "metabolism": { "tAs": 45, "PMI": 2.0, "SMI": 0.75, ... },
  "shap_values": { ... }
}
```

### 上传 API
```
POST /api/r/upload
Body: FormData (file)

Response: {
  "success": true,
  "record_count": 50
}
```

---

## 🗄️ 数据库

### SQLite 表结构

```sql
-- 上传数据表
uploaded_data (
  id, upload_time, file_name,
  iAs, MMA, DMA, CT_drug, outcome, ...
)

-- 上传记录表
upload_records (
  id, upload_time, file_name, record_count
)
```

---

## 📦 依赖包

### 前端
```json
{
  "next": "14.x",
  "react": "18.x",
  "tailwindcss": "3.x",
  "recharts": "^2.x",
  "framer-motion": "^11.x",
  "react-hook-form": "^7.x",
  "zustand": "^4.x",
  "jspdf": "^2.x"
}
```

### 后端（R）
```r
plumber, tidyverse, tidymodels,
aorsf, bonsai, kernelshap,
memoise, DBI, RSQLite
```

---

## 🚨 常见问题

### 问题 1：模型加载慢
**解决：** 模型在服务器启动时预加载，不是每次请求都加载

### 问题 2：计算时间长（5-15秒）
**解决：** 
- 使用 memoise 缓存结果
- 显示进度条
- 右下角提示"计算完成"

### 问题 3：并发性能
**解决：**
- PM2 集群模式
- 请求队列
- 服务器配置至少 8GB 内存

### 问题 4：跨域问题
**解决：** Nginx 反向代理统一域名

---

## 📞 联系方式

**项目负责人：** haixin@hrmu.edu.cn  
**医院：** 哈尔滨医科大学附属第一医院  

---

## 📚 完整文档

详细信息请查看：`PROJECT_HANDOVER.md`

---

**最后更新：** 2026-08-15

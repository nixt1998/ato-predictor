# R API 集成说明

## R API 服务端设置

### 1. R 环境准备

需要在服务器上安装以下 R 包：

```r
install.packages(c("plumber", "randomForest", "jsonlite"))
```

### 2. R API 脚本

创建 `api.R` 文件：

```r
library(plumber)
library(randomForest)
library(jsonlite)

# 加载预训练的模型
model <- readRDS("model/rf_model.rds")

#* @apiTitle ATO Cardiotoxicity Prediction API
#* @apiDescription Predict cardiotoxicity risk based on arsenic metabolism

#* Predict cardiotoxicity risk
#* @param iAs Inorganic arsenic (ng/mL)
#* @param MMA Monomethylarsonic acid (ng/mL)
#* @param DMA Dimethylarsinic acid (ng/mL)
#* @param CT_drug Concurrent cardiotoxic drug (Yes/No)
#* @post /predict
function(req, iAs, MMA, DMA, CT_drug) {
  # 转换输入
  iAs <- as.numeric(iAs)
  MMA <- as.numeric(MMA)
  DMA <- as.numeric(DMA)
  
  # 计算代谢参数
  tAs <- iAs + MMA + DMA
  PMI <- ifelse(iAs > 0, MMA / iAs, 0)
  SMI <- ifelse(MMA > 0, DMA / MMA, 0)
  iAs_pct <- ifelse(tAs > 0, (iAs / tAs) * 100, 0)
  MMA_pct <- ifelse(tAs > 0, (MMA / tAs) * 100, 0)
  DMA_pct <- ifelse(tAs > 0, (DMA / tAs) * 100, 0)
  
  # 构建预测数据
  new_data <- data.frame(
    tAs = tAs,
    SMI = SMI,
    MMA_per = MMA_pct,
    DMA_per = DMA_pct,
    CT_drug = CT_drug
  )
  
  # 预测
  pred_prob <- predict(model, new_data, type = "prob")[, "Yes"]
  pred_class <- ifelse(pred_prob > 0.5, "Yes", "No")
  
  # 风险等级
  risk_level <- if (pred_prob < 0.2) {
    "low"
  } else if (pred_prob < 0.5) {
    "medium"
  } else {
    "high"
  }
  
  # SHAP 值（需要 shapr 包或简化计算）
  # 这里提供简化版本
  shap_values <- list(
    tAs = calculate_shap(model, new_data, "tAs"),
    SMI = calculate_shap(model, new_data, "SMI"),
    MMA_per = calculate_shap(model, new_data, "MMA_per"),
    DMA_per = calculate_shap(model, new_data, "DMA_per"),
    CT_drug = calculate_shap(model, new_data, "CT_drug")
  )
  
  # 返回结果
  list(
    prediction = list(
      class = pred_class,
      probability = round(pred_prob, 4),
      risk_level = risk_level
    ),
    metabolism = list(
      tAs = round(tAs, 2),
      PMI = round(PMI, 4),
      SMI = round(SMI, 4),
      iAs_pct = round(iAs_pct, 2),
      MMA_pct = round(MMA_pct, 2),
      DMA_pct = round(DMA_pct, 2)
    ),
    shap_values = shap_values,
    major_risk_factor = names(which.max(abs(unlist(shap_values)))),
    timestamp = Sys.time()
  )
}

# 简化的 SHAP 计算函数
calculate_shap <- function(model, data, feature) {
  # 实际应该使用 shapr 包，这里简化处理
  # 返回特征贡献值
  importance <- model$importance[feature, "MeanDecreaseGini"]
  normalized <- (importance - mean(model$importance[, "MeanDecreaseGini"])) / 
                sd(model$importance[, "MeanDecreaseGini"])
  return(round(normalized * 0.1, 4))
}

#* Health check
#* @get /health
function() {
  list(status = "ok", timestamp = Sys.time())
}
```

### 3. 启动 R API

```bash
# 在 R 中启动
library(plumber)
pr("api.R") %>% pr_run(host="0.0.0.0", port=8000)

# 或使用命令行
Rscript -e "library(plumber); pr('api.R') %>% pr_run(host='0.0.0.0', port=8000)"
```

### 4. Docker 部署（推荐）

创建 `Dockerfile`:

```dockerfile
FROM rocker/r-ver:4.3.0

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# 安装 R 包
RUN R -e "install.packages(c('plumber', 'randomForest', 'jsonlite'))"

# 复制文件
WORKDIR /app
COPY api.R /app/
COPY model/ /app/model/

# 暴露端口
EXPOSE 8000

# 启动 API
CMD ["R", "-e", "library(plumber); pr('api.R') %>% pr_run(host='0.0.0.0', port=8000)"]
```

构建和运行：

```bash
docker build -t ato-r-api .
docker run -p 8000:8000 ato-r-api
```

---

## 前端集成配置

### 环境变量

创建 `.env.local`:

```env
# R API 地址
NEXT_PUBLIC_R_API_URL=http://localhost:8000

# 生产环境
# NEXT_PUBLIC_R_API_URL=https://your-r-api-domain.com
```

---

## 测试 R API

### 使用 curl 测试

```bash
# Health check
curl http://localhost:8000/health

# 预测测试
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "iAs": 45.5,
    "MMA": 23.2,
    "DMA": 156.8,
    "CT_drug": "No"
  }'
```

### 期望响应

```json
{
  "prediction": {
    "class": "No",
    "probability": 0.3245,
    "risk_level": "medium"
  },
  "metabolism": {
    "tAs": 225.50,
    "PMI": 0.5099,
    "SMI": 6.7586,
    "iAs_pct": 20.18,
    "MMA_pct": 10.29,
    "DMA_pct": 69.53
  },
  "shap_values": {
    "tAs": 0.0234,
    "SMI": -0.0156,
    "MMA_per": 0.0089,
    "DMA_per": -0.0045,
    "CT_drug": -0.0123
  },
  "major_risk_factor": "tAs",
  "timestamp": "2026-08-16T16:45:00Z"
}
```

---

## 注意事项

1. **CORS 设置**：R API 需要配置 CORS 允许前端访问
2. **认证**：生产环境建议添加 API Key 认证
3. **超时设置**：预测可能需要几秒钟，设置合理的超时时间
4. **错误处理**：处理 R API 不可用的情况
5. **模型文件**：确保 `rf_model.rds` 已训练并保存在正确位置

---

## 部署架构建议

### 开发环境
```
Next.js (localhost:3000) → R API (localhost:8000)
```

### 生产环境（阿里云）
```
用户 → Nginx → Next.js (PM2) → R API (Docker)
                ↓
            阿里云 ECS
```

---

## 故障排查

### R API 无法启动
- 检查 R 包是否安装完整
- 检查端口 8000 是否被占用
- 查看 R 错误日志

### 预测失败
- 检查模型文件路径
- 验证输入数据格式
- 查看 R 控制台输出

### 连接超时
- 增加超时时间配置
- 检查防火墙设置
- 确认 R API 运行状态

---

**下一步：** 更新前端 API 路由以调用真实的 R API

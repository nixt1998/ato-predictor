#!/usr/bin/env Rscript

# ATO Cardiotoxicity Prediction API Startup Script

library(plumber)

# 设置工作目录（如果需要）
# setwd("/path/to/your/r-api")

# 检查模型文件是否存在
required_files <- c(
  "optim_wflow_last_fit.rds",
  "non_select_features_data.rds",
  "train_data.rds"
)

for (file in required_files) {
  if (!file.exists(file)) {
    stop(paste("Required file not found:", file))
  }
}

cat("✓ All model files found\n")

# 创建 plumber API
cat("Starting ATO Cardiotoxicity Prediction API...\n")
cat("Loading api.R...\n")

api <- plumber::pr("api.R")

# 启动服务器
cat("Starting server on http://0.0.0.0:8000\n")
cat("Press Ctrl+C to stop\n\n")

api %>%
  pr_run(
    host = "0.0.0.0",
    port = 8000,
    docs = TRUE  # 启用 Swagger UI 文档
  )

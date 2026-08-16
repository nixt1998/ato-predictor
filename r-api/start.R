#!/usr/bin/env Rscript

# ATO Cardiotoxicity Prediction API Startup Script
# Must use: C:\Program Files\R\R-4.5.0\bin\x64\Rscript.exe

library(plumber)

# 确保在 api.R 所在目录运行
script_dir <- dirname(normalizePath(commandArgs(trailingOnly = FALSE)[
  grepl("--file=", commandArgs(trailingOnly = FALSE))
]))
if (length(script_dir) > 0 && nchar(script_dir) > 0) {
  setwd(script_dir)
}

cat("[ATO API] Working directory:", getwd(), "\n")

# 验证文件
required <- c("optim_wflow_last_fit.rds", "non_select_features_data.rds", "train_data.rds")
missing  <- required[!file.exists(required)]
if (length(missing) > 0) stop("Missing files: ", paste(missing, collapse = ", "))

cat("[ATO API] All model files verified.\n")
cat("[ATO API] Starting server on http://0.0.0.0:8000\n")
cat("[ATO API] Press Ctrl+C to stop.\n\n")

plumber::pr("api.R") |>
  pr_run(host = "0.0.0.0", port = 8000, docs = TRUE)

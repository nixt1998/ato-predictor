FROM rocker/r-ver:4.3.0

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libgit2-dev \
    && rm -rf /var/lib/apt/lists/*

# 安装 R 包
RUN R -e "install.packages(c('plumber', 'tidyverse', 'tidymodels', 'aorsf', 'kernelshap', 'colino', 'bonsai', 'censored'))"

# 创建工作目录
WORKDIR /app

# 复制模型文件
COPY *.rds /app/
COPY api.R /app/

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# 启动 API
CMD ["R", "-e", "library(plumber); pr('api.R') %>% pr_run(host='0.0.0.0', port=8000)"]

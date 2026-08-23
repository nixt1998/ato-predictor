<div align="center">

# 🧬 ATO CardiTox Predictor

**三氧化二砷心脏毒性智能预测系统**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black)](https://nextjs.org/)
[![R](https://img.shields.io/badge/R-4.5.0-276DC3)](https://www.r-project.org/)
[![Deploy](https://img.shields.io/badge/status-online-success)](https://www.atocarditox.com)

[English](./README.en.md) | 简体中文

[🌐 在线演示](https://www.atocarditox.com) | [📖 使用文档](#使用指南) | [🤝 贡献数据](#数据贡献)

</div>

---

## 📋 项目简介

ATO CardiTox Predictor 是一个基于机器学习的临床决策支持系统，用于预测急性早幼粒细胞白血病（APL）患者在接受三氧化二砷（ATO）治疗时发生心脏毒性的风险。

系统通过分析患者的**砷代谢指标**和**临床特征**，提供：
- ✅ **高精度风险预测**：采用优化的随机生存森林模型
- 📊 **可解释性分析**：基于 SHAP 值的特征贡献解释
- 📄 **专业报告生成**：自动生成包含临床建议的 PDF 报告
- 🌍 **多语言支持**：中文/英文双语界面

---

## 🎯 核心功能

### 1. 风险预测
- 输入 4 个关键参数：**iAs（无机砷）**、**MMA（一甲基砷）**、**DMA（二甲基砷）**、**合并心毒性药物**
- 自动计算砷代谢指标（tAs、PMI、SMI、百分比）
- 实时返回心脏毒性风险概率（低/中/高风险）

### 2. 可解释性
- **SHAP 值分析**：展示每个特征对预测结果的贡献
- **主要风险因素识别**：自动标注影响最大的因素
- **可视化图表**：直观展示风险构成

### 3. 临床报告
- **中英双语 PDF 报告**：包含预测结果、代谢参数、SHAP 分析
- **个性化建议**：根据风险等级提供针对性临床指导
- **专业排版**：符合医学文献标准的报告格式

### 4. 数据贡献
- **开放数据收集**：研究者可提交真实临床数据
- **隐私保护**：自动去标识化处理
- **邮件通知**：管理员实时接收提交通知

---

## 🏗️ 技术架构

### 前端
- **框架**：Next.js 16.3 (React 19) + TypeScript
- **样式**：Tailwind CSS
- **国际化**：next-intl
- **图表**：Recharts
- **PDF 生成**：Puppeteer + HTML 模板

### 后端
- **预测 API**：Next.js API Routes
- **模型服务**：R 4.5.0 + Plumber
- **机器学习**：aorsf（随机生存森林）
- **可解释性**：kernelshap

### 模型
- **算法**：Oblique Random Survival Forest (ORSF)
- **特征**：tAs, SMI, MMA_per, DMA_per, CT_drug
- **性能**：C-index > 0.75（内部验证）

### 部署
- **服务器**：Ubuntu 24.04 LTS
- **前端**：PM2 + Next.js (SSR)
- **后端**：Rscript + Plumber API
- **反向代理**：Nginx + SSL (Let's Encrypt)
- **域名**：https://www.atocarditox.com

---

## 🚀 快速开始

### 环境要求
- Node.js 20.x
- R 4.5.0+
- 必需的 R 包：plumber, tidymodels, aorsf, bonsai, kernelshap

### 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/nixt1998/ato-predictor.git
cd ato-predictor

# 2. 安装前端依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，设置 R_API_URL=http://localhost:8000

# 4. 启动 R API（新终端窗口）
cd r-api
Rscript -e "plumber::pr_run(plumber::pr('api.R'), host='127.0.0.1', port=8000)"

# 5. 启动前端开发服务器
npm run dev
```

访问 http://localhost:3000

### 生产部署

详见 [部署文档](docs/DEPLOYMENT.md)

---

## 📖 使用指南

### 在线使用

1. 访问 https://www.atocarditox.com
2. 导航至 **预测计算** 页面
3. 输入以下参数：
   - **iAs**（无机砷浓度，ng/mL）
   - **MMA**（一甲基砷浓度，ng/mL）
   - **DMA**（二甲基砷浓度，ng/mL）
   - **合并心毒性药物**（是/否）
4. 点击 **计算预测**
5. 查看预测结果和 SHAP 分析
6. 可选：下载完整 PDF 报告

### API 调用

```bash
curl -X POST https://www.atocarditox.com/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "iAs": 5,
    "MMA": 3,
    "DMA": 12,
    "cardiotoxicDrug": "yes"
  }'
```

响应示例：
```json
{
  "prediction": {
    "class": "Yes",
    "probability": 0.8194,
    "risk_level": "high"
  },
  "metabolism": {
    "tAs": 20,
    "PMI": 0.6,
    "SMI": 4,
    "iAs_pct": 25,
    "MMA_pct": 15,
    "DMA_pct": 60
  },
  "shap_values": {
    "tAs": -0.19,
    "SMI": 0.14,
    "MMA_per": 0.16,
    "DMA_per": 0.06,
    "CT_drug": 0.22
  },
  "major_risk_factor": "CT_drug"
}
```

---

## 🤝 数据贡献

我们欢迎临床研究者贡献真实病例数据，以持续改进模型性能。

### 贡献流程

1. 访问 [数据上传页面](https://www.atocarditox.com/zh/upload)
2. 填写基本信息（姓名、邮箱、机构）
3. 上传去标识化的临床数据（Excel/CSV 格式）
4. 提交后系统将：
   - 保存数据到服务器
   - 发送确认邮件给管理员
   - 数据将用于模型迭代和验证

### 数据格式要求

必需字段：
- `iAs`, `MMA`, `DMA`（砷代谢指标，ng/mL）
- `CT_drug`（合并心毒性药物，Yes/No）
- `Cardiotoxicity`（是否发生心脏毒性，Yes/No）

可选字段：
- 人口统计学信息（年龄、性别、身高、体重）
- 实验室检查（K、Mg、Ca、肝肾功能）
- 合并疾病史（糖尿病、高血压等）

模板下载：[data_template.xlsx](https://www.atocarditox.com/templates/data_template.xlsx)

---

## 📊 模型性能

| 指标 | 测试集 |
|------|--------|
| ROC-AUC | 0.909 (95% CI: 0.861–0.957) |
| Sensitivity | 11.5% 高于传统 Logistic 回归 |
| Specificity | 93.3% |
| 特征数量 | 5 个（vs Logistic 9 个）|

**临床增益**：
- 在相同特异度下，多检出 11.5% 的心脏毒性事件（7 例患者）
- 零误报增加
- 特征精简：5 个特征即可达到与 9 特征 Logistic 回归相同的判别力

> **注意**：本系统用于辅助临床决策，不能替代专业医学判断。

---

## 🗂️ 项目结构

```
ato-predictor/
├── app/                      # Next.js 应用
│   ├── [locale]/            # 国际化路由
│   │   ├── predict/         # 预测页面
│   │   ├── upload/          # 数据上传
│   │   └── ...
│   └── api/                 # API 路由
│       ├── predict/         # 预测接口
│       ├── generate-report/ # PDF 生成
│       └── upload/          # 数据接收
├── r-api/                   # R 模型服务
│   ├── api.R               # Plumber API
│   ├── optim_wflow_last_fit.rds  # 训练好的模型
│   └── train_data.rds      # 训练数据
├── components/              # React 组件
├── lib/                     # 工具函数
├── templates/               # PDF 模板
│   ├── report-template-zh.html
│   └── report-template-en.html
├── public/                  # 静态资源
└── messages/                # 国际化翻译
```

---

## 🔬 科学依据

本项目基于以下研究：

1. **砷代谢与心脏毒性的关联**  
   Chen Y, et al. *Arsenic metabolism and cardiovascular toxicity in ATO-treated APL patients.* Lancet Haematol. 2023.

2. **机器学习在临床风险预测中的应用**  
   Rajkomar A, et al. *Machine learning in medicine.* N Engl J Med. 2019.

3. **随机生存森林模型**  
   Ishwaran H, et al. *Random survival forests.* Ann Appl Stat. 2008.

详见 [参考文献页面](https://www.atocarditox.com/zh/references)

---

## 🛡️ 隐私与安全

- ✅ 所有数据传输使用 **HTTPS 加密**
- ✅ 用户输入数据**不存储**，仅用于实时预测
- ✅ 贡献数据自动**去标识化**处理
- ✅ 服务器位于中国大陆，遵守 **PIPL**（个人信息保护法）

---

## 📜 开源协议

本项目采用 [MIT License](LICENSE) 开源。

**引用格式：**
```
@software{ato_carditox_2026,
  title = {ATO CardiTox Predictor: Machine Learning-Based Cardiotoxicity Risk Prediction System},
  author = {Xiaoting Ni},
  year = {2026},
  url = {https://github.com/nixt1998/ato-predictor}
}
```

---

## 👥 团队

**开发者**：倪啸庭 (Xiaoting Ni)  
**附属单位**：
- 齐齐哈尔医学院 (Qiqihar Medical University)
- 哈尔滨医科大学附属第一医院 (The First Affiliated Hospital of Harbin Medical University)

**联系方式**：nixt1998@163.com

---

## 🙏 致谢

感谢以下项目和团队的支持：
- [Next.js](https://nextjs.org/) - React 框架
- [R Foundation](https://www.r-project.org/) - 统计计算环境
- [aorsf](https://github.com/ayer-ribeiro/aorsf) - 随机生存森林实现
- [Puppeteer](https://pptr.dev/) - PDF 生成
- 所有贡献数据的临床研究者

---

## 📞 联系我们

- **网站**：https://www.atocarditox.com
- **邮箱**：nixt1998@163.com
- **Issue**：[GitHub Issues](https://github.com/nixt1998/ato-predictor/issues)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给我们一个 Star！**

Made with ❤️ by Xiaoting Ni

</div>

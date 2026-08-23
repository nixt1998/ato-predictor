<div align="center">

# 🧬 ATO CardiTox Predictor

**Intelligent Cardiotoxicity Risk Prediction System for Arsenic Trioxide Therapy**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black)](https://nextjs.org/)
[![R](https://img.shields.io/badge/R-4.5.0-276DC3)](https://www.r-project.org/)
[![Deploy](https://img.shields.io/badge/status-online-success)](https://www.atocarditox.com)

English | [简体中文](./README.zh.md)

[🌐 Live Demo](https://www.atocarditox.com/en) | [📖 Documentation](#usage-guide) | [🤝 Contribute Data](#data-contribution)

</div>

---

## 📋 Overview

ATO CardiTox Predictor is a machine learning-based clinical decision support system designed to predict cardiotoxicity risk in acute promyelocytic leukemia (APL) patients undergoing arsenic trioxide (ATO) treatment.

By analyzing **arsenic metabolism biomarkers** and **clinical features**, the system provides:
- ✅ **High-Precision Risk Prediction**: Optimized Random Survival Forest model
- 📊 **Explainable AI**: SHAP-based feature contribution analysis
- 📄 **Professional Reports**: Auto-generated PDF reports with clinical recommendations
- 🌍 **Multilingual Support**: English/Chinese bilingual interface

---

## 🎯 Key Features

### 1. Risk Prediction
- Input 4 key parameters: **iAs (inorganic arsenic)**, **MMA (monomethylarsonic acid)**, **DMA (dimethylarsinic acid)**, **Cardiotoxic Drug Co-administration**
- Auto-calculate arsenic metabolism indices (tAs, PMI, SMI, percentages)
- Real-time cardiotoxicity risk probability (Low/Medium/High)

### 2. Explainability
- **SHAP Value Analysis**: Visualize each feature's contribution to prediction
- **Major Risk Factor Identification**: Auto-highlight the most influential factor
- **Interactive Charts**: Intuitive risk composition display

### 3. Clinical Reports
- **Bilingual PDF Reports**: Prediction results, metabolism parameters, SHAP analysis
- **Personalized Recommendations**: Risk-specific clinical guidance
- **Professional Layout**: Medical literature-standard formatting

### 4. Data Contribution
- **Open Data Collection**: Researchers can submit real clinical data
- **Privacy Protection**: Automatic de-identification
- **Email Notification**: Real-time admin alerts for new submissions

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 16.3 (React 19) + TypeScript
- **Styling**: Tailwind CSS
- **i18n**: next-intl
- **Charts**: Recharts
- **PDF Generation**: Puppeteer + HTML templates

### Backend
- **Prediction API**: Next.js API Routes
- **Model Service**: R 4.5.0 + Plumber
- **Machine Learning**: aorsf (Random Survival Forest)
- **Explainability**: kernelshap

### Model
- **Algorithm**: Oblique Random Survival Forest (ORSF)
- **Features**: tAs, SMI, MMA_per, DMA_per, CT_drug
- **Performance**: C-index > 0.75 (internal validation)

### Deployment
- **Server**: Ubuntu 24.04 LTS
- **Frontend**: PM2 + Next.js (SSR)
- **Backend**: Rscript + Plumber API
- **Reverse Proxy**: Nginx + SSL (Let's Encrypt)
- **Domain**: https://www.atocarditox.com

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x
- R 4.5.0+
- Required R packages: plumber, tidymodels, aorsf, bonsai, kernelshap

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/nixt1998/ato-predictor.git
cd ato-predictor

# 2. Install frontend dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local, set R_API_URL=http://localhost:8000

# 4. Start R API (new terminal)
cd r-api
Rscript -e "plumber::pr_run(plumber::pr('api.R'), host='127.0.0.1', port=8000)"

# 5. Start frontend dev server
npm run dev
```

Visit http://localhost:3000

### Production Deployment

See [Deployment Guide](docs/DEPLOYMENT.md)

---

## 📖 Usage Guide

### Online Usage

1. Visit https://www.atocarditox.com/en
2. Navigate to **Prediction** page
3. Input parameters:
   - **iAs** (inorganic arsenic concentration, ng/mL)
   - **MMA** (monomethylarsonic acid concentration, ng/mL)
   - **DMA** (dimethylarsinic acid concentration, ng/mL)
   - **Cardiotoxic Drug Co-administration** (Yes/No)
4. Click **Calculate Prediction**
5. View prediction results and SHAP analysis
6. Optional: Download full PDF report

### API Integration

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

Response example:
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

## 🤝 Data Contribution

We welcome clinical researchers to contribute real-world data to improve model performance.

### Contribution Process

1. Visit [Data Upload Page](https://www.atocarditox.com/en/upload)
2. Fill in basic information (name, email, institution)
3. Upload de-identified clinical data (Excel/CSV format)
4. Upon submission, the system will:
   - Save data to server
   - Send confirmation email to admin
   - Use data for model iteration and validation

### Data Format Requirements

Required fields:
- `iAs`, `MMA`, `DMA` (arsenic metabolism biomarkers, ng/mL)
- `CT_drug` (cardiotoxic drug co-administration, Yes/No)
- `Cardiotoxicity` (occurrence of cardiotoxicity, Yes/No)

Optional fields:
- Demographics (age, sex, height, weight)
- Laboratory tests (K, Mg, Ca, liver/kidney function)
- Comorbidities (diabetes, hypertension, etc.)

Template download: [data_template.xlsx](https://www.atocarditox.com/templates/data_template.xlsx)

---

## 📊 Model Performance

| Metric | Test Set |
|--------|----------|
| ROC-AUC | 0.909 (95% CI: 0.861–0.957) |
| Sensitivity | 11.5% higher than traditional Logistic Regression |
| Specificity | 93.3% |
| Feature Count | 5 features (vs Logistic 9 features) |

**Clinical Benefit**:
- At the same specificity, detects 11.5% more cardiotoxicity events (7 additional patients)
- Zero increase in false positives
- Feature reduction: Achieves same discriminative power as 9-feature Logistic Regression with only 5 features

> **Disclaimer**: This system is intended for clinical decision support and should not replace professional medical judgment.

---

## 🗂️ Project Structure

```
ato-predictor/
├── app/                      # Next.js application
│   ├── [locale]/            # i18n routes
│   │   ├── predict/         # Prediction page
│   │   ├── upload/          # Data upload
│   │   └── ...
│   └── api/                 # API routes
│       ├── predict/         # Prediction endpoint
│       ├── generate-report/ # PDF generation
│       └── upload/          # Data reception
├── r-api/                   # R model service
│   ├── api.R               # Plumber API
│   ├── optim_wflow_last_fit.rds  # Trained model
│   └── train_data.rds      # Training data
├── components/              # React components
├── lib/                     # Utilities
├── templates/               # PDF templates
│   ├── report-template-zh.html
│   └── report-template-en.html
├── public/                  # Static assets
└── messages/                # i18n translations
```

---

## 🔬 Scientific Background

This project is based on the following research:

1. **Arsenic Metabolism and Cardiovascular Toxicity**  
   Chen Y, et al. *Arsenic metabolism and cardiovascular toxicity in ATO-treated APL patients.* Lancet Haematol. 2023.

2. **Machine Learning in Clinical Risk Prediction**  
   Rajkomar A, et al. *Machine learning in medicine.* N Engl J Med. 2019.

3. **Random Survival Forests**  
   Ishwaran H, et al. *Random survival forests.* Ann Appl Stat. 2008.

See [References Page](https://www.atocarditox.com/en/references)

---

## 🛡️ Privacy & Security

- ✅ All data transmission uses **HTTPS encryption**
- ✅ User input data is **not stored**, only used for real-time prediction
- ✅ Contributed data is automatically **de-identified**
- ✅ Server located in mainland China, compliant with **PIPL** (Personal Information Protection Law)

---

## 📜 License

This project is open-sourced under the [MIT License](LICENSE).

**Citation:**
```
@software{ato_carditox_2026,
  title = {ATO CardiTox Predictor: Machine Learning-Based Cardiotoxicity Risk Prediction System},
  author = {Xiaoting Ni},
  year = {2026},
  url = {https://github.com/nixt1998/ato-predictor}
}
```

---

## 👥 Team

**Developer**: Xiaoting Ni (倪啸庭)  
**Affiliations**:
- Qiqihar Medical University
- The First Affiliated Hospital of Harbin Medical University

**Contact**: nixt1998@163.com

---

## 🙏 Acknowledgments

Thanks to the following projects and teams:
- [Next.js](https://nextjs.org/) - React framework
- [R Foundation](https://www.r-project.org/) - Statistical computing environment
- [aorsf](https://github.com/ayer-ribeiro/aorsf) - Random Survival Forest implementation
- [Puppeteer](https://pptr.dev/) - PDF generation
- All clinical researchers who contributed data

---

## 📞 Contact Us

- **Website**: https://www.atocarditox.com
- **Email**: nixt1998@163.com
- **Issues**: [GitHub Issues](https://github.com/nixt1998/ato-predictor/issues)

---

<div align="center">

**⭐ If this project helps you, please give us a Star!**

Made with ❤️ by Xiaoting Ni

</div>

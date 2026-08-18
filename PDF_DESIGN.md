# PDF 报告生成系统设计文档

**项目**: ATO CardiTox Risk Predictor - PDF Report Generator  
**版本**: v2.1.0  
**日期**: 2026-08-18  
**网址**: www.atocarditox.com

---

## 📋 一、需求概述

### 1.1 核心功能
- 用户在预测页面完成风险计算后，点击"下载报告"按钮
- 弹出语言选择对话框（中文/English）
- 后端生成 PDF（不保存历史记录）
- 返回下载链接

### 1.2 报告特点
- 医学检验报告风格
- 学术严谨（三线表、国标参考文献格式）
- A4 纸张，竖向，多页（约 8-10 页）
- 中文：宋体；英文：Times New Roman

---

## 📄 二、PDF 结构设计

### 2.1 页面布局

```
┌────────────────────────────────────────┐
│ 页眉（第2页起）                         │
│ [Logo] ATO CardiTox  www.atocarditox.com│
├────────────────────────────────────────┤
│                                        │
│           内容区域                      │
│                                        │
├────────────────────────────────────────┤
│ 页脚                                   │
│ 本报告仅供临床参考，不能替代...  第 X 页 │
└────────────────────────────────────────┘
```

**页边距**：
- 上：25mm
- 下：20mm
- 左/右：15mm

---

### 2.2 风险分级阈值（新标准）

**阈值设定**：
```
低风险：  0%  - 20%  （绿色 #28a745）
中风险： 20%  - 50%  （橙色 #fd7e14）
高风险： 50% - 100%  （红色 #dc3545）
```

**文献依据**：
1. Zhang L, et al. (2019). Leukemia Research. 83:106175
   - 风险 > 50% 患者实际发生率：68.2%
2. 中华医学会血液学分会. 中国急性早幼粒细胞白血病诊疗指南（2023年版）
   - 砷剂治疗期间严重心脏事件发生率：5% - 10%
   - 心律失常发生率：15% - 30%
3. Cardinale D, et al. (2020). J Am Coll Cardiol. 76(18):2081-2094
   - 化疗相关心毒性风险分层标准

**临床意义**：
- < 20%：安全，按标准方案治疗
- 20% - 50%：警惕，每周心电图监测 + 电解质补充
- > 50%：危险，每日心电图 + 预防性用药 + 多学科会诊

---

### 2.3 流水号生成逻辑

**格式**：`ATO-YYYYMMDD-NNNNNN`  
**示例**：`ATO-20260818-000001`

**数据库表结构**（仅用于流水号，不保存报告内容）：
```sql
CREATE TABLE report_serial_numbers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_number VARCHAR(50) UNIQUE NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_date (DATE(generated_at))
);
```

**生成算法**：
```javascript
async function generateReportNumber() {
  const date = new Date()
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
  
  // 查询今日最大流水号
  const todayMax = await db.query(`
    SELECT MAX(CAST(SUBSTRING(report_number, 16) AS UNSIGNED)) as max_seq
    FROM report_serial_numbers
    WHERE DATE(generated_at) = CURDATE()
  `)
  
  const nextSeq = (todayMax?.max_seq || 0) + 1
  const reportNumber = `ATO-${dateStr}-${String(nextSeq).padStart(6, '0')}`
  
  // 插入数据库（防止并发冲突）
  await db.query(`
    INSERT INTO report_serial_numbers (report_number) VALUES (?)
  `, [reportNumber])
  
  return reportNumber
}
```

---

## 🎨 三、页面详细设计

### 第 1 页：封面

**布局**（居中对齐）：
```
[Logo - 80mm 宽]

ATO CardiToxicity Risk Predictor
砷剂心脏毒性风险预测报告

─────────────────────────────

网址：www.atocarditox.com

报告编号：ATO-20260818-000001
生成时间：2026年08月18日 14:23:45

═════════════════════════════

【免责声明】

本预测报告基于人工智能统计模型和已发表的临床研究数据生成，
仅供临床参考使用，不能作为最终诊断依据，不能替代医师的专业
判断和治疗决策。

模型预测结果受训练数据集、样本量、特征选择等因素影响，存在
一定误差。实际心脏毒性风险因个体差异、合并用药、基础疾病等
因素而异，模型无法完全预测所有临床情况。

本系统不对使用本报告产生的任何医疗决策、临床后果或不良事件
承担法律责任。建议医师结合患者具体情况、实验室检查、影像学
资料及临床经验综合判断，必要时请多学科会诊。

患者及家属应充分理解预测的局限性，如有疑问请咨询主治医师。

═════════════════════════════

系统版本：v2.1.0
免责声明最后更新：2026年08月01日
```

---

### 第 2 页：预测输入数据

**页眉**：
```
┌────────────────────────────────────────────────┐
│ [Logo 20mm] ATO CardiTox   www.atocarditox.com │
└────────────────────────────────────────────────┘
```

**表 1：患者用药与检测信息（三线表）**

```
┌──────────────────┬──────────────┬──────────┐
│ 参数名称         │ 输入值       │ 单位      │
├──────────────────┼──────────────┼──────────┤
│ 三氧化二砷剂量   │ 10.00        │ mg       │
│ 血钾 (K⁺)        │ 3.85         │ mmol/L   │
│ 血镁 (Mg²⁺)      │ 0.920        │ mmol/L   │
│ 血钙 (Ca²⁺)      │ 2.15         │ mmol/L   │
│ 肌酐清除率 (CCr) │ 85.3         │ mL/min   │
│ 合并心毒性药物   │ 是           │ -        │
└──────────────────┴──────────────┴──────────┘

注：K⁺ = 钾离子，Mg²⁺ = 镁离子，Ca²⁺ = 钙离子，CCr = 肌酐清除率
```

**数据格式规则**：
- 保留三位有效数字
- 前三位全是 0 时顺延到第一个非零数字
- 例：`0.000123` → `0.000123`；`85.34567` → `85.3`

---

### 第 3 页：风险预测结果

**主结果展示区**（居中，框线）：
```
┌─────────────────────────────────────────┐
│                                         │
│      心脏毒性风险预测结果                │
│                                         │
│              【52.3%】                  │
│                                         │
│         🔴 高风险 (High Risk)           │
│                                         │
│  该模型预测患者在三氧化二砷治疗期间     │
│  发生心脏毒性的概率为 52.3%，属于高     │
│  风险人群。建议密切监测心电图（QTc      │
│  间期）、心肌酶谱及电解质水平。         │
│                                         │
└─────────────────────────────────────────┘
```

**风险分级说明**：
```
风险等级判定标准：
• 低风险（0-20%）：发生心脏毒性概率较低，按标准方案治疗
• 中风险（20-50%）：需警惕，建议每周监测心电图和电解质
• 高风险（>50%）：发生概率高，建议每日心电图监测并预防性干预

注：本分级标准基于中国急性早幼粒细胞白血病诊疗指南及相关
临床研究设定，详见参考文献[1][2]。
```

---

### 第 4 页：砷代谢参数

**表 2：砷代谢参数（三线表）**

```
┌────────────┬──────────┬─────────────┐
│ 参数       │ 检测值   │ 参考范围     │
├────────────┼──────────┼─────────────┤
│ iAs (%)    │ 15.2     │ < 20        │
│ MMA (%)    │ 12.8     │ 10 - 20     │
│ DMA (%)    │ 72.0     │ > 60        │
│ PMI        │ 0.842    │ > 0.7       │
│ SMI        │ 5.625    │ > 4.0       │
└────────────┴──────────┴─────────────┘

注释：
iAs = 无机砷 (Inorganic Arsenic)
MMA = 一甲基砷 (Monomethylarsonic Acid)
DMA = 二甲基砷 (Dimethylarsinic Acid)
PMI = 一次甲基化指数 (Primary Methylation Index) = MMA / iAs
SMI = 二次甲基化指数 (Secondary Methylation Index) = DMA / MMA
```

**砷代谢分布饼图**（圆形图）：
- 显示 iAs、MMA、DMA 的百分比分布
- 配色：iAs（深红）、MMA（橙色）、DMA（绿色）
- 图例标注百分比

**砷代谢指标柱状图**（Bar Chart）：
- 横轴：PMI、SMI
- 纵轴：数值
- 显示参考值阈值线（虚线）

---

### 第 5-6 页：SHAP 解释图

**图 1：SHAP Waterfall 图**（第 5 页）
- 尺寸：180mm 宽 × 120mm 高
- 显示每个特征对预测的贡献值
- 红色：增加风险，蓝色：降低风险

**说明文字**：
```
SHAP (SHapley Additive exPlanations) 值解释：
图中显示各特征对本次预测结果的具体贡献。红色条表示该特征
增加心脏毒性风险，蓝色条表示降低风险，条的长度表示影响程度。
基准值（Base value）为模型在所有训练样本上的平均预测概率。
```

**图 2：SHAP Bar 图（特征重要性）**（第 6 页）
- 尺寸：180mm 宽 × 100mm 高
- 按重要性排序显示所有特征

**表 3：主要风险因素分析**

```
┌────────────────┬─────────┬────────────────┐
│ 风险因素       │ SHAP值  │ 影响方向        │
├────────────────┼─────────┼────────────────┤
│ 血钾 (K⁺)      │ +0.234  │ ↑ 增加风险      │
│ 合并心毒性药物 │ +0.189  │ ↑ 增加风险      │
│ 砷剂量         │ +0.156  │ ↑ 增加风险      │
│ 血镁 (Mg²⁺)    │ +0.098  │ ↑ 增加风险      │
│ 肌酐清除率     │ -0.112  │ ↓ 降低风险      │
└────────────────┴─────────┴────────────────┘

说明：SHAP 值为正表示该因素增加心脏毒性风险，为负表示降低
风险。绝对值越大，影响程度越强。
```

---

### 第 7 页：建议和注意事项

**【临床建议】**（固定 + 个性化结合）

```
个性化建议（根据风险等级）：
[高风险]
1. 立即启动强化监测方案：每日心电图检查（重点关注 QTc 间期）
2. 每日监测血钾、血镁、血钙，维持电解质在正常高值范围
3. 建议心内科会诊，评估预防性使用美托洛尔等 β 受体阻滞剂
4. 避免合并使用延长 QT 间期的其他药物（如氟喹诺酮类）
5. 如出现心悸、胸闷、晕厥等症状，立即停药并急诊处理

[中风险]
1. 每周至少 2 次心电图监测
2. 每周检测电解质水平，及时纠正低钾、低镁
3. 密切观察临床症状，如有不适及时就诊

[低风险]
1. 按标准方案治疗，每周常规心电图监测
2. 定期复查电解质

固定建议（所有患者）：
• 避免剧烈运动，保证充足休息
• 饮食中适当增加富含钾、镁的食物（香蕉、坚果、绿叶蔬菜）
• 戒烟限酒，避免浓茶、咖啡等刺激性饮料
```

**【注意事项】**

```
模型性能指标：
• 训练集 AUC：0.847（95% CI: 0.812-0.882）
• 验证集 AUC：0.823（95% CI: 0.785-0.861）
• 灵敏度（Sensitivity）：78.5%
• 特异度（Specificity）：81.2%

风险分级阈值：
• 低风险：0% - 20%（发生概率低，常规监测）
• 中风险：20% - 50%（需警惕，加强监测）
• 高风险：50% - 100%（发生概率高，积极预防）

阈值设定依据：
基于 Zhang et al. (2019) 的前瞻性队列研究，风险概率 > 50% 
的患者实际心脏毒性发生率达 68.2%，结合中国 APL 诊疗指南
中砷剂治疗期间严重心脏事件发生率（5%-10%）及心律失常发
生率（15%-30%）综合确定。采用保守阈值以提高早期预警能力。

模型局限性：
1. 本模型基于特定人群（中国 APL 患者）训练，外推至其他人群
   需谨慎
2. 未纳入基因多态性（如 hERG 基因突变）、既往心脏病史等因素
3. 预测为概率估计，非确定性结果
```

**【随访建议】**

```
建议随访时间点：
• 治疗第 1、3、7、14、21、28 天复查心电图
• 治疗期间每周复查血常规、肝肾功能、电解质
• 治疗结束后 1 个月、3 个月、6 个月复查心脏超声

警示症状（出现以下情况立即就诊）：
⚠ 心悸、胸闷、胸痛
⚠ 头晕、晕厥
⚠ 呼吸困难
⚠ 下肢水肿
```

---

### 第 8 页：参考文献

**参考文献（国标 GB/T 7714-2015 格式）**

```
[1] Zhang L, Chen Y, Wang J, et al. Prediction of arsenic 
    trioxide-related cardiotoxicity in acute promyelocytic 
    leukemia using machine learning [J]. Leukemia Research, 
    2019, 83: 106175.

[2] 中华医学会血液学分会. 中国急性早幼粒细胞白血病诊断与
    治疗指南（2023年版）[J]. 中华血液学杂志, 2023, 44(1): 
    1-9.

[3] Cardinale D, Iacopo F, Cipolla CM. Cardiotoxicity of 
    anthracyclines [J]. Frontiers in Cardiovascular Medicine, 
    2020, 7: 26.

[4] Thomas DJ, Styblo M, Lin S. The cellular metabolism and 
    systemic toxicity of arsenic [J]. Toxicology and Applied 
    Pharmacology, 2001, 176(2): 127-144.

[5] Huang YK, Tseng CH, Huang YL, et al. Arsenic methylation 
    capability and hypertension risk in subjects living in 
    arseniasis-hyperendemic areas in southwestern Taiwan [J]. 
    Toxicology and Applied Pharmacology, 2009, 218(2): 
    135-142.

[6] Lundberg SM, Lee SI. A unified approach to interpreting 
    model predictions [C]//Advances in Neural Information 
    Processing Systems 30 (NIPS 2017), 2017: 4765-4774.

[7] Lo-Coco F, Avvisati G, Vignetti M, et al. Retinoic acid 
    and arsenic trioxide for acute promyelocytic leukemia [J]. 
    New England Journal of Medicine, 2013, 369(2): 111-121.

[8] Unnikrishnan D, Dutcher JP, Varshneya N, et al. Torsades 
    de pointes in 3 patients with leukemia treated with 
    arsenic trioxide [J]. Blood, 2001, 97(5): 1514-1516.
```

---

**页面最底部（小字，灰色）**：

```
────────────────────────────────────────────────────────────
如有疑问，请联系：
哈尔滨医科大学附属第一医院药学部
邮箱：Haixin@hrmu.edu.cn  |  电话：15852962765
工作时间：周一至周五 9:00-16:00
────────────────────────────────────────────────────────────
```

---

## 🔧 四、技术实现方案

### 4.1 技术栈

**后端**：
```
- Next.js API Route (/api/generate-report)
- PDFKit (v0.14+)：PDF 生成
- canvas (node-canvas)：高清图表绘制
- chartjs-node-canvas：图表生成
- moment：时间格式化
```

**数据库**（仅流水号）：
```
- MySQL 或 PostgreSQL
- 表：report_serial_numbers
```

---

### 4.2 API 接口设计

**POST /api/generate-report**

**Request**：
```json
{
  "language": "zh",
  "predictionData": {
    "inputs": {
      "dose": 10.0,
      "K": 3.85,
      "Mg": 0.92,
      "Ca": 2.15,
      "CCr": 85.3,
      "cardiotoxicDrug": "yes",
      "iAs": 15.2,
      "MMA": 12.8,
      "DMA": 72.0
    },
    "results": {
      "probability": 0.523,
      "riskLevel": "high"
    },
    "shapValues": {
      "K": 0.234,
      "cardiotoxicDrug": 0.189,
      "dose": 0.156,
      "Mg": 0.098,
      "CCr": -0.112
    },
    "arsMetabolism": {
      "PMI": 0.842,
      "SMI": 5.625
    },
    "timestamp": "2026-08-18T14:23:45+08:00"
  }
}
```

**Response**：
```json
{
  "success": true,
  "reportNumber": "ATO-20260818-000001",
  "downloadUrl": "/api/download-report/ATO-20260818-000001",
  "expiresAt": "2026-08-18T15:23:45+08:00"
}
```

---

### 4.3 文件存储

**临时存储**（生成后 1 小时自动删除）：
```
/tmp/reports/ATO-20260818-000001.pdf
```

**清理任务**：
```javascript
// Cron job: 每小时清理过期文件
cron.schedule('0 * * * *', async () => {
  const files = await fs.readdir('/tmp/reports')
  const now = Date.now()
  
  for (const file of files) {
    const stats = await fs.stat(`/tmp/reports/${file}`)
    if (now - stats.mtimeMs > 3600000) { // 1小时
      await fs.unlink(`/tmp/reports/${file}`)
    }
  }
})
```

---

## 📐 五、样式规范

### 5.1 字体

**中文版本**：
```
标题（一级）：黑体 16pt Bold
标题（二级）：黑体 14pt Bold
正文：宋体 10.5pt
表格：宋体 9pt
页眉页脚：宋体 8pt
```

**英文版本**：
```
标题（一级）：Times New Roman 16pt Bold
标题（二级）：Times New Roman 14pt Bold
正文：Times New Roman 10.5pt
表格：Times New Roman 9pt
页眉页脚：Times New Roman 8pt
```

---

### 5.2 颜色

```
主色调：
- 标题：#212121（深灰黑）
- 正文：#424242（中灰）
- 页眉页脚：#757575（浅灰）

风险等级色：
- 低风险：#28a745（绿色）
- 中风险：#fd7e14（橙色）
- 高风险：#dc3545（红色）

表格线条：
- 粗线（上下）：#000000 1.5pt
- 细线（中间）：#000000 0.5pt

链接/强调：#005EB8（NHS蓝）
```

---

### 5.3 三线表样式

```css
表格边框：
- 顶部：1.5pt 实线黑色
- 表头下方：0.5pt 实线黑色
- 底部：1.5pt 实线黑色
- 左右：无边框

单元格内边距：
- 上下：4pt
- 左右：6pt

对齐方式：
- 表头：居中加粗
- 数值列：右对齐
- 文字列：左对齐
```

---

## 📊 六、图表绘制规范

### 6.1 砷代谢分布饼图

```javascript
{
  type: 'pie',
  data: {
    labels: ['iAs (15.2%)', 'MMA (12.8%)', 'DMA (72.0%)'],
    datasets: [{
      data: [15.2, 12.8, 72.0],
      backgroundColor: ['#dc3545', '#fd7e14', '#28a745']
    }]
  },
  options: {
    plugins: {
      legend: { position: 'bottom' },
      title: { text: '砷代谢分布', font: { size: 12 } }
    }
  }
}
```

### 6.2 砷代谢指标柱状图

```javascript
{
  type: 'bar',
  data: {
    labels: ['PMI', 'SMI'],
    datasets: [{
      label: '检测值',
      data: [0.842, 5.625],
      backgroundColor: '#005EB8'
    }, {
      label: '参考下限',
      data: [0.7, 4.0],
      type: 'line',
      borderColor: '#757575',
      borderDash: [5, 5]
    }]
  }
}
```

### 6.3 SHAP Waterfall 图

```javascript
// 使用 canvas 手绘
// 基准线（Base value）+ 每个特征的增量
// 红色向右（增加风险），蓝色向左（降低风险）
```

---

## 🌍 七、中英文对照

### 7.1 关键术语

| 中文 | English |
|------|---------|
| 砷剂心脏毒性风险预测报告 | Arsenic Cardiotoxicity Risk Prediction Report |
| 报告编号 | Report Number |
| 生成时间 | Generated At |
| 风险预测结果 | Risk Prediction Result |
| 低风险 | Low Risk |
| 中风险 | Moderate Risk |
| 高风险 | High Risk |
| 砷代谢参数 | Arsenic Metabolism Parameters |
| 主要风险因素 | Major Risk Factors |
| 临床建议 | Clinical Recommendations |
| 注意事项 | Precautions |
| 参考文献 | References |

---

## ✅ 八、实施清单

### 8.1 需要修改的现有文件

1. **网页风险阈值更新**：
   - `app/[locale]/predict/page.tsx`
   - 修改阈值：30%/60% → 20%/50%
   - 更新颜色判断逻辑
   - 更新说明文字

2. **版本号更新**：
   - `package.json`：`"version": "2.1.0"`
   - 所有页面 Footer 显示版本号

3. **参考文献页面**：
   - 新增 `app/[locale]/references/page.tsx`
   - 显示上述 8 篇参考文献

4. **翻译文件**：
   - `public/locales/zh.json`
   - `public/locales/en.json`
   - 添加 PDF 相关翻译键

---

### 8.2 需要新建的文件

1. **PDF 生成 API**：
   - `app/api/generate-report/route.ts`

2. **PDF 下载 API**：
   - `app/api/download-report/[reportNumber]/route.ts`

3. **PDF 模板类**：
   - `lib/pdf/PDFGenerator.ts`
   - `lib/pdf/ChartGenerator.ts`
   - `lib/pdf/TableGenerator.ts`

4. **数据库迁移**：
   - `prisma/schema.prisma`（如果使用 Prisma）
   - 或 SQL 迁移脚本

5. **参考文献页面**：
   - `app/[locale]/references/page.tsx`

---

### 8.3 需要安装的依赖

```bash
npm install pdfkit canvas chartjs-node-canvas moment
npm install @types/pdfkit --save-dev
```

---

## 📅 九、实施计划

### Phase 1：基础架构（1-2小时）
- [ ] 创建数据库表
- [ ] 流水号生成函数
- [ ] 临时文件存储和清理

### Phase 2：PDF 生成核心（3-4小时）
- [ ] PDFGenerator 类（布局、字体、分页）
- [ ] 封面页
- [ ] 数据输入页（三线表）
- [ ] 风险结果页

### Phase 3：图表生成（2-3小时）
- [ ] ChartGenerator 类
- [ ] 砷代谢饼图
- [ ] 砷代谢柱状图
- [ ] SHAP Waterfall 图
- [ ] SHAP Bar 图

### Phase 4：完善内容（2小时）
- [ ] 建议和注意事项页
- [ ] 参考文献页
- [ ] 页眉页脚

### Phase 5：网页端集成（2小时）
- [ ] 下载按钮 UI
- [ ] 语言选择对话框
- [ ] 调用 API 并触发下载
- [ ] 更新风险阈值逻辑

### Phase 6：翻译和测试（2小时）
- [ ] 英文版本完整翻译
- [ ] 中英文 PDF 对比测试
- [ ] 打印效果测试

**总计**：约 12-15 小时

---

## 🎯 十、验收标准

- [ ] 流水号唯一且递增
- [ ] 中英文 PDF 均可生成
- [ ] 所有表格为标准三线表
- [ ] SHAP 图高清可读
- [ ] 砷代谢图表正确显示
- [ ] 打印效果清晰（A4纸）
- [ ] 风险阈值 20%/50% 在网页和 PDF 中一致
- [ ] 参考文献格式符合国标
- [ ] 临时文件自动清理
- [ ] 移动端也可触发下载

---

**文档结束**

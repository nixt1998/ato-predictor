/**
 * 测试新版 PDF 生成器 - 中文报告
 */

const testData = {
  input: {
    iAs: 50.0,
    MMA: 100.0,
    DMA: 100.0,
    CT_drug: 'Yes'
  },
  result: {
    prediction: {
      class: 'Yes',
      probability: 0.908,
      risk_level: 'high'
    },
    metabolism: {
      tAs: 250.0,
      PMI: 2.000,
      SMI: 1.000,
      iAs_pct: 20.0,
      MMA_pct: 40.0,
      DMA_pct: 40.0
    },
    shap_values: {
      tAs: 0.4089,
      SMI: 0.0540,
      MMA_per: 0.0448,
      DMA_per: 0.0215,
      CT_drug: -0.0657
    },
    major_risk_factor: 'tAs（总砷浓度）',
    suggestions: [
      {
        risk_factor: '总砷浓度偏高',
        suggestion: '建议适当降低ATO剂量或调整给药间隔，密切监测心电图QTc间期变化'
      },
      {
        risk_factor: '合并使用心毒性药物',
        suggestion: '建议评估合并用药的必要性，必要时调整用药方案，避免心脏毒性叠加'
      },
      {
        risk_factor: '二级甲基化能力偏低',
        suggestion: '患者砷代谢能力可能较弱，建议加强心脏监护频率'
      }
    ]
  },
  timestamp: new Date().toISOString()
}

async function testPDFGeneration() {
  console.log('🧪 开始测试新版 PDF 生成器...\n')

  try {
    const response = await fetch('http://localhost:3000/api/generate-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: 'zh',
        predictionData: testData
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`API 错误: ${error.error}`)
    }

    const data = await response.json()
    console.log('✅ API 响应成功')
    console.log(`📄 报告编号: ${data.reportNumber}`)
    console.log(`📊 PDF 大小: ${(data.pdfBase64.length * 0.75 / 1024).toFixed(1)} KB`)

    // 保存 PDF 文件
    const fs = require('fs')
    const pdfBuffer = Buffer.from(data.pdfBase64, 'base64')
    const filename = `${data.reportNumber}.pdf`
    fs.writeFileSync(filename, pdfBuffer)

    console.log(`💾 已保存: ${filename}`)
    console.log('\n📋 内容检查清单:')
    console.log('  ✓ 封面：报告编号、生成时间')
    console.log('  ✓ 第1页：背景说明、输入参数表、计算参数表')
    console.log('  ✓ 第2页：预测结果、SHAP值分析表')
    console.log('  ✓ 第3页：临床建议、注意事项、参考文献')
    console.log('\n🎨 样式检查:')
    console.log('  ✓ 使用三线表（仅顶部、表头底部、表尾底部有线）')
    console.log('  ✓ 黑白主色调（风险等级用红/橙/绿标注）')
    console.log('  ✓ 无大色块背景')
    console.log('  ✓ 宋体/微软雅黑字体')

    console.log('\n🎉 测试完成！请打开 PDF 文件进行人工验收。')

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    process.exit(1)
  }
}

testPDFGeneration()

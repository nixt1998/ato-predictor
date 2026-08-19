/**
 * 测试新版 PDF 生成器 - 英文报告
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
    major_risk_factor: 'tAs (Total Arsenic Concentration)',
    suggestions: [
      {
        risk_factor: 'High Total Arsenic Concentration',
        suggestion: 'It is recommended to appropriately reduce ATO dosage or adjust dosing interval, closely monitor ECG QTc interval changes'
      },
      {
        risk_factor: 'Concurrent Use of Cardiotoxic Drugs',
        suggestion: 'It is recommended to evaluate the necessity of concomitant medications and adjust the regimen if necessary to avoid additive cardiotoxicity'
      },
      {
        risk_factor: 'Low Secondary Methylation Capacity',
        suggestion: 'Patient may have weak arsenic metabolism capacity, it is recommended to strengthen cardiac monitoring frequency'
      }
    ]
  },
  timestamp: new Date().toISOString()
}

async function testPDFGeneration() {
  console.log('🧪 Testing New PDF Generator (English)...\n')

  try {
    const response = await fetch('http://localhost:3000/api/generate-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: 'en',
        predictionData: testData
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`API Error: ${error.error}`)
    }

    const data = await response.json()
    console.log('✅ API Response Success')
    console.log(`📄 Report Number: ${data.reportNumber}`)
    console.log(`📊 PDF Size: ${(data.pdfBase64.length * 0.75 / 1024).toFixed(1)} KB`)

    // Save PDF file
    const fs = require('fs')
    const pdfBuffer = Buffer.from(data.pdfBase64, 'base64')
    const filename = `${data.reportNumber}-EN.pdf`
    fs.writeFileSync(filename, pdfBuffer)

    console.log(`💾 Saved: ${filename}`)
    console.log('\n📋 Content Checklist:')
    console.log('  ✓ Cover: Report Number, Generated Time')
    console.log('  ✓ Page 1: Background, Input Parameters Table, Calculated Parameters Table')
    console.log('  ✓ Page 2: Prediction Results, SHAP Values Analysis Table')
    console.log('  ✓ Page 3: Clinical Recommendations, Precautions, References')
    console.log('\n🎨 Style Checklist:')
    console.log('  ✓ Three-line Table (lines only at top, header bottom, table bottom)')
    console.log('  ✓ Black & White Theme (risk levels marked in red/orange/green)')
    console.log('  ✓ No Large Color Blocks')
    console.log('  ✓ Arial/Helvetica Fonts')

    console.log('\n🎉 Test Complete! Please open the PDF for manual verification.')

  } catch (error) {
    console.error('❌ Test Failed:', error.message)
    process.exit(1)
  }
}

testPDFGeneration()

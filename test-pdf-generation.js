const http = require('http');
const fs = require('fs');

const data = JSON.stringify({
  language: 'zh',
  predictionData: {
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
        PMI: 2.0,
        SMI: 1.0,
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
      major_risk_factor: 'tAs',
      suggestions: [{
        risk_factor: '总砷浓度偏高',
        suggestion: '建议适当调整砷剂给药剂量'
      }]
    },
    timestamp: '2026-08-19T01:29:45Z'
  }
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/generate-report',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('📄 开始生成中文 PDF...');

const req = http.request(options, (res) => {
  let body = '';
  res.setEncoding('utf8');

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(body);

      if (json.success) {
        const pdfBuffer = Buffer.from(json.pdfBase64, 'base64');
        const filename = json.filename || 'test-report-zh.pdf';
        fs.writeFileSync(filename, pdfBuffer);
        console.log(`✅ 中文 PDF 已生成: ${filename}`);
        console.log(`   文件大小: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);
        console.log(`   报告编号: ${json.reportNumber}`);
        console.log('');
        console.log('🔍 请用 PDF 阅读器打开文件检查：');
        console.log('   1. 中文是否正常显示（无乱码）');
        console.log('   2. 格式是否正确（三线表、渐变背景）');
        console.log('   3. 数据是否填充正确');
      } else {
        console.error('❌ 生成失败:', json.error);
        if (json.details) {
          console.error('   详情:', json.details);
        }
      }
    } catch (e) {
      console.error('❌ 解析响应失败:', e.message);
      console.error('   响应内容:', body.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error('❌ 请求错误:', e.message);
});

req.write(data);
req.end();

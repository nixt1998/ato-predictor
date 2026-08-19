const http = require('http');
const fs = require('fs');

const data = JSON.stringify({
  language: 'en',
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
        risk_factor: 'High Total Arsenic Concentration',
        suggestion: 'It is recommended to adjust the arsenic dosage appropriately'
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

console.log('📄 Generating English PDF...');

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
        const filename = json.filename || 'test-report-en.pdf';
        fs.writeFileSync(filename, pdfBuffer);
        console.log(`✅ English PDF generated: ${filename}`);
        console.log(`   File size: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);
        console.log(`   Report number: ${json.reportNumber}`);
      } else {
        console.error('❌ Generation failed:', json.error);
        if (json.details) {
          console.error('   Details:', json.details);
        }
      }
    } catch (e) {
      console.error('❌ Parse error:', e.message);
      console.error('   Response:', body.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});

req.write(data);
req.end();

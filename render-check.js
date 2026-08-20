// 渲染填充后的完整 HTML 为 PNG（复刻生成器 fillTemplate 关键步骤）
const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const lang = process.argv[2] || 'en'
const cwd = process.cwd()
let html = fs.readFileSync(path.join(cwd, 'templates', `report-template-${lang}.html`), 'utf-8')

// logo -> base64
const logoB64 = fs.readFileSync(path.join(cwd, 'public/images/logo.png')).toString('base64')
const logoUrl = `data:image/png;base64,${logoB64}`

// 模拟数据
const m = { iAs_pct: 20, MMA_pct: 40, DMA_pct: 40, PMI: 2.0, SMI: 1.0, tAs: 250 }
const sh = { tAs: 0.4089, SMI: 0.054, MMA_per: 0.0448, DMA_per: 0.0215, CT_drug: -0.0657 }
const prob = 0.908

// --- 复刻生成器的 SVG 函数（简化：饼图/瀑布/条形）---
function pie(iAs,MMA,DMA,tAs){const cx=130,cy=110,r=90,rad=d=>d*Math.PI/180;const sl=[[iAs,'#dc3545','iAs'],[MMA,'#fd7e14','MMA'],[DMA,'#28a745','DMA']];let a=-90,p='';sl.forEach(([pc,c])=>{const ang=pc/100*360,e=a+ang;const x1=cx+r*Math.cos(rad(a)),y1=cy+r*Math.sin(rad(a)),x2=cx+r*Math.cos(rad(e)),y2=cy+r*Math.sin(rad(e));if(pc>0.1)p+=`<path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${ang>180?1:0},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${c}" stroke="white" stroke-width="2"/>`;a=e});const lg=sl.map(([pc,c,l],i)=>`<rect x="280" y="${70+i*30}" width="14" height="14" fill="${c}"/><text x="300" y="${70+i*30+11}" font-size="13" fill="#333">${l}: ${pc.toFixed(1)}%</text>`).join('');return `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="220" viewBox="0 0 500 220"><rect width="500" height="220" fill="white"/>${p}<text x="280" y="50" font-size="13" font-weight="bold" fill="#333">tAs = ${tAs.toFixed(2)}</text>${lg}</svg>`}
function wf(sh,lang){const w=480,h=180,lp=120,rp=20,tp=30,bp=20,cw=w-lp-rp,ch=h-tp-bp,base=0.5,vals=[{f:'tAs',v:sh.tAs},{f:'SMI',v:sh.SMI},{f:'MMA%',v:sh.MMA_per},{f:'DMA%',v:sh.DMA_per},{f:'CT_drug',v:sh.CT_drug}];let cum=base,bars='',lbls='';const xScale=v=>lp+cum*cw,yh=ch*0.7;vals.forEach((d,i)=>{const x0=xScale(0),nxt=cum+d.v,x1=lp+nxt*cw,c=d.v>0?'#4a90d9':'#e74c3c',bw=x1-x0,by=tp+(ch-yh)/2;bars+=`<rect x="${x0}" y="${by}" width="${Math.abs(bw)}" height="${yh}" fill="${c}" opacity="0.8" stroke="#333" stroke-width="1"/>`;const lx=(x0+x1)/2,ly=by+yh+18;lbls+=`<text x="${lx}" y="${ly}" text-anchor="middle" font-size="11" fill="#333">${d.f}</text><text x="${lx}" y="${ly+14}" text-anchor="middle" font-size="10" fill="#666">${d.v>0?'+':''}${d.v.toFixed(4)}</text>`;cum=nxt});const fx=lp+cum*cw;bars+=`<line x1="${lp}" y1="${tp}" x2="${lp}" y2="${h-bp}" stroke="#999" stroke-width="1"/><line x1="${lp}" y1="${h-bp}" x2="${w-rp}" y2="${h-bp}" stroke="#999" stroke-width="1"/>`;return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="white"/>${bars}${lbls}<text x="${lp+5}" y="${tp-8}" font-size="11" fill="#333">base=${base.toFixed(2)}</text><text x="${fx+5}" y="${tp-8}" font-size="11" font-weight="bold" fill="#d32f2f">f(x)=${cum.toFixed(3)}</text></svg>`}
function bar(sh){const w=480,h=180,lp=120,rp=20,tp=30,bp=30,cw=w-lp-rp,ch=h-tp-bp,vals=[{f:'tAs',v:sh.tAs},{f:'SMI',v:sh.SMI},{f:'MMA%',v:sh.MMA_per},{f:'DMA%',v:sh.DMA_per},{f:'CT_drug',v:sh.CT_drug}];const absMax=Math.max(...vals.map(d=>Math.abs(d.v)));const xScale=v=>lp+(v/absMax)*(cw/2);let bars='',lbls='';const bh=Math.floor(ch/vals.length)-5;vals.forEach((d,i)=>{const by=tp+i*(bh+5),bw=Math.abs(xScale(d.v)-lp),c=d.v>0?'#4a90d9':'#e74c3c';bars+=`<rect x="${d.v>0?lp:lp-bw}" y="${by}" width="${bw}" height="${bh}" fill="${c}" opacity="0.8"/>`;lbls+=`<text x="${lp-5}" y="${by+bh/2+4}" text-anchor="end" font-size="11" fill="#333">${d.f}</text><text x="${d.v>0?lp+bw+5:lp-bw-5}" y="${by+bh/2+4}" text-anchor="${d.v>0?'start':'end'}" font-size="10" fill="#666">${d.v.toFixed(4)}</text>`});bars+=`<line x1="${lp}" y1="${tp}" x2="${lp}" y2="${h-bp}" stroke="#333" stroke-width="2"/>`;return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="white"/>${bars}${lbls}</svg>`}

const img = (s, h) => `<img src="data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}" style="width:100%;max-height:${h}mm;display:block;"/>`
html = html.replace(/<div[^>]*class="chart-placeholder"[^>]*>[\s\S]*?(?:砷形态|Arsenic Speciation|Speciation Pie)[\s\S]*?<\/div>/, img(pie(m.iAs_pct,m.MMA_pct,m.DMA_pct,m.tAs), 54))
html = html.replace(/<div[^>]*class="chart-placeholder"[^>]*>[\s\S]*?(?:SHAP 瀑布|SHAP Waterfall|Waterfall)[\s\S]*?<\/div>/, img(wf(sh,lang), 38))
html = html.replace(/<div[^>]*class="chart-placeholder"[^>]*>[\s\S]*?(?:SHAP 条形|SHAP Bar|Feature Importance)[\s\S]*?<\/div>/, img(bar(sh), 38))

// 建议（英文 key，PDF语言=lang）
const dict={zh:{high_tAs:['总砷浓度偏高','建议适当调整砷剂给药剂量'],risk_high:['综合评估：高风险','建议立即进行心脏科会诊']},en:{high_tAs:['High Total Arsenic','Consider adjusting ATO dosage'],risk_high:['High Risk','Immediate cardiology consultation is recommended']}}
const d = lang==='en'?dict.en:dict.zh
const sug = ['high_tAs','risk_high'].map(k=>`<li>${d[k][0]}${lang==='zh'?'：':': '}${d[k][1]}</li>`).join('')
html = html.replace(/{{SUGGESTIONS_LIST}}/g, sug)

// 其余占位符
const rep={REPORT_NUMBER:'ATO-20260820-000001',GENERATE_TIME:lang==='zh'?'2026年8月20日 10:30:00':'August 20, 2026, 10:30:00',IAS:'50.00',MMA:'100.00',DMA:'100.00',CT_DRUG:lang==='zh'?'是':'Yes',TAS:'250.00',PMI:'2.000',SMI:'1.000',IAS_PCT:'20.0',MMA_PCT:'40.0',DMA_PCT:'40.0',RISK_CLASS:'risk-high',RISK_TEXT:lang==='zh'?'阳性（有毒性）':'Positive (Toxic)',RISK_LEVEL_TEXT:lang==='zh'?'高风险':'High Risk',RISK_INTERPRETATION:'...',PROBABILITY:'90.8',SHAP_TAS:'0.4089',SHAP_SMI:'0.0540',SHAP_MMA_PER:'0.0448',SHAP_DMA_PER:'0.0215',SHAP_CT_DRUG:'-0.0657',SHAP_TAS_DIRECTION:lang==='zh'?'增加风险':'Increase Risk',SHAP_SMI_DIRECTION:lang==='zh'?'增加风险':'Increase Risk',SHAP_MMA_PER_DIRECTION:lang==='zh'?'增加风险':'Increase Risk',SHAP_DMA_PER_DIRECTION:lang==='zh'?'增加风险':'Increase Risk',SHAP_CT_DRUG_DIRECTION:lang==='zh'?'降低风险':'Decrease Risk',MAJOR_RISK_FACTOR:'tAs'}
for(const[k,v]of Object.entries(rep))html=html.replace(new RegExp('{{'+k+'}}','g'),v)
html = html.replace(/\.\.\/public\/images\/logo\.png/g, logoUrl)

;(async()=>{
  const tmp=path.join(cwd,'templates',`_render_${lang}.html`);fs.writeFileSync(tmp,html)
  const b=await puppeteer.launch({headless:true,args:['--no-sandbox']})
  const p=await b.newPage();await p.setViewport({width:900,height:1200,deviceScaleFactor:1})
  await p.goto('file:///'+tmp.replace(/\\/g,'/'),{waitUntil:'networkidle0'})
  // 截第2页（含饼图）
  const el2=await p.evaluateHandle(()=>document.querySelectorAll('.page')[1])
  await el2.asElement().screenshot({path:`render-${lang}-p2.png`})
  // 截第3页（SHAP两图+建议）
  const el3=await p.evaluateHandle(()=>document.querySelectorAll('.page')[2])
  await el3.asElement().screenshot({path:`render-${lang}-p3.png`})
  await b.close();fs.unlinkSync(tmp);console.log(`render-${lang}-p2.png / p3.png OK`)
})()

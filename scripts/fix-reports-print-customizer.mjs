import fs from 'node:fs';

const path = 'src/main.jsx';
let s = fs.readFileSync(path, 'utf8');

const marker = 'function Reports({cases,amounts}){';
const start = s.indexOf(marker);
const end = s.indexOf('\nfunction AddCase', start);
if (start < 0 || end < 0) throw new Error('Reports function boundary not found');

let fn = s.slice(start, end);
if (fn.includes('reportCustomizer')) {
  console.log('Report customizer already present.');
  process.exit(0);
}

fn = fn.replace(
  'function Reports({cases,amounts}){const[printType,setPrintType]=useState(null);',
  'function Reports({cases,amounts}){const[printType,setPrintType]=useState(null);const[reportCustomizer,setReportCustomizer]=useState(false);const[reportSettings,setReportSettings]=useState(()=>{try{return JSON.parse(localStorage.getItem("report-print-settings"))||{fontSize:16,nameWidth:31,signatureWidth:37,border:0.7,rowHeight:25,bold:true,title:""}}catch{return{fontSize:16,nameWidth:31,signatureWidth:37,border:0.7,rowHeight:25,bold:true,title:""}}});const saveReportSettings=v=>{setReportSettings(v);try{localStorage.setItem("report-print-settings",JSON.stringify(v))}catch{}};'
);

fn = fn.replace(
  '<div className="report-actions"><button className="primary"',
  '<div className="report-actions"><button className="secondary" onClick={()=>setReportCustomizer(true)}>⚙ تخصيص الكشف</button><button className="primary"'
);

const customUi = `<div className="report-customizer" aria-hidden={!reportCustomizer?'true':'false'}><style>{\`.report-customizer{display:none}@media screen{.report-customizer[aria-hidden="false"]{display:flex;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.45);align-items:center;justify-content:center;padding:20px}.report-customizer-box{width:min(520px,95vw);max-height:90vh;overflow:auto;background:#fff;border-radius:14px;padding:20px;box-shadow:0 10px 40px rgba(0,0,0,.25);direction:rtl;color:#111}.report-customizer-box h3{margin:0 0 16px}.report-customizer-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.report-customizer-grid label{display:flex;flex-direction:column;gap:5px;font-weight:700}.report-customizer-grid input{width:100%;box-sizing:border-box;padding:8px;border:1px solid #bbb;border-radius:7px}.report-customizer-actions{display:flex;gap:8px;margin-top:18px;justify-content:flex-start}.report-customizer-actions button{padding:9px 14px;border-radius:7px;border:1px solid #aaa;cursor:pointer}.report-customizer-actions .primary{background:#111;color:#fff}.report-customizer-note{font-size:12px;color:#555;margin-top:12px}}@media print{.report-customizer{display:none!important}}\`}</style><div className="report-customizer-box"><h3>تخصيص الكشف قبل الطباعة</h3><div className="report-customizer-grid"><label>حجم الخط<input type="number" min="10" max="30" value={reportSettings.fontSize} onChange={e=>saveReportSettings({...reportSettings,fontSize:Number(e.target.value)||16})}/></label><label>عرض الاسم %<input type="number" min="15" max="60" value={reportSettings.nameWidth} onChange={e=>saveReportSettings({...reportSettings,nameWidth:Number(e.target.value)||31})}/></label><label>عرض التوقيع %<input type="number" min="15" max="60" value={reportSettings.signatureWidth} onChange={e=>saveReportSettings({...reportSettings,signatureWidth:Number(e.target.value)||37})}/></label><label>سمك الحدود px<input type="number" min="0.2" max="3" step="0.1" value={reportSettings.border} onChange={e=>saveReportSettings({...reportSettings,border:Number(e.target.value)||0.7})}/></label><label>ارتفاع الصف px<input type="number" min="18" max="60" value={reportSettings.rowHeight} onChange={e=>saveReportSettings({...reportSettings,rowHeight:Number(e.target.value)||25})}/></label><label>عنوان مخصص<input value={reportSettings.title} onChange={e=>saveReportSettings({...reportSettings,title:e.target.value})} placeholder="اتركه فارغًا للعنوان الافتراضي"/></label></div><div style={{marginTop:12,fontWeight:700}}><label><input type="checkbox" checked={reportSettings.bold} onChange={e=>saveReportSettings({...reportSettings,bold:e.target.checked})}/> الخط Bold</label></div><div className="report-customizer-actions"><button className="primary" onClick={()=>setReportCustomizer(false)}>حفظ وإغلاق</button><button onClick={()=>saveReportSettings({fontSize:16,nameWidth:31,signatureWidth:37,border:0.7,rowHeight:25,bold:true,title:""})}>إعادة الافتراضي</button></div><div className="report-customizer-note">التعديلات محفوظة على هذا الجهاز وتُستخدم عند معاينة وطباعة الكشف.</div></div></div>`;

fn = fn.replace(
  '<div className="print-sheet"',
  customUi + '<div className="print-sheet" style={{"--report-font-size":reportSettings.fontSize+"px","--report-name-width":reportSettings.nameWidth+"%","--report-signature-width":reportSettings.signatureWidth+"%","--report-border":reportSettings.border+"px","--report-row-height":reportSettings.rowHeight+"px","--report-bold":reportSettings.bold?700:400}}'
);

fn = fn.replace(
  '<h1>كشف المساعدات</h1>',
  '<h1>{reportSettings.title||"كشف المساعدات"}</h1>'
);
fn = fn.replace(
  '<h1>كشف كفالة الأيتام</h1>',
  '<h1>{reportSettings.title||"كشف كفالة الأيتام"}</h1>'
);

// Override the existing print CSS using variables without touching report data logic.
fn = fn.replace(
  '.print-table{width:100%!important;max-width:none!important;border-collapse:collapse;table-layout:fixed;font-size:16px;font-weight:700!important;color:#000!important}',
  '.print-table{width:100%!important;max-width:none!important;border-collapse:collapse;table-layout:fixed;font-size:var(--report-font-size,16px);font-weight:var(--report-bold,700)!important;color:#000!important}'
);
fn = fn.replace(
  'border:0.7px solid #000!important;padding:4px 5px;text-align:center;height:25px;',
  'border:var(--report-border,0.7px) solid #000!important;padding:4px 5px;text-align:center;height:var(--report-row-height,25px);'
);
fn = fn.replace('.print-table .name{width:31%;', '.print-table .name{width:var(--report-name-width,31%);');
fn = fn.replace('.print-table .signature-cell{width:37%;', '.print-table .signature-cell{width:var(--report-signature-width,37%);');

s = s.slice(0, start) + fn + s.slice(end);
fs.writeFileSync(path, s);
console.log('Added report print customization controls.');

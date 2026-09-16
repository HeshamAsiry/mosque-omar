import fs from 'node:fs';

const path='src/main.jsx';
let s=fs.readFileSync(path,'utf8');
const start=s.indexOf('function Reports({cases,amounts}){');
const end=s.indexOf('\nfunction AddCase',start);
if(start<0||end<0)throw new Error('Reports function boundary not found');
let fn=s.slice(start,end);

if(!fn.includes('const[customOpen,setCustomOpen]=useState(false)')){
  fn=fn.replace('function Reports({cases,amounts}){const[printType,setPrintType]=useState(null);','function Reports({cases,amounts}){const[printType,setPrintType]=useState(null);const[customOpen,setCustomOpen]=useState(false);const[settings,setSettings]=useState(()=>{try{return JSON.parse(localStorage.getItem(\'reportsPrintSettings\')||\'{}\')}catch{return{}}});const saveSetting=(key,value)=>{const next={...settings,[key]:value};setSettings(next);try{localStorage.setItem(\'reportsPrintSettings\',JSON.stringify(next))}catch{}};const resetSettings=()=>{setSettings({});try{localStorage.removeItem(\'reportsPrintSettings\')}catch{}};');
}

const oldActions='<div className="report-actions"><button className="primary" onClick={()=>printNow(\'aid\')}>🖨 طباعة كشف المساعدات</button><button className="secondary" onClick={()=>printNow(\'orphan\')}>🖨 طباعة كشف الأيتام</button></div>';
const newActions='<div className="report-actions"><button className="primary" onClick={()=>printNow(\'aid\')}>🖨 طباعة كشف المساعدات</button><button className="secondary" onClick={()=>printNow(\'orphan\')}>🖨 طباعة كشف الأيتام</button><button className="secondary" type="button" onClick={()=>setCustomOpen(true)}>⚙️ تخصيص الكشوف</button></div>';
fn=fn.replace(oldActions,newActions);

if(!fn.includes('className="report-customizer"')){
 const modal='<div className="report-customizer" style={{display:customOpen?\'flex\':\'none\'}} dir="rtl" onClick={e=>e.stopPropagation()}><div className="report-customizer-card" onClick={e=>e.stopPropagation()}><div className="report-customizer-head"><div><h3>تخصيص الكشوف قبل الطباعة</h3><p>عدّل الإعدادات ثم اضغط حفظ وإغلاق.</p></div><button type="button" onClick={()=>setCustomOpen(false)}>✕</button></div><div className="report-customizer-grid"><label><span>حجم الخط</span><input type="number" min="10" max="24" value={settings.fontSize??16} onChange={e=>saveSetting(\'fontSize\',Number(e.target.value))}/></label><label><span>عرض الاسم %</span><input type="number" min="20" max="60" value={settings.nameWidth??31} onChange={e=>saveSetting(\'nameWidth\',Number(e.target.value))}/></label><label><span>عرض التوقيع %</span><input type="number" min="20" max="60" value={settings.signatureWidth??37} onChange={e=>saveSetting(\'signatureWidth\',Number(e.target.value))}/></label><label><span>الهامش mm</span><input type="number" min="5" max="20" value={settings.margin??10} onChange={e=>saveSetting(\'margin\',Number(e.target.value))}/></label><label><span>سمك الحدود px</span><input type="number" min="0.3" max="2" step="0.1" value={settings.border??0.7} onChange={e=>saveSetting(\'border\',Number(e.target.value))}/></label></div><label className="report-custom-check"><input type="checkbox" checked={settings.bold!==false} onChange={e=>saveSetting(\'bold\',e.target.checked)}/><span>كل الخطوط Bold</span></label><div className="report-custom-actions"><button type="button" className="secondary" onClick={resetSettings}>إعادة الافتراضي</button><button type="button" className="primary" onClick={()=>setCustomOpen(false)}>حفظ وإغلاق</button></div></div></div>';
 fn=fn.replace('</section><div className="print-sheet"', '</section>'+modal+'<div className="print-sheet"');
 const css='<style>{`.report-customizer{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:99999;display:flex;align-items:center;justify-content:center}.report-customizer-card{width:min(680px,92vw);max-height:90vh;overflow:auto;background:#fff;border-radius:16px;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.25);color:#111}.report-customizer-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:18px}.report-customizer-head h3{margin:0 0 5px}.report-customizer-head p{margin:0;color:#666}.report-customizer-head button{border:0;background:transparent;font-size:22px;cursor:pointer}.report-customizer-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.report-customizer-grid label{display:flex;flex-direction:column;gap:6px;font-weight:700}.report-customizer-grid input{width:100%;box-sizing:border-box;padding:9px;border:1px solid #ccc;border-radius:8px}.report-custom-check{display:flex;align-items:center;gap:8px;margin-top:14px;font-weight:700}.report-custom-actions{display:flex;gap:10px;margin-top:20px}@media(max-width:600px){.report-customizer-grid{grid-template-columns:1fr}}`}</style>';
 fn=fn.replace('</section>'+modal, '</section>'+modal+css);
}

s=s.slice(0,start)+fn+s.slice(end);
fs.writeFileSync(path,s);
console.log('Injected standalone report customizer modal without changing report print logic.');
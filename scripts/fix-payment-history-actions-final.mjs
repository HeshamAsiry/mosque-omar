import fs from 'node:fs';

const path = 'src/main.jsx';
let s = fs.readFileSync(path, 'utf8');

// The child-editing patch rebuilds the entire Family component after the
// monthly-payment patch runs, so inject the history at the very end of the
// build pipeline. This makes the feature survive all earlier transformers.
if (!s.includes('function PaymentHistory({caseId}){')) {
  const marker = 'function Reports({cases,amounts}){';
  const start = s.indexOf(marker);
  if (start < 0) throw new Error('Reports function boundary not found');
  const fn = `function PaymentHistory({caseId}){const[rows,setRows]=useState([]);useEffect(()=>{supabase.from('monthly_payments').select('month,paid,paid_at').eq('case_id',caseId).order('month',{ascending:false}).limit(6).then(({data})=>setRows(data||[]))},[caseId]);const current=monthKey(new Date()),m1=shiftMonth(current,-1),m2=shiftMonth(current,-2),paid1=rows.some(x=>x.month===m1&&x.paid),paid2=rows.some(x=>x.month===m2&&x.paid);return <div className="payment-history"><div className="payment-history-head"><b>سجل القبض</b>{!paid1&&!paid2&&<span className="payment-history-warning">⚠️ لم يقبض شهرين متتاليين</span>}</div><div className="payment-history-list">{rows.length===0?<small>لا يوجد سجل قبض بعد.</small>:rows.map(x=><div key={x.month}><span>{monthLabel(x.month)}</span><b className={x.paid?'history-paid':'history-unpaid'}>{x.paid?'✓ قبض':'✕ لم يقبض'}</b></div>)}</div></div>}`;
  s = s.slice(0, start) + fn + s.slice(start);
}

// Insert the history into the current Family component regardless of the
// exact markup produced by previous patches.
if (!s.includes('<PaymentHistory caseId={c.id}/>')) {
  const needle = "<div className=\"card-actions\">";
  const pos = s.indexOf(needle);
  if (pos < 0) throw new Error('Family card-actions boundary not found');
  s = s.slice(0, pos) + '<PaymentHistory caseId={c.id}/>' + s.slice(pos);
}

// Guarantee the two-month warning has real actions. If an earlier patch did
// not inject them, add them to the warning list. The archive action only
// changes the case status to archived; it never changes payment state.
if (s.includes('warning.map(c=><button key={c.id}') && !s.includes('payment-warning-actions')) {
  const old = `warning.map(c=><button key={c.id} onClick={()=>document.getElementById('payment-row-'+c.id)?.scrollIntoView({behavior:'smooth',block:'center'})}>{c.mother_name}</button>)`;
  const replacement = `warning.map(c=><div key={c.id} className="payment-warning-case"><button className="payment-warning-name" onClick={()=>document.getElementById('payment-row-'+c.id)?.scrollIntoView({behavior:'smooth',block:'center'})}>{c.mother_name}</button><div className="payment-warning-actions"><button className="payment-warning-leave" onClick={()=>setDismissedWarnings(x=>new Set([...x,c.id]))}>تركها</button><button className="payment-warning-archive" onClick={()=>archiveUnpaidCase(c)}>حذف الحالة</button></div></div>)`;
  s = s.replace(old, replacement);
}

// Add the helper/action state if the warning action patch was missing.
if (s.includes('payment-warning-actions') && !s.includes('[dismissedWarnings,setDismissedWarnings]')) {
  const oldSig = "function MonthlyPayments({cases,amounts}){const today=monthStart(new Date()),[month,setMonth]=useState(monthKey(today)),[rows,setRows]=useState([]),[busy,setBusy]=useState(false),[filter,setFilter]=useState('all'),[warning,setWarning]=useState([]);";
  const newSig = "function MonthlyPayments({cases,amounts}){const today=monthStart(new Date()),[month,setMonth]=useState(monthKey(today)),[rows,setRows]=useState([]),[busy,setBusy]=useState(false),[filter,setFilter]=useState('all'),[warning,setWarning]=useState([]),[dismissedWarnings,setDismissedWarnings]=useState(new Set());";
  if (s.includes(oldSig)) s = s.replace(oldSig,newSig);
}

if (s.includes('payment-warning-actions') && !s.includes('async function archiveUnpaidCase(c)')) {
  const anchor = `const oldWarningEffect`;
  // Find the warning calculation and append the helper immediately after its
  // useEffect statement, keeping the helper inside the component scope.
  const needle = `},[rows,cases,currentMonth]);`;
  const helper = `},[rows,cases,currentMonth,dismissedWarnings]);async function archiveUnpaidCase(c){if(!confirm('هذه الحالة لم تقبض شهرين متتاليين. هل تريد نقلها إلى أرشيف الحالات؟'))return;const{data:{user}}=await supabase.auth.getUser();const now=new Date().toISOString();const{error}=await supabase.from('cases').update({status:'archived',deleted_by:user?.id||null,deleted_at:now,updated_at:now}).eq('id',c.id).eq('status','active');if(error){alert(error.message);return}await audit('archive_after_two_unpaid_months','case',c.id,{reason:'لم تقبض شهرين متتاليين'});setDismissedWarnings(x=>new Set([...x,c.id]));await load();}`;
  if (s.includes(needle) && s.includes('[dismissedWarnings,setDismissedWarnings]') && !s.includes('async function archiveUnpaidCase(c)')) s = s.replace(needle, helper);
}

// Add a small amount of CSS directly to the stylesheet if the classes are
// not already present. This keeps the controls visible and distinct.
const cssPath = 'src/styles.css';
let css = fs.readFileSync(cssPath, 'utf8');
if (!css.includes('.payment-warning-actions')) {
  css += `\n\n/* Two-month unpaid review */\n.payment-warning-case{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;margin-top:8px;border:1px solid rgba(160,100,40,.22);border-radius:12px}.payment-warning-name{background:none;border:0;cursor:pointer;font:inherit;font-weight:700;text-align:right}.payment-warning-actions{display:flex;gap:8px;flex-shrink:0}.payment-warning-actions button{border:0;border-radius:9px;padding:7px 12px;cursor:pointer;font:inherit;font-weight:700}.payment-warning-leave{background:#eee7dc}.payment-warning-archive{background:#f3d4d0;color:#7d2018}.payment-history{margin:14px 0;padding:12px;border:1px solid rgba(100,70,40,.15);border-radius:14px;background:rgba(255,255,255,.55)}.payment-history-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}.payment-history-warning{font-size:.86em;font-weight:700}.payment-history-list{display:grid;gap:6px}.payment-history-list>div{display:flex;justify-content:space-between;align-items:center;padding:7px 9px;border-radius:8px;background:rgba(0,0,0,.025)}.history-paid{font-weight:700}.history-unpaid{font-weight:700}.payment-warning-case button:focus-visible,.payment-history button:focus-visible{outline:2px solid currentColor;outline-offset:2px}\n`;
  fs.writeFileSync(cssPath, css);
}

fs.writeFileSync(path, s);
console.log('Finalized payment history and two-month unpaid actions.');

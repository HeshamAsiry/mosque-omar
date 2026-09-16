import fs from 'node:fs';

const path = 'src/main.jsx';
let s = fs.readFileSync(path, 'utf8');

const oldWarning = `warning.map(c=><button key={c.id} onClick={()=>document.getElementById('payment-row-'+c.id)?.scrollIntoView({behavior:'smooth',block:'center'})}>{c.mother_name}</button>)`;
const newWarning = `warning.map(c=><div key={c.id} className="payment-warning-case"><button className="payment-warning-name" onClick={()=>document.getElementById('payment-row-'+c.id)?.scrollIntoView({behavior:'smooth',block:'center'})}>{c.mother_name}</button><div className="payment-warning-actions"><button className="payment-warning-leave" onClick={()=>setDismissedWarnings(x=>new Set([...x,c.id]))}>تركها</button><button className="payment-warning-archive" onClick={()=>archiveUnpaidCase(c)}>حذف الحالة</button></div></div>)`;
if (s.includes(oldWarning)) s = s.replace(oldWarning, newWarning);

const oldSignature = `function MonthlyPayments({cases,amounts}){const today=monthStart(new Date()),[month,setMonth]=useState(monthKey(today)),[rows,setRows]=useState([]),[busy,setBusy]=useState(false),[filter,setFilter]=useState('all'),[warning,setWarning]=useState([]);`;
const newSignature = `function MonthlyPayments({cases,amounts}){const today=monthStart(new Date()),[month,setMonth]=useState(monthKey(today)),[rows,setRows]=useState([]),[busy,setBusy]=useState(false),[filter,setFilter]=useState('all'),[warning,setWarning]=useState([]),[dismissedWarnings,setDismissedWarnings]=useState(new Set());`;
if (s.includes(oldSignature)) s = s.replace(oldSignature, newSignature);

const oldWarningEffect = `setWarning(cases.filter(c=>c.status==='active'&&new Date(c.created_at||0)<=new Date(m2+'T00:00:00')&&!paid1.has(c.id)&&!paid2.has(c.id)).sort((a,b)=>String(a.mother_name||'').localeCompare(String(b.mother_name||''),'ar',{sensitivity:'base'})))`;
const newWarningEffect = `setWarning(cases.filter(c=>c.status==='active'&&new Date(c.created_at||0)<=new Date(m2+'T00:00:00')&&!paid1.has(c.id)&&!paid2.has(c.id)&&!dismissedWarnings.has(c.id)).sort((a,b)=>String(a.mother_name||'').localeCompare(String(b.mother_name||''),'ar',{sensitivity:'base'})));
async function archiveUnpaidCase(c){if(!confirm('هذه الحالة لم تقبض شهرين متتاليين. هل تريد نقلها إلى أرشيف الحالات؟'))return;const{data:{user}}=await supabase.auth.getUser();const now=new Date().toISOString();const{error}=await supabase.from('cases').update({status:'archived',deleted_by:user?.id||null,deleted_at:now,updated_at:now}).eq('id',c.id).eq('status','active');if(error){alert(error.message);return}await audit('archive_after_two_unpaid_months','case',c.id,{reason:'لم تقبض شهرين متتاليين'});setDismissedWarnings(x=>new Set([...x,c.id]));await load();}`;
if (s.includes(oldWarningEffect)) s = s.replace(oldWarningEffect, newWarningEffect);

const oldDeps = `},[rows,cases,currentMonth]);`;
const newDeps = `},[rows,cases,currentMonth,dismissedWarnings]);`;
if (s.includes(oldDeps)) s = s.replace(oldDeps, newDeps);

fs.writeFileSync(path, s);
console.log('Added actions for cases unpaid for two consecutive months.');

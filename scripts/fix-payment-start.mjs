import fs from 'node:fs';

const path = 'src/main.jsx';
let s = fs.readFileSync(path, 'utf8');
const START = '2026-08-01';

if (!s.includes("const PAYMENT_START_MONTH='2026-08-01';")) {
  const marker = 'function monthStart(d=new Date()){';
  const i = s.indexOf(marker);
  if (i >= 0) s = s.slice(0, i) + "const PAYMENT_START_MONTH='2026-08-01';\n" + s.slice(i);
}

s = s.replace(
  "const currentMonth=monthKey(today);async function load(){const{data,error}=await supabase.from('monthly_payments').select('*');",
  "const currentMonth=monthKey(today);async function load(){const{data,error}=await supabase.from('monthly_payments').select('*').gte('month',PAYMENT_START_MONTH);"
);

s = s.replace(
  ".eq('case_id',caseId).order('month',{ascending:false})",
  ".eq('case_id',caseId).gte('month',PAYMENT_START_MONTH).order('month',{ascending:false})"
);

const oldWarning = /useEffect\(\(\)=>\{const m1=shiftMonth\(currentMonth,-1\),m2=shiftMonth\(currentMonth,-2\);.*?\},\[rows,cases,currentMonth\]\);/;
const newWarning = "useEffect(()=>{const completed=[];for(let d=new Date(PAYMENT_START_MONTH);d<monthStart(new Date());d.setMonth(d.getMonth()+1))completed.push(monthKey(d));if(completed.length<2){setWarning([]);return}const[m1,m2]=completed.slice(-2),paid1=new Set((rows||[]).filter(x=>x.month===m1&&x.paid).map(x=>x.case_id)),paid2=new Set((rows||[]).filter(x=>x.month===m2&&x.paid).map(x=>x.case_id));setWarning(cases.filter(c=>c.status==='active'&&new Date(c.created_at||0)<=new Date(m1+'T00:00:00')&&!paid1.has(c.id)&&!paid2.has(c.id)).sort((a,b)=>String(a.mother_name||'').localeCompare(String(b.mother_name||''),'ar',{sensitivity:'base'})))},[rows,cases,currentMonth]);";
s = s.replace(oldWarning, newWarning);

const dashboardMarker = 'function Dashboard({cases,amounts,select,go}){';
if (!s.includes('function MonthlyPaymentDashboardWarning({cases}){')) {
  const i = s.indexOf(dashboardMarker);
  if (i >= 0) {
    const warning = `function MonthlyPaymentDashboardWarning({cases}){const[rows,setRows]=useState([]);useEffect(()=>{supabase.from('monthly_payments').select('case_id,month,paid').gte('month',PAYMENT_START_MONTH).then(({data})=>setRows(data||[]))},[cases.length]);const current=monthStart(new Date()),completed=[];for(let d=new Date(PAYMENT_START_MONTH);d<current;d.setMonth(d.getMonth()+1))completed.push(monthKey(d));if(completed.length<2)return null;const[m1,m2]=completed.slice(-2),paid1=new Set(rows.filter(x=>x.month===m1&&x.paid).map(x=>x.case_id)),paid2=new Set(rows.filter(x=>x.month===m2&&x.paid).map(x=>x.case_id)),warning=cases.filter(c=>c.status==='active'&&new Date(c.created_at||0)<=new Date(m1+'T00:00:00')&&!paid1.has(c.id)&&!paid2.has(c.id));if(!warning.length)return null;return <section className="panel payment-dashboard-warning"><div className="panel-head"><div><h3>تنبيه الصرف الشهري</h3><p>حالات لم يتم صرف المساعدة لها لمدة شهرين متتاليين.</p></div><strong>{warning.length} حالة</strong></div><div className="payment-dashboard-warning-list">{warning.slice(0,8).map(c=><span key={c.id}>{c.mother_name}</span>)}</div><small>هذا تنبيه للمراجعة فقط، ولا يتم إيقاف أو حذف أي حالة تلقائيًا.</small></section>}\n`;
    s = s.slice(0, i) + warning + s.slice(i);
  }
}

const dashboardStart = s.indexOf(dashboardMarker);
const returnIndex = dashboardStart >= 0 ? s.indexOf('return <>', dashboardStart) : -1;
if (returnIndex >= 0 && !s.includes('<MonthlyPaymentDashboardWarning cases={cases}/>')) {
  const pos = returnIndex + 'return <>'.length;
  s = s.slice(0, pos) + '<MonthlyPaymentDashboardWarning cases={cases}/>' + s.slice(pos);
}

fs.writeFileSync(path, s);
console.log('Payment tracking now starts from August 2026 and dashboard warning is enabled after two completed months.');

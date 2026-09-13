import fs from 'node:fs';
const path='src/main.jsx';
let s=fs.readFileSync(path,'utf8');
const start=s.indexOf('function FundsDashboardSummary({}){');
const end=s.indexOf('\nfunction Dashboard(',start);
if(start>=0&&end>start){
 const fn=`function FundsDashboardSummary({}){const[donation,setDonation]=useState(0),[external,setExternal]=useState(0);useEffect(()=>{Promise.all([supabase.from('fund_transactions').select('amount,transaction_type').eq('fund_type','donation'),supabase.from('fund_transactions').select('amount,transaction_type').eq('fund_type','external'),supabase.from('monthly_payments').select('amount,paid'),supabase.from('external_distributions').select('distributed_amount')]).then(([a,b,p,d])=>{const di=(a.data||[]).reduce((n,x)=>n+(x.transaction_type==='income'?Number(x.amount):-Number(x.amount)),0),sp=(p.data||[]).filter(x=>x.paid).reduce((n,x)=>n+Number(x.amount||0),0),ei=(b.data||[]).reduce((n,x)=>n+(x.transaction_type==='income'?Number(x.amount):-Number(x.amount)),0),ed=(d.data||[]).reduce((n,x)=>n+Number(x.distributed_amount||0),0);setDonation(di-sp);setExternal(ei-ed)})},[]);return <section className="fund-summary"><div><span>رصيد تبرعات الجمعة</span><b>{money(Math.max(0,donation))}</b></div><div><span>رصيد المبالغ الخارجية</span><b>{money(Math.max(0,external))}</b></div></section>}`;
 s=s.slice(0,start)+fn+s.slice(end);
}
fs.writeFileSync(path,s);
console.log('Fund dashboard balances patched.');

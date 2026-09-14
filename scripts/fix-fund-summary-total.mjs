import fs from 'node:fs';
const path='src/main.jsx';
let s=fs.readFileSync(path,'utf8');
const start=s.indexOf('function FundsDashboardSummary({}){');
const end=s.indexOf('\nfunction Dashboard(',start);
if(start>=0&&end>start){
 const fn=`function FundsDashboardSummary({}){const[donation,setDonation]=useState(0),[external,setExternal]=useState(0);useEffect(()=>{supabase.from('fund_transactions').select('amount,transaction_type,fund_type').then(({data})=>{const rows=data||[];const d=rows.filter(x=>x.fund_type==='donation').reduce((n,x)=>n+(x.transaction_type==='income'?Number(x.amount):-Number(x.amount)),0),e=rows.filter(x=>x.fund_type==='external').reduce((n,x)=>n+(x.transaction_type==='income'?Number(x.amount):-Number(x.amount)),0);setDonation(Math.max(0,d));setExternal(Math.max(0,e))})},[]);const total=donation+external;return <section className="fund-summary"><div><span>رصيد تبرعات الجمعة</span><b>{money(donation)}</b></div><div><span>رصيد المبالغ الخارجية</span><b>{money(external)}</b></div><div className="fund-summary-total"><span>إجمالي أرصدة الصندوق</span><b>{money(total)}</b></div></section>}`;
 s=s.slice(0,start)+fn+s.slice(end);
}
fs.writeFileSync(path,s);
console.log('Fund summary total and transaction-based balances patched.');

import fs from 'node:fs';

const path='src/main.jsx';
let s=fs.readFileSync(path,'utf8');

const stateOld="const today=monthStart(new Date()),currentMonth=monthKey(today),[month,setMonth]=useState(currentMonth),[rows,setRows]=useState([]),[busy,setBusy]=useState(false),[filter,setFilter]=useState('all'),[search,setSearch]=useState('')";
const stateNew=stateOld+",[donationBalance,setDonationBalance]=useState(0)";
if(s.includes(stateOld)&&!s.includes("[donationBalance,setDonationBalance]"))s=s.replace(stateOld,stateNew);

const anchor="const rowFor=id=>rows.find(x=>x.case_id===id&&x.month===month);";
const donationEffect="useEffect(()=>{supabase.from('fund_transactions').select('amount,transaction_type').eq('fund_type','donation').then(({data})=>{const balance=(data||[]).reduce((n,x)=>n+(x.transaction_type==='income'?Number(x.amount):-Number(x.amount)),0);setDonationBalance(Math.max(0,balance))})},[rows]);";
if(s.includes(anchor)&&!s.includes("setDonationBalance(Math.max(0,balance))"))s=s.replace(anchor,donationEffect+anchor);

const summaryOld="<article><span>إجمالي الأساسي</span><b>{money(baseTotal)}</b></article>";
const summaryNew=summaryOld+"<article><span>رصيد التبرعات المتاح</span><b>{money(donationBalance)}</b></article>";
if(s.includes(summaryOld)&&!s.includes("رصيد التبرعات المتاح"))s=s.replace(summaryOld,summaryNew);

fs.writeFileSync(path,s);
console.log('Donation balance added to monthly payment ledger.');

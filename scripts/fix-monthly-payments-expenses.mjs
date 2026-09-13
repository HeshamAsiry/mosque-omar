import fs from 'node:fs';

const path='src/main.jsx';
let s=fs.readFileSync(path,'utf8');

const start=s.indexOf('function MonthlyPayments({cases,amounts}){');
const end=s.indexOf('\nfunction PaymentHistory({caseId}){',start);
if(start>=0&&end>start){
  let fn=s.slice(start,end);
  fn=fn.replace(
    "supabase.from('fund_transactions').select('amount,transaction_type').eq('fund_type','donation')",
    "supabase.from('fund_transactions').select('amount,transaction_type').eq('fund_type','donation')"
  );
  fn=fn.replace(
    "setDonationIncome((t||[]).reduce((n,x)=>n+(x.transaction_type==='income'?Number(x.amount):0),0))",
    "setDonationIncome((t||[]).reduce((n,x)=>n+(x.transaction_type==='income'?Number(x.amount):-Number(x.amount)),0))"
  );
  fn=fn.replace(
    "إجمالي تبرعات الجمعة: {money(donationIncome)} · المصروف: {money(paidTotalAll)}",
    "صافي التبرعات بعد الخصومات: {money(donationIncome)} · المصروف للمساعدات: {money(paidTotalAll)}"
  );
  s=s.slice(0,start)+fn+s.slice(end);
}

fs.writeFileSync(path,s);

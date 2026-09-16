import fs from 'node:fs';

const path='src/main.jsx';
let s=fs.readFileSync(path,'utf8');

const oldHistory=`<div className="fund-history"><div className="panel-head"><div><h3>سجل الحركات المالية</h3><p>يشمل جميع الإيرادات والخصومات المسجلة على الصندوق.</p></div><span>{transactions.length} حركة</span></div>`;
const newHistory=`<div className="fund-history"><div className="panel-head"><div><h3>سجل الصرف والحركات المالية</h3><p>الأخضر = مبلغ دخل أو رصيد متاح، والأحمر = مبلغ تم صرفه أو خصمه.</p></div><span>{transactions.length} حركة</span></div><div className="fund-ledger-summary"><div className="fund-ledger-box available"><span>المتاح حاليًا</span><strong>{money(Math.max(0,donationBalance))}</strong><small>رصيد تبرعات الجمعة</small></div><div className="fund-ledger-box spent"><span>تم صرفه</span><strong>{money(donationExpenses)}</strong><small>إجمالي مصروفات تبرعات الجمعة</small></div><div className="fund-ledger-box available external"><span>المتاح خارجيًا</span><strong>{money(Math.max(0,externalBalance))}</strong><small>رصيد المبالغ الخارجية</small></div><div className="fund-ledger-box spent"><span>صُرف خارجيًا</span><strong>{money(externalExpenses)}</strong><small>إجمالي مصروفات المبالغ الخارجية</small></div></div><div className="fund-ledger-legend"><span className="legend-available">● متاح / إيراد</span><span className="legend-spent">● مصروف / خصم</span></div>`;
if(!s.includes('fund-ledger-summary')){
  if(!s.includes(oldHistory)) throw new Error('Fund history boundary not found');
  s=s.replace(oldHistory,newHistory);
}

// Add an explicit class to every financial movement row. The previous patch
// only supplied CSS for classes that the JSX never actually emitted, so the
// colors could not appear on individual rows. This transformation wraps the
// existing map output without changing its data or markup inside the row.
if(!s.includes('ledger-income') && !s.includes('ledger-expense')){
  const historyStart=s.indexOf('<div className="fund-history">');
  const mapStart=s.indexOf('transactions.map(',historyStart);
  if(historyStart>=0 && mapStart>historyStart){
    const arrow=s.indexOf('=>',mapStart);
    let p=s.indexOf('(',mapStart);
    let depth=0,quote=null,escaped=false,end=-1;
    for(;p<s.length;p++){
      const ch=s[p];
      if(quote){
        if(escaped) escaped=false;
        else if(ch==='\\') escaped=true;
        else if(ch===quote) quote=null;
        continue;
      }
      if(ch==='\"'||ch==="'"||ch==='`'){quote=ch;continue}
      if(ch==='(') depth++;
      else if(ch===')'){
        depth--;
        if(depth===0){end=p;break}
      }
    }
    if(arrow>mapStart && end>arrow){
      const body=s.slice(arrow+2,end);
      if(body.trim().startsWith('<')){
        const wrapped=`<div className={x.transaction_type==='income'?'ledger-income':'ledger-expense'}>${body}</div>`;
        s=s.slice(0,arrow+2)+wrapped+s.slice(end);
      }
    }
  }
}

const cssPath='src/styles.css';
let css=fs.readFileSync(cssPath,'utf8');
if(!css.includes('.fund-ledger-summary')){
  css+=`\n\n/* Fund ledger: make available and spent amounts immediately distinguishable */\n.fund-ledger-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:14px 0 8px}.fund-ledger-box{padding:13px 14px;border-radius:12px;border:1px solid}.fund-ledger-box span,.fund-ledger-box small{display:block}.fund-ledger-box span{font-size:.86rem;font-weight:700}.fund-ledger-box strong{display:block;font-size:1.25rem;margin:4px 0}.fund-ledger-box small{font-size:.76rem;opacity:.75}.fund-ledger-box.available{background:#edf8f0;border-color:#b9dfc3;color:#176b36}.fund-ledger-box.spent{background:#fff0ef;border-color:#efc1bd;color:#9b2d24}.fund-ledger-box.external{background:#eef5fb;border-color:#bfd8ed;color:#205d8e}.fund-ledger-legend{display:flex;gap:18px;flex-wrap:wrap;margin:4px 0 12px;font-size:.82rem;font-weight:700}.legend-available{color:#176b36}.legend-spent{color:#9b2d24}.fund-history .income-amount{color:#176b36}.fund-history .expense-amount{color:#9b2d24}.fund-history .transaction-badge.income{background:#edf8f0;color:#176b36;border:1px solid #b9dfc3}.fund-history .transaction-badge.expense{background:#fff0ef;color:#9b2d24;border:1px solid #efc1bd}.fund-history .ledger-income{color:#176b36;background:#edf8f0;border:1px solid #b9dfc3;border-radius:10px}.fund-history .ledger-expense{color:#9b2d24;background:#fff0ef;border:1px solid #efc1bd;border-radius:10px}@media(max-width:900px){.fund-ledger-summary{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.fund-ledger-summary{grid-template-columns:1fr}}\n`;
  fs.writeFileSync(cssPath,css);
}else if(!css.includes('.ledger-income')){
  css+=`\n.fund-history .ledger-income{color:#176b36;background:#edf8f0;border:1px solid #b9dfc3;border-radius:10px}.fund-history .ledger-expense{color:#9b2d24;background:#fff0ef;border:1px solid #efc1bd;border-radius:10px}\n`;
  fs.writeFileSync(cssPath,css);
}

fs.writeFileSync(path,s);
console.log('Fund ledger colors and available/spent summary added.');

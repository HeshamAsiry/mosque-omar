import fs from 'node:fs';

const path='src/main.jsx';
let s=fs.readFileSync(path,'utf8');

const oldHistory=`<div className="fund-history"><div className="panel-head"><div><h3>سجل الحركات المالية</h3><p>يشمل جميع الإيرادات والخصومات المسجلة على الصندوق.</p></div><span>{transactions.length} حركة</span></div>`;
const newHistory=`<div className="fund-history"><div className="panel-head"><div><h3>سجل الصرف والحركات المالية</h3><p>الأخضر = مبلغ دخل أو رصيد متاح، والأحمر = مبلغ تم صرفه أو خصمه.</p></div><span>{transactions.length} حركة</span></div><div className="fund-ledger-summary"><div className="fund-ledger-box available"><span>المتاح حاليًا</span><strong>{money(Math.max(0,donationBalance))}</strong><small>رصيد تبرعات الجمعة</small></div><div className="fund-ledger-box spent"><span>تم صرفه</span><strong>{money(donationExpenses)}</strong><small>إجمالي مصروفات تبرعات الجمعة</small></div><div className="fund-ledger-box available external"><span>المتاح خارجيًا</span><strong>{money(Math.max(0,externalBalance))}</strong><small>رصيد المبالغ الخارجية</small></div><div className="fund-ledger-box spent"><span>صُرف خارجيًا</span><strong>{money(externalExpenses)}</strong><small>إجمالي مصروفات المبالغ الخارجية</small></div></div><div className="fund-ledger-legend"><span className="legend-available">● متاح / إيراد</span><span className="legend-spent">● مصروف / خصم</span></div>`;
if(!s.includes('fund-ledger-summary')){
  if(!s.includes(oldHistory)) throw new Error('Fund history boundary not found');
  s=s.replace(oldHistory,newHistory);
}

// Inject the color class into the actual JSX returned by transactions.map().
// The previous version only handled an expression-bodied arrow and therefore
// silently skipped the common `=>{ return <...> }` form used by this ledger.
if(!s.includes('ledger-income')){
  const historyStart=s.indexOf('<div className="fund-history">');
  const mapStart=s.indexOf('transactions.map(',historyStart);
  if(historyStart>=0 && mapStart>historyStart){
    const callbackOpen=s.indexOf('(',mapStart)+'('.length;
    const arrow=s.indexOf('=>',callbackOpen);
    if(arrow>callbackOpen){
      const params=s.slice(callbackOpen,arrow).trim().replace(/^\(|\)$/g,'').trim();
      const itemVar=(params.split(',')[0]||'x').trim();
      const afterArrow=s.slice(arrow+2);
      const returnPos=afterArrow.indexOf('return ');
      const tagPos=returnPos>=0 ? afterArrow.indexOf('<',returnPos+7) : afterArrow.indexOf('<');
      if(tagPos>=0){
        const absTag=arrow+2+tagPos;
        const classPos=s.indexOf('className=',absTag);
        const tagEnd=s.indexOf('>',absTag);
        if(classPos>absTag && classPos<tagEnd){
          const quote=s[classPos+10];
          const valueStart=classPos+11;
          const valueEnd=s.indexOf(quote,valueStart);
          if((quote==='"'||quote==="'") && valueEnd>valueStart){
            const existing=s.slice(valueStart,valueEnd);
            const expr=`className={${JSON.stringify(existing)}+(${itemVar}.transaction_type==='income'?' ledger-income':' ledger-expense')}`;
            s=s.slice(0,classPos)+expr+s.slice(valueEnd+1);
          }
        }else if(tagEnd>absTag){
          const insert=` className={${itemVar}.transaction_type==='income'?'ledger-income':'ledger-expense'}`;
          s=s.slice(0,tagEnd)+insert+s.slice(tagEnd);
        }
      }
    }
  }
}

const cssPath='src/styles.css';
let css=fs.readFileSync(cssPath,'utf8');
const colorCss=`\n/* Fund ledger movement colors */\n.fund-history .ledger-income{color:#176b36!important;background:#edf8f0!important;border:1px solid #b9dfc3!important;border-radius:10px}\n.fund-history .ledger-expense{color:#9b2d24!important;background:#fff0ef!important;border:1px solid #efc1bd!important;border-radius:10px}\n.fund-history .ledger-income *{color:#176b36!important}\n.fund-history .ledger-expense *{color:#9b2d24!important}\n`;
if(!css.includes('.fund-history .ledger-income')) css+=colorCss;
fs.writeFileSync(cssPath,css);
fs.writeFileSync(path,s);
console.log('Fund ledger row colors injected reliably.');

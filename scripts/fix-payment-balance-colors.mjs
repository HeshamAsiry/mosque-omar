import fs from 'node:fs';

const mainPath='src/main.jsx';
let s=fs.readFileSync(mainPath,'utf8');

// Final isolated pass: force visible colors on the monthly payment balance cards.
s=s.replace(
  /<article className="stat(?: payment-total-card)? paid"><span>تم الصرف<\/span><strong>\{money\(paidTotal\)\}<\/strong>(?:<small>.*?<\/small>)?<\/article>/,
  '<article className="stat payment-total-card paid" style={{backgroundColor:\'#ecfdf3\',border:\'2px solid #86d5a4\'}}><span style={{color:\'#18733d\',fontWeight:800}}>تم الصرف</span><strong style={{color:\'#116b37\',fontSize:\'28px\',fontWeight:900}}>{money(paidTotal)}</strong><small style={{color:\'#18733d\',fontWeight:700}}>خرج من رصيد المسجد</small></article>'
);
s=s.replace(
  /<article className="stat(?: payment-total-card)? unpaid"><span>لم يتم الصرف<\/span><strong>\{money\(unpaidTotal\)\}<\/strong>(?:<small>.*?<\/small>)?<\/article>/,
  '<article className="stat payment-total-card unpaid" style={{backgroundColor:\'#fff1f0\',border:\'2px solid #efaaa4\'}}><span style={{color:\'#b52f27\',fontWeight:800}}>لم يتم الصرف</span><strong style={{color:\'#a32620\',fontSize:\'28px\',fontWeight:900}}>{money(unpaidTotal)}</strong><small style={{color:\'#a32620\',fontWeight:700}}>ما زال في رصيد المسجد ولم يُصرف</small></article>'
);

fs.writeFileSync(mainPath,s);

const cssPath='src/styles.css';
let css=fs.readFileSync(cssPath,'utf8');
css += `
/* Guaranteed monthly payment balance colors — final override */
.payment-page .payment-total-card.paid{background:#ecfdf3!important;border:2px solid #86d5a4!important}
.payment-page .payment-total-card.paid span,.payment-page .payment-total-card.paid strong,.payment-page .payment-total-card.paid small{color:#116b37!important}
.payment-page .payment-total-card.unpaid{background:#fff1f0!important;border:2px solid #efaaa4!important}
.payment-page .payment-total-card.unpaid span,.payment-page .payment-total-card.unpaid strong,.payment-page .payment-total-card.unpaid small{color:#a32620!important}
.payment-page .payment-total-card strong{font-size:28px!important;font-weight:900!important}
`;
fs.writeFileSync(cssPath,css);
console.log('Monthly payment balance colors forced in final build pass.');

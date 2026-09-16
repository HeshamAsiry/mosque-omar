import fs from 'node:fs';

const mainPath='src/main.jsx';
let s=fs.readFileSync(mainPath,'utf8');

// The monthly payment page creates plain .stat cards. Add explicit state classes
// to the two balance cards that represent money already paid vs still unpaid.
s=s.replace(
  '<article className="stat"><span>تم الصرف</span><strong>{money(paidTotal)}</strong></article>',
  '<article className="stat payment-total-card paid"><span>تم الصرف</span><strong>{money(paidTotal)}</strong><small>خرج من رصيد المسجد</small></article>'
);
s=s.replace(
  '<article className="stat"><span>لم يتم الصرف</span><strong>{money(unpaidTotal)}</strong></article>',
  '<article className="stat payment-total-card unpaid"><span>لم يتم الصرف</span><strong>{money(unpaidTotal)}</strong><small>ما زال في رصيد المسجد ولم يُصرف</small></article>'
);

const cssPath='src/styles.css';
let css=fs.readFileSync(cssPath,'utf8');
css += `
/* Monthly payment balance cards — paid vs remaining */
.payment-page .payment-total-card.paid{background:#ecfdf3!important;border:2px solid #86d5a4!important;box-shadow:0 4px 14px rgba(22,101,52,.08)!important}
.payment-page .payment-total-card.paid span,.payment-page .payment-total-card.paid strong,.payment-page .payment-total-card.paid small{color:#116b37!important}
.payment-page .payment-total-card.unpaid{background:#fff1f0!important;border:2px solid #efaaa4!important;box-shadow:0 4px 14px rgba(164,38,32,.08)!important}
.payment-page .payment-total-card.unpaid span,.payment-page .payment-total-card.unpaid strong,.payment-page .payment-total-card.unpaid small{color:#a32620!important}
.payment-page .payment-total-card strong{font-size:28px!important;font-weight:900!important}
.payment-page .payment-total-card small{display:block!important;margin-top:6px!important;font-size:12px!important;font-weight:700!important}
`;
fs.writeFileSync(mainPath,s);
fs.writeFileSync(cssPath,css);
console.log('Monthly payment balance cards now receive explicit paid/unpaid colors.');

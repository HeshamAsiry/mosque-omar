import fs from 'node:fs';

const path='src/main.jsx';
let s=fs.readFileSync(path,'utf8');

const oldHistory=`<div className="fund-history"><div className="panel-head"><div><h3>سجل الحركات المالية</h3><p>يشمل جميع الإيرادات والخصومات المسجلة على الصندوق.</p></div><span>{transactions.length} حركة</span></div>`;
const newHistory=`<div className="fund-history"><div className="panel-head"><div><h3>سجل الصرف والحركات المالية</h3><p>الأخضر = مبلغ دخل أو رصيد متاح، والأحمر = مبلغ تم صرفه أو خصمه.</p></div><span>{transactions.length} حركة</span></div><div className="fund-ledger-summary"><div className="fund-ledger-box available"><span>المتاح حاليًا</span><strong>{money(Math.max(0,donationBalance))}</strong><small>رصيد تبرعات الجمعة</small></div><div className="fund-ledger-box spent"><span>تم صرفه</span><strong>{money(donationExpenses)}</strong><small>إجمالي مصروفات تبرعات الجمعة</small></div><div className="fund-ledger-box available external"><span>المتاح خارجيًا</span><strong>{money(Math.max(0,externalBalance))}</strong><small>رصيد المبالغ الخارجية</small></div><div className="fund-ledger-box spent"><span>صُرف خارجيًا</span><strong>{money(externalExpenses)}</strong><small>إجمالي مصروفات المبالغ الخارجية</small></div></div><div className="fund-ledger-legend"><span className="legend-available">● متاح / إيراد</span><span className="legend-spent">● مصروف / خصم</span></div>`;
if(!s.includes('fund-ledger-summary') && s.includes(oldHistory)) s=s.replace(oldHistory,newHistory);

const cssPath='src/styles.css';
let css=fs.readFileSync(cssPath,'utf8');
const colorCss=`
/* Fund ledger summary and movement colors */
.fund-history .income-row{background:#f3fbf6!important}
.fund-history .expense-row{background:#fff5f4!important}
.fund-history .income-row:hover{background:#e9f7ee!important}
.fund-history .expense-row:hover{background:#ffebe9!important}
.fund-history .income-amount{color:#16713b!important}
.fund-history .expense-amount{color:#b52f27!important}
.fund-history .income-amount strong,.fund-history .expense-amount strong{font-weight:900;white-space:nowrap}
.fund-history .transaction-badge.income{background:#e8f6ed!important;color:#16713b!important;border:1px solid #bfe2cb!important}
.fund-history .transaction-badge.expense{background:#fdebea!important;color:#b52f27!important;border:1px solid #efc2be!important}
.fund-ledger-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:16px 0}
.fund-ledger-box{padding:14px 16px;border:1px solid #e3e7ed;border-radius:14px;background:#fff}
.fund-ledger-box.available{border-color:#bfe2cb;background:#f3fbf6}
.fund-ledger-box.spent{border-color:#efc2be;background:#fff5f4}
.fund-ledger-box span{display:block;font-size:12px;font-weight:700}
.fund-ledger-box strong{display:block;margin-top:5px;font-size:20px}
.fund-ledger-box.available strong{color:#16713b}.fund-ledger-box.spent strong{color:#b52f27}
.fund-ledger-box small{display:block;margin-top:4px;opacity:.7}
.fund-ledger-legend{display:flex;gap:18px;flex-wrap:wrap;margin:-4px 0 14px;font-size:12px;font-weight:800}
.legend-available{color:#16713b}.legend-spent{color:#b52f27}
@media(max-width:900px){.fund-ledger-summary{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:560px){.fund-ledger-summary{grid-template-columns:1fr}}
`;
if(!css.includes('Fund ledger summary and movement colors')) css+=colorCss;
fs.writeFileSync(cssPath,css);
console.log('Fund ledger summary/colors prepared without JSX row injection.');

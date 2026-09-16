import fs from 'node:fs';

const mainPath='src/main.jsx';
let s=fs.readFileSync(mainPath,'utf8');

// Final pass: style the actual movement rows in the fund ledger.
s=s.replace(
  "<tbody>{transactions.map(x=><tr key={x.id} className={x.transaction_type==='expense'?'expense-row':''}>",
  "<tbody>{transactions.map(x=><tr key={x.id} className={x.transaction_type==='expense'?'expense-row':'income-row'}>"
);
s=s.replace(
  "<td className={x.transaction_type==='expense'?'expense-amount':'income-amount'}><b>{x.transaction_type==='expense'?'−':'+'}{money(x.amount)}</b></td>",
  "<td className={x.transaction_type==='expense'?'expense-amount':'income-amount'}><strong>{x.transaction_type==='expense'?'−':'+'}{money(x.amount)}</strong></td>"
);

// Make the monthly payout table visually communicate paid vs unpaid states.
s=s.replace(
  "<tbody>{active.map((c,i)=>{const paid=isPaid(c.id);return <tr id={'payment-row-'+c.id} key={c.id}>",
  "<tbody>{active.map((c,i)=>{const paid=isPaid(c.id);return <tr id={'payment-row-'+c.id} key={c.id} className={paid?'payment-row paid':'payment-row unpaid'}>"
);
s=s.replace(
  "<td>{money(caseAmount(c,amounts))}</td><td><button disabled={busy} className={paid?'payment-toggle paid':'payment-toggle'}",
  "<td className={paid?'payment-amount paid':'payment-amount unpaid'}><strong>{money(caseAmount(c,amounts))}</strong></td><td><button disabled={busy} className={paid?'payment-toggle paid':'payment-toggle unpaid'}"
);

fs.writeFileSync(mainPath,s);

const fundCss='src/funds.css';
let f=fs.readFileSync(fundCss,'utf8');
const fundUi=`
/* Final movement ledger UI */
.fund-history tbody tr.income-row{background:#f6fcf8}
.fund-history tbody tr.expense-row{background:#fff7f6}
.fund-history tbody tr.income-row:hover{background:#edf9f1}
.fund-history tbody tr.expense-row:hover{background:#fff0ee}
.fund-history tbody tr.income-row td,.fund-history tbody tr.expense-row td{border-bottom-color:#e5e8ec}
.fund-history .income-amount{color:#16713b!important}
.fund-history .expense-amount{color:#b52f27!important}
.fund-history .income-amount strong,.fund-history .expense-amount strong{font-size:15px;font-weight:900;white-space:nowrap}
.fund-history .transaction-badge.income{background:#e8f6ed;color:#16713b;border:1px solid #bfe2cb}
.fund-history .transaction-badge.expense{background:#fdebea;color:#b52f27;border:1px solid #efc2be}
`;
if(!f.includes('Final movement ledger UI')) f+=fundUi;
fs.writeFileSync(fundCss,f);

const paymentCss='src/monthly-payments.css';
let p=fs.readFileSync(paymentCss,'utf8');
const paymentUi=`
/* Final monthly payout table UI */
.payment-table-wrap{border:1px solid #e3e7ed;border-radius:16px;overflow:auto;background:#fff;box-shadow:0 5px 18px rgba(16,24,40,.04)}
.payment-table{min-width:760px}
.payment-table th{height:46px;background:#f6f8fa;color:#667085;font-size:12px;border-bottom:1px solid #dde2e8}
.payment-table td{height:58px;padding:11px 14px}
.payment-table tbody tr{transition:background .15s ease}
.payment-table tbody tr.paid{background:#f5fbf7}
.payment-table tbody tr.unpaid{background:#fff8f7}
.payment-table tbody tr.paid:hover{background:#ebf8ef}
.payment-table tbody tr.unpaid:hover{background:#fff0ee}
.payment-table .payment-amount.paid{color:#16713b}
.payment-table .payment-amount.unpaid{color:#b52f27}
.payment-table .payment-amount strong{font-size:15px;font-weight:900;white-space:nowrap}
.payment-toggle.paid{border-color:#b9ddc5;background:#eaf7ee;color:#176f39}
.payment-toggle.unpaid{border-color:#efc2be;background:#fdeceb;color:#b52f27}
.payment-toggle{min-width:132px;font-size:12px}
@media(max-width:700px){.payment-table{min-width:760px}.payment-table th,.payment-table td{padding:10px 11px}}
`;
if(!p.includes('Final monthly payout table UI')) p+=paymentUi;
fs.writeFileSync(paymentCss,p);

console.log('Ledger and monthly payout UI finalized.');

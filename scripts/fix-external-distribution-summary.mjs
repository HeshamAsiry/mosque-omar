import fs from 'node:fs';

const path = 'src/main.jsx';
let s = fs.readFileSync(path, 'utf8');

// Keep the allocation engine unchanged, but show the user the two unit amounts only:
// one amount for every aid case and one amount for every orphan.
const start = s.indexOf('function ExternalDistribution(');
const end = s.indexOf('\ncreateRoot(', start);
if (start >= 0 && end > start) {
  let fn = s.slice(start, end);

  fn = fn.replace(
    "const distributed=rounded.reduce((n,r)=>n+r.amount,0),remainder=balance-distributed;",
    "const distributed=rounded.reduce((n,r)=>n+r.amount,0),remainder=balance-distributed;const aidUnit=rounded.find(r=>r.kind==='aid')?.amount||0,childUnit=rounded.find(r=>r.kind==='orphan')?.amount||0;"
  );

  const tableStart = fn.indexOf('<div className="distribution-table">');
  const noteMarker = '<div className="note" style={{marginTop:12}}>';
  const tableEnd = fn.indexOf(noteMarker, tableStart);

  if (tableStart >= 0 && tableEnd > tableStart) {
    const table = '<div className="distribution-table"><div><b>الفئة</b><b>النصيب لكل مستفيد</b></div><div><span><b>مساعدات</b></span><span><b>{money(aidUnit)}</b></span></div><div><span><b>ايتام</b></span><span><b>{money(childUnit)}</b></span></div></div>';
    fn = fn.slice(0, tableStart) + table + fn.slice(tableEnd);
  }

  s = s.slice(0, start) + fn + s.slice(end);
}

fs.writeFileSync(path, s);

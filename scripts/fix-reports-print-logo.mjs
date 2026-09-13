import fs from 'node:fs';

const path='src/main.jsx';
let s=fs.readFileSync(path,'utf8');

const old=`<img className="print-header-logo" style={{width:'42mm',height:'42mm',objectFit:'contain',display:'block',margin:'0 auto 2mm'}} src="/mosque-logo2.png" alt="شعار المسجد"/>`;
const replacement=`<div className="topbar-mosque-logo print-header-logo" aria-label="شعار المسجد"></div>`;

if(!s.includes(old)) throw new Error('Reports print logo markup not found');
s=s.replaceAll(old,replacement);

fs.writeFileSync(path,s);
console.log('Reports print logo now reuses the existing Vite-processed mosque logo asset.');

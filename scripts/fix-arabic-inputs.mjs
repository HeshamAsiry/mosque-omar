import fs from 'node:fs';
const path='src/main.jsx';
let s=fs.readFileSync(path,'utf8');
const helper=`\nconst hasEnglish=s=>/[A-Za-z]/.test(s||'');\n`;
if(!s.includes('const hasEnglish=')) s=s.replace("const money=n=>",helper+"const money=n=>");
const start=s.indexOf('function AddCase('), end=s.indexOf('function Family(',start);
if(start>=0&&end>start){let x=s.slice(start,end);x=x.replace("async function save(e){e.preventDefault();setError('');", "async function save(e){e.preventDefault();setError('');if([f.mother_name,f.address,f.notes,...kids.map(k=>k.name)].some(hasEnglish)){setError('يجب استخدام الحروف العربية في بيانات الحالة.');return}");s=s.slice(0,start)+x+s.slice(end)}
fs.writeFileSync(path,s);console.log('Arabic input validation patched');

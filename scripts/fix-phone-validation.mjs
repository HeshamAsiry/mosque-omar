import fs from 'node:fs';
const path='src/main.jsx';
let s=fs.readFileSync(path,'utf8');
const phoneInput='<input required type="tel" inputMode="numeric" pattern="[0-9]{11}" minLength={11} maxLength={11} value={f.phone} onChange={e=>setF({...f,phone:e.target.value.replace(/\\D/g,\'\').slice(0,11)})}/>';
s=s.replace(/<input required value=\{f\.phone\}onChange=\{e=>setF\(\{\.\.\.f,phone:e\.target\.value\}\)\}\/>/g,phoneInput);
s=s.replace(/<input value=\{f\.phone\}onChange=\{e=>setF\(\{\.\.\.f,phone:e\.target\.value\}\)\}\/>/g,phoneInput);
const addStart=s.indexOf('function AddCase('),addEnd=s.indexOf('function Family(',addStart);
if(addStart>=0&&addEnd>addStart){let x=s.slice(addStart,addEnd);x=x.replace(/async function save\(e\)\{e\.preventDefault\(\);setError\('\);/,"async function save(e){e.preventDefault();setError('');if(!/^\\d{11}$/.test(f.phone)){setError('رقم الهاتف يجب أن يتكون من 11 رقمًا بالضبط.');return}");s=s.slice(0,addStart)+x+s.slice(addEnd)}
const famStart=s.indexOf('function Family('),amtStart=s.indexOf('function Amounts(',famStart);
if(famStart>=0&&amtStart>famStart){let x=s.slice(famStart,amtStart);x=x.replace('async function save(){setBusy(true);',"async function save(){if(!/^\\d{11}$/.test(f.phone)){alert('رقم الهاتف يجب أن يتكون من 11 رقمًا بالضبط.');return}setBusy(true);");s=s.slice(0,famStart)+x+s.slice(amtStart)}
fs.writeFileSync(path,s);console.log('phone validation patched');

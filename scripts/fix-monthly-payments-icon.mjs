import fs from 'node:fs';
const path='src/main.jsx';
let s=fs.readFileSync(path,'utf8');
if(!s.includes("import{WalletCards}from'lucide-react'"))s=s.replace("import Users from'./components/Users';","import Users from'./components/Users';import{WalletCards}from'lucide-react';");
s=s.replace("['payments','سجل الصرف','💰']","['payments','سجل الصرف',<WalletCards size={18} strokeWidth={1.8}/>]");
s=s.replace('<b>⚠️ حالات تحتاج مراجعة</b>','<b>حالات تحتاج مراجعة</b>');
s=s.replace("<span>⚠️ لم يقبض شهرين متتاليين</span>","<span>لم يقبض شهرين متتاليين</span>");
fs.writeFileSync(path,s);

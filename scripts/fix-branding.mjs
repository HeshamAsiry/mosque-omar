import fs from 'node:fs';

const path='src/main.jsx';
let source=fs.readFileSync(path,'utf8');

if(!source.includes("import './branding.css';"))source=source.replace("import'./styles.css';","import'./styles.css';import'./branding.css';");

const header=/<header className="topbar">[\s\S]*?<\/header>/;
const replacement=`<header className="topbar"><div className="topbar-app-logo" aria-label="شعار كفالة"></div><div className="topbar-info"><div className="eyebrow">إدارة الكفالة والمساعدات</div><h1>نظام الكفالة</h1></div><div className="top-user"><span>{profile?.full_name||session.user.email}</span><b>{isAdmin?'Admin':'مراجع'}</b><button className="profile"onClick={()=>supabase.auth.signOut()}>خروج</button></div><div className="topbar-mosque-logo" aria-label="شعار المسجد"></div></header>`;
if(header.test(source))source=source.replace(header,replacement);

source=source.replace('<aside className="sidebar"><div className="brand">كفالة</div>','<aside className="sidebar">');

fs.writeFileSync(path,source);
console.log('branding layout patched');

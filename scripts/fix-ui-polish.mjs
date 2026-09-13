import fs from 'node:fs';

const path='src/main.jsx';
let s=fs.readFileSync(path,'utf8');

// Keep the fund page label Arabic-only so the sidebar never mixes Arabic and English.
s=s.replace("['funds','الصندوق','Wallet']", "['funds','الصندوق المالي','▣']");

// Load the reports-specific spacing layer once. The file contains presentation-only CSS.
if(!s.includes("import './reports.css';")){
  s=s.replace("import './styles.css';", "import './styles.css';import './reports.css';");
}

// Replace native browser alerts with a consistent RTL in-app alert dialog.
if(!s.includes('window.__kafalaStyledAlert')){
  const inject=`
if(!window.__kafalaStyledAlert){
  window.__kafalaStyledAlert=true;
  window.alert=(message)=>{
    const old=document.querySelector('[data-kafala-alert]');
    if(old)old.remove();
    const overlay=document.createElement('div');
    overlay.dataset.kafalaAlert='true';
    overlay.dir='rtl';
    overlay.style.cssText='position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(24,20,14,.42);backdrop-filter:blur(3px);font-family:inherit;';
    const card=document.createElement('div');
    card.style.cssText='width:min(440px,100%);background:#fff;border:1px solid rgba(48,39,27,.12);border-radius:20px;box-shadow:0 24px 70px rgba(0,0,0,.2);padding:24px;text-align:right;animation:kafalaAlertIn .18s ease-out;';
    const style=document.createElement('style');
    style.textContent='@keyframes kafalaAlertIn{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}';
    const head=document.createElement('div');
    head.style.cssText='display:flex;align-items:center;gap:12px;margin-bottom:14px;';
    const icon=document.createElement('div');
    icon.textContent='!';
    icon.style.cssText='width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:#f4ead8;color:#7b5b2e;font-weight:800;font-size:20px;flex:0 0 auto;';
    const title=document.createElement('strong');
    title.textContent='تنبيه';
    title.style.cssText='font-size:18px;color:#30271b;';
    head.append(icon,title);
    const text=document.createElement('p');
    text.textContent=String(message??'');
    text.style.cssText='margin:0 0 22px;color:#5d5549;font-size:15px;line-height:1.8;white-space:pre-wrap;';
    const button=document.createElement('button');
    button.type='button';
    button.textContent='حسنًا';
    button.style.cssText='width:100%;border:0;border-radius:12px;padding:11px 16px;background:#30271b;color:#fff;font:inherit;font-weight:700;cursor:pointer;';
    const close=()=>overlay.remove();
    button.addEventListener('click',close);
    overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
    card.append(head,text,button);
    overlay.appendChild(style);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    button.focus();
  };
}
`;
  const marker="const hasEnglish=";
  if(s.includes(marker))s=s.replace(marker,inject+"\n"+marker);
}

fs.writeFileSync(path,s);
console.log('UI alert, reports spacing, and Arabic fund label patched.');

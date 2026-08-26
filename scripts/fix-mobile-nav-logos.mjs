import fs from 'node:fs';
const path='src/styles.css';
let s=fs.readFileSync(path,'utf8');
const css = String.raw`
/* Mobile navigation and logo fixes */
@media (max-width: 768px){
  .topbar{min-height:86px;padding:12px 14px;gap:10px;overflow:hidden;}
  .topbar>div:first-child{min-width:0;}
  .topbar h1{font-size:20px;white-space:nowrap;}
  .top-user{min-width:max-content;gap:6px;}
  .top-user .profile{display:none;}
  .mobile-nav{position:fixed;left:0;right:0;bottom:0;z-index:1000;display:flex!important;flex-wrap:nowrap;overflow-x:auto;overflow-y:hidden;justify-content:flex-start;gap:4px;padding:8px max(8px,env(safe-area-inset-left)) calc(8px + env(safe-area-inset-bottom));background:var(--panel,#fff);border-top:1px solid rgba(0,0,0,.10);box-shadow:0 -4px 18px rgba(0,0,0,.08);scrollbar-width:none;}
  .mobile-nav::-webkit-scrollbar{display:none;}
  .mobile-nav .mobile{flex:0 0 76px;min-width:76px;height:58px;padding:5px 4px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;white-space:nowrap;}
  .mobile-nav .mobile span{font-size:20px;line-height:1;}
  .mobile-nav .mobile small{font-size:10px;line-height:1.2;}
  .main{padding-bottom:92px;}
  .sidebar{display:none;}
  .brand{opacity:1!important;}
}
.app-logo,.topbar .app-logo,.logo-app,.logo-app img{opacity:1!important;filter:none!important;mix-blend-mode:normal!important;}
`;
if(!s.includes('/* Mobile navigation and logo fixes */')) s += css;
fs.writeFileSync(path,s);
console.log('mobile navigation and logos patched');

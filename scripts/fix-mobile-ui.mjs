import fs from 'node:fs';
const main='src/main.jsx';
let source=fs.readFileSync(main,'utf8');
const old='<nav className="mobile-nav">{nav.slice(0,5).map(([id,label,icon])=><button key={id}className={page===id?\'mobile active\':\'mobile\'}onClick={()=>setPage(id)}><span>{icon}</span><small>{label}</small></button>)}</nav>';
const replacement='<MobileUI nav={nav} page={page} setPage={setPage} signOut={()=>supabase.auth.signOut()}/>';
if(source.includes(old)) source=source.replace(old,replacement);
if(!source.includes('function MobileUI(')){
 const marker='function Dashboard({cases,amounts,select,go})';
 const component=`function MobileUI({nav,page,setPage,signOut}){const[more,setMore]=useState(false);const primary=nav.slice(0,4);const rest=nav.slice(4);return <><nav className="mobile-nav"><div className="mobile-nav-inner">{primary.map(([id,label,icon])=><button key={id}className={page===id?'mobile active':'mobile'}onClick={()=>setPage(id)}><span>{icon}</span><small>{label}</small></button>)}<button className={more?'mobile active':'mobile'}onClick={()=>setMore(true)}><span>•••</span><small>المزيد</small></button></div></nav>{more&&<div className="mobile-menu-overlay"onClick={()=>setMore(false)}><section className="mobile-menu-sheet"onClick={e=>e.stopPropagation()}><div className="mobile-menu-head"><b>القائمة</b><button onClick={()=>setMore(false)}>×</button></div><div className="mobile-menu-grid">{rest.map(([id,label,icon])=><button key={id}className={page===id?'menu-item active':'menu-item'}onClick={()=>{setPage(id);setMore(false)}}><span>{icon}</span><b>{label}</b></button>)}<button className="menu-item logout"onClick={signOut}><span>↪</span><b>خروج</b></button></div></section></div>}</>}
`;
 source=source.replace(marker,component+marker);
}
fs.writeFileSync(main,source);

const cssPath='src/branding.css';
let css=fs.readFileSync(cssPath,'utf8');
const block=`\n/* Final mobile UI */\n@media(max-width:760px){\n  .topbar{min-height:108px!important;height:108px!important;padding:0!important;display:block!important;background:#fffdf8!important;overflow:hidden!important;}\n  .topbar-app-logo{right:10px!important;top:54px!important;width:112px!important;height:72px!important;transform:translateY(-50%)!important;background-size:contain!important;opacity:1!important;}\n  .topbar-mosque-logo{left:50%!important;top:54px!important;width:150px!important;height:96px!important;transform:translate(-50%,-50%)!important;background-size:145px 145px!important;}\n  .top-user{left:10px!important;top:54px!important;transform:translateY(-50%)!important;display:flex!important;z-index:3!important;}\n  .top-user .profile{display:block!important;font-size:11px!important;padding:8px 11px!important;background:#30271b!important;color:#d5d3c6!important;border:1px solid #30271b!important;opacity:1!important;}\n}\n`;
css=css.replace(/\/\* Final mobile UI \*\/[\s\S]*$/,'').trimEnd()+block;
fs.writeFileSync(cssPath,css+'\n');

const styles='src/styles.css';
let s=fs.readFileSync(styles,'utf8');
const ui=`\n/* Mobile UI redesign */\n@media(max-width:760px){\n  .mobile-nav{position:fixed!important;left:0!important;right:0!important;bottom:0!important;height:78px!important;z-index:1000!important;display:block!important;padding:0!important;background:#30271b!important;border-top:1px solid #5a4c3b!important;box-shadow:0 -6px 24px rgba(48,39,27,.18)!important;opacity:1!important;backdrop-filter:none!important;}\n  .mobile-nav-inner{height:100%;display:grid;grid-template-columns:repeat(5,1fr);direction:rtl;align-items:stretch;}\n  .mobile-nav .mobile{width:100%!important;min-width:0!important;height:100%!important;border:0!important;background:transparent!important;color:#c9c1b2!important;padding:7px 2px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:4px!important;font-size:18px!important;}\n  .mobile-nav .mobile span{font-size:21px!important;line-height:1!important;}\n  .mobile-nav .mobile small{font-size:10px!important;line-height:1.2!important;white-space:nowrap!important;}\n  .mobile-nav .mobile.active{background:#d5d3c6!important;color:#30271b!important;border-radius:12px!important;margin:5px 3px!important;height:68px!important;}\n  .mobile-menu-overlay{position:fixed!important;inset:0!important;z-index:1100!important;background:rgba(48,39,27,.48)!important;display:flex!important;align-items:flex-end!important;}\n  .mobile-menu-sheet{width:100%!important;background:#fffdf8!important;border-radius:22px 22px 0 0!important;padding:18px 16px calc(18px + env(safe-area-inset-bottom))!important;box-shadow:0 -15px 45px rgba(0,0,0,.2)!important;}\n  .mobile-menu-head{display:flex;justify-content:space-between;align-items:center;font-size:18px;padding:0 2px 14px;border-bottom:1px solid #e1dccf;}\n  .mobile-menu-head button{border:0;background:#eeeade;color:#30271b;width:34px;height:34px;border-radius:50%;font-size:22px;}\n  .mobile-menu-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:14px;}\n  .menu-item{min-height:62px;border:1px solid #e1dccf;background:#fff;border-radius:13px;color:#30271b;display:flex;align-items:center;justify-content:flex-start;gap:10px;padding:10px 13px;text-align:right;}\n  .menu-item span{font-size:20px;width:25px;text-align:center;}\n  .menu-item b{font-size:12px;}\n  .menu-item.active{background:#30271b;color:#d5d3c6;}\n  .menu-item.logout{color:#7f2b20;background:#fff7f4;border-color:#e5cfc7;}\n  .main{padding-bottom:98px!important;}\n  .sidebar{display:none!important;}\n}\n`;
if(!s.includes('/* Mobile UI redesign */'))s+=ui;
fs.writeFileSync(styles,s);

const pkg='package.json';
const p=JSON.parse(fs.readFileSync(pkg,'utf8'));
p.scripts.build=p.scripts.build.replace('&& vite build','&& node scripts/fix-mobile-ui.mjs && vite build');
fs.writeFileSync(pkg,JSON.stringify(p,null,2)+'\n');
console.log('mobile UI redesigned');

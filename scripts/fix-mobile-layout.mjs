import fs from 'node:fs';
const path='src/branding.css';
let css=fs.readFileSync(path,'utf8');
const block=`
/* Mobile layout refinement */
@media(max-width:760px){
  .topbar{min-height:104px!important;height:104px!important;padding:0 88px 0 58px!important;justify-content:center!important;overflow:hidden!important}
  .topbar-app-logo{right:5px!important;top:50%!important;width:78px!important;height:76px!important;transform:translateY(-50%)!important}
  .topbar-mosque-logo{left:50%!important;top:50%!important;width:116px!important;height:92px!important;background-size:112px 112px!important;transform:translate(-50%,-50%)!important}
  .top-user{left:6px!important;top:50%!important;transform:translateY(-50%)!important}
  .top-user .profile{font-size:10px!important;padding:6px 8px!important}
}
`;
css=css.replace(/\/\* Mobile layout refinement \*\/[\s\S]*$/,'').trimEnd()+block;
fs.writeFileSync(path,css);console.log('mobile branding layout patched');

const pkg='package.json';
const p=JSON.parse(fs.readFileSync(pkg,'utf8'));
const scripts=p.scripts||{};
if(!scripts['build'].includes('fix-mobile-layout.mjs')) scripts.build=scripts.build.replace('&& vite build','&& node scripts/fix-mobile-layout.mjs && vite build');
p.scripts=scripts;
fs.writeFileSync(pkg,JSON.stringify(p,null,2)+'\n');
console.log('mobile layout build hook patched');

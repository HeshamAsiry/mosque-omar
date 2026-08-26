import fs from 'node:fs';

// The archive workflow is implemented in the source application.
// This build hook is intentionally conservative: it only adds the
// archive navigation/style hooks when they are already present and
// never performs regex-based replacement of large JSX functions.
const file = 'src/main.jsx';
const cssFile = 'src/styles.css';
let source = fs.readFileSync(file, 'utf8');

// Keep this hook idempotent. Do not rewrite component bodies here.
if (source.includes("['archive','أرشيف الحالات'")) {
  let css = fs.readFileSync(cssFile, 'utf8');
  if (!css.includes('.archive-list{')) {
    css += `\n.archive-list{display:grid;gap:12px;margin-top:16px}.archive-item{display:flex;gap:12px;align-items:stretch}.archive-card{flex:1;min-width:0;border:1px solid #ded9ca;background:#fff;border-radius:14px;padding:15px;text-align:right;color:#30271b;display:grid;gap:7px}.archive-card:hover{border-color:#a69e8c;background:#faf8f1}.archive-title{display:flex;align-items:center;justify-content:space-between;gap:10px}.archive-status{background:#eeeade;color:#6f6557;border-radius:999px;padding:4px 9px;font-size:11px;font-weight:800}.archive-card>span{font-size:12px;color:#817765}.restore-action{border:1px solid #30271b;background:#d5d3c6;color:#30271b;border-radius:11px;padding:10px 16px;font-weight:800;min-width:175px;align-self:stretch;transition:.2s}.restore-action:hover{background:#30271b;color:#d5d3c6}@media(max-width:760px){.archive-item{flex-direction:column}.restore-action{width:100%;min-height:46px}}`;
    fs.writeFileSync(cssFile, css);
  }
}

fs.writeFileSync(file, source);
console.log('archive build hook completed safely');

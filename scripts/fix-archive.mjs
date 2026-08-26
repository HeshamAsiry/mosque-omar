import fs from 'node:fs';

const file = 'src/main.jsx';
let s = fs.readFileSync(file, 'utf8');

if (!s.includes("['archive','أرشيف الحالات'")) {
  s = s.replace("['external','التوزيع الخارجي','◇']", "['external','التوزيع الخارجي','◇'],['archive','أرشيف الحالات','▱']");
}

if (!s.includes("page==='archive'&&<ArchiveCases")) {
  s = s.replace("{page==='external'&&<ExternalDistribution cases={cases}/>", "{page==='external'&&<ExternalDistribution cases={cases}/>} {page==='archive'&&<ArchiveCases cases={cases}amounts={amounts}select={setSelected}refresh={loadCases}/> }");
}

if (!s.includes('function ArchiveCases(')) {
  const archiveFn = `function ArchiveCases({cases,amounts,select,refresh}){const list=cases.filter(c=>c.status==='archived').sort((a,b)=>new Date(b.deleted_at||0)-new Date(a.deleted_at||0));async function restore(e,c){e.stopPropagation();if(!confirm('هل تريد استعادة هذه الحالة إلى الحالات النشطة؟'))return;const{error}=await supabase.from('cases').update({status:'active',deleted_at:null,deleted_by:null,updated_at:new Date().toISOString()}).eq('id',c.id);if(error){alert(error.message);return}await audit('restore','case',c.id,{from:'archived',to:'active'});refresh()}return <section className="panel archive-panel"><div className="panel-head"><div><h2>أرشيف الحالات</h2><p>الحالات التي تم نقلها للأرشيف مع الاحتفاظ ببياناتها وسجل الإضافة والحذف.</p></div><span>{list.length} حالة</span></div>{list.length===0?<div className="empty">لا توجد حالات مؤرشفة.</div>:<div className="archive-list">{list.map(c=><div className="archive-item"key={c.id}><button className="archive-card"onClick={()=>select(c)}><div className="archive-title"><b>{c.mother_name}</b><span className="archive-status">مؤرشفة</span></div><span>{c.address||'بدون عنوان'} · {c.case_type==='aid'?'مساعدات':'كفالة أيتام'} · {money(caseAmount(c,amounts))}</span><span>تاريخ الحذف: {c.deleted_at?new Date(c.deleted_at).toLocaleString('ar-EG'):'—'}</span><span>أضافها: {c.created_by_name||c.created_by||'غير مسجل'} · حذفها: {c.deleted_by_name||c.deleted_by||'غير مسجل'}</span></button><button className="restore-action"onClick={e=>restore(e,c)}>استعادة للحالات النشطة</button></div>)}</div>}</section>}`;
  s = s.replace('function Children(', archiveFn+'\nfunction Children(');
}

s = s.replace(/supabase\.from\('cases'\)\.insert\(\{/g, "supabase.from('cases').insert({created_by:(await supabase.auth.getUser()).data.user?.id||null,");

const casesPattern = /function Cases\(\{cases,amounts,select\}\)\{[\s\S]*?\nfunction Waiting\(/;
const casesReplacement = `function Cases({cases,amounts,select}){const[q,setQ]=useState('');const list=cases.filter(c=>c.status==='active'&&(c.mother_name+' '+c.phone+' '+c.address).toLowerCase().includes(q.toLowerCase()));async function remove(c){if(!confirm('هل تريد نقل هذه الحالة إلى الأرشيف؟'))return;const{data:{user}}=await supabase.auth.getUser();const{error}=await supabase.from('cases').update({status:'archived',deleted_at:new Date().toISOString(),deleted_by:user?.id||null,updated_at:new Date().toISOString()}).eq('id',c.id);if(error){alert(error.message);return}await audit('archive','case',c.id,{mother_name:c.mother_name});location.reload()}return <section className="panel"><div className="panel-head"><div><h2>الحالات النشطة</h2><p>الحالات التي تصرف شهريًا حاليًا.</p></div><span>{list.length} حالة</span></div><input className="search-input"placeholder="بحث باسم الأم أو الهاتف أو العنوان..."value={q}onChange={e=>setQ(e.target.value)}/><div className="case-list">{list.map(c=><div className="case-row"key={c.id}><button className="case-card"onClick={()=>select(c)}><b>{c.mother_name}</b><span>{c.address} · {c.case_type==='aid'?'مساعدات':'كفالة أيتام'} · {money(caseAmount(c,amounts))}</span>{c.notes&&<em>⚠️</em>}</button><button className="danger-action"onClick={()=>remove(c)}>حذف</button></div>)}</div></section>}
function Waiting(`;
s = s.replace(casesPattern, casesReplacement);

const waitingPattern = /function Waiting\(\{cases,amounts,select,refresh\}\)\{[\s\S]*?\nfunction Children\(/;
const waitingReplacement = `function Waiting({cases,amounts,select,refresh}){const list=[...cases.filter(c=>c.status==='waiting')].sort((a,b)=>priority(b)-priority(a)||new Date(a.created_at)-new Date(b.created_at));async function activate(e,c){e.stopPropagation();const{error}=await supabase.from('cases').update({status:'active',updated_at:new Date().toISOString()}).eq('id',c.id);if(error){alert(error.message);return}await audit('activate','case',c.id,{from:'waiting',to:'active'});refresh()}async function remove(e,c){e.stopPropagation();if(!confirm('هل تريد نقل هذه الحالة إلى الأرشيف؟'))return;const{data:{user}}=await supabase.auth.getUser();const{error}=await supabase.from('cases').update({status:'archived',deleted_at:new Date().toISOString(),deleted_by:user?.id||null,updated_at:new Date().toISOString()}).eq('id',c.id);if(error){alert(error.message);return}await audit('archive','case',c.id,{mother_name:c.mother_name});refresh()}return <section className="panel"><div className="panel-head"><div><h2>قائمة الانتظار</h2><p>الأولوية: 5+ ← 4 ← 3 ← 2 ← 1 ← بدون أطفال.</p></div><span>{list.length} حالة</span></div><div className="waiting-list">{list.map((c,i)=><div className="waiting-item"key={c.id}><button className="waiting-card"onClick={()=>select(c)}><b>#{i+1} · {c.mother_name}</b><span>{c.address} · {priorityLabel(priority(c))} · {money(caseAmount(c,amounts))}</span>{c.notes&&<em>⚠️</em>}</button><button className="primary waiting-action"onClick={e=>activate(e,c)}>إدخال للحالات النشطة</button><button className="danger-action waiting-delete"onClick={e=>remove(e,c)}>حذف</button></div>)}</div></section>}
function Children(`;
s = s.replace(waitingPattern, waitingReplacement);

const loadPattern = /async function loadCases\(\)\{[\s\S]*?\}async function loadAmounts/;
const loadReplacement = `async function loadCases(){const{data}=await supabase.from('cases').select('*,children(*)').order('created_at',{ascending:false});const rows=data||[];const ids=[...new Set(rows.flatMap(c=>[c.created_by,c.deleted_by]).filter(Boolean))];let names={};if(ids.length){const{data:profiles}=await supabase.from('profiles').select('user_id,full_name').in('user_id',ids);(profiles||[]).forEach(p=>{names[p.user_id]=p.full_name})}setCases(rows.map(c=>({...c,created_by_name:names[c.created_by],deleted_by_name:names[c.deleted_by]})))}async function loadAmounts`;
s = s.replace(loadPattern, loadReplacement);

if (!s.includes('audit-meta')) {
  s = s.replace('<div className="tag">', `<div className="audit-meta"><span>أضاف الحالة: <b>{c.created_by_name||c.created_by||'غير مسجل'}</b></span>{c.status==='archived'&&<span>حذف الحالة: <b>{c.deleted_by_name||c.deleted_by||'غير مسجل'}</b> · {c.deleted_at?new Date(c.deleted_at).toLocaleString('ar-EG'):'—'}</span>}</div><div className="tag">`);
}

// Archive-specific styling is appended at build time so it remains isolated from the main stylesheet.
const cssFile='src/styles.css';
let css=fs.readFileSync(cssFile,'utf8');
if(!css.includes('.archive-item{')){
  css += `\n.archive-list{display:grid;gap:12px;margin-top:16px}.archive-item{display:flex;gap:12px;align-items:stretch}.archive-card{flex:1;min-width:0;border:1px solid #ded9ca;background:#fff;border-radius:14px;padding:15px;text-align:right;color:#30271b;display:grid;gap:7px}.archive-card:hover{border-color:#a69e8c;background:#faf8f1}.archive-title{display:flex;align-items:center;justify-content:space-between;gap:10px}.archive-status{background:#eeeade;color:#6f6557;border-radius:999px;padding:4px 9px;font-size:11px;font-weight:800}.archive-card>span:not(.archive-status){font-size:12px;color:#817765}.restore-action{border:1px solid #30271b;background:#d5d3c6;color:#30271b;border-radius:11px;padding:10px 16px;font-weight:800;min-width:175px;align-self:stretch;transition:.2s}.restore-action:hover{background:#30271b;color:#d5d3c6}@media(max-width:760px){.archive-item{flex-direction:column}.restore-action{width:100%;min-height:46px}}`;
  fs.writeFileSync(cssFile,css);
}

fs.writeFileSync(file,s);
console.log('archive workflow patched');

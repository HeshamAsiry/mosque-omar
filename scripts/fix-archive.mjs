import fs from 'node:fs';

const file='src/main.jsx';
let s=fs.readFileSync(file,'utf8');

if(!s.includes('function ArchiveCases(')){
  const archiveFn=`function ArchiveCases({cases,select}){const list=cases.filter(c=>c.status==='archived').sort((a,b)=>new Date(b.deleted_at||0)-new Date(a.deleted_at||0));return <section className="panel"><div className="panel-head"><div><h2>أرشيف الحالات</h2><p>الحالات المحذوفة محفوظة هنا مع تاريخ الحذف وبيانات من أضافها ومن حذفها.</p></div><span>{list.length} حالة</span></div><div className="case-list">{list.length===0?<div className="empty">لا توجد حالات مؤرشفة.</div>:list.map(c=><button key={c.id}onClick={()=>select(c)}><b>{c.mother_name}</b><span>{c.case_type==='aid'?'مساعدات':'كفالة أيتام'} · تم الحذف: {c.deleted_at?new Date(c.deleted_at).toLocaleString('ar-EG'): '—'}</span></button>)}</div></section>}`;
  s=s.replace('function Children(',archiveFn+'\nfunction Children(');
}

// Add archive to navigation.
s=s.replace("['external','التوزيع الخارجي','◇']];","['external','التوزيع الخارجي','◇'],['archive','أرشيف الحالات','▱']];");
// Ensure admin-only amount/user items remain after archive.
s=s.replace("if(isAdmin)nav.push(['amounts','المبالغ','▣'],['users','المستخدمون','♟']);","if(isAdmin)nav.push(['amounts','المبالغ','▣'],['users','المستخدمون','♟']);");
// Render archive page.
if(!s.includes("page==='archive'&&<ArchiveCases"))s=s.replace("{page==='users'&&isAdmin&&<Users currentUserId={session.user.id}/>","{page==='archive'&&<ArchiveCases cases={cases}select={setSelected}/>} {page==='users'&&isAdmin&&<Users currentUserId={session.user.id}/>");

// Archive instead of hard-delete for case actions when a delete handler exists.
s=s.replace(/await supabase\.from\('cases'\)\.delete\(\)\.eq\('id',c\.id\)/g,"await supabase.from('cases').update({status:'archived',deleted_at:new Date().toISOString(),deleted_by:(await supabase.auth.getUser()).data.user?.id,updated_at:new Date().toISOString()}).eq('id',c.id)");
s=s.replace(/supabase\.from\('cases'\)\.delete\(\)\.eq\('id',c\.id\)/g,"supabase.from('cases').update({status:'archived',deleted_at:new Date().toISOString(),deleted_by:(await supabase.auth.getUser()).data.user?.id,updated_at:new Date().toISOString()}).eq('id',c.id)");

// Keep archived cases out of normal calculations/lists.
s=s.replace("const active=cases.filter(c=>c.status==='active'),waiting=cases.filter(c=>c.status==='waiting')","const active=cases.filter(c=>c.status==='active'),waiting=cases.filter(c=>c.status==='waiting'),archived=cases.filter(c=>c.status==='archived')");
s=s.replace("<article className=\"stat\"><span>الأطفال المسجلون</span>","<article className=\"stat\"><span>الأرشيف</span><strong>{archived.length}</strong></article><article className=\"stat\"><span>الأطفال المسجلون</span>");

// Display audit metadata in family cards when those fields exist.
s=s.replace("<div className=\"tag\">", "<div className=\"audit-meta\"><span>أضاف الحالة: <b>{c.created_by_name||c.created_by||'غير مسجل'}</b></span>{c.status==='archived'&&<span>حذف الحالة: <b>{c.deleted_by_name||c.deleted_by||'غير مسجل'}</b> · {c.deleted_at?new Date(c.deleted_at).toLocaleString('ar-EG'):'—'}</span>}</div><div className=\"tag\">");

fs.writeFileSync(file,s);
console.log('archive patch applied');

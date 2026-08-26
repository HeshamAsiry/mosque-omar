import fs from 'node:fs';

const path = 'src/main.jsx';
let source = fs.readFileSync(path, 'utf8');

// Keep the production build compatible with Vite/Rolldown.
source = source.replaceAll('??', '||');

// Allow choosing whether a newly created case starts active or waiting.
source = source.replace(
  "<label>النوع *<select required value={f.case_type}onChange={e=>setF({...f,case_type:e.target.value})}><option value=\"\">اختر</option><option value=\"aid\">مساعدات</option><option value=\"orphan_sponsorship\">كفالة أيتام</option></select></label>",
  "<label>النوع *<select required value={f.case_type}onChange={e=>setF({...f,case_type:e.target.value})}><option value=\"\">اختر</option><option value=\"aid\">مساعدات</option><option value=\"orphan_sponsorship\">كفالة أيتام</option></select></label><label>حالة البداية *<select required value={f.status}onChange={e=>setF({...f,status:e.target.value})}><option value=\"active\">الحالات النشطة — تقبض شهريًا</option><option value=\"waiting\">قائمة الانتظار</option></select></label>"
);
source = source.replace(
  '<button className="primary save">إضافة إلى قائمة الانتظار</button>',
  '<button className="primary save">{f.status===\'active\'?\'إضافة إلى الحالات النشطة\':\'إضافة إلى قائمة الانتظار\'}</button>'
);

// Give the waiting-list page a direct action to move a case into active cases.
source = source.replace(
  "{page==='waiting'&&<Waiting cases={cases} amounts={amounts} select={setSelected}/>}",
  "{page==='waiting'&&<Waiting cases={cases} amounts={amounts} select={setSelected} refresh={loadCases}/> }"
);

const waitingPattern = /function Waiting\(\{cases,amounts,select\}\)\{.*?\}\nfunction Children/s;
const waitingReplacement = `function Waiting({cases,amounts,select,refresh}){const list=cases.filter(c=>c.status==='waiting').sort((a,b)=>(b.priority_override||b.children?.length||0)-(a.priority_override||a.children?.length||0));async function activate(e,id){e.stopPropagation();const{error}=await supabase.from('cases').update({status:'active',updated_at:new Date().toISOString()}).eq('id',id);if(!error){await audit('activate','case',id,{from:'waiting',to:'active'});refresh()}}return <section className="panel"><div className="panel-head"><h2>قائمة الانتظار</h2><span>{list.length} حالة</span></div><div className="case-list">{list.map((c,i)=><div className="waiting-item"key={c.id}><button className="waiting-card"onClick={()=>select(c)}><b>#{i+1} · {c.mother_name}</b><span>{c.address} · أولوية {c.priority_override||c.children?.length||0} · {money(caseAmount(c,amounts))}</span>{c.notes&&<em>🔔</em>}</button><button className="primary"onClick={e=>activate(e,c.id)}>إدخال للحالات النشطة</button></div>)}</div></section>}
function Children`;
source = source.replace(waitingPattern, waitingReplacement);

fs.writeFileSync(path, source);
`;

fs.writeFileSync(path, source);

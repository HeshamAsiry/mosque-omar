import fs from 'node:fs';

const path='src/main.jsx';
let source=fs.readFileSync(path,'utf8');

const filter=`<div className="case-filters"><button type="button" className={type==='all'?'filter active':'filter'} onClick={()=>setType('all')}>الكل</button><button type="button" className={type==='aid'?'filter active':'filter'} onClick={()=>setType('aid')}>مساعدات</button><button type="button" className={type==='orphan_sponsorship'?'filter active':'filter'} onClick={()=>setType('orphan_sponsorship')}>كفالة أيتام</button></div>`;

// Active cases: add a type filter without replacing the whole component.
source=source.replace(
  "function Cases({cases,amounts,select,refresh}){const[q,setQ]=useState(''),[profiles,setProfiles]=useState({});",
  "function Cases({cases,amounts,select,refresh}){const[q,setQ]=useState(''),[type,setType]=useState('all'),[profiles,setProfiles]=useState({});"
);
source=source.replace(
  "cases.filter(c=>c.status==='active'&&(c.mother_name+' '+(c.phone||'')+' '+(c.address||'')).toLowerCase().includes(q.toLowerCase()))",
  "cases.filter(c=>c.status==='active'&&(type==='all'||c.case_type===type)&&(c.mother_name+' '+(c.phone||'')+' '+(c.address||'')).toLowerCase().includes(q.toLowerCase()))"
);
source=source.replace(
  '<input className="search-input"placeholder="بحث باسم الأم أو الهاتف أو العنوان..."value={q}onChange={e=>setQ(e.target.value)}/><div className="case-list">',
  `<div className="list-toolbar"><input className="search-input"placeholder="بحث باسم الأم أو الهاتف أو العنوان..."value={q}onChange={e=>setQ(e.target.value)}/>${filter}</div><div className="case-list">`
);

// Waiting list: add the same filter.
source=source.replace(
  "function Waiting({cases,amounts,select,refresh}){const list=[...cases.filter(c=>c.status==='waiting')].sort",
  "function Waiting({cases,amounts,select,refresh}){const[type,setType]=useState('all');const list=[...cases.filter(c=>c.status==='waiting'&&(type==='all'||c.case_type===type))].sort"
);
source=source.replace(
  '<div className="panel-head"><div><h2>قائمة الانتظار</h2><p>الأولوية: 5+ ← 4 ← 3 ← 2 ← 1 ← بدون أطفال.</p></div><span>{list.length} حالة</span></div><div className="waiting-list">',
  `<div className="panel-head"><div><h2>قائمة الانتظار</h2><p>الأولوية: 5+ ← 4 ← 3 ← 2 ← 1 ← بدون أطفال.</p></div><span>{list.length} حالة</span></div>${filter}<div className="waiting-list">`
);

// Archive: add the same filter while preserving the archive metadata/actions.
source=source.replace(
  "function Archive({cases,amounts,refresh}){const list=cases.filter(c=>c.status==='archived')",
  "function Archive({cases,amounts,refresh}){const[type,setType]=useState('all');const list=cases.filter(c=>c.status==='archived'&&(type==='all'||c.case_type===type))"
);
source=source.replace(
  '<div className="panel-head"><div><h2>أرشيف الحالات</h2><p>كل الحالات المؤرشفة مع بيانات الإضافة والحذف.</p></div><span>{list.length} حالة</span></div><div className="archive-list">',
  `<div className="panel-head"><div><h2>أرشيف الحالات</h2><p>كل الحالات المؤرشفة مع بيانات الإضافة والحذف.</p></div><span>{list.length} حالة</span></div>${filter}<div className="archive-list">`
);

fs.writeFileSync(path,source);
console.log('case filters patched safely');

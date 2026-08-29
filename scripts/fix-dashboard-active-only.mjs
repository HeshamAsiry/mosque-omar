import fs from 'node:fs';

const path = 'src/main.jsx';
let source = fs.readFileSync(path, 'utf8');

const replacements = [
  [
    "const visible=cases.filter(c=>c.status==='active'||c.status==='waiting'),active=visible.filter(c=>c.status==='active'),waiting=visible.filter(c=>c.status==='waiting'),allKids=visible.flatMap(c=>c.children||[])",
    "const active=cases.filter(c=>c.status==='active'),waiting=cases.filter(c=>c.status==='waiting'),activeKids=active.flatMap(c=>c.children||[])"
  ],
  [
    "review=allKids.filter(c=>c.gender==='male'&&age(c.birth_date)>=18)",
    "review=activeKids.filter(c=>c.gender==='male'&&age(c.birth_date)>=18)"
  ],
  [
    "<span>ملخص سريع لأهم بيانات النظام.</span>",
    "<span>ملخص سريع لأهم بيانات الحالات النشطة.</span>"
  ],
  [
    "<article className=\"stat\"><span>إجمالي الأسر</span><strong>{visible.length}</strong></article><article className=\"stat\"><span>الحالات النشطة</span><strong>{active.length}</strong></article><article className=\"stat\"><span>قائمة الانتظار</span><strong>{waiting.length}</strong></article><article className=\"stat\"><span>الأطفال المسجلون</span><strong>{allKids.length}</strong></article>",
    "<article className=\"stat\"><span>إجمالي الأسر النشطة</span><strong>{active.length}</strong></article><article className=\"stat\"><span>الحالات النشطة</span><strong>{active.length}</strong></article><article className=\"stat\"><span>الأطفال المسجلون</span><strong>{activeKids.length}</strong></article><article className=\"stat\"><span>قائمة الانتظار</span><strong>{waiting.length}</strong></article>"
  ],
  [
    "<strong>{review.length}</strong></article><article className=\"stat\"><span>الأطفال المؤهلون حاليًا</span><strong>{allKids.filter(eligible).length}</strong>",
    "<strong>{review.length}</strong></article><article className=\"stat\"><span>الأطفال المؤهلون حاليًا</span><strong>{activeKids.filter(eligible).length}</strong>"
  ],
  [
    "{visible.slice(0,8).map(c=><button key={c.id}onClick={()=>select(c)}><b>{c.mother_name}</b><span>{c.status==='active'?'نشطة':'في الانتظار'} · {c.case_type==='aid'?'مساعدات':'كفالة أيتام'} · {money(caseAmount(c,amounts))}</span>{c.notes&&<em>⚠️</em>}</button>)}",
    "{active.slice(0,8).map(c=><button key={c.id}onClick={()=>select(c)}><b>{c.mother_name}</b><span>نشطة · {c.case_type==='aid'?'مساعدات':'كفالة أيتام'} · {money(caseAmount(c,amounts))}</span>{c.notes&&<em>⚠️</em>}</button>)}"
  ]
];

for (const [from, to] of replacements) {
  if (!source.includes(from)) {
    console.log(`Dashboard patch skipped: pattern not found: ${from.slice(0, 80)}...`);
    continue;
  }
  source = source.replace(from, to);
}

fs.writeFileSync(path, source);
console.log('Dashboard active-only patch applied.');

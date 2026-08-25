import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const stats = [
  ['إجمالي الحالات', '0'],
  ['كفالة أيتام', '0'],
  ['مساعدات', '0'],
  ['الأطفال المكفولون', '0'],
];

function App() {
  const [active, setActive] = useState('dashboard');

  const nav = [
    ['dashboard', 'لوحة التحكم', '⌂'],
    ['cases', 'الحالات', '◉'],
    ['add', 'إضافة حالة', '+'],
    ['waiting', 'قائمة الانتظار', '≡'],
    ['children', 'الأطفال', '♙'],
    ['amounts', 'المبالغ', '▣'],
    ['reports', 'التقارير', '▤'],
  ];

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="eyebrow">إدارة الكفالة والمساعدات</div>
          <h1>نظام الكفالة</h1>
        </div>
        <button className="profile">المدير</button>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="brand">كفالة</div>
          {nav.map(([id, label, icon]) => (
            <button key={id} className={active === id ? 'nav active' : 'nav'} onClick={() => setActive(id)}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </aside>

        <main className="main">
          {active === 'dashboard' && <Dashboard />}
          {active === 'add' && <AddCase />}
          {active !== 'dashboard' && active !== 'add' && <Empty title={nav.find(x => x[0] === active)?.[1]} />}
        </main>
      </div>

      <nav className="mobile-nav">
        {nav.slice(0, 5).map(([id, label, icon]) => (
          <button key={id} className={active === id ? 'mobile active' : 'mobile'} onClick={() => setActive(id)}>
            <span>{icon}</span><small>{label}</small>
          </button>
        ))}
      </nav>
    </div>
  );
}

function Dashboard() {
  return <>
    <section className="welcome"><div><p>مرحبًا بك 👋</p><h2>لوحة التحكم</h2><span>ملخص سريع لأهم بيانات الكفالة والمساعدات.</span></div><button className="primary">+ إضافة حالة</button></section>
    <section className="stats">{stats.map(([label, value]) => <article className="stat" key={label}><span>{label}</span><strong>{value}</strong></article>)}</section>
    <section className="panel"><div className="panel-head"><h3>آخر الحالات</h3><button>عرض الكل</button></div><div className="empty">لا توجد حالات مضافة بعد</div></section>
  </>;
}

function AddCase() {
  return <section className="form-panel"><div className="panel-head"><div><h2>إضافة حالة جديدة</h2><p>أدخل بيانات الأم الأساسية ثم أضف الأبناء إذا كانت الحالة كفالة أيتام.</p></div></div><div className="form-grid"><label>اسم الأم *<input placeholder="اكتب اسم الأم" /></label><label>رقم الهاتف *<input inputMode="tel" placeholder="01xxxxxxxxx" /></label><label className="wide">العنوان *<input placeholder="العنوان بالتفصيل" /></label><label>نوع الحالة *<select defaultValue=""><option value="" disabled>اختر النوع</option><option>مساعدات</option><option>كفالة أيتام</option></select></label><label className="wide">ملاحظات <textarea placeholder="ملاحظات اختيارية للمراجعة والاستحقاق" /></label></div><div className="notice">سيتم حساب المبلغ تلقائيًا وفق إعدادات المبالغ وعدد الأبناء المؤهلين.</div><button className="primary save">حفظ الحالة</button></section>;
}

function Empty({ title }) { return <section className="panel"><h2>{title}</h2><div className="empty">سيتم بناء هذه الصفحة في المرحلة التالية.</div></section>; }

createRoot(document.getElementById('root')).render(<App />);

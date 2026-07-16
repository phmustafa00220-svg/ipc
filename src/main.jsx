import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, AlertTriangle, BarChart3, Bell, BookOpenCheck, Building2,
  CalendarDays, CheckCircle2, ChevronLeft, ClipboardCheck, Download,
  FileText, Filter, Hand, HeartPulse, LayoutDashboard, Menu, PackageSearch,
  Plus, Search, Settings, ShieldCheck, Sparkles, Syringe, Trash2, TrendingUp,
  UserRoundCheck, Users, X, Droplets, ThermometerSun, LogIn, LogOut, Eye, EyeOff
} from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'yad-infection-control-v1';
const todayISO = new Date().toISOString().slice(0, 10);

const initialState = {
  facilities: [
    { id: 1, name: 'مشفى الكرامة', city: 'حمص', type: 'مشفى', compliance: 92, status: 'ممتاز', lastVisit: '2026-07-14' },
    { id: 2, name: 'مركز الوعر الصحي', city: 'حمص', type: 'مركز صحي', compliance: 78, status: 'جيد', lastVisit: '2026-07-12' },
    { id: 3, name: 'مشفى الرحمة', city: 'حماة', type: 'مشفى', compliance: 64, status: 'يحتاج متابعة', lastVisit: '2026-07-09' },
    { id: 4, name: 'مركز بابا عمرو', city: 'حمص', type: 'مركز صحي', compliance: 85, status: 'جيد جداً', lastVisit: '2026-07-15' },
  ],
  inspections: [
    { id: 101, facility: 'مشفى الكرامة', area: 'غرف العمليات', score: 94, inspector: 'د. أحمد الخطيب', date: '2026-07-15', status: 'مكتمل' },
    { id: 102, facility: 'مركز الوعر الصحي', area: 'التعقيم المركزي', score: 76, inspector: 'سارة محمود', date: '2026-07-14', status: 'مكتمل' },
    { id: 103, facility: 'مشفى الرحمة', area: 'قسم الإسعاف', score: 61, inspector: 'د. محمد حمزة', date: '2026-07-13', status: 'إجراء تصحيحي' },
    { id: 104, facility: 'مركز بابا عمرو', area: 'العيادات', score: 87, inspector: 'نور علي', date: '2026-07-16', status: 'مكتمل' },
  ],
  incidents: [
    { id: 201, title: 'وخزة إبرة', facility: 'مشفى الرحمة', severity: 'عالية', date: '2026-07-15', owner: 'قسم التمريض', status: 'قيد المعالجة' },
    { id: 202, title: 'نقص معقم اليدين', facility: 'مركز الوعر الصحي', severity: 'متوسطة', date: '2026-07-14', owner: 'المستودع', status: 'مفتوحة' },
    { id: 203, title: 'خلل في فصل النفايات', facility: 'مشفى الكرامة', severity: 'منخفضة', date: '2026-07-12', owner: 'الخدمات', status: 'مغلقة' },
  ],
  trainings: [
    { id: 301, title: 'غسل اليدين وفق WHO', attendees: 32, facility: 'مشفى الكرامة', date: '2026-07-20', status: 'مجدولة' },
    { id: 302, title: 'إدارة النفايات الطبية', attendees: 18, facility: 'مركز الوعر الصحي', date: '2026-07-18', status: 'مجدولة' },
    { id: 303, title: 'الوقاية من وخز الإبر', attendees: 25, facility: 'مشفى الرحمة', date: '2026-07-10', status: 'منفذة' },
  ],
  supplies: [
    { id: 401, item: 'معقم يدين 500 مل', stock: 18, min: 25, unit: 'عبوة', status: 'منخفض' },
    { id: 402, item: 'قفازات طبية M', stock: 160, min: 80, unit: 'علبة', status: 'متوفر' },
    { id: 403, item: 'كمامات جراحية', stock: 42, min: 50, unit: 'علبة', status: 'منخفض' },
    { id: 404, item: 'أكياس نفايات خطرة', stock: 95, min: 40, unit: 'رزمة', status: 'متوفر' },
  ],
};

const navItems = [
  ['dashboard', 'لوحة التحكم', LayoutDashboard],
  ['facilities', 'المنشآت الصحية', Building2],
  ['inspections', 'الجولات والتقييمات', ClipboardCheck],
  ['incidents', 'الحوادث والمخاطر', AlertTriangle],
  ['training', 'التدريب والتوعية', BookOpenCheck],
  ['supplies', 'المخزون الوقائي', PackageSearch],
  ['reports', 'التقارير والتحليلات', BarChart3],
  ['settings', 'الإعدادات', Settings],
];

function cn(...classes) { return classes.filter(Boolean).join(' '); }
function scoreClass(score) { return score >= 85 ? 'good' : score >= 70 ? 'warn' : 'bad'; }
function severityClass(v) { return v === 'عالية' ? 'bad' : v === 'متوسطة' ? 'warn' : 'good'; }

function SystemApp({ onLogout, currentUser }) {
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialState; }
    catch { return initialState; }
  });
  const [page, setPage] = useState('dashboard');
  const [sidebar, setSidebar] = useState(false);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(data)), [data]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2600); return () => clearTimeout(t); }, [toast]);

  const stats = useMemo(() => {
    const avg = Math.round(data.facilities.reduce((a, f) => a + f.compliance, 0) / Math.max(data.facilities.length, 1));
    const openIncidents = data.incidents.filter(i => i.status !== 'مغلقة').length;
    const lowStock = data.supplies.filter(s => s.stock < s.min).length;
    return { avg, openIncidents, lowStock, inspections: data.inspections.length };
  }, [data]);

  function updateCollection(key, updater) {
    setData(prev => ({ ...prev, [key]: updater(prev[key]) }));
  }

  function addItem(key, item) {
    updateCollection(key, arr => [{ ...item, id: Date.now() }, ...arr]);
    setModal(null); setToast('تمت الإضافة وحفظ البيانات بنجاح');
  }

  function deleteItem(key, id) {
    updateCollection(key, arr => arr.filter(x => x.id !== id));
    setToast('تم حذف السجل');
  }

  const currentTitle = navItems.find(n => n[0] === page)?.[1];

  return <div className="app-shell">
    <aside className={cn('sidebar', sidebar && 'open')}>
      <div className="brand">
        <div className="brand-mark"><Hand size={27}/><HeartPulse size={16}/></div>
        <div><strong>يداً بيد</strong><span>نظام ضبط العدوى</span></div>
        <button className="icon-btn sidebar-close" onClick={() => setSidebar(false)}><X/></button>
      </div>
      <nav>{navItems.map(([id, label, Icon]) => <button key={id} className={cn('nav-item', page === id && 'active')} onClick={() => {setPage(id); setSidebar(false);}}><Icon size={20}/><span>{label}</span><ChevronLeft size={16}/></button>)}</nav>
      <div className="sidebar-card"><ShieldCheck/><strong>مؤشر السلامة العام</strong><div className="mini-progress"><span style={{width: `${stats.avg}%`}}/></div><small>{stats.avg}% امتثال للمعايير</small></div>
      <div className="sidebar-footer">الإصدار 1.0.1 · نسخة ويب محلية البيانات</div>
    </aside>

    {sidebar && <div className="backdrop" onClick={() => setSidebar(false)}/>}

    <main className="main">
      <header className="topbar">
        <div className="topbar-title"><button className="icon-btn mobile-menu" onClick={() => setSidebar(true)}><Menu/></button><div><span>منظمة يداً بيد للإغاثة والتنمية</span><h1>{currentTitle}</h1></div></div>
        <div className="top-actions">
          <div className="global-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="بحث سريع..."/></div>
          <button className="icon-btn notification"><Bell/><b>3</b></button>
          <div className="user"><div>{currentUser.name.slice(0,1)}</div><span><strong>{currentUser.name}</strong><small>{currentUser.role}</small></span></div><button className="icon-btn logout-btn" onClick={onLogout} title="تسجيل الخروج"><LogOut/></button>
        </div>
      </header>

      <div className="content">
        {page === 'dashboard' && <Dashboard data={data} stats={stats} setPage={setPage} setModal={setModal}/>} 
        {page === 'facilities' && <Facilities rows={data.facilities} query={query} onAdd={() => setModal('facility')} onDelete={id => deleteItem('facilities', id)}/>} 
        {page === 'inspections' && <Inspections rows={data.inspections} query={query} onAdd={() => setModal('inspection')} onDelete={id => deleteItem('inspections', id)}/>} 
        {page === 'incidents' && <Incidents rows={data.incidents} query={query} onAdd={() => setModal('incident')} onDelete={id => deleteItem('incidents', id)} updateCollection={updateCollection}/>} 
        {page === 'training' && <Training rows={data.trainings} query={query} onAdd={() => setModal('training')} onDelete={id => deleteItem('trainings', id)}/>} 
        {page === 'supplies' && <Supplies rows={data.supplies} query={query} onAdd={() => setModal('supply')} onDelete={id => deleteItem('supplies', id)}/>} 
        {page === 'reports' && <Reports data={data} stats={stats}/>} 
        {page === 'settings' && <SettingsPage data={data} setData={setData} toast={setToast}/>} 
      </div>
    </main>

    {modal && <Modal type={modal} data={data} onClose={() => setModal(null)} onSubmit={addItem}/>} 
    {toast && <div className="toast"><CheckCircle2 size={20}/>{toast}</div>}
  </div>;
}

function Dashboard({data, stats, setPage, setModal}) {
  const cards = [
    {label:'متوسط الامتثال', value:`${stats.avg}%`, icon:ShieldCheck, trend:'+4% هذا الشهر', tone:'teal'},
    {label:'الجولات المنفذة', value:stats.inspections, icon:ClipboardCheck, trend:'8 خلال آخر 30 يوماً', tone:'blue'},
    {label:'حوادث مفتوحة', value:stats.openIncidents, icon:AlertTriangle, trend:'تحتاج إلى متابعة', tone:'orange'},
    {label:'أصناف منخفضة', value:stats.lowStock, icon:PackageSearch, trend:'تحت الحد الأدنى', tone:'purple'},
  ];
  const recent = [...data.inspections].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4);
  return <>
    <section className="hero">
      <div><div className="eyebrow"><Sparkles size={15}/> مركز متابعة موحد</div><h2>صحة أفضل تبدأ بمنع العدوى</h2><p>تابع الامتثال، الجولات الميدانية، المخاطر، التدريب والمخزون الوقائي من شاشة واحدة.</p><div className="hero-actions"><button className="btn primary" onClick={()=>setModal('inspection')}><Plus/> جولة تقييم جديدة</button><button className="btn ghost" onClick={()=>setPage('reports')}><BarChart3/> عرض التقرير</button></div></div>
      <div className="hero-art"><div className="orbit o1"><Droplets/></div><div className="orbit o2"><Syringe/></div><div className="orbit o3"><ThermometerSun/></div><div className="hero-shield"><ShieldCheck size={76}/><span>{stats.avg}%</span></div></div>
    </section>
    <section className="stats-grid">{cards.map(({label,value,icon:Icon,trend,tone})=><article className="stat-card" key={label}><div className={`stat-icon ${tone}`}><Icon/></div><div><span>{label}</span><strong>{value}</strong><small>{trend}</small></div></article>)}</section>
    <section className="dashboard-grid">
      <article className="panel wide"><PanelHead title="مستوى الامتثال حسب المنشأة" subtitle="مقارنة مباشرة لأحدث نتائج المتابعة"/><div className="compliance-list">{data.facilities.map(f=><div className="compliance-row" key={f.id}><div><strong>{f.name}</strong><span>{f.city} · {f.type}</span></div><div className="progress"><span className={scoreClass(f.compliance)} style={{width:`${f.compliance}%`}}/></div><b>{f.compliance}%</b></div>)}</div></article>
      <article className="panel"><PanelHead title="توزيع المخاطر" subtitle="الحوادث المسجلة حسب الشدة"/><div className="risk-donut" style={{'--high': data.incidents.filter(i=>i.severity==='عالية').length*25+'deg','--medium': data.incidents.filter(i=>i.severity==='متوسطة').length*50+'deg'}}><div><strong>{data.incidents.length}</strong><span>حادثة</span></div></div><div className="legend"><span><i className="dot red"/>عالية</span><span><i className="dot yellow"/>متوسطة</span><span><i className="dot green"/>منخفضة</span></div></article>
      <article className="panel wide"><PanelHead title="آخر الجولات" subtitle="أحدث عمليات التدقيق الميداني" action={<button className="link-btn" onClick={()=>setPage('inspections')}>عرض الكل</button>}/><div className="compact-table">{recent.map(r=><div className="compact-row" key={r.id}><div className="round-icon"><ClipboardCheck/></div><div><strong>{r.facility}</strong><span>{r.area} · {r.inspector}</span></div><div className={`score ${scoreClass(r.score)}`}>{r.score}%</div><time>{r.date}</time></div>)}</div></article>
      <article className="panel"><PanelHead title="الإجراءات السريعة" subtitle="اختصارات للمهام المتكررة"/><div className="quick-actions"><button onClick={()=>setModal('incident')}><AlertTriangle/>تسجيل حادثة</button><button onClick={()=>setModal('training')}><Users/>جلسة تدريب</button><button onClick={()=>setModal('supply')}><PackageSearch/>إضافة صنف</button><button onClick={()=>setModal('facility')}><Building2/>إضافة منشأة</button></div></article>
    </section>
  </>;
}

function PageHead({title, subtitle, onAdd, addLabel}) { return <div className="page-head"><div><h2>{title}</h2><p>{subtitle}</p></div>{onAdd&&<button className="btn primary" onClick={onAdd}><Plus/>{addLabel}</button>}</div>; }
function PanelHead({title,subtitle,action}) { return <div className="panel-head"><div><h3>{title}</h3><p>{subtitle}</p></div>{action}</div>; }
function Empty(){return <div className="empty"><Search/><strong>لا توجد نتائج مطابقة</strong><span>جرّب تغيير كلمة البحث</span></div>}
function TableWrap({children}){return <div className="table-wrap"><table>{children}</table></div>}
function DeleteButton({onClick}) { return <button className="table-icon danger" onClick={onClick} title="حذف"><Trash2 size={17}/></button> }

function Facilities({rows,query,onAdd,onDelete}) { const filtered=rows.filter(r=>Object.values(r).join(' ').includes(query)); return <><PageHead title="المنشآت الصحية" subtitle="إدارة المنشآت ومتابعة مستوى الالتزام في كل موقع" onAdd={onAdd} addLabel="إضافة منشأة"/><div className="cards-list">{filtered.length?filtered.map(f=><article className="facility-card" key={f.id}><div className="facility-icon"><Building2/></div><div className="facility-main"><div><h3>{f.name}</h3><span>{f.city} · {f.type}</span></div><span className={`badge ${scoreClass(f.compliance)}`}>{f.status}</span><div className="facility-score"><div><span>نسبة الامتثال</span><b>{f.compliance}%</b></div><div className="progress"><span className={scoreClass(f.compliance)} style={{width:`${f.compliance}%`}}/></div></div><small>آخر زيارة: {f.lastVisit}</small></div><DeleteButton onClick={()=>onDelete(f.id)}/></article>):<Empty/>}</div></> }

function Inspections({rows,query,onAdd,onDelete}) { const filtered=rows.filter(r=>Object.values(r).join(' ').includes(query)); return <><PageHead title="الجولات والتقييمات" subtitle="توثيق عمليات التدقيق وحساب درجات الامتثال" onAdd={onAdd} addLabel="جولة جديدة"/><section className="panel"><TableWrap><thead><tr><th>المنشأة</th><th>القسم</th><th>المفتش</th><th>التاريخ</th><th>الدرجة</th><th>الحالة</th><th/></tr></thead><tbody>{filtered.map(r=><tr key={r.id}><td><strong>{r.facility}</strong></td><td>{r.area}</td><td>{r.inspector}</td><td>{r.date}</td><td><span className={`score ${scoreClass(r.score)}`}>{r.score}%</span></td><td><span className={`badge ${r.status==='مكتمل'?'good':'warn'}`}>{r.status}</span></td><td><DeleteButton onClick={()=>onDelete(r.id)}/></td></tr>)}</tbody></TableWrap>{!filtered.length&&<Empty/>}</section></> }

function Incidents({rows,query,onAdd,onDelete,updateCollection}) { const filtered=rows.filter(r=>Object.values(r).join(' ').includes(query)); const close=id=>updateCollection('incidents',arr=>arr.map(x=>x.id===id?{...x,status:'مغلقة'}:x)); return <><PageHead title="الحوادث والمخاطر" subtitle="تسجيل الحوادث ومتابعة الإجراءات التصحيحية حتى الإغلاق" onAdd={onAdd} addLabel="تسجيل حادثة"/><div className="incident-grid">{filtered.length?filtered.map(i=><article className="incident-card" key={i.id}><div className="incident-top"><span className={`severity ${severityClass(i.severity)}`}><AlertTriangle/> {i.severity}</span><DeleteButton onClick={()=>onDelete(i.id)}/></div><h3>{i.title}</h3><p>{i.facility}</p><div className="meta-row"><span><Users/> {i.owner}</span><span><CalendarDays/> {i.date}</span></div><div className="incident-bottom"><span className={`badge ${i.status==='مغلقة'?'good':'warn'}`}>{i.status}</span>{i.status!=='مغلقة'&&<button className="small-btn" onClick={()=>close(i.id)}>إغلاق الحالة</button>}</div></article>):<Empty/>}</div></> }

function Training({rows,query,onAdd,onDelete}) { const filtered=rows.filter(r=>Object.values(r).join(' ').includes(query)); return <><PageHead title="التدريب والتوعية" subtitle="خطط التدريب وقياس تغطية الكوادر الصحية" onAdd={onAdd} addLabel="جلسة تدريب"/><div className="training-grid">{filtered.length?filtered.map(t=><article className="training-card" key={t.id}><div className="training-date"><strong>{new Date(t.date).getDate()}</strong><span>{new Date(t.date).toLocaleDateString('ar',{month:'short'})}</span></div><div><span className={`badge ${t.status==='منفذة'?'good':'blue'}`}>{t.status}</span><h3>{t.title}</h3><p>{t.facility}</p><div className="meta-row"><span><Users/> {t.attendees} مشارك</span><span><CalendarDays/> {t.date}</span></div></div><DeleteButton onClick={()=>onDelete(t.id)}/></article>):<Empty/>}</div></> }

function Supplies({rows,query,onAdd,onDelete}) { const filtered=rows.filter(r=>Object.values(r).join(' ').includes(query)); return <><PageHead title="المخزون الوقائي" subtitle="مراقبة مواد الوقاية والتنبيه قبل الوصول إلى حد النقص" onAdd={onAdd} addLabel="إضافة صنف"/><section className="panel"><TableWrap><thead><tr><th>الصنف</th><th>الرصيد</th><th>الحد الأدنى</th><th>الوحدة</th><th>مستوى المخزون</th><th/></tr></thead><tbody>{filtered.map(s=>{const pct=Math.min(100,Math.round(s.stock/Math.max(s.min,1)*60));return <tr key={s.id}><td><strong>{s.item}</strong></td><td>{s.stock}</td><td>{s.min}</td><td>{s.unit}</td><td><div className="stock-cell"><div className="progress"><span className={s.stock<s.min?'bad':'good'} style={{width:`${pct}%`}}/></div><span className={`badge ${s.stock<s.min?'bad':'good'}`}>{s.stock<s.min?'منخفض':'متوفر'}</span></div></td><td><DeleteButton onClick={()=>onDelete(s.id)}/></td></tr>})}</tbody></TableWrap>{!filtered.length&&<Empty/>}</section></> }

function Reports({data,stats}) {
  const exportCsv=()=>{
    const rows=[['المنشأة','المدينة','النوع','الامتثال','آخر زيارة'],...data.facilities.map(f=>[f.name,f.city,f.type,f.compliance,f.lastVisit])];
    const csv='\ufeff'+rows.map(r=>r.join(',')).join('\n'); const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='infection-control-report.csv'; a.click(); URL.revokeObjectURL(a.href);
  };
  return <><PageHead title="التقارير والتحليلات" subtitle="مؤشرات قابلة للطباعة والتصدير لاتخاذ القرار"/><div className="report-actions"><button className="btn primary" onClick={exportCsv}><Download/> تصدير CSV</button><button className="btn ghost" onClick={()=>window.print()}><FileText/> طباعة التقرير</button></div><section className="report-sheet"><div className="report-header"><div className="brand-mark"><Hand/><HeartPulse/></div><div><h2>تقرير ضبط العدوى</h2><p>منظمة يداً بيد للإغاثة والتنمية · {todayISO}</p></div></div><div className="report-kpis"><div><span>متوسط الامتثال</span><strong>{stats.avg}%</strong></div><div><span>عدد المنشآت</span><strong>{data.facilities.length}</strong></div><div><span>الجولات</span><strong>{data.inspections.length}</strong></div><div><span>الحوادث المفتوحة</span><strong>{stats.openIncidents}</strong></div></div><h3>ملخص المنشآت</h3>{data.facilities.map(f=><div className="report-line" key={f.id}><div><strong>{f.name}</strong><span>{f.city} · آخر زيارة {f.lastVisit}</span></div><div className="progress"><span className={scoreClass(f.compliance)} style={{width:`${f.compliance}%`}}/></div><b>{f.compliance}%</b></div>)}<div className="report-note"><ShieldCheck/><div><strong>الاستنتاج التنفيذي</strong><p>الأولوية الحالية هي دعم المنشآت التي تقل نسبة امتثالها عن 70%، وإغلاق الحوادث المفتوحة، وتأمين الأصناف التي انخفضت عن حد إعادة الطلب.</p></div></div></section></>;
}

function SettingsPage({data,setData,toast}) {
  const fileInputRef = useRef(null);
  const reset=()=>{setData(initialState);toast('تمت استعادة البيانات التجريبية');};
  const clear=()=>{setData({facilities:[],inspections:[],incidents:[],trainings:[],supplies:[]});toast('تم مسح جميع البيانات');};
  const backup=()=>{
    const payload={version:1,exportedAt:new Date().toISOString(),data};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=`infection-control-backup-${todayISO}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('تم تصدير نسخة احتياطية');
  };
  const importBackup=(event)=>{
    const file=event.target.files?.[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const parsed=JSON.parse(reader.result);
        const next=parsed.data || parsed;
        const required=['facilities','inspections','incidents','trainings','supplies'];
        if(!required.every(key=>Array.isArray(next[key])))throw new Error('Invalid backup');
        setData(next);
        toast('تم استيراد البيانات بنجاح');
      }catch{
        toast('تعذر قراءة ملف النسخة الاحتياطية');
      }finally{
        event.target.value='';
      }
    };
    reader.readAsText(file);
  };
  return <><PageHead title="الإعدادات" subtitle="خيارات النظام والبيانات المحلية"/><div className="settings-grid"><section className="panel"><div className="setting-icon"><ShieldCheck/></div><h3>تخزين محلي بدون خادم</h3><p>يعمل النظام داخل المتصفح ويحتفظ بالبيانات على هذا الجهاز دون إرسالها إلى خادم خارجي. مناسب للتجربة أو الاستخدام الداخلي البسيط.</p><span className="badge good">مفعّل</span></section><section className="panel"><div className="setting-icon"><Activity/></div><h3>حالة النظام</h3><p>{data.facilities.length + data.inspections.length + data.incidents.length + data.trainings.length + data.supplies.length} سجل محفوظ حالياً.</p><span className="badge blue">جاهز للعمل</span></section><section className="panel danger-zone"><h3>النسخ الاحتياطي</h3><p>يمكن تصدير البيانات إلى ملف JSON واستيرادها لاحقاً على نفس الجهاز أو جهاز آخر.</p><div><button className="btn primary" onClick={backup}><Download/> تصدير نسخة</button><button className="btn ghost" onClick={()=>fileInputRef.current?.click()}>استيراد نسخة</button><input ref={fileInputRef} className="hidden-input" type="file" accept="application/json" onChange={importBackup}/></div></section><section className="panel danger-zone"><h3>إدارة البيانات</h3><p>يمكن استعادة البيانات التجريبية أو حذف جميع السجلات المخزنة على هذا الجهاز.</p><div><button className="btn ghost" onClick={reset}>استعادة البيانات</button><button className="btn danger-btn" onClick={clear}>مسح الكل</button></div></section></div></> }

function Modal({type,data,onClose,onSubmit}) {
  const configs={
    facility:{title:'إضافة منشأة صحية',key:'facilities',fields:[['name','اسم المنشأة'],['city','المدينة'],['type','النوع'],['compliance','نسبة الامتثال','number'],['lastVisit','تاريخ آخر زيارة','date']]},
    inspection:{title:'إضافة جولة تقييم',key:'inspections',fields:[['facility','المنشأة'],['area','القسم / المنطقة'],['inspector','اسم المفتش'],['date','التاريخ','date'],['score','الدرجة','number']]},
    incident:{title:'تسجيل حادثة',key:'incidents',fields:[['title','عنوان الحادثة'],['facility','المنشأة'],['severity','الشدة','select',['منخفضة','متوسطة','عالية']],['owner','الجهة المسؤولة'],['date','التاريخ','date']]},
    training:{title:'إضافة جلسة تدريب',key:'trainings',fields:[['title','عنوان التدريب'],['facility','المنشأة'],['attendees','عدد المشاركين','number'],['date','التاريخ','date'],['status','الحالة','select',['مجدولة','منفذة']]]},
    supply:{title:'إضافة صنف للمخزون',key:'supplies',fields:[['item','اسم الصنف'],['stock','الرصيد الحالي','number'],['min','الحد الأدنى','number'],['unit','الوحدة']]},
  };
  const c=configs[type]; const [form,setForm]=useState(()=>({date:todayISO,lastVisit:todayISO,type:'مركز صحي',severity:'متوسطة',status:type==='training'?'مجدولة':undefined,compliance:80,score:80}));
  const submit=e=>{e.preventDefault(); const item={...form}; ['score','compliance','stock','min','attendees'].forEach(k=>{if(item[k]!==undefined)item[k]=Number(item[k])}); if(type==='facility')item.status=item.compliance>=85?'ممتاز':item.compliance>=70?'جيد':'يحتاج متابعة'; if(type==='inspection')item.status=item.score>=70?'مكتمل':'إجراء تصحيحي'; if(type==='incident')item.status='مفتوحة'; if(type==='supply')item.status=item.stock<item.min?'منخفض':'متوفر'; onSubmit(c.key,item)};
  return <div className="modal-layer"><div className="modal"><div className="modal-head"><div><span>إدخال بيانات جديدة</span><h3>{c.title}</h3></div><button className="icon-btn" onClick={onClose}><X/></button></div><form onSubmit={submit}><div className="form-grid">{c.fields.map(([name,label,input='text',options])=><label key={name}><span>{label}</span>{input==='select'?<select required value={form[name]||''} onChange={e=>setForm({...form,[name]:e.target.value})}>{options.map(o=><option key={o}>{o}</option>)}</select>:<input required type={input} min={input==='number'?0:undefined} max={name==='score'||name==='compliance'?100:undefined} value={form[name]??''} onChange={e=>setForm({...form,[name]:e.target.value})}/>}</label>)}</div><div className="modal-actions"><button type="button" className="btn ghost" onClick={onClose}>إلغاء</button><button className="btn primary" type="submit"><CheckCircle2/> حفظ السجل</button></div></form></div></div>;
}

const AUTH_KEY = 'yad-infection-auth-session';
const DEMO_USERS = [
  { username: 'admin', password: 'Yad@2026', name: 'مدير النظام', role: 'مسؤول ضبط العدوى' },
  { username: 'viewer', password: 'Viewer@2026', name: 'مستخدم التقارير', role: 'مراقب' },
];

function LoginScreen({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const submit = (e) => {
    e.preventDefault();
    const found = DEMO_USERS.find(u => u.username === form.username.trim() && u.password === form.password);
    if (!found) { setError('اسم المستخدم أو كلمة المرور غير صحيحة'); return; }
    const safeUser = { username: found.username, name: found.name, role: found.role };
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(safeUser));
    onLogin(safeUser);
  };
  return <main className="login-page">
    <section className="login-visual">
      <div className="login-brand"><div className="brand-mark"><Hand size={30}/><HeartPulse size={18}/></div><div><strong>يداً بيد</strong><span>نظام إدارة ضبط العدوى</span></div></div>
      <div className="login-message"><span className="eyebrow"><ShieldCheck size={16}/> منصة متابعة آمنة</span><h1>نحو منشآت صحية أكثر أماناً</h1><p>إدارة الجولات، مؤشرات الامتثال، الحوادث، التدريب والمخزون الوقائي ضمن نظام عربي موحد.</p></div>
      <div className="login-features"><span><CheckCircle2/> متابعة لحظية</span><span><CheckCircle2/> تقارير واضحة</span><span><CheckCircle2/> بيانات محلية</span></div>
    </section>
    <section className="login-panel"><div className="login-card"><div className="login-icon"><UserRoundCheck/></div><span>مرحباً بعودتك</span><h2>تسجيل الدخول</h2><p>أدخل بيانات حسابك للوصول إلى لوحة التحكم.</p>
      <form onSubmit={submit} className="login-form">
        <label><span>اسم المستخدم</span><input autoFocus autoComplete="username" value={form.username} onChange={e=>{setForm({...form,username:e.target.value});setError('')}} placeholder="أدخل اسم المستخدم" required/></label>
        <label><span>كلمة المرور</span><div className="password-field"><input type={showPassword?'text':'password'} autoComplete="current-password" value={form.password} onChange={e=>{setForm({...form,password:e.target.value});setError('')}} placeholder="أدخل كلمة المرور" required/><button type="button" onClick={()=>setShowPassword(v=>!v)}>{showPassword?<EyeOff/>:<Eye/>}</button></div></label>
        {error && <div className="login-error"><AlertTriangle/>{error}</div>}
        <button className="btn primary login-submit" type="submit"><LogIn/> دخول إلى النظام</button>
      </form>
      <div className="demo-credentials"><strong>حساب التجربة</strong><span>اسم المستخدم: <b>admin</b></span><span>كلمة المرور: <b>Yad@2026</b></span></div>
      <small className="login-note">هذه النسخة تستخدم دخولاً محلياً للتجربة. عند الاستخدام الرسمي يجب ربطها بخدمة مصادقة وقاعدة بيانات.</small>
    </div></section>
  </main>;
}

function RootApp() {
  const [user, setUser] = useState(() => { try { return JSON.parse(sessionStorage.getItem(AUTH_KEY)); } catch { return null; } });
  const logout = () => { sessionStorage.removeItem(AUTH_KEY); setUser(null); };
  return user ? <SystemApp currentUser={user} onLogout={logout}/> : <LoginScreen onLogin={setUser}/>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><RootApp/></React.StrictMode>);

import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Filter,
  Hospital,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";
import "./styles.css";

const storageKey = "hihfad-ipc-control-v1";

const defaultData = {
  organization: "يداً بيد للإغاثة والتنمية",
  facilities: [
    {
      id: "ibn-al-walid",
      name: "مشفى ابن الوليد",
      city: "حمص",
      type: "مشفى عام",
      specialties: ["الجراحة", "الإسعاف", "العناية", "النسائية", "الأطفال"],
      status: "نشط",
    },
    {
      id: "hama-hospital",
      name: "مشفى حماه",
      city: "حماه",
      type: "نسائية وأطفال",
      specialties: ["التوليد", "الأطفال", "الحواضن", "الإسعاف"],
      status: "نشط",
    },
  ],
  users: [
    { id: "u1", name: "مصطفى الخطيب", role: "مدير النظام", facilityId: "all", department: "الإدارة" },
    { id: "u2", name: "مسؤول ضبط العدوى - ابن الوليد", role: "مسؤول ضبط العدوى", facilityId: "ibn-al-walid", department: "الجراحة" },
    { id: "u3", name: "ممرض تفقد - حماه", role: "عامل صحي", facilityId: "hama-hospital", department: "التوليد" },
  ],
  checklistTemplates: [
    {
      id: "ipc-daily",
      title: "قائمة تحقق ضبط العدوى اليومية",
      scope: "كل المنشآت",
      items: [
        "توفر مواد نظافة اليدين عند نقاط الرعاية",
        "التزام الكادر بنظافة اليدين قبل وبعد ملامسة المريض",
        "فرز النفايات الطبية والحادة في حاويات مطابقة",
        "توفر معدات الوقاية الشخصية واستخدامها حسب الخطورة",
        "تنظيف وتطهير الأسطح عالية اللمس وفق الجدول",
        "تعقيم الأدوات وإثبات دورة التعقيم",
        "وجود ملصقات إرشادية واضحة في الأقسام",
        "توثيق الحوادث والتعرض للوخز أو الرذاذ فوراً",
      ],
    },
    {
      id: "obs-gyn",
      title: "قائمة تحقق قسم النسائية والتوليد",
      scope: "النسائية والتوليد",
      items: [
        "تجهيز غرفة الولادة ونظافة الأسطح قبل كل حالة",
        "توفر مستلزمات الولادة النظيفة والمعقمة",
        "التخلص الآمن من المشيمة والنفايات الملوثة",
        "تطهير الأسرة والطاولات بين الحالات",
        "تطبيق احتياطات العزل عند الاشتباه بعدوى",
        "توثيق إجراءات التعقيم والتنظيف في نهاية الوردية",
      ],
    },
  ],
  reports: [
    {
      id: "r1",
      facilityId: "ibn-al-walid",
      department: "الجراحة",
      author: "مسؤول ضبط العدوى - ابن الوليد",
      type: "قائمة تحقق",
      priority: "متوسط",
      score: 82,
      status: "قيد المتابعة",
      date: "2026-07-16",
      title: "تفقد يومي لقسم الجراحة",
      notes: "التزام جيد، يلزم تعزيز توفر القفازات في نقطة الغيار.",
      actions: "تزويد القسم بعبوتين إضافيتين ومراجعة السجل غداً.",
    },
    {
      id: "r2",
      facilityId: "hama-hospital",
      department: "التوليد",
      author: "ممرض تفقد - حماه",
      type: "حادثة",
      priority: "عال",
      score: 64,
      status: "طارئ",
      date: "2026-07-16",
      title: "نقص مستلزمات حماية شخصية",
      notes: "تم تسجيل نقص كمامات في غرفة الولادة أثناء وردية المساء.",
      actions: "إبلاغ المدير المناوب وطلب توريد عاجل.",
    },
  ],
};

function loadData() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : defaultData;
  } catch {
    return defaultData;
  }
}

function App() {
  const [data, setData] = useState(loadData);
  const [activeUserId, setActiveUserId] = useState(data.users[0]?.id);
  const [view, setView] = useState("dashboard");
  const [facilityFilter, setFacilityFilter] = useState("all");
  const [query, setQuery] = useState("");

  const user = data.users.find((item) => item.id === activeUserId) || data.users[0];
  const isManager = user?.role === "مدير النظام" || user?.role === "مدير منشأة";

  function persist(nextData) {
    setData(nextData);
    localStorage.setItem(storageKey, JSON.stringify(nextData));
  }

  function addReport(payload) {
    const report = {
      id: `r${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      author: user.name,
      status: payload.priority === "عال" ? "طارئ" : "جديد",
      ...payload,
    };
    persist({ ...data, reports: [report, ...data.reports] });
    setView("reports");
  }

  function addFacility(payload) {
    const id = payload.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    persist({ ...data, facilities: [...data.facilities, { id, status: "نشط", ...payload }] });
  }

  function addUser(payload) {
    persist({ ...data, users: [...data.users, { id: `u${Date.now()}`, ...payload }] });
  }

  function addTemplate(payload) {
    persist({ ...data, checklistTemplates: [...data.checklistTemplates, { id: `t${Date.now()}`, ...payload }] });
  }

  function updateReportStatus(id, status) {
    persist({
      ...data,
      reports: data.reports.map((report) => (report.id === id ? { ...report, status } : report)),
    });
  }

  function resetDemo() {
    persist(defaultData);
    setActiveUserId(defaultData.users[0].id);
  }

  const visibleReports = useMemo(() => {
    return data.reports.filter((report) => {
      const allowed = user.facilityId === "all" || report.facilityId === user.facilityId;
      const facilityMatch = facilityFilter === "all" || report.facilityId === facilityFilter;
      const text = `${report.title} ${report.department} ${report.author} ${report.notes}`.toLowerCase();
      return allowed && facilityMatch && text.includes(query.toLowerCase());
    });
  }, [data.reports, facilityFilter, query, user]);

  const selectedFacilityName = (id) => data.facilities.find((facility) => facility.id === id)?.name || "كل المنشآت";
  const openCritical = visibleReports.filter((report) => report.priority === "عال" || report.status === "طارئ").length;
  const averageScore = visibleReports.length
    ? Math.round(visibleReports.reduce((sum, report) => sum + Number(report.score || 0), 0) / visibleReports.length)
    : 0;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><ShieldCheck size={28} /></div>
          <div>
            <strong>ضبط العدوى</strong>
            <span>{data.organization}</span>
          </div>
        </div>

        <nav className="nav">
          <NavButton icon={<LayoutDashboard />} label="لوحة المدير" active={view === "dashboard"} onClick={() => setView("dashboard")} />
          <NavButton icon={<ClipboardCheck />} label="قوائم التحقق" active={view === "checklists"} onClick={() => setView("checklists")} />
          <NavButton icon={<FileText />} label="التقارير" active={view === "reports"} onClick={() => setView("reports")} />
          <NavButton icon={<Hospital />} label="المنشآت" active={view === "facilities"} onClick={() => setView("facilities")} />
          <NavButton icon={<Users />} label="الموظفون والأدوار" active={view === "users"} onClick={() => setView("users")} />
          <NavButton icon={<Settings />} label="الإعدادات" active={view === "settings"} onClick={() => setView("settings")} />
        </nav>

        <div className="session-card">
          <label>الدخول كـ</label>
          <select value={activeUserId} onChange={(event) => setActiveUserId(event.target.value)}>
            {data.users.map((item) => (
              <option value={item.id} key={item.id}>{item.name} - {item.role}</option>
            ))}
          </select>
          <button className="ghost-button" onClick={resetDemo}><LogOut size={16} /> إعادة ضبط البيانات التجريبية</button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">نظام رقمي لإدارة الالتزام ومتابعة البلاغات</p>
            <h1>{viewTitle(view)}</h1>
          </div>
          <div className="top-actions">
            <div className="notice"><Bell size={18} /> {openCritical} تنبيه عالي</div>
            <button className="primary-button" onClick={() => setView("new-report")}><Plus size={18} /> تقرير جديد</button>
          </div>
        </header>

        <section className="workspace">
          {view === "dashboard" && (
            <Dashboard
              data={data}
              user={user}
              reports={visibleReports}
              averageScore={averageScore}
              openCritical={openCritical}
              selectedFacilityName={selectedFacilityName}
              facilityFilter={facilityFilter}
              setFacilityFilter={setFacilityFilter}
              query={query}
              setQuery={setQuery}
              updateReportStatus={updateReportStatus}
            />
          )}
          {view === "checklists" && <Checklists data={data} addTemplate={addTemplate} isManager={isManager} />}
          {view === "reports" && (
            <Reports
              data={data}
              reports={visibleReports}
              query={query}
              setQuery={setQuery}
              facilityFilter={facilityFilter}
              setFacilityFilter={setFacilityFilter}
              selectedFacilityName={selectedFacilityName}
              updateReportStatus={updateReportStatus}
            />
          )}
          {view === "facilities" && <Facilities data={data} addFacility={addFacility} isManager={isManager} />}
          {view === "users" && <UsersPanel data={data} addUser={addUser} isManager={isManager} />}
          {view === "settings" && <SettingsPanel data={data} user={user} />}
          {view === "new-report" && <NewReport data={data} user={user} addReport={addReport} />}
        </section>
      </main>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button className={`nav-button ${active ? "active" : ""}`} onClick={onClick}>
      {React.cloneElement(icon, { size: 19 })}
      <span>{label}</span>
    </button>
  );
}

function viewTitle(view) {
  const titles = {
    dashboard: "لوحة المتابعة الفورية",
    checklists: "قوائم التحقق ومقاييس الالتزام",
    reports: "مركز التقارير والبلاغات",
    facilities: "إدارة المنشآت الصحية",
    users: "إدارة الحسابات والأدوار",
    settings: "إعدادات النظام",
    "new-report": "إرسال تقرير جديد",
  };
  return titles[view] || "النظام";
}

function Dashboard({ data, reports, averageScore, openCritical, selectedFacilityName, facilityFilter, setFacilityFilter, query, setQuery, updateReportStatus }) {
  return (
    <>
      <div className="filters-row">
        <div className="search-box"><Search size={18} /><input placeholder="بحث في التقارير..." value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        <div className="select-box"><Filter size={18} /><select value={facilityFilter} onChange={(event) => setFacilityFilter(event.target.value)}><option value="all">كل المنشآت</option>{data.facilities.map((facility) => <option value={facility.id} key={facility.id}>{facility.name}</option>)}</select></div>
      </div>

      <div className="metrics-grid">
        <Metric icon={<Hospital />} label="المنشآت النشطة" value={data.facilities.length} tone="teal" />
        <Metric icon={<Users />} label="الحسابات" value={data.users.length} tone="blue" />
        <Metric icon={<BarChart3 />} label="متوسط الالتزام" value={`${averageScore}%`} tone="green" />
        <Metric icon={<AlertTriangle />} label="تنبيهات عالية" value={openCritical} tone="red" />
      </div>

      <div className="split-grid">
        <section className="panel">
          <div className="panel-header">
            <div><h2>التقارير الواردة</h2><p>{selectedFacilityName(facilityFilter)} - تحديث فوري داخل النظام</p></div>
          </div>
          <ReportList reports={reports.slice(0, 5)} data={data} updateReportStatus={updateReportStatus} />
        </section>

        <section className="panel">
          <div className="panel-header">
            <div><h2>خريطة الالتزام</h2><p>قراءة سريعة حسب المنشأة</p></div>
          </div>
          <div className="facility-score-list">
            {data.facilities.map((facility) => {
              const facilityReports = data.reports.filter((report) => report.facilityId === facility.id);
              const score = facilityReports.length ? Math.round(facilityReports.reduce((sum, report) => sum + report.score, 0) / facilityReports.length) : 0;
              return (
                <div className="score-row" key={facility.id}>
                  <span>{facility.name}</span>
                  <div className="progress"><i style={{ width: `${score}%` }} /></div>
                  <strong>{score}%</strong>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}

function Metric({ icon, label, value, tone }) {
  return (
    <div className={`metric metric-${tone}`}>
      <div className="metric-icon">{React.cloneElement(icon, { size: 22 })}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Reports({ data, reports, query, setQuery, facilityFilter, setFacilityFilter, updateReportStatus }) {
  return (
    <section className="panel">
      <div className="filters-row compact">
        <div className="search-box"><Search size={18} /><input placeholder="بحث حسب القسم أو الملاحظة..." value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        <div className="select-box"><Filter size={18} /><select value={facilityFilter} onChange={(event) => setFacilityFilter(event.target.value)}><option value="all">كل المنشآت</option>{data.facilities.map((facility) => <option value={facility.id} key={facility.id}>{facility.name}</option>)}</select></div>
      </div>
      <ReportList reports={reports} data={data} updateReportStatus={updateReportStatus} />
    </section>
  );
}

function ReportList({ reports, data, updateReportStatus }) {
  if (!reports.length) return <div className="empty-state"><Sparkles size={28} /> لا توجد تقارير مطابقة حالياً.</div>;
  return (
    <div className="report-list">
      {reports.map((report) => (
        <article className="report-card" key={report.id}>
          <div className="report-main">
            <div className={`priority-dot priority-${report.priority}`} />
            <div>
              <h3>{report.title}</h3>
              <p>{data.facilities.find((facility) => facility.id === report.facilityId)?.name} - {report.department} - {report.author}</p>
              <p className="report-note">{report.notes}</p>
              <small>{report.actions}</small>
            </div>
          </div>
          <div className="report-side">
            <span className={`status-pill status-${report.status}`}>{report.status}</span>
            <strong>{report.score}%</strong>
            <small>{report.date}</small>
            <select value={report.status} onChange={(event) => updateReportStatus(report.id, event.target.value)}>
              <option>جديد</option>
              <option>قيد المتابعة</option>
              <option>طارئ</option>
              <option>مغلق</option>
            </select>
          </div>
        </article>
      ))}
    </div>
  );
}

function Checklists({ data, addTemplate, isManager }) {
  const [title, setTitle] = useState("");
  const [scope, setScope] = useState("");
  const [items, setItems] = useState("");
  return (
    <div className="split-grid">
      <section className="panel">
        <div className="panel-header"><div><h2>النماذج المعتمدة</h2><p>يمكن استخدامها في التفقد اليومي والأسبوعي.</p></div></div>
        <div className="template-grid">
          {data.checklistTemplates.map((template) => (
            <article className="template-card" key={template.id}>
              <div><ClipboardCheck size={22} /><h3>{template.title}</h3></div>
              <p>{template.scope}</p>
              <ul>{template.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>
      <section className="panel form-panel">
        <h2>إضافة نموذج تحقق</h2>
        {!isManager && <p className="permission-note">الإضافة متاحة للمدير فقط في النسخة التشغيلية.</p>}
        <input placeholder="اسم النموذج" value={title} onChange={(event) => setTitle(event.target.value)} />
        <input placeholder="النطاق أو القسم" value={scope} onChange={(event) => setScope(event.target.value)} />
        <textarea placeholder="اكتب كل بند في سطر مستقل" value={items} onChange={(event) => setItems(event.target.value)} />
        <button className="primary-button" disabled={!title || !items} onClick={() => { addTemplate({ title, scope, items: items.split("\n").filter(Boolean) }); setTitle(""); setScope(""); setItems(""); }}><Plus size={18} /> حفظ النموذج</button>
      </section>
    </div>
  );
}

function Facilities({ data, addFacility, isManager }) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [specialties, setSpecialties] = useState("");
  return (
    <div className="split-grid">
      <section className="panel">
        <div className="facility-grid">
          {data.facilities.map((facility) => (
            <article className="facility-card" key={facility.id}>
              <Building2 size={24} />
              <h3>{facility.name}</h3>
              <p>{facility.city} - {facility.type}</p>
              <div className="tag-row">{facility.specialties.map((item) => <span key={item}>{item}</span>)}</div>
            </article>
          ))}
        </div>
      </section>
      <section className="panel form-panel">
        <h2>إضافة منشأة</h2>
        {!isManager && <p className="permission-note">هذه الصلاحية للمدير.</p>}
        <input placeholder="اسم المنشأة" value={name} onChange={(event) => setName(event.target.value)} />
        <input placeholder="المدينة" value={city} onChange={(event) => setCity(event.target.value)} />
        <input placeholder="نوع المنشأة" value={type} onChange={(event) => setType(event.target.value)} />
        <input placeholder="الاختصاصات مفصولة بفواصل" value={specialties} onChange={(event) => setSpecialties(event.target.value)} />
        <button className="primary-button" disabled={!name || !city} onClick={() => { addFacility({ name, city, type, specialties: specialties.split(",").map((item) => item.trim()).filter(Boolean) }); setName(""); setCity(""); setType(""); setSpecialties(""); }}><Plus size={18} /> إضافة</button>
      </section>
    </div>
  );
}

function UsersPanel({ data, addUser, isManager }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("عامل صحي");
  const [facilityId, setFacilityId] = useState(data.facilities[0]?.id || "all");
  const [department, setDepartment] = useState("");
  return (
    <div className="split-grid">
      <section className="panel">
        <div className="user-table">
          {data.users.map((item) => (
            <div className="user-row" key={item.id}>
              <UserCog size={20} />
              <strong>{item.name}</strong>
              <span>{item.role}</span>
              <span>{item.facilityId === "all" ? "كل المنشآت" : data.facilities.find((facility) => facility.id === item.facilityId)?.name}</span>
              <small>{item.department}</small>
            </div>
          ))}
        </div>
      </section>
      <section className="panel form-panel">
        <h2>إنشاء حساب عامل</h2>
        {!isManager && <p className="permission-note">إدارة الحسابات محصورة بالمدير.</p>}
        <input placeholder="اسم الموظف" value={name} onChange={(event) => setName(event.target.value)} />
        <select value={role} onChange={(event) => setRole(event.target.value)}><option>مدير النظام</option><option>مدير منشأة</option><option>مسؤول ضبط العدوى</option><option>عامل صحي</option></select>
        <select value={facilityId} onChange={(event) => setFacilityId(event.target.value)}><option value="all">كل المنشآت</option>{data.facilities.map((facility) => <option value={facility.id} key={facility.id}>{facility.name}</option>)}</select>
        <input placeholder="القسم" value={department} onChange={(event) => setDepartment(event.target.value)} />
        <button className="primary-button" disabled={!name} onClick={() => { addUser({ name, role, facilityId, department }); setName(""); setDepartment(""); }}><Plus size={18} /> إنشاء حساب</button>
      </section>
    </div>
  );
}

function NewReport({ data, user, addReport }) {
  const [facilityId, setFacilityId] = useState(user.facilityId === "all" ? data.facilities[0]?.id : user.facilityId);
  const facility = data.facilities.find((item) => item.id === facilityId);
  const [department, setDepartment] = useState(facility?.specialties[0] || "");
  const [type, setType] = useState("قائمة تحقق");
  const [priority, setPriority] = useState("متوسط");
  const [score, setScore] = useState(85);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [actions, setActions] = useState("");
  return (
    <section className="panel form-panel wide">
      <div className="form-grid">
        <label>المنشأة<select value={facilityId} onChange={(event) => { setFacilityId(event.target.value); const next = data.facilities.find((item) => item.id === event.target.value); setDepartment(next?.specialties[0] || ""); }}>{data.facilities.filter((item) => user.facilityId === "all" || item.id === user.facilityId).map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
        <label>القسم<select value={department} onChange={(event) => setDepartment(event.target.value)}>{(facility?.specialties || []).map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>نوع التقرير<select value={type} onChange={(event) => setType(event.target.value)}><option>قائمة تحقق</option><option>حادثة</option><option>جولة ميدانية</option><option>طلب مواد</option></select></label>
        <label>الأولوية<select value={priority} onChange={(event) => setPriority(event.target.value)}><option>منخفض</option><option>متوسط</option><option>عال</option></select></label>
        <label>مقياس الالتزام<input type="number" min="0" max="100" value={score} onChange={(event) => setScore(event.target.value)} /></label>
        <label>عنوان التقرير<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="مثال: تفقد غرفة الولادة" /></label>
      </div>
      <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="الملاحظات والنتائج..." />
      <textarea value={actions} onChange={(event) => setActions(event.target.value)} placeholder="الإجراءات التصحيحية المطلوبة..." />
      <button className="primary-button" disabled={!title || !notes} onClick={() => addReport({ facilityId, department, type, priority, score: Number(score), title, notes, actions })}><MessageSquare size={18} /> إرسال للمدير فوراً</button>
    </section>
  );
}

function SettingsPanel({ data, user }) {
  return (
    <section className="panel">
      <div className="settings-grid">
        <div><ShieldCheck size={26} /><h3>صلاحيات مبنية على الدور</h3><p>المدير يرى كل المنشآت، ومدير المنشأة يرى منشأته، والعامل يرسل تقاريره حسب القسم.</p></div>
        <div><Activity size={26} /><h3>متابعة فورية</h3><p>كل تقرير يظهر مباشرة في لوحة المدير مع حالة وأولوية ومقياس التزام.</p></div>
        <div><Stethoscope size={26} /><h3>قابل للتوسع</h3><p>يمكن إضافة منشآت واختصاصات ونماذج تحقق جديدة بدون تعديل الكود.</p></div>
        <div><CheckCircle2 size={26} /><h3>النسخة الحالية</h3><p>أنت مسجل حالياً كـ {user.name}. التخزين محلي للتجربة والنشر السريع.</p></div>
      </div>
    </section>
  );
}

createRoot(document.getElementById("root")).render(<App />);

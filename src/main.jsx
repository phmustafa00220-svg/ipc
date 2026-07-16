import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileText,
  Filter,
  Hospital,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserCog,
  Users,
} from "lucide-react";
import "./styles.css";

const storageKey = "hihfad-ipc-suite-v4";
const sessionKey = "hihfad-ipc-session-v2";
const today = new Date().toISOString().slice(0, 10);

const globalChecklistTemplates = [
  {
    id: "core-ipc",
    title: "التقييم العام لضبط العدوى - كل الأقسام",
    scope: "كل المنشآت",
    frequency: "يومي",
    category: "عام",
    items: [
      "وجود مسؤول واضح لضبط العدوى وخطة متابعة داخل القسم",
      "توفر مواد نظافة اليدين عند نقاط الرعاية",
      "التزام الكادر بنظافة اليدين قبل وبعد ملامسة المريض",
      "توفر معدات الوقاية الشخصية واستخدامها حسب نوع الإجراء",
      "فرز النفايات الطبية والحادة في حاويات مطابقة وموسومة",
      "عدم امتلاء حاويات الأدوات الحادة فوق الحد الآمن",
      "تنظيف وتطهير الأسطح عالية اللمس وفق جدول موثق",
      "تعقيم أو تطهير المعدات المشتركة بين المرضى",
      "تطبيق عزل مناسب عند الاشتباه بعدوى قابلة للانتقال",
      "توثيق الحوادث والتعرض للوخز أو الرذاذ فوراً",
    ],
  },
  {
    id: "hand-hygiene-who",
    title: "نظافة اليدين - لحظات WHO الخمس",
    scope: "كل نقاط الرعاية",
    frequency: "يومي",
    category: "نظافة اليدين",
    items: [
      "توفر معقم كحولي أو مغسلة فعالة عند نقطة الرعاية",
      "نظافة اليدين قبل ملامسة المريض",
      "نظافة اليدين قبل الإجراء النظيف أو المعقم",
      "نظافة اليدين بعد خطر التعرض لسوائل الجسم",
      "نظافة اليدين بعد ملامسة المريض",
      "نظافة اليدين بعد ملامسة محيط المريض",
      "عدم ارتداء خواتم أو أظافر صناعية أثناء الرعاية",
      "وجود ملاحظة مباشرة وتغذية راجعة للكادر",
    ],
  },
  {
    id: "emergency-triage",
    title: "الإسعاف والفرز والعزل الأولي",
    scope: "الإسعاف",
    frequency: "يومي",
    category: "الإسعاف",
    items: [
      "فرز المرضى ذوي الأعراض التنفسية أو الحمى عند الوصول",
      "توفر كمامات ومطهر يد في نقطة الاستقبال",
      "تطبيق مسار منفصل للحالات المشتبهة عند الحاجة",
      "تنظيف الكراسي والأسطح بعد الحالات عالية الخطورة",
      "تطهير النقالات والمعدات المشتركة بين المرضى",
      "توثيق حالات التعرض المهني والإبلاغ عنها",
      "توفر معدات الوقاية للعاملين في الفرز والإسعاف",
      "فرز النفايات الحادة والمعدية بشكل فوري",
    ],
  },
  {
    id: "surgery-or",
    title: "غرف العمليات والجراحة",
    scope: "الجراحة والعمليات",
    frequency: "يومي",
    category: "الجراحة",
    items: [
      "تأكيد تعقيم الأدوات ومؤشرات التعقيم قبل الاستخدام",
      "التزام الفريق بلباس العمليات ونظافة اليدين الجراحية",
      "تنظيف وتطهير غرفة العمليات بين الحالات",
      "توثيق تنظيف نهاية اليوم للغرفة والمعدات",
      "فصل الأدوات النظيفة عن الملوثة أثناء النقل",
      "التخلص الآمن من الأدوات الحادة داخل غرفة العمليات",
      "التزام الفريق بفتح الأدوات المعقمة بطريقة آمنة",
      "وجود سجل عدوى موضع العمل الجراحي ومراجعته",
    ],
  },
  {
    id: "icu-invasive-devices",
    title: "العناية المشددة والأجهزة الغازية",
    scope: "العناية",
    frequency: "يومي",
    category: "العناية",
    items: [
      "تطبيق نظافة اليدين قبل التعامل مع القثاطر والأنابيب",
      "تقييم يومي للحاجة للقثاطر الوريدية والبولية",
      "تطهير منافذ الحقن والوصلات قبل الاستخدام",
      "رفع رأس السرير للمرضى على التهوية عند عدم وجود مانع",
      "تنظيف أجهزة المراقبة والمضخات بين المرضى",
      "التزام العزل التماسي أو التنفسي عند الحاجة",
      "توثيق عدوى مرتبطة بالقثاطر أو التهوية ومراجعتها",
      "توفر معدات وقاية مناسبة عند سرير المريض",
    ],
  },
  {
    id: "obs-gyn-global",
    title: "النسائية والتوليد",
    scope: "النسائية والتوليد",
    frequency: "يومي",
    category: "التوليد",
    items: [
      "تجهيز غرفة الولادة ونظافة الأسطح قبل كل حالة",
      "توفر مستلزمات الولادة النظيفة والمعقمة",
      "التخلص الآمن من المشيمة والنفايات الملوثة",
      "تطهير الأسرة والطاولات بين الحالات",
      "تطبيق احتياطات العزل عند الاشتباه بعدوى",
      "توثيق التنظيف في نهاية الوردية",
      "تطبيق احتياطات السلامة عند التعامل مع الدم وسوائل الجسم",
      "توفر أدوات إنعاش الوليد نظيفة ومعقمة عند الحاجة",
    ],
  },
  {
    id: "pediatrics-neonatal",
    title: "الأطفال والحواضن",
    scope: "الأطفال والحواضن",
    frequency: "يومي",
    category: "الأطفال",
    items: [
      "تنظيف وتعقيم الحواضن حسب جدول موثق",
      "نظافة اليدين قبل وبعد التعامل مع كل طفل",
      "تخصيص أدوات لكل طفل قدر الإمكان",
      "تنظيف معدات الرضاعة والتحضير بطريقة آمنة",
      "عزل الأطفال المشتبه بعدوى معدية حسب الإمكانات",
      "تطهير أجهزة المراقبة والمجسات بين الاستخدامات",
      "فرز النفايات والحفاضات الملوثة بشكل آمن",
      "متابعة مؤشرات العدوى المرتبطة بالرعاية في القسم",
    ],
  },
  {
    id: "cssd-sterilization",
    title: "التعقيم المركزي وإعادة معالجة الأدوات",
    scope: "التعقيم",
    frequency: "يومي",
    category: "التعقيم",
    items: [
      "فصل مسار الأدوات الملوثة عن النظيفة والمعقمة",
      "ارتداء معدات الوقاية أثناء الغسل والتنظيف الأولي",
      "تنظيف الأدوات قبل التعقيم وفحصها بصرياً",
      "استخدام مؤشرات كيميائية أو بيولوجية حسب البروتوكول",
      "توثيق كل دورة تعقيم مع التاريخ والحمولة والنتيجة",
      "تخزين الأدوات المعقمة في مكان نظيف وجاف ومغلق",
      "عدم استخدام رزم تالفة أو رطبة أو منتهية الصلاحية",
      "وجود خطة صيانة ومعايرة لجهاز التعقيم",
    ],
  },
  {
    id: "environmental-cleaning",
    title: "النظافة البيئية وتطهير الأسطح",
    scope: "الخدمات والتنظيف",
    frequency: "يومي",
    category: "النظافة البيئية",
    items: [
      "وجود جدول تنظيف حسب خطورة المنطقة وتكرار الاستخدام",
      "استخدام مطهر مناسب بتركيز وزمن تماس صحيحين",
      "تنظيف الأسطح عالية اللمس أكثر من مرة يومياً",
      "تغيير أدوات التنظيف أو تطهيرها بين المناطق",
      "عدم خلط المنظفات والمطهرات بطريقة غير آمنة",
      "توفر معدات وقاية للعاملين بالنظافة",
      "توثيق أعمال التنظيف والمراجعة من المشرف",
      "وجود آلية تدقيق وملاحظات لتحسين الأداء",
    ],
  },
  {
    id: "waste-sharps",
    title: "النفايات الطبية والأدوات الحادة",
    scope: "كل الأقسام",
    frequency: "يومي",
    category: "النفايات",
    items: [
      "توفر حاويات حادة مقاومة للثقب قرب نقطة الاستخدام",
      "عدم إعادة تغطية الإبر بعد الاستخدام",
      "عدم امتلاء حاويات الحادة فوق ثلاثة أرباعها",
      "فرز النفايات المعدية والعامة حسب نظام الألوان المعتمد",
      "نقل النفايات بمسار ووقت آمنين",
      "تنظيف منطقة تجميع النفايات ومنع الوصول غير المصرح",
      "توفر معدات وقاية للعاملين بجمع النفايات",
      "توثيق حوادث الوخز والإجراءات المتخذة",
    ],
  },
  {
    id: "laboratory-safety",
    title: "المخبر وسلامة العينات",
    scope: "المخبر",
    frequency: "يومي",
    category: "المخبر",
    items: [
      "استلام العينات بعبوات محكمة وموسومة",
      "ارتداء القفازات والواقي العيني عند خطر الرذاذ",
      "التعامل مع الانسكابات وفق إجراء مكتوب",
      "تطهير أسطح العمل قبل وبعد الوردية",
      "التخلص من العينات والنفايات المخبرية بأمان",
      "توثيق التعرضات والحوادث المخبرية",
      "توفر مغسلة أو معقم يد داخل منطقة العمل",
      "منع الأكل والشرب وتخزين الطعام في منطقة المخبر",
    ],
  },
];

const roles = {
  ADMIN: "مدير النظام",
  FACILITY_MANAGER: "مدير منشأة",
  IPC_OFFICER: "مسؤول ضبط العدوى",
  HEALTH_WORKER: "عامل صحي",
};

const permissions = {
  [roles.ADMIN]: ["dashboard", "tasks", "daily", "checklists", "reports", "facilities", "users", "settings"],
  [roles.FACILITY_MANAGER]: ["dashboard", "tasks", "daily", "checklists", "reports", "users", "settings"],
  [roles.IPC_OFFICER]: ["dashboard", "tasks", "daily", "checklists", "reports", "settings"],
  [roles.HEALTH_WORKER]: ["tasks", "daily", "checklists", "reports", "settings"],
};

const defaultData = {
  organization: "يداً بيد للإغاثة والتنمية",
  facilities: [
    {
      id: "ibn-al-walid",
      name: "مشفى ابن الوليد",
      city: "حمص",
      type: "مشفى عام",
      departments: ["الجراحة", "الإسعاف", "العناية", "النسائية", "الأطفال", "التعقيم"],
      riskLevel: "عال",
      status: "نشط",
    },
    {
      id: "hama-hospital",
      name: "مشفى حماه",
      city: "حماه",
      type: "نسائية وأطفال",
      departments: ["التوليد", "الأطفال", "الحواضن", "الإسعاف", "التعقيم"],
      riskLevel: "متوسط",
      status: "نشط",
    },
  ],
  users: [
    {
      id: "u-admin",
      name: "مصطفى الخطيب",
      username: "admin",
      password: "admin123",
      role: roles.ADMIN,
      facilityId: "all",
      department: "الإدارة",
      status: "نشط",
    },
    {
      id: "u-ipc-ibn",
      name: "مسؤول ضبط العدوى - ابن الوليد",
      username: "ipc.ibn",
      password: "ipc123",
      role: roles.IPC_OFFICER,
      facilityId: "ibn-al-walid",
      department: "الجراحة",
      status: "نشط",
    },
    {
      id: "u-hama-nurse",
      name: "ممرض تفقد - حماه",
      username: "hama.nurse",
      password: "123456",
      role: roles.HEALTH_WORKER,
      facilityId: "hama-hospital",
      department: "التوليد",
      status: "نشط",
    },
  ],
  tasks: [
    {
      id: "t1",
      title: "تفقد نقاط نظافة اليدين",
      facilityId: "ibn-al-walid",
      department: "الجراحة",
      assignedTo: "u-ipc-ibn",
      dueDate: today,
      priority: "عال",
      status: "مفتوحة",
      description: "تأكيد توفر المعقمات والملصقات عند نقاط الرعاية.",
    },
    {
      id: "t2",
      title: "مراجعة غرفة الولادة",
      facilityId: "hama-hospital",
      department: "التوليد",
      assignedTo: "u-hama-nurse",
      dueDate: today,
      priority: "متوسط",
      status: "قيد التنفيذ",
      description: "توثيق جاهزية مستلزمات الوقاية والتخلص من النفايات.",
    },
  ],
  checklistTemplates: globalChecklistTemplates.concat([
    {
      id: "daily-ipc",
      title: "قائمة تحقق ضبط العدوى اليومية",
      scope: "كل المنشآت",
      frequency: "يومي",
      items: [
        "توفر مواد نظافة اليدين عند نقاط الرعاية",
        "التزام الكادر بنظافة اليدين قبل وبعد ملامسة المريض",
        "فرز النفايات الطبية والحادة في حاويات مطابقة",
        "توفر معدات الوقاية الشخصية واستخدامها حسب الخطورة",
        "تنظيف وتطهير الأسطح عالية اللمس وفق الجدول",
        "توثيق دورة التعقيم ومؤشراتها",
        "وجود ملصقات إرشادية واضحة في الأقسام",
        "توثيق الحوادث والتعرض للوخز أو الرذاذ فوراً",
      ],
    },
    {
      id: "obs-gyn",
      title: "قائمة تحقق النسائية والتوليد",
      scope: "النسائية والتوليد",
      frequency: "يومي",
      items: [
        "تجهيز غرفة الولادة ونظافة الأسطح قبل كل حالة",
        "توفر مستلزمات الولادة النظيفة والمعقمة",
        "التخلص الآمن من المشيمة والنفايات الملوثة",
        "تطهير الأسرة والطاولات بين الحالات",
        "تطبيق احتياطات العزل عند الاشتباه بعدوى",
        "توثيق التنظيف في نهاية الوردية",
      ],
    },
  ]),
  reports: [
    {
      id: "r1",
      date: today,
      facilityId: "ibn-al-walid",
      department: "الجراحة",
      authorId: "u-ipc-ibn",
      type: "تقرير يومي",
      priority: "متوسط",
      status: "قيد المتابعة",
      score: 82,
      title: "تفقد يومي لقسم الجراحة",
      notes: "الالتزام جيد، مع حاجة لتعزيز توفر القفازات في نقطة الغيار.",
      actions: "تزويد القسم بعبوتين إضافيتين ومراجعة السجل غداً.",
    },
    {
      id: "r2",
      date: today,
      facilityId: "hama-hospital",
      department: "التوليد",
      authorId: "u-hama-nurse",
      type: "حادثة",
      priority: "عال",
      status: "طارئ",
      score: 64,
      title: "نقص مستلزمات حماية شخصية",
      notes: "تم تسجيل نقص كمامات في غرفة الولادة أثناء وردية المساء.",
      actions: "إبلاغ المدير المناوب وطلب توريد عاجل.",
    },
  ],
  submissions: [],
};

function loadData() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return defaultData;
    const parsed = JSON.parse(saved);
    return {
      ...defaultData,
      ...parsed,
      users: parsed.users?.length ? parsed.users : defaultData.users,
      tasks: parsed.tasks || defaultData.tasks,
      submissions: parsed.submissions || [],
    };
  } catch {
    return defaultData;
  }
}

function allowedFor(user, item) {
  if (!user) return false;
  if (user.role === roles.ADMIN) return true;
  if (item.facilityId && user.facilityId !== item.facilityId) return false;
  if (user.role === roles.FACILITY_MANAGER) return true;
  if (item.assignedTo && item.assignedTo === user.id) return true;
  return !item.department || item.department === user.department;
}

function App() {
  const [data, setData] = useState(loadData);
  const [sessionUserId, setSessionUserId] = useState(() => sessionStorage.getItem(sessionKey));
  const user = data.users.find((item) => item.id === sessionUserId && item.status === "نشط");
  const firstView = permissions[user?.role]?.[0] || "dashboard";
  const [view, setView] = useState(firstView);
  const [facilityFilter, setFacilityFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [installPrompt, setInstallPrompt] = useState(null);

  React.useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/ipc/sw.js").catch(() => {});
    }
    const handler = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function persist(nextData) {
    setData(nextData);
    localStorage.setItem(storageKey, JSON.stringify(nextData));
  }

  function login(username, password) {
    const found = data.users.find(
      (item) => item.username.trim().toLowerCase() === username.trim().toLowerCase() && item.password === password && item.status === "نشط"
    );
    if (!found) return false;
    sessionStorage.setItem(sessionKey, found.id);
    setSessionUserId(found.id);
    setView(permissions[found.role][0]);
    return true;
  }

  function logout() {
    sessionStorage.removeItem(sessionKey);
    setSessionUserId(null);
  }

  function addReport(payload) {
    const report = {
      id: `r-${Date.now()}`,
      date: today,
      authorId: user.id,
      status: payload.priority === "عال" ? "طارئ" : "جديد",
      ...payload,
    };
    persist({ ...data, reports: [report, ...data.reports] });
    setView("reports");
  }

  function addSubmission(payload) {
    const checked = payload.answers.filter((item) => item.value === "نعم").length;
    const score = Math.round((checked / payload.answers.length) * 100);
    const submission = { id: `s-${Date.now()}`, date: today, authorId: user.id, score, ...payload };
    const report = {
      id: `r-${Date.now()}`,
      date: today,
      facilityId: payload.facilityId,
      department: payload.department,
      authorId: user.id,
      type: "قائمة تحقق",
      priority: score < 70 ? "عال" : score < 85 ? "متوسط" : "منخفض",
      status: score < 70 ? "طارئ" : "جديد",
      score,
      title: payload.templateTitle,
      notes: `نتيجة قائمة التحقق ${score}%. البنود غير المطابقة: ${payload.answers.filter((item) => item.value !== "نعم").map((item) => item.item).join("، ") || "لا يوجد"}.`,
      actions: payload.actions || "متابعة دورية حسب الخطة.",
    };
    persist({ ...data, submissions: [submission, ...data.submissions], reports: [report, ...data.reports] });
    setView("reports");
  }

  function addFacility(payload) {
    persist({
      ...data,
      facilities: [...data.facilities, { id: `f-${Date.now()}`, status: "نشط", riskLevel: "متوسط", ...payload }],
    });
  }

  function addUser(payload) {
    persist({ ...data, users: [...data.users, { id: `u-${Date.now()}`, status: "نشط", ...payload }] });
  }

  function addTask(payload) {
    persist({ ...data, tasks: [{ id: `task-${Date.now()}`, status: "مفتوحة", ...payload }, ...data.tasks] });
  }

  function updateTaskStatus(id, status) {
    persist({ ...data, tasks: data.tasks.map((task) => (task.id === id ? { ...task, status } : task)) });
  }

  function updateReportStatus(id, status) {
    persist({ ...data, reports: data.reports.map((report) => (report.id === id ? { ...report, status } : report)) });
  }

  function addTemplate(payload) {
    persist({ ...data, checklistTemplates: [...data.checklistTemplates, { id: `tpl-${Date.now()}`, ...payload }] });
  }

  function resetDemo() {
    localStorage.setItem(storageKey, JSON.stringify(defaultData));
    setData(defaultData);
    logout();
  }

  async function installApp() {
    if (!installPrompt) {
      alert("إذا لم يظهر زر التثبيت، افتح قائمة المتصفح واختر: تثبيت التطبيق أو Add to Home screen.");
      return;
    }
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  function generateReportPdf(report) {
    exportReportPdf(report, data, getUser(data, report.authorId)?.name || "غير معروف");
  }

  if (!user) return <Login data={data} onLogin={login} />;

  const canSee = new Set(permissions[user.role] || []);
  const safeView = canSee.has(view) ? view : firstView;
  const visibleReports = data.reports.filter((report) => {
    const facilityMatch = facilityFilter === "all" || report.facilityId === facilityFilter;
    const text = `${report.title} ${report.department} ${report.notes} ${getUser(data, report.authorId)?.name || ""}`.toLowerCase();
    return allowedFor(user, report) && facilityMatch && text.includes(query.toLowerCase());
  });
  const visibleTasks = data.tasks.filter((task) => allowedFor(user, task));
  const alerts = buildAlerts(data, visibleReports, visibleTasks, user);
  const averageScore = visibleReports.length ? Math.round(visibleReports.reduce((sum, report) => sum + Number(report.score || 0), 0) / visibleReports.length) : 0;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img className="brand-logo" src="/ipc/hihfad-logo.jpg" alt="HIHFAD" />
          <div>
            <strong>IPC Control</strong>
            <span>{data.organization}</span>
          </div>
        </div>

        <div className="profile-box">
          <div className="avatar">{user.name.slice(0, 1)}</div>
          <div>
            <strong>{user.name}</strong>
            <span>{user.role}</span>
            <small>{facilityName(data, user.facilityId)} - {user.department}</small>
          </div>
        </div>

        <nav className="nav">
          {canSee.has("dashboard") && <NavButton icon={<LayoutDashboard />} label="لوحة القيادة" active={safeView === "dashboard"} onClick={() => setView("dashboard")} />}
          {canSee.has("tasks") && <NavButton icon={<CalendarCheck />} label="المهام اليومية" active={safeView === "tasks"} onClick={() => setView("tasks")} />}
          {canSee.has("daily") && <NavButton icon={<MessageSquare />} label="تقرير يومي" active={safeView === "daily"} onClick={() => setView("daily")} />}
          {canSee.has("checklists") && <NavButton icon={<ClipboardCheck />} label="قوائم التحقق" active={safeView === "checklists"} onClick={() => setView("checklists")} />}
          {canSee.has("reports") && <NavButton icon={<FileText />} label="التقارير" active={safeView === "reports"} onClick={() => setView("reports")} />}
          {canSee.has("facilities") && <NavButton icon={<Hospital />} label="المنشآت" active={safeView === "facilities"} onClick={() => setView("facilities")} />}
          {canSee.has("users") && <NavButton icon={<Users />} label="المستخدمون" active={safeView === "users"} onClick={() => setView("users")} />}
          {canSee.has("settings") && <NavButton icon={<Settings />} label="الإعدادات" active={safeView === "settings"} onClick={() => setView("settings")} />}
        </nav>

        <div className="session-card">
          <button className="ghost-button" onClick={logout}><LogOut size={16} /> تسجيل الخروج</button>
          <button className="ghost-button subtle" onClick={resetDemo}>إعادة البيانات التجريبية</button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">نظام إدارة ضبط العدوى حسب الدور والمنشأة والقسم</p>
            <h1>{viewTitle(safeView)}</h1>
          </div>
          <div className="top-actions">
            <div className="notice"><Bell size={18} /> {alerts.length} تنبيه</div>
            <button className="secondary-button" onClick={installApp}><Download size={18} /> تثبيت التطبيق</button>
            <button className="primary-button" onClick={() => setView("daily")}><Plus size={18} /> تقرير اليوم</button>
          </div>
        </header>

        <section className="workspace">
          {safeView === "dashboard" && <Dashboard data={data} user={user} reports={visibleReports} tasks={visibleTasks} alerts={alerts} averageScore={averageScore} setView={setView} />}
          {safeView === "tasks" && <Tasks data={data} user={user} tasks={visibleTasks} addTask={addTask} updateTaskStatus={updateTaskStatus} />}
          {safeView === "daily" && <DailyReport data={data} user={user} addReport={addReport} />}
          {safeView === "checklists" && <Checklists data={data} user={user} addTemplate={addTemplate} addSubmission={addSubmission} />}
          {safeView === "reports" && <Reports data={data} reports={visibleReports} query={query} setQuery={setQuery} facilityFilter={facilityFilter} setFacilityFilter={setFacilityFilter} updateReportStatus={updateReportStatus} generateReportPdf={generateReportPdf} />}
          {safeView === "facilities" && <Facilities data={data} addFacility={addFacility} />}
          {safeView === "users" && <UsersPanel data={data} user={user} addUser={addUser} />}
          {safeView === "settings" && <SettingsPanel data={data} user={user} />}
        </section>
      </main>
    </div>
  );
}

function Login({ data, onLogin }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    if (!onLogin(username, password)) setError("اسم المستخدم أو كلمة المرور غير صحيحة.");
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-hero">
          <img className="login-logo" src="/ipc/hihfad-logo.jpg" alt="HIHFAD" />
          <p>منصة يداً بيد</p>
          <h1>نظام إدارة ضبط العدوى في المنشآت الصحية</h1>
          <span>تسجيل دخول حسب الدور، متابعة مهام يومية، قوائم تحقق، تقارير وتنبيهات فورية.</span>
        </div>
        <form className="login-card" onSubmit={submit}>
          <div>
            <Lock size={24} />
            <h2>تسجيل الدخول</h2>
            <p>ادخل بيانات الحساب المخصص لك.</p>
          </div>
          <label>اسم المستخدم<input value={username} onChange={(event) => setUsername(event.target.value)} /></label>
          <label>كلمة المرور<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {error && <div className="form-error">{error}</div>}
          <button className="primary-button">دخول</button>
          <div className="demo-users">
            <strong>حسابات تجريبية</strong>
            {data.users.slice(0, 3).map((item) => <button type="button" key={item.id} onClick={() => { setUsername(item.username); setPassword(item.password); }}>{item.username} / {item.password}</button>)}
          </div>
        </form>
      </section>
    </main>
  );
}

function Dashboard({ data, reports, tasks, alerts, averageScore, setView }) {
  const openTasks = tasks.filter((task) => task.status !== "مغلقة").length;
  const critical = reports.filter((report) => report.priority === "عال" || report.status === "طارئ").length;
  return (
    <>
      <div className="metrics-grid">
        <Metric icon={<Hospital />} label="المنشآت" value={data.facilities.length} tone="teal" />
        <Metric icon={<CalendarCheck />} label="مهام مفتوحة" value={openTasks} tone="blue" />
        <Metric icon={<BarChart3 />} label="متوسط الالتزام" value={`${averageScore}%`} tone="green" />
        <Metric icon={<AlertTriangle />} label="تنبيهات حرجة" value={critical} tone="red" />
      </div>
      <div className="split-grid">
        <section className="panel">
          <div className="panel-header"><div><h2>مركز التنبيهات</h2><p>مخاطر ومهام تحتاج متابعة اليوم.</p></div><button className="secondary-button" onClick={() => setView("tasks")}>فتح المهام</button></div>
          <div className="alert-list">
            {alerts.map((alert) => <div className={`alert-item alert-${alert.tone}`} key={alert.id}><AlertTriangle size={18} /><div><strong>{alert.title}</strong><p>{alert.body}</p></div></div>)}
            {!alerts.length && <div className="empty-state"><CheckCircle2 size={26} /> لا توجد تنبيهات حالياً.</div>}
          </div>
        </section>
        <section className="panel">
          <div className="panel-header"><div><h2>التزام المنشآت</h2><p>متوسط آخر التقارير حسب المنشأة.</p></div></div>
          <div className="facility-score-list">
            {data.facilities.map((facility) => {
              const facilityReports = reports.filter((report) => report.facilityId === facility.id);
              const score = facilityReports.length ? Math.round(facilityReports.reduce((sum, report) => sum + report.score, 0) / facilityReports.length) : 0;
              return <div className="score-row" key={facility.id}><span>{facility.name}</span><div className="progress"><i style={{ width: `${score}%` }} /></div><strong>{score}%</strong></div>;
            })}
          </div>
        </section>
      </div>
      <section className="panel">
        <div className="panel-header"><div><h2>آخر التقارير</h2><p>قراءة سريعة لما وصل للمدير.</p></div></div>
        <ReportList reports={reports.slice(0, 4)} data={data} />
      </section>
    </>
  );
}

function Tasks({ data, user, tasks, addTask, updateTaskStatus }) {
  const [form, setForm] = useState({ title: "", facilityId: user.facilityId === "all" ? data.facilities[0].id : user.facilityId, department: user.department, assignedTo: user.id, dueDate: today, priority: "متوسط", description: "" });
  const canAssign = [roles.ADMIN, roles.FACILITY_MANAGER, roles.IPC_OFFICER].includes(user.role);
  const facility = data.facilities.find((item) => item.id === form.facilityId);
  const assignees = data.users.filter((item) => item.facilityId === "all" || item.facilityId === form.facilityId);
  return (
    <div className="split-grid">
      <section className="panel">
        <div className="panel-header"><div><h2>مهامي ومهام الفريق</h2><p>كل مهمة مرتبطة بمنشأة وقسم وموعد.</p></div></div>
        <div className="task-list">
          {tasks.map((task) => <article className="task-card" key={task.id}><div><span className={`priority-badge priority-${task.priority}`}>{task.priority}</span><h3>{task.title}</h3><p>{facilityName(data, task.facilityId)} - {task.department}</p><small>{task.description}</small></div><div><strong>{task.dueDate}</strong><select value={task.status} onChange={(event) => updateTaskStatus(task.id, event.target.value)}><option>مفتوحة</option><option>قيد التنفيذ</option><option>مغلقة</option></select></div></article>)}
        </div>
      </section>
      {canAssign && <section className="panel form-panel">
        <h2>إضافة مهمة</h2>
        <input placeholder="عنوان المهمة" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        <select value={form.facilityId} onChange={(event) => setForm({ ...form, facilityId: event.target.value, department: data.facilities.find((item) => item.id === event.target.value)?.departments[0] || "" })}>{data.facilities.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select>
        <select value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })}>{facility?.departments.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })}>{assignees.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select>
        <input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
        <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option>منخفض</option><option>متوسط</option><option>عال</option></select>
        <textarea placeholder="وصف المهمة" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <button className="primary-button" disabled={!form.title} onClick={() => addTask(form)}><Plus size={18} /> حفظ المهمة</button>
      </section>}
    </div>
  );
}

function DailyReport({ data, user, addReport }) {
  const [form, setForm] = useState({ facilityId: user.facilityId === "all" ? data.facilities[0].id : user.facilityId, department: user.department, type: "تقرير يومي", priority: "متوسط", score: 85, title: "", notes: "", actions: "" });
  const facility = data.facilities.find((item) => item.id === form.facilityId);
  return (
    <section className="panel form-panel wide">
      <div className="form-grid">
        <label>المنشأة<select value={form.facilityId} onChange={(event) => setForm({ ...form, facilityId: event.target.value, department: data.facilities.find((item) => item.id === event.target.value)?.departments[0] || "" })}>{data.facilities.filter((item) => user.facilityId === "all" || item.id === user.facilityId).map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
        <label>القسم<select value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })}>{facility?.departments.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>نوع التقرير<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option>تقرير يومي</option><option>حادثة</option><option>طلب مواد</option><option>جولة ميدانية</option></select></label>
        <label>الأولوية<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option>منخفض</option><option>متوسط</option><option>عال</option></select></label>
        <label>مقياس الالتزام<input type="number" min="0" max="100" value={form.score} onChange={(event) => setForm({ ...form, score: Number(event.target.value) })} /></label>
        <label>عنوان التقرير<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="مثال: تفقد غرفة الولادة" /></label>
      </div>
      <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="الملاحظات والنتائج..." />
      <textarea value={form.actions} onChange={(event) => setForm({ ...form, actions: event.target.value })} placeholder="الإجراءات التصحيحية المطلوبة..." />
      <button className="primary-button" disabled={!form.title || !form.notes} onClick={() => addReport(form)}><MessageSquare size={18} /> إرسال التقرير</button>
    </section>
  );
}

function Checklists({ data, user, addTemplate, addSubmission }) {
  const [selectedId, setSelectedId] = useState(data.checklistTemplates[0]?.id);
  const template = data.checklistTemplates.find((item) => item.id === selectedId) || data.checklistTemplates[0];
  const [answers, setAnswers] = useState(() => template?.items.map((item) => ({ item, value: "نعم" })) || []);
  const [actions, setActions] = useState("");
  const [newTemplate, setNewTemplate] = useState({ title: "", scope: "", frequency: "يومي", items: "" });
  const facilityId = user.facilityId === "all" ? data.facilities[0].id : user.facilityId;
  const canManage = [roles.ADMIN, roles.FACILITY_MANAGER, roles.IPC_OFFICER].includes(user.role);
  function choose(id) {
    const next = data.checklistTemplates.find((item) => item.id === id);
    setSelectedId(id);
    setAnswers(next.items.map((item) => ({ item, value: "نعم" })));
  }
  return (
    <div className="split-grid">
      <section className="panel">
        <div className="panel-header"><div><h2>تنفيذ قائمة تحقق</h2><p>النتيجة تتحول تلقائياً إلى تقرير وتنبيه عند انخفاض الالتزام.</p></div></div>
        <select value={selectedId} onChange={(event) => choose(event.target.value)}>{data.checklistTemplates.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select>
        <div className="checklist-run">
          {answers.map((answer, index) => <div className="check-row" key={answer.item}><span>{answer.item}</span><select value={answer.value} onChange={(event) => setAnswers(answers.map((item, idx) => idx === index ? { ...item, value: event.target.value } : item))}><option>نعم</option><option>لا</option><option>غير مطبق</option></select></div>)}
        </div>
        <textarea value={actions} onChange={(event) => setActions(event.target.value)} placeholder="إجراءات تصحيحية أو ملاحظات إضافية..." />
        <button className="primary-button" onClick={() => addSubmission({ templateId: template.id, templateTitle: template.title, facilityId, department: user.department, answers, actions })}><ClipboardCheck size={18} /> اعتماد القائمة</button>
      </section>
      {canManage && <section className="panel form-panel">
        <h2>إنشاء نموذج تحقق</h2>
        <input placeholder="اسم النموذج" value={newTemplate.title} onChange={(event) => setNewTemplate({ ...newTemplate, title: event.target.value })} />
        <input placeholder="النطاق أو القسم" value={newTemplate.scope} onChange={(event) => setNewTemplate({ ...newTemplate, scope: event.target.value })} />
        <select value={newTemplate.frequency} onChange={(event) => setNewTemplate({ ...newTemplate, frequency: event.target.value })}><option>يومي</option><option>أسبوعي</option><option>شهري</option></select>
        <textarea placeholder="كل بند في سطر" value={newTemplate.items} onChange={(event) => setNewTemplate({ ...newTemplate, items: event.target.value })} />
        <button className="primary-button" disabled={!newTemplate.title || !newTemplate.items} onClick={() => addTemplate({ ...newTemplate, items: newTemplate.items.split("\n").filter(Boolean) })}><Plus size={18} /> حفظ النموذج</button>
      </section>}
    </div>
  );
}

function Reports({ data, reports, query, setQuery, facilityFilter, setFacilityFilter, updateReportStatus, generateReportPdf }) {
  return (
    <section className="panel">
      <div className="filters-row compact">
        <div className="search-box"><Search size={18} /><input placeholder="بحث في التقارير..." value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        <div className="select-box"><Filter size={18} /><select value={facilityFilter} onChange={(event) => setFacilityFilter(event.target.value)}><option value="all">كل المنشآت</option>{data.facilities.map((facility) => <option value={facility.id} key={facility.id}>{facility.name}</option>)}</select></div>
        <button className="secondary-button" onClick={() => exportReports(reports, data)}><FileText size={18} /> تصدير CSV</button>
        <button className="secondary-button" onClick={() => window.print()}><ClipboardCheck size={18} /> طباعة</button>
      </div>
      <ReportList reports={reports} data={data} updateReportStatus={updateReportStatus} generateReportPdf={generateReportPdf} />
    </section>
  );
}

function ReportList({ reports, data, updateReportStatus, generateReportPdf }) {
  if (!reports.length) return <div className="empty-state"><CheckCircle2 size={28} /> لا توجد تقارير مطابقة حالياً.</div>;
  return <div className="report-list">{reports.map((report) => <article className="report-card" key={report.id}><div className="report-main"><div className={`priority-dot priority-${report.priority}`} /><div><h3>{report.title}</h3><p>{facilityName(data, report.facilityId)} - {report.department} - {getUser(data, report.authorId)?.name || "غير معروف"}</p><p className="report-note">{report.notes}</p><small>{report.actions}</small></div></div><div className="report-side"><span className={`status-pill status-${report.status}`}>{report.status}</span><strong>{report.score}%</strong><small>{report.date}</small>{updateReportStatus && <select value={report.status} onChange={(event) => updateReportStatus(report.id, event.target.value)}><option>جديد</option><option>قيد المتابعة</option><option>طارئ</option><option>مغلق</option></select>}{generateReportPdf && <button className="secondary-button compact-button" onClick={() => generateReportPdf(report)}>PDF</button>}</div></article>)}</div>;
}

function Facilities({ data, addFacility }) {
  const [form, setForm] = useState({ name: "", city: "", type: "", departments: "", riskLevel: "متوسط" });
  return <div className="split-grid"><section className="panel"><div className="facility-grid">{data.facilities.map((facility) => <article className="facility-card" key={facility.id}><Building2 size={24} /><h3>{facility.name}</h3><p>{facility.city} - {facility.type}</p><span className={`risk risk-${facility.riskLevel}`}>خطورة {facility.riskLevel}</span><div className="tag-row">{facility.departments.map((item) => <span key={item}>{item}</span>)}</div></article>)}</div></section><section className="panel form-panel"><h2>إضافة منشأة</h2><input placeholder="اسم المنشأة" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><input placeholder="المدينة" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /><input placeholder="نوع المنشأة" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} /><input placeholder="الأقسام مفصولة بفواصل" value={form.departments} onChange={(event) => setForm({ ...form, departments: event.target.value })} /><select value={form.riskLevel} onChange={(event) => setForm({ ...form, riskLevel: event.target.value })}><option>منخفض</option><option>متوسط</option><option>عال</option></select><button className="primary-button" disabled={!form.name} onClick={() => addFacility({ ...form, departments: form.departments.split(",").map((item) => item.trim()).filter(Boolean) })}><Plus size={18} /> إضافة المنشأة</button></section></div>;
}

function UsersPanel({ data, user, addUser }) {
  const [form, setForm] = useState({ name: "", username: "", password: "", role: roles.HEALTH_WORKER, facilityId: user.facilityId === "all" ? data.facilities[0].id : user.facilityId, department: "" });
  const facility = data.facilities.find((item) => item.id === form.facilityId);
  return <div className="split-grid"><section className="panel"><div className="user-table">{data.users.filter((item) => user.role === roles.ADMIN || item.facilityId === user.facilityId).map((item) => <div className="user-row" key={item.id}><UserCog size={20} /><strong>{item.name}</strong><span>{item.role}</span><span>{facilityName(data, item.facilityId)}</span><small>{item.username}</small></div>)}</div></section><section className="panel form-panel"><h2>إنشاء حساب</h2><input placeholder="اسم الموظف" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><input placeholder="اسم المستخدم" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /><input placeholder="كلمة المرور" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>{Object.values(roles).map((role) => <option key={role}>{role}</option>)}</select><select value={form.facilityId} onChange={(event) => setForm({ ...form, facilityId: event.target.value, department: data.facilities.find((item) => item.id === event.target.value)?.departments[0] || "" })}>{user.role === roles.ADMIN && <option value="all">كل المنشآت</option>}{data.facilities.map((facility) => <option value={facility.id} key={facility.id}>{facility.name}</option>)}</select><select value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })}>{(facility?.departments || ["الإدارة"]).map((item) => <option key={item}>{item}</option>)}</select><button className="primary-button" disabled={!form.name || !form.username || !form.password} onClick={() => addUser(form)}><Plus size={18} /> حفظ الحساب</button></section></div>;
}

function SettingsPanel({ data, user }) {
  return <section className="panel"><div className="settings-grid"><div><ShieldCheck size={26} /><h3>صلاحيات حسب الدور</h3><p>كل مستخدم يرى المنشأة والقسم والمهام المرتبطة به فقط.</p></div><div><Activity size={26} /><h3>تقارير يومية وتنبيهات</h3><p>أي نتيجة منخفضة أو أولوية عالية تظهر فوراً في مركز التنبيهات.</p></div><div><Stethoscope size={26} /><h3>جاهز للربط المؤسسي</h3><p>الواجهة مبنية لتنتقل لاحقاً إلى قاعدة بيانات وتسجيل دخول آمن.</p></div><div><Users size={26} /><h3>الجلسة الحالية</h3><p>{user.name} - {user.role} ضمن {facilityName(data, user.facilityId)}.</p></div></div></section>;
}

function NavButton({ icon, label, active, onClick }) {
  return <button className={`nav-button ${active ? "active" : ""}`} onClick={onClick}>{React.cloneElement(icon, { size: 19 })}<span>{label}</span></button>;
}

function Metric({ icon, label, value, tone }) {
  return <div className={`metric metric-${tone}`}><div className="metric-icon">{React.cloneElement(icon, { size: 22 })}</div><span>{label}</span><strong>{value}</strong></div>;
}

function viewTitle(view) {
  return {
    dashboard: "لوحة القيادة",
    tasks: "المهام اليومية",
    daily: "إرسال تقرير يومي",
    checklists: "قوائم التحقق",
    reports: "مركز التقارير",
    facilities: "إدارة المنشآت",
    users: "إدارة المستخدمين والأدوار",
    settings: "إعدادات النظام",
  }[view];
}

function facilityName(data, id) {
  if (id === "all") return "كل المنشآت";
  return data.facilities.find((facility) => facility.id === id)?.name || "غير محدد";
}

function getUser(data, id) {
  return data.users.find((user) => user.id === id);
}

function buildAlerts(data, reports, tasks) {
  const lowScores = reports.filter((report) => report.score < 70 && report.status !== "مغلق").map((report) => ({ id: `a-${report.id}`, tone: "red", title: `التزام منخفض: ${report.score}%`, body: `${facilityName(data, report.facilityId)} - ${report.department}: ${report.title}` }));
  const urgent = reports.filter((report) => report.priority === "عال" && report.status !== "مغلق").map((report) => ({ id: `u-${report.id}`, tone: "amber", title: "تقرير عالي الأولوية", body: `${report.title} يحتاج متابعة إدارية.` }));
  const due = tasks.filter((task) => task.dueDate <= today && task.status !== "مغلقة").map((task) => ({ id: `d-${task.id}`, tone: "blue", title: "مهمة مستحقة اليوم", body: `${task.title} - ${facilityName(data, task.facilityId)}.` }));
  return [...lowScores, ...urgent, ...due].slice(0, 8);
}

function exportReports(reports, data) {
  const headers = ["التاريخ", "المنشأة", "القسم", "النوع", "الأولوية", "الحالة", "النسبة", "العنوان", "الملاحظات", "الإجراءات", "المرسل"];
  const rows = reports.map((report) => [report.date, facilityName(data, report.facilityId), report.department, report.type, report.priority, report.status, `${report.score}%`, report.title, report.notes, report.actions, getUser(data, report.authorId)?.name || ""]);
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ipc-reports-${today}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

async function exportReportPdf(report, data, author) {
  const { default: html2canvas } = await import("html2canvas");
  const { jsPDF } = await import("jspdf");
  const wrapper = document.createElement("div");
  wrapper.className = "pdf-page";
  wrapper.dir = "rtl";
  wrapper.innerHTML = `
    <div class="pdf-watermark">HIHFAD</div>
    <header class="pdf-header">
      <img src="/ipc/hihfad-logo.jpg" alt="HIHFAD" />
      <div>
        <h1>تقرير ضبط العدوى</h1>
        <p>${data.organization}</p>
      </div>
      <strong>${report.date}</strong>
    </header>
    <div class="pdf-meta">
      <div><span>المنشأة</span><strong>${facilityName(data, report.facilityId)}</strong></div>
      <div><span>القسم</span><strong>${report.department}</strong></div>
      <div><span>نوع التقرير</span><strong>${report.type}</strong></div>
      <div><span>الأولوية</span><strong>${report.priority}</strong></div>
      <div><span>الحالة</span><strong>${report.status}</strong></div>
      <div><span>مقياس الالتزام</span><strong>${report.score}%</strong></div>
    </div>
    <section class="pdf-section">
      <h2>${report.title}</h2>
      <h3>الملاحظات والنتائج</h3>
      <p>${report.notes}</p>
      <h3>الإجراءات التصحيحية المطلوبة</h3>
      <p>${report.actions || "لا يوجد"}</p>
    </section>
    <section class="pdf-score">
      <span>مؤشر الالتزام</span>
      <div><i style="width:${Math.max(0, Math.min(100, report.score))}%"></i></div>
      <strong>${report.score}%</strong>
    </section>
    <footer class="pdf-footer">
      <span>أعد التقرير: ${author}</span>
      <span>تم التصدير من نظام HIHFAD IPC Control</span>
    </footer>
  `;
  document.body.appendChild(wrapper);
  const canvas = await html2canvas(wrapper, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;
  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  pdf.save(`IPC-${report.date}-${report.id}.pdf`);
  wrapper.remove();
}

createRoot(document.getElementById("root")).render(<App />);

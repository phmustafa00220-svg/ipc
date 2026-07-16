const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");

const port = Number(process.env.PORT || 3035);
const rootDir = __dirname;
const dataDir = path.join(rootDir, "data");
const dbFile = path.join(dataDir, "ipc-db.json");
const sessionFile = path.join(dataDir, "ipc-sessions.json");
const distDir = path.join(rootDir, "dist");
const publicDir = fs.existsSync(path.join(distDir, "index.html")) ? distDir : path.join(rootDir, "public");

const roles = {
  ADMIN: "مدير النظام",
  FACILITY_MANAGER: "مدير منشأة",
  IPC_OFFICER: "مسؤول ضبط العدوى",
  HEALTH_WORKER: "عامل صحي",
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function ensureDataDir() {
  fs.mkdirSync(dataDir, { recursive: true });
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, expected] = stored.split(":");
  const actual = crypto.pbkdf2Sync(String(password), salt, 120000, 32, "sha256").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(actual, "hex"));
}

function seedState() {
  return {
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
      makeUser("u-admin", "مصطفى الخطيب", "admin", "admin123", roles.ADMIN, "all", "الإدارة"),
      makeUser("u-ipc-ibn", "مسؤول ضبط العدوى - ابن الوليد", "ipc.ibn", "ipc123", roles.IPC_OFFICER, "ibn-al-walid", "الجراحة"),
      makeUser("u-hama-nurse", "ممرض تفقد - حماه", "hama.nurse", "123456", roles.HEALTH_WORKER, "hama-hospital", "التوليد"),
    ],
    tasks: [
      {
        id: "t1",
        title: "تفقد نقاط نظافة اليدين",
        facilityId: "ibn-al-walid",
        department: "الجراحة",
        assignedTo: "u-ipc-ibn",
        dueDate: today(),
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
        dueDate: today(),
        priority: "متوسط",
        status: "قيد التنفيذ",
        description: "توثيق جاهزية مستلزمات الوقاية والتخلص من النفايات.",
      },
    ],
    checklistTemplates: [
      {
        id: "core-ipc",
        title: "التقييم العام لضبط العدوى - كل الأقسام",
        scope: "كل المنشآت",
        frequency: "يومي",
        category: "عام",
        items: [
          "وجود مسؤول واضح لضبط العدوى وخطة متابعة داخل القسم",
          "توفر مواد نظافة اليدين عند نقاط الرعاية",
          "فرز النفايات الطبية والحادة في حاويات مطابقة وموسومة",
          "تنظيف وتطهير الأسطح عالية اللمس وفق جدول موثق",
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
          "نظافة اليدين قبل ملامسة المريض",
          "نظافة اليدين قبل الإجراء النظيف أو المعقم",
          "نظافة اليدين بعد خطر التعرض لسوائل الجسم",
          "نظافة اليدين بعد ملامسة المريض",
          "نظافة اليدين بعد ملامسة محيط المريض",
        ],
      },
      {
        id: "obs-gyn",
        title: "قائمة تحقق النسائية والتوليد",
        scope: "النسائية والتوليد",
        frequency: "يومي",
        category: "التوليد",
        items: [
          "تجهيز غرفة الولادة ونظافة الأسطح قبل كل حالة",
          "توفر مستلزمات الولادة النظيفة والمعقمة",
          "التخلص الآمن من المشيمة والنفايات الملوثة",
          "تطهير الأسرة والطاولات بين الحالات",
          "توثيق التنظيف في نهاية الوردية",
        ],
      },
    ],
    reports: [
      {
        id: "r1",
        date: today(),
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
    ],
    incidents: [],
    inventory: [
      { id: "m1", facilityId: "ibn-al-walid", item: "معقم يد كحولي", unit: "عبوة", stock: 42, minimum: 25, status: "كاف" },
      { id: "m2", facilityId: "hama-hospital", item: "كمامات طبية", unit: "علبة", stock: 8, minimum: 20, status: "ناقص" },
    ],
    trainings: [
      { id: "tr1", title: "نظافة اليدين والاحتياطات القياسية", facilityId: "all", audience: "كل الكادر", date: today(), completion: 72, status: "مجدول" },
    ],
    submissions: [],
  };
}

function makeUser(id, name, username, password, role, facilityId, department) {
  return { id, name, username, passwordHash: hashPassword(password), role, facilityId, department, status: "نشط" };
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2), "utf8");
}

function loadDb() {
  ensureDataDir();
  if (!fs.existsSync(dbFile)) writeJson(dbFile, seedState());
  const state = readJson(dbFile, seedState());
  state.users = (state.users || []).map((user) => {
    if (user.password && !user.passwordHash) {
      const next = { ...user, passwordHash: hashPassword(user.password) };
      delete next.password;
      return next;
    }
    return user;
  });
  writeJson(dbFile, state);
  return state;
}

function saveDb(state) {
  const current = loadDb();
  const currentUsers = new Map((current.users || []).map((user) => [user.id, user]));
  const nextUsers = (state.users || []).map((user) => {
    const existing = currentUsers.get(user.id);
    const next = { ...user };
    if (user.password) next.passwordHash = hashPassword(user.password);
    if (!next.passwordHash && existing?.passwordHash) next.passwordHash = existing.passwordHash;
    delete next.password;
    return next;
  });
  const nextState = { ...state, users: nextUsers };
  writeJson(dbFile, nextState);
  return nextState;
}

function sanitizeState(state) {
  return {
    ...state,
    users: (state.users || []).map(({ password, passwordHash, ...user }) => user),
  };
}

function publicUser(user) {
  const { password, passwordHash, ...safe } = user;
  return safe;
}

function sessions() {
  ensureDataDir();
  return readJson(sessionFile, {});
}

function saveSessions(value) {
  writeJson(sessionFile, value);
}

function authenticated(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const sessionMap = sessions();
  const session = sessionMap[token];
  if (!session || session.expiresAt < Date.now()) return null;
  const user = loadDb().users.find((item) => item.id === session.userId && item.status === "نشط");
  return user ? { token, user } : null;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) {
        req.destroy();
        reject(new Error("Body too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function sendJson(res, status, value) {
  const body = JSON.stringify(value);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  });
  res.end(body);
}

function serveStatic(req, res) {
  const requestPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  const cleanPath = requestPath === "/" ? "/index.html" : requestPath;
  const absolutePath = path.normalize(path.join(publicDir, cleanPath));
  if (!absolutePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  const finalPath = fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile() ? absolutePath : path.join(publicDir, "index.html");
  const ext = path.extname(finalPath).toLowerCase();
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".webmanifest": "application/manifest+json" };
  res.writeHead(200, {
    "Content-Type": `${types[ext] || "application/octet-stream"}; charset=utf-8`,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  });
  fs.createReadStream(finalPath).pipe(res);
}

async function handleApi(req, res) {
  try {
    if (req.method === "POST" && req.url === "/api/login") {
      const { username, password } = await readBody(req);
      const state = loadDb();
      const user = state.users.find((item) => item.username?.trim().toLowerCase() === String(username || "").trim().toLowerCase() && item.status === "نشط");
      if (!user || !verifyPassword(password, user.passwordHash)) return sendJson(res, 401, { error: "Invalid credentials" });
      const token = crypto.randomBytes(32).toString("hex");
      const sessionMap = sessions();
      sessionMap[token] = { userId: user.id, createdAt: Date.now(), expiresAt: Date.now() + 1000 * 60 * 60 * 12 };
      saveSessions(sessionMap);
      return sendJson(res, 200, { token, user: publicUser(user), state: sanitizeState(state) });
    }

    const auth = authenticated(req);
    if (!auth) return sendJson(res, 401, { error: "Authentication required" });

    if (req.method === "POST" && req.url === "/api/logout") {
      const sessionMap = sessions();
      delete sessionMap[auth.token];
      saveSessions(sessionMap);
      return sendJson(res, 204, {});
    }

    if (req.method === "GET" && req.url === "/api/me") {
      return sendJson(res, 200, { user: publicUser(auth.user) });
    }

    if (req.method === "GET" && req.url === "/api/state") {
      return sendJson(res, 200, { state: sanitizeState(loadDb()) });
    }

    if (req.method === "POST" && req.url === "/api/state") {
      const { state } = await readBody(req);
      if (!state || typeof state !== "object") return sendJson(res, 400, { error: "Invalid state" });
      const saved = saveDb(state);
      return sendJson(res, 200, { state: sanitizeState(saved) });
    }

    return sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/api/")) {
    handleApi(req, res);
    return;
  }
  serveStatic(req, res);
});

server.listen(port, "0.0.0.0", () => {
  loadDb();
  console.log(`HIHFAD IPC Primary Station is running on http://127.0.0.1:${port}`);
});

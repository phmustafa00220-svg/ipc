# تشغيل التطبيق أونلاين مجاناً

النسخة المنشورة على GitHub Pages تعرض الواجهة فقط. لكي تصبح متكاملة أونلاين مع تسجيل دخول وبيانات مشتركة بين المستخدمين، استخدم Supabase المجاني كقاعدة بيانات وخدمة تسجيل دخول.

## 1. إنشاء Supabase

1. افتح https://supabase.com
2. أنشئ مشروعاً جديداً مجانياً.
3. افتح SQL Editor.
4. انسخ محتوى الملف `SUPABASE_SCHEMA.sql` وشغله.

## 2. إنشاء مستخدمين

من Supabase:

1. Authentication
2. Users
3. Add user
4. اكتب email وكلمة مرور.

بعد إنشاء المستخدم، افتح Table Editor ثم جدول `profiles` وأضف صفاً:

```text
id = نفس UUID الخاص بالمستخدم
name = اسم الموظف
role = مدير النظام / مدير منشأة / مسؤول ضبط العدوى / عامل صحي
facility_id = all أو معرف المنشأة
department = القسم
status = نشط
```

## 3. وضع مفاتيح Supabase في التطبيق

افتح `index.html` وابحث عن:

```js
window.HIHFAD_SUPABASE = window.HIHFAD_SUPABASE || {
  url: "",
  anonKey: ""
};
```

ضع:

```js
url: "https://YOUR-PROJECT.supabase.co",
anonKey: "YOUR-ANON-KEY"
```

مفتاح anon ليس سراً، وهو مصمم للاستخدام داخل المتصفح مع سياسات RLS.

## 4. النشر

بعد تعديل المفاتيح:

```bash
npm run build
git add index.html
git commit -m "Configure Supabase online backend"
git push github codex/ipc-control:main
```

بعدها يصبح الرابط:

```text
https://phmustafa00220-svg.github.io/ipc/
```

## ملاحظة مهمة

GitHub Pages لا يشغل سيرفر Node ولا يحفظ قاعدة بيانات. لذلك البنية المجانية المناسبة هي:

```text
GitHub Pages = الواجهة
Supabase = تسجيل الدخول + قاعدة البيانات + API
```

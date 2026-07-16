insert into public.app_state (id, state)
values (
  'main',
  '{
    "organization": "يداً بيد للإغاثة والتنمية",
    "facilities": [
      {
        "id": "ibn-al-walid",
        "name": "مشفى ابن الوليد",
        "city": "حمص",
        "type": "مشفى عام",
        "departments": ["الجراحة", "الإسعاف", "العناية", "النسائية", "الأطفال", "التعقيم"],
        "riskLevel": "عال",
        "status": "نشط"
      },
      {
        "id": "hama-hospital",
        "name": "مشفى حماه",
        "city": "حماه",
        "type": "نسائية وأطفال",
        "departments": ["التوليد", "الأطفال", "الحواضن", "الإسعاف", "التعقيم"],
        "riskLevel": "متوسط",
        "status": "نشط"
      }
    ],
    "users": [
      {
        "id": "admin",
        "name": "admin",
        "username": "admin",
        "role": "مدير النظام",
        "facilityId": "all",
        "department": "الإدارة",
        "status": "نشط"
      }
    ],
    "tasks": [
      {
        "id": "task-1",
        "title": "تفقد نقاط نظافة اليدين",
        "facilityId": "ibn-al-walid",
        "department": "الجراحة",
        "assignedTo": "مسؤول ضبط العدوى",
        "dueDate": "اليوم",
        "priority": "عال",
        "status": "مفتوحة",
        "description": "تأكيد توفر المعقمات والملصقات عند نقاط الرعاية."
      }
    ],
    "reports": [
      {
        "id": "RPT-001",
        "date": "2026-07-16",
        "facilityId": "ibn-al-walid",
        "department": "ضبط العدوى",
        "authorId": "system",
        "type": "تقرير يومي",
        "priority": "متوسط",
        "status": "قيد المراجعة",
        "score": 90,
        "title": "تقرير أولي",
        "notes": "بيانات أولية قابلة للتعديل.",
        "actions": "متابعة حسب الخطة."
      }
    ],
    "incidents": [],
    "checklistTemplates": [
      {
        "id": "chk-core",
        "title": "التقييم العام لضبط العدوى",
        "facility": "كل المنشآت",
        "department": "عام",
        "frequency": "يومي",
        "standard": "WHO/CDC",
        "items": ["توفر مواد نظافة اليدين عند نقاط الرعاية", "فرز النفايات الطبية والحادة في حاويات مطابقة", "تنظيف وتطهير الأسطح عالية اللمس", "توثيق الحوادث والتعرض المهني فوراً"]
      },
      {
        "id": "chk-surgery",
        "title": "غرف العمليات والجراحة",
        "facility": "مشفى ابن الوليد",
        "department": "الجراحة",
        "frequency": "يومي",
        "standard": "WHO",
        "items": ["تعقيم الأدوات قبل الاستخدام", "الالتزام بنظافة اليدين الجراحية", "تطهير غرفة العمليات بين الحالات", "التخلص الآمن من الأدوات الحادة"]
      },
      {
        "id": "chk-obgyn",
        "title": "النسائية والتوليد",
        "facility": "مشفى حماه",
        "department": "التوليد",
        "frequency": "يومي",
        "standard": "WHO",
        "items": ["تجهيز غرفة الولادة قبل كل حالة", "توفر مستلزمات الولادة النظيفة والمعقمة", "التخلص الآمن من المشيمة والنفايات الملوثة", "تطهير الأسرة والطاولات بين الحالات"]
      },
      {
        "id": "chk-sterilization",
        "title": "التعقيم المركزي",
        "facility": "كل المنشآت",
        "department": "التعقيم",
        "frequency": "يومي",
        "standard": "CDC",
        "items": ["توثيق دورات التعقيم", "فصل الأدوات النظيفة عن الملوثة", "استخدام مؤشرات التعقيم", "تخزين الأدوات المعقمة بشكل آمن"]
      }
    ],
    "inventory": [],
    "trainings": [],
    "submissions": []
  }'::jsonb
)
on conflict (id) do nothing;

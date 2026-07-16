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
    "users": [],
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
    "checklistTemplates": [],
    "inventory": [],
    "trainings": [],
    "submissions": []
  }'::jsonb
)
on conflict (id) do nothing;

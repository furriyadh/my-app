import os
from dotenv import load_dotenv

# تحميل متغيرات البيئة من ملف .env في جذر المشروع
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

client_id = os.getenv("GOOGLE_ADS_CLIENT_ID")

if client_id:
    print(f"GOOGLE_ADS_CLIENT_ID تم قراءته بنجاح: {client_id}")
else:
    print("GOOGLE_ADS_CLIENT_ID غير موجود أو لم يتم قراءته.")

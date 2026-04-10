import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edusync.settings')
django.setup()

from api.services.notion_service import NotionService

s = NotionService()
try:
    db = s.client.databases.retrieve(database_id=s.db_id)
    print("OBJECT TYPE:", db.get("object"))
    print("PARENT:", db.get("parent"))
    print("PROPERTIES KEYS:", list(db.get("properties", {}).keys()))
except Exception as e:
    print("Error getting as database:", e)
    
try:
    page = s.client.pages.retrieve(page_id=s.db_id)
    print("OBJECT TYPE (from page):", page.get("object"))
except Exception as e:
    pass

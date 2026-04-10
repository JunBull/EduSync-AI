import os
import django
import json
import httpx
from notion_client import Client

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edusync.settings')
django.setup()

from django.conf import settings

token = settings.NOTION_TOKEN
db_id = settings.NOTION_DB_ID

print("--- USING NOTION_CLIENT ---")
client = Client(auth=token)
res1 = client.databases.retrieve(database_id=db_id)
print("Keys in properties:", list(res1.get("properties", {}).keys()))

print("--- USING HTTPX ---")
headers = {
    "Authorization": f"Bearer {token}",
    "Notion-Version": "2022-06-28"
}
res2 = httpx.get(f"https://api.notion.com/v1/databases/{db_id}", headers=headers).json()
print("Keys in properties:", list(res2.get("properties", {}).keys()))

# Check for differences
print("\nEqual objects?", res1 == res2)

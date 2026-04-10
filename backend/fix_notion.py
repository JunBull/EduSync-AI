import os
import django
import json
from notion_client import Client

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edusync.settings')
django.setup()

from django.conf import settings

# Lets print the exact token to see if it's the environment one
print("Token start:", settings.NOTION_TOKEN[:10])

client = Client(auth=settings.NOTION_TOKEN)
db_id = settings.NOTION_DB_ID

# First retrieve DB directly
try:
    db = client.databases.retrieve(database_id=db_id)
    print("KEYS in props:", list(db.get("properties", {}).keys()))
except Exception as e:
    print("Retrieval error:", e)

# Now Let's update the database schema
try:
    res = client.databases.update(
        database_id=db_id,
        properties={
            "Tema": {
                "name": "Tema",
                "title": {}
            },
            "Semana": {
                "name": "Semana",
                "select": {
                    "options": [
                        {"name": f"Semana {i}"} for i in range(1, 17)
                    ]
                }
            }
        }
    )
    print("Successfully updated database schema!")
    print("New properties:", list(res.get("properties", {}).keys()))
except Exception as e:
    print("Update error:", e)

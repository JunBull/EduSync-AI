import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edusync.settings')
django.setup()

from django.conf import settings

url = f"https://api.notion.com/v1/databases/{settings.NOTION_DB_ID}/query"
headers = {
    "Authorization": f"Bearer {settings.NOTION_TOKEN}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json"
}

try:
    res = requests.post(url, headers=headers, json={})
    if res.status_code == 200:
        data = res.json()
        results = data.get("results", [])
        print(f"TOTAL NOTAS ENCONTRADAS: {len(results)}\n")
        
        for p in results:
            # Extraer Nombre
            nombre_prop = p.get("properties", {}).get("Nombre", {}).get("title", [])
            nombre = nombre_prop[0].get("plain_text") if len(nombre_prop) > 0 else "Sin Nombre"
            
            # Extraer Materia
            materia_prop = p.get("properties", {}).get("Materia", {}).get("select", {})
            # It could be None if an entry has no materia selected
            materia = materia_prop.get("name") if materia_prop else "Sin Materia"
            
            print(f"- NOTA: {nombre}")
            print(f"  CURSO: {materia}")
            print("-" * 30)
    else:
        print(f"Error querying Notion: {res.status_code}")
        print(res.text)
except Exception as e:
    print(f"Exception: {e}")

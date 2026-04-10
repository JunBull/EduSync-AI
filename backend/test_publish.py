import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edusync.settings')
django.setup()

from api.services.notion_service import NotionService

s = NotionService()

# Intentar publicar algo para probar la conexión
blocks = [
    {
        "object": "block",
        "type": "paragraph",
        "paragraph": {
            "rich_text": [{"type": "text", "text": {"content": "Prueba de contenido"}}]
        }
    }
]

print("Intentando publicar con las propiedades esperadas (Tema, Materia, Semana)...")
url = s.publish_summary(
    tema_titulo="Prueba Semana y Cursos",
    materia="SEGURIDAD INFORMÁTICA",
    semana="Semana 1",
    blocks=blocks
)

if url:
    print("ÉXITO: Se conectó y publicó en Notion. URL:", url)
else:
    print("ERROR: Falló al conectarse o publicar debido a un esquema incorrecto en la DB de Notion.")

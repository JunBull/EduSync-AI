import os
from notion_client import Client
from django.conf import settings

class NotionService:
    def __init__(self):
        self.client = Client(auth=settings.NOTION_TOKEN)
        self.db_id = settings.NOTION_DB_ID

    def get_materias_options(self):
        """
        Consulta la base de datos para obtener las opciones del select 'Materia'.
        """
        import requests
        try:
            url = f"https://api.notion.com/v1/databases/{self.db_id}"
            headers = {
                "Authorization": f"Bearer {settings.NOTION_TOKEN}",
                "Notion-Version": "2022-06-28"
            }
            res = requests.get(url, headers=headers)
            if res.status_code == 200:
                data = res.json()
                materia_prop = data.get("properties", {}).get("Materia", {})
                if "select" in materia_prop:
                    options = materia_prop["select"].get("options", [])
                    return [opt.get("name") for opt in options]
                elif "multi_select" in materia_prop:
                    options = materia_prop["multi_select"].get("options", [])
                    return [opt.get("name") for opt in options]
            return []
        except Exception as e:
            print(f"Error fetching materias from Notion: {e}")
            return []

    def get_notes_grouped_by_materia(self):
        """
        Retorna un diccionario mapeando cada materia a una lista de sus notas existentes.
        Ejemplo: {"BIG DATA Y ANALÍTICA DE DATOS": ["Semana 2 - Anotaciones", "Semana 3 - Anotaciones"]}
        """
        import requests
        try:
            url = f"https://api.notion.com/v1/databases/{self.db_id}/query"
            headers = {
                "Authorization": f"Bearer {settings.NOTION_TOKEN}",
                "Notion-Version": "2022-06-28",
                "Content-Type": "application/json"
            }
            res = requests.post(url, headers=headers, json={})
            if res.status_code == 200:
                data = res.json()
                results = data.get("results", [])
                
                grouped = {}
                for p in results:
                    nombre_prop = p.get("properties", {}).get("Nombre", {}).get("title", [])
                    nombre = nombre_prop[0].get("plain_text") if len(nombre_prop) > 0 else "Sin Nombre"
                    
                    materia_prop = p.get("properties", {}).get("Materia", {}).get("select", {})
                    materia = materia_prop.get("name") if materia_prop else "Sin Materia"
                    
                    if materia not in grouped:
                        grouped[materia] = []
                    grouped[materia].append(nombre)
                return grouped
            return {}
        except Exception as e:
            print(f"Error querying Notion notes: {e}")
            return {}

    def publish_summary(self, tema_titulo, materia, semana, blocks):
        """
        Crea una página nueva en la base de datos de Notion con los bloques del resumen.
        """
        try:
            # Prepend semana to title to keep that context, since Notion DB lacks 'Semana' property
            final_title = f"{semana} - {tema_titulo}" if semana else tema_titulo

            page_properties = {
                "Nombre": {
                    "title": [
                        {
                            "text": {
                                "content": final_title
                            }
                        }
                    ]
                },
                "Materia": {
                    "select": {
                        "name": materia
                    }
                }
            }

            response = self.client.pages.create(
                parent={"database_id": self.db_id},
                properties=page_properties,
                children=blocks
            )
            return response.get("url")
        except Exception as e:
            print(f"Error publishing to Notion: {e}")
            return None

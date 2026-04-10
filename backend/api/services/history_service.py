import os
import json
import uuid
from datetime import datetime
from django.conf import settings

HISTORY_DIR = settings.HISTORY_DIR

class HistoryService:
    @staticmethod
    def _get_filepath(session_id):
        return os.path.join(HISTORY_DIR, f"{session_id}.json")

    @staticmethod
    def list_sessions():
        sessions = []
        if not os.path.exists(HISTORY_DIR):
            return sessions

        for filename in os.listdir(HISTORY_DIR):
            if filename.endswith(".json"):
                filepath = os.path.join(HISTORY_DIR, filename)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        # Remove potentially large markdown strings from the list view
                        data.pop("raw_summary", None)
                        if "files" in data:
                            for file_info in data["files"]:
                                file_info.pop("extracted_text", None)
                        sessions.append(data)
                except Exception as e:
                    print(f"Error reading history file {filename}: {e}")
        
        # Sort by processed_date descending
        sessions.sort(key=lambda x: x.get("processed_date", ""), reverse=True)
        return sessions

    @staticmethod
    def get_session(session_id):
        filepath = HistoryService._get_filepath(session_id)
        if not os.path.exists(filepath):
            return None
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def save_session(materia, semana, files_info, raw_summary, published_url=None):
        session_id = str(uuid.uuid4())
        data = {
            "id": session_id,
            "materia": materia,
            "semana": semana,
            "processed_date": datetime.now().isoformat(),
            "status": "published" if published_url else "reviewed",
            "published_url": published_url,
            "title": f"Resumen de {materia} - {semana}",
            "files": files_info,  # [{"name": "file.pdf", "size": 1024}]
            "raw_summary": raw_summary
        }
        
        filepath = HistoryService._get_filepath(session_id)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        
        return data

    @staticmethod
    def update_session(session_id, **kwargs):
        data = HistoryService.get_session(session_id)
        if not data:
            return None
        
        data.update(kwargs)
        filepath = HistoryService._get_filepath(session_id)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        
        return data

    @staticmethod
    def delete_session(session_id):
        filepath = HistoryService._get_filepath(session_id)
        if os.path.exists(filepath):
            os.remove(filepath)
            return True
        return False

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services.notion_service import NotionService
from .services.document_service import DocumentService
from .services.gemini_service import GeminiService
from .services.summary_builder import SummaryBuilder
from .services.history_service import HistoryService
import json
import traceback

class GetMateriasView(APIView):
    def get(self, request):
        service = NotionService()
        materias = service.get_materias_options()
        semanas_por_materia = service.get_notes_grouped_by_materia()
        # Enviar ambas estructuras al frontend
        return Response({
            "materias": materias, 
            "semanas_por_materia": semanas_por_materia
        })

class ProcessDocumentView(APIView):
    def post(self, request):
        materia = request.data.get("materia")
        semana = request.data.get("semana")
        language = request.data.get("language", "es")
        files = request.FILES.getlist("files")

        if not files or not materia or not semana:
            return Response({"error": "Missing files, materia, or semana"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            doc_service = DocumentService()
            combined_text = ""
            files_info = []

            for f in files:
                files_info.append({"name": f.name, "size": f.size})
                extracted = doc_service.extract_text(f, f.name)
                if not extracted or not extracted.strip():
                    print(f"[WARN] No text extracted from {f.name}")
                combined_text += f"\n--- Contenido de {f.name} ---\n{extracted}"
            
            if not combined_text.strip():
                return Response(
                    {"error": "No se pudo extraer texto de los archivos proporcionados. Verifica que no sean imágenes escaneadas."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            print(f"[ProcessDocument] Extracted {len(combined_text)} chars from {len(files)} files")

            # Step 2: Summarize with Gemini
            raw_summary = GeminiService.generate_summary(combined_text, materia, semana, language)

            # Check if Gemini returned an error
            if raw_summary.startswith("Error al generar"):
                return Response(
                    {"error": raw_summary},
                    status=status.HTTP_502_BAD_GATEWAY
                )

            # Step 3: Save to local history
            history_service = HistoryService()
            session = history_service.save_session(materia, semana, files_info, raw_summary)

            return Response({
                "session_id": session["id"],
                "raw_summary": raw_summary,
                "files_processed": len(files)
            })
        except Exception as e:
            print(f"[ProcessDocument] Unhandled error: {e}")
            traceback.print_exc()
            return Response(
                {"error": f"Error interno del servidor: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RefineSummaryView(APIView):
    def post(self, request):
        session_id = request.data.get("session_id")
        user_prompt = request.data.get("prompt")
        history = request.data.get("history", []) # List of {"role": "user"/"model", "parts": ["text"]}

        if not session_id or not user_prompt:
            return Response({"error": "Missing session_id or prompt"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_text = GeminiService.refine_summary(history, user_prompt)
            
            # Check if Gemini returned an error
            if new_text.startswith("Error al enviar"):
                return Response(
                    {"error": new_text},
                    status=status.HTTP_502_BAD_GATEWAY
                )
            
            return Response({"refined_summary": new_text})
        except Exception as e:
            print(f"[RefineChat] Unhandled error: {e}")
            traceback.print_exc()
            return Response(
                {"error": f"Error en chat con Gemini: {str(e)}"},
                status=status.HTTP_502_BAD_GATEWAY
            )

class UpdateHistoryRawSummaryView(APIView):
    def post(self, request, session_id):
        raw_summary = request.data.get("raw_summary")
        if not raw_summary:
            return Response({"error": "No raw_summary provided"}, status=400)
            
        history_service = HistoryService()
        updated = history_service.update_session(session_id, raw_summary=raw_summary)
        if not updated:
            return Response({"error": "Session not found"}, status=404)
        return Response({"status": "updated"})

class PublishSummaryView(APIView):
    def post(self, request):
        session_id = request.data.get("session_id")
        raw_summary = request.data.get("raw_summary")
        
        if not session_id or not raw_summary:
            return Response({"error": "Missing session_id or raw_summary"}, status=400)

        history_service = HistoryService()
        session = history_service.get_session(session_id)
        if not session:
            return Response({"error": "Session not found"}, status=404)

        builder = SummaryBuilder()
        blocks = builder.markdown_to_notion_blocks(raw_summary)
        title = builder.extract_title_from_markdown(raw_summary)

        notion_service = NotionService()
        url = notion_service.publish_summary(title, session["materia"], session["semana"], blocks)

        if url:
            # Update history to published
            history_service.update_session(session_id, status="published", published_url=url, raw_summary=raw_summary)
            return Response({"success": True, "notion_url": url})
        else:
            return Response({"error": "Failed to publish to Notion"}, status=500)

class HistoryListView(APIView):
    def get(self, request):
        service = HistoryService()
        return Response(service.list_sessions())

class HistoryDetailView(APIView):
    def get(self, request, session_id):
        service = HistoryService()
        session = service.get_session(session_id)
        if session:
            return Response(session)
        return Response({"error": "Not found"}, status=404)

    def delete(self, request, session_id):
        service = HistoryService()
        if service.delete_session(session_id):
            return Response({"status": "deleted"})
        return Response({"error": "Not found"}, status=404)

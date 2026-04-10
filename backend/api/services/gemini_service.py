import traceback
from google import genai
from google.genai import types
from django.conf import settings

# Initialize the new google-genai client
client = genai.Client(api_key=settings.GEMINI_API_KEY)

# Model fallback chain — if one model hits quota, try the next
MODEL_CHAIN = [
    "gemini-2.5-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash-lite",
]

class GeminiService:
    @staticmethod
    def _call_with_fallback(contents, system_instruction=None):
        """
        Tries each model in MODEL_CHAIN until one succeeds.
        Returns the response text or raises the last exception.
        """
        last_error = None
        for model_name in MODEL_CHAIN:
            try:
                print(f"[Gemini] Trying model: {model_name}")
                
                config = None
                if system_instruction:
                    config = types.GenerateContentConfig(
                        system_instruction=system_instruction
                    )
                
                response = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=config,
                )
                
                if response.text:
                    print(f"[Gemini] Success with model: {model_name}")
                    return response.text
                else:
                    print(f"[Gemini] Empty response from {model_name}")
                    last_error = Exception(f"Empty response from {model_name}")
                    continue
                    
            except Exception as e:
                print(f"[Gemini] Error with {model_name}: {e}")
                last_error = e
                continue
        
        # All models failed
        raise last_error or Exception("All models failed")

    @staticmethod
    def generate_summary(text, materia, semana, language="es"):
        """
        Sends the extracted text to Gemini to generate the super summary.
        """
        system_prompt = f"""Eres un asistente académico experto creando "Súper Resúmenes" para la materia {materia} (Semana {semana}).
El usuario te proporcionará el texto extraído de presentaciones y apuntes PDF.
Tu objetivo es consolidar esta información en un único resumen estructurado, claro y fácil de estudiar de cara a un examen.

Estructura obligatoria del resumen (Usa siempre Markdown):
1. # (Título del Tema Principal)
2. ## Introducción y Objetivos
   - Breve contexto de qué trata el tema.
3. ## Conceptos Clave
   - Definiciones importantes, fórmulas o ideas centrales (usa viñetas o negritas).
4. ## Desarrollo Estructurado
   - Divide la información en subtemas lógicos (usa ### para subtemas).
   - Explica de forma concisa.
5. ## Ejemplos / Casos Prácticos
   - Incluye ejemplos concretos si se mencionan en el texto.
6. ## Conclusiones y Puntos a Recordar
   - Resumen final en 3-5 viñetas para memorizar rápido.

Idioma: {'Español' if language == 'es' else 'Inglés'}.
Mantén un tono académico, formal pero accesible. Elimina la redundancia que suele haber en las diapositivas.
No inventes datos que no estén en el texto original."""

        user_content = f"AQUÍ ESTÁ EL TEXTO A RESUMIR:\n{text}"

        try:
            result = GeminiService._call_with_fallback(
                contents=user_content,
                system_instruction=system_prompt,
            )
            return result
        except Exception as e:
            print(f"[Gemini] FATAL - All models failed for generate_summary:")
            traceback.print_exc()
            return f"Error al generar el resumen: {str(e)}"

    @staticmethod
    def refine_summary(history_messages, user_prompt):
        """
        Chat with the model sending prior context (history_messages) and the new prompt.
        The history_messages format from the frontend is:
        [{"role": "user"/"model", "parts": [{"text": "..."}]}]
        """
        try:
            # Build the conversation contents for the new SDK
            # The new SDK expects a list of Content objects or dicts
            contents = []
            
            for msg in history_messages:
                role = msg.get("role", "user")
                parts = msg.get("parts", [])
                text_parts = []
                for p in parts:
                    if isinstance(p, dict) and "text" in p:
                        text_parts.append(p["text"])
                    elif isinstance(p, str):
                        text_parts.append(p)
                
                if text_parts:
                    contents.append(
                        types.Content(
                            role=role,
                            parts=[types.Part.from_text(text=t) for t in text_parts]
                        )
                    )
            
            # Add the new user prompt
            contents.append(
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=user_prompt)]
                )
            )
            
            result = GeminiService._call_with_fallback(contents=contents)
            return result
            
        except Exception as e:
            print(f"[Gemini] FATAL - All models failed for refine_summary:")
            traceback.print_exc()
            return f"Error al enviar mensaje: {str(e)}"

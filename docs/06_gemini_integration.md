# 🤖 EduSync AI — Gemini AI Integration

## Modelo

| Aspecto | Valor |
|---------|-------|
| **Modelo** | `gemini-2.0-flash` |
| **Tipo** | Multimodal (texto + imágenes) |
| **Contexto** | ~1M tokens |
| **SDK** | `google-generativeai` (Python) |

## Estructura del "Súper Resumen"

El output de Gemini es un JSON con esta estructura:

```json
{
  "temas": [
    {
      "titulo": "Nombre del tema",
      "subtemas": [
        {
          "titulo": "Subtema",
          "descripcion": "Explicación clara"
        }
      ]
    }
  ],
  "puntos_clave": ["Punto 1", "Punto 2"],
  "analisis_visual": [
    {
      "descripcion": "Descripción del diagrama",
      "interpretacion": "Qué nos dice"
    }
  ],
  "glosario": [
    {
      "termino": "Término",
      "definicion": "Definición formal",
      "analogia": "Analogía simple"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Pregunta?",
      "opciones": ["A", "B", "C", "D"],
      "respuesta": "A",
      "explicacion": "Por qué"
    }
  ]
}
```

## Funciones del Servicio

### `generate_summary(text, images[], context)`
- Envía texto + imágenes (base64) a Gemini
- Prompt de sistema en español con estructura requerida
- `context` incluye materia y semana para contextualización
- Retorna JSON del Súper Resumen

### `refine_summary(current_summary, user_message)`
- Envía resumen actual + feedback del usuario
- Gemini modifica el resumen manteniendo la estructura
- Retorna resumen actualizado

## Prompt de Sistema (Borrador)

```
Eres un asistente académico. Genera un "Súper Resumen" en español 
con esta estructura JSON exacta:
- temas: con subtemas y descripciones
- puntos_clave: lista de puntos importantes
- analisis_visual: descripción e interpretación de diagramas
- glosario: término + definición + analogía
- quiz: preguntas de opción múltiple con explicación

Reglas:
- Todo en ESPAÑOL
- Conciso pero completo
- Analogías simples en glosario
- Analiza TODOS los diagramas e imágenes
```

## Extracción de Documentos

| Formato | Librería | Extrae |
|---------|----------|--------|
| PDF | PyMuPDF | Texto + renders de página a 150 DPI |
| PPTX | python-pptx | Texto de shapes + imágenes embebidas |
| DOCX | python-docx | Texto de párrafos + imágenes inline |

## Límites y Consideraciones

- **Token limit**: Archivos muy grandes pueden necesitar chunking
- **Rate limit**: Depende del plan de Google AI
- **Imágenes**: Se envían como base64 en el prompt multimodal
- **Tamaño**: Máx 5 archivos, 25MB cada uno
- **Idioma**: Archivos principalmente en español (posible inglés futuro)
- **Retry**: Implementar backoff exponencial

> [!NOTE]
> **Pendiente**: Definir si se necesita chunking automático para documentos que excedan el token limit de Gemini.

# ⚙️ EduSync AI — Backend Services

## Configuración General

### Framework y Dependencias

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `django` | ≥5.0 | Framework web principal |
| `djangorestframework` | ≥3.15 | Toolkit para REST APIs |
| `django-cors-headers` | ≥4.3 | CORS para el frontend Astro |
| `python-dotenv` | ≥1.0 | Variables de entorno desde `.env` |
| `notion-client` | ≥2.2 | SDK oficial de Notion para Python |
| `google-generativeai` | ≥0.8 | SDK de Google Gemini |
| `PyMuPDF` | ≥1.24 | Extracción de PDF (texto + imágenes) |
| `python-pptx` | ≥1.0 | Extracción de PowerPoint |
| `python-docx` | ≥1.1 | Extracción de Word |
| `Pillow` | ≥10.0 | Procesamiento de imágenes |

### Configuración Django (`settings.py`)

- **REST Framework**: JSON renderer/parser por defecto
- **CORS**: Origins permitidos = `["http://localhost:4321"]`
- **File Uploads**: Max 25MB
- **Base de datos**: Ninguna (procesamiento stateless)
- **Apps**: `rest_framework`, `corsheaders`, `api`

---

## Servicios

### 1. `notion_service.py` — Integración con Notion

**Propósito**: Toda la comunicación con la API de Notion. Lectura de datos de la DB "Notas de Clase" y escritura de bloques.

#### Funciones

##### `get_materias() → list[str]`
Obtiene las opciones únicas del campo `Materia` (tipo `select`).

```python
# Lógica:
# 1. Conectar al SDK de Notion con NOTION_TOKEN
# 2. Retrieve database schema (DB ID: 63337178-cfe0-82e1-a478-012eccf8b9f3)
# 3. Extraer opciones del property "Materia" (select)
# 4. Retornar lista de nombres

# Response ejemplo:
["SEGURIDAD INFORMÁTICA", "BIG DATA Y ANALÍTICA DE DATOS", ...]
```

##### `get_semanas(materia: str) → list[dict]`
Obtiene las páginas filtradas por materia.

```python
# Lógica:
# 1. Query a la DB con filtro: Materia.select.name == materia
# 2. Extraer id y título (Nombre) de cada página
# 3. Retornar lista de {id, nombre}

# Response ejemplo:
[
    {"id": "32d37178-...", "nombre": "Semana 1 - Anotaciones"},
    {"id": "44e28179-...", "nombre": "Semana 2 - Anotaciones"},
]
```

##### `publish_summary(page_id: str, blocks: list[dict]) → dict`
Publica bloques de resumen a una página de Notion.

```python
# Lógica:
# 1. Recibir lista de Notion block objects
# 2. Batch en chunks de 100 (limitación de la API)
# 3. Append children a la página target
# 4. Retornar URL de la página y status

# Consideraciones:
# - Max 100 bloques por request de API
# - Retry logic para rate limiting
# - Manejar errores de permisos
```

**Database ID**: `63337178-cfe0-82e1-a478-012eccf8b9f3`

**Schema de la DB destino**:
| Property | Type | Pattern |
|----------|------|---------|
| `Materia` | `select` | 6 opciones predefinidas |
| `Nombre` | `title` | "Semana N - Anotaciones" |

---

### 2. `document_service.py` — Extracción de Documentos

**Propósito**: Extraer texto e imágenes de archivos subidos (PDF, PPTX, DOCX) para enviar a Gemini.

#### Funciones

##### `extract_from_pdf(file) → dict`
```python
# Herramienta: PyMuPDF (fitz)
# Output: { "text": str, "images": list[str] }
#
# Proceso:
# 1. Abrir PDF con fitz.open()
# 2. Por cada página:
#    a. Extraer texto con page.get_text()
#    b. Renderizar página como imagen a 150 DPI (pixmap)
#    c. Convertir pixmap a base64 PNG
# 3. Concatenar texto de todas las páginas
# 4. Retornar texto + lista de imágenes base64
#
# Nota: Se renderizan las páginas completas como imágenes
# para que Gemini pueda analizar diagramas, tablas y gráficos
# que no se capturan bien solo con extracción de texto.
```

##### `extract_from_pptx(file) → dict`
```python
# Herramienta: python-pptx
# Output: { "text": str, "images": list[str] }
#
# Proceso:
# 1. Abrir presentación con Presentation()
# 2. Por cada slide:
#    a. Iterar shapes → extraer texto de text_frames
#    b. Detectar shapes de tipo imagen → extraer como base64
# 3. Retornar texto concatenado + imágenes
```

##### `extract_from_docx(file) → dict`
```python
# Herramienta: python-docx
# Output: { "text": str, "images": list[str] }
#
# Proceso:
# 1. Abrir documento con Document()
# 2. Extraer texto de todos los párrafos
# 3. Extraer imágenes embebidas (inline shapes)
# 4. Retornar texto + imágenes
```

**Consideraciones de rendimiento**:
- Los PDFs pueden ser pesados con el render a 150 DPI
- Limitar resolución si el archivo excede cierto tamaño
- Imágenes se almacenan temporalmente en memoria (no disco)

---

### 3. `gemini_service.py` — Procesamiento con IA

**Propósito**: Enviar contenido extraído a Google Gemini y obtener resúmenes estructurados.

#### Modelo: `gemini-2.0-flash`
- Multimodal (texto + imágenes)
- Ventana de contexto ~1M tokens
- Velocidad optimizada para respuestas rápidas

#### Funciones

##### `generate_summary(text: str, images: list[str], context: dict) → dict`
```python
# Proceso:
# 1. Construir prompt de sistema en español con instrucciones del "Súper Resumen"
# 2. Adjuntar texto extraído como contexto
# 3. Adjuntar imágenes de páginas (base64) para análisis visual
# 4. Enviar a Gemini como solicitud multimodal
# 5. Parsear respuesta JSON estructurada
# 6. Validar estructura del output

# Input context puede incluir:
# - materia: nombre de la materia (para contextualizar)
# - semana: nombre de la semana
```

##### `refine_summary(current_summary: dict, user_message: str) → dict`
```python
# Proceso:
# 1. Enviar resumen actual + mensaje del usuario a Gemini
# 2. Instruir a Gemini a modificar el resumen según feedback
# 3. Retornar resumen actualizado manteniendo la estructura JSON
```

#### Estructura del Prompt de Sistema (Borrador)

```
Eres un asistente académico especializado. Tu tarea es generar un 
"Súper Resumen" estructurado a partir del material de clase proporcionado.

El resumen DEBE seguir esta estructura JSON:

{
  "temas": [
    {
      "titulo": "Nombre del tema",
      "subtemas": [
        {
          "titulo": "Subtema",
          "descripcion": "Explicación clara y concisa"
        }
      ]
    }
  ],
  "puntos_clave": [
    "Punto importante 1",
    "Punto importante 2"
  ],
  "analisis_visual": [
    {
      "descripcion": "Descripción del diagrama/gráfico encontrado",
      "interpretacion": "Qué nos dice este visual"
    }
  ],
  "glosario": [
    {
      "termino": "Término",
      "definicion": "Definición formal",
      "analogia": "Analogía simple para entender mejor"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Pregunta sobre el tema?",
      "opciones": ["A", "B", "C", "D"],
      "respuesta": "A",
      "explicacion": "Por qué esta es la respuesta correcta"
    }
  ]
}

Reglas:
- Todo en ESPAÑOL
- Sé conciso pero completo
- Usa analogías simples en el glosario
- Las preguntas del quiz deben ser de opción múltiple
- Analiza TODOS los diagramas e imágenes proporcionadas
```

**Consideraciones**:
- Token limit: si el contenido excede ~1M tokens, se debe implementar chunking
- Rate limiting: Google Gemini tiene límites por minuto según el plan
- Retry logic con backoff exponencial
- Idioma: archivos principalmente en español

---

### 5. `history_service.py` — Historial Local

**Propósito**: Guardar y consultar resúmenes generados localmente en archivos JSON, sin necesidad de base de datos.

#### Almacenamiento
- **Ubicación**: `backend/history/` (directorio local)
- **Formato**: Un archivo JSON por resumen generado
- **Naming**: `{materia}_{semana}_{timestamp}.json`

#### Funciones

##### `save_summary(materia, semana, summary, source_files) → dict`
```python
# Guarda resumen en archivo JSON local
# Incluye: materia, semana, summary JSON, archivos fuente, timestamp
# Retorna: {id, path, created_at}
```

##### `list_history(materia=None) → list[dict]`
```python
# Lista resúmenes guardados, opcionalmente filtrados por materia
# Retorna: [{id, materia, semana, created_at, source_files}]
```

##### `get_summary(history_id) → dict`
```python
# Recupera un resumen específico por ID
# Retorna: {materia, semana, summary, source_files, created_at}
```

---

### 4. `summary_builder.py` — Generador de Bloques Notion

**Propósito**: Convertir el JSON del resumen de Gemini en objetos de bloque compatibles con la API de Notion.

#### Mapeo JSON → Notion Blocks

| Sección del Resumen | Tipo de Bloque Notion | Detalles |
|---------------------|----------------------|----------|
| Tema → `titulo` | `heading_1` | Texto del tema como H1 |
| Subtema → `titulo` | `heading_2` | Texto del subtema como H2 |
| Subtema → `descripcion` | `paragraph` | Párrafo de descripción |
| `puntos_clave[]` | `bulleted_list_item` | Bullets con cada punto |
| `analisis_visual[]` | `callout` (💡) | Callout con emoji de foco |
| `glosario[]` | `toggle` | Toggle: término → definición + analogía |
| `quiz[]` → pregunta | `callout` (❓) | Callout con emoji de pregunta |
| `quiz[]` → respuesta | `toggle` (dentro del callout) | Toggle con respuesta oculta |
| Entre secciones | `divider` | Separador visual |

#### Ejemplo de bloque Notion generado

```python
# Para un punto clave:
{
    "object": "block",
    "type": "bulleted_list_item",
    "bulleted_list_item": {
        "rich_text": [{
            "type": "text",
            "text": {"content": "Los firewalls de nueva generación..."}
        }]
    }
}

# Para un término del glosario (toggle):
{
    "object": "block",
    "type": "toggle",
    "toggle": {
        "rich_text": [{
            "type": "text",
            "text": {"content": "Firewall"},
            "annotations": {"bold": True}
        }],
        "children": [
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{
                        "type": "text",
                        "text": {"content": "Definición: Sistema de seguridad..."}
                    }]
                }
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{
                        "type": "text",
                        "text": {"content": "🔄 Analogía: Es como el guardia..."}
                    }]
                }
            }
        ]
    }
}
```

---

## `notion_blocks.py` (Utils)

**Propósito**: Funciones helper para construir objetos de bloque Notion sin repetir boilerplate.

```python
# Funciones previstas:
def heading_1(text: str) -> dict
def heading_2(text: str) -> dict
def paragraph(text: str) -> dict
def bulleted_item(text: str) -> dict
def callout(text: str, emoji: str) -> dict
def toggle(title: str, children: list[dict]) -> dict
def divider() -> dict
def rich_text(content: str, bold=False, italic=False, code=False) -> dict
```

---

> [!WARNING]
> **Limitaciones conocidas de la API de Notion**:
> - Máx. 100 bloques por request de append
> - Máx. 2000 caracteres por bloque de texto (rich_text)
> - No soporta imágenes base64 directamente (solo URLs externas)
> - Rate limit de 3 requests por segundo

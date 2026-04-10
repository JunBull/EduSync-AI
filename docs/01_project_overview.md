# 📋 EduSync AI — Project Overview

## Visión del Proyecto

EduSync AI es una aplicación web personal de uso local que automatiza la creación de resúmenes inteligentes a partir de archivos de clase (PDF, PPTX, DOCX). Utiliza inteligencia artificial generativa (Google Gemini) para analizar el contenido — incluyendo texto, imágenes y diagramas — y genera "Súper Resúmenes" estructurados que se sincronizan directamente a la base de datos **"Notas de Clase"** en Notion.

> **Uso**: Personal, sin autenticación, ejecutado localmente.

## Problema que Resuelve

El usuario necesita procesar material académico de múltiples materias universitarias y convertirlo en notas de estudio organizadas. El proceso manual es lento y propenso a omitir información clave. EduSync AI automatiza:

1. **Extracción** de contenido de archivos heterogéneos (PDF, PPTX, DOCX)
2. **Análisis con IA** del contenido textual y visual (diagramas, gráficos, tablas)
3. **Generación** de resúmenes estructurados en español
4. **Publicación** directa a Notion con formato rico

## Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| **Frontend** | Astro + React Islands | UI premium con hidratación selectiva |
| **Estilos** | Tailwind CSS v4 | Utility-first CSS, configuración CSS-first |
| **Backend** | Django REST Framework | API stateless para procesamiento |
| **IA** | Google Gemini (gemini-2.0-flash) | Análisis multimodal de documentos |
| **Integración** | Notion API (SDK Python) | Lectura/escritura a base de datos Notion |
| **Procesamiento** | PyMuPDF, python-pptx, python-docx | Extracción de texto e imágenes |
| **Design System** | Sage Intelligence (Stitch) | Tema light, verdes botánicos, Lexend + Plus Jakarta Sans |
| **Historial** | JSON local | Almacenamiento local de resúmenes generados |

## Arquitectura de Alto Nivel

```
┌─────────────────┐          ┌─────────────────┐          ┌────────────────┐
│   Astro Frontend │  ◄────► │ Django REST API  │  ◄────►  │  Google Gemini │
│   (localhost:4321)│  HTTP   │ (localhost:8000) │  API     │  (Cloud)       │
└─────────────────┘          └────────┬────────┘          └────────────────┘
                                      │
                                      │ API
                                      ▼
                             ┌─────────────────┐
                             │   Notion API     │
                             │   (Cloud)        │
                             └─────────────────┘
```

## Flujo Principal del Usuario

1. **Seleccionar** materia y semana desde selectores conectados a Notion
2. **Subir** archivos de clase (PDF, PPTX, DOCX) vía drag & drop
3. **Procesar** los archivos con IA (extracción + análisis Gemini)
4. **Revisar** el resumen generado en un panel de chat interactivo
5. **Refinar** el resumen mediante conversación con la IA
6. **Publicar** el resumen directamente a la página de Notion seleccionada

## Materias Actuales (Periodo Vigente)

| # | Materia |
|---|---------|
| 1 | Seguridad Informática |
| 2 | Fundamentos del Método Científico |
| 3 | Big Data y Analítica de Datos |
| 4 | Proyecto Final de Carrera I |
| 5 | Formación de Empresas de Base Tecnológica II |
| 6 | Plan de Negocios |

> [!NOTE]
> Las materias se obtienen dinámicamente desde la propiedad `select` de la base de datos de Notion. Al agregar/quitar materias en Notion, el sistema se actualiza automáticamente.

## Principios de Diseño

- **Light Theme "Sage Intelligence"**: Verdes botánicos, glassmorphism suave, bordes full-rounded
- **3-Panel Layout**: Sidebar (config) + Workspace (contenido) + AI Chat (asistente)
- **Sin Logo**: Solo texto "EduSync AI" estilizado
- **Interfaz 100% en Español**: Todos los textos, botones y mensajes en español
- **Stateless Backend**: Sin base de datos desplegada, historial en JSON local
- **Multimodal**: No solo texto — análisis de imágenes, diagramas y gráficos
- **Archivos en Español**: El contenido procesado será principalmente en español

---

> **Estado**: 🟢 API Keys configuradas — Listas para insertar en `.env` durante el setup.
>
> **Decisiones Confirmadas**:
> - ✅ API keys obtenidas (Gemini + Notion)
> - ✅ Uso personal, sin autenticación
> - ✅ Solo uso local (no despliegue)
> - ✅ Historial local en JSON
> - ✅ Máx. 25MB por archivo
> - ✅ Design system "Sage Intelligence" (light, green botanical)
> - ✅ Sin logo (solo texto)
> - ✅ Materias dinámicas desde Notion
> - ✅ Secciones del Súper Resumen confirmadas
> - ⏳ Requiere instalar Python 3.11+ y Node.js 18+

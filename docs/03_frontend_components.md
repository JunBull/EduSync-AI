# 🎨 EduSync AI — Frontend Components

## Tecnología Base

- **Framework**: Astro (SSR mode) con React Islands
- **Patrón**: Hidratación selectiva — solo los componentes interactivos se hidratan con React
- **Styling**: Tailwind CSS v4 (utility-first, configuración CSS-first vía `@theme`)
- **Tipografía**: Lexend (headlines/labels) + Plus Jakarta Sans (body) vía Google Fonts
- **Tema**: LIGHT con verdes botánicos y bordes full-rounded

### Configuración Tailwind v4

Tailwind v4 usa configuración CSS-first (sin `tailwind.config.js`). Los design tokens de "Sage Intelligence" se definen directamente en el CSS:

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  --color-primary: #2a6b44;
  --color-primary-dim: #1c5f39;
  --color-primary-container: #aef2c0;
  --color-secondary: #3f6758;
  --color-secondary-container: #c0ecda;
  --color-tertiary: #2e6771;
  --color-tertiary-container: #b9f2fd;
  --color-surface: #f8faf9;
  --color-surface-container: #eaefee;
  --color-surface-container-low: #f1f4f3;
  --color-surface-container-high: #e4e9e8;
  --color-surface-container-highest: #dde4e3;
  --color-surface-container-lowest: #ffffff;
  --color-on-surface: #2d3433;
  --color-on-surface-variant: #596060;
  --color-on-primary: #e8ffea;
  --color-outline: #757c7b;
  --color-outline-variant: #acb3b2;
  --color-error: #a83836;

  --font-headline: "Lexend", sans-serif;
  --font-body: "Plus Jakarta Sans", sans-serif;
  --font-label: "Lexend", sans-serif;

  --radius-card: 2rem;
  --radius-button: 3rem;
}
```

**Integración con Astro**: Se instala vía `@tailwindcss/vite` como plugin de Vite en `astro.config.mjs`.

## Design System

### Paleta de Colores (Sage Intelligence)

| Token | Hex | Uso |
|-------|-----|-----|
| `--primary` | `#2a6b44` | Acción principal, CTA |
| `--primary-dim` | `#1c5f39` | Hover/press del primary |
| `--primary-container` | `#aef2c0` | Fondos suaves primary |
| `--secondary` | `#3f6758` | Labels, categorías |
| `--tertiary` | `#2e6771` | Acentos de IA |
| `--tertiary-container` | `#b9f2fd` | Glow inputs IA |
| `--surface` | `#f8faf9` | Fondo base |
| `--on-surface` | `#2d3433` | Texto principal (NUNCA #000) |
| `--surface-container-low` | `#f1f4f3` | Bloques de contenido |
| `--surface-container-lowest` | `#ffffff` | Cards activas |

### Efectos Visuales (Sage Intelligence)

- **Glassmorphism suave**: `surface` al 70% opacity + `backdrop-blur: 20px`
- **Gradientes**: Primary (#2a6b44) → Primary Dim (#1c5f39) a 135°
- **Tonal Layering**: Sin sombras tradicionales — elevación por cambio de superficie
- **Ambient Shadow** (solo cards flotantes): `box-shadow: 0 20px 40px rgba(45, 52, 51, 0.06)`
- **Roundness**: FULL — mínimo `1rem` border-radius
- **Sin líneas divisoras**: Separación solo por cambio de color de fondo

### Layout Principal (3 Paneles — de referencia Stitch)

```
┌──────────────────────────────────────────────────────────────┐
│ Sidebar (Left)        │ Main Workspace (Center)  │ AI (Right)│
│                       │                          │           │
│ • "EduSync AI"        │ "Cultivate your          │ Gemini AI │
│ • SYNCED status       │  Intelligence"           │ Chat      │
│ • Notion Integration  │                          │           │
│ • Select Course ▼     │ ┌──────────────────┐     │ Contextual│
│ • Select Week ▼       │ │ Drop your files  │     │ Summary   │
│                       │ │ here             │     │           │
│ • Sync Workspace      │ │ PDF DOCX PPTX    │     │ [insight] │
│ • Clear Session       │ │ Max 25MB         │     │           │
│                       │ └──────────────────┘     │           │
│ Session Files:        │                          │ "Ask      │
│ • Lecture_04.pdf      │ [Generate Summary]       │  Gemini"  │
│                       │                          │           │
└──────────────────────────────────────────────────────────────┘
```

**Mobile**: Se colapsa el sidebar en hamburger menu, workspace ocupa todo el ancho, y el chat es accesible vía tab/botón.

---

## Componentes

### 1. `Header.jsx`

**Propósito**: Branding de la app y estado de conexión.

| Aspecto | Detalle |
|---------|---------|
| **Hidratación** | `client:load` |
| **Elementos** | Logo con texto gradiente "EduSync AI", indicador de conexión Notion |
| **Estado** | Status de conexión (verde = conectado, rojo = error) |
| **Estilo** | Gradiente violet→cyan en el nombre, ícono animado |

**Responsabilidades**:
- Mostrar branding de la aplicación
- Indicar si la conexión con Notion está activa (puede hacer un health check inicial)
- Ícono/logo animado (pulsante o con efecto glow)

---

### 2. `NotionSelector.jsx`

**Propósito**: Selector cascada de Materia → Semana conectado a Notion.

| Aspecto | Detalle |
|---------|---------|
| **Hidratación** | `client:load` |
| **API calls** | `GET /api/notion/materias/`, `GET /api/notion/semanas/?materia=X` |
| **Estado interno** | `materias[]`, `selectedMateria`, `semanas[]`, `selectedSemana`, `pageId`, `loading`, `error` |

**Flujo de interacción**:
```
1. Al montar → fetch materias → mostrar dropdown de cursos
2. Usuario selecciona materia → fetch semanas filtradas → mostrar dropdown de semanas
3. Usuario selecciona semana → almacenar page_id para publicación posterior
```

**Diseño visual**:
- Dropdowns con estilo glassmorphic
- Chips de color para cada materia (matching colores de Notion)
- Transiciones suaves al abrir/cerrar
- Loading skeleton mientras carga

**Datos que expone** (vía callback/context):
- `selectedPageId` — ID de la página de Notion seleccionada
- `selectedMateria` — Nombre de la materia seleccionada
- `selectedSemana` — Nombre de la semana seleccionada

---

### 3. `FileUploader.jsx`

**Propósito**: Zona de drag & drop para subir archivos de clase.

| Aspecto | Detalle |
|---------|---------|
| **Hidratación** | `client:load` |
| **API calls** | `POST /api/process/` (multipart/form-data) |
| **Formatos** | `.pdf`, `.pptx`, `.docx` |
| **Límites** | Máx. 5 archivos, 25MB cada uno |

**Estado interno**:
- `files[]` — archivos seleccionados con metadata (nombre, tamaño, tipo, estado)
- `isDragging` — estado visual del drag over
- `uploading` — indicador de progreso
- `error` — mensajes de validación

**Diseño visual**:
- Zona de drop con borde punteado animado
- Efecto de highlight al hacer drag over
- Cards de preview por archivo con: ícono de tipo, nombre, tamaño
- Botón de eliminar por archivo
- Botón "Procesar con IA" → dispara el POST

**Validaciones**:
- Tipo de archivo permitido
- Tamaño máximo por archivo (25MB)
- Cantidad máxima de archivos (5)
- Feedback visual para archivos rechazados

---

### 4. `ProgressBar.jsx`

**Propósito**: Indicador de progreso multi-paso del procesamiento.

| Aspecto | Detalle |
|---------|---------|
| **Hidratación** | `client:load` |
| **Props** | `currentStep`, `steps[]` |

**Pasos del proceso**:
```
Upload → Extracción → IA Processing → Revisión → Publicado
  📤        📄            🤖            💬          ✅
```

**Diseño visual**:
- Barra de progreso con gradiente animado (violet → cyan)
- Íconos/emojis por cada paso
- Labels debajo de cada step
- Step actual con efecto glow/pulse
- Steps completados con check animado

---

### 5. `ChatReview.jsx`

**Propósito**: Panel de revisión interactiva del resumen generado.

| Aspecto | Detalle |
|---------|---------|
| **Hidratación** | `client:load` |
| **API calls** | `POST /api/chat/refine/`, `POST /api/notion/publish/` |
| **Posición** | Panel derecho (40%), sticky sidebar |

**Estado interno**:
- `messages[]` — historial de chat `[{role, content, timestamp}]`
- `currentSummary` — resumen actual (actualizado tras cada refinamiento)
- `isTyping` — indicador de "IA escribiendo..."
- `isPublishing` — estado de publicación
- `published` — éxito de publicación

**Flujo de interacción**:
```
1. Recibe resumen del procesamiento → muestra outline en mensajes
2. Usuario escribe refinamiento → POST /api/chat/refine/
3. IA responde con resumen actualizado → mostrar en chat
4. Repetir hasta que usuario esté satisfecho
5. Click "Publicar en Notion" → POST /api/notion/publish/
6. Éxito → mostrar link a la página de Notion
```

**Diseño visual**:
- Burbujas de mensaje (usuario = violet, IA = cyan/dark)
- Typing indicator animado (tres puntos)
- Input de texto con bordes glowing al focus
- Botón flotante "Publicar en Notion" con ícono de Notion
- Scroll automático a mensajes nuevos
- Timestamps en formato relativo

**Ejemplos de refinamiento**:
- "Enfócate más en los diagramas"
- "Agrega más ejemplos prácticos"
- "Simplifica el glosario"
- "Añade preguntas de quiz más difíciles"

---

### 6. `SummaryPreview.jsx`

**Propósito**: Vista previa rica del resumen generado, emulando cómo se verá en Notion.

| Aspecto | Detalle |
|---------|---------|
| **Hidratación** | `client:visible` (lazy — solo cuando entra en viewport) |
| **Props** | `summary` (objeto JSON del resumen) |

**Secciones renderizadas**:

| Sección | Ícono | Formato |
|---------|-------|---------|
| Temas | 📚 | Headings con descripción |
| Puntos Clave | 🔑 | Lista con bullets |
| Análisis Visual | 🖼️ | Callout con descripción de diagramas |
| Glosario | 📖 | Toggles Term → Definición + Analogía |
| Quiz | ❓ | Preguntas con respuestas ocultas |

**Diseño visual**:
- Secciones colapsables con animación
- Syntax highlighting para bloques de código
- Estilo que emula la apariencia de Notion
- Indicadores visuales por sección (emojis + colores)
- Transiciones suaves al expandir/colapsar

---

## Comunicación entre Componentes

Los componentes React son "islands" independientes. La comunicación se maneja mediante:

1. **Props desde Astro** — datos iniciales inyectados desde `index.astro`
2. **Custom Events** — para comunicación cross-island (ej: FileUploader → ChatReview)
3. **Estado global (Context o store)** — si se necesita compartir estado complejo

### Flujo de datos entre componentes:

```
NotionSelector ──(pageId)──► ChatReview (para publicar)
FileUploader ──(summary)──► ChatReview (resumen inicial)
FileUploader ──(step)──► ProgressBar (actualización de paso)
ChatReview ──(summary)──► SummaryPreview (preview actualizado)
```

---

## Responsive Design

| Breakpoint | Layout |
|------------|--------|
| `>= 1024px` | Split panel 60/40 |
| `768px - 1023px` | Split panel 55/45, fuentes reducidas |
| `< 768px` | Stack vertical con tabs (Contenido / Chat) |

---

> [!NOTE]
> **Pendiente**: Definir si se usará Context API de React, un store global como Zustand, o custom events del DOM para la comunicación entre islands. Esto dependerá de la complejidad real de la interacción.

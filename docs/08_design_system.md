# 🎨 EduSync AI — Design System "Sage Intelligence"

> Extraído del proyecto Stitch "EduSync AI" — Design System "Sage Intelligence"  
> **Implementado con**: Tailwind CSS v4 (configuración CSS-first vía `@theme`)

## North Star Creativo: "The Digital Greenhouse"

El sistema de diseño se aleja de los grids rígidos del EdTech tradicional para crear un entorno descrito como **The Digital Greenhouse**. El objetivo es fomentar un espacio que se sienta orgánico, respirable e intelectualmente nutritivo. Usando verdes pastel suaves y bordes muy redondeados, la narrativa de "IA" pasa de automatización fría a un compañero amigable y colaborativo.

### Dirección Editorial
- **Asimetría Intencional**: Balancear tipografía `display-lg` grande contra cards flotantes más pequeñas
- **White space como oxígeno**: No como espacio vacío, sino como elemento estructural
- **Overlap sutil**: Elementos que se superponen ligeramente para sugerir profundidad

---

## Modo y Tema

| Aspecto | Valor |
|---------|-------|
| **Modo** | LIGHT (claro) |
| **Roundness** | ROUND_FULL (máximo redondeado) |
| **Spacing Scale** | 3 |
| **Sin Logo** | Solo texto "EduSync AI" |

---

## Paleta de Colores

### Colores Principales

| Token | Hex | Uso |
|-------|-----|-----|
| `primary` | `#2a6b44` | Acción principal, CTA |
| `primary_dim` | `#1c5f39` | Hover/press del primary |
| `primary_container` | `#aef2c0` | Fondos suaves de elementos primary |
| `secondary` | `#3f6758` | Labels, categorías |
| `secondary_container` | `#c0ecda` | Fondos de elementos secundarios |
| `tertiary` | `#2e6771` | Acentos de IA, distinguir contenido AI |
| `tertiary_container` | `#b9f2fd` | Glow para inputs de IA |

### Colores Override (Stitch)

| Token | Hex |
|-------|-----|
| `overridePrimaryColor` | `#6DAE81` |
| `overrideSecondaryColor` | `#8FB9A8` |
| `overrideNeutralColor` | `#F7F9F8` |

### Surfaces (Fondos)

| Token | Hex | Uso |
|-------|-----|-----|
| `surface` | `#f8faf9` | Fondo base principal |
| `surface_container_low` | `#f1f4f3` | Bloques de contenido |
| `surface_container` | `#eaefee` | Containers generales |
| `surface_container_high` | `#e4e9e8` | Inputs, elementos interactivos |
| `surface_container_highest` | `#dde4e3` | Botones secundarios, tracks |
| `surface_container_lowest` | `#ffffff` | Cards activas (máximo "lift") |
| `background` | `#f8faf9` | Fondo de la app |

### Texto

| Token | Hex | Uso |
|-------|-----|-----|
| `on_surface` | `#2d3433` | Texto principal (NUNCA usar #000) |
| `on_surface_variant` | `#596060` | Texto secundario |
| `on_primary` | `#e8ffea` | Texto sobre primary |
| `outline` | `#757c7b` | Bordes (usar con moderación) |
| `outline_variant` | `#acb3b2` | Ghost borders (15% opacity) |

### Error

| Token | Hex |
|-------|-----|
| `error` | `#a83836` |
| `error_container` | `#fa746f` |
| `on_error` | `#fff7f6` |

---

## Tipografía

| Rol | Fuente | Uso |
|-----|--------|-----|
| **Headlines** | Lexend | Headers, display text, labels |
| **Body** | Plus Jakarta Sans | Contenido de lectura, párrafos |
| **Labels** | Lexend | Categorías, tags |

### Escalas Tipográficas

| Token | Tamaño | Detalles |
|-------|--------|----------|
| `display-lg` | 3.5rem | Letter-spacing: -0.02em (hero) |
| `headline` | — | Lexend, headers de sección |
| `body-lg` | 1rem | Plus Jakarta Sans, contenido principal |
| `label-md` | — | ALL-CAPS, letter-spacing: +0.05em, color secondary |

---

## Reglas de Diseño

### Regla "No-Line"
> **Prohibido** usar bordes de 1px solid para definir secciones. Los límites se definen **solo** con cambios de color de fondo.

- `surface-container-low` sobre `surface` = seccionar sin líneas
- Usar spacing `12` o `16` para distancia suficiente

### Jerarquía de Superficies (Capas)
```
Capa Base:              surface (#f8faf9)
  └─ Bloques:           surface-container-low (#f1f4f3)
      └─ Cards Activas: surface-container-lowest (#ffffff)
          └─ IA:        tertiary_container (#b9f2fd) — para contenido AI
```

### Gradientes
- **Primary Gradient**: `primary` (#2a6b44) → `primary_dim` (#1c5f39) a 135°
- **Glassmorphism**: `surface` al 70% opacity + `backdrop-blur: 20px`

### Elevación (Tonal Layering)
- Sin sombras tradicionales "dirty"
- **Inner depth**: `primary_container` dentro de `surface_container_high`
- **Ambient Shadow** (solo cards flotantes): `box-shadow: 0 20px 40px rgba(45, 52, 51, 0.06)`
- **Ghost Border** (solo accesibilidad): `outline_variant` (#acb3b2) al 15% opacity

---

## Componentes

### Botones
| Tipo | Fill | Border Radius | Texto |
|------|------|---------------|-------|
| **Primary** | Gradiente primary→primary_dim | 3rem (xl) | on_primary |
| **Secondary** | surface_container_highest | 3rem (xl) | on_surface |
| **Ghost** | Ninguno | — | primary (solo texto) |

### Cards & Módulos
- **Sin líneas divisoras** (prohibido)
- Padding interno: `spacing-6` (2rem)
- Body: `surface-container-low`
- Elementos interactivos internos: `surface-container-lowest`
- Border-radius: `lg` (2rem) o `xl` (3rem)

### Inputs
| Estado | Fondo | Borde | Extra |
|--------|-------|-------|-------|
| Default | `surface_container_high` | Ninguno | Roundness xl |
| Focus | Mismo | 2px primary al 20% opacity | Glow `primary_container` |
| AI Input | Mismo | — | Glow `tertiary_container` |

### Barras de Progreso
- Track: `surface_container_highest`
- Indicador: `primary` green
- Roundness: `full`
- Grosor: thick

---

## Do's & Don'ts

### ✅ Do
- Overlap de imágenes y texto por `spacing-10` (editorial feel)
- Usar `primary_fixed_dim` para hover states en surfaces claras
- Iconografía grande (24-32px) con trazos delgados
- Bordes redondeados mínimo `1rem`

### ❌ Don't
- **NUNCA** usar `#000000` para texto → usar `on_surface` (#2d3433)
- **NUNCA** usar border-radius `0.25rem` → mínimo `1rem`
- **NUNCA** usar `<hr>` → usar gap `spacing-8` o cambio de background

---

## Layout de Referencia (del mockup Stitch)

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

> [!NOTE]
> El mockup en Stitch muestra un layout de **3 paneles** (sidebar + workspace + AI chat), distinto al layout 60/40 del plan original. El layout final se basará en esta referencia visual de Stitch.

# 🎯 EduSync AI — Setup & Environment

## Requisitos del Sistema

| Requisito | Versión Mínima | Propósito | Estado |
|-----------|---------------|-----------|--------|
| Python | 3.11+ | Django 5.x | ❌ No instalado |
| Node.js | 18+ | Astro framework | ❌ No instalado |
| npm | 9+ | Package management | ❌ (viene con Node) |
| Git | 2.x | Control de versiones | ✅ Instalado |

## Instalación de Requisitos

### Python 3.11+
1. Descargar desde: https://www.python.org/downloads/
2. **IMPORTANTE**: Marcar ✅ "Add Python to PATH" durante la instalación
3. Verificar: `python --version`

### Node.js 18+
1. Descargar desde: https://nodejs.org/ (versión LTS recomendada)
2. La instalación incluye npm automáticamente
3. Verificar: `node --version` y `npm --version`

## API Keys (ya obtenidas ✅)

### 1. Notion Integration Token
- **Variable**: `NOTION_TOKEN`
- **Formato**: `ntn_xxxxx...`
- **Permisos**: Read content, Insert content, Read DB info
- **Importante**: La DB "Notas de Clase" debe estar compartida con la integración

### 2. Google Gemini API Key
- **Variable**: `GEMINI_API_KEY`
- **Formato**: `AIzaSy...`

### 3. Notion Database ID
- **Valor fijo**: `63337178-cfe0-82e1-a478-012eccf8b9f3`
- **Variable**: `NOTION_DB_ID`

## Archivos de Entorno

### `backend/.env`
```env
NOTION_TOKEN=<tu_token_aqui>
GEMINI_API_KEY=<tu_api_key_aqui>
NOTION_DB_ID=63337178-cfe0-82e1-a478-012eccf8b9f3
```

### `frontend/.env`
```env
PUBLIC_API_URL=http://localhost:8000
```

## Puertos de Desarrollo

| Servicio | Puerto |
|----------|--------|
| Frontend Astro | `localhost:4321` |
| Backend Django | `localhost:8000` |

## Instalación del Proyecto

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm install tailwindcss @tailwindcss/vite   # Tailwind CSS v4
npm run dev
```

> **Nota**: Tailwind v4 se integra como plugin de Vite en `astro.config.mjs`, no requiere `tailwind.config.js`.

## .gitignore

Los siguientes deben estar en `.gitignore`:
- `*.env` / `.env`
- `venv/`, `__pycache__/`
- `node_modules/`
- `dist/`, `.astro/`
- `backend/history/` (historial local de resúmenes)

## Historial Local

Los resúmenes generados se guardan localmente en `backend/history/` como archivos JSON individuales. No se requiere base de datos desplegada.

> [!CAUTION]
> Nunca commitear API keys ni tokens al repositorio. Las keys van exclusivamente en los archivos `.env`.

> [!IMPORTANT] 
> **Primer paso antes de desarrollar**: Instalar Python 3.11+ y Node.js 18+.

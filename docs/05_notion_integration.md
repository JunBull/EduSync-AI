# 🔗 EduSync AI — Integración con Notion

## Base de Datos Target

| Campo | Valor |
|-------|-------|
| **Nombre** | Notas de Clase |
| **Database ID** | `63337178-cfe0-82e1-a478-012eccf8b9f3` |

### Schema

| Propiedad | Tipo | Detalles |
|-----------|------|----------|
| `Nombre` | `title` | Patrón: "Semana N - Anotaciones" |
| `Materia` | `select` | 6 opciones (ver abajo) |

### Opciones de Materia

1. SEGURIDAD INFORMÁTICA
2. FUNDAMENTOS DEL MÉTODO CIENTÍFICO
3. BIG DATA Y ANALÍTICA DE DATOS
4. PROYECTO FINAL DE CARRERA I
5. FORMACIÓN DE EMPRESAS DE BASE TECNOLÓGICA II
6. PLAN DE NEGOCIOS

---

## Operaciones API

### Leer Schema
```python
notion.databases.retrieve(database_id=NOTION_DB_ID)
# → Extraer opciones de Materia (select)
```

### Query Páginas por Materia
```python
notion.databases.query(
    database_id=NOTION_DB_ID,
    filter={"property": "Materia", "select": {"equals": "BIG DATA..."}}
)
```

### Append Bloques
```python
# Batching en chunks de 100 bloques
notion.blocks.children.append(block_id=page_id, children=chunk)
```

---

## Bloques Notion Utilizados

| Tipo | Uso en EduSync |
|------|---------------|
| `heading_1` | Títulos de temas |
| `heading_2` | Subtemas |
| `paragraph` | Descripciones |
| `bulleted_list_item` | Puntos clave |
| `callout` (💡) | Análisis visual |
| `callout` (❓) | Preguntas quiz |
| `toggle` | Glosario / respuestas ocultas |
| `divider` | Separadores |

## Formato del Resumen en Notion

```
📚 Tema 1 (heading_1)
  Subtema 1.1 (heading_2)
  Descripción... (paragraph)
── divider ──
🔑 Puntos Clave (bullets)
── divider ──
🖼️ Análisis Visual (callouts 💡)
── divider ──
📖 Glosario (toggles)
── divider ──
❓ Quiz (callouts ❓ + toggles)
```

## Limitaciones API

| Limitación | Valor |
|------------|-------|
| Bloques por append | 100 máx |
| Chars por rich_text | 2000 máx |
| Rate limit | 3 req/seg |
| Imágenes | Solo URLs externas |
| Nested blocks | Máx. 2 niveles |

## Autenticación

- Token desde https://www.notion.so/my-integrations
- Permisos: Read content, Insert content, Read DB info
- La DB debe estar compartida con la integración

> [!IMPORTANT]
> Verificar acceso del token a la DB antes de desarrollar.

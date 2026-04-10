import re
from api.utils.notion_blocks import (
    create_heading_1,
    create_heading_2,
    create_heading_3,
    create_paragraph,
    create_bulleted_list_item,
    create_divider,
    create_quote
)

class SummaryBuilder:
    @staticmethod
    def markdown_to_notion_blocks(markdown_text):
        """
        Simple Markdown parsar to convert Gemini's text into Notion Block JSON payload.
        """
        blocks = []
        lines = markdown_text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Headers
            if line.startswith('### '):
                blocks.append(create_heading_3(line[4:].strip()))
            elif line.startswith('## '):
                blocks.append(create_heading_2(line[3:].strip()))
            elif line.startswith('# '):
                # Usaremos el H1 principal como título de la página después, 
                # pero también lo ponemos en el contenido si es necesario
                blocks.append(create_heading_1(line[2:].strip()))
            
            # Bullet points
            elif line.startswith('- ') or line.startswith('* '):
                # Clean up bolding inside bullet
                text = line[2:].strip()
                # Simplified: we don't fully parse bold/italic tags inside text
                # to do that easily we would need a rich_text parser.
                # For now, just clean the markdown asterisks.
                text = text.replace('**', '').replace('__', '')
                blocks.append(create_bulleted_list_item(text))
                
            # Numbered lists (handled as simple text for simplicity, or we could use numbered_list_item)
            elif re.match(r'^\d+\.\s', line):
                text = re.sub(r'^\d+\.\s', '', line).strip()
                text = text.replace('**', '').replace('__', '')
                blocks.append({
                    "object": "block",
                    "type": "numbered_list_item",
                    "numbered_list_item": {
                        "rich_text": [{"type": "text", "text": {"content": text}}]
                    }
                })

            # Blockquotes
            elif line.startswith('> '):
                text = line[2:].strip()
                text = text.replace('**', '').replace('__', '')
                blocks.append(create_quote(text))

            # Dividers
            elif line in ['---', '***', '___']:
                blocks.append(create_divider())
                
            # Standard paragraph
            else:
                # Basic cleanup
                text = line.replace('**', '').replace('__', '')
                blocks.append(create_paragraph(text))
                
        return blocks

    @staticmethod
    def extract_title_from_markdown(markdown_text, fallback_title="Súper Resumen"):
        """
        Busca el primer Heading 1 en el markdown y lo usa como título de Notion.
        """
        for line in markdown_text.split('\n'):
            line = line.strip()
            if line.startswith('# '):
                return line[2:].strip().replace('**', '')
        return fallback_title

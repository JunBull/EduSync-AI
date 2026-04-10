import React, { useState } from 'react';
import { Database, FileEdit, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SummaryPreviewProps {
  sessionId: string | null;
  summaryTitle: string;
  markdownContent: string;
  setMarkdownContent: (val: string) => void;
  onPublishComplete: () => void;
  isPublished: boolean;
}

export function SummaryPreview({ sessionId, summaryTitle, markdownContent, setMarkdownContent, onPublishComplete, isPublished }: SummaryPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!sessionId) return;
    setPublishing(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${apiUrl}/notion/publish/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, raw_summary: markdownContent })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falló sincronización a Notion");
      
      onPublishComplete();
      if(data.notion_url) window.open(data.notion_url, '_blank');
      
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Error al publicar");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full px-6 pb-6">
      <div className="flex justify-between items-end mb-6 py-4 border-b border-surface-200 sticky top-0 bg-surface-100 z-10">
        <div>
          <h2 className="text-xl font-heading font-bold text-text-primary">{summaryTitle || 'Súper Resumen'}</h2>
          <p className="text-sm text-text-secondary mt-1">
             {isPublished ? 'Sincronizado correctamente a Notion.' : 'Revisa o modifícalo con el chat de IA lateral.'}
          </p>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-surface-200 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:border-surface-800 transition-colors shadow-sm"
          >
            <FileEdit size={16} /> {isEditing ? 'Ver Markdown' : 'Modificar Manual'}
          </button>
          
          <button 
            onClick={handlePublish}
            disabled={publishing || isPublished}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm
              ${isPublished 
                ? 'bg-primary-100 text-primary-700 shadow-none cursor-default' 
                : 'bg-primary-500 hover:bg-primary-700 text-white shadow-primary-500/20 hover:-translate-y-0.5'}
            `}
          >
            {isPublished ? <CheckCircle2 size={16} /> : <Database size={16} />} 
            {publishing ? 'Publicando...' : isPublished ? 'Publicado' : 'Publicar en Notion'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-surface-200 rounded-2xl shadow-sm p-8 flex-1 overflow-y-auto">
        {isEditing ? (
          <textarea
            className="w-full h-full min-h-[500px] bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-text-primary font-mono text-sm"
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
          />
        ) : (
          <div className="prose prose-sm prose-h1:font-heading prose-h1:text-2xl prose-h1:font-bold prose-h2:font-heading prose-h2:text-text-primary prose-a:text-primary-500 prose-green max-w-none text-text-secondary leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdownContent}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

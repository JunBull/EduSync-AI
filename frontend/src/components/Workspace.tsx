import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { FileUploader } from './FileUploader';
import { ProgressBar } from './ProgressBar';
import { ChatReview } from './ChatReview';
import { SummaryPreview } from './SummaryPreview';

type AppState = 'uploading' | 'processing' | 'reviewing' | 'published';

export function Workspace() {
  const [appState, setAppState] = useState<AppState>('uploading');
  const [selectedMateria, setSelectedMateria] = useState('');
  const [selectedSemana, setSelectedSemana] = useState('');
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [rawSummary, setRawSummary] = useState('');
  const [summaryTitle, setSummaryTitle] = useState('Súper Resumen');
  
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  // Carregar historial inicial
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${apiUrl}/history/`);
      const data = await res.json();
      setHistoryItems(data);
    } catch (e) {
      console.error("Error fetching history:", e);
    }
  };

  const clearSession = () => {
    setAppState('uploading');
    setSessionId(null);
    setRawSummary('');
    setSummaryTitle('');
  };

  const handleUploadComplete = (sid: string, summary: string) => {
    setSessionId(sid);
    setRawSummary(summary);
    setAppState('reviewing');
    fetchHistory();
    // Intenta extraer el título
    const match = summary.match(/^#\s+(.*)/m);
    if (match) setSummaryTitle(match[1]);
  };

  const handleLoadSession = async (sid: string) => {
    try {
      const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${apiUrl}/history/${sid}/`);
      const data = await res.json();
      
      setSelectedMateria(data.materia);
      setSelectedSemana(data.semana);
      setSessionId(data.id);
      setRawSummary(data.raw_summary);
      
      const match = data.raw_summary.match(/^#\s+(.*)/m);
      if (match) setSummaryTitle(match[1]);

      setAppState(data.status === 'published' ? 'published' : 'reviewing');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex w-full h-full">
      <Sidebar 
        selectedMateria={selectedMateria}
        setSelectedMateria={setSelectedMateria}
        selectedSemana={selectedSemana}
        setSelectedSemana={setSelectedSemana}
        historyItems={historyItems}
        onLoadSession={handleLoadSession}
        onClearSession={clearSession}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-surface-100 relative">
        <div className="pt-6 pb-2 px-8 bg-surface-100 z-10 sticky top-0 border-b border-surface-200">
          <ProgressBar currentStep={appState === 'uploading' ? 1 : appState === 'processing' ? 2 : appState === 'reviewing' ? 3 : 4} />
        </div>

        <div className="flex-1 overflow-y-auto relative p-6">
          {appState === 'uploading' && (
            <FileUploader 
              materia={selectedMateria} 
              semana={selectedSemana}
              onProcessingStart={() => setAppState('processing')}
              onUploadComplete={handleUploadComplete} 
              onUploadError={() => setAppState('uploading')}
            />
          )}

          {appState === 'processing' && (
             <div className="flex flex-col items-center justify-center h-full text-text-secondary">
               <div className="w-16 h-16 border-4 border-surface-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
               <p className="font-medium text-lg text-text-primary">Gemini está analizando los documentos...</p>
               <p className="text-sm">Esto puede tomar unos segundos.</p>
             </div>
          )}

          {(appState === 'reviewing' || appState === 'published') && (
            <SummaryPreview 
              sessionId={sessionId}
              summaryTitle={summaryTitle} 
              markdownContent={rawSummary} 
              setMarkdownContent={setRawSummary}
              onPublishComplete={() => {
                setAppState('published'); 
                fetchHistory();
              }}
              isPublished={appState === 'published'}
            />
          )}
        </div>
      </div>

      {(appState === 'reviewing' || appState === 'published') && (
        <ChatReview 
          sessionId={sessionId}
          onSummaryUpdated={handleUploadComplete}
        />
      )}
    </div>
  );
}

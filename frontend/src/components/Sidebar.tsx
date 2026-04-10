import React from 'react';
import { Database, FolderHeart, Trash2, List } from 'lucide-react';
import { NotionSelector } from './NotionSelector';

export function Sidebar({ selectedMateria, setSelectedMateria, selectedSemana, setSelectedSemana, historyItems, onLoadSession, onClearSession }: any) {
  return (
    <aside className="w-64 bg-surface-50 border-r border-surface-200 h-screen flex flex-col items-center py-6 px-4 shrink-0 shadow-sm">
      <div className="w-full flex items-center gap-3 mb-8">
        <div className="bg-primary-500 text-white p-2 rounded-xl shadow-sm">
          <Database size={24} />
        </div>
        <h1 className="text-xl font-heading font-semibold text-text-primary">EduSync AI</h1>
      </div>

      <div className="w-full bg-primary-50 border border-primary-100 rounded-xl p-3 mb-8 flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse"></div>
        <span className="text-sm font-semibold text-primary-700">Notion Synced</span>
      </div>

      <div className="w-full mb-8">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-4">Contexto de Clase</h2>
        <NotionSelector 
          selectedMateria={selectedMateria} 
          setSelectedMateria={setSelectedMateria} 
          selectedSemana={selectedSemana} 
          setSelectedSemana={setSelectedSemana} 
        />
        
        <button onClick={onClearSession} className="mt-4 w-full bg-primary-500 hover:bg-primary-700 text-white font-medium py-2.5 rounded-xl transition-colors shadow-sm text-sm">
          Guardar Contexto
        </button>
      </div>

      <div className="w-full h-px bg-surface-200 mb-6" />

      <div className="w-full flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Archivos Recientes</h2>
          <List size={14} className="text-text-secondary" />
        </div>
        
        <div className="flex flex-col gap-2">
          {historyItems.map((item: any) => (
            <div key={item.id} onClick={() => onLoadSession(item.id)} className={`group flex items-center gap-3 p-2 hover:bg-surface-100 rounded-xl cursor-pointer transition-colors border ${item.status === 'published' ? 'border-primary-100' : 'border-transparent'} hover:border-surface-200`}>
              <div className="bg-secondary-50 p-1.5 rounded-lg text-secondary-500">
                <FolderHeart size={16} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-text-primary truncate">{item.materia}</p>
                <p className="text-xs text-text-secondary truncate">{item.semana} • {item.files?.length || 0} arch.</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full pt-4 mt-auto">
        <button onClick={onClearSession} className="w-full flex items-center justify-center gap-2 py-2.5 border border-surface-200 text-text-secondary hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium">
          <Trash2 size={16} />
          Limpiar Sesión
        </button>
      </div>
    </aside>
  );
}

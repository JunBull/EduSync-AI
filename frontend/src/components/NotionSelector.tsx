import React, { useState, useEffect } from 'react';
import { BookOpen, CalendarDays, Plus } from 'lucide-react';

export function NotionSelector({ selectedMateria, setSelectedMateria, selectedSemana, setSelectedSemana }: any) {
  const [materias, setMaterias] = useState<string[]>([]);
  const [semanasPorMateria, setSemanasPorMateria] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${apiUrl}/notion/materias-semanas/`);
        const data = await res.json();
        setMaterias(data.materias || []);
        setSemanasPorMateria(data.semanas_por_materia || {});
        
        if (data.materias?.length > 0 && !selectedMateria) {
            setSelectedMateria(data.materias[0]);
        }
      } catch (err) {
        console.error("Failed to load options from backend", err);
        setMaterias(['Matemáticas', 'Historia']);
        setSemanasPorMateria({});
      } finally {
        setLoading(false);
      }
    }
    fetchOptions();
  }, []);

  // Calcular las semanas para la materia actual
  const currentSemanas = selectedMateria ? (semanasPorMateria[selectedMateria] || []) : [];
  
  // Calcular cuál sería la "Nueva Semana" 
  let maxSemana = 0;
  currentSemanas.forEach(s => {
      const match = s.match(/Semana (\d+)/i);
      if (match) {
          const num = parseInt(match[1]);
          if (num > maxSemana) maxSemana = num;
      }
  });
  const nuevaSemanaValue = `Semana ${maxSemana + 1} - Anotaciones`;

  const [lastMateria, setLastMateria] = useState('');

  useEffect(() => {
     if (loading) return;
     
     // Only force-update the selected semana if the materia actually changed or if selectedSemana is fully empty
     if (selectedMateria !== lastMateria || !selectedSemana) {
         if (currentSemanas.length > 0) {
             if (!currentSemanas.includes(selectedSemana)) {
                 setSelectedSemana(currentSemanas[0]);
             }
         } else {
             if (selectedSemana !== nuevaSemanaValue) {
                 setSelectedSemana(nuevaSemanaValue);
             }
         }
         setLastMateria(selectedMateria);
     }
  }, [selectedMateria, currentSemanas, nuevaSemanaValue, selectedSemana, loading, lastMateria, setSelectedSemana]);

  return (
    <div className="flex flex-col gap-4">
      {/* Materia Select */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
          <BookOpen size={14} /> Materia
        </label>
        <div className="relative">
          <select 
            className="w-full appearance-none bg-white border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-shadow shadow-sm disabled:opacity-50"
            value={selectedMateria}
            onChange={(e) => setSelectedMateria(e.target.value)}
            disabled={loading}
          >
            {loading ? <option>Cargando...</option> : 
             materias.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Semana Select */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            <CalendarDays size={14} /> Semana / Anotación
        </label>
        <div className="relative">
          <select 
            className="w-full appearance-none bg-white border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-shadow shadow-sm disabled:opacity-50"
            value={selectedSemana || ""}
            onChange={(e) => setSelectedSemana(e.target.value)}
            disabled={loading}
          >
            {loading ? (
                <option value="">Cargando...</option>
            ) : (
                <>
                    {!selectedSemana && <option value="" disabled hidden>Elige opción...</option>}
                    {currentSemanas.map(s => <option key={s} value={s}>{s}</option>)}
                    <option className="font-semibold text-primary-600 bg-primary-50" value={nuevaSemanaValue}>
                        + Nueva Semana ({nuevaSemanaValue})
                    </option>
                </>
            )}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}


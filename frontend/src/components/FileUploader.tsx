import React, { useState, useRef } from 'react';
import { UploadCloud, File, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';

export function FileUploader({ materia, semana, onProcessingStart, onUploadComplete, onUploadError }: any) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
  const MAX_FILES = 5;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const preventDefaults = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const addFiles = (newFiles: File[]) => {
    setError(null);
    let validFiles: File[] = [];

    for (let f of newFiles) {
      if (f.size > MAX_FILE_SIZE) {
        setError(`El archivo ${f.name} excede el límite de 25MB.`);
        return;
      }
      validFiles.push(f);
    }

    setFiles(prev => {
      const combined = [...prev, ...validFiles];
      if (combined.length > MAX_FILES) {
        setError(`Máximo ${MAX_FILES} archivos permitidos por sesión.`);
        return prev;
      }
      return combined;
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
  };

  const startProcessing = async () => {
    if (!materia || !semana) {
      setError("Por favor, selecciona una Materia y una Semana en el panel izquierdo antes de procesar.");
      return;
    }
    setError(null);
    onProcessingStart();

    const formData = new FormData();
    formData.append("materia", materia);
    formData.append("semana", semana);
    formData.append("language", "es");
    files.forEach(f => formData.append("files", f));

    try {
      const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${apiUrl}/process/`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Error al procesar archivos");
      }
      
      onUploadComplete(data.session_id, data.raw_summary);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Eror general de servidor, revisa si está encendido.");
      onUploadError();
    }
  };

  return (
    <div className="w-full flex justify-center items-center py-10 px-4 h-full">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <div className="bg-primary-50 text-   -500 p-4 rounded-full inline-block mb-4 shadow-sm border border-primary-100">
            <UploadCloud size={40} />
          </div>
          <h2 className="text-2xl font-heading font-semibold text-text-primary mb-2">Sube tus archivos académicos</h2>
          <p className="text-text-secondary text-sm">Arrastra tus PDF, PPTX o DOCX aquí para generar el Súper Resumen.<br/>(Máx 25MB por archivo, hasta 5 archivos)</p>
        </div>

        <div 
          className="w-full border-2 border-dashed border-surface-200 hover:border-primary-500 bg-white hover:bg-surface-50 rounded-2xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm group"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={preventDefaults}
          onDragEnter={preventDefaults}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
            accept=".pdf,.pptx,.docx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />
          <div className="text-primary-500 mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud size={32} />
          </div>
          <span className="text-sm font-medium text-text-primary px-4 py-2 bg-white border border-surface-200 rounded-xl shadow-sm mb-2 group-hover:border-primary-500 group-hover:text-primary-700 transition-colors">
            Seleccionar Archivos
          </span>
          <p className="text-xs text-text-secondary mt-1">O arrastra y suelta aquí</p>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 text-sm">
            <AlertCircle size={16} />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-3">Archivos Listos ({files.length}/5)</h3>
            <div className="flex flex-col gap-3">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-surface-200 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-surface-100 rounded-lg text-primary-500">
                      <File size={16} />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                      <p className="text-xs text-text-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button onClick={() => removeFile(idx)} className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={startProcessing}
              className="w-full mt-6 bg-primary-500 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              <CheckCircle2 size={18} />
              Procesar y Generar Resumen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

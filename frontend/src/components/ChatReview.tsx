import React, { useState } from 'react';
import { Send, Sparkles, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export function ChatReview({ sessionId, onSummaryUpdated }: any) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: 'model',
      text: '¡Resumen generado! Revísalo en el panel central. Si quieres hacer cambios (ej. "Resume la conclusión" o "Añade un ejemplo"), pídemelo aquí.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || !sessionId || loading) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const historyToPass = messages
        .filter(m => m.id !== 'init')
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

      const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${apiUrl}/chat/refine/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          prompt: userText,
          history: historyToPass
        })
      });
      const data = await res.json();

      const aiReply = data.refined_summary;
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "He aplicado los cambios. El panel central se ha actualizado." }]);

      // Enviar el summary actualizado al padre
      onSummaryUpdated(sessionId, aiReply);

      // Call update history as well just in case
      await fetch(`${apiUrl}/history/${sessionId}/update-summary/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_summary: aiReply })
      });

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Ups, ocurrió un error tratando de refinar el resumen. 😔' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="w-80 bg-white border-l border-surface-200 h-screen flex flex-col shrink-0 shadow-sm">
      <div className="p-4 border-b border-surface-200 bg-surface-50 flex items-center gap-2">
        <Sparkles size={18} className="text-primary-500" />
        <h2 className="text-sm font-semibold text-text-primary">Asistente IA</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-surface-50/50">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>

            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm
              ${msg.role === 'model' ? 'bg-primary-100 text-primary-700' : 'bg-surface-200 text-text-secondary'}
            `}>
              {msg.role === 'model' ? <Sparkles size={14} /> : <User size={14} />}
            </div>

            <div className={`text-sm py-2 px-3 rounded-2xl max-w-[80%] shadow-sm whitespace-pre-wrap
              ${msg.role === 'user'
                ? 'bg-text-primary text-white rounded-tr-none'
                : 'bg-white border border-surface-200 text-text-primary rounded-tl-none'}
            `}>
              {msg.text}
            </div>

          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 shadow-sm"><Sparkles size={14} /></div>
            <div className="bg-white border border-surface-200 p-3 rounded-2xl rounded-tl-none rounded-br-2xl shadow-sm text-surface-200 flex gap-1">
              <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce delay-100"></span>
              <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-surface-200">
        <div className="relative flex items-center">
          <input
            type="text"
            className="w-full bg-surface-100 border-none rounded-full py-3 pl-4 pr-12 text-sm text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-primary-500 transition-all shadow-inner disabled:opacity-50"
            placeholder="Pregunta o pide un cambio..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`absolute right-1 w-9 h-9 rounded-full flex items-center justify-center transition-colors
              ${input.trim() && !loading ? 'bg-primary-500 text-white hover:bg-primary-700' : 'bg-transparent text-surface-200 cursor-not-allowed'}
            `}
          >
            <Send size={16} className={input.trim() && !loading ? 'translate-x-0.5 -translate-y-0.5' : ''} />
          </button>
        </div>
      </div>
    </aside>
  );
}

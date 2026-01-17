
import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, AcademicMode } from '../types';
import { MODES } from '../constants';
import { exportService } from '../services/exportService';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  onHumanize: (messageId: string, content: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onSendMessage, onHumanize }) => {
  const [inputValue, setInputValue] = React.useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const getModeInfo = (mode: AcademicMode) => MODES.find(m => m.id === mode);

  const handleExportPDF = (id: string) => {
    exportService.exportToPDF(`msg-content-${id}`, `Report_${id}.pdf`);
  };

  const handleExportExcel = (content: string, id: string) => {
    exportService.exportToExcel(content, `Data_${id}.xlsx`);
  };

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar bg-slate-50/30"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-3xl mx-auto space-y-8 py-10">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200 animate-pulse">
                <i className="fa-solid fa-bolt-lightning text-4xl"></i>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-white text-[10px]">
                <i className="fa-solid fa-check"></i>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">مساعدك الذكي الشامل والفوري</h2>
              <p className="text-slate-500 text-xl leading-relaxed max-w-2xl mx-auto">
                اسأل عن أي شيء: من أبحاث الدكتوراه إلى وصفات الطعام، ومن البرمجة المعقدة إلى أخبار اليوم. إجابات فورية مدعومة بمصادر موثوقة.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-xs font-bold">
                <i className="fa-solid fa-gauge-high"></i> سرعة معالجة قصوى
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 text-xs font-bold">
                <i className="fa-solid fa-globe"></i> بحث ويب مباشر
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const modeInfo = getModeInfo(msg.mode);
          const isUser = msg.role === 'user';

          return (
            <div 
              key={msg.id} 
              className={`flex ${isUser ? 'justify-start pl-12' : 'justify-start pr-12'}`}
            >
              <div className={`w-full max-w-4xl rounded-2xl p-5 md:p-8 shadow-sm border relative group transition-all ${
                isUser 
                  ? 'bg-white border-slate-200' 
                  : msg.isHumanized 
                    ? 'bg-emerald-50/30 border-emerald-100 ring-1 ring-emerald-50'
                    : 'bg-white border-indigo-100 ring-1 ring-indigo-50 shadow-indigo-50/50'
              }`}>
                {!isUser && (
                  <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                    {!msg.isHumanized && (
                      <button 
                        onClick={() => onHumanize(msg.id, msg.content)}
                        className="p-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg"
                        title="أنسنة النص"
                      >
                        <i className="fa-solid fa-wand-magic-sparkles"></i> أنسنة
                      </button>
                    )}
                    <button 
                      onClick={() => handleExportPDF(msg.id)}
                      className="p-2 bg-white text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold border border-red-100 shadow-sm"
                    >
                      <i className="fa-solid fa-file-pdf"></i>
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm shadow-sm ${
                    isUser ? 'bg-slate-100 text-slate-600' : msg.isHumanized ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
                  }`}>
                    <i className={`fa-solid ${isUser ? 'fa-user' : msg.isHumanized ? 'fa-user-tie' : modeInfo?.icon}`}></i>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">
                      {isUser ? 'أنت' : msg.isHumanized ? 'نص بشري مُعدل' : modeInfo?.title}
                    </span>
                  </div>
                </div>
                
                <div id={`msg-content-${msg.id}`} className="markdown-content text-slate-800 overflow-hidden leading-loose">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-100 no-print">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">المصادر والمعلومات الإضافية:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {msg.groundingUrls.map((url, idx) => (
                        <a 
                          key={idx}
                          href={url.uri} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="group/link p-3 bg-white hover:bg-indigo-50 transition-all rounded-xl border border-slate-200 hover:border-indigo-200 flex flex-col gap-1"
                        >
                          <span className="text-[11px] font-bold text-slate-700 truncate line-clamp-1 group-hover/link:text-indigo-700">{url.title}</span>
                          <span className="text-[9px] text-slate-400 truncate">{new URL(url.uri).hostname}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-xl flex flex-col gap-4 min-w-[200px]">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <span className="text-xs text-indigo-600 font-bold">جاري الرد بسرعة فائقة...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 md:p-10 pt-0 bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent no-print">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative group shadow-2xl shadow-indigo-100/50 rounded-2xl overflow-hidden border border-slate-200 focus-within:border-indigo-400 transition-all">
            <textarea
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="اسألني عن أي شيء (عام، تقني، أو أكاديمي)..."
              className="w-full bg-white border-none focus:ring-0 text-slate-800 placeholder-slate-400 py-6 px-6 pb-20 resize-none min-h-[90px] max-h-64 custom-scrollbar text-lg"
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <div className="flex gap-2 pointer-events-auto">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] text-indigo-700 font-bold">
                  <i className="fa-solid fa-bolt-lightning"></i>
                  وضع الاستجابة الفورية
                </div>
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className={`pointer-events-auto px-10 py-3.5 rounded-xl font-bold flex items-center gap-3 transition-all ${
                  inputValue.trim() && !isLoading
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-xl hover:scale-105 active:scale-95'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>إرسال</span>
                <i className="fa-solid fa-paper-plane text-sm"></i>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;

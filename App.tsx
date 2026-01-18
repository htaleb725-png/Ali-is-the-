
import React, { useState, useCallback, useEffect } from 'react';
import { AcademicMode, Message } from './types';
import { geminiService, FileData } from './services/geminiService';
import Sidebar from './components/Sidebar';
import ModeSelector from './components/ModeSelector';
import ChatWindow from './components/ChatWindow';
import DeveloperPanel from './components/DeveloperPanel';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMode, setCurrentMode] = useState<AcademicMode>(AcademicMode.GENERAL);
  const [isLoading, setIsLoading] = useState(false);
  const [isDevOpen, setIsDevOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('chat_history_count', messages.length.toString());
  }, [messages]);

  const handleModeChange = (mode: AcademicMode) => {
    setCurrentMode(mode);
    setIsSidebarOpen(false);
  };

  const handleSendMessage = useCallback(async (content: string, fileInfo?: { data: string, mimeType: string }) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: fileInfo ? `${content}\n[ملف مرفق: ${fileInfo.mimeType}]` : content,
      mode: currentMode,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      let fileData: FileData | undefined;
      if (fileInfo) {
        fileData = {
          inlineData: {
            data: fileInfo.data.split(',')[1],
            mimeType: fileInfo.mimeType
          }
        };
      }

      const response = await geminiService.generateResponse(content, currentMode, history, fileData);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || "لم أتمكن من الحصول على رد، يرجى المحاولة مرة أخرى.",
        mode: currentMode,
        timestamp: new Date(),
        groundingUrls: response.groundingUrls
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error("API Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "حدث خطأ في الاتصال. يرجى التأكد من حجم الملف ونوعه، أو مراجعة إعدادات المطور.",
        mode: currentMode,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [currentMode, messages]);

  const handleHumanize = useCallback(async (messageId: string, content: string) => {
    setIsLoading(true);
    try {
      const response = await geminiService.humanizeText(content);
      const humanizedMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.text || content,
        mode: AcademicMode.HUMANIZER,
        timestamp: new Date(),
        isHumanized: true,
        groundingUrls: response.groundingUrls
      };
      setMessages(prev => [...prev, humanizedMsg]);
    } catch (error) {
      console.error("Humanizing Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Tajawal']" dir="rtl">
      {/* Developer Panel - Topmost Layer */}
      {isDevOpen && <DeveloperPanel onClose={() => setIsDevOpen(false)} />}
      
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 z-[70] bg-slate-950/60 transition-all duration-300 lg:hidden ${
          isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`} 
        onClick={() => setIsSidebarOpen(false)} 
      />
      
      {/* Sidebar Container */}
      <div 
        className={`fixed inset-y-0 right-0 z-[80] w-72 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar 
          onNewChat={() => { setMessages([]); setIsSidebarOpen(false); }}
          chatCount={messages.length}
          onOpenDeveloper={() => { setIsDevOpen(true); setIsSidebarOpen(false); }}
        />
      </div>

      <main className="flex-1 flex flex-col h-full relative overflow-hidden safe-top">
        <header className="glass border-b border-slate-200 px-4 py-3 sticky top-0 z-30 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -mr-1 text-slate-600 lg:hidden hover:bg-slate-100 rounded-lg active:scale-95 transition-all"
                aria-label="Open Sidebar"
              >
                <i className="fa-solid fa-bars-staggered text-xl"></i>
              </button>
              <div className="hidden sm:flex w-9 h-9 bg-indigo-600 rounded-xl items-center justify-center text-white shadow-lg shadow-indigo-200">
                <i className="fa-solid fa-graduation-cap text-sm"></i>
              </div>
              <div>
                <h1 className="text-sm md:text-lg font-extrabold text-slate-800 line-clamp-1">الخبير الأكاديمي</h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Active High Speed</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
               <button 
                onClick={() => setMessages([])}
                className="p-2 text-slate-400 hover:text-indigo-600 sm:hidden"
                title="مسح المحادثة"
              >
                <i className="fa-solid fa-rotate-right"></i>
              </button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[10px] font-bold">
                <i className="fa-solid fa-bolt"></i> Flash Mode
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto no-scrollbar -mx-2 px-2">
            <ModeSelector 
              currentMode={currentMode} 
              onModeChange={handleModeChange} 
            />
          </div>
        </header>

        <ChatWindow 
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onHumanize={handleHumanize}
        />
      </main>
    </div>
  );
};

export default App;

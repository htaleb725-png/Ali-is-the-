
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

  // منع التمرير المزدوج في نظام iOS
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleSendMessage = useCallback(async (content: string, fileInfo?: { data: string, mimeType: string }) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      mode: currentMode,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      let fileData: FileData | undefined;
      if (fileInfo) {
        fileData = {
          inlineData: {
            data: fileInfo.data.includes(',') ? fileInfo.data.split(',')[1] : fileInfo.data,
            mimeType: fileInfo.mimeType
          }
        };
      }

      const response = await geminiService.generateResponse(content, currentMode, history, fileData);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        mode: currentMode,
        timestamp: new Date(),
        groundingUrls: response.groundingUrls
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `**عذراً، حدث خطأ:** ${error.message}`,
        mode: currentMode,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [currentMode, messages]);

  const handleHumanize = useCallback(async (messageId: string, content: string) => {
    setIsLoading(true);
    try {
      const response = await geminiService.humanizeText(content);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.text,
        mode: AcademicMode.HUMANIZER,
        timestamp: new Date(),
        isHumanized: true
      }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="fixed inset-0 flex bg-white overflow-hidden font-['Tajawal'] select-none" dir="rtl">
      {isDevOpen && <DeveloperPanel onClose={() => setIsDevOpen(false)} />}
      
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm lg:hidden transition-all duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />
      
      {/* Sidebar - Positioned for Arabic LTR/RTL correctly */}
      <div className={`fixed inset-y-0 right-0 z-[110] w-72 lg:relative lg:translate-x-0 transition-transform duration-300 shadow-2xl ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <Sidebar 
          onNewChat={() => { setMessages([]); setIsSidebarOpen(false); }}
          chatCount={messages.length}
          onOpenDeveloper={() => { setIsDevOpen(true); setIsSidebarOpen(false); }}
        />
      </div>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-white">
        <header className="bg-white border-b border-slate-100 px-4 pt-4 pb-2 z-[60] shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -mr-2 text-slate-700 lg:hidden">
              <i className="fa-solid fa-layer-group text-xl"></i>
            </button>
            <div className="flex flex-col items-center flex-1">
              <h1 className="text-base font-black text-slate-900 tracking-tight">الخبير الأكاديمي Ultra</h1>
              <div className="flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                 <span className="text-[10px] font-bold text-slate-400 uppercase">Gemini 3 Pro Active</span>
              </div>
            </div>
            <div className="w-8 lg:hidden"></div>
          </div>
          
          <div className="overflow-x-auto no-scrollbar pb-1">
            <ModeSelector currentMode={currentMode} onModeChange={(m) => { setCurrentMode(m); setIsSidebarOpen(false); }} />
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

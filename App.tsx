
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
      const history = messages.slice(-6).map(m => ({ // نرسل آخر 6 رسائل فقط لتوفير التوكنز
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
      console.error("API Connection Error:", error);
      const errorText = error.message.includes("API_KEY") 
        ? "خطأ: مفتاح API غير موجود أو غير صالح. يرجى مراجعة إعدادات الاستضافة."
        : "عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة لاحقاً أو التأكد من اتصالك بالإنترنت.";
        
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorText,
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
      console.error("Humanizing Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Tajawal']" dir="rtl">
      {isDevOpen && <DeveloperPanel onClose={() => setIsDevOpen(false)} />}
      
      <div 
        className={`fixed inset-0 z-[70] bg-slate-950/60 transition-all duration-300 lg:hidden ${
          isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`} 
        onClick={() => setIsSidebarOpen(false)} 
      />
      
      <div className={`fixed inset-y-0 right-0 z-[80] w-72 transition-transform duration-300 lg:relative lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar 
          onNewChat={() => { setMessages([]); setIsSidebarOpen(false); }}
          chatCount={messages.length}
          onOpenDeveloper={() => { setIsDevOpen(true); setIsSidebarOpen(false); }}
        />
      </div>

      <main className="flex-1 flex flex-col h-full relative overflow-hidden safe-top">
        <header className="glass border-b border-slate-200 px-4 py-3 sticky top-0 z-30 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 lg:hidden">
                <i className="fa-solid fa-bars-staggered text-xl"></i>
              </button>
              <h1 className="text-lg font-extrabold text-slate-800">الخبير الأكاديمي</h1>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <span className="text-[10px] font-bold text-slate-400">ACTIVE</span>
            </div>
          </div>
          <ModeSelector currentMode={currentMode} onModeChange={(m) => { setCurrentMode(m); setIsSidebarOpen(false); }} />
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

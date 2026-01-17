
import React, { useState, useCallback } from 'react';
import { AcademicMode, Message } from './types';
import { geminiService } from './services/geminiService';
import Sidebar from './components/Sidebar';
import ModeSelector from './components/ModeSelector';
import ChatWindow from './components/ChatWindow';
import DeveloperPanel from './components/DeveloperPanel';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMode, setCurrentMode] = useState<AcademicMode>(AcademicMode.REVIEWER);
  const [isLoading, setIsLoading] = useState(false);
  const [isDevOpen, setIsDevOpen] = useState(false);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
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

      const response = await geminiService.generateResponse(content, currentMode, history);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || "عذراً، لم أتمكن من معالجة الطلب حالياً.",
        mode: currentMode,
        timestamp: new Date(),
        groundingUrls: response.groundingUrls
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "حدث خطأ أثناء التواصل مع المحرك الأكاديمي. يرجى مراجعة إعدادات المطور أو الاتصال بالدعم.",
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

  const startNewChat = () => {
    if (window.confirm("هل تريد بدء جلسة بحثية جديدة؟ سيتم مسح كافة البيانات الحالية.")) {
      setMessages([]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" dir="rtl">
      {isDevOpen && <DeveloperPanel onClose={() => setIsDevOpen(false)} />}
      
      <Sidebar 
        onNewChat={startNewChat}
        chatCount={messages.length}
        onOpenDeveloper={() => setIsDevOpen(true)}
      />

      <main className="flex-1 flex flex-col h-full relative">
        <header className="bg-white p-6 sticky top-0 z-10 border-b border-gray-100 shadow-sm">
          <div className="max-w-6xl mx-auto flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:hidden">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                  <i className="fa-solid fa-graduation-cap text-lg"></i>
                </div>
                <h1 className="text-xl font-bold">الخبير الأكاديمي</h1>
              </div>
              <div className="hidden md:block">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-microchip text-indigo-500"></i>
                  وضع التشغيل الأكاديمي الحالي
                </h2>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  API Active
                </div>
              </div>
            </div>
            
            <ModeSelector 
              currentMode={currentMode} 
              onModeChange={setCurrentMode} 
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

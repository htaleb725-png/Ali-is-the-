
import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string, fileInfo?: { data: string, mimeType: string }) => void;
  onHumanize: (messageId: string, content: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onSendMessage, onHumanize }) => {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ data: string, name: string, type: string } | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile({
          data: reader.result as string,
          name: file.name,
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    if (inputValue.trim() || selectedFile) {
      onSendMessage(
        inputValue.trim(),
        selectedFile ? { data: selectedFile.data, mimeType: selectedFile.type } : undefined
      );
      setInputValue('');
      setSelectedFile(null);
    }
  };

  const startRecording = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = (reader.result as string).split(',')[1];
          // إرسال الصوت فوراً كرسالة للمحرك
          onSendMessage("قم بتحليل التسجيل الصوتي المرفق والإجابة عليه بدقة.", { 
            data: base64data, 
            mimeType: mimeType 
          });
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("يرجى تفعيل صلاحية الميكروفون.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] relative overflow-hidden">
      {/* منطقة الرسائل */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 space-y-8 md:px-16 lg:px-48 pb-64 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-slide-up">
            <div className="w-24 h-24 mb-6 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl">
              <i className="fa-solid fa-sparkles text-3xl text-white"></i>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">الخبير الأكاديمي Ultra</h2>
            <p className="text-slate-500 max-w-sm text-base leading-relaxed">ارفع ملفاتك، سجل صوتك، أو ابحث في المصادر العالمية.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full animate-slide-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex flex-col gap-2 max-w-[92%] md:max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-indigo-900 text-white'}`}>
                  {msg.role === 'user' ? <i className="fa-solid fa-user text-xs"></i> : <i className="fa-solid fa-brain text-xs"></i>}
                </div>
                <div className={`px-6 py-4 rounded-[2rem] text-[15px] leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-white border border-slate-200 text-slate-800 rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-indigo-50 rounded-tl-none'
                }`}>
                  <div className="markdown-content prose prose-slate max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                  
                  {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                      {msg.groundingUrls.map((link, idx) => (
                        <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-600 hover:text-white transition-all font-bold border border-indigo-100 flex items-center gap-1">
                          <i className="fa-solid fa-link"></i> {link.title || 'مصدر'}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {msg.role === 'assistant' && !msg.isHumanized && (
                <button 
                  onClick={() => onHumanize(msg.id, msg.content)}
                  className="mr-12 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 border border-indigo-100"
                >
                  <i className="fa-solid fa-wand-magic-sparkles"></i> تطبيق الأسلوب البشري
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start gap-4 animate-pulse">
             <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-900">
                <i className="fa-solid fa-spinner animate-spin"></i>
             </div>
             <div className="bg-white border border-slate-100 rounded-3xl px-6 py-4 shadow-sm h-14 w-40"></div>
          </div>
        )}
      </div>

      {/* بار الإدخال - تمت استعادة زر الملفات والأيقونات الاحترافية */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc] to-transparent z-[100] mobile-input-container">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          
          {selectedFile && (
            <div className="flex items-center gap-3 p-2.5 bg-white border border-indigo-200 rounded-2xl w-fit animate-slide-up shadow-xl ml-auto border-r-4 border-r-indigo-500">
              <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                <i className={`fa-solid ${selectedFile.type.startsWith('image/') ? 'fa-image' : 'fa-file-pdf'}`}></i>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-700 truncate max-w-[120px]">{selectedFile.name}</span>
                <button onClick={() => setSelectedFile(null)} className="text-[9px] text-red-500 font-bold hover:underline text-right">إلغاء</button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative flex flex-col bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-2xl transition-all focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-50">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              placeholder="اكتب رسالتك، ارفع بحثاً، أو سجل صوتك..."
              rows={1}
              className="w-full bg-transparent border-none focus:ring-0 text-slate-800 py-5 px-6 md:px-8 text-[16px] resize-none min-h-[60px] max-h-40 overflow-y-auto custom-scrollbar"
            />
            
            <div className="flex items-center justify-between px-4 pb-4">
              <div className="flex items-center gap-1">
                {/* زر رفع الملفات (تمت استعادته) */}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf,.txt" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                >
                  <i className="fa-solid fa-paperclip text-xl"></i>
                </button>
                
                {/* زر الصوت المحسن */}
                <button
                  type="button"
                  onPointerDown={startRecording}
                  onPointerUp={stopRecording}
                  onPointerLeave={stopRecording}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    isRecording ? 'bg-red-500 text-white animate-pulse shadow-lg scale-110' : 'text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  <i className="fa-solid fa-microphone text-xl"></i>
                </button>
              </div>

              {/* زر الإرسال - احترافي وواضح */}
              <button
                type="submit"
                disabled={(!inputValue.trim() && !selectedFile) || isLoading}
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-all shadow-lg ${
                  (!inputValue.trim() && !selectedFile) || isLoading
                    ? 'bg-slate-100 text-slate-300' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95'
                }`}
              >
                {isLoading ? (
                  <i className="fa-solid fa-circle-notch animate-spin text-xl"></i>
                ) : (
                  <i className="fa-solid fa-paper-plane text-xl"></i>
                )}
              </button>
            </div>
          </form>
          
          <div className="flex justify-center items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-80">
            <span className="flex items-center gap-1"><i className="fa-solid fa-check-double text-emerald-500"></i> معايير Q1 الأكاديمية</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>بواسطة Gemini 3 Pro</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;


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
    if ((inputValue.trim() || selectedFile) && !isLoading) {
      onSendMessage(
        inputValue.trim(),
        selectedFile ? { data: selectedFile.data, mimeType: selectedFile.type } : undefined
      );
      setInputValue('');
      setSelectedFile(null);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          onSendMessage("قم بتحليل هذا التسجيل الصوتي والإجابة عليه بأسلوب أكاديمي وبشري.", { 
            data: (reader.result as string).split(',')[1], 
            mimeType: 'audio/webm' 
          });
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("يرجى السماح بالوصول للميكروفون.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] relative overflow-hidden">
      {/* منطقة الرسائل */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-10 space-y-12 md:px-24 lg:px-48 pb-60 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-fade">
            <div className="w-20 h-20 mb-8 bg-indigo-950 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-200">
              <i className="fa-solid fa-microchip-ai text-3xl text-white"></i>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">مرحباً بك في المختبر الأكاديمي</h2>
            <p className="text-slate-500 max-w-md text-lg leading-relaxed">أنا جاهز لمساعدتك في أبحاثك بمصادر موثوقة وصياغة بشرية احترافية.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full animate-fade ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex flex-col gap-3 max-w-[95%] md:max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-md ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-indigo-950 text-white'}`}>
                  {msg.role === 'user' ? <i className="fa-solid fa-user-graduate text-sm"></i> : <i className="fa-solid fa-sparkles text-sm"></i>}
                </div>
                <div className={`px-6 py-4 rounded-[1.8rem] text-[16px] leading-[1.8] ${
                  msg.role === 'user' 
                    ? 'bg-white border border-slate-200 text-slate-800 rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-indigo-50 shadow-sm rounded-tl-none'
                }`}>
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                  
                  {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                      <div className="text-[10px] font-black text-indigo-900 uppercase flex items-center gap-2">
                        <i className="fa-solid fa-book-open-reader"></i> المصادر الموثقة:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.groundingUrls.map((link, idx) => (
                          <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-600 hover:text-white transition-all font-bold border border-indigo-100">
                            {link.title || 'مرجع بحثي'}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* أدوات إضافية تحت الرسالة */}
              {msg.role === 'assistant' && !msg.isHumanized && (
                <div className="flex gap-2 mr-14">
                  <button 
                    onClick={() => onHumanize(msg.id, msg.content)}
                    className="flex items-center gap-2 text-[10px] font-bold text-indigo-700 bg-indigo-50/50 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-full transition-all border border-indigo-100 shadow-sm"
                  >
                    <i className="fa-solid fa-fingerprint"></i>
                    تطبيق الأسلوب البشري (أنسنة)
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-pulse gap-4">
             <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-900">
                <i className="fa-solid fa-wave-pulse animate-bounce"></i>
             </div>
             <div className="bg-white border border-slate-100 rounded-[1.8rem] px-8 py-4 shadow-sm">
                <div className="h-2 w-32 bg-slate-100 rounded-full"></div>
             </div>
          </div>
        )}
      </div>

      {/* شريط الإدخال العائم - تصميم Gemini */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc] to-transparent z-[100]">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          
          {/* معاينة الملف المرفق */}
          {selectedFile && (
            <div className="flex items-center gap-3 p-3 bg-white border border-indigo-100 rounded-2xl w-fit animate-fade shadow-xl ml-auto">
              {selectedFile.type.startsWith('image/') ? (
                <img src={selectedFile.data} className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 text-lg">
                  <i className="fa-solid fa-file-pdf"></i>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-700 truncate max-w-[150px]">{selectedFile.name}</span>
                <button onClick={() => setSelectedFile(null)} className="text-[9px] text-red-500 font-bold hover:underline text-right">حذف</button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative group">
            <div className="flex flex-col bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-2xl transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                placeholder="اسألني عن أي بحث، ارفع ملفاً، أو سجل صوتك..."
                rows={1}
                className="w-full bg-transparent border-none focus:ring-0 text-slate-800 py-5 px-8 text-lg resize-none min-h-[64px] max-h-48 overflow-y-auto custom-scrollbar font-medium"
              />
              
              <div className="flex items-center justify-between px-4 pb-4">
                <div className="flex items-center gap-1">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf,.txt,.doc,.docx" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                    title="إرفاق ملف"
                  >
                    <i className="fa-solid fa-paperclip text-xl"></i>
                  </button>
                  <button
                    type="button"
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isRecording ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' : 'text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                    title="تسجيل صوتي (اضغط مطولاً)"
                  >
                    <i className="fa-solid fa-microphone text-xl"></i>
                  </button>
                </div>

                {/* زر الإرسال - أزرق وبارز */}
                <button
                  type="submit"
                  disabled={(!inputValue.trim() && !selectedFile) || isLoading}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl ${
                    (!inputValue.trim() && !selectedFile) || isLoading
                      ? 'bg-slate-100 text-slate-300' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-800 hover:scale-105 active:scale-95 shadow-indigo-200'
                  }`}
                >
                  {isLoading ? (
                    <i className="fa-solid fa-spinner-third animate-spin text-2xl"></i>
                  ) : (
                    <i className="fa-solid fa-paper-plane-top text-2xl ml-1"></i>
                  )}
                </button>
              </div>
            </div>
          </form>
          
          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <i className="fa-solid fa-shield-check text-emerald-500"></i> مصادر موثوقة
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <i className="fa-solid fa-fingerprint text-indigo-500"></i> صياغة بشرية
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <i className="fa-solid fa-bolt text-amber-500"></i> Gemini 3 Pro
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;

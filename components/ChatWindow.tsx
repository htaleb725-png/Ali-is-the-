
import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, AcademicMode } from '../types';
import { MODES } from '../constants';
import { exportService } from '../services/exportService';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string, fileInfo?: { data: string, mimeType: string }) => void;
  onHumanize: (messageId: string, content: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onSendMessage, onHumanize }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ data: string, name: string, type: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((inputValue.trim() || selectedFile) && !isLoading) {
      const content = inputValue.trim() || (selectedFile?.type.startsWith('audio/') ? "يرجى تحليل التسجيل الصوتي المرفق والرد عليه." : "يرجى تحليل الملف المرفق.");
      onSendMessage(
        content, 
        selectedFile ? { data: selectedFile.data, mimeType: selectedFile.type } : undefined
      );
      setInputValue('');
      setSelectedFile(null);
    }
  };

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
          const base64data = reader.result as string;
          // إرسال تلقائي فوري فور انتهاء التسجيل لضمان التحليل
          onSendMessage(
            "يرجى تحليل هذا التسجيل الصوتي والرد عليه باحترافية وبنفس اللغة المستخدمة.",
            { data: base64data, mimeType: 'audio/webm' }
          );
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert("خطأ في الوصول للميكروفون. يرجى تفعيل الصلاحية.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-slate-50/50">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 pb-44 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-8 animate-fade">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
                <i className="fa-solid fa-microphone-lines text-4xl"></i>
              </div>
            </div>
            <div className="space-y-3 px-4">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800">تحدث معي بالعربية أو English</h2>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                اضغط مطولاً على الميكروفون للتحدث. سأقوم بتحليل صوتك فوراً والرد عليك بدقة أكاديمية عالية.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const modeInfo = MODES.find(m => m.id === msg.mode);
          return (
            <div key={msg.id} className={`flex w-full animate-fade ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[92%] md:max-w-[85%] rounded-[1.5rem] p-4 md:p-6 border transition-all ${
                isUser ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
              }`}>
                {!isUser && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs bg-indigo-50 text-indigo-600">
                      <i className={`fa-solid ${modeInfo?.icon}`}></i>
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">{modeInfo?.title}</span>
                  </div>
                )}
                <div className={`markdown-content text-sm md:text-base ${isUser ? 'text-white' : 'text-slate-700'}`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start animate-fade">
            <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">جاري التحليل والرد...</span>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex flex-col gap-2">
          
          {(selectedFile || isRecording) && (
            <div className="animate-fade flex items-center gap-3 p-3 bg-white border border-indigo-200 rounded-2xl w-fit shadow-xl">
              {isRecording ? (
                <div className="flex items-center gap-3 px-2">
                  <div className="flex gap-1 items-center">
                    <div className="w-1.5 h-4 bg-red-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-6 bg-red-500 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div>
                  </div>
                  <span className="text-xs font-black text-slate-700">جاري التسجيل... {formatTime(recordingTime)}</span>
                </div>
              ) : selectedFile && (
                <div className="flex items-center gap-2">
                   <i className="fa-solid fa-file-audio text-indigo-600"></i>
                   <span className="text-[11px] font-bold text-slate-700">{selectedFile.name}</span>
                </div>
              )}
              <button type="button" onClick={() => { setSelectedFile(null); stopRecording(); }} className="text-slate-300 hover:text-red-500 transition-colors">
                <i className="fa-solid fa-circle-xmark"></i>
              </button>
            </div>
          )}

          <div className="relative glass border border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden focus-within:border-indigo-400 transition-all">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf,text/plain,audio/*" />
            <textarea
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              placeholder="اكتب هنا أو استمر بالضغط على الميكروفون..."
              className="w-full bg-transparent border-none focus:ring-0 text-slate-800 py-5 pl-16 pr-6 pb-16 resize-none min-h-[70px]"
            />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center"><i className="fa-solid fa-plus"></i></button>
                <button
                  type="button"
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  className={`w-12 h-12 rounded-xl transition-all flex items-center justify-center ${isRecording ? 'bg-red-500 text-white scale-110 shadow-lg' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'}`}
                >
                  <i className={`fa-solid ${isRecording ? 'fa-stop' : 'fa-microphone'} text-lg`}></i>
                </button>
              </div>
              <button type="submit" disabled={(!inputValue.trim() && !selectedFile) || isLoading} className="px-8 h-12 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 transition-all">إرسال</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;

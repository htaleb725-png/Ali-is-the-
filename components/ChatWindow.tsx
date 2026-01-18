
import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, AcademicMode } from '../types';
import { MODES } from '../constants';

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
      const content = inputValue.trim() || (selectedFile?.type.startsWith('audio/') ? "تحليل التسجيل الصوتي" : "تحليل الملف");
      onSendMessage(
        content, 
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
          const base64data = reader.result as string;
          onSendMessage("تحليل الرسالة الصوتية", { data: base64data, mimeType: 'audio/webm' });
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) {
      alert("يرجى تفعيل الميكروفون.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-slate-50/50">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 pb-40 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-6 animate-fade">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl">
              <i className="fa-solid fa-microphone-lines text-3xl"></i>
            </div>
            <h2 className="text-xl font-black text-slate-800">مرحباً بك في الخبير الأكاديمي</h2>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">تحدث أو اكتب استفسارك وسأقوم بالرد عليك فوراً.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full animate-fade ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 border shadow-sm ${
              msg.role === 'user' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <div className="markdown-content text-sm leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-indigo-600">
              جاري التحليل...
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/90 to-transparent">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex flex-col gap-2">
          {isRecording && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-100 rounded-xl w-fit mx-auto mb-2 text-red-600 font-bold text-xs">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              جاري التسجيل: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </div>
          )}
          
          <div className="flex items-end gap-2 bg-white border border-slate-200 rounded-3xl p-2 shadow-lg shadow-slate-200/50">
            <button
              type="button"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white scale-110 shadow-red-200 shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}
            >
              <i className="fa-solid fa-microphone text-lg"></i>
            </button>
            
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="اكتب هنا..."
              rows={1}
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 py-3 px-2 resize-none text-sm max-h-32"
            />

            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center disabled:bg-slate-100 disabled:text-slate-300 transition-all shadow-md"
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;

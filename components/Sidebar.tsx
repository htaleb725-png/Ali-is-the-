
import React from 'react';
import { APP_DESCRIPTION } from '../constants';

interface SidebarProps {
  onNewChat: () => void;
  chatCount: number;
  onOpenDeveloper: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewChat, chatCount, onOpenDeveloper }) => {
  return (
    <aside className="w-full bg-slate-950 text-white flex flex-col h-full border-l border-slate-800 shadow-2xl relative z-[60]">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-indigo-900/20 border border-white/10">
            <i className="fa-solid fa-book-sparkles text-2xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-black">الخبير الأكاديمي</h1>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Ultra Edition</span>
          </div>
        </div>

        <button 
          onClick={onNewChat}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 mb-4"
        >
          <i className="fa-solid fa-plus"></i>
          <span className="font-bold">بحث جديد</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
        <div className="mb-8">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">حول المنصة</h3>
          <div className="bg-slate-900 p-5 rounded-2xl text-[13px] text-slate-400 leading-relaxed border border-slate-800">
            {APP_DESCRIPTION}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-line"></i> الإحصائيات
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 p-4 rounded-2xl text-center border border-slate-800">
              <div className="text-2xl font-black text-indigo-500">{chatCount}</div>
              <div className="text-[9px] text-slate-500 font-bold uppercase">العمليات</div>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl text-center border border-slate-800">
              <div className="text-2xl font-black text-emerald-500">Q1</div>
              <div className="text-[9px] text-slate-500 font-bold uppercase">الجودة</div>
            </div>
          </div>
        </div>

        <button 
          onClick={onOpenDeveloper}
          className="w-full group p-4 bg-slate-900/50 hover:bg-indigo-900/20 rounded-2xl border border-slate-800 transition-all flex items-center gap-3 text-slate-400 hover:text-indigo-400"
        >
          <i className="fa-solid fa-sliders"></i>
          <span className="text-xs font-bold">إعدادات النواة</span>
        </button>
      </div>

      <div className="p-6 bg-slate-900/50 border-t border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-xs font-bold border border-slate-700">
            PhD
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold truncate">بروفيسور الذكاء الاصطناعي</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">متصل بالخادم</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

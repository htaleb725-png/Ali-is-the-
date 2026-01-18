
import React, { useState, useEffect } from 'react';
import { MODES, DEVELOPER_CODE } from '../constants';
import { AcademicMode } from '../types';

interface DeveloperPanelProps {
  onClose: () => void;
}

const DeveloperPanel: React.FC<DeveloperPanelProps> = ({ onClose }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [activeTab, setActiveTab] = useState<'core' | 'ai' | 'stats' | 'storage'>('core');
  const [selectedMode, setSelectedMode] = useState<AcademicMode>(AcademicMode.GENERAL);
  const [instruction, setInstruction] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(`custom_instruction_${selectedMode}`);
    setInstruction(saved || MODES.find(m => m.id === selectedMode)?.systemInstruction || "");
  }, [selectedMode]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === DEVELOPER_CODE) {
      setIsUnlocked(true);
      setError("");
    } else {
      setError("رمز الوصول غير صحيح. يرجى المحاولة مرة أخرى.");
      setPasscode("");
    }
  };

  const handleSave = () => {
    localStorage.setItem(`custom_instruction_${selectedMode}`, instruction);
    alert("تم تحديث النواة البرمجية بنجاح.");
  };

  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-[10000] flex items-center justify-center p-6 animate-fade" dir="rtl">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/40">
            <i className="fa-solid fa-vault text-white text-3xl"></i>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">منطقة محظورة</h2>
            <p className="text-slate-400 text-sm">يرجى إدخال رمز المصادقة للوصول إلى إعدادات النواة.</p>
          </div>
          <form onSubmit={handleUnlock} className="space-y-4">
            <input 
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-center text-white text-xl tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs font-bold animate-pulse">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-900/40">
                تأكيد الهوية
              </button>
              <button type="button" onClick={onClose} className="px-6 bg-slate-800 text-slate-400 font-bold rounded-2xl hover:bg-slate-700 transition-all">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[10000] flex items-center justify-center lg:p-6 animate-fade" dir="rtl">
      <div className="bg-white w-full h-full lg:max-w-6xl lg:h-[90vh] lg:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Mobile Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between lg:px-10 lg:py-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-code text-sm"></i>
            </div>
            <div>
              <h2 className="text-lg font-black lg:text-xl">لوحة التحكم المركزية</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Core Engine v5.0</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
          {/* Tabs Navigation */}
          <nav className="flex lg:flex-col p-2 lg:p-6 bg-slate-50 border-b lg:border-b-0 lg:border-l border-slate-200 overflow-x-auto no-scrollbar gap-1 lg:w-64">
            {[
              { id: 'core', icon: 'fa-dna', label: 'النواة' },
              { id: 'ai', icon: 'fa-brain', label: 'الذكاء' },
              { id: 'stats', icon: 'fa-gauge-high', label: 'النشاط' },
              { id: 'storage', icon: 'fa-box-archive', label: 'التخزين' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap lg:w-full ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}
              >
                <i className={`fa-solid ${tab.icon}`}></i> <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
            {activeTab === 'core' && (
              <div className="space-y-6 animate-fade">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <h3 className="text-xl font-black text-slate-800">تخصيص تعليمات الأنماط</h3>
                  <select 
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value as AcademicMode)}
                    className="bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none"
                  >
                    {MODES.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
                <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl">
                  <textarea 
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    className="w-full h-[40vh] bg-transparent border-none focus:ring-0 text-indigo-300 font-mono text-sm leading-relaxed resize-none"
                    placeholder="System Instructions..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                   <button onClick={() => setInstruction(MODES.find(m => m.id === selectedMode)?.systemInstruction || "")} className="text-slate-400 text-sm font-bold px-4 py-2">استعادة الافتراضي</button>
                   <button onClick={handleSave} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-200">حفظ التغييرات</button>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-8 animate-fade">
                <h3 className="text-xl font-black text-slate-800">إعدادات محرك Gemini</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2"><i className="fa-solid fa-layer-group text-indigo-600"></i> طراز المعالجة</h4>
                    <p className="text-xs text-slate-500">اختر الطراز المفضل للاستجابة بناءً على تعقيد المهمة.</p>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-indigo-100 cursor-pointer">
                        <input type="radio" name="model" defaultChecked className="text-indigo-600 focus:ring-indigo-600" />
                        <span className="text-sm font-bold">Gemini 3 Flash (فائق السرعة)</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 cursor-not-allowed opacity-50">
                        <input type="radio" name="model" disabled className="text-indigo-600" />
                        <span className="text-sm font-bold">Gemini 3 Pro (قيد التطوير)</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2"><i className="fa-solid fa-earth-americas text-emerald-600"></i> أدوات الربط (Grounding)</h4>
                    <p className="text-xs text-slate-500">تفعيل المصادر الخارجية لضمان حداثة المعلومات.</p>
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
                      <span className="text-sm font-bold">Google Search integration</span>
                      <div className="w-12 h-6 bg-indigo-600 rounded-full flex items-center px-1">
                        <div className="w-4 h-4 bg-white rounded-full translate-x-6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade">
                 {[
                   { label: 'وقت التشغيل', value: '100%', sub: 'High Availability', color: 'indigo' },
                   { label: 'استجابة API', value: '98ms', sub: 'Average Latency', color: 'emerald' },
                   { label: 'سعة الذاكرة', value: '1.2MB', sub: 'Context Used', color: 'amber' }
                 ].map((stat, i) => (
                   <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center space-y-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                     <div className={`text-3xl font-black text-${stat.color}-600`}>{stat.value}</div>
                     <p className="text-[10px] font-bold text-slate-400">{stat.sub}</p>
                   </div>
                 ))}
               </div>
            )}

            {activeTab === 'storage' && (
              <div className="space-y-6 animate-fade">
                <div className="p-6 bg-red-50 rounded-3xl border border-red-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-red-700">تصفير كافة الإعدادات</h4>
                    <p className="text-xs text-red-500/70">سيؤدي هذا إلى مسح كافة التعليمات المخصصة واستعادة ضبط المصنع.</p>
                  </div>
                  <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all">تدمير البيانات</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperPanel;

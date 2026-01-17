
import React, { useState } from 'react';
import { MODES } from '../constants';
import { AcademicMode } from '../types';

interface DeveloperPanelProps {
  onClose: () => void;
}

const DeveloperPanel: React.FC<DeveloperPanelProps> = ({ onClose }) => {
  const [selectedMode, setSelectedMode] = useState<AcademicMode>(AcademicMode.REVIEWER);
  const [instruction, setInstruction] = useState(() => {
    return localStorage.getItem(`custom_instruction_${AcademicMode.REVIEWER}`) || 
           MODES.find(m => m.id === AcademicMode.REVIEWER)?.systemInstruction || "";
  });

  const handleModeChange = (mode: AcademicMode) => {
    setSelectedMode(mode);
    const saved = localStorage.getItem(`custom_instruction_${mode}`);
    setInstruction(saved || MODES.find(m => m.id === mode)?.systemInstruction || "");
  };

  const handleSave = () => {
    localStorage.setItem(`custom_instruction_${selectedMode}`, instruction);
    alert("تم حفظ التعليمات البرمجية المخصصة للنمط بنجاح.");
  };

  const handleReset = () => {
    localStorage.removeItem(`custom_instruction_${selectedMode}`);
    const original = MODES.find(m => m.id === selectedMode)?.systemInstruction || "";
    setInstruction(original);
    alert("تمت استعادة التعليمات الافتراضية.");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 bg-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-code-branch text-indigo-400"></i>
            <h2 className="text-xl font-bold">لوحة تحكم المطور - إعدادات النظام</h2>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform">
            <i className="fa-solid fa-times text-2xl"></i>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 bg-slate-50 border-l border-slate-200 p-4 space-y-2 overflow-y-auto">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">اختر النمط للتعديل</p>
            {MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                className={`w-full text-right p-3 rounded-xl text-sm font-bold transition-all ${
                  selectedMode === mode.id ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-200 text-slate-600'
                }`}
              >
                {mode.title}
              </button>
            ))}
          </div>

          <div className="flex-1 p-8 flex flex-col gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">تعليمات النظام (System Instruction):</label>
              <p className="text-xs text-slate-500 mb-4 italic">تنبيه: التعديل هنا يغير سلوك الذكاء الاصطناعي بشكل جذري في هذا النمط.</p>
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className="w-full h-[350px] p-6 bg-slate-900 text-indigo-300 font-mono text-sm rounded-2xl border border-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-4">
              <button 
                onClick={handleReset}
                className="px-6 py-2.5 text-slate-500 hover:text-red-600 font-bold transition-colors"
              >
                استعادة الافتراضي
              </button>
              <button 
                onClick={handleSave}
                className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperPanel;

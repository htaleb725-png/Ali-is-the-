
import React from 'react';
import { AcademicMode } from '../types';
import { MODES } from '../constants';

interface ModeSelectorProps {
  currentMode: AcademicMode;
  onModeChange: (mode: AcademicMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="flex lg:grid lg:grid-cols-5 gap-2 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-200 min-w-max lg:min-w-0">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 whitespace-nowrap ${
            currentMode === mode.id
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-[1.02]'
              : 'bg-white text-slate-600 hover:bg-white hover:text-indigo-600 border border-slate-200'
          }`}
        >
          <i className={`fa-solid ${mode.icon} text-sm`}></i>
          <span className="text-[11px] font-extrabold">{mode.title}</span>
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;

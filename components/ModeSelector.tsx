
import React from 'react';
import { AcademicMode } from '../types';
import { MODES } from '../constants';

interface ModeSelectorProps {
  currentMode: AcademicMode;
  onModeChange: (mode: AcademicMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="flex lg:grid lg:grid-cols-5 gap-3 p-2 bg-slate-100/80 rounded-[2rem] border border-slate-200 min-w-max lg:min-w-0 shadow-inner">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`flex items-center justify-center gap-3 px-6 py-3 rounded-[1.5rem] transition-all duration-500 whitespace-nowrap ${
            currentMode === mode.id
              ? 'bg-indigo-950 text-white shadow-[0_10px_25px_rgba(30,27,75,0.2)] scale-[1.05] border-transparent'
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-indigo-950 border border-slate-200 shadow-sm'
          }`}
        >
          <i className={`fa-solid ${mode.icon} text-base transition-transform group-hover:scale-125`}></i>
          <span className="text-[12px] font-black tracking-tight">{mode.title}</span>
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;


import React from 'react';
import { AcademicMode } from '../types';
import { MODES } from '../constants';

interface ModeSelectorProps {
  currentMode: AcademicMode;
  onModeChange: (mode: AcademicMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6 p-2 bg-white/50 backdrop-blur rounded-2xl shadow-sm border border-gray-100">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
            currentMode === mode.id
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
              : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-indigo-600 border border-transparent'
          }`}
        >
          <i className={`fa-solid ${mode.icon} text-lg mb-2`}></i>
          <span className="text-[10px] font-bold whitespace-nowrap">{mode.title}</span>
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;

import React from 'react';

interface GameControlsProps {
  onCorrect: () => void;
  onPass: () => void;
  disabled?: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({ onCorrect, onPass, disabled }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full h-20 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50 flex safe-area-pb">
      
      {/* PASS BUTTON */}
      <button
        onClick={onPass}
        disabled={disabled}
        className="flex-1 bg-brand-red text-white flex flex-col items-center justify-center active:bg-red-600 transition-colors disabled:opacity-50 disabled:pointer-events-none"
      >
        <span className="text-2xl mb-1">😬</span>
        <span className="font-black uppercase tracking-widest text-sm">Pass</span>
      </button>

      {/* DIVIDER */}
      <div className="w-[2px] bg-black/10"></div>

      {/* CORRECT BUTTON */}
      <button
        onClick={onCorrect}
        disabled={disabled}
        className="flex-1 bg-brand-green text-white flex flex-col items-center justify-center active:bg-green-600 transition-colors disabled:opacity-50 disabled:pointer-events-none"
      >
        <span className="text-2xl mb-1">🤩</span>
        <span className="font-black uppercase tracking-widest text-sm">Correct</span>
      </button>
    </div>
  );
};
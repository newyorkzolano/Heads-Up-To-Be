import React from 'react';

interface TimerProps {
  timeLeft: number;
  totalTime: number;
}

export const Timer: React.FC<TimerProps> = ({ timeLeft, totalTime }) => {
  const percentage = (timeLeft / totalTime) * 100;
  
  // Color logic: Green -> Yellow -> Red
  let colorClass = "bg-brand-green";
  if (percentage < 50) colorClass = "bg-brand-yellow";
  if (percentage < 20) colorClass = "bg-brand-red";

  return (
    <div className="w-full max-w-md mb-6">
      <div className="flex justify-between items-end mb-2 text-white">
        <span className="font-bold text-lg">Time Remaining</span>
        <span className="font-mono text-3xl font-black">{timeLeft}s</span>
      </div>
      <div className="h-6 w-full bg-white/30 rounded-full overflow-hidden backdrop-blur-sm border border-white/20">
        <div 
          className={`h-full ${colorClass} transition-all duration-1000 ease-linear shadow-lg`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
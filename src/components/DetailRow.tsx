import React from 'react';

export const DetailRow = ({ icon, label, value, isPhone, actionIcon, onAction }: { icon: React.ReactNode, label: string, value: string, isPhone?: boolean, actionIcon?: React.ReactNode, onAction?: () => void }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 rounded-2xl mb-3 last:mb-0">
    <div className="text-shirqat-primary dark:text-indigo-400 shrink-0">{icon}</div>
    <div className="flex-1 min-w-0 text-right">
      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mb-0.5 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 break-words">{value}</span>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      {actionIcon && (
        <button onClick={onAction} className="w-10 h-10 bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 rounded-xl flex items-center justify-center text-shirqat-primary dark:text-indigo-300 active:scale-95 transition-all">
          {actionIcon}
        </button>
      )}

      {isPhone && (
        <a 
          href={`tel:${value}`} 
          className="bg-shirqat-primary dark:bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-shirqat-primary/20 active:scale-95 transition-transform"
        >
          اتصل
        </a>
      )}
    </div>
  </div>
);

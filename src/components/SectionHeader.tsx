import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const SectionHeader = ({ title, onSeeAll, onBack, icon }: { title: string, onSeeAll?: () => void, onBack?: () => void, icon?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-4 px-1" dir="rtl">
    <h3 className="text-lg font-display font-black text-slate-800 dark:text-white flex items-center gap-2">
      <div className="w-1.5 h-6 bg-shirqat-primary rounded-full"></div>
      {title}
      {icon && <div className="text-shirqat-primary">{icon}</div>}
    </h3>
    <div className="flex items-center gap-2">
      {onSeeAll && (
        <button onClick={onSeeAll} className="text-xs font-bold text-shirqat-primary flex items-center gap-1 bg-sky-50 px-3 py-1.5 rounded-full cursor-pointer">
          عرض الكل <ChevronLeft size={14} />
        </button>
      )}
      {onBack && (
        <button onClick={onBack} className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center border border-slate-100 dark:border-slate-700 cursor-pointer active:scale-95 transition-all" title="رجوع">
          <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
      )}
    </div>
  </div>
);

export default SectionHeader;

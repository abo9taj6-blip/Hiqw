import React from 'react';
import { Search } from 'lucide-react';

export const SearchBar = ({ 
  value, 
  onChange, 
  placeholder,
  focusRingClass = "focus:ring-shirqat-primary/20",
  className = "mb-4"
}: { 
  value: string; 
  onChange: (v: string) => void; 
  placeholder?: string;
  focusRingClass?: string;
  className?: string;
}) => (
  <div className={`relative ${className}`}>
    <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    <input
      type="text"
      placeholder={placeholder || "أبحث..."}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full h-12 pr-11 pl-10 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${focusRingClass} shadow-xs text-right`}
    />
    {value && (
      <button
        onClick={() => onChange('')}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors text-xs"
      >
        ✕
      </button>
    )}
  </div>
);


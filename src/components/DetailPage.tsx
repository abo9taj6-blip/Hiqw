import React from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { SectionHeader } from './SectionHeader';
import { DetailRow } from './DetailRow';

export { SectionHeader, DetailRow };

export const DetailPage = ({ title, subtitle, icon, children, onBack, image, isVerified, headerAction }: { title: string, subtitle?: string, icon: React.ReactNode, children: React.ReactNode, onBack: () => void, image?: string, isVerified?: boolean, headerAction?: React.ReactNode }) => (
  <motion.div 
    initial={{ x: '100%' }} 
    animate={{ x: 0 }} 
    exit={{ x: '100%' }}
    className="fixed inset-0 z-[110] bg-white dark:bg-slate-900 flex flex-col pointer-events-auto font-sans"
  >
    {/* Simple Sticky Top Bar with Back Button on the LEFT */}
    <div className="sticky top-0 z-[120] bg-white/90 backdrop-blur-md dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between shrink-0" dir="rtl">
      <div className="w-10 h-10 shrink-0 flex items-center justify-center">
        {headerAction || <div className="w-10 h-10" />}
      </div>
      <span className="font-black text-sm text-slate-800 dark:text-slate-100 truncate flex-1 text-center px-2">
        {title}
      </span>
      <button 
        onClick={onBack} 
        className="w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-800 dark:text-slate-200 cursor-pointer transition-all active:scale-95 shrink-0"
        title="رجوع"
      >
        <ChevronRight size={22} />
      </button>
    </div>

    <div className="relative flex-1 overflow-y-auto px-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-6 custom-scrollbar text-right" dir="rtl">
      
      {/* Cover Image Container */}
      <div className="w-full h-48 rounded-3xl overflow-hidden mb-6 relative bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800/60 shadow-sm shrink-0">
        {image ? (
          <img src={image} className="w-full h-full object-cover" alt="" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white relative">
             <div className="scale-150 opacity-20">{icon}</div>
          </div>
        )}
      </div>

      {children}

      <div className="mt-12 flex items-center justify-center gap-2 opacity-30 pb-8 grayscale dark:invert">
         <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-800">تطبيق دليل الشرقاط الرسمي</span>
         <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
      </div>
    </div>
  </motion.div>
);


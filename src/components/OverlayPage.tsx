import React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

export const OverlayPage = ({ title, children, onBack }: { title: string, children: React.ReactNode, onBack: () => void }) => (
  <motion.div 
    initial={{ y: '100%' }} 
    animate={{ y: 0 }} 
    exit={{ y: '100%' }}
    className="fixed inset-0 z-[120] bg-white flex flex-col"
  >
    <div className="sticky top-0 z-10 bg-white border-b border-slate-100 flex items-center justify-between p-4" dir="rtl">
      <div className="w-10" />
      <div className="flex-1 text-center font-display font-bold text-slate-800">{title}</div>
      <button onClick={onBack} className="p-2 text-slate-500 hover:text-slate-800 cursor-pointer" title="إغلاق">
        <ChevronDown size={24} />
      </button>
    </div>
    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar pb-24">
      {children}
    </div>
  </motion.div>
);

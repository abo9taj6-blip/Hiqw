import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, BadgeCheck } from 'lucide-react';

const categoryTranslations: Record<string, string> = {};

export const ItemCardSkeleton = () => (
  <div className="w-full rounded-2xl border border-slate-100 bg-white p-4 flex items-center gap-4 animate-pulse">
    <div className="w-12 h-12 rounded-2xl bg-slate-100 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 bg-slate-100 rounded-full w-2/3" />
      <div className="h-3 bg-slate-100 rounded-full w-1/3" />
    </div>
  </div>
);

export const ItemCard = React.memo(({ item, icon, color, onClick, createdAt, isGovAnnouncement }: { item: any, icon: React.ReactNode, color: string, onClick: () => void, key?: any, createdAt?: number, isGovAnnouncement?: boolean }) => {
  const isNew = createdAt && (Date.now() - createdAt) < 7 * 24 * 60 * 60 * 1000;

  const handleClick = () => {
    if (window.navigator.vibrate) window.navigator.vibrate(5);
    onClick();
  };
  
  const isGov = isGovAnnouncement || item.type === "govAnnouncement" || String(item.id || '').startsWith("govAnnouncement-");

  if (isGov) {
    const imageUrl = item.image || item.logoImage || (item.images && item.images[0]);
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className="w-full bg-white dark:bg-slate-800 rounded-3xl p-3.5 flex gap-4 items-center border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900/50 shadow-sm transition-all cursor-pointer group relative overflow-hidden"
        dir="rtl"
      >
        
        {/* Thumbnail Image */}
        <div className="w-[72px] h-[72px] rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-slate-100 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center relative">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={item.name || item.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="text-emerald-600 dark:text-emerald-400">
              {icon}
            </div>
          )}
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="font-display font-black text-sm text-slate-800 dark:text-white break-words text-right">
              {item.name || item.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(item.entity || item.subtitle) && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md shrink-0">
                {item.entity || item.subtitle}
              </span>
            )}
            {item.publishDate && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100/60 dark:bg-slate-700/50 px-1.5 py-0.5 rounded-md shrink-0" dir="ltr">
                <span>📅</span> {(() => {
                  try {
                    const d = new Date(item.publishDate);
                    if (isNaN(d.getTime())) return item.publishDate;
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${y}-${m}-${day}`;
                  } catch (e) {
                    return item.publishDate;
                  }
                })()}
              </span>
            )}
          </div>
        </div>

        {/* Left indicator arrow */}
        <div className="text-slate-300 group-hover:text-emerald-600 dark:text-slate-600 dark:group-hover:text-emerald-400 transition-colors pr-1 shrink-0">
          <ChevronLeft size={20} />
        </div>
      </motion.div>
    );
  }

  return (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileTap={{ scale: 0.98 }}
    onClick={handleClick}
    className="w-full bg-white dark:bg-slate-800 rounded-3xl p-3 flex gap-3.5 items-center border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900/40 hover:shadow-md transition-all duration-200 cursor-pointer group text-right relative overflow-hidden"
    dir="rtl"
  >
    {isNew && (
      <div className="absolute top-2 right-2 z-20 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">جديد</div>
    )}
    <div className={`w-16 h-16 shrink-0 rounded-2xl overflow-hidden flex items-center justify-center border relative ${
      color==='blue'?'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 border-cyan-100 dark:border-cyan-900/40':
      color==='amber'?'bg-teal-50 dark:bg-teal-950/30 text-teal-600 border-teal-100 dark:border-teal-900/40':
      color==='emerald'?'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-100 dark:border-emerald-900/40':
      color==='teal'?'bg-teal-50 dark:bg-teal-950/30 text-teal-600 border-teal-100 dark:border-teal-900/40':
      color==='orange'?'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-100 dark:border-emerald-900/40':
      'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-100 dark:border-emerald-900/40'
    }`}>
      {item.image || item.logoImage || (item.images && item.images[0]) ? (
        <img src={item.image || item.logoImage || (item.images && item.images[0])} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        icon
      )}
    </div>
    <div className="flex-1 min-w-0 flex flex-col justify-center text-right">
      <div className="flex items-center gap-1.5 mb-1 text-right flex-row-reverse justify-end">
        {item.isVerified && (
          <BadgeCheck size={16} className="text-emerald-500 fill-emerald-50" />
        )}
        <h4 className="font-display font-black text-slate-800 dark:text-white text-sm truncate">{item.name || item.title}</h4>
      </div>
      <div className="flex items-center gap-2 flex-wrap text-right">
        {item.category && categoryTranslations[item.category] && (
          <span className="px-1.5 py-0.5 bg-shirqat-primary/10 text-shirqat-primary dark:bg-shirqat-primary/20 text-[9px] font-black rounded-lg">
            {categoryTranslations[item.category]}
          </span>
        )}
        {(item.subtitle || item.entity) && (
          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-lg group-hover:bg-emerald-50 group-hover:text-emerald-600 dark:group-hover:bg-emerald-950/30 dark:group-hover:text-emerald-400 transition-colors">
            {item.subtitle || item.entity}
          </span>
        )}
        {(item.summary || item.description || item.brief) && (
          <p className="w-full text-right text-[10px] font-bold text-slate-400 truncate opacity-70 mt-0.5 line-clamp-1 break-all">
            {String(item.summary || item.description || item.brief).replace(/\\n/g, ' ')}
          </p>
        )}
      </div>
    </div>
    <div className="self-center pr-1 shrink-0">
      <ChevronLeft size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-[-2px] transition-all" />
    </div>
  </motion.div>
  );
});

import React, { useState, useEffect } from "react";
import { ChevronLeft, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GovAnnouncement, ServiceOffer } from "../types";

interface Props {
  item: GovAnnouncement | ServiceOffer | any;
  onClick: () => void;
  layout?: "list" | "card";
}

export default function EventPostCard({ item, onClick, layout = "list" }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Normalize images
  const postImages = React.useMemo(() => {
    if (item.images && item.images.length > 0) return item.images;
    if (item.image) return [item.image];
    return [];
  }, [item.images, item.image]);

  // Auto slide carousel if there are multiple images
  useEffect(() => {
    if (postImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % postImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [postImages.length]);

  if (layout === "list") {
    return (
      <motion.div
        onClick={onClick}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-white dark:bg-slate-800 rounded-2xl p-2 sm:p-2.5 flex items-center gap-3 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-300 dark:hover:border-emerald-800/60 shadow-xs hover:shadow-md transition-all cursor-pointer group text-right relative overflow-hidden"
        dir="rtl"
      >
        {/* Compact Image Thumbnail */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 overflow-hidden shrink-0 relative border border-slate-100 dark:border-slate-700/60 flex items-center justify-center">
          {postImages.length > 0 ? (
            <img
              src={postImages[0]}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="text-emerald-600 dark:text-emerald-400 text-xl">
              <Sparkles size={22} />
            </div>
          )}
          {postImages.length > 1 && (
            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md backdrop-blur-xs">
              📷 {postImages.length}
            </span>
          )}
        </div>

        {/* Title ONLY */}
        <div className="flex-1 min-w-0 pr-0.5">
          <h3 className="font-display font-black text-xs sm:text-sm text-slate-800 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {item.title}
          </h3>
        </div>

        {/* Left Action Arrow */}
        <div className="shrink-0 flex items-center justify-center pl-1">
          <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-700/50 group-hover:bg-emerald-600 group-hover:text-white text-slate-400 dark:text-slate-400 flex items-center justify-center transition-all duration-300 group-hover:-translate-x-1">
            <ChevronLeft size={16} />
          </div>
        </div>
      </motion.div>
    );
  }

  // Full Feed Grid Card Layout ("card")
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col text-right cursor-pointer group"
      dir="rtl"
    >
      {/* Top Image */}
      {postImages.length > 0 ? (
        <div className="relative h-32 sm:h-36 w-full bg-slate-50 dark:bg-slate-950 overflow-hidden border-b border-slate-100 dark:border-slate-800">
          <img
            src={postImages[0]}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="h-28 w-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <Sparkles size={28} />
        </div>
      )}

      {/* Body: Title ONLY */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <h3 className="font-display font-black text-xs sm:text-sm text-slate-800 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {item.title}
        </h3>

        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-[11px] font-black text-emerald-600 dark:text-emerald-400">
          <span>التفاصيل</span>
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}

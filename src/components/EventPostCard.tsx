import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GovAnnouncement, ServiceOffer } from "../types";

interface Props {
  item: GovAnnouncement | ServiceOffer | any;
  onClick: () => void;
}

export default function EventPostCard({ item, onClick }: Props) {
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

  const tagOrCategory = item.category || item.tag;

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100/85 dark:border-slate-800/60 shadow-sm overflow-hidden flex flex-col text-right hover:shadow-md transition-shadow duration-300 h-full cursor-pointer group"
    >
      {/* 1. Image Banner on top with optimized aspect ratio for side-by-side display */}
      {postImages.length > 0 ? (
        <div className="relative aspect-[4/3] w-full bg-slate-50 dark:bg-slate-950 overflow-hidden border-b border-slate-50 dark:border-slate-900 group/post-carousel">
          <AnimatePresence mode="popLayout">
            <motion.img
              key={currentIndex}
              src={postImages[currentIndex]}
              alt={`${item.title} - image ${currentIndex + 1}`}
              initial={{ x: "100%", opacity: 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            />
          </AnimatePresence>

          {/* Carousel Navigation Arrows */}
          {postImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev - 1 + postImages.length) % postImages.length);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover/post-carousel:opacity-100 transition-opacity duration-300 active:scale-95 text-xs font-bold"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev + 1) % postImages.length);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover/post-carousel:opacity-100 transition-opacity duration-300 active:scale-95 text-xs font-bold"
              >
                ›
              </button>
            </>
          )}

          {/* Dots Indicators */}
          {postImages.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10 bg-black/20 px-1.5 py-0.5 rounded-full backdrop-blur-[2px]">
              {postImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-2 bg-white" : "w-1 bg-white/50"}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-[4/3] w-full bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 flex items-center justify-center text-3xl opacity-40 border-b border-slate-50 dark:border-slate-900">
          ✨
        </div>
      )}

      {/* 2. Post Body */}
      <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Title */}
          <h3 className="font-display font-black text-xs md:text-sm text-slate-800 dark:text-white leading-snug line-clamp-2 group-hover:text-shirqat-primary transition-colors">
            {item.title}
          </h3>

          {/* Category / Tag badge */}
          {tagOrCategory && (
            <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-bold">
              <span className="text-[8px] font-black bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-800">
                {tagOrCategory}
              </span>
            </div>
          )}
        </div>

        {/* 3. Action button (عرض التفاصيل) */}
        <div className="pt-2">
          <div className="w-full bg-shirqat-primary hover:bg-emerald-700 text-white py-1.5 rounded-xl flex items-center justify-center gap-1 text-[10px] font-black transition-all group-hover:scale-[1.02] active:scale-[0.98]">
            <span>عرض التفاصيل ↗</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import React from "react";
import { motion } from "motion/react";
import { Stethoscope, MapPin, Calendar, ChevronLeft } from "lucide-react";
import { Doctor } from "../types";

interface DoctorCardProps {
  doctor: Doctor;
  onClick: () => void;
  index?: number;
}

export const DoctorCard: React.FC<DoctorCardProps> = React.memo(({ doctor, onClick, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.2), duration: 0.2 }}
      onClick={onClick}
      whileTap={{ scale: 0.99 }}
      className="w-full p-2.5 sm:p-3 flex gap-3 items-center hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors duration-150 cursor-pointer text-right group relative overflow-hidden"
      dir="rtl"
    >
      {/* Doctor Image / Avatar */}
      <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-gradient-to-br from-slate-100 to-emerald-50/50 dark:from-slate-800 dark:to-slate-900 overflow-hidden shrink-0 flex items-center justify-center relative border border-slate-200/80 dark:border-slate-700/80 shadow-2xs group-hover:border-emerald-300 dark:group-hover:border-emerald-700/60 transition-colors">
        {doctor.image ? (
          <img
            src={doctor.image}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            alt={doctor.name}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="text-emerald-600 dark:text-emerald-400 p-2.5">
            <Stethoscope size={24} strokeWidth={1.75} />
          </div>
        )}
      </div>

      {/* Main Content Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center space-y-0.5">
        {/* 1. Doctor Name (عريض) */}
        <h3 className="font-display font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {doctor.name}
        </h3>

        {/* 2. Specialty / Subtitle (لون مميز وخاص بهوية التطبيق) */}
        {doctor.subtitle && (
          <p className="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 line-clamp-1 leading-snug">
            {doctor.subtitle}
          </p>
        )}



        {/* 4. Working Days / Hours (أوقات الدوام) */}
        {doctor.workingDays && (
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 font-normal">
            <Calendar size={12} className="text-teal-500/90 dark:text-teal-400 shrink-0" />
            <span className="truncate">{doctor.workingDays}</span>
          </div>
        )}
      </div>

      {/* Navigation Arrow */}
      <div className="self-center pr-0.5 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 group-hover:-translate-x-1 transition-all shrink-0">
        <ChevronLeft size={18} />
      </div>
    </motion.div>
  );
});

DoctorCard.displayName = "DoctorCard";

import React, { useState } from "react";
import {
  ArrowRight,
  MapPin,
  Compass,
  Landmark as LandmarkIcon,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  Share2,
  Check,
  Building2,
  TreePine,
  BookOpen,
  Calendar,
} from "lucide-react";
import { District, Landmark, LandmarkType } from "../types";

interface DistrictDetailPageProps {
  district: District;
  allDistricts?: District[];
  onBack: () => void;
  onSelectDistrict?: (district: District) => void;
}

const TYPE_CONFIG: Record<
  LandmarkType,
  { bg: string; text: string; border: string; icon: string }
> = {
  تاريخي: {
    bg: "bg-purple-50 dark:bg-purple-950/50",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800",
    icon: "🏛️",
  },
  سياحي: {
    bg: "bg-blue-50 dark:bg-blue-950/50",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    icon: "🎡",
  },
  تراثي: {
    bg: "bg-amber-50 dark:bg-amber-950/50",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    icon: "🕌",
  },
  طبيعي: {
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: "🌿",
  },
  ثقافي: {
    bg: "bg-rose-50 dark:bg-rose-950/50",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
    icon: "📚",
  },
};

export const DistrictDetailPage: React.FC<DistrictDetailPageProps> = ({
  district,
  allDistricts = [],
  onBack,
  onSelectDistrict,
}) => {
  const [selectedType, setSelectedType] = useState<string>("الكل");
  const [copied, setCopied] = useState(false);

  const landmarks = district.landmarks || [];
  const filteredLandmarks = landmarks.filter((lm) => {
    if (selectedType === "الكل") return true;
    return lm.type === selectedType;
  });

  const availableTypes = Array.from(
    new Set(landmarks.map((l) => l.type).filter(Boolean)),
  );

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `قضاء ${district.name} - دليل صلاح الدين`,
          text: `${district.name}: ${district.summary}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `قضاء ${district.name} - دليل صلاح الدين\n${district.summary}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Find next and prev districts in list
  const currentIndex = allDistricts.findIndex((d) => d.id === district.id);
  const prevDistrict =
    currentIndex > 0 ? allDistricts[currentIndex - 1] : null;
  const nextDistrict =
    currentIndex >= 0 && currentIndex < allDistricts.length - 1
      ? allDistricts[currentIndex + 1]
      : null;

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-24 text-right animate-in fade-in duration-300"
      dir="rtl"
    >
      {/* Sticky Top Bar */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 shadow-2xs">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all cursor-pointer active:scale-95 shrink-0"
              title="رجوع"
            >
              <ArrowRight size={20} />
            </button>
            <div>
              <h1 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                قضاء {district.name}
              </h1>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                محافظة صلاح الدين • ترتيب {district.order || 1}
              </p>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 border border-emerald-200 dark:border-emerald-800"
            title="مشاركة"
          >
            {copied ? <Check size={18} /> : <Share2 size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white p-6 shadow-md border border-emerald-500/20">
          <div className="absolute top-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-x-10 -translate-y-10 pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-black tracking-wide border border-white/20">
                <Compass size={13} className="text-emerald-300" />
                أقضية محافظة صلاح الدين
              </span>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-xl bg-amber-400 text-slate-950">
                رقم {district.order}
              </span>
            </div>

            <div className="pt-1">
              <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white flex items-center gap-2">
                <span>قضاء {district.name}</span>
                <span className="text-xl">🏛️</span>
              </h2>
              <p className="text-xs sm:text-sm text-emerald-50/90 font-medium leading-relaxed mt-2.5">
                {district.summary}
              </p>
            </div>
          </div>
        </div>

        {/* 1. النبذة التعريفية */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-display font-black text-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BookOpen size={17} />
            </div>
            <span>النبذة والتعريف</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {district.summary}
          </p>
        </section>

        {/* 2. معلومات أساسية */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-display font-black text-sm">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Building2 size={17} />
            </div>
            <span>معلومات أساسية</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">
                المحافظة
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200">
                صلاح الدين
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">
                ترتيب العرض
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200">
                القضاء رقم {district.order || 1}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">
                عدد المعالم المعتمدة
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                {landmarks.length} معالم
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">
                الحالة في الدليل
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                نشط ومعتمد
              </span>
            </div>
          </div>
        </section>

        {/* 3. المعالم والوجهات */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-display font-black text-sm">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <LandmarkIcon size={17} />
              </div>
              <span>المعالم والوجهات ({landmarks.length})</span>
            </div>

            <span className="text-[11px] font-bold text-slate-400">
              {filteredLandmarks.length} معروض
            </span>
          </div>

          {/* Type Filter Chips */}
          {availableTypes.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedType("الكل")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                  selectedType === "الكل"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                الكل ({landmarks.length})
              </button>
              {availableTypes.map((type) => {
                const conf = TYPE_CONFIG[type as LandmarkType] || {
                  bg: "bg-slate-100",
                  text: "text-slate-700",
                  border: "border-slate-200",
                  icon: "📍",
                };
                const count = landmarks.filter((l) => l.type === type).length;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      selectedType === type
                        ? `${conf.bg} ${conf.text} border ${conf.border} shadow-xs font-black`
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    <span>{conf.icon}</span>
                    <span>{type}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Landmarks List */}
          {filteredLandmarks.length === 0 ? (
            <div className="p-8 text-center text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              لا توجد معالم مسجلة تحت هذا التصنيف حالياً
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLandmarks.map((lm, idx) => {
                const conf = TYPE_CONFIG[lm.type] || {
                  bg: "bg-slate-100",
                  text: "text-slate-700",
                  border: "border-slate-200",
                  icon: "📍",
                };

                return (
                  <div
                    key={lm.id || idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800/80 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{conf.icon}</span>
                        <h4 className="font-display font-black text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {lm.name}
                        </h4>
                      </div>

                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${conf.bg} ${conf.text} ${conf.border} shrink-0`}
                      >
                        {lm.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal pr-7">
                      {lm.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Next / Previous District Switcher */}
        {allDistricts.length > 1 && (
          <div className="pt-2 flex items-center justify-between gap-3">
            {prevDistrict ? (
              <button
                onClick={() => onSelectDistrict && onSelectDistrict(prevDistrict)}
                className="flex-1 p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 transition-all text-right flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <ChevronRight size={18} className="text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-bold">
                    القضاء السابق
                  </span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 truncate block">
                    قضاء {prevDistrict.name}
                  </span>
                </div>
              </button>
            ) : (
              <div className="flex-1" />
            )}

            {nextDistrict ? (
              <button
                onClick={() => onSelectDistrict && onSelectDistrict(nextDistrict)}
                className="flex-1 p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 transition-all text-left flex items-center justify-end gap-2 cursor-pointer active:scale-98"
              >
                <div className="min-w-0 text-right">
                  <span className="text-[10px] text-slate-400 block font-bold">
                    القضاء التالي
                  </span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 truncate block">
                    قضاء {nextDistrict.name}
                  </span>
                </div>
                <ChevronLeft size={18} className="text-slate-400 shrink-0" />
              </button>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

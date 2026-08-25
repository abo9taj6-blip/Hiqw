import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight,
  Phone,
  Hospital,
  MapPin,
  Stethoscope,
  PhoneCall,
  CheckCircle,
  MessageCircle,
  FileText,
  Calendar,
  Search,
} from "lucide-react";
import { MarketStore, Doctor } from "../types";
import { firebaseService } from "../services/firebaseService";

interface Props {
  complex: MarketStore;
  onBack: () => void;
  onSelectDoctor?: (doctor: Doctor) => void;
}

export default function MedicalComplexDetailPage({
  complex,
  onBack,
  onSelectDoctor,
}: Props) {
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [searchDoctor, setSearchDoctor] = useState("");

  // Manage Scroll to Top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    setLoadingDoctors(true);
    const complexPath = `medical_complexes/${complex.id}/complex_doctors`;
    const fallbackPath = `market_stores/${complex.id}/market_products`;

    firebaseService
      .fetchCollectionOnce<any>(complexPath)
      .then((items) => {
        if (items && items.length > 0) {
          setDoctorsList(items);
          setLoadingDoctors(false);
        } else {
          return firebaseService
            .fetchCollectionOnce<any>(fallbackPath)
            .then((fallbackItems) => {
              setDoctorsList(fallbackItems || []);
              setLoadingDoctors(false);
            });
        }
      })
      .catch((err) => {
        console.error("Error fetching complex doctors:", err);
        setDoctorsList([]);
        setLoadingDoctors(false);
      });
  }, [complex.id]);

  const filteredDoctors = doctorsList.filter((doc) => {
    if (!searchDoctor.trim()) return true;
    const q = searchDoctor.toLowerCase().trim();
    return (
      (doc.name && doc.name.toLowerCase().includes(q)) ||
      (doc.specialty && doc.specialty.toLowerCase().includes(q)) ||
      (doc.subtitle && doc.subtitle.toLowerCase().includes(q)) ||
      (doc.description && doc.description.toLowerCase().includes(q))
    );
  });

  return (
    <div
      className="min-h-screen bg-slate-100 dark:bg-slate-900 pb-20 text-right font-sans"
      dir="rtl"
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all cursor-pointer active:scale-95 shrink-0"
          title="رجوع"
        >
          <ChevronRight size={20} />
        </button>
        <div className="flex items-center gap-2 max-w-[70%]">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
            <Hospital size={18} />
          </div>
          <h2 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white truncate">
            {complex.name}
          </h2>
        </div>
        <div className="w-10 h-10" />
      </div>

      {/* Hero Complex Info Card */}
      <div className="p-3.5 sm:p-4 space-y-4 max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 overflow-hidden flex items-center justify-center shrink-0">
              {complex.logoImage || complex.coverImage ? (
                <img
                  src={complex.logoImage || complex.coverImage}
                  alt={complex.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Hospital size={36} className="text-emerald-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  {complex.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle size={10} />
                  معتمد
                </span>
              </div>

              {complex.location && (
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1.5 flex items-center gap-1">
                  <MapPin size={14} className="text-emerald-500 shrink-0" />
                  <span>{complex.location}</span>
                </p>
              )}

              {complex.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium mt-2">
                  {complex.description}
                </p>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
            {complex.phone && (
              <button
                onClick={() => window.open(`tel:${complex.phone}`)}
                className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <PhoneCall size={16} />
                <span>اتصال بالمجمع ({complex.phone})</span>
              </button>
            )}
            {complex.whatsapp && (
              <button
                onClick={() =>
                  window.open(
                    `https://wa.me/${complex.whatsapp?.replace(/[^0-9]/g, "")}`,
                    "_blank"
                  )
                }
                className="h-11 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <MessageCircle size={16} />
                <span>مراسلة واتساب</span>
              </button>
            )}
          </div>
        </div>

        {/* Doctors / Staff Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
                <Stethoscope size={16} />
              </div>
              <h3 className="font-display font-black text-sm text-slate-800 dark:text-white">
                الكوادر الطبية والعيادات التخصصية
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {doctorsList.length} كادر طبي
            </span>
          </div>

          {/* Search Doctors inside complex */}
          {doctorsList.length > 2 && (
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث عن طبيب أو تخصص في المجمع..."
                value={searchDoctor}
                onChange={(e) => setSearchDoctor(e.target.value)}
                className="w-full h-11 pr-10 pl-4 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs text-right"
              />
              <Search
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          )}

          {/* Doctors List */}
          {loadingDoctors ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-2xl h-24 animate-pulse border border-slate-100 dark:border-slate-800"
                />
              ))}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400 font-bold border border-slate-200/80 dark:border-slate-700/80">
              {doctorsList.length === 0
                ? "سيتم إضافة قائمة الأطباء والكوادر الطبية قريباً"
                : "لا يوجد طبيب مطابق للبحث"}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredDoctors.map((doc, idx) => (
                <motion.div
                  key={doc.id || idx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs flex items-center justify-between gap-3 text-right"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl bg-slate-50 dark:bg-slate-700/50 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700">
                      {doc.images && doc.images[0] ? (
                        <img
                          src={doc.images[0]}
                          alt={doc.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : doc.image ? (
                        <img
                          src={doc.image}
                          alt={doc.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Stethoscope size={22} className="text-emerald-600" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-display font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {doc.name}
                      </h4>
                      {(doc.specialty || doc.subtitle || doc.menuCategory) && (
                        <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                          {doc.specialty || doc.subtitle || doc.menuCategory}
                        </p>
                      )}
                      {doc.description && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1 mt-0.5">
                          {doc.description}
                        </p>
                      )}
                      {doc.workingDays && (
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                          <Calendar size={10} />
                          <span>أيام الدوام: {doc.workingDays}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Direct Call / Reservation Button */}
                  {(doc.phone || doc.reservationPhone || complex.phone) && (
                    <button
                      onClick={() =>
                        window.open(
                          `tel:${
                            doc.reservationPhone || doc.phone || complex.phone
                          }`
                        )
                      }
                      className="h-9 px-3 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-all active:scale-95 cursor-pointer"
                      title="اتصال للحجز"
                    >
                      <Phone size={13} />
                      <span>حجز</span>
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  ExternalLink,
  Calendar,
  Share2,
  FileText,
  Activity,
  Layers,
} from "lucide-react";
import { CouncilMember, CouncilActivity } from "../types";
import { CouncilActivityCard } from "./CouncilActivityCard";

interface CouncilMemberProfileModalProps {
  member: CouncilMember | null;
  activities: CouncilActivity[];
  onClose: () => void;
  onOpenImage?: (imageUrl: string) => void;
}

export const CouncilMemberProfileModal: React.FC<CouncilMemberProfileModalProps> = ({
  member,
  activities,
  onClose,
  onOpenImage,
}) => {
  const [activeTab, setActiveTab] = useState<"activities" | "bio" | "contact">("activities");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!member) return null;

  const memberActivities = activities.filter((act) => act.memberId === member.id);
  const isLeadership =
    member.title.includes("رئيس مجلس") ||
    member.title.includes("نائب رئيس") ||
    member.order === 1 ||
    member.order === 2;

  const handleImageClick = (url: string) => {
    if (onOpenImage) {
      onOpenImage(url);
    } else {
      setPreviewImage(url);
    }
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-0 sm:p-4" dir="rtl">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.98 }}
        transition={{ type: "spring", damping: 26, stiffness: 260 }}
        className="relative w-full max-w-xl h-full sm:h-[92vh] sm:max-h-[820px] bg-slate-50 dark:bg-slate-900 sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden font-sans border border-slate-200/80 dark:border-slate-800"
      >
        {/* Sticky Header with Member Quick Identity */}
        <div className="relative bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-5 sm:p-6 pb-5 shrink-0 overflow-hidden shadow-md">
          {/* Decorative Pattern Background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
          {isLeadership && (
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400" />
          )}

          {/* Top Bar with Close Button */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400/90 bg-emerald-950/70 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Building2 size={12} />
              <span>مجلس محافظة صلاح الدين</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer backdrop-blur-md"
              title="إغلاق"
            >
              <X size={18} />
            </button>
          </div>

          {/* Member Card Header in Modal */}
          <div className="flex items-start gap-4 relative z-10">
            {/* Portrait */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/20 shadow-xl bg-slate-800">
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🏛️</div>
                )}
              </div>
              <span className="absolute -bottom-1 -left-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>

            {/* Title & Info */}
            <div className="flex-1 min-w-0">
              <span className="inline-block text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-1">
                {member.title}
              </span>

              <h2 className="font-display font-black text-lg sm:text-xl text-white leading-tight">
                {member.name}
              </h2>

              {member.committee && (
                <p className="text-xs text-slate-300/90 font-semibold truncate mt-1">
                  {member.committee}
                </p>
              )}

              {member.electoralDistrict && (
                <div className="flex items-center gap-1 text-[11px] text-emerald-300 font-bold mt-1.5">
                  <MapPin size={12} />
                  <span>دائرة التمثيل: {member.electoralDistrict}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Counters Grid */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 relative z-10">
            <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-2xl text-center border border-white/10">
              <span className="text-[10px] text-emerald-300 block font-bold">الطلبات المنجزة</span>
              <span className="text-sm sm:text-base font-display font-black text-white">
                {member.completedRequestsCount.toLocaleString("ar-IQ")}
              </span>
            </div>

            <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-2xl text-center border border-white/10">
              <span className="text-[10px] text-amber-300 block font-bold">قيد المتابعة</span>
              <span className="text-sm sm:text-base font-display font-black text-white">
                {(member.activeRequestsCount || 0).toLocaleString("ar-IQ")}
              </span>
            </div>

            <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-2xl text-center border border-white/10">
              <span className="text-[10px] text-sky-300 block font-bold">النشاطات الموثقة</span>
              <span className="text-sm sm:text-base font-display font-black text-white">
                {memberActivities.length.toLocaleString("ar-IQ")}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selector: Activities / Bio / Contact */}
        <div className="p-3 px-4 bg-white dark:bg-slate-850 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("activities")}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "activities"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              <Activity size={14} />
              <span>النشاطات اليومية</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "activities" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                {memberActivities.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("bio")}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "bio"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              <FileText size={14} />
              <span>السيرة والمهام</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("contact")}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "contact"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              <Phone size={14} />
              <span>المكتب والتواصل</span>
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: ACTIVITIES */}
          {activeTab === "activities" && (
            <div className="space-y-4">
              {memberActivities.length > 0 ? (
                memberActivities.map((act) => (
                  <CouncilActivityCard
                    key={act.id}
                    activity={act}
                    showMemberBadge={false}
                    onImageClick={handleImageClick}
                  />
                ))
              ) : (
                <div className="bg-white dark:bg-slate-850 rounded-3xl p-8 text-center border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
                    📰
                  </div>
                  <h4 className="font-display font-black text-sm text-slate-700 dark:text-slate-200">
                    لا توجد نشاطات مسجلة حالياً
                  </h4>
                  <p className="text-xs text-slate-400">
                    سيتم إدراج الجولات الميدانية والاجتماعات اليومية الخاصة بالعضو فور توثيقها من قبل المكتب الإعلامي.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BIO & DUTIES */}
          {activeTab === "bio" && (
            <div className="space-y-3.5">
              {/* Detailed Bio Card */}
              <div className="bg-white dark:bg-slate-850 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <FileText size={16} />
                  <h4 className="font-display font-black text-sm">السيرة الذاتية والمهنية</h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                  {member.bio || "عضو منتخب في مجلس محافظة صلاح الدين يمثل تطلعات المواطنين ويسعى لتطوير الخدمات والبنى التحتية."}
                </p>
              </div>

              {/* Committee Duties */}
              <div className="bg-white dark:bg-slate-850 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <Layers size={16} />
                  <h4 className="font-display font-black text-sm">اللجنة والمهام الرقابية</h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                  يتولى الإشراف والمتابعة الميدانية على أعمال: {member.committee || member.title}، ومتابعة تنفيذ قرارات مجلس المحافظة مع الدوائر ذات الصلة.
                </p>
              </div>

              {/* Citizen Service Statement */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-emerald-200/60 dark:border-emerald-800/40 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black text-xs">
                  <CheckCircle2 size={16} />
                  <span>خدمة وتنسيق طلبات المواطنين</span>
                </div>
                <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed font-semibold">
                  تم إنجاز {member.completedRequestsCount.toLocaleString("ar-IQ")} معاملة وطلباً رسمياً مقدماً من أهالي المحافظة، مع استمرار العمل على {member.activeRequestsCount || 0} طلباً قيد المتابعة مع الدوائر الحكومية.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT & RECEPTION OFFICE */}
          {activeTab === "contact" && (
            <div className="space-y-3.5">
              {/* Reception Office Card */}
              <div className="bg-white dark:bg-slate-850 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <MapPin size={16} />
                  <h4 className="font-display font-black text-sm">مكتب استقبال المواطنين</h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                  {member.officeLocation || "ديوان مجلس محافظة صلاح الدين - تكريت"}
                </p>
                <span className="text-[11px] text-slate-400 block font-bold">
                  ساعات الاستقبال: من الأحد إلى الخميس (9:00 صباحاً - 2:00 بعد الظهر)
                </span>
              </div>

              {/* Direct Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {member.whatsapp && (
                  <a
                    href={`https://wa.me/${member.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                  >
                    <MessageCircle size={18} />
                    <span>مراسلة واتساب (إرسال طلب)</span>
                  </a>
                )}

                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 transition-all"
                  >
                    <Phone size={18} />
                    <span>الاتصال الهاتفي المباشر</span>
                  </a>
                )}
              </div>

              {/* Social or Official Links */}
              {member.facebook && (
                <a
                  href={member.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center justify-between border border-slate-200 dark:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌐</span>
                    <span>الصفحة الرسمية / التغطيات الإخبارية</span>
                  </div>
                  <ExternalLink size={14} className="text-slate-400" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Floating Quick Action Footer */}
        <div className="p-3 sm:p-4 bg-white/95 dark:bg-slate-850/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 shrink-0 flex items-center gap-2.5">
          {member.whatsapp ? (
            <a
              href={`https://wa.me/${member.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                `السلام عليكم، أود تقديم طلب/استفسار إلى مكتب ${member.name} (${member.title})`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
            >
              <MessageCircle size={18} />
              <span>تقديم طلب / مناشدة عبر الواتساب</span>
            </a>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-2"
            >
              <span>تم الاطلاع</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center shrink-0 cursor-pointer"
            title="رجوع"
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>

      {/* Lightbox Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <div
            className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage}
                alt="عرض الصورة"
                className="w-full h-full max-h-[85vh] object-contain rounded-2xl"
              />
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute top-3 left-3 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React from "react";
import { Phone, MessageCircle, CheckCircle2, ChevronLeft, Building2, MapPin } from "lucide-react";
import { CouncilMember } from "../types";

interface CouncilMemberCardProps {
  member: CouncilMember;
  onSelect: (member: CouncilMember) => void;
  activitiesCount?: number;
}

export const CouncilMemberCard: React.FC<CouncilMemberCardProps> = ({
  member,
  onSelect,
  activitiesCount = 0,
}) => {
  const isLeadership =
    member.title.includes("رئيس مجلس") ||
    member.title.includes("نائب رئيس") ||
    member.order === 1 ||
    member.order === 2;

  return (
    <div
      onClick={() => onSelect(member)}
      dir="rtl"
      className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all duration-300 cursor-pointer active:scale-[0.99] border ${
        isLeadership
          ? "bg-gradient-to-br from-white via-amber-50/20 to-emerald-50/20 dark:from-slate-850 dark:via-slate-800 dark:to-slate-850 border-amber-300/60 dark:border-amber-500/30 shadow-md hover:shadow-lg shadow-amber-900/5 hover:border-amber-400"
          : "bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50 shadow-xs hover:shadow-md"
      }`}
    >
      {/* Top Leadership Accent Ribbon */}
      {isLeadership && (
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-600 to-amber-500" />
      )}

      <div className="flex items-start gap-3.5 sm:gap-4">
        {/* Member Photo / Avatar */}
        <div className="relative shrink-0">
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 shadow-sm ${
              isLeadership
                ? "border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/20"
                : "border-slate-200 dark:border-slate-700"
            }`}
          >
            {member.photo ? (
              <img
                src={member.photo}
                alt={member.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-black text-xl">
                🏛️
              </div>
            )}
          </div>
          {/* Active status indicator */}
          <span className="absolute -bottom-1 -left-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
        </div>

        {/* Member Details */}
        <div className="flex-1 min-w-0">
          {/* Title / Role Badge */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                isLeadership
                  ? "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/50"
                  : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40"
              }`}
            >
              <Building2 size={11} />
              <span>{member.title}</span>
            </span>

            {member.electoralDistrict && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <MapPin size={10} />
                <span>{member.electoralDistrict}</span>
              </span>
            )}
          </div>

          {/* Member Name */}
          <h3 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
            {member.name}
          </h3>

          {/* Committee assignment */}
          {member.committee && (
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold truncate mt-0.5">
              {member.committee}
            </p>
          )}

          {/* Stats Badges: Completed Requests & Activities */}
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-black border border-emerald-200/50 dark:border-emerald-900/50">
              <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{member.completedRequestsCount.toLocaleString("ar-IQ")} طلباً منجزاً</span>
            </div>

            {activitiesCount > 0 && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200/40 dark:border-blue-900/40">
                <span>{activitiesCount} نشاطاً موثقاً</span>
              </div>
            )}
          </div>
        </div>

        {/* Left Arrow Icon */}
        <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/60 flex items-center justify-center shrink-0 transition-all self-center">
          <ChevronLeft size={16} />
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 truncate flex items-center gap-1">
          <span>المكتب:</span>
          <span className="text-slate-600 dark:text-slate-300 font-semibold">{member.officeLocation || "ديوان مجلس المحافظة - تكريت"}</span>
        </span>

        {/* Quick Contact Icons */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {member.whatsapp && (
            <a
              href={`https://wa.me/${member.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-transform active:scale-90"
              title="تواصل عبر واتساب"
            >
              <MessageCircle size={14} />
            </a>
          )}
          {member.phone && (
            <a
              href={`tel:${member.phone}`}
              className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/80 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-transform active:scale-90"
              title="اتصال هاتفي"
            >
              <Phone size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

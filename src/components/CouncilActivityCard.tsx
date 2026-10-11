import React, { useState } from "react";
import { Calendar, MapPin, Building2, Eye, Heart, Share2, Tag } from "lucide-react";
import { CouncilActivity } from "../types";

interface CouncilActivityCardProps {
  activity: CouncilActivity;
  onSelectMember?: (memberId: string) => void;
  onImageClick?: (imageUrl: string) => void;
  showMemberBadge?: boolean;
}

export const CouncilActivityCard: React.FC<CouncilActivityCardProps> = ({
  activity,
  onSelectMember,
  onImageClick,
  showMemberBadge = true,
}) => {
  const [likes, setLikes] = useState(activity.likesCount || 0);
  const [liked, setLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) {
      setLikes((prev) => Math.max(0, prev - 1));
      setLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setLiked(true);
    }
  };

  const images = (activity.images || []).filter(Boolean).slice(0, 4);

  return (
    <article
      dir="rtl"
      className="bg-white dark:bg-slate-850 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      {/* Activity Header: Category & Date */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {activity.category && (
            <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
              <Tag size={10} />
              <span>{activity.category}</span>
            </span>
          )}

          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
            <Calendar size={12} />
            <span>{activity.date}</span>
          </div>
        </div>

        {activity.location && (
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate max-w-[200px]">
            <MapPin size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">{activity.location}</span>
          </div>
        )}
      </div>

      {/* Linked Council Member Pill (if requested) */}
      {showMemberBadge && (activity.memberName || activity.memberRole) && (
        <div className="px-3.5 sm:px-4 pt-3">
          <div
            onClick={() => onSelectMember && onSelectMember(activity.memberId)}
            className="inline-flex items-center gap-2.5 p-1.5 pe-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-200/60 dark:border-slate-700/60 hover:border-emerald-300 transition-all cursor-pointer group"
          >
            {activity.memberPhoto ? (
              <img
                src={activity.memberPhoto}
                alt={activity.memberName || "عضو المجلس"}
                className="w-7 h-7 rounded-xl object-cover border border-emerald-500/30"
              />
            ) : (
              <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-black">
                <Building2 size={13} />
              </div>
            )}
            <div className="min-w-0 text-right">
              <span className="font-display font-black text-xs text-slate-800 dark:text-white block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {activity.memberName || "عضو مجلس المحافظة"}
              </span>
              {activity.memberRole && (
                <span className="text-[10px] text-slate-400 font-semibold block -mt-0.5">
                  {activity.memberRole}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Title & Description */}
      <div className="p-3.5 sm:p-4 space-y-2">
        <h4 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
          {activity.title}
        </h4>

        <p
          className={`text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans ${
            !isExpanded && activity.description.length > 180 ? "line-clamp-3" : ""
          }`}
        >
          {activity.description}
        </p>

        {activity.description.length > 180 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            {isExpanded ? "عرض أقل" : "قراءة المزيد..."}
          </button>
        )}
      </div>

      {/* Up to 4 Images Grid */}
      {images.length > 0 && (
        <div className="px-3.5 sm:px-4 pb-3">
          <div
            className={`grid gap-1.5 sm:gap-2 rounded-2xl overflow-hidden ${
              images.length === 1
                ? "grid-cols-1"
                : images.length === 2
                ? "grid-cols-2"
                : images.length === 3
                ? "grid-cols-2"
                : "grid-cols-2"
            }`}
          >
            {images.map((img, idx) => {
              const isHeroInThree = images.length === 3 && idx === 0;
              return (
                <div
                  key={idx}
                  onClick={() => onImageClick && onImageClick(img)}
                  className={`relative group/img overflow-hidden cursor-pointer bg-slate-100 dark:bg-slate-800 ${
                    images.length === 1
                      ? "h-56 sm:h-64"
                      : isHeroInThree
                      ? "col-span-2 h-44 sm:h-52"
                      : "h-32 sm:h-38"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${activity.title} - صورة ${idx + 1}`}
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Eye size={20} className="drop-shadow-md" />
                  </div>
                  {/* Image counter indicator */}
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                    {idx + 1} / {images.length}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Activity Footer Actions */}
      <div className="p-3 sm:px-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <button
          type="button"
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
            liked
              ? "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Heart size={14} className={liked ? "fill-rose-500 text-rose-500" : ""} />
          <span>{likes}</span>
          <span className="text-[10px] hidden sm:inline">تفاعل</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (navigator.share) {
              navigator
                .share({
                  title: activity.title,
                  text: activity.description,
                  url: window.location.href,
                })
                .catch(() => {});
            } else {
              navigator.clipboard?.writeText(
                `${activity.title}\n\n${activity.description}\n\n- مجلس محافظة صلاح الدين`
              );
              alert("تم نسخ تفاصيل النشاط بنجاح");
            }
          }}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          <Share2 size={14} />
          <span className="text-[11px]">مشاركة</span>
        </button>
      </div>
    </article>
  );
};

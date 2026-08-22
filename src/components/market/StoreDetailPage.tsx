import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Phone,
  Hospital,
  MapPin,
  Stethoscope,
  PhoneCall,
  CheckCircle,
  Sparkles,
  ShoppingBag,
  Utensils,
  Store,
} from "lucide-react";
import { MarketStore, MarketProduct, formatPriceDisplay } from "../../types";
import { firebaseService } from "../../services/firebaseService";
import ProductModal from "./ProductModal";

interface Props {
  store: MarketStore;
  onBack: () => void;
}

export default function StoreDetailPage({
  store,
  onBack,
}: Props) {
  const [itemsList, setItemsList] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<MarketProduct | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");

  // Manage Scroll to Top Button
  useEffect(() => {
    const scrollBtn = document.getElementById("scroll-to-top-btn");
    if (scrollBtn) {
      scrollBtn.style.marginBottom = "0px";
      scrollBtn.style.display = "flex";
    }
  }, []);

  // Scroll to top when opening a store/complex inline
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const isMedicalComplex =
    (store as any)._storeType === "complex" ||
    (store as any).isMedicalComplex === true ||
    store.category === "مجمع طبي" ||
    store.category === "مستشفى" ||
    store.category === "عيادات" ||
    (!store.category?.includes("مطاعم") &&
     !store.category?.includes("مطعم") &&
     !store.category?.includes("كافيه") &&
     !store.category?.includes("حلويات") &&
     !store.category?.includes("أسواق") &&
     ((store.name || "").includes("مجمع طبي") || (store.name || "").includes("مستشفى") || (store.name || "").includes("عيادات")));

  useEffect(() => {
    setLoadingItems(true);
    const complexPath = `medical_complexes/${store.id}/complex_doctors`;
    const marketPath = `market_stores/${store.id}/market_products`;

    const primaryPath = isMedicalComplex ? complexPath : marketPath;
    const fallbackPath = isMedicalComplex ? marketPath : complexPath;

    firebaseService.fetchCollectionOnce<any>(primaryPath)
      .then((items) => {
        if (items && items.length > 0) {
          setItemsList(items);
          setLoadingItems(false);
        } else {
          return firebaseService.fetchCollectionOnce<any>(fallbackPath)
            .then((fallbackItems) => {
              setItemsList(fallbackItems || []);
              setLoadingItems(false);
            });
        }
      })
      .catch((err) => {
        console.error("Error fetching store items:", err);
        setItemsList([]);
        setLoadingItems(false);
      });
  }, [store.id, isMedicalComplex]);

  // Categories extraction for restaurants/stores
  const categories = React.useMemo(() => {
    if (isMedicalComplex) return [];
    const set = new Set<string>();
    itemsList.forEach((item) => {
      const cat = item.menuCategory || item.category;
      if (cat && cat.trim()) set.add(cat.trim());
    });
    return ["الكل", ...Array.from(set)];
  }, [itemsList, isMedicalComplex]);

  const filteredItems = React.useMemo(() => {
    if (isMedicalComplex || selectedCategory === "الكل") return itemsList;
    return itemsList.filter(
      (item) => (item.menuCategory || item.category || "").trim() === selectedCategory.trim()
    );
  }, [itemsList, selectedCategory, isMedicalComplex]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 10 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full bg-[#FAFAFA] dark:bg-slate-950 text-[#1E293B] dark:text-slate-100 font-sans pb-28 text-right min-h-screen relative"
      dir="rtl"
    >
      {/* Clean Minimal Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between">
        <div className="w-10 h-10 shrink-0" />
        <span className="font-black text-sm text-slate-800 dark:text-slate-100 truncate flex-1 text-center px-4">
          {store.name}
        </span>
        <button
          onClick={onBack}
          className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-800 dark:text-slate-200 cursor-pointer transition-all active:scale-95 shrink-0"
          title="رجوع"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Cover Image Container */}
      <div className="px-3 sm:px-4 pt-3 sm:pt-4">
        <div className="w-full h-44 sm:h-52 rounded-3xl overflow-hidden relative bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800/60 shadow-sm shrink-0">
          {store.coverImage || store.logoImage ? (
            <img
              src={store.coverImage || store.logoImage}
              alt={store.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${
              isMedicalComplex
                ? "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700"
                : "bg-gradient-to-br from-amber-500 via-orange-600 to-red-600"
            } text-white relative`}>
              <div className="scale-150 opacity-20">
                {isMedicalComplex ? <Hospital size={64} /> : <Utensils size={64} />}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Details Section Below Cover */}
      <div className="mx-3 sm:mx-4 my-3 bg-white dark:bg-slate-800/90 rounded-3xl p-3.5 sm:p-4 border border-slate-100 dark:border-slate-800 shadow-sm text-right space-y-3" dir="rtl">
        {/* Location & Call Button in a single harmonious flex row */}
        {(store.location || store.phone) && (
          <div className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/40 p-2.5 sm:p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80">
            {store.location ? (
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 min-w-0 flex-1">
                <div className={`w-8 h-8 rounded-xl ${
                  isMedicalComplex
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                    : "bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400"
                } flex items-center justify-center shrink-0`}>
                  <MapPin size={16} />
                </div>
                <span className="truncate">{store.location}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                {isMedicalComplex ? <Hospital size={16} className="text-emerald-500" /> : <Store size={16} className="text-teal-500" />}
                <span>{isMedicalComplex ? "مجمع طبي" : "متجر / مطعم"}</span>
              </div>
            )}

            {store.phone && (
              <a
                href={`tel:${store.phone}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.navigator?.vibrate) window.navigator.vibrate(10);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 ${
                  isMedicalComplex
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-teal-600 hover:bg-teal-700"
                } text-white rounded-xl text-xs font-black shadow-xs hover:shadow-md transition-all active:scale-95 shrink-0 cursor-pointer`}
                title="اتصال مباشر"
              >
                <Phone size={13} />
                <span>اتصل</span>
              </a>
            )}
          </div>
        )}

        {store.description && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-slate-50/60 dark:bg-slate-900/20 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60 whitespace-pre-wrap">
            {store.description}
          </p>
        )}
      </div>

      {/* Main Content Section: Doctors (Medical Complex) OR Products/Menu (Restaurant/Store) */}
      <div className="px-3 sm:px-4 pb-20">
        {isMedicalComplex && (
          <div className="px-1 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm sm:text-base flex items-center gap-1.5">
              <Stethoscope size={18} className="text-emerald-500" />
              <span>الكوادر الطبية ({itemsList.length})</span>
            </h3>
          </div>
        )}

        {/* Category Filter Pills for Store/Restaurant */}
        {!isMedicalComplex && categories.length > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-3 mb-3 scrollbar-none py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-teal-600 text-white shadow-xs scale-102"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loadingItems ? (
          <div className="space-y-3.5">
            {[1, 2].map((i) => (
              <div key={i} className="w-full bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-4 flex gap-4 items-center border border-slate-100 dark:border-slate-800 animate-pulse">
                <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-1/3" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-1/2" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-2xs">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 text-slate-400 rounded-full flex items-center justify-center mb-3">
              {isMedicalComplex ? (
                <Stethoscope size={28} className="opacity-40" />
              ) : (
                <Utensils size={28} className="opacity-40" />
              )}
            </div>
            <p className="text-sm font-black text-slate-700 dark:text-slate-200">
              {isMedicalComplex ? "لا يوجد أطباء مسجلين حالياً" : "لا توجد عناصر مضافة للقائمة حالياً"}
            </p>
            <p className="text-xs text-slate-400 font-bold mt-1 leading-relaxed max-w-xs">
              {isMedicalComplex
                ? "سيتم إضافة وتحديث قائمة الأطباء والكوادر الطبية المتواجدة قريباً."
                : "سيتم إضافة وتحديث قائمة الوجبات والمنتجات الخاصة بهذا المتجر قريباً."}
            </p>
          </div>
        ) : isMedicalComplex ? (
          /* Doctors Grid for Medical Complexes */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredItems.map((doc) => {
              const bookingPhone = doc.reservationPhone || doc.phone || doc.phone1 || store.phone;
              const specialty = doc.specialty || doc.category || doc.subtitle;
              const doctorNote = doc.note || doc.notes || doc.roomNote;

              return (
                <div
                  key={doc.id}
                  className="bg-gradient-to-br from-emerald-50/90 via-teal-50/30 to-white dark:from-emerald-950/40 dark:via-slate-800/95 dark:to-slate-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border-2 border-emerald-200/80 dark:border-emerald-800/60 shadow-xs hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-500 transition-all text-right flex flex-col justify-between gap-3 relative overflow-hidden group"
                >
                  {/* Subtle top brand color accent line */}
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 opacity-90" />

                  {/* Top Section: Avatar (if present) + Name + Specialty + Description */}
                  <div className="flex items-start gap-3">
                    {/* Doctor Avatar - ONLY if image exists */}
                    {doc.image && (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 overflow-hidden flex items-center justify-center shrink-0 border-2 border-emerald-200/80 dark:border-emerald-800/80 relative shadow-2xs">
                        <img
                          src={doc.image}
                          alt={doc.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        {doc.isVerified && (
                          <span className="absolute bottom-1 left-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-slate-800">
                            <CheckCircle size={9} className="fill-current" />
                          </span>
                        )}
                      </div>
                    )}

                    {/* Name, Specialty and Description */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-black text-sm sm:text-base text-slate-800 dark:text-white leading-tight">
                        {doc.name}
                      </h4>

                      {specialty && (
                        <div className="mt-1">
                          <span className="inline-block px-2.5 py-0.5 bg-emerald-100/90 dark:bg-emerald-950/80 border border-emerald-300/70 dark:border-emerald-700/70 text-emerald-800 dark:text-emerald-200 rounded-lg text-xs font-black">
                            {specialty}
                          </span>
                        </div>
                      )}

                      {doc.description && (
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed mt-2 bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-emerald-100 dark:border-slate-800/80 whitespace-pre-wrap">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Section: Optional Note Field & Booking Phone */}
                  <div className="pt-2.5 border-t border-emerald-200/60 dark:border-slate-700/80 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {doctorNote ? (
                        <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-200 bg-white/90 dark:bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 text-xs font-bold truncate">
                          <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate text-[11px] sm:text-xs font-black">{doctorNote}</span>
                        </div>
                      ) : null}
                    </div>

                    {bookingPhone && (
                      <a
                        href={`tel:${bookingPhone.replace(/\D/g, '')}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.navigator?.vibrate) window.navigator.vibrate(10);
                        }}
                        className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
                        title="اتصال للحجز"
                      >
                        <PhoneCall size={13} />
                        <span>اتصل للحجز</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Products Grid for Restaurants & Market Stores - Coordinated 3-Column Grid */
          <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
            {filteredItems.map((prod: any) => {
              const prodImage = (prod.images && prod.images[0]) || prod.image;
              return (
                <div
                  key={prod.id}
                  className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 flex flex-col justify-between text-right overflow-hidden shadow-2xs"
                >
                  <div>
                    {/* Product Image */}
                    <div className="w-full aspect-square rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900/80 overflow-hidden mb-1.5 sm:mb-2 border border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
                      {prodImage ? (
                        <img
                          src={prodImage}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Utensils size={20} className="text-teal-500/80 dark:text-teal-400/80" />
                      )}
                    </div>

                    {/* Product Title */}
                    <h4 className="font-display font-black text-[11px] sm:text-xs md:text-sm text-slate-800 dark:text-white line-clamp-1 leading-tight">
                      {prod.name}
                    </h4>

                    {/* Description (Optional) */}
                    {prod.description && (
                      <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-medium line-clamp-1 mt-0.5">
                        {prod.description}
                      </p>
                    )}
                  </div>

                  {/* Price Badge */}
                  <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-right">
                    <span className="text-[10px] sm:text-xs font-black text-teal-600 dark:text-teal-400 truncate">
                      {formatPriceDisplay(prod.price)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Modal for Food Dishes / Market Products */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            store={store}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

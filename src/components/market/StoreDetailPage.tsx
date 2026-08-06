import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Package,
  Share2,
  QrCode,
  Copy,
  Check,
  Trash2,
  MapPin,
} from "lucide-react";
import { MarketStore, MarketProduct } from "../../types";
import { firebaseService } from "../../services/firebaseService";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import { calculateExpiryTimestamp } from "../../utils/date";
import { playSuccessSound } from "../../utils/audio";

interface Props {
  store: MarketStore;
  onBack: () => void;
  onProductClick?: (product: MarketProduct) => void;
  activeOrders: any[];
  onOrderSubmitted?: () => void;
}

export default function StoreDetailPage({
  store,
  onBack,
  onProductClick,
  activeOrders,
  onOrderSubmitted,
}: Props) {
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const storeOrders = useMemo(() => {
    return (activeOrders || []).filter((o) => o.storeId === store.id);
  }, [activeOrders, store.id]);
  const [selectedProduct, setSelectedProduct] = useState<MarketProduct | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"all" | "offers">("all");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [custName, setCustName] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    percentage: number;
  } | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [selectedMenuCategory, setSelectedMenuCategory] =
    useState<string>("الكل");
  // Soft warning logic for phone numbers checking (Iraqi phones format)
  const phoneWarning = useMemo(() => {
    if (!custPhone.trim()) return "";
    if (/[a-zA-Z\u0600-\u06FF]/.test(custPhone)) {
      return "⚠️ تنبيه: الرقم يحتوي على حروف أو مدخلات غير صحيحة.";
    }
    const digits = custPhone.replace(/\D/g, "");
    if (digits.length > 0 && digits.length < 11) {
      return `⚠️ تنبيه: يبدو أن الرقم ناقص أو ناقص خانات (${digits.length} أرقام من أصل 11).`;
    }
    if (digits.length > 11) {
      return `⚠️ تنبيه: يرجى التأكد من الرقم (أدخلت ${digits.length} أرقام والمطلوب 11).`;
    }
    return "";
  }, [custPhone]);

  // Manage Scroll to Top Button Conflict (including Address / Delivery Info Modal)
  useEffect(() => {
    const scrollBtn = document.getElementById("scroll-to-top-btn");
    const totalItems = Object.values(cart).reduce((sum, q) => sum + q, 0);
    if (scrollBtn) {
      if (totalItems > 0 || showAddressModal) {
        scrollBtn.style.display = "none";
      } else {
        scrollBtn.style.marginBottom = "0px";
        scrollBtn.style.display = "flex";
      }
    }
    return () => {
      if (scrollBtn) {
        scrollBtn.style.marginBottom = "0px";
        scrollBtn.style.display = "flex";
      }
    };
  }, [cart, showAddressModal]);

  // Load last delivery details automatically
  useEffect(() => {
    const cachedName = localStorage.getItem("cust_name") || "";
    const cachedAddress = localStorage.getItem("cust_address") || "";
    const cachedPhone = localStorage.getItem("cust_phone") || "";
    if (cachedName) setCustName(cachedName);
    if (cachedAddress) setCustAddress(cachedAddress);
    if (cachedPhone) setCustPhone(cachedPhone);
  }, []);

  // No body scroll lock to allow natural page scrolling when rendered inline as a fixed page
  useEffect(() => {
    // Scroll to top when opening a store inline
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    // Subscribe to market_products subcollection
    const unsub = firebaseService.subscribeToCollection<MarketProduct>(
      `market_stores/${store.id}/market_products`,
      (fetchedProducts) => {
        const now = Date.now();
        const validProducts = fetchedProducts.filter((p) => {
          if (!p.isTemporary) return true;
          const expiry = calculateExpiryTimestamp(p);
          return expiry > now;
        });
        setProducts(validProducts);
        // Auto-sync productCount anomaly if admin forgot
        if (
          store.id &&
          store.id !== "general" &&
          validProducts.length !== store.productCount
        ) {
          firebaseService
            .updateDocument("market_stores", store.id, {
              productCount: validProducts.length,
            })
            .catch(() => {});
        }
      },
    );
    return () => unsub();
  }, [store.id, store.productCount]);

  const normalizeIraqiPhone = (rawPhone: string) => {
    let cleaned = rawPhone.replace(/\D/g, "");

    // If it starts with 00964, replace with 964
    if (cleaned.startsWith("00964")) {
      cleaned = cleaned.substring(2);
    }

    // If it starts with 07, remove the leading 0 and prepend 964
    if (cleaned.startsWith("07")) {
      cleaned = "964" + cleaned.substring(1);
    }

    // If it starts with 7 and has length 9, prepend 964
    if (cleaned.startsWith("7") && cleaned.length === 9) {
      cleaned = "964" + cleaned;
    }

    return cleaned;
  };

  const handleWhatsapp = (msg: string) => {
    if (store.whatsapp) {
      const phone = normalizeIraqiPhone(store.whatsapp);
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
        "_blank",
      );
    }
  };

  const isRestaurant =
    store.isRestaurant ||
    store.category === "مطعم" ||
    store.category === "مطاعم";
  const isCarShowroom =
    store.isCarShowroom ||
    store.category === "معرض سيارات" ||
    store.category === "معارض سيارات";

  const cartItems = useMemo(() => {
    return products
      .map((p) => ({
        product: p,
        quantity: cart[p.id] || 0,
      }))
      .filter((item) => item.quantity > 0);
  }, [products, cart]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
  }, [cartItems]);

  const discountAmount = appliedDiscount
    ? (cartTotal * appliedDiscount.percentage) / 100
    : 0;
  const finalTotal = cartTotal - discountAmount;

  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      const newCart = { ...prev };
      if (next === 0) {
        delete newCart[productId];
      } else {
        newCart[productId] = next;
      }
      return newCart;
    });
    if (window.navigator?.vibrate) window.navigator.vibrate(10);
  };

  const sendWhatsAppOrder = () => {
    if (cartItems.length === 0) return;
    setShowAddressModal(true);
  };

  const handleConfirmOrder = async () => {
    if (!custAddress.trim()) {
      alert("الرجاء إدخال العنوان لتوصيل الطلب بشكل صحيح.");
      return;
    }

    // Save locally
    localStorage.setItem("cust_name", custName.trim());
    localStorage.setItem("cust_address", custAddress.trim());
    localStorage.setItem("cust_phone", custPhone.trim());

    // Generate/retrieve client device UUID for multi-device independent status tracking
    let deviceId = localStorage.getItem("shirqat_device_id");
    if (!deviceId) {
      deviceId =
        "cl_" +
        Math.random().toString(36).substring(2, 9) +
        Date.now().toString(36);
      localStorage.setItem("shirqat_device_id", deviceId);
    }

    // Sound effect
    playSuccessSound();

    // Prepare Firestore order document
    try {
      const orderItems = cartItems.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const orderPayload = {
        clientId: deviceId,
        clientName: custName.trim() || "زبون دليل الشرقاط",
        clientPhone: custPhone.trim() || "",
        clientAddress: custAddress.trim(),
        storeId: store.id,
        storeName: store.name,
        items: orderItems,
        totalPrice: cartTotal,
        finalPrice: finalTotal,
        status: "pending", // 'pending' | 'accepted' | 'completed' | 'cancelled'
        discountApplied: appliedDiscount
          ? {
              code: appliedDiscount.code,
              percentage: appliedDiscount.percentage,
            }
          : null,
      };

      await firebaseService.addDocument("restaurant_orders", orderPayload);
    } catch (firebaseError) {
      console.error("Failed to sync order to Firestore: ", firebaseError);
    }

    let msg = `*طلب جديد من تطبيق دليل الشرقاط* 📝\n`;
    msg += `*المطلب:* ${store.name}\n`;
    msg += `--------------------------------\n`;

    msg += `👤 *الزبون:* ${custName.trim() || "زبون دليل الشرقاط"}\n`;
    msg += `📍 *العنوان لمندوب التوصيل:* ${custAddress.trim()}\n`;
    if (custPhone.trim()) {
      msg += `📞 *رقم الهاتف:* ${custPhone.trim()}\n`;
    }
    msg += `--------------------------------\n\n`;

    msg += `*🛒 قائمة المواد المطلوبة (المنتج - الكمية - السعر):*\n`;
    // Items structured as [الوجبة - الكمية - السعر]
    cartItems.forEach((item, index) => {
      const lineTotal = item.product.price * item.quantity;
      msg += `🔹 *${item.product.name}* - العدد: [ *${item.quantity}* ] - السعر: [ *${lineTotal.toLocaleString()} د.ع* ]\n`;
    });
    msg += `\n`;

    msg += `--------------------------------\n`;
    if (appliedDiscount) {
      msg += `المجموع قبل الخصم: ${cartTotal.toLocaleString()} د.ع\n`;
      msg += `كود الخصم المستخدم: *${appliedDiscount.code}* (خصم ${appliedDiscount.percentage}%)\n`;
      msg += `قيمة الخصم: -${discountAmount.toLocaleString()} د.ع\n\n`;
    }
    msg += `*السعر الإجمالي الكلي:* *${finalTotal.toLocaleString()} د.ع* 💰\n\n`;
    msg += `يرجى تأكيد الاستلام وتجهيز الطلب للتوصيل 🛵`;

    handleWhatsapp(msg);
    setCart({}); // Empty the cart on successful completion
    setShowAddressModal(false);
    if (onOrderSubmitted) onOrderSubmitted();
  };

  const filteredProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const aTime = (a.createdAt as any)?.toMillis
        ? (a.createdAt as any).toMillis()
        : Number(a.createdAt || 0);
      const bTime = (b.createdAt as any)?.toMillis
        ? (b.createdAt as any).toMillis()
        : Number(b.createdAt || 0);
      return bTime - aTime;
    });
  }, [products]);

  const restaurantCategories = useMemo(() => {
    const catsSet = new Set<string>();

    // 1. Add categories configured on the store
    if (store.menuCategories && Array.isArray(store.menuCategories)) {
      store.menuCategories.forEach((cat) => {
        if (cat && cat.trim()) catsSet.add(cat.trim());
      });
    }

    // 2. Add categories found in existing products
    products.forEach((p) => {
      if (p.menuCategory && p.menuCategory.trim()) {
        catsSet.add(p.menuCategory.trim());
      }
    });

    return ["الكل", ...Array.from(catsSet)];
  }, [store.menuCategories, products]);

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
        <div className="w-10 h-10 shrink-0" /> {/* Spacer for centering title on right side of RTL layout */}
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

      {/* Store Cover Image Banner (for Restaurants) */}
      {isRestaurant && (store.coverImage || store.logoImage) && (
        <div className="w-full h-36 sm:h-44 relative overflow-hidden bg-slate-100 dark:bg-slate-900">
          <img
            src={store.coverImage || store.logoImage}
            alt={store.name}
            className="w-full h-full object-cover filter brightness-[0.82] contrast-[1.05]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
        </div>
      )}

      {/* Store Profile Card (Premium Compact Horizontal Layout with overlap if banner exists) */}
      <div className={`px-4 pb-4 pt-5 mb-4 bg-white dark:bg-slate-900 mx-3 sm:mx-4 relative z-10 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-slate-100/70 dark:border-slate-800 text-right ${isRestaurant && (store.coverImage || store.logoImage) ? "mt-[-28px]" : "mt-4"}`}>
        <div className="flex items-start gap-4">
          {/* Logo Frame */}
          {!isRestaurant && (
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl p-0.5 shadow-md shadow-slate-100 dark:shadow-none overflow-hidden relative border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
              {store.logoImage ? (
                <img
                  src={store.logoImage}
                  alt={store.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-orange-50 dark:bg-orange-950/20 rounded-xl flex items-center justify-center">
                  <Package size={26} className="text-orange-400" />
                </div>
              )}

              {/* Status dot indicator */}
              <span
                className={`absolute bottom-0.5 left-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${store.isActive ? "bg-emerald-500" : "bg-rose-500"}`}
              />
            </div>
          )}

          {/* Info Side */}
          <div className="flex-1 min-w-0">
            {isRestaurant ? null : (
              /* Standard Badge Row for Other Stores */
              <div className="flex flex-wrap items-center gap-1.5">
                {store.category && store.category !== "مطاعم" && store.category !== "مطعم" && (
                  <span className="text-[9px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md">
                    {store.category}{" "}
                    {store.isCarShowroom &&
                      store.category !== "معرض سيارات" &&
                      "• معرض سيارات"}
                  </span>
                )}
              </div>
            )}

            {!isRestaurant && (
              <h1 className="text-lg font-black text-slate-800 dark:text-white leading-tight mt-1 truncate">
                {store.name}
              </h1>
            )}

            {store.description ? (
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-relaxed mt-1 line-clamp-1">
                {store.description}
              </p>
            ) : (
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-relaxed mt-1">
                {isRestaurant ? "تصفح قائمة وأطباق المطعم المفضلة واطلب الآن" : "تصفح القائمة والمنتجات المتاحة واطلب الآن"}
              </p>
            )}

            {/* العنوان وزر الاتصال */}
            {isRestaurant ? (
              <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-50 dark:border-slate-800/40 w-full">
                {/* Right side: Location (العنوان) */}
                <div className="flex-1 flex justify-start min-w-0">
                  {store.location && (
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[10px] font-black bg-slate-100/55 dark:bg-slate-800/60 px-2 py-0.5 rounded-md truncate max-w-full">
                      <MapPin size={10} className="text-shirqat-primary shrink-0" />
                      <span className="truncate">{store.location}</span>
                    </div>
                  )}
                </div>

                {/* Left side: Call Button */}
                <div className="flex-1 flex justify-end shrink-0">
                  {store.phone && (
                    <a
                      href={`tel:${store.phone}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.navigator?.vibrate) window.navigator.vibrate(10);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/30 dark:hover:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-lg text-[10px] font-black transition-all active:scale-[0.95] shrink-0 border border-cyan-100/10 shadow-sm"
                      title="اتصال تلفوني"
                    >
                      <Phone size={10} />
                      <span>اتصال</span>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 mt-2 w-full">
                {store.location && (
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10.5px] font-black bg-slate-100/55 dark:bg-slate-800/60 px-2 py-0.5 rounded-md truncate max-w-[70%]">
                    <MapPin size={11} className="text-shirqat-primary shrink-0" />
                    <span className="truncate">{store.location}</span>
                  </div>
                )}
                {store.phone && (
                  <a
                    href={`tel:${store.phone}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.navigator?.vibrate) window.navigator.vibrate(10);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/30 dark:hover:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-lg text-[10.5px] font-black transition-all active:scale-[0.95] shrink-0 border border-cyan-100/10 shadow-sm"
                    title="اتصال تلفوني"
                  >
                    <Phone size={11} />
                    <span>اتصال</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isRestaurant ? (
        (() => {
          const offersList = filteredProducts.filter(
            (p) => p.productType === "offer",
          );
          const menuList = filteredProducts.filter(
            (p) => p.productType !== "offer",
          );
          const displayedMenuList = menuList.filter((p) => {
            if (selectedMenuCategory === "الكل") return true;
            return (
              (p.menuCategory || "").trim() === selectedMenuCategory.trim()
            );
          });

          return (
            <div className="px-4 space-y-4 pb-44">
              {/* ── Offers Section (Prominent) ── */}
              {offersList.length > 0 && (
                <div className="mb-6 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 rounded-3xl p-3 pb-4">
                  <div className="flex items-center gap-2 mb-3 px-2">
                    <span className="text-xl">🔥</span>
                    <h2 className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      عروض المطعم الخاصة
                    </h2>
                  </div>
                  <div className="flex flex-col gap-3">
                    {offersList.map((product) => {
                      const quantity = cart[product.id] || 0;

                      const getRemainingTimeText = () => {
                        if (!product.isTemporary) return null;

                        const expiry = calculateExpiryTimestamp(product);
                        const diff = expiry - Date.now();
                        if (isNaN(diff)) return "جاري التحساب...";
                        if (diff <= 0) return "منتهي";

                        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                        const hours = Math.floor(
                          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
                        );
                        const mins = Math.floor(
                          (diff % (1000 * 60 * 60)) / (1000 * 60),
                        );

                        if (days > 0) return `متبقي ${days} يوم و${hours} س`;
                        if (hours > 0) return `متبقي ${hours} س و${mins} د`;
                        return `متبقي ${mins} دقيقة`;
                      };

                      const remainingTimeText = getRemainingTimeText();

                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex bg-white rounded-2xl p-3 gap-3 items-center shadow-sm relative border border-emerald-100/40"
                        >
                          {remainingTimeText && (
                            <div className="absolute top-0 right-0 bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-bl-lg rounded-tr-lg shadow-sm z-10 flex items-center gap-1">
                              <span className="animate-pulse">⏳</span>
                              <span>{remainingTimeText}</span>
                            </div>
                          )}
                          <div className="relative mt-2">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-16 h-16 rounded-xl object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                                <Package className="text-emerald-400" size={24} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 text-right mt-2">
                            <h4 className="font-extrabold text-slate-800 text-sm truncate">
                              {product.name}
                            </h4>
                            {product.description && (
                              <p className="text-slate-500 text-[10px] mt-0.5 line-clamp-1 font-bold">
                                {product.description}
                              </p>
                            )}
                            <p className="text-emerald-600 dark:text-emerald-400 font-black text-sm mt-1">
                              {(Number(product.price) || 0).toLocaleString()}{" "}
                              د.ع
                            </p>
                          </div>

                          {/* Quantity selectors */}
                          <div
                            className="flex items-center gap-2 shrink-0 select-none"
                            dir="ltr"
                          >
                            {quantity > 0 ? (
                              <div className="flex items-center bg-emerald-50 text-emerald-600 rounded-xl overflow-hidden p-0.5 border border-emerald-200">
                                <button
                                  onClick={() => updateQuantity(product.id, -1)}
                                  className="w-7 h-7 flex items-center justify-center font-black active:scale-90 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center text-xs font-black">
                                  {quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(product.id, 1)}
                                  className="w-7 h-7 flex items-center justify-center font-black active:scale-90 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => updateQuantity(product.id, 1)}
                                className="bg-emerald-500 text-white font-black text-[11px] px-3 py-1.5 rounded-lg active:scale-95 shadow-sm shadow-emerald-500/20"
                              >
                                إضافة
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Category Navigation Bar ── */}
              {restaurantCategories.length > 1 && (
                <div
                  className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-100 p-2 flex gap-2 overflow-x-auto shadow-sm sticky top-[72px] z-[50] no-scrollbar mb-2"
                  dir="rtl"
                >
                  {restaurantCategories.map((cat, idx) => {
                    const isActive = selectedMenuCategory === cat;
                    const catCount =
                      cat === "الكل"
                        ? menuList.length
                        : menuList.filter((p) => p.menuCategory === cat).length;

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedMenuCategory(cat);
                          if (window.navigator?.vibrate)
                            window.navigator.vibrate(5);
                        }}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all select-none flex items-center gap-1.5 cursor-pointer ${
                          isActive
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/15 scale-[1.02]"
                            : "bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-100 hover:bg-slate-100"
                        }`}
                      >
                        <span>{cat === "الكل" ? "الكل" : cat}</span>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-200/85 text-slate-600"
                          }`}
                        >
                          {catCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── Regular Menu Section ── */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
                <h2 className="font-black text-slate-800 text-sm truncate">
                  قائمة Menu{" "}
                  {selectedMenuCategory !== "الكل"
                    ? `• قسم ${selectedMenuCategory}`
                    : ""}
                </h2>
                <div className="flex items-center gap-2 shrink-0">
                  {store.discountCodes &&
                    store.discountCodes.filter((c) => c.isActive).length > 0 && (
                      <div className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 bg-cyan-500/5 px-2.5 py-1 rounded-full border border-cyan-500/10 flex items-center gap-1 shrink-0">
                        <span className="text-xs">🎉</span>
                        <span>كود الخصم: <span className="font-extrabold underline">{store.discountCodes.filter((c) => c.isActive)[0].code}</span></span>
                      </div>
                    )}
                  <span className="text-[11px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">
                    {displayedMenuList.length} صنف
                  </span>
                </div>
              </div>

              {displayedMenuList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-3xl border border-slate-100 w-full">
                  <Package size={44} className="mb-3 text-slate-300" />
                  <h3 className="text-sm font-bold text-slate-400">
                    لا توجد عناصر في هذا القسم حالياً
                  </h3>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {displayedMenuList.map((product) => {
                    const quantity = cart[product.id] || 0;
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex bg-white rounded-xl border border-slate-100 p-2 gap-2.5 items-center shadow-sm relative transition-all hover:border-emerald-200"
                      >
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-14 h-14 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                            <Package className="text-emerald-400/70" size={20} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 text-right">
                          <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm truncate">
                            {product.name}
                          </h4>
                          {product.description && (
                            <p className="text-slate-400 text-[10px] mt-0.5 line-clamp-1 leading-relaxed font-bold">
                              {product.description}
                            </p>
                          )}
                          <p className="text-emerald-600 font-extrabold text-xs mt-0.5">
                            {(Number(product.price) || 0).toLocaleString()} د.ع
                          </p>
                        </div>

                        {/* Quantity selectors */}
                        <div
                          className="flex items-center gap-1.5 shrink-0 select-none"
                          dir="ltr"
                        >
                          {quantity > 0 ? (
                            <div className="flex items-center bg-emerald-500/10 text-emerald-600 rounded-lg overflow-hidden p-0.5 border border-emerald-500/15">
                              <button
                                onClick={() => updateQuantity(product.id, -1)}
                                className="w-7 h-7 flex items-center justify-center font-black active:scale-90 hover:bg-emerald-500/10 rounded-md"
                              >
                                -
                              </button>
                              <span className="w-5 text-center text-[11px] font-black">
                                {quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(product.id, 1)}
                                className="w-7 h-7 flex items-center justify-center font-black active:scale-90 hover:bg-emerald-500/10 rounded-md"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => updateQuantity(product.id, 1)}
                              className="bg-emerald-500 text-white font-black text-[10px] px-3 py-1.5 rounded-lg shadow-sm shadow-emerald-500/10 active:scale-95"
                            >
                              إضافة
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Floating Checkout Button */}
              <AnimatePresence>
                {cartCount > 0 && !showAddressModal && (
                  <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto sm:w-full sm:max-w-md z-[6000] shadow-2xl pointer-events-auto"
                  >
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => {
                          if (window.navigator?.vibrate) window.navigator.vibrate([10, 10]);
                          setCart({});
                        }}
                        className="bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 rounded-2xl px-4 py-4 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all font-bold text-xs shrink-0 cursor-pointer shadow-xs select-none"
                        title="إلغاء وتصفير الطلب"
                      >
                        <Trash2 size={16} />
                        <span>إلغاء</span>
                      </button>
                      <button
                        onClick={() => setShowAddressModal(true)}
                        className="flex-1 bg-slate-900 hover:bg-slate-850 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-white rounded-2xl p-4 shadow-xl border border-slate-750 dark:border-emerald-800/50 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6.5 h-6.5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-[11px] leading-none shrink-0">
                            {cartCount}
                          </span>
                          <span className="font-extrabold text-xs sm:text-sm">
                            إكمال الطلب
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-sans">
                          <span className="font-black text-emerald-400 text-xs sm:text-sm">
                            {cartTotal.toLocaleString()} د.ع
                          </span>
                          <ChevronLeft size={16} className="text-slate-400" />
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })()
      ) : (
        <>
          {/* Section Title */}
          <div className="px-5 mb-4 border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 text-sm">
              كل المعروضات 📦
            </h3>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
              {filteredProducts.length} عنصر
            </span>
          </div>

          {/* Products Grid */}
          <div className="px-4">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package size={48} className="mb-4 text-slate-300" />
                <h3 className="text-lg font-bold text-slate-400">
                  لا توجد منتجات حالياً
                </h3>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 },
                  },
                }}
                className="grid grid-cols-3 gap-2"
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    store={store}
                    onClick={() => {
                      setSelectedProduct(product);
                    }}
                    hideStoreBadge={true}
                    isThreeColumn={true}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </>
      )}

      {/* Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            store={store}
            activeOrders={activeOrders}
            onClose={() => setSelectedProduct(null)}
            onVisitStore={() => onProductClick?.(selectedProduct)}
          />
        )}
      </AnimatePresence>

      {/* Address & Customer details Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddressModal(false)}
              className="fixed inset-0 bg-slate-900/60 z-[200] backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 rounded-t-[2.5rem] z-[210] p-6 pb-[calc(6rem+env(safe-area-inset-bottom))] shadow-2xl border-t border-slate-100 dark:border-slate-800 max-h-[85vh] overflow-y-auto"
              dir="rtl"
            >
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

              <div className="text-right mb-5 flex justify-between items-end">
                <div>
                  <h3 className="font-black text-slate-800 text-lg">
                    إكمال الطلب 📦
                  </h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">
                    الرجاء مراجعة طلبك وإدخال بيانات التوصيل
                  </p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-5 text-right">
                <h4 className="font-black text-sm text-slate-800 mb-3">
                  ملخص الطلب:
                </h4>
                <div className="space-y-3 mb-4 max-h-[160px] overflow-y-auto no-scrollbar pb-2">
                  {cartItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-xs font-bold border-b border-slate-200/60 pb-2 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-orange-500 font-black">
                          {item.quantity}
                        </span>
                        <span className="text-slate-600 truncate max-w-[150px]">
                          {item.product.name}
                        </span>
                      </div>
                      <span className="text-slate-800">
                        {(item.product.price * item.quantity).toLocaleString()}{" "}
                        د.ع
                      </span>
                    </div>
                  ))}
                </div>

                {/* Discount Code Input Area at the top */}
                {store.discountCodes && store.discountCodes.length > 0 && (
                  <div className="flex flex-col gap-2 pt-3 border-t border-slate-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="أدخل كود الخصم"
                        value={discountCode}
                        onChange={(e) => {
                          setDiscountCode(e.target.value.toUpperCase());
                          setDiscountError("");
                        }}
                        className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-bold text-xs transition-all text-right uppercase placeholder-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setDiscountError("");
                          if (!discountCode.trim()) return;
                          const validCode = store.discountCodes?.find(
                            (c) =>
                              c.code === discountCode.trim().toUpperCase() &&
                              c.isActive,
                          );
                          if (validCode) {
                            setAppliedDiscount({
                              code: validCode.code,
                              percentage: validCode.discountPercentage || 0,
                            });
                          } else {
                            setDiscountError("كود الخصم خاطئ ❌");
                            setAppliedDiscount(null);
                          }
                        }}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-black text-xs px-4 py-2 rounded-xl active:scale-95 transition-all shrink-0"
                      >
                        تطبيق
                      </button>
                    </div>
                    {appliedDiscount && (
                      <div className="flex flex-col gap-1.5 text-emerald-600 font-bold text-[10px] bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 text-right animate-fade-in shadow-sm w-full">
                        <div className="flex items-center justify-between">
                           <span>✨ تم تفعيل كود الخصم كود ({appliedDiscount.code}) بنجاح!</span>
                           <span className="font-black bg-emerald-100 px-2 py-0.5 rounded-lg text-emerald-700">خصم {appliedDiscount.percentage}%</span>
                        </div>
                        <div className="text-emerald-500 text-[9px] font-extrabold">وفرت {discountAmount.toLocaleString()} د.ع من إجمالي الطلب</div>
                      </div>
                    )}
                    {discountError && (
                      <div className="text-rose-500 font-bold text-[10px] bg-rose-50 p-2 rounded-lg border border-rose-100 text-right animate-fade-in animate-shake">
                        {discountError}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                  <span className="font-extrabold text-slate-800 text-sm">
                    المجموع الكلي:
                  </span>
                  <div className="text-left">
                    {appliedDiscount && (
                      <span className="block text-[10px] text-slate-400 line-through mb-0.5">
                        {cartTotal.toLocaleString()}
                      </span>
                    )}
                    <span className="font-black text-emerald-500 text-lg">
                      {finalTotal.toLocaleString()} د.ع
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Address Field */}
                <div className="text-right">
                  <label className="block text-xs font-black text-slate-600 mb-2">
                    العنوان بالتفصيل (مطلوب) 📍
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: الشرقاط، حي الجوسق، قرب مدرسة التحرير"
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-sm transition-all"
                  />
                </div>

                {/* Name Field */}
                <div className="text-right">
                  <label className="block text-xs font-black text-slate-600 mb-2">
                    الاسم الكريم (اختياري) 👤
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: أحمد علي"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-sm transition-all"
                  />
                </div>

                {/* Phone Field */}
                <div className="text-right">
                  <label className="block text-xs font-black text-slate-600 mb-2">
                    رقم الهاتف للتواصل (اختياري) 📞
                  </label>
                  <input
                    type="tel"
                    placeholder="مثال: 07740100909"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-sm transition-all text-right"
                  />
                  {phoneWarning && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-emerald-600 font-bold text-[10px] sm:text-xs mt-2 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 text-right"
                    >
                      {phoneWarning}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-6 mb-6">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="bg-slate-100 text-slate-500 font-black text-sm py-4 rounded-2xl active:scale-95 transition-all text-center"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  className="bg-emerald-500 text-white font-black text-xs py-4 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 hover:bg-emerald-600"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-[16px] h-[16px]"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                  </svg>
                  <span>إرسال الطلب عبر الواتساب</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Share & QR Code Modal */}
      <AnimatePresence>
        {showShareModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="fixed inset-0 bg-slate-900/60 z-[200] backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] z-[210] p-6 pb-12 shadow-2xl border-t border-slate-100 max-h-[85vh] overflow-y-auto flex flex-col items-center text-center"
              dir="rtl"
            >
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

              <div className="text-right w-full mb-4">
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                  <QrCode size={20} className="text-orange-500" />
                  <span>مشاركة وتفاصيل الـ QR للمحل</span>
                </h3>
                <p className="text-xs text-slate-400 font-bold mt-1">
                  شارك المحل أو انسخ الرابط لمشاركة المنيو والمنتجات لزبائنك
                </p>
              </div>

              {/* QR Code Presentation Box */}
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center relative w-full max-w-xs my-3 select-none">
                <div className="relative bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
                  <svg
                    className="w-44 h-44 text-slate-800"
                    viewBox="0 0 100 100"
                    fill="currentColor"
                  >
                    <rect
                      x="5"
                      y="5"
                      width="25"
                      height="25"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <rect x="11" y="11" width="13" height="13" />

                    <rect
                      x="70"
                      y="5"
                      width="25"
                      height="25"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <rect x="76" y="11" width="13" height="13" />

                    <rect
                      x="5"
                      y="70"
                      width="25"
                      height="25"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <rect x="11" y="76" width="13" height="13" />

                    <rect
                      x="40"
                      y="40"
                      width="20"
                      height="20"
                      rx="4"
                      fill="#f97316"
                    />
                    <text
                      x="50"
                      y="52"
                      fill="white"
                      fontSize="6"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      الشرقاط
                    </text>

                    <path
                      d="M40,5h5v5h-5V5z M50,5h5v5h-5V5z M60,5h5v5h-5V5z M45,15h5v5h-5V15z M55,15h5v5h-5V15z 
                             M5,40h5v5H5V40z M5,50h5v5H5V50z M5,60h5v5H5V60z M15,45h5v5h-5V45z M15,55h5v5h-5V55z
                             M40,70h5v5h-5V70z M50,70h5v5h-5V70z M60,70h5v5h-5V70z M45,80h5v5h-5V80z M55,80h5v5h-5V80z
                             M40,30h5v5h-5V30z M50,30h5v5h-5V30z M30,40h5v5h-5V40z M30,50h5v5h-5V50z"
                    />
                    <path
                      d="M70,40h5v5h-5V40z M80,45h5v5h-5V45z M75,55h5v5h-5V55z M85,60h5v5h-5V60z
                             M70,70h5v5h-5V70z M85,75h5v5h-5V75z M80,85h5v5h-5V85z M75,80h10v5h-10V80z"
                    />
                  </svg>
                </div>
                <span className="text-[10px] font-black text-slate-400 mt-3 uppercase tracking-wider">
                  امسح الباركود للوصول للمحل فورا 📲
                </span>
              </div>

              {/* Direct shareable URL display */}
              <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center justify-between gap-2.5 mt-2">
                <span className="text-[11px] font-mono text-slate-500 select-all truncate text-left flex-1 pl-1">
                  {`${window.location.origin}/?store=${store.id}`}
                </span>
                <button
                  onClick={() => {
                    const storeUrl = `${window.location.origin}/?store=${store.id}`;
                    const shareText = `تصفح منيو وأصناف متجر (${store.name}) على تطبيق دليل الشرقاط الرسمي وقدم طلبك فوراً 📋🍕\n${storeUrl}`;
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(shareText);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                      if (window.navigator?.vibrate)
                        window.navigator.vibrate(10);
                    }
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-2 px-4 rounded-xl active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check size={12} />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>نسخ الرابط</span>
                    </>
                  )}
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="w-full bg-slate-100 text-slate-500 font-black text-sm py-3.5 rounded-2xl active:scale-95 transition-all text-center mt-5"
              >
                إغلاق النافذة
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

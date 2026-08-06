import React, { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  LayoutDashboard,
  Bell,
  Settings,
  Stethoscope,
  Car,
  Scale,
  Hammer,
  ImageIcon,
  ChevronRight,
  Plus,
  X,
  Calendar,
  Settings as SettingsIcon,
  Trash2,
  Edit,
  CheckCircle,
  EyeOff,
  Database,
  Download,
  CheckCircle2,
  ChevronDown,
  Camera,
  Upload,
  List,
  Tag,
  AlertTriangle,
  Info,
  Zap,
  FileOutput,
  FileInput,
  Building2,
  Building,
  Droplet,
  Users,
  UserPlus,
  PhoneCall,
  Search,
  HeartPulse,
  Heart,
  Dumbbell,
  BookOpen,
  Percent,
  ShoppingBag,
  Coins,
  GraduationCap,
  CalendarHeart,
  History,
  Megaphone,
  Star,
  Fuel,
  Wrench,
} from "lucide-react";
import {
  Doctor,
  GovAnnouncement,
  BannerAd,
  Notification,
  Craftsman,
  MarketListing,
} from "../types";
import { excelService } from "../services/excelService";
import { firebaseService } from "../services/firebaseService";
import MapPicker from "./MapPicker";

interface AdminPanelProps {
  adminView:
    | "main"
    | "doctors"
    | "banners"
    | "govAnnouncements"
    | "settings"
    | "market_stores"
    | "market_products"
    | "hospital_doctors"
    | "restaurant_orders"
    | "serviceOffers"
    | "taxis"
    | "craftsmen"
    | "notifications"
    | "market_listings";
  setAdminView: (
    view:
      | "main"
      | "doctors"
      | "banners"
      | "govAnnouncements"
      | "settings"
      | "market_stores"
      | "market_products"
      | "hospital_doctors"
      | "restaurant_orders"
      | "serviceOffers"
      | "taxis"
      | "craftsmen"
      | "notifications"
      | "market_listings",
  ) => void;
  isAdding: boolean;
  setIsAdding: (v: boolean) => void;
  editingItem: any;
  setEditingItem: (v: any) => void;
  formData: any;
  setFormData: (v: any) => void;
  adminSearch: string;
  setAdminSearch: (v: string) => void;
  handleFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
  ) => void;
  saveItem: () => void;
  startAdd: () => void;
  startEdit: (item: any) => void;
  deleteItem: (id: string, type: string) => void;
  confirmDelete: { id: string; type: string } | null;
  doctors: Doctor[];
  govAnnouncements: GovAnnouncement[];
  serviceOffers: any[];
  banners: BannerAd[];
  appSettings: any;
  saveSettings: (v: any) => Promise<void>;
  marketStores: any[];
  adminSelectedStore?: any;
  setAdminSelectedStore?: (val: any) => void;
  adminMarketProducts?: any[];
  hospitalDoctors?: any[];
  taxis?: any[];
  craftsmen?: Craftsman[];
  notifications?: any[];
  setNotifications?: React.Dispatch<React.SetStateAction<any[]>>;
  seedDatabase: () => Promise<void>;
  setDoctors?: React.Dispatch<React.SetStateAction<any[]>>;
  setMarketStores?: React.Dispatch<React.SetStateAction<any[]>>;
  setServiceOffers?: React.Dispatch<React.SetStateAction<any[]>>;
  setCraftsmen?: React.Dispatch<React.SetStateAction<Craftsman[]>>;
  marketListings?: MarketListing[];
  setMarketListings?: React.Dispatch<React.SetStateAction<MarketListing[]>>;
}

export const AdminPanel = (props: AdminPanelProps) => {
  const {
    adminView,
    setAdminView,
    isAdding,
    setIsAdding,
    editingItem,
    setEditingItem,
    formData,
    setFormData,
    adminSearch,
    setAdminSearch,
    handleFileUpload,
    saveItem,
    startAdd,
    startEdit,
    deleteItem,
    confirmDelete,
    doctors,
    govAnnouncements,
    serviceOffers,
    banners,
    appSettings,
    saveSettings,
    marketStores,
    adminSelectedStore,
    setAdminSelectedStore,
    adminMarketProducts,
    hospitalDoctors,
    taxis = [],
    craftsmen = [],
    notifications = [],
    setNotifications,
    seedDatabase,
    setDoctors,
    setMarketStores,
    setServiceOffers,
    setCraftsmen,
    marketListings = [],
    setMarketListings,
  } = props;

  const [editingAlertId, setEditingAlertId] = React.useState<string | null>(
    null,
  );
  const [expandedItemId, setExpandedItemId] = React.useState<string | null>(null);
  const [localSettings, setLocalSettings] = React.useState<any>(appSettings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isConfirmingDeleteAll, setIsConfirmingDeleteAll] = React.useState(false);
  const [isDeletingAll, setIsDeletingAll] = React.useState(false);

  const [showMap, setShowMap] = React.useState(false);

  React.useEffect(() => {
    if (formData) {
      setShowMap(!!formData.lat && !!formData.lng);
    } else {
      setShowMap(false);
    }
  }, [editingItem, formData?.id]);

  // Comprehensive Hospital Management state
  const [hospitalSubTab, setHospitalSubTab] = React.useState<
    "doctors" | "info"
  >("doctors");

  // Restaurant/Shop orders management state
  const [restaurantOrders, setRestaurantOrders] = React.useState<any[]>([]);
  const [editingOrderTime, setEditingOrderTime] = React.useState<
    Record<string, string>
  >({});
  const [editingOrderFee, setEditingOrderFee] = React.useState<
    Record<string, string>
  >({});

  // Hospital settings local overrides
  const [hospDirector, setHospDirector] = React.useState(
    appSettings?.hospitalDirector || "",
  );
  const [hospPhone, setHospPhone] = React.useState(
    appSettings?.hospitalPhone || "",
  );
  const [hospImage, setHospImage] = React.useState(
    appSettings?.hospitalImage || "",
  );
  React.useEffect(() => {
    setLocalSettings(appSettings);
    setHospDirector(appSettings?.hospitalDirector || "");
    setHospPhone(appSettings?.hospitalPhone || "");
    setHospImage(appSettings?.hospitalImage || "");
  }, [appSettings]);

  const [showSavedMsg, setShowSavedMsg] = React.useState(false);

  const isHospitalInfoModified = React.useMemo(() => {
    return (
      (hospDirector || "").trim() !== (appSettings?.hospitalDirector || "").trim() ||
      (hospPhone || "").trim() !== (appSettings?.hospitalPhone || "").trim() ||
      (hospImage || "") !== (appSettings?.hospitalImage || "")
    );
  }, [hospDirector, hospPhone, hospImage, appSettings]);

  React.useEffect(() => {
    setShowSavedMsg(false);
  }, [hospDirector, hospPhone, hospImage]);


  React.useEffect(() => {
    const unsub = firebaseService.subscribeToCollection<any>(
      "restaurant_orders",
      (fetched) => {
        const sorted = [...fetched].sort((a, b) => {
          const aTime = a.createdAt?.toMillis
            ? a.createdAt.toMillis()
            : a.createdAt || 0;
          const bTime = b.createdAt?.toMillis
            ? b.createdAt.toMillis()
            : b.createdAt || 0;
          return bTime - aTime;
        });
        setRestaurantOrders(sorted);
      },
    );
    return () => unsub();
  }, []);

  const [newMenuCategoryText, setNewMenuCategoryText] = React.useState("");

  const handleSaveHospitalInfo = async () => {
    try {
      setShowSavedMsg(false);
      await saveSettings({
        ...localSettings,
        hospitalDirector: hospDirector.trim(),
        hospitalPhone: hospPhone.trim(),
        hospitalImage: hospImage.trim(),
      });
      setShowSavedMsg(true);
    } catch (err) {
      alert("❌ فشل حفظ التعديلات.");
    }
  };

  const handleExport = () => {
    let data: any[] = [];
    let name = "";

    if (adminView === "doctors") {
      data = doctors;
      name = "الأطباء";

    } else if (adminView === "govAnnouncements") {
      data = govAnnouncements;
      name = "سوق الشرقاط";
    } else if (adminView === "hospital_doctors") {
      data = hospitalDoctors || [];
      name = "إدارة المستشفى";
    } else if (adminView === "market_stores") {
      data = marketStores;
      name = "المتاجر";
    } else if (adminView === "market_listings") {
      data = marketListings;
      name = "سوق_الشرقاط";
    }

    if (data.length === 0) {
      alert("لا توجد بيانات لتصديرها");
      return;
    }

    // Clean data for excel
    const exportData = data.map((item) => {
      // Remove large assets and internal metadata
      const { image, images, logoImage, bannerImage, featuredImage, ...rest } =
        item;

      // Flatten arrays like 'days' for hospital doctors to make them readable in Excel
      if (Array.isArray(rest.days)) {
        rest.days = rest.days.join(", ");
      }

      return rest;
    });

    excelService.exportToExcel(
      exportData,
      `Backup_${name}_${new Date().toISOString().split("T")[0]}`,
    );
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !window.confirm(
        "هل أنت متأكد من استيراد البيانات؟ سيتم إضافة هذه العناصر كبيانات جديدة.",
      )
    ) {
      e.target.value = "";
      return;
    }

    try {
      const rawData = await excelService.importFromExcel(file);
      if (!Array.isArray(rawData) || rawData.length === 0) {
        alert("الملف فارغ أو غير صحيح");
        return;
      }

      console.log("Admin: First row of import:", rawData[0]);

      // Smart Mapping function
      const mapItem = (item: any) => {
        const mapped: any = {};

        // Define common field aliases
        const fieldAliases: Record<string, string[]> = {
          name: [
            "name",
            "title",
            "اسم",
            "الاسم",
            "الاسم الكامل",
            "الاسم الثلاثي",
            "اسم الطبيب",
            "اسم المحل",
            "اسم المتجر",
            "اسم المكتب",
            "اسم السائق",
            "اسم الصنف",
          ],
          subtitle: [
            "subtitle",
            "specialty",
            "profession",
            "job",
            "الاختصاص",
            "التخصص",
            "المهنة",
            "مهنة",
            "الحرفة",
            "نوع السيارة",
            "الوصف القصير",
          ],
          phone1: [
            "phone1",
            "phone",
            "mobile",
            "tel",
            "الهاتف",
            "رقم الهاتف",
            "الموبايل",
            "رقم الموبايل",
            "رقم الجوال",
            "تليفون",
            "موبايل",
            "جوال",
          ],
          location: [
            "location",
            "address",
            "العنوان",
            "الموقع",
            "مكان العمل",
            "سكن",
            "عنوان",
          ],
          description: [
            "description",
            "content",
            "info",
            "الوصف",
            "التفاصيل",
            "تفاصيل",
            "المعلومات",
          ],
          category: ["category", "type", "الصنف", "النوع", "الفئة", "القسم"],
          price: ["price", "cost", "السعر", "التكلفة"],
          shift: ["shift", "المناوبة", "الوقت", "الشفت"],
          days: ["days", "أيام الدوام", "ايام الدوام", "الأيام"],
          whatsapp: ["whatsapp", "الواتساب", "رقم الواتساب"],
        };

        // Create a reverse mapping for quick lookup
        const reverseMapping: Record<string, string> = {};
        Object.entries(fieldAliases).forEach(([target, aliases]) => {
          aliases.forEach((alias) => {
            reverseMapping[alias.toLowerCase()] = target;
          });
        });

        // Map fields from the Excel object to our internal keys
        Object.keys(item).forEach((key) => {
          const originalKey = key.trim();
          const lowerKey = originalKey.toLowerCase();

          // Skip internal IDs and timestamps
          if (
            [
              "id",
              "createdat",
              "updatedat",
              "userlikes",
              "reviews",
              "clicks",
            ].includes(lowerKey)
          )
            return;

          const targetKey = reverseMapping[lowerKey] || originalKey;
          let value = item[key];

          if (typeof value === "string") value = value.trim();
          mapped[targetKey] = value;
        });

        // --- Context-Aware Fixes ---

        // Fix for regular doctors/govAnnouncements: they use 'subtitle' for specialty
        if (["doctors", "govAnnouncements"].includes(adminView)) {
          if (mapped.specialty && !mapped.subtitle) {
            mapped.subtitle = mapped.specialty;
            delete mapped.specialty;
          }
        }

        // Fix for hospital doctors: they use 'specialty' instead of 'subtitle'
        if (adminView === "hospital_doctors") {
          if (mapped.subtitle && !mapped.specialty) {
            mapped.specialty = mapped.subtitle;
            delete mapped.subtitle;
          }
          // Convert 'days' string (e.g. "الأحد, الإثنين") back to array
          if (typeof mapped.days === "string") {
            mapped.days = mapped.days
              .split(/[,،]/)
              .map((d: string) => d.trim())
              .filter((d: string) => d.length > 0);
          }
          if (!mapped.days) mapped.days = [];
          if (mapped.isActive === undefined) mapped.isActive = true;
        }

        // Fix for phones (everyone uses phone1 except market_stores and hospital_doctors)
        if (["doctors", "govAnnouncements"].includes(adminView)) {
          if (mapped.phone && !mapped.phone1) {
            mapped.phone1 = mapped.phone;
            delete mapped.phone;
          }
        } else if (adminView === "market_stores") {
          if (mapped.phone1 && !mapped.phone) {
            mapped.phone = mapped.phone1;
            delete mapped.phone1;
          }
          if (mapped.isActive === undefined) mapped.isActive = true;
        }

        // Ensure defaults
        if (adminView === "doctors" && !mapped.category)
          mapped.category = "doctor";

        // Convert numbers
        if (mapped.price) mapped.price = Number(mapped.price) || 0;

        return mapped;
      };

      const processedData = rawData.map(mapItem).filter((item) => {
        return (
          (item.name || item.title) &&
          (item.phone || item.phone1 || item.subtitle || item.specialty)
        );
      });

      console.log(
        `Admin: Successfully processed ${processedData.length} valid items`,
      );

      if (processedData.length === 0) {
        alert(
          "❌ لم يتم العثور على أي بيانات صالحة للاستيراد. يرجى التأكد من تعبئة الأعمدة المطلوبة (الاسم، ورقم الهاتف أو التخصص).",
        );
        e.target.value = "";
        return;
      }

      const collectionMapping: Record<string, string> = {
        doctors: "doctors",
        govAnnouncements: "govAnnouncements",
        hospital_doctors: "hospital_doctors",
        market_stores: "market_stores",
      };

      const path = collectionMapping[adminView];
      if (!path) return;

      const batch = processedData.map((item) => ({
        collectionPath: path,
        data: item,
        type: "add" as const,
      }));

      // Split into chunks of 400 for Firestore batch limits
      console.log(
        `Admin: Sending ${batch.length} items to Firestore in batches`,
      );

      try {
        for (let i = 0; i < batch.length; i += 400) {
          const chunk = batch.slice(i, i + 400);
          await firebaseService.batchWriteDocuments(chunk);
        }
        alert(
          `✅ تم استيراد ومعالجة ${processedData.length} عنصر بنجاح في قاعدة البيانات.`,
        );
      } catch (batchErr: any) {
        console.error("Batch write error:", batchErr);
        alert(
          `❌ فشل الحفظ في قاعدة البيانات: ${batchErr?.message || "خطأ غير معروف"}`,
        );
      }

      e.target.value = "";
    } catch (err: any) {
      console.error("Import process error:", err);
      alert(
        `❌ حدث خطأ أثناء معالجة الملف: ${err?.message || "خطأ في قراءة ملف الإكسل"}`,
      );
    }
  };

  React.useEffect(() => {
    setLocalSettings(appSettings);
  }, [appSettings]);

  const renderRestaurantOrders = () => {
    const handleUpdateOrderStatus = async (orderId: string, status: string) => {
      const timeInput = editingOrderTime[orderId] || "";
      const feeInput = parseFloat(editingOrderFee[orderId] || "0");

      const updates: any = { status };
      if (status === "accepted") {
        const estTime = timeInput || "30-45 دقيقة";
        const delFee = isNaN(feeInput) ? 2000 : feeInput;
        updates.deliveryTime = estTime;
        updates.deliveryFee = delFee;

        const order = restaurantOrders.find((o) => o.id === orderId);
        if (order) {
          const itemsPrice = order.finalPrice || order.totalPrice || 0;
          updates.adjustedTotal = itemsPrice + delFee;
        }
      }

      try {
        await firebaseService.updateDocument(
          "restaurant_orders",
          orderId,
          updates,
        );

        alert("✅ تم تحديث حالة الطلب بنجاح!");
      } catch (err) {
        console.error("Order status update error: ", err);
        alert("❌ فشل تحديث حالة الطلب.");
      }
    };

    const handleDeleteOrder = async (orderId: string) => {
      if (
        window.confirm(
          "هل أنت متأكد من حذف هذا الطلب نهائياً من قاعدة البيانات؟",
        )
      ) {
        try {
          await firebaseService.deleteDocument("restaurant_orders", orderId);
          alert("✅ تم حذف الطلب بنجاح.");
        } catch (err) {
          console.error("Order delete error: ", err);
          alert("❌ فشل حذف الطلب.");
        }
      }
    };

    return (
      <div
        className="space-y-6 pt-2 pb-20 animate-in fade-in duration-300 text-right"
        dir="rtl"
      >
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdminView("main")}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2.5 rounded-xl transition-colors shrink-0 flex items-center justify-center pt-3.5"
              title="العودة للقائمة الرئيسية"
            >
              <ChevronRight size={18} />
            </button>
            <div className="flex flex-col">
              <h3 className="text-lg font-display font-black text-slate-800">
                إدارة طلبات المأكولات
              </h3>
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider">
                الطلبات النشطة والمحفوظة
              </p>
            </div>
          </div>
          <span className="text-[11px] font-black bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full border border-amber-100/50 flex items-center gap-1">
            <ShoppingBag size={12} /> {restaurantOrders.length} طلب إجمالي
          </span>
        </div>

        {restaurantOrders.length === 0 ? (
          <div className="bg-white p-16 text-center rounded-[2.5rem] border border-slate-100 shadow-sm max-w-md mx-auto">
            <ShoppingBag
              size={48}
              className="mx-auto text-slate-300 mb-4 animate-bounce"
            />
            <p className="text-sm font-black text-slate-700 mb-1">
              لا توجد طلبات جارية بعد
            </p>
            <p className="text-xs text-slate-400 font-bold max-w-xs mx-auto">
              عند قيام المستخدمين بتأكيد طلبات الوجبات والمأكولات، ستظهر التذاكر
              هنا في الوقت الفعلي.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {restaurantOrders.map((order, idx) => {
              const itemsPrice = order.finalPrice || order.totalPrice || 0;
              const deliveryFee = order.deliveryFee || 0;
              const totalAmount =
                order.adjustedTotal || itemsPrice + deliveryFee;
              const totalQty =
                order.items?.reduce((s: number, i: any) => s + i.quantity, 0) ||
                0;

              // Formatting created time
              let timeStr = "قبل قليل";
              if (order.createdAt) {
                const ms = order.createdAt.toMillis
                  ? order.createdAt.toMillis()
                  : order.createdAt;
                timeStr =
                  new Date(ms).toLocaleTimeString("ar-IQ", {
                    hour: "numeric",
                    minute: "2-digit",
                  }) +
                  " - " +
                  new Date(ms).toLocaleDateString("ar-IQ", {
                    month: "short",
                    day: "numeric",
                  });
              }

              return (
                <div
                  key={order.id}
                  className={`bg-white border p-6 rounded-[2.5rem] shadow-sm transition-all relative overflow-hidden flex flex-col gap-4 ${
                    order.status === "pending"
                      ? "border-2 border-amber-400"
                      : "border-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-black">
                      {timeStr}
                    </span>
                    <span
                      className={`text-[10px] font-black px-3.5 py-1.5 rounded-full border ${
                        order.status === "pending"
                          ? "bg-orange-50 text-orange-600 border-orange-100"
                          : order.status === "accepted"
                            ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                            : order.status === "completed"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-rose-50 text-rose-600 border-rose-100"
                      }`}
                    >
                      {order.status === "pending"
                        ? "⏳ قيد المراجعة"
                        : order.status === "accepted"
                          ? "🛵 جاري التحضير والتوصيل"
                          : order.status === "completed"
                            ? "✅ تم التوصيل بنجاح"
                            : "❌ ملغي"}
                    </span>
                  </div>

                  <div className="flex justify-between items-start border-b border-dashed border-slate-100 pb-3">
                    <div>
                      <h4 className="font-display font-black text-slate-800 text-lg">
                        {order.storeName}
                      </h4>
                      <p className="text-[10px] text-shirqat-primary font-black">
                        رقم التذكرة: {order.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl text-xs font-bold text-slate-600">
                    <div>
                      👤 الزبون:{" "}
                      <span className="font-black text-slate-800">
                        {order.clientName}
                      </span>
                    </div>
                    <div>
                      📞 الهاتف:{" "}
                      <span className="font-black text-slate-800">
                        {order.clientPhone || "غير مدرج"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      📍 عنوان التوصيل:{" "}
                      <span className="font-black text-slate-800">
                        {order.clientAddress}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase">
                      الوجبات المطلوبة ({totalQty}):
                    </p>
                    <div className="bg-slate-50 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                      {order.items?.map((item: any, iIdx: number) => (
                        <div
                          key={iIdx}
                          className="flex justify-between items-center p-3 font-bold text-slate-600"
                        >
                          <span>
                            🍔 {item.name}{" "}
                            <span className="text-slate-400 font-black">
                              ({item.quantity}x)
                            </span>
                          </span>
                          <span className="font-black text-slate-700">
                            {(item.price * item.quantity).toLocaleString()} د.ع
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs font-bold text-slate-600">
                    <div className="flex justify-between">
                      <span>ثمن الوجبات المجموع:</span>
                      <span className="font-black text-slate-800">
                        {itemsPrice.toLocaleString()} د.ع
                      </span>
                    </div>
                    {order.discountApplied && (
                      <div className="flex justify-between text-rose-500">
                        <span>
                          الخصم المطبق ({order.discountApplied.code} -{" "}
                          {order.discountApplied.percentage}%):
                        </span>
                        <span className="font-black">
                          -
                          {(
                            (order.totalPrice *
                              order.discountApplied.percentage) /
                            100
                          ).toLocaleString()}{" "}
                          د.ع
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>سعر مندوب التوصيل:</span>
                      <span className="font-black text-slate-800">
                        {deliveryFee.toLocaleString()} د.ع
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200/60 pt-2 text-sm">
                      <span className="text-slate-800 font-black">
                        المجموع الكلي:
                      </span>
                      <span className="font-black text-emerald-600">
                        {totalAmount.toLocaleString()} د.ع
                      </span>
                    </div>
                  </div>

                  {order.status === "pending" && (
                    <div className="space-y-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <p className="text-[10px] font-black text-amber-700">
                        خطوات تفعيل التوصيل:
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex flex-col gap-1">
                          <label className="font-black text-slate-700">
                            تكلفة التوصيل (د.ع)
                          </label>
                          <input
                            type="number"
                            placeholder="مثال: 2000"
                            value={editingOrderFee[order.id] || ""}
                            onChange={(e) =>
                              setEditingOrderFee((prev) => ({
                                ...prev,
                                [order.id]: e.target.value,
                              }))
                            }
                            className="h-10 px-3 bg-white rounded-xl border border-amber-200 font-bold"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-black text-slate-700">
                            زمن الوصول المقدر
                          </label>
                          <input
                            type="text"
                            placeholder="مثال: 30-45 دقيقة"
                            value={editingOrderTime[order.id] || ""}
                            onChange={(e) =>
                              setEditingOrderTime((prev) => ({
                                ...prev,
                                [order.id]: e.target.value,
                              }))
                            }
                            className="h-10 px-3 bg-white rounded-xl border border-amber-200 font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                    {order.status === "pending" && (
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(order.id, "accepted")
                        }
                        className="flex-1 min-w-[120px] h-11 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/10 active:scale-95 transition-all"
                      >
                        قبول وتأكيد الوجبة 🛵
                      </button>
                    )}

                    {order.status === "accepted" && (
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(order.id, "completed")
                        }
                        className="flex-1 min-w-[120px] h-11 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/10 active:scale-95 transition-all"
                      >
                        إتمام وإيصال الطلب ✅
                      </button>
                    )}

                    {order.status === "pending" && (
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(order.id, "cancelled")
                        }
                        className="h-11 px-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-bold active:scale-95 transition-all"
                      >
                        إلغاء الطلب ❌
                      </button>
                    )}

                    {order.clientPhone && (
                      <button
                        onClick={() =>
                          window.open(
                            `https://wa.me/${order.clientPhone.replace(/[\s+]/g, "")}`,
                            "_blank",
                          )
                        }
                        className="h-11 px-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                        title="مراسلة عبر واتساب"
                      >
                        واتساب الزبون
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="h-11 w-11 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl flex items-center justify-center transition-colors active:scale-95 border border-slate-200/50"
                      title="حذف نهائي"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 min-h-screen">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 pt-4 pb-2 shadow-sm">
        <div className="flex items-center justify-between mb-2 px-2 text-right">
          <div className="flex flex-col">
            <h2 className="text-lg font-display font-black text-slate-800">
              قمرة القيادة
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              إدارة متكاملة للتطبيق
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-4 ring-emerald-500/10">
              <ShieldCheck size={16} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-0">
        <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 text-right">
            {adminView === "main" ? (
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    id: "doctors",
                    label: "الدليل الطبي",
                    icon: <Stethoscope />,
                    color: "bg-indigo-50 text-indigo-600",
                    count: doctors.length,
                  },
                  {
                    id: "taxis",
                    label: "سائقي التكسي 🚖",
                    icon: <Car />,
                    color: "bg-amber-50 text-amber-600",
                    count: taxis?.length || 0,
                  },
                  {
                    id: "craftsmen",
                    label: "الأسطوات والمهن 🛠️",
                    icon: <Wrench />,
                    color: "bg-teal-50 text-teal-600",
                    count: craftsmen?.length || 0,
                  },
                  {
                    id: "serviceOffers",
                    label: "العروض والخدمات",
                    icon: <Zap />,
                    color: "bg-sky-50 text-sky-600",
                    count: serviceOffers.length,
                  },
                  {
                    id: "market_listings",
                    label: "سوق الشرقاط (سيارات/عقارات/موبايلات) 🛍️",
                    icon: <ShoppingBag />,
                    color: "bg-emerald-50 text-emerald-600",
                    count: marketListings?.length || 0,
                  },
                  {
                    id: "market_stores",
                    label: "إدارة المتاجر والأسواق 🏪",
                    icon: <LayoutDashboard />,
                    color: "bg-orange-50 text-orange-600",
                    count: marketStores?.length || 0,
                  },
                  {
                    id: "banners",
                    label: "شريط الإعلانات",
                    icon: <ImageIcon />,
                    color: "bg-slate-50 text-slate-600",
                    count: banners.length,
                  },
                  {
                    id: "notifications",
                    label: "إرسال الإشعارات 🔔",
                    icon: <Bell />,
                    color: "bg-rose-50 text-rose-600",
                    count: notifications.length,
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setAdminView(opt.id as any);
                    }}
                    className="bg-white border border-slate-100 p-5 rounded-[2rem] flex flex-col items-center text-center shadow-sm hover:border-shirqat-primary transition-all active:scale-95 group relative overflow-hidden"
                  >
                    <div className="absolute top-2 right-2 bg-slate-100 text-slate-600 text-[9px] font-black px-2 py-1 rounded-full">
                      {opt.count}
                    </div>
                    <div
                      className={`w-12 h-12 ${opt.color} rounded-2xl flex items-center justify-center mb-4 ring-4 ring-transparent group-hover:ring-current/10 transition-all`}
                    >
                      {opt.icon}
                    </div>
                    <span className="text-[10px] font-black text-slate-800">
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            ) : adminView === "restaurant_orders" ? (
              renderRestaurantOrders()
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  {adminView === "market_products" ? (
                    <button
                      onClick={() => {
                        if (adminSelectedStore?.id === "general") {
                          setAdminView("main");
                          if (setAdminSelectedStore)
                            setAdminSelectedStore(null);
                        } else {
                          setAdminView("market_stores");
                          if (setAdminSelectedStore)
                            setAdminSelectedStore(null);
                        }
                      }}
                      className="flex items-center gap-1 text-[10px] font-black text-shirqat-primary text-right"
                    >
                      <ChevronRight size={14} />{" "}
                      {adminSelectedStore?.id === "general"
                        ? "العودة للرئيسية"
                        : "العودة للمتاجر"}
                    </button>
                  ) : (
                    <button
                      onClick={() => setAdminView("main")}
                      className="flex items-center gap-1 text-[10px] font-black text-shirqat-primary text-right"
                    >
                      <ChevronRight size={14} /> العودة للأقسام
                    </button>
                  )}
                  {!isAdding && (
                    <div className="flex items-center gap-2">
                      {[
                        "doctors",
                        "govAnnouncements",
                        "hospital_doctors",
                        "market_stores",
                      ].includes(adminView) && (
                        <>
                          <button
                            onClick={handleExport}
                            className="bg-emerald-50 text-emerald-600 px-4 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2 active:scale-95 transition-all border border-emerald-100"
                            title="تصدير إلى إكسل"
                          >
                            <FileOutput size={14} /> تصدير
                          </button>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2 active:scale-95 transition-all border border-blue-100"
                            title="استيراد من إكسل"
                          >
                            <FileInput size={14} /> استيراد
                          </button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImport}
                            accept=".xlsx, .xls"
                            hidden
                          />
                        </>
                      )}
                      {!(
                        adminView === "hospital_doctors" &&
                        hospitalSubTab !== "doctors"
                      ) && (
                        <>
                          <button
                            onClick={startAdd}
                            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2 active:scale-95 transition-all"
                          >
                            <Plus size={14} /> إضافة جديد
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {isAdding ? (
                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-display font-black text-slate-800 text-right">
                        {editingItem ? "تعديل البيانات" : "إضافة جديدة"}
                      </h4>
                      <button
                        onClick={() => {
                          setIsAdding(false);
                          setEditingItem(null);
                          setFormData({});
                        }}
                        className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(adminView === "market_stores" ||
                        adminView === "market_products" ||
                        adminView === "banners") && (
                          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="w-16 h-16 bg-white rounded-xl shadow-sm overflow-hidden flex items-center justify-center relative border border-slate-100">
                              {formData.image ? (
                                <img
                                  src={formData.image}
                                  className="w-full h-full object-cover"
                                  alt=""
                                />
                              ) : (
                                <ImageIcon
                                  className="text-slate-300"
                                  size={24}
                                />
                              )}
                              <input
                                type="file"
                                onChange={(e) => handleFileUpload(e, "image")}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept="image/*"
                              />
                            </div>
                            <div className="flex-1 text-right">
                              <p className="text-xs font-black text-slate-800">
                                صورة العرض المرفقة
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                انقر على المربع لتغيير الصورة
                              </p>
                            </div>
                          </div>
                        )}

                      {(adminView === "serviceOffers" || adminView === "market_listings") && (
                        <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-right">
                          <p className="text-xs font-black text-slate-800 mb-3">
                            {"صور العرض أو الخدمة (يمكنك إضافة أكثر من صورة لتظهر كبنر متحرك في المنشور) 📸"}
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {(() => {
                              const currentImages = formData.images || (formData.image ? [formData.image] : []);
                              return (
                                <>
                                  {currentImages.map((imgSrc: string, index: number) => (
                                    <div key={index} className="w-20 h-20 bg-white rounded-xl shadow-sm overflow-hidden relative border border-slate-200 group">
                                      <img
                                        src={imgSrc}
                                        className="w-full h-full object-cover"
                                        alt=""
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updatedImages = currentImages.filter((_, idx) => idx !== index);
                                          setFormData({
                                            ...formData,
                                            images: updatedImages,
                                            image: updatedImages[0] || ""
                                          });
                                        }}
                                        className="absolute top-1 right-1 w-6 h-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform z-10"
                                      >
                                        <X size={12} />
                                      </button>
                                      <div className="absolute bottom-0 left-0 right-0 bg-slate-900/60 text-[8px] text-white font-black py-0.5 text-center">
                                        {index === 0 ? "الرئيسية" : `صورة ${index + 1}`}
                                      </div>
                                    </div>
                                  ))}
                                  
                                  <div className="w-20 h-20 bg-white hover:bg-slate-100 rounded-xl border-2 border-dashed border-slate-200 hover:border-shirqat-primary transition-colors flex items-center justify-center relative cursor-pointer">
                                    <Plus className="text-slate-400" size={24} />
                                    <input
                                      type="file"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            const img = new Image();
                                            img.onload = () => {
                                              const canvas = document.createElement("canvas");
                                              let width = img.width;
                                              let height = img.height;
                                              const maxDim = 800;

                                              if (width > height && width > maxDim) {
                                                height *= maxDim / width;
                                                width = maxDim;
                                              } else if (height > maxDim) {
                                                width *= maxDim / height;
                                                height = maxDim;
                                              }

                                              canvas.width = width;
                                              canvas.height = height;
                                              const ctx = canvas.getContext("2d");
                                              ctx?.drawImage(img, 0, 0, width, height);

                                              const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
                                              setFormData((prev: any) => {
                                                const current = prev.images || (prev.image ? [prev.image] : []);
                                                const nextImages = [...current, compressedBase64];
                                                return {
                                                  ...prev,
                                                  images: nextImages,
                                                  image: prev.image || compressedBase64
                                                };
                                              });
                                            };
                                            img.src = reader.result as string;
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                      accept="image/*"
                                    />
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      )}

                      {adminView !== "banners" && (
                          <div className="grid grid-cols-1 gap-4">
                            {adminView !== "govAnnouncements" && adminView !== "serviceOffers" && adminView !== "notifications" && adminView !== "market_listings" && (
                              <AdminInput
                                placeholder="الاسم أو العنوان"
                                value={formData.name || ""}
                                onChange={(val) =>
                                  setFormData({ ...formData, name: val })
                                }
                              />
                            )}

                            {adminView === "hospital_doctors" && (
                              <>
                                <AdminInput
                                  placeholder="الاختصاص"
                                  value={formData.specialty || ""}
                                  onChange={(val) =>
                                    setFormData({ ...formData, specialty: val })
                                  }
                                />
                                <AdminSelect
                                  label="الشفت / الدوام"
                                  value={formData.shift || ""}
                                  options={[
                                    { label: "صباحي", value: "صباحي" },
                                    { label: "مسائي", value: "مسائي" },
                                    { label: "خفر", value: "خفر" },
                                  ]}
                                  onChange={(val) =>
                                    setFormData({ ...formData, shift: val })
                                  }
                                />
                                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-right">
                                  <label className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-widest block mb-2">
                                    أيام الدوام
                                  </label>
                                  <div className="flex flex-wrap gap-2 justify-end">
                                    {[
                                      "الأحد",
                                      "الإثنين",
                                      "الثلاثاء",
                                      "الأربعاء",
                                      "الخميس",
                                      "الجمعة",
                                      "السبت",
                                    ].map((day) => (
                                      <button
                                        key={day}
                                        type="button"
                                        onClick={() => {
                                          const days = formData.days || [];
                                          if (days.includes(day)) {
                                            setFormData({
                                              ...formData,
                                              days: days.filter(
                                                (d: string) => d !== day,
                                              ),
                                            });
                                          } else {
                                            setFormData({
                                              ...formData,
                                              days: [...days, day],
                                            });
                                          }
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                          (formData.days || []).includes(day)
                                            ? "bg-emerald-500 text-white shadow-sm"
                                            : "bg-white border border-slate-200 text-slate-500"
                                        }`}
                                      >
                                        {day}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <label className="flex items-center gap-3 text-sm font-bold text-slate-700 justify-end cursor-pointer">
                                  <span className="text-right">طبيب نشط</span>
                                  <input
                                    type="checkbox"
                                    checked={formData.isActive ?? true}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        isActive: e.target.checked,
                                      })
                                    }
                                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                                  />
                                </label>
                                <label className="flex items-center gap-3 text-sm font-bold text-slate-700 justify-end cursor-pointer">
                                  <span className="text-right">عرض في الصفحة الرئيسية (طبيب مميز) ⭐</span>
                                  <input
                                    type="checkbox"
                                    checked={formData.showInHome ?? false}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        showInHome: e.target.checked,
                                      })
                                    }
                                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                                  />
                                </label>
                              </>
                            )}

                            {adminView === "market_stores" && (
                              <>
                                <AdminSelect
                                  label="تصنيف المتجر / المحل"
                                  value={formData.category || "مأكولات"}
                                  options={[
                                    { label: "مأكولات", value: "مأكولات" },
                                    { label: "متاجر", value: "متاجر" },
                                    { label: "نسائي", value: "نسائي" },
                                  ]}
                                  onChange={(val) =>
                                    setFormData({ ...formData, category: val })
                                  }
                                />
                                <AdminInput
                                  placeholder="رقم الهاتف (اختياري)"
                                  value={formData.phone || ""}
                                  onChange={(val) =>
                                    setFormData({ ...formData, phone: val })
                                  }
                                />
                                <AdminInput
                                  placeholder="رقم الواتساب للطلبات (اختياري)"
                                  value={formData.whatsapp || ""}
                                  onChange={(val) =>
                                    setFormData({ ...formData, whatsapp: val })
                                  }
                                />
                                <AdminInput
                                  placeholder="العنوان أو الموقع"
                                  value={formData.location || ""}
                                  onChange={(val) =>
                                    setFormData({ ...formData, location: val })
                                  }
                                />
                                <div className="flex flex-col gap-3 pb-3 border-b border-slate-100">
                                  <div className="flex items-center justify-between">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const codes =
                                          formData.discountCodes || [];
                                        setFormData({
                                          ...formData,
                                          discountCodes: [
                                            ...codes,
                                            {
                                              id: "code_" + Date.now(),
                                              code: "",
                                              discountPercentage: 10,
                                              isActive: true,
                                            },
                                          ],
                                        });
                                      }}
                                      className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                                    >
                                      + كود خصم
                                    </button>
                                    <label className="text-sm font-black text-slate-800">
                                      أكواد الخصم
                                    </label>
                                  </div>
                                  {(formData.discountCodes || []).map(
                                    (codeItem: any, idx: number) => (
                                      <div
                                        key={codeItem.id || idx}
                                        className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col gap-2 relative"
                                      >
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newCodes =
                                              formData.discountCodes.filter(
                                                (_: any, i: number) =>
                                                  i !== idx,
                                              );
                                            setFormData({
                                              ...formData,
                                              discountCodes: newCodes,
                                            });
                                          }}
                                          className="absolute top-2 left-2 text-rose-500 bg-rose-50 p-1.5 rounded-lg active:scale-95"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                        <div className="flex items-center justify-end gap-2 pr-2">
                                          <span className="text-xs font-bold text-slate-600 text-right">
                                            كود الخصم
                                          </span>
                                        </div>
                                        <input
                                          type="text"
                                          placeholder="مثال: DISCOUNT20"
                                          className="w-full text-right p-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none uppercase"
                                          value={codeItem.code}
                                          onChange={(e) => {
                                            const newCodes = [
                                              ...formData.discountCodes,
                                            ];
                                            newCodes[idx].code =
                                              e.target.value.toUpperCase();
                                            setFormData({
                                              ...formData,
                                              discountCodes: newCodes,
                                            });
                                          }}
                                        />
                                        <div className="flex items-center gap-2 mt-1">
                                          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 flex-1 justify-end cursor-pointer">
                                            <span>كود فعال</span>
                                            <input
                                              type="checkbox"
                                              checked={codeItem.isActive}
                                              onChange={(e) => {
                                                const newCodes = [
                                                  ...formData.discountCodes,
                                                ];
                                                newCodes[idx].isActive =
                                                  e.target.checked;
                                                setFormData({
                                                  ...formData,
                                                  discountCodes: newCodes,
                                                });
                                              }}
                                              className="accent-emerald-500 w-4 h-4 cursor-pointer"
                                            />
                                          </label>
                                          <div className="flex items-center gap-2 flex-1 relative">
                                            <input
                                              type="number"
                                              placeholder="10"
                                              className="w-full text-left p-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none"
                                              value={
                                                codeItem.discountPercentage ||
                                                ""
                                              }
                                              onChange={(e) => {
                                                const newCodes = [
                                                  ...formData.discountCodes,
                                                ];
                                                newCodes[
                                                  idx
                                                ].discountPercentage =
                                                  Number(e.target.value) || 0;
                                                setFormData({
                                                  ...formData,
                                                  discountCodes: newCodes,
                                                });
                                              }}
                                            />
                                            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-black">
                                              %
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                  {(formData.discountCodes?.length === 0 ||
                                    !formData.discountCodes) && (
                                    <span className="text-xs text-slate-400 font-bold block text-right mt-1">
                                      لا توجد أكواد خصم. يمكنك إضافة كود جديد
                                      للمطعم.
                                    </span>
                                  )}
                                </div>

                                {formData.isRestaurant && (
                                  <div
                                    className="flex flex-col gap-3 pb-3 mt-3 border-b border-slate-100 text-right w-full"
                                    dir="rtl"
                                  >
                                    <label className="text-xs font-black text-slate-700">
                                      صفحات المنيو وتصنيفات الوجبات للمطعم
                                      (مثال: مشروبات، مشويات، بيتزا) 🍕
                                    </label>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (!newMenuCategoryText.trim())
                                            return;
                                          const currentCats =
                                            formData.menuCategories || [];
                                          if (
                                            !currentCats.includes(
                                              newMenuCategoryText.trim(),
                                            )
                                          ) {
                                            setFormData({
                                              ...formData,
                                              menuCategories: [
                                                ...currentCats,
                                                newMenuCategoryText.trim(),
                                              ],
                                            });
                                          }
                                          setNewMenuCategoryText("");
                                        }}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 rounded-xl active:scale-95 transition-all h-[42px] shrink-0"
                                      >
                                        إضافة صفحة
                                      </button>
                                      <input
                                        type="text"
                                        placeholder="مثال: مشويات، وجبات سريعة، عصائر"
                                        value={newMenuCategoryText}
                                        onChange={(e) =>
                                          setNewMenuCategoryText(e.target.value)
                                        }
                                        className="flex-1 text-right p-2.5 rounded-xl border border-slate-200 text-xs focus:border-indigo-500 outline-none placeholder-slate-400"
                                      />
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 justify-start mt-1">
                                      {(formData.menuCategories || []).map(
                                        (cat: string, index: number) => (
                                          <span
                                            key={index}
                                            className="bg-indigo-50 border border-indigo-100/60 text-indigo-700 font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xs"
                                          >
                                            <span>{cat}</span>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updated = (
                                                  formData.menuCategories || []
                                                ).filter(
                                                  (_: any, idx: number) =>
                                                    idx !== index,
                                                );
                                                setFormData({
                                                  ...formData,
                                                  menuCategories: updated,
                                                });
                                              }}
                                              className="text-rose-500 hover:text-rose-700 font-extrabold text-[13px] line-none"
                                            >
                                              ×
                                            </button>
                                          </span>
                                        ),
                                      )}
                                      {(formData.menuCategories || [])
                                        .length === 0 && (
                                        <span className="text-slate-400 text-[10px] font-bold mt-1 leading-relaxed">
                                          لم يتم إضافة تصنيفات مخصصة بعد. سيتم
                                          عرض الوجبات في صفحة منيو افتراضية
                                          واحدة للزبائن.
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                                <div className="flex flex-col gap-3">
                                  <label className="flex items-center gap-3 text-sm font-bold text-slate-700 justify-end cursor-pointer">
                                    <span className="text-right">
                                      عرض في الصفحة الرئيسية (مميز) ⭐
                                    </span>
                                    <input
                                      type="checkbox"
                                      checked={formData.showInHome ?? false}
                                      onChange={(e) =>
                                        setFormData({
                                          ...formData,
                                          showInHome: e.target.checked,
                                        })
                                      }
                                      className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                                    />
                                  </label>
                                </div>
                              </>
                            )}

                            {adminView === "market_products" && (
                              <>
                                {adminSelectedStore?.id === "general" && (
                                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-2 text-right">
                                    <label className="block font-black text-slate-800 text-sm mb-3">
                                      طبيعة المنشور (اختر النمط المناسب):
                                    </label>
                                    <div className="flex gap-3">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setFormData({
                                            ...formData,
                                            isAnnouncement: false,
                                            productType: "offer",
                                          })
                                        }
                                        className={`flex-1 h-12 rounded-xl text-xs font-black transition-all ${!formData.isAnnouncement ? "bg-orange-500 text-white shadow-md" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}
                                      >
                                        🏷️ عرض تجاري بسعر للتواصل والطلب
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setFormData({
                                            ...formData,
                                            isAnnouncement: true,
                                            productType: "announcement",
                                            price: 0,
                                          })
                                        }
                                        className={`flex-1 h-12 rounded-xl text-xs font-black transition-all ${formData.isAnnouncement ? "bg-purple-500 text-white shadow-md" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}
                                      >
                                        📢 تبليغ / تحديث عاجل أو عام
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {adminSelectedStore?.id === "general" &&
                                  formData.isAnnouncement && (
                                    <div
                                      className="bg-slate-100/50 border border-slate-200/60 p-4 rounded-2xl mb-2 text-right text-xs font-bold text-slate-500"
                                      dir="rtl"
                                    >
                                      📢 سيتم نشر هذا التبليغ كـ{" "}
                                      <span className="font-black text-purple-700">
                                        تبليغ عام أو تحديث رسمي
                                      </span>{" "}
                                      من قبل إدارة التطبيق مباشرةً دون الحاجة
                                      لتصنيفات فرعية.
                                    </div>
                                  )}

                                {adminSelectedStore?.id === "general" &&
                                  !formData.isAnnouncement && (
                                    <div
                                      className="bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-2 text-right w-full flex flex-col gap-2"
                                      dir="rtl"
                                    >
                                      <AdminInput
                                        placeholder="رقم الواتساب لاستقبال الطلبات لهذا العرض (مثال: 9647701234567)"
                                        value={formData.whatsappOrder || ""}
                                        onChange={(val) =>
                                          setFormData({
                                            ...formData,
                                            whatsappOrder: val,
                                          })
                                        }
                                      />
                                    </div>
                                  )}

                                {adminSelectedStore?.isRestaurant && (
                                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-2 text-right">
                                    <label className="block font-black text-slate-800 text-sm mb-3">
                                      نوع الإضافة (إجباري):
                                    </label>
                                    <div className="flex gap-3">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setFormData({
                                            ...formData,
                                            productType: "menu",
                                            isTemporary: false,
                                            durationDays: undefined,
                                            expiryDate: undefined,
                                          })
                                        }
                                        className={`flex-1 h-12 rounded-xl text-xs font-black transition-all ${formData.productType === "menu" ? "bg-orange-500 text-white shadow-md" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}
                                      >
                                        منيو (وجبة ثابتة)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const created = formData.createdAt;
                                          const createdSec =
                                            (created as any)?.seconds || 0;
                                          const baseTime = createdSec
                                            ? createdSec * 1000
                                            : (created as any)?.toMillis
                                              ? (created as any).toMillis()
                                              : Number(created || Date.now());
                                          setFormData({
                                            ...formData,
                                            productType: "offer",
                                            isTemporary: true,
                                            durationDays: 3,
                                            expiryDate:
                                              baseTime +
                                              3 * 24 * 60 * 60 * 1000,
                                          });
                                        }}
                                        className={`flex-1 h-12 rounded-xl text-xs font-black transition-all ${formData.productType === "offer" ? "bg-rose-500 text-white shadow-md" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}
                                      >
                                        عرض خاص
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {adminSelectedStore?.isRestaurant && (
                                  <div
                                    className="bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-2 text-right w-full flex flex-col gap-2"
                                    dir="rtl"
                                  >
                                    <label className="block text-xs font-black text-slate-800 mb-1">
                                      تصنيف أو صفحة الوجبة في المنيو 🍔
                                      (مشروبات، مشويات، بيتزا، الخ)
                                    </label>

                                    {adminSelectedStore.menuCategories &&
                                    adminSelectedStore.menuCategories.length >
                                      0 ? (
                                      <>
                                        <select
                                          value={formData.menuCategory || ""}
                                          onChange={(e) => {
                                            setFormData({
                                              ...formData,
                                              menuCategory: e.target.value,
                                            });
                                          }}
                                          className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 text-xs font-bold text-right outline-none focus:border-indigo-500"
                                        >
                                          <option value="">
                                            -- اختر التصنيف من القائمة --
                                          </option>
                                          {adminSelectedStore.menuCategories.map(
                                            (cat: string, index: number) => (
                                              <option key={index} value={cat}>
                                                {cat}
                                              </option>
                                            ),
                                          )}
                                          <option value="custom_input">
                                            -- كتابة تصنيف مخصص من عندك --
                                          </option>
                                        </select>

                                        {(formData.menuCategory ===
                                          "custom_input" ||
                                          (formData.menuCategory &&
                                            !adminSelectedStore.menuCategories.includes(
                                              formData.menuCategory,
                                            ))) && (
                                          <input
                                            type="text"
                                            placeholder="اكتب اسم التصنيف المخصص هنا"
                                            value={
                                              formData.menuCategory ===
                                              "custom_input"
                                                ? ""
                                                : formData.menuCategory
                                            }
                                            onChange={(e) =>
                                              setFormData({
                                                ...formData,
                                                menuCategory: e.target.value,
                                              })
                                            }
                                            className="w-full h-11 bg-white border border-slate-250 rounded-xl px-4 text-xs font-bold text-right mt-2 outline-none focus:border-indigo-500 placeholder-slate-400"
                                          />
                                        )}
                                      </>
                                    ) : (
                                      <div>
                                        <input
                                          type="text"
                                          placeholder="مثال: مشويات، وجبات سريعة، عصائر"
                                          value={formData.menuCategory || ""}
                                          onChange={(e) =>
                                            setFormData({
                                              ...formData,
                                              menuCategory: e.target.value,
                                            })
                                          }
                                          className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold text-right outline-none focus:border-indigo-500 placeholder-slate-400"
                                        />
                                        <p className="text-[10px] text-slate-400 font-bold mt-1.5 leading-relaxed">
                                          نصيحة: لسهولة الإدخال، يمكنك تحديد
                                          أزرار تصنيفات جاهزة للمطعم مسبقاً من
                                          خلال تعديل بيانات المطعم نفسه في صفحة
                                          "المتاجر".
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {!formData.isAnnouncement && (
                                  <input
                                    type="text"
                                    placeholder="السعر (بالدينار العراقي)، ارقام فقط"
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold focus:outline-none focus:border-shirqat-primary text-right shadow-sm animate-in fade-in"
                                    value={
                                      formData.price !== undefined &&
                                      formData.price !== null &&
                                      formData.price !== 0
                                        ? String(formData.price)
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === "") {
                                        setFormData({ ...formData, price: 0 });
                                      } else {
                                        const num = Number(val);
                                        if (!isNaN(num)) {
                                          setFormData({
                                            ...formData,
                                            price: num,
                                          });
                                        }
                                      }
                                    }}
                                  />
                                )}

                                {/* Temporary Offer Configuration */}
                                {(!adminSelectedStore?.isRestaurant ||
                                  formData.productType === "offer") && (
                                  <div className="bg-rose-50/40 border border-rose-100/60 p-4 rounded-2xl space-y-3.5 text-right w-full">
                                    <label className="flex items-center gap-3 text-sm font-bold text-slate-700 justify-end cursor-pointer">
                                      <span className="text-right text-rose-600">
                                        هذا العرض مؤقت وله فترة صلاحية محددة ⏳
                                      </span>
                                      <input
                                        type="checkbox"
                                        checked={formData.isTemporary ?? false}
                                        onChange={(e) => {
                                          const checked = e.target.checked;
                                          const created = formData.createdAt;
                                          const createdSec =
                                            (created as any)?.seconds || 0;
                                          const baseTime = createdSec
                                            ? createdSec * 1000
                                            : (created as any)?.toMillis
                                              ? (created as any).toMillis()
                                              : Number(created || Date.now());
                                          const days =
                                            formData.durationDays || 3;
                                          setFormData({
                                            ...formData,
                                            isTemporary: checked,
                                            durationDays: checked
                                              ? days
                                              : undefined,
                                            expiryDate: checked
                                              ? baseTime +
                                                days * 24 * 60 * 60 * 1000
                                              : undefined,
                                          });
                                        }}
                                        className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
                                      />
                                    </label>

                                    {formData.isTemporary && (
                                      <div className="bg-white p-3.5 rounded-xl border border-rose-100 mt-2 text-right">
                                        <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
                                          حدد عدد أيام صلاحية العرض (سيختفي
                                          تلقائياً بعدها):
                                        </label>
                                        <input
                                          type="number"
                                          min={1}
                                          max={365}
                                          placeholder="عدد الأيام (مثال: 3)"
                                          className="w-full h-11 bg-slate-50 border border-slate-100 rounded-lg px-4 text-xs font-bold text-right"
                                          value={
                                            formData.durationDays === undefined
                                              ? ""
                                              : formData.durationDays
                                          }
                                          onChange={(e) => {
                                            const val = parseInt(
                                              e.target.value,
                                            );
                                            const valNum = isNaN(val)
                                              ? ""
                                              : Math.max(1, val);
                                            const created = formData.createdAt;
                                            const createdSec =
                                              (created as any)?.seconds || 0;
                                            const baseTime = createdSec
                                              ? createdSec * 1000
                                              : (created as any)?.toMillis
                                                ? (created as any).toMillis()
                                                : Number(created || Date.now());
                                            setFormData({
                                              ...formData,
                                              durationDays: valNum,
                                              expiryDate:
                                                typeof valNum === "number"
                                                  ? baseTime +
                                                    valNum * 24 * 60 * 60 * 1000
                                                  : undefined,
                                            });
                                          }}
                                        />
                                        <span className="text-[10px] text-slate-400 font-bold block mt-1">
                                          تاريخ انتهاء العرض:{" "}
                                          {formData.expiryDate &&
                                          formData.durationDays
                                            ? new Date(
                                                formData.expiryDate,
                                              ).toLocaleDateString("ar-IQ")
                                            : "أدخل رقماً صحيحاً"}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Iraqi Style Car Details when store is Car Showroom */}
                                {adminSelectedStore?.isCarShowroom && (
                                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3 text-right w-full">
                                    <p className="text-xs font-black text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-1.5 justify-end">
                                      <span>
                                        🚗 تفاصيل السيارة (بالنمط العراقي)
                                      </span>
                                    </p>

                                    <AdminInput
                                      placeholder="ماركة وعلامة السيارة (تويوتا، كيا، دوج، إلخ)"
                                      value={formData.carBrand || ""}
                                      onChange={(v) =>
                                        setFormData({
                                          ...formData,
                                          carBrand: v,
                                        })
                                      }
                                    />
                                    <AdminInput
                                      placeholder="فئة السيارة والموديل (كامري، سورينتو، تشارجر)"
                                      value={formData.carModel || ""}
                                      onChange={(v) =>
                                        setFormData({
                                          ...formData,
                                          carModel: v,
                                        })
                                      }
                                    />
                                    <AdminInput
                                      placeholder="سنة الصنع / الموديل (مثال: 2022)"
                                      value={formData.carYear || ""}
                                      onChange={(v) =>
                                        setFormData({ ...formData, carYear: v })
                                      }
                                    />
                                    <AdminInput
                                      placeholder="حجم ونوع المحرك (مثال: 6 سلندر 3600)"
                                      value={formData.carEngine || ""}
                                      onChange={(v) =>
                                        setFormData({
                                          ...formData,
                                          carEngine: v,
                                        })
                                      }
                                    />
                                    <AdminTextarea
                                      placeholder="الوصف (الضرر، تفاصيل أخرى والمواصفات)"
                                      value={formData.carSpecs || ""}
                                      onChange={(v) =>
                                        setFormData({
                                          ...formData,
                                          carSpecs: v,
                                        })
                                      }
                                    />
                                  </div>
                                )}

                                <div className="flex flex-col gap-2">
                                  <label className="flex items-center gap-3 text-sm font-bold text-slate-700 justify-end cursor-pointer">
                                    <span className="text-right">
                                      متوفر في المخزن
                                    </span>
                                    <input
                                      type="checkbox"
                                      checked={formData.isAvailable ?? true}
                                      onChange={(e) =>
                                        setFormData({
                                          ...formData,
                                          isAvailable: e.target.checked,
                                        })
                                      }
                                      className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                                    />
                                  </label>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                      {adminView === "banners" && (
                        <div className="grid grid-cols-1 gap-4">
                          <AdminInput
                            placeholder="صورة الإعلان (رابط URL) اختياري"
                            value={formData.image || ""}
                            onChange={(v) =>
                              setFormData({ ...formData, image: v })
                            }
                          />
                          <AdminInput
                            placeholder="عنوان الإعلان"
                            value={formData.title || ""}
                            onChange={(v) =>
                              setFormData({ ...formData, title: v })
                            }
                          />
                          <div className="flex gap-2 justify-end">
                            {([ "internal", "text" ] as const).map(
                              (t) => (
                                <button
                                  key={t}
                                  onClick={() =>
                                    setFormData({ ...formData, type: t })
                                  }
                                  className={`py-2 px-3 rounded-xl text-[10px] font-bold transition-all ${formData.type === t ? "bg-shirqat-primary text-white" : "bg-slate-100 text-slate-600"}`}
                                >
                                  {t === "internal"
                                    ? "بطاقة"
                                    : "وصفي"}
                                </button>
                              ),
                            )}
                          </div>

                          {adminView === "banners" && formData.type === "internal" && (
                            <>
                              <select
                                className="w-full h-14 bg-white border border-slate-100 rounded-2xl px-4 text-sm font-bold text-right"
                                value={formData.targetType || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    targetType: e.target.value as any,
                                    targetId: "", // reset item selection
                                  })
                                }
                              >
                                <option value="">اختر القسم</option>
                                <option value="doctor">أطباء</option>
                                <option value="govAnnouncement">سوق الشرقاط</option>
                                <option value="restaurant">المطاعم والمتاجر</option>
                                <option value="serviceOffers">العروض والخدمات</option>
                              </select>
                              
                              {formData.targetType && (
                                <select
                                  className="w-full h-14 bg-white border border-slate-100 rounded-2xl px-4 text-sm font-bold text-right"
                                  value={formData.targetId || ""}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      targetId: e.target.value,
                                    })
                                  }
                                >
                                  <option value="">اختر العنصر</option>
                                  {(formData.targetType === "doctor"
                                    ? doctors
                                      : formData.targetType === "govAnnouncement"
                                        ? govAnnouncements
                                        : formData.targetType === "restaurant"
                                          ? (marketStores || [])
                                          : formData.targetType === "serviceOffers"
                                            ? (serviceOffers || [])
                                            : []
                                  ).map((item: any) => (
                                    <option key={item.id} value={item.id}>
                                      {item.name || item.title}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </>
                          )}

                          {adminView === "banners" && formData.type === "text" && (
                            <>
                              <AdminInput
                                placeholder="العنوان"
                                value={formData.title || ""}
                                onChange={(v) =>
                                  setFormData({ ...formData, title: v })
                                }
                              />
                              <AdminInput
                                placeholder="التفاصيل / الوصف"
                                value={formData.content || ""}
                                onChange={(v) =>
                                  setFormData({ ...formData, content: v })
                                }
                              />
                              <AdminInput
                                placeholder="الرابط (اختياري)"
                                value={formData.url || ""}
                                onChange={(v) =>
                                  setFormData({ ...formData, url: v })
                                }
                              />
                              <AdminInput
                                placeholder="نص الزر (اختياري)"
                                value={formData.buttonText || ""}
                                onChange={(v) =>
                                  setFormData({ ...formData, buttonText: v })
                                }
                              />
                            </>
                          )}
                        </div>
                      )}

                      {adminView !== "banners" && (
                          <div className="grid grid-cols-1 gap-4">
                            {adminView !== "market_stores" &&
                              adminView !== "market_products" &&
                              adminView !== "hospital_doctors" &&
                              adminView !== "govAnnouncements" &&
                              adminView !== "serviceOffers" &&
                              adminView !== "notifications" &&
                              adminView !== "market_listings" && (
                                <>
                                  <AdminInput
                                    placeholder="المهنة / الاختصاص / الوصف القصير"
                                    value={formData.craft || formData.subtitle || formData.carType || ""}
                                    onChange={(v) =>
                                      setFormData({ ...formData, craft: v, subtitle: v, carType: v })
                                    }
                                  />
                                  <AdminInput
                                    placeholder="رقم الهاتف"
                                    value={formData.phone1 || formData.phone || ""}
                                    onChange={(v) =>
                                      setFormData({ ...formData, phone1: v, phone: v })
                                    }
                                  />
                                  <AdminInput
                                    placeholder="العنوان"
                                    value={formData.location || ""}
                                    onChange={(v) =>
                                      setFormData({ ...formData, location: v })
                                    }
                                  />
                                  {adminView === "doctors" && (
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="w-16 h-16 bg-white rounded-xl shadow-sm overflow-hidden flex items-center justify-center relative border border-slate-100">
                                          {formData.image ? (
                                            <img
                                              src={formData.image}
                                              className="w-full h-full object-cover"
                                              alt=""
                                            />
                                          ) : (
                                            <ImageIcon className="text-slate-300" size={24} />
                                          )}
                                          <input
                                            type="file"
                                            onChange={(e) => handleFileUpload(e, "image")}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/*"
                                          />
                                        </div>
                                        <div className="flex-1 text-right">
                                          <p className="text-xs font-black text-slate-700">صورة الطبيب الشخصية</p>
                                          <p className="text-[10px] text-slate-400 mt-1">اضغط على المربع لرفع الصورة</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {adminView === "craftsmen" && (
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="w-16 h-16 bg-white rounded-xl shadow-sm overflow-hidden flex items-center justify-center relative border border-slate-100">
                                          {formData.image ? (
                                            <img
                                              src={formData.image}
                                              className="w-full h-full object-cover"
                                              alt=""
                                            />
                                          ) : (
                                            <ImageIcon className="text-slate-300" size={24} />
                                          )}
                                          <input
                                            type="file"
                                            onChange={(e) => handleFileUpload(e, "image")}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/*"
                                          />
                                        </div>
                                        <div className="flex-1 text-right">
                                          <p className="text-xs font-black text-slate-700">صورة الأسطى أو المحل</p>
                                          <p className="text-[10px] text-slate-400 mt-1">اضغط على المربع لرفع الصورة</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {adminView === "taxis" && (
                                    <div className="space-y-3">
                                      <div className="space-y-1.5 text-right w-full">
                                        <label className="text-xs font-black text-slate-400 block pr-2">تصنيف التكسي / النقل</label>
                                        <select
                                          dir="rtl"
                                          className="w-full h-14 bg-white rounded-2xl border border-slate-100 text-sm font-bold shadow-sm focus:border-shirqat-primary outline-none transition-all px-5"
                                          value={formData.category || formData.type || "خصوصي"}
                                          onChange={(e) => setFormData({ ...formData, category: e.target.value, type: e.target.value })}
                                        >
                                          <option value="خصوصي">خصوصي</option>
                                          <option value="دليفري">دليفري</option>
                                          <option value="ستاركس">ستاركس</option>
                                          <option value="حمل">حمل</option>
                                        </select>
                                      </div>
                                      <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="w-16 h-16 bg-white rounded-xl shadow-sm overflow-hidden flex items-center justify-center relative border border-slate-100">
                                          {formData.image ? (
                                            <img
                                              src={formData.image}
                                              className="w-full h-full object-cover"
                                              alt=""
                                            />
                                          ) : (
                                            <ImageIcon className="text-slate-300" size={24} />
                                          )}
                                          <input
                                            type="file"
                                            onChange={(e) => handleFileUpload(e, "image")}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/*"
                                          />
                                        </div>
                                        <div className="flex-1 text-right">
                                          <p className="text-xs font-black text-slate-700">صورة سائق التكسي أو السيارة</p>
                                          <p className="text-[10px] text-slate-400 mt-1">اضغط على المربع لرفع الصورة</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {adminView === "doctors" && (
                                    <div className="space-y-3">
                                      <div
                                        onClick={() => setFormData({ ...formData, showInHome: !formData.showInHome })}
                                        className={`flex items-center justify-between border rounded-2xl px-5 py-4 cursor-pointer transition-colors ${formData.showInHome ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100"}`}
                                      >
                                        <button
                                          type="button"
                                          className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 flex-shrink-0 ${formData.showInHome ? "bg-amber-500" : "bg-slate-200"}`}
                                        >
                                          <div
                                            className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${formData.showInHome ? "translate-x-6" : "translate-x-0"}`}
                                          />
                                        </button>
                                        <span className="text-sm font-black text-slate-800 text-right">
                                          عرض في الصفحة الرئيسية (أبرز الأطباء) ⭐
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4">
                                        <span className="text-sm font-black text-slate-600">
                                          إضافة خريطة للموقع 🗺️
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const nextShow = !showMap;
                                            setShowMap(nextShow);
                                            if (nextShow) {
                                              setFormData({
                                                ...formData,
                                                lat: formData.lat || 35.5033,
                                                lng: formData.lng || 43.2389,
                                              });
                                            } else {
                                              setFormData({
                                                ...formData,
                                                lat: null,
                                                lng: null,
                                              });
                                            }
                                          }}
                                          className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 flex-shrink-0 ${showMap ? "bg-emerald-500" : "bg-slate-200"}`}
                                        >
                                          <div
                                            className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${showMap ? "translate-x-6" : "translate-x-0"}`}
                                          />
                                        </button>
                                      </div>

                                      {showMap && (
                                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-3 text-right">
                                          <span className="text-xs font-black text-slate-700 block">
                                            تحديد الموقع الجغرافي على خريطة
                                            الشرقاط 🗺️ (انقر على الخريطة لتثبيت
                                            الدبوس)
                                          </span>
                                          <MapPicker
                                            lat={formData.lat || 35.5033}
                                            lng={formData.lng || 43.2389}
                                            onChange={(latVal, lngVal) => {
                                              setFormData({
                                                ...formData,
                                                lat: latVal,
                                                lng: lngVal,
                                              });
                                            }}
                                            color={
                                              adminView === "doctors"
                                                ? "#0ea5e9"
                                                : "#f59e0b"
                                            }
                                            height="250px"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}

                            {adminView === "notifications" && (
                              <div className="space-y-4 text-right">
                                {/* Single Field: Notification Message Textarea */}
                                <div className="space-y-1.5">
                                  <label className="text-xs font-black text-slate-400 block pr-2">نص رسالة الإشعار ✉️</label>
                                  <textarea
                                    dir="rtl"
                                    className="w-full min-h-[140px] p-4 bg-white rounded-2xl border border-slate-100 text-sm font-bold shadow-sm focus:border-rose-500 outline-none transition-all resize-none text-slate-800"
                                    placeholder="اكتب هنا نص محتوى الإشعار..."
                                    value={formData.message || ""}
                                    onChange={(e) => {
                                      const msg = e.target.value;
                                      setFormData({
                                        ...formData,
                                        message: msg,
                                        title: "إشعار جديد 🔔",
                                        name: "إشعار جديد"
                                      });
                                    }}
                                  />
                                </div>

                                {/* Selection for Automatic Notification Presets! */}
                                <div className="bg-slate-50 border border-slate-100 p-4 rounded-[1.5rem] space-y-3 mt-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-slate-700">مولّد الإشعارات التلقائية ⚡</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                                    اضغط على أحد قوالب التشغيل التلقائي أدناه لتوليد إشعار فوري يعتمد على قاعدة بيانات ومعلومات تطبيق الشرقاط:
                                  </p>
                                  <div className="grid grid-cols-1 gap-2">
                                    {[
                                      {
                                        title: "إشعار تلقائي: توفر الوقود الآن ⛽",
                                        msg: "إشعار تلقائي: يتوفر الآن بنزين عادي ومحسن في محطة الشرقاط المركزية دون ازدحام يذكر.",
                                        label: "وقود متوفر ⛽"
                                      },
                                      {
                                        title: "إشعار تلقائي: عروض تسوق مميزة 🍔",
                                        msg: "إشعار تلقائي: تم نشر عروض طعام ووجبات سريعة جديدة بخصومات تصل إلى 20% في قسم عروض اليوم.",
                                        label: "عروض وجبات 🍔"
                                      },
                                      {
                                        title: "إشعار تلقائي: جدول الأطباء المناوبين 🏥",
                                        msg: "إشعار تلقائي: تم تحديث قوائم الدليل الطبي والأطباء المتواجدين في عيادات الشرقاط الاستشارية اليوم.",
                                        label: "مناوبات طبية 🏥"
                                      },
                                      {
                                        title: "إشعار تلقائي: عاجل طوارئ وخدمات 🚨",
                                        msg: "إشعار تلقائي: تنويه للمواطنين بأهمية تحديث قائمة أرقام الطوارئ والاتصال السريع المتاحة في الدليل الموحد.",
                                        label: "طوارئ وخدمات 🚨"
                                      }
                                    ].map((preset, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                          setFormData({
                                            ...formData,
                                            title: preset.title,
                                            name: preset.title,
                                            message: preset.msg
                                          });
                                        }}
                                        className="bg-white border border-slate-200 hover:border-rose-300 p-3 rounded-xl text-right text-xs font-bold hover:bg-rose-50/50 transition-all flex items-center justify-between shadow-sm active:scale-95 cursor-pointer"
                                      >
                                        <span className="text-slate-800 font-black">{preset.title}</span>
                                        <span className="text-[9px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md font-extrabold">{preset.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {adminView === "serviceOffers" && (
                              <div className="space-y-4">
                                <AdminInput
                                  placeholder="العنوان (مثال: تصميم مواقع، صيانة سيارات)"
                                  value={formData.title || ""}
                                  onChange={(v) => setFormData({ ...formData, title: v })}
                                />
                                <AdminInput
                                  placeholder="وصف فرعي"
                                  value={formData.subtitle || ""}
                                  onChange={(v) => setFormData({ ...formData, subtitle: v })}
                                />
                                <div className="bg-slate-50 border border-slate-100 p-2 rounded-2xl">
                                  <textarea
                                    dir="rtl"
                                    placeholder="وصف تفصيلي للخدمة"
                                    className="w-full h-32 bg-transparent text-slate-800 text-sm font-bold resize-none outline-none p-2"
                                    value={formData.description || ""}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                  />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="text-right">
                                    <AdminInput
                                      placeholder="رقم الهاتف للاتصال المباشر"
                                      value={formData.whatsappNumber || ""}
                                      onChange={(v) => setFormData({ ...formData, whatsappNumber: v })}
                                    />
                                  </div>
                                  <AdminInput
                                    placeholder="نص زر الاتصال (مثال: اتصل الآن)"
                                    value={formData.buttonText || ""}
                                    onChange={(v) => setFormData({ ...formData, buttonText: v })}
                                  />
                                  <AdminInput
                                    placeholder="السعر (مثال: يبدأ من 5000)"
                                    value={formData.price || ""}
                                    onChange={(v) => setFormData({ ...formData, price: v })}
                                  />
                                  <div className="col-span-1 md:col-span-2 text-right">
                                    <label className="flex items-center gap-3 text-sm font-bold text-slate-700 justify-end cursor-pointer py-1">
                                      <span className="text-right">عرض في الصفحة الرئيسية (عرض مميز) ⭐</span>
                                      <input
                                        type="checkbox"
                                        checked={formData.showInHome ?? false}
                                        onChange={(e) =>
                                          setFormData({
                                            ...formData,
                                            showInHome: e.target.checked,
                                          })
                                        }
                                        className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                                      />
                                    </label>
                                  </div>
                                  <div className="space-y-1.5 text-right w-full">
                                    <label className="text-xs font-black text-slate-400 block pr-2">تصنيف الخدمة / العرض</label>
                                    <select
                                      dir="rtl"
                                      className="w-full h-14 bg-white rounded-2xl border border-slate-100 text-sm font-bold shadow-sm focus:border-shirqat-primary outline-none transition-all px-5"
                                      value={formData.tag || ""}
                                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                                    >
                                      <option value="">عام (بدون تصنيف محدد)</option>
                                      <option value="عروض">عروض</option>
                                      <option value="أقساط">أقساط</option>
                                      <option value="توصيل">توصيل</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1.5 text-right w-full col-span-1 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-400 block pr-2">تاريخ النشر</label>
                                    <input
                                      type="date"
                                      value={formData.publishDate || ""}
                                      onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                                      className="w-full h-14 bg-white rounded-2xl border border-slate-100 text-sm font-bold shadow-sm focus:border-shirqat-primary outline-none transition-all px-5 text-right"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {adminView === "market_listings" && (
                              <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                  <div className="w-16 h-16 bg-white rounded-xl shadow-sm overflow-hidden flex items-center justify-center relative border border-slate-100">
                                    {formData.image ? (
                                      <img
                                        src={formData.image}
                                        className="w-full h-full object-cover"
                                        alt=""
                                      />
                                    ) : (
                                      <ImageIcon className="text-slate-300" size={24} />
                                    )}
                                    <input
                                      type="file"
                                      onChange={(e) => handleFileUpload(e, "image")}
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                      accept="image/*"
                                    />
                                  </div>
                                  <div className="flex-1 text-right">
                                    <p className="text-xs font-black text-slate-700">الصورة الرئيسية للإعلان</p>
                                    <p className="text-[10px] text-slate-400 mt-1">اضغط على المربع لرفع صورة الإعلان</p>
                                  </div>
                                </div>
                                <AdminInput
                                  placeholder="عنوان الإعلان المبوب (مثال: تويوتا كورولا 2022 وارد خليجي)"
                                  value={formData.title || ""}
                                  onChange={(v) => setFormData({ ...formData, title: v })}
                                />
                                <div className="space-y-1.5 text-right w-full">
                                  <label className="text-xs font-bold text-slate-400 block pr-2">قسم الإعلان المبوب</label>
                                  <select
                                    dir="rtl"
                                    className="w-full h-14 bg-white rounded-2xl border border-slate-100 text-sm font-bold shadow-sm focus:border-shirqat-primary outline-none transition-all px-5"
                                    value={formData.category || "سيارات"}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                  >
                                    <option value="سيارات">سيارات 🚗</option>
                                    <option value="عقارات">عقارات 🏠</option>
                                    <option value="موبايلات">موبايلات 📱</option>
                                  </select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <AdminInput
                                    placeholder="السعر (مثال: $ 16,500 أو 85,000,000 د.ع)"
                                    value={formData.price || ""}
                                    onChange={(v) => setFormData({ ...formData, price: v })}
                                  />
                                  <AdminInput
                                    placeholder="الموقع / المنطقة (مثال: الشرقاط - الساحل الأيمن)"
                                    value={formData.location || ""}
                                    onChange={(v) => setFormData({ ...formData, location: v })}
                                  />
                                  <div className="col-span-1 md:col-span-2">
                                    <AdminInput
                                      placeholder="رقم الهاتف للاتصال والواتساب"
                                      value={formData.phone || ""}
                                      onChange={(v) => setFormData({ ...formData, phone: v, whatsappNumber: v })}
                                    />
                                  </div>
                                </div>
                                <div className="col-span-1 md:col-span-2 text-right">
                                  <label className="flex items-center gap-3 text-sm font-bold text-slate-700 justify-end cursor-pointer py-1">
                                    <span className="text-right">عرض في الصفحة الرئيسية ⭐</span>
                                    <input
                                      type="checkbox"
                                      checked={formData.showInHome ?? false}
                                      onChange={(e) =>
                                        setFormData({
                                          ...formData,
                                          showInHome: e.target.checked,
                                        })
                                      }
                                      className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                                    />
                                  </label>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 p-2 rounded-2xl">
                                  <textarea
                                    dir="rtl"
                                    placeholder="التفاصيل والوصف الكامل للإعلان المبوب"
                                    className="w-full h-32 bg-transparent text-slate-800 text-sm font-bold resize-none outline-none p-2"
                                    value={formData.description || ""}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                  />
                                </div>
                              </div>
                            )}

                            {adminView === "govAnnouncements" && (
                              <div className="space-y-4">
                                <AdminInput
                                  placeholder="اسم المحطة (مثال: محطة تعبئة وقود الشرقاط الحكومية)"
                                  value={formData.title || ""}
                                  onChange={(v) => setFormData({ ...formData, title: v })}
                                />
                                <AdminInput
                                  placeholder="موقع المحطة / المنطقة (مثال: الشرقاط - الساحل الأيمن)"
                                  value={formData.entity || ""}
                                  onChange={(v) => setFormData({ ...formData, entity: v })}
                                />
                                <div className="space-y-1.5 text-right w-full">
                                  <label className="text-xs font-black text-slate-400 block pr-2">نوع المحطة</label>
                                  <select
                                    dir="rtl"
                                    className="w-full h-14 bg-white rounded-2xl border border-slate-100 text-sm font-bold shadow-sm focus:border-shirqat-primary outline-none transition-all px-5"
                                    value={formData.category || "حكومية"}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                  >
                                    <option value="حكومية">حكومية</option>
                                    <option value="أهلية">أهلية</option>
                                    <option value="عام">عام</option>
                                  </select>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 p-2 rounded-2xl">
                                  <textarea
                                    dir="rtl"
                                    placeholder="تفاصيل المحطة أو نوع المنتوج المتوفر (مثال: بنزين عادي متوفر، بنزين محسن...)"
                                    className="w-full h-32 bg-transparent text-slate-800 text-sm font-bold resize-none outline-none p-2"
                                    value={formData.description || ""}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                  />
                                </div>
                                <div className="text-right">
                                  <AdminInput
                                    placeholder="رقم هاتف التواصل مع المحطة"
                                    value={formData.phoneNumber || ""}
                                    onChange={(v) => setFormData({ ...formData, phoneNumber: v })}
                                  />
                                </div>

                                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4">
                                  <span className="text-sm font-black text-slate-600">
                                    إضافة خريطة للموقع 🗺️
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextShow = !showMap;
                                      setShowMap(nextShow);
                                      if (nextShow) {
                                        setFormData({
                                          ...formData,
                                          lat: formData.lat || 35.5033,
                                          lng: formData.lng || 43.2389,
                                        });
                                      } else {
                                        setFormData({
                                          ...formData,
                                          lat: null,
                                          lng: null,
                                        });
                                      }
                                    }}
                                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 flex-shrink-0 ${showMap ? "bg-emerald-500" : "bg-slate-200"}`}
                                  >
                                    <div
                                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${showMap ? "translate-x-6" : "translate-x-0"}`}
                                    />
                                  </button>
                                </div>

                                {showMap && (
                                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-3 text-right">
                                    <span className="text-xs font-black text-slate-700 block">
                                      تحديد الموقع الجغرافي على خريطة الشرقاط 🗺️ (انقر على الخريطة لتثبيت الدبوس)
                                    </span>
                                    <MapPicker
                                      lat={formData.lat || 35.5033}
                                      lng={formData.lng || 43.2389}
                                      onChange={(latVal, lngVal) => {
                                        setFormData({
                                          ...formData,
                                          lat: latVal,
                                          lng: lngVal,
                                        });
                                      }}
                                      color="#10b981"
                                      height="250px"
                                    />
                                  </div>
                                )}
                              </div>
                            )}



                            {adminView === "doctors" && (
                              <>
                                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormData({
                                        ...formData,
                                        isBookingEnabled:
                                          !formData.isBookingEnabled,
                                      })
                                    }
                                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 flex-shrink-0 ${formData.isBookingEnabled ? "bg-emerald-500" : "bg-slate-200"}`}
                                  >
                                    <div
                                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${formData.isBookingEnabled ? "translate-x-6" : "translate-x-0"}`}
                                    />
                                  </button>
                                  <span className="text-sm font-black text-slate-600 text-right">
                                    تفعيل خدمة الحجز الإلكتروني عبر واتساب
                                  </span>
                                </div>

                                {formData.isBookingEnabled && (
                                  <AdminInput
                                    placeholder="رقم واتساب الحجز (اختياري — الافتراضي: رقم الهاتف)"
                                    value={formData.whatsappBookingNumber || ""}
                                    onChange={(v) =>
                                      setFormData({
                                        ...formData,
                                        whatsappBookingNumber: v,
                                      })
                                    }
                                  />
                                )}
                              </>
                            )}
                          </div>
                        )}

                      {adminView !== "hospital_doctors" &&
                        adminView !== "govAnnouncements" &&
                        adminView !== "serviceOffers" &&
                        adminView !== "notifications" &&
                        adminView !== "market_listings" && (
                          <AdminTextarea
                            placeholder="التفاصيل بالكامل"
                            value={
                              formData.description || formData.content || formData.notes || ""
                            }
                            onChange={(val) =>
                              setFormData({
                                ...formData,
                                description: val,
                                notes: val,
                                ...(adminView === "banners" ? { content: val } : {}),
                              })
                            }
                          />
                        )}



                      <div className="pt-6 flex gap-3">
                        <button
                          onClick={saveItem}
                          className="flex-1 bg-slate-900 text-white h-14 rounded-2xl font-black shadow-xl active:scale-95 transition-all text-center text-sm"
                        >
                          حفظ
                        </button>
                        <button
                          onClick={() => {
                            setIsAdding(false);
                            setEditingItem(null);
                            setFormData({});
                          }}
                          className="flex-1 bg-slate-100 text-slate-500 h-14 rounded-2xl font-black active:scale-95 transition-all text-center text-sm"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {adminView === "hospital_doctors" && (
                      <div className="flex bg-slate-100 p-1 rounded-2xl mb-4">
                        <button
                          onClick={() => setHospitalSubTab("doctors")}
                          className={`flex-1 py-2 rounded-xl text-xs font-black ${hospitalSubTab === "doctors" ? "bg-white shadow-sm" : ""}`}
                        >
                          الأطباء
                        </button>
                        <button
                          onClick={() => setHospitalSubTab("info")}
                          className={`flex-1 py-2 rounded-xl text-xs font-black ${hospitalSubTab === "info" ? "bg-white shadow-sm" : ""}`}
                        >
                          الإدارة والضبط
                        </button>
                      </div>
                    )}
                    {adminView === "market_products" && adminSelectedStore && (
                      <div
                        className={`p-4 rounded-3xl text-right mb-4 border ${adminSelectedStore.id === "general" ? "bg-purple-50 border-purple-100" : "bg-orange-50 border-orange-100"}`}
                      >
                        <p
                          className={`text-xs font-bold ${adminSelectedStore.id === "general" ? "text-purple-800" : "text-orange-800"}`}
                        >
                          {adminSelectedStore.id === "general" ? (
                            <span>
                              نظام النشر المباشر:{" "}
                              <span className="font-semibold">
                                العروض والتبليغات والتحديثات العامة 📣
                              </span>
                            </span>
                          ) : (
                            <span>
                              إدارة وجبات مطعم:{" "}
                              <span className="font-black">
                                {adminSelectedStore.name} 🍕
                              </span>
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    <div className="relative">
                      <LayoutDashboard
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="بحث في القائمة..."
                        className="w-full h-14 bg-white border border-slate-100 rounded-2xl pr-12 pl-4 text-sm font-bold focus:outline-none focus:border-shirqat-primary shadow-sm text-right"
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-3 text-right">
                      {(() => {
                        if (
                          adminView === "hospital_doctors" &&
                          hospitalSubTab === "info"
                        ) {
                          return (
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                              <h4 className="font-black text-slate-800 text-sm mb-2">
                                معلومات الإدارة وضبط المستشفى
                              </h4>
                              
                              {/* Hospital Image Selector */}
                              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="w-16 h-16 bg-white rounded-xl shadow-sm overflow-hidden flex items-center justify-center relative border border-slate-100 shrink-0">
                                  {hospImage ? (
                                    <img
                                      src={hospImage}
                                      className="w-full h-full object-cover"
                                      alt=""
                                    />
                                  ) : (
                                    <ImageIcon
                                      className="text-slate-300"
                                      size={24}
                                    />
                                  )}
                                  <input
                                    type="file"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          const img = new Image();
                                          img.onload = () => {
                                            const canvas = document.createElement("canvas");
                                            let width = img.width;
                                            let height = img.height;
                                            const maxDim = 800;
                                            if (width > height && width > maxDim) {
                                              height *= maxDim / width;
                                              width = maxDim;
                                            } else if (height > maxDim) {
                                              width *= maxDim / height;
                                              height = maxDim;
                                            }
                                            canvas.width = width;
                                            canvas.height = height;
                                            const ctx = canvas.getContext("2d");
                                            ctx?.drawImage(img, 0, 0, width, height);
                                            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
                                            setHospImage(compressedBase64);
                                          };
                                          img.src = reader.result as string;
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    accept="image/*"
                                  />
                                </div>
                                <div className="flex-1 text-right">
                                  <p className="text-xs font-black text-slate-800">
                                    صورة المستشفى المرفقة
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                    انقر على المربع لتغيير الصورة
                                  </p>
                                </div>
                              </div>

                               <AdminInput
                                placeholder="اسم مدير المستشفى"
                                value={hospDirector}
                                onChange={setHospDirector}
                              />
                              <AdminInput
                                placeholder="رقم الشكاوى والاستفسار"
                                value={hospPhone}
                                onChange={setHospPhone}
                              />

                              {showSavedMsg && (
                                <div className="bg-emerald-500/15 text-emerald-600 dark:bg-emerald-950/25 dark:text-emerald-400 p-4 rounded-2xl text-center font-bold text-xs animate-in fade-in duration-300 border border-emerald-500/10">
                                  ✅ تم حفظ معلومات وضبط المستشفى بنجاح!
                                </div>
                              )}

                              {isHospitalInfoModified && (
                                <button
                                  onClick={handleSaveHospitalInfo}
                                  className="w-full bg-slate-900 text-white h-14 rounded-2xl font-black hover:bg-slate-800 active:scale-95 transition-all animate-in fade-in"
                                >
                                  حفظ المعلومات
                                </button>
                              )}
                            </div>
                          );
                        }

                        let items: any[] = [];
                        if (adminView === "doctors") items = doctors;
                        else if (adminView === "taxis") items = taxis;
                        else if (adminView === "craftsmen") items = craftsmen || [];
                        else if (adminView === "govAnnouncements") items = govAnnouncements;
                        else if (adminView === "serviceOffers") items = serviceOffers;
                        else if (adminView === "notifications") items = notifications;
                        else if (adminView === "market_stores")
                          items = marketStores;
                        else if (adminView === "market_listings")
                          items = marketListings || [];
                        else if (adminView === "market_products")
                          items = adminMarketProducts;
                        else if (
                          adminView === "hospital_doctors" &&
                          hospitalSubTab === "doctors"
                        )
                          items = hospitalDoctors;
                        else items = banners || [];

                        // If donors, we need to adapt search/render
                        let filtered = (items || []).filter((i: any) =>
                          (i.name || i.title || i.description || i.message || "")
                            .toLowerCase()
                            .includes(adminSearch.toLowerCase()),
                        );

                        // Sort elements so newest is at the top (better UX for admin)
                        filtered = filtered.sort((a: any, b: any) => {
                          const timeA = a.timestamp || a.createdAt || 0;
                          const timeB = b.timestamp || b.createdAt || 0;
                          if (timeA && timeB) {
                            return timeB - timeA;
                          }
                          return 0;
                        });

                        return (
                          <>


                            {filtered.map((item: any) => {
                              const isExpanded = expandedItemId === item.id;
                              return (
                                <div
                                  key={item.id}
                                  className="bg-white border border-slate-100 p-3 rounded-3xl flex flex-col gap-3 shadow-sm transition-all"
                                >
                                  {/* Header Row */}
                                  <div className="flex items-center justify-between w-full">
                                    <div 
                                      onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                                      className="flex items-center gap-3 cursor-pointer flex-1 text-right select-none"
                                    >
                                      <div className="w-12 h-12 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center shrink-0">
                                        {item.image ||
                                        item.logoImage ||
                                        (item.images && item.images[0]) ? (
                                          <img
                                            src={
                                              item.image ||
                                              item.logoImage ||
                                              (item.images && item.images[0])
                                            }
                                            className="w-full h-full object-cover"
                                            alt=""
                                          />
                                        ) : (
                                          <Database
                                            className="text-slate-200"
                                            size={20}
                                          />
                                        )}
                                      </div>
                                      <div className="flex flex-col text-right font-display gap-0.5 flex-1 min-w-0">
                                        <span className="text-sm font-black text-slate-800 flex items-center gap-1.5 justify-start flex-wrap">
                                          <span>{item.name || item.title || `(عنصر بدون عنوان - المعرّف: ${item.id})`}</span>
                                          {item.showInHome && (
                                            <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[9px] font-black flex items-center gap-0.5 border border-amber-200 shrink-0">
                                              <Star size={10} className="fill-amber-500 text-amber-500" />
                                              <span>في الرئيسية</span>
                                            </span>
                                          )}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 justify-start">
                                          {isExpanded ? (
                                            <span className="text-[9px] text-rose-600 font-extrabold">إغلاق التفاصيل ▲</span>
                                          ) : (
                                            <span className="text-[9px] text-shirqat-primary font-extrabold flex items-center gap-1">اضغط للتفاصيل الكاملة ▼</span>
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="flex gap-2 items-center shrink-0">
                                      {(adminView === "doctors" || adminView === "market_stores" || adminView === "serviceOffers" || adminView === "taxis" || adminView === "craftsmen" || adminView === "market_listings") && (
                                        <button
                                          type="button"
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            const colMap: Record<string, string> = {
                                              doctors: "doctors",
                                              market_stores: "market_stores",
                                              serviceOffers: "serviceOffers",
                                              taxis: "taxis",
                                              craftsmen: "craftsmen",
                                              market_listings: "market_listings",
                                            };
                                            const col = colMap[adminView];
                                            const newShowInHome = !item.showInHome;
                                            try {
                                              if (col) {
                                                await firebaseService.updateDocument(col, item.id, { showInHome: newShowInHome });
                                              }
                                              item.showInHome = newShowInHome;
                                              if (adminView === "doctors" && setDoctors && doctors) {
                                                setDoctors(doctors.map((d: any) => (d.id === item.id ? { ...d, showInHome: newShowInHome } : d)));
                                              } else if (adminView === "market_stores" && setMarketStores && marketStores) {
                                                setMarketStores(marketStores.map((s: any) => (s.id === item.id ? { ...s, showInHome: newShowInHome } : s)));
                                              } else if (adminView === "serviceOffers" && setServiceOffers && serviceOffers) {
                                                setServiceOffers(serviceOffers.map((so: any) => (so.id === item.id ? { ...so, showInHome: newShowInHome } : so)));
                                              } else if (adminView === "craftsmen" && setCraftsmen && craftsmen) {
                                                setCraftsmen(craftsmen.map((c: any) => (c.id === item.id ? { ...c, showInHome: newShowInHome } : c)));
                                              } else if (adminView === "market_listings" && setMarketListings && marketListings) {
                                                setMarketListings(marketListings.map((ml: any) => (ml.id === item.id ? { ...ml, showInHome: newShowInHome } : ml)));
                                              }
                                            } catch (err) {
                                              console.error("Error toggling showInHome:", err);
                                            }
                                          }}
                                          className={`p-2.5 rounded-xl text-xs font-black flex items-center gap-1 active:scale-95 transition-all cursor-pointer ${
                                            item.showInHome
                                              ? "bg-amber-100 text-amber-700 border border-amber-300"
                                              : "bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                                          }`}
                                          title={item.showInHome ? "إلغاء التمييز في الرئيسية" : "تمييز في الصفحة الرئيسية"}
                                        >
                                          <Star size={16} className={item.showInHome ? "fill-amber-500 text-amber-500" : ""} />
                                        </button>
                                      )}
                                      {adminView === "market_stores" && (
                                        <button
                                          onClick={() => {
                                            if (setAdminSelectedStore)
                                              setAdminSelectedStore(item);
                                            setAdminView("market_products");
                                          }}
                                          className="p-2.5 text-orange-500 bg-orange-50 rounded-xl active:scale-95 transition-all"
                                        >
                                          <LayoutDashboard size={16} />
                                        </button>
                                      )}

                                      {(adminView !== "hospital_doctors" ||
                                        (adminView === "hospital_doctors" &&
                                          hospitalSubTab === "doctors")) && (
                                        <button
                                          onClick={() => startEdit(item)}
                                          className="p-2.5 text-sky-500 bg-sky-50 rounded-xl active:scale-95 transition-all"
                                        >
                                          <SettingsIcon size={16} />
                                        </button>
                                      )}
                                      {(adminView !== "hospital_doctors" ||
                                        (adminView === "hospital_doctors" &&
                                          hospitalSubTab === "doctors")) && (
                                        <button
                                          onClick={() =>
                                            deleteItem(item.id, adminView)
                                          }
                                          className={`p-2.5 rounded-xl active:scale-95 transition-all ${confirmDelete?.id === item.id ? "bg-rose-500 text-white font-bold text-xs px-4" : "text-rose-500 bg-rose-50"}`}
                                        >
                                          {confirmDelete?.id === item.id ? (
                                            "تأكيد"
                                          ) : (
                                            <Trash2 size={16} />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Detail view area */}
                                  {isExpanded && (
                                    <div className="border-t border-slate-50 pt-3 text-right bg-slate-50/50 p-3 rounded-2xl space-y-2 text-xs">
                                      {adminView === "banners" && (
                                        <p className="text-slate-500"><span className="font-extrabold text-slate-700">عدد النقرات:</span> {item.clicks || 0}</p>
                                      )}
                                      {adminView === "hospital_doctors" && hospitalSubTab === "doctors" && (
                                        <div className="text-slate-500 space-y-1">
                                          <p><span className="font-extrabold text-slate-700">الاختصاص:</span> {item.specialty || "غير محدد"}</p>
                                          <p><span className="font-extrabold text-slate-700">الدوام:</span> {item.shift || "غير محدد"}</p>
                                        </div>
                                      )}
                                      {adminView === "serviceOffers" && (
                                        <div className="text-slate-500 space-y-1">
                                          <p><span className="font-extrabold text-slate-700">التصنيف:</span> {item.tag || "غير محدد"}</p>
                                          <p><span className="font-extrabold text-slate-700">السعر:</span> {item.price || "غير محدد"}</p>
                                          <p><span className="font-extrabold text-slate-700">الواتساب:</span> <span dir="ltr">{item.whatsappNumber}</span></p>
                                        </div>
                                      )}
                                      {adminView === "market_listings" && (
                                        <div className="text-slate-500 space-y-1">
                                          <p><span className="font-extrabold text-slate-700">القسم:</span> {item.category || "غير محدد"}</p>
                                          <p><span className="font-extrabold text-slate-700">السعر:</span> {item.price || "غير محدد"}</p>
                                          <p><span className="font-extrabold text-slate-700">الموقع:</span> {item.location || "غير محدد"}</p>
                                          <p><span className="font-extrabold text-slate-700">رقم الهاتف والواتساب:</span> <span dir="ltr">{item.phone || item.whatsappNumber || "غير محدد"}</span></p>
                                        </div>
                                      )}
                                      
                                      {/* Subtitles & Descriptions */}
                                      <div className="text-slate-600 space-y-1">
                                        {item.subtitle && (
                                          <p><span className="font-extrabold text-slate-700">العنوان الفرعي:</span> {item.subtitle}</p>
                                        )}
                                        {item.craft && (
                                          <p><span className="font-extrabold text-slate-700">المهنة:</span> {item.craft}</p>
                                        )}
                                        {item.entity && (
                                          <p><span className="font-extrabold text-slate-700">{adminView === "govAnnouncements" ? "الموقع" : "السعر أو الجهة المعلنة"}:</span> {item.entity}</p>
                                        )}
                                        {item.category && (
                                          <p><span className="font-extrabold text-slate-700">التصنيف:</span> {item.category}</p>
                                        )}
                                        {(item.phone || item.phoneNumber || item.phone1) && (
                                          <p dir="ltr" className="text-right"><span className="font-extrabold text-slate-700">الهاتف:</span> {item.phone || item.phoneNumber || item.phone1}</p>
                                        )}
                                        {item.price && (
                                          <p><span className="font-extrabold text-slate-700">تفاصيل السعر:</span> {item.price}</p>
                                        )}
                                        {item.lat && item.lng && (
                                          <p className="text-emerald-600 font-bold flex items-center justify-end gap-1">
                                            <span>📍</span>
                                            <span>تم تحديد الموقع الجغرافي ({item.lat.toFixed(4)}, {item.lng.toFixed(4)})</span>
                                          </p>
                                        )}
                                        {(item.description || item.content || item.summary || item.brief || item.message) && (
                                          <div className="bg-white p-3 rounded-2xl border border-slate-100 mt-2 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed shadow-inner">
                                            <span className="font-black block text-[10px] text-slate-400 mb-1">التفاصيل أو الوصف الكامل:</span>
                                            {item.description || item.content || item.summary || item.brief || item.message}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

      </div>


    </div>
  );
};

export const AdminInput = ({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`w-full h-14 bg-white rounded-2xl border border-slate-100 text-sm font-bold shadow-sm focus:border-shirqat-primary outline-none transition-all px-5 text-right ${placeholder === "وصف فرعي" ? "hidden" : ""}`}
  />
);

export const AdminTextarea = ({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full p-5 bg-white rounded-3xl border border-slate-100 text-sm font-bold shadow-sm h-40 focus:border-shirqat-primary outline-none transition-all resize-none text-right"
  />
);

export const AdminSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) => (
  <div className="space-y-1.5 w-full text-right">
    <label className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-widest">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-14 bg-white rounded-2xl border border-slate-100 text-sm font-black shadow-sm outline-none px-5 appearance-none focus:border-shirqat-primary transition-all pr-5 text-slate-800 text-right"
      >
        <option value="" disabled>
          اختر...
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
    </div>
  </div>
);

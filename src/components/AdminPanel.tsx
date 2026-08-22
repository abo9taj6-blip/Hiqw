import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  LayoutDashboard,
  Bell,
  Stethoscope,
  Car,
  ImageIcon,
  ChevronRight,
  Plus,
  X,
  Trash2,
  Tag,
  Zap,
  FileOutput,
  FileInput,
  Search,
  ShoppingBag,
  Wrench,
  ChevronDown,
  Star,
  Database,
  Store,
  ArrowRight,
  Edit3,
  Check,
  PackageCheck,
  Sparkles,
  Hospital,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import {
  Doctor,
  BannerAd,
  Notification,
  DoctorSpecialty,
  ServiceCategory,
} from "../types";
import { excelService } from "../services/excelService";
import { firebaseService } from "../services/firebaseService";

interface AdminPanelProps {
  adminView:
    | "main"
    | "doctors"
    | "banners"
    | "settings"
    | "medical_complexes"
    | "market_stores"
    | "market_products"
    | "serviceOffers"
    | "offer_products"
    | "taxis"
    | "notifications";
  setAdminView: (
    view:
      | "main"
      | "doctors"
      | "banners"
      | "settings"
      | "medical_complexes"
      | "market_stores"
      | "market_products"
      | "serviceOffers"
      | "offer_products"
      | "taxis"
      | "notifications",
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
  serviceOffers: any[];
  banners: BannerAd[];
  appSettings: any;
  saveSettings: (v: any) => Promise<void>;
  medicalComplexes?: any[];
  setMedicalComplexes?: React.Dispatch<React.SetStateAction<any[]>>;
  marketStores: any[];
  adminSelectedStore?: any;
  setAdminSelectedStore?: (val: any) => void;
  adminMarketProducts?: any[];
  adminSelectedOffer?: any;
  setAdminSelectedOffer?: (val: any) => void;
  adminOfferProducts?: any[];
  taxis?: any[];
  notifications?: any[];
  govAnnouncements?: any[];
  setNotifications?: React.Dispatch<React.SetStateAction<any[]>>;
  seedDatabase: () => Promise<void>;
  setDoctors?: React.Dispatch<React.SetStateAction<any[]>>;
  setMarketStores?: React.Dispatch<React.SetStateAction<any[]>>;
  setServiceOffers?: React.Dispatch<React.SetStateAction<any[]>>;
  doctorSpecialtiesList?: DoctorSpecialty[];
  setDoctorSpecialtiesList?: React.Dispatch<React.SetStateAction<DoctorSpecialty[]>>;
  serviceCategoriesList?: ServiceCategory[];
  setServiceCategoriesList?: React.Dispatch<React.SetStateAction<ServiceCategory[]>>;
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
    doctors = [],
    serviceOffers = [],
    banners = [],
    medicalComplexes = [],
    marketStores = [],
    adminSelectedStore,
    setAdminSelectedStore,
    adminMarketProducts = [],
    adminSelectedOffer,
    setAdminSelectedOffer,
    adminOfferProducts = [],
    taxis = [],
    notifications = [],
    govAnnouncements = [],
    setDoctors,
    setMedicalComplexes,
    setMarketStores,
    setServiceOffers,
    doctorSpecialtiesList = [],
    setDoctorSpecialtiesList,
    serviceCategoriesList = [],
    setServiceCategoriesList,
  } = props;

  const [expandedItemId, setExpandedItemId] = React.useState<string | null>(null);
  const [doctorSubTab, setDoctorSubTab] = useState<"doctors" | "specialties">("doctors");
  const [newSpecialtyName, setNewSpecialtyName] = useState("");
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [editingSpecialtyId, setEditingSpecialtyId] = useState<string | null>(null);
  const [editingSpecialtyName, setEditingSpecialtyName] = useState("");

  // Service Categories Management State
  const [serviceSubTab, setServiceSubTab] = useState<"services" | "categories">("services");
  const [newServiceCategoryName, setNewServiceCategoryName] = useState("");
  const [serviceCategorySearch, setServiceCategorySearch] = useState("");
  const [editingServiceCategoryId, setEditingServiceCategoryId] = useState<string | null>(null);
  const [editingServiceCategoryName, setEditingServiceCategoryName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Specialty Management Actions
  const handleAddSpecialty = async () => {
    const trimmed = newSpecialtyName.trim();
    if (!trimmed) {
      alert("يرجى كتابة اسم التخصص");
      return;
    }
    if (doctorSpecialtiesList?.some((s) => s.name.trim().toLowerCase() === trimmed.toLowerCase())) {
      alert("هذا التخصص موجود مسبقاً في القائمة");
      return;
    }
    const newSpec: DoctorSpecialty = {
      id: `spec-${Date.now()}`,
      name: trimmed,
      order: (doctorSpecialtiesList?.length || 0) + 1,
      createdAt: Date.now(),
    };
    try {
      if (setDoctorSpecialtiesList) {
        setDoctorSpecialtiesList((prev) => [...prev, newSpec]);
      }
      await firebaseService.saveDocument("doctor_specialties", newSpec.id, newSpec);
      setNewSpecialtyName("");
      alert("✅ تمت إضافة التخصص بنجاح");
    } catch (e: any) {
      console.error(e);
      alert("فشل حفظ التخصص: " + (e?.message || String(e)));
    }
  };

  const handleUpdateSpecialty = async (id: string) => {
    const trimmed = editingSpecialtyName.trim();
    if (!trimmed) {
      alert("يرجى كتابة اسم التخصص الجديد");
      return;
    }
    try {
      if (setDoctorSpecialtiesList) {
        setDoctorSpecialtiesList((prev) =>
          prev.map((s) => (s.id === id ? { ...s, name: trimmed } : s))
        );
      }
      await firebaseService.updateDocument("doctor_specialties", id, { name: trimmed });
      setEditingSpecialtyId(null);
      setEditingSpecialtyName("");
      alert("✅ تم تعديل اسم التخصص بنجاح");
    } catch (e: any) {
      console.error(e);
      alert("فشل تعديل التخصص: " + (e?.message || String(e)));
    }
  };

  const handleDeleteSpecialty = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف تخصص "${name}"؟`)) return;
    try {
      if (setDoctorSpecialtiesList) {
        setDoctorSpecialtiesList((prev) => prev.filter((s) => s.id !== id));
      }
      await firebaseService.deleteDocument("doctor_specialties", id);
      alert("✅ تم حذف التخصص بنجاح");
    } catch (e: any) {
      console.error(e);
      alert("فشل حذف التخصص: " + (e?.message || String(e)));
    }
  };

  const handleResetDefaultSpecialties = async () => {
    if (!window.confirm("هل ترغب في استعادة وحفظ قائمة التخصصات الطبية الشاملة؟")) return;
    try {
      const defaultList: DoctorSpecialty[] = [
        "باطنية وقلبية",
        "جراحة عامة",
        "طب وجراحة العيون",
        "أطفال وحديثي الولادة",
        "نسائية وتوليد",
        "أسنان وجراحة الفم والفكين",
        "أنف وأذن وحنجرة",
        "جلدية وتجميل",
        "عظام ومفاصل وكسور",
        "مسالك بولية وتناسلية",
        "أعصاب ودماغ",
        "طب عام وطوارئ",
        "أشعة وسونار",
        "مختبرات وتحاليل طبية",
        "علاج طبيعي وتأهيل",
        "نفسية وسلوكية",
        "تغذية علاجية",
        "أورام وعلاج إشعاعي",
        "كلى ومسالك",
        "صدرية وجهاز تنفسي"
      ].map((name, i) => ({
        id: `spec-default-${i + 1}`,
        name,
        order: i + 1,
        createdAt: Date.now() + i,
      }));

      if (setDoctorSpecialtiesList) {
        setDoctorSpecialtiesList(defaultList);
      }
      for (const item of defaultList) {
        await firebaseService.saveDocument("doctor_specialties", item.id, item);
      }
      alert("✅ تم استعادة وحفظ قائمة التخصصات الافتراضية بنجاح");
    } catch (e: any) {
      console.error(e);
      alert("فشل استعادة التخصصات");
    }
  };

  // Service Category Management Actions
  const handleAddServiceCategory = async () => {
    const trimmed = newServiceCategoryName.trim();
    if (!trimmed) {
      alert("يرجى كتابة اسم الفئة / المهنة");
      return;
    }
    if (serviceCategoriesList?.some((s) => s.name.trim().toLowerCase() === trimmed.toLowerCase())) {
      alert("هذه الفئة موجودة مسبقاً في القائمة");
      return;
    }
    const newCat: ServiceCategory = {
      id: `scat-${Date.now()}`,
      name: trimmed,
      order: (serviceCategoriesList?.length || 0) + 1,
      createdAt: Date.now(),
    };
    try {
      if (setServiceCategoriesList) {
        setServiceCategoriesList((prev) => [...prev, newCat]);
      }
      await firebaseService.saveDocument("service_categories", newCat.id, newCat);
      setNewServiceCategoryName("");
      alert("✅ تمت إضافة الفئة بنجاح");
    } catch (e: any) {
      console.error(e);
      alert("فشل حفظ الفئة: " + (e?.message || String(e)));
    }
  };

  const handleUpdateServiceCategory = async (id: string) => {
    const trimmed = editingServiceCategoryName.trim();
    if (!trimmed) {
      alert("يرجى كتابة اسم الفئة الجديد");
      return;
    }
    try {
      if (setServiceCategoriesList) {
        setServiceCategoriesList((prev) =>
          prev.map((s) => (s.id === id ? { ...s, name: trimmed } : s))
        );
      }
      await firebaseService.updateDocument("service_categories", id, { name: trimmed });
      setEditingServiceCategoryId(null);
      setEditingServiceCategoryName("");
      alert("✅ تم تعديل الفئة بنجاح");
    } catch (e: any) {
      console.error(e);
      alert("فشل تعديل الفئة: " + (e?.message || String(e)));
    }
  };

  const handleDeleteServiceCategory = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف فئة "${name}"؟`)) return;
    try {
      if (setServiceCategoriesList) {
        setServiceCategoriesList((prev) => prev.filter((s) => s.id !== id));
      }
      await firebaseService.deleteDocument("service_categories", id);
      alert("✅ تم حذف الفئة بنجاح");
    } catch (e: any) {
      console.error(e);
      alert("فشل حذف الفئة: " + (e?.message || String(e)));
    }
  };

  const handleResetDefaultServiceCategories = async () => {
    if (!window.confirm("هل ترغب في استعادة وحفظ قائمة الفئات والمهن الخدمية الافتراضية؟")) return;
    try {
      const defaultList: ServiceCategory[] = [
        "سواق تكسي ونقل",
        "صيانة ومولدات",
        "حرفيين ومهن حرة",
        "توصيل وشحن",
        "خدمات عامة",
        "محلات وتجارية"
      ].map((name, i) => ({
        id: `scat-default-${i + 1}`,
        name,
        order: i + 1,
        createdAt: Date.now() + i,
      }));

      if (setServiceCategoriesList) {
        setServiceCategoriesList(defaultList);
      }
      for (const item of defaultList) {
        await firebaseService.saveDocument("service_categories", item.id, item);
      }
      alert("✅ تم استعادة وحفظ قائمة الفئات الافتراضية بنجاح");
    } catch (e: any) {
      console.error(e);
      alert("فشل استعادة الفئات");
    }
  };

  // Export to Excel
  const handleExport = () => {
    let data: any[] = [];
    let name = "";

    if (adminView === "doctors") {
      data = doctors;
      name = "الأطباء";
    } else if (adminView === "medical_complexes") {
      data = medicalComplexes || [];
      name = "المجمعات_الطبية";
    } else if (adminView === "market_stores") {
      data = marketStores;
      name = "المطاعم_والأسواق";
    } else if (adminView === "taxis") {
      data = taxis;
      name = "الخدمات_والمهن";
    } else if (adminView === "serviceOffers") {
      data = serviceOffers;
      name = "العروض_والخدمات";
    }

    if (data.length === 0) {
      alert("لا توجد بيانات لتصديرها في هذا القسم");
      return;
    }

    const exportData = data.map((item) => {
      const { image, images, logoImage, bannerImage, featuredImage, ...rest } = item;
      return rest;
    });

    excelService.exportToExcel(
      exportData,
      `Backup_${name}_${new Date().toISOString().split("T")[0]}`,
    );
  };

  // Import from Excel
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
      alert(`✅ تم قراءة ${rawData.length} عنصر من الملف بنجاح.`);
    } catch (err: any) {
      alert(`❌ حدث خطأ أثناء معالجة الملف: ${err?.message || "خطأ في قراءة الملف"}`);
    }
  };

  // All Main Admin Grid Sections Configuration
  const navSections = [
    {
      id: "medical_complexes",
      label: "المجمعات الطبية",
      subtitle: "دليل المجمعات والمراكز والمستشفيات والعيادات",
      icon: <Hospital size={24} />,
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
      accentBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      count: medicalComplexes?.length || 0,
    },
    {
      id: "market_stores",
      label: "المطاعم والأسواق والمحلات",
      subtitle: "دليل المطاعم، الكافيهات، والأنشطة التجارية في الشرقاط",
      icon: <ShoppingBag size={24} />,
      badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300",
      accentBg: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
      count: marketStores?.length || 0,
    },
    {
      id: "serviceOffers",
      label: "العروض والخدمات",
      subtitle: "عروض المحلات، التخفيضات، والخدمات الحصرية",
      icon: <Sparkles size={24} />,
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300",
      accentBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      count: serviceOffers?.length || 0,
    },
    {
      id: "doctors",
      label: "الأطباء",
      subtitle: "الأطباء والعيادات التخصصية والعناوين",
      icon: <Stethoscope size={24} />,
      badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300",
      accentBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      count: doctors?.length || 0,
    },
    {
      id: "notifications",
      label: "الاشعارات",
      subtitle: "إرسال التنبيهات الفورية لهواتف المستخدمين",
      icon: <Bell size={24} />,
      badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300",
      accentBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      count: notifications?.length || 0,
    },
    {
      id: "banners",
      label: "الإعلانات",
      subtitle: "شريط الإعلانات الترويجية بأعلى الصفحة",
      icon: <ImageIcon size={24} />,
      badgeColor: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300",
      accentBg: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
      count: banners?.length || 0,
    },
    {
      id: "taxis",
      label: "الخدمات والمهن",
      subtitle: "كباتن النقل، التكسي، والمهن الحرفية المباشرة",
      icon: <Wrench size={24} />,
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
      accentBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      count: taxis?.length || 0,
    },
  ];

  const isSelectedStoreComplex =
    adminSelectedStore?._storeType === "complex"
      ? true
      : adminSelectedStore?._storeType === "store"
      ? false
      : adminSelectedStore?.isMedicalComplex === true
      ? true
      : adminSelectedStore?.category === "مجمع طبي" ||
        adminSelectedStore?.category === "مستشفى" ||
        adminSelectedStore?.category === "عيادات";

  const storeCategoriesList = React.useMemo(() => {
    const defaultCats = [
      "وجبات رئيسية",
      "ساندويتشات",
      "مشويات",
      "مقبلات",
      "مشروبات",
      "حلويات",
      "عصائر",
      "بيتزا",
    ];
    const set = new Set<string>(defaultCats);
    if (adminMarketProducts && Array.isArray(adminMarketProducts)) {
      adminMarketProducts.forEach((p) => {
        const cat = p.menuCategory || p.category;
        if (cat && typeof cat === "string" && cat.trim()) {
          set.add(cat.trim());
        }
      });
    }
    return Array.from(set);
  }, [adminMarketProducts]);

  const currentSection =
    adminView === "market_products"
      ? isSelectedStoreComplex
        ? {
            id: "market_products",
            label: `الكوادر الطبية: ${adminSelectedStore?.name || "المجمع الطبي"}`,
            subtitle: "إدارة قائمة الكوادر الطبية والأطباء مع التفاصيل وأرقام الحجز الخاصة بهم",
            icon: <Stethoscope size={24} />,
            badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
            accentBg: "bg-emerald-500/10 text-emerald-600",
            count: adminMarketProducts?.length || 0,
          }
        : {
            id: "market_products",
            label: `قائمة المنتجات والوجبات: ${adminSelectedStore?.name || "المتجر / المطعم"}`,
            subtitle: "إدارة قائمة الوجبات، الأصناف، الأسعار والتفاصيل الخاصة بالمتجر",
            icon: <ShoppingBag size={24} />,
            badgeColor: "bg-teal-100 text-teal-800 border-teal-300",
            accentBg: "bg-teal-500/10 text-teal-600",
            count: adminMarketProducts?.length || 0,
          }
      : adminView === "offer_products"
      ? {
          id: "offer_products",
          label: `منتجات العرض: ${adminSelectedOffer?.title || "العرض"}`,
          subtitle: "إدارة قائمة المنتجات والوجبات والأسعار داخل هذا العرض",
          icon: <PackageCheck size={24} />,
          badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
          accentBg: "bg-purple-500/10 text-purple-600",
          count: adminOfferProducts?.length || 0,
        }
      : navSections.find((s) => s.id === adminView);

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-16 text-right" dir="rtl">
      {/* Mobile-Native Clean Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 shadow-sm">
        <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
          {/* Back Navigation & Current Title */}
          <div className="flex items-center gap-3 min-w-0">
            {adminView !== "main" ? (
              <button
                onClick={() => {
                  if (adminView === "market_products") {
                    setAdminView(isSelectedStoreComplex ? "medical_complexes" : "market_stores");
                  } else if (adminView === "offer_products") {
                    setAdminView("serviceOffers");
                  } else {
                    setAdminView("main");
                  }
                  setIsAdding(false);
                  setEditingItem(null);
                  setFormData({});
                }}
                className="h-11 px-3.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center gap-2 font-black text-xs sm:text-sm transition-all active:scale-95 shadow-2xs shrink-0 cursor-pointer"
              >
                <ArrowRight size={20} />
                <span>رجوع</span>
              </button>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border-2 border-emerald-500/20 shadow-xs">
                <ShieldCheck size={26} />
              </div>
            )}

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base md:text-lg font-display font-black truncate text-slate-900 dark:text-white">
                  {adminView === "main"
                    ? "لوحة التحكم الرئيسية"
                    : currentSection?.label || "إدارة القسم"}
                </h1>
                {adminView === "main" && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    متصل
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {adminView === "main"
                  ? "اختر أي قسم لإدارة المحتوى بشكل منفصل ومباشر"
                  : `${currentSection?.count || 0} عنصر مسجل حالياً`}
              </p>
            </div>
          </div>

          {/* Direct Add Button in Sticky Header for Fast Access */}
          {adminView !== "main" && !isAdding && (
            <button
              onClick={startAdd}
              className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer shrink-0"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">إضافة عنصر</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6">
        {adminView === "main" ? (
          /* ================= MAIN DASHBOARD SECTIONS GRID ================= */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Quick Summary Numbers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-black">الدليل الطبي</span>
                  <Hospital size={18} className="text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {marketStores?.length || 0}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-black">الدليل الطبي العام</span>
                  <Stethoscope size={18} className="text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {doctors?.length || 0}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-black">سائقي التكسي</span>
                  <Wrench size={18} className="text-amber-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {taxis?.length || 0}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-black">العروض والخدمات</span>
                  <Tag size={18} className="text-purple-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {serviceOffers?.length || 0}
                </div>
              </div>
            </div>

            {/* Standalone Section Buttons Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-emerald-600" />
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    اقسام لوحة التحكم (انقر لفتح أي قسم)
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {navSections.length} أقسام تخصصية
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 sm:gap-4">
                {navSections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setAdminView(sec.id as any)}
                    className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 sm:border-2 p-2 sm:p-4 rounded-xl sm:rounded-3xl flex flex-col justify-between text-right shadow-2xs hover:shadow-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-all active:scale-95 group cursor-pointer relative min-h-[110px] sm:min-h-[160px]"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-3">
                      <div className={`w-8 h-8 sm:w-12 sm:h-12 ${sec.accentBg} rounded-lg sm:rounded-2xl flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}>
                        {sec.icon}
                      </div>
                      <span className={`text-[9px] sm:text-xs font-black px-1.5 sm:px-2.5 py-0.5 rounded-full border ${sec.badgeColor}`}>
                        {sec.count}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-[10px] sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight line-clamp-2">
                        {sec.label}
                      </h3>
                      <p className="hidden sm:block text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {sec.subtitle}
                      </p>
                    </div>

                    <div className="mt-2 pt-1.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[9px] sm:text-xs font-black text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                      <span className="hidden sm:inline">إدارة القسم</span>
                      <span className="sm:hidden text-[8px]">دخول</span>
                      <ChevronRight size={12} className="rotate-180 sm:w-4 sm:h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ================= STANDALONE ISOLATED SECTION VIEW ================= */
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Top Section Info & Large Action Bar */}
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${currentSection?.accentBg || "bg-slate-100 text-slate-800"} rounded-2xl flex items-center justify-center shrink-0`}>
                  {currentSection?.icon || <Database size={24} />}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {currentSection?.label || "إدارة القسم"}
                  </h2>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {currentSection?.subtitle || "تعديل وإضافة البيانات"}
                  </p>
                </div>
              </div>

              {/* Large Functional Tools Bar */}
              {!isAdding && (
                <div className="flex items-center gap-2.5 flex-wrap">
                  {["doctors", "market_stores", "taxis", "serviceOffers"].includes(adminView) && (
                    <>
                      <button
                        onClick={handleExport}
                        className="h-12 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 border border-emerald-300 dark:border-emerald-800 active:scale-95 transition-all cursor-pointer shadow-xs"
                      >
                        <FileOutput size={18} />
                        <span>تصدير إكسل</span>
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="h-12 px-4 bg-blue-50 hover:bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 border border-blue-300 dark:border-blue-800 active:scale-95 transition-all cursor-pointer shadow-xs"
                      >
                        <FileInput size={18} />
                        <span>استيراد إكسل</span>
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

                  <button
                    onClick={startAdd}
                    className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 active:scale-95 transition-all cursor-pointer shadow-md"
                  >
                    <Plus size={20} />
                    <span>إضافة عنصر جديد</span>
                  </button>
                </div>
              )}
            </div>

            {/* Doctor Sub-Tabs Switcher */}
            {adminView === "doctors" && !isAdding && (
              <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                <button
                  onClick={() => setDoctorSubTab("doctors")}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    doctorSubTab === "doctors"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Stethoscope size={18} />
                  <span>قائمة الأطباء والعيادات ({doctors.length})</span>
                </button>
                <button
                  onClick={() => setDoctorSubTab("specialties")}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    doctorSubTab === "specialties"
                      ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <SlidersHorizontal size={18} />
                  <span>إدارة التخصصات الطبية ({doctorSpecialtiesList.length})</span>
                </button>
              </div>
            )}

            {/* Service Directory Sub-Tabs Switcher */}
            {adminView === "taxis" && !isAdding && (
              <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                <button
                  onClick={() => setServiceSubTab("services")}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    serviceSubTab === "services"
                      ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Wrench size={18} />
                  <span>قائمة الخدمات والمهن ({taxis.length})</span>
                </button>
                <button
                  onClick={() => setServiceSubTab("categories")}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    serviceSubTab === "categories"
                      ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <SlidersHorizontal size={18} />
                  <span>إدارة الفئات والمهن ({serviceCategoriesList.length})</span>
                </button>
              </div>
            )}

            {/* Form Dialog for Add / Edit */}
            {isAdding ? (
              <div className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border-2 border-emerald-500/30 dark:border-emerald-500/20 shadow-lg animate-in fade-in duration-300 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <Plus size={22} />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-slate-900 dark:text-white text-base">
                        {editingItem ? "تعديل البيانات الحالية" : "إضافة عنصر جديد بالقسم"}
                      </h3>
                      <p className="text-xs text-slate-400 font-bold">
                        أدخل البيانات المطلوبة ثم انقر على (حفظ البيانات)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setEditingItem(null);
                      setFormData({});
                    }}
                    className="w-11 h-11 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl flex items-center justify-center hover:bg-slate-200 cursor-pointer transition-all active:scale-95"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* File/Photo Upload Card */}
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border-2 border-slate-200/80 dark:border-slate-800">
                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-xs overflow-hidden flex items-center justify-center relative border-2 border-slate-300 dark:border-slate-700 shrink-0">
                      {formData.image || (formData.images && formData.images[0]) ? (
                        <img
                          src={formData.image || (formData.images && formData.images[0])}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      ) : (
                        <ImageIcon className="text-slate-400 dark:text-slate-600" size={32} />
                      )}
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, "image")}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept="image/*"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        {adminView === "market_products" && !isSelectedStoreComplex
                          ? "صورة المنتج / الوجبة"
                          : adminView === "market_products" && isSelectedStoreComplex
                          ? "صورة الطبيب / الكادر الطبي"
                          : "صورة الغلاف / اللوجو"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">
                        انقر فوق الصورة لرفع ملف جديد من جهازك
                      </p>
                    </div>
                  </div>

                  {/* Form Inputs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AdminInput
                      placeholder={
                        adminView === "notifications"
                          ? "عنوان الإشعار الرئيسي"
                          : adminView === "offer_products"
                          ? "اسم المنتج أو الوجبة"
                          : adminView === "market_products"
                          ? isSelectedStoreComplex
                            ? "اسم الطبيب كامل (مثال: د. علي صبيح)"
                            : "اسم الوجبة أو المنتج أو الصنف"
                          : adminView === "medical_complexes"
                          ? "اسم المجمع الطبي أو المستشفى"
                          : adminView === "market_stores"
                          ? "اسم المتجر أو المطعم أو النشاط التجاري"
                          : adminView === "serviceOffers"
                          ? "عنوان العرض الترويجي"
                          : "الاسم / العنوان"
                      }
                      value={formData.name || formData.title || ""}
                      onChange={(v) =>
                        setFormData({ ...formData, name: v, title: v })
                      }
                    />

                    {adminView === "doctors" && (
                      <>
                        <div className="space-y-1.5 text-right">
                          <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center justify-between">
                            <span>التخصص الطبي المعتمد:</span>
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                              حدد من التخصصات المعتمدة
                            </span>
                          </label>
                          <div className="relative">
                            <select
                              value={formData.specialty || formData.subtitle || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "__CUSTOM__") {
                                  setFormData({ ...formData, specialty: "", subtitle: "", _isCustomSpecialty: true });
                                } else {
                                  setFormData({ ...formData, specialty: val, subtitle: val, _isCustomSpecialty: false });
                                }
                              }}
                              className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 focus:border-indigo-500 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none transition-all cursor-pointer appearance-none text-right"
                              dir="rtl"
                            >
                              <option value="">-- اختر التخصص الطبي --</option>
                              {doctorSpecialtiesList?.map((spec) => (
                                <option key={spec.id} value={spec.name}>
                                  {spec.name}
                                </option>
                              ))}
                              {formData.specialty &&
                                !doctorSpecialtiesList?.some((s) => s.name === formData.specialty) && (
                                  <option value={formData.specialty}>{formData.specialty}</option>
                                )}
                              <option value="__CUSTOM__">➕ إدخال تخصص جديد يدوياً...</option>
                            </select>
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <ChevronDown size={18} />
                            </div>
                          </div>

                          {(formData._isCustomSpecialty ||
                            (formData.specialty &&
                              !doctorSpecialtiesList?.some((s) => s.name === formData.specialty))) && (
                            <div className="pt-1.5 animate-in fade-in">
                              <AdminInput
                                placeholder="اكتب اسم التخصص الجديد هنا..."
                                value={formData.specialty || formData.subtitle || ""}
                                onChange={(v) =>
                                  setFormData({ ...formData, specialty: v, subtitle: v })
                                }
                              />
                            </div>
                          )}
                        </div>

                        <AdminInput
                          placeholder="العنوان ومكان العيادة"
                          value={formData.address || formData.location || ""}
                          onChange={(v) => setFormData({ ...formData, address: v, location: v })}
                        />
                        <AdminInput
                          placeholder="رقم الهاتف والتواصل"
                          value={formData.phone || formData.phone1 || ""}
                          onChange={(v) => setFormData({ ...formData, phone: v, phone1: v })}
                        />
                        <AdminInput
                          placeholder="رقم هاتف الحجز الخاص بالعيادة (إن وجد)"
                          value={formData.reservationPhone || ""}
                          onChange={(v) => setFormData({ ...formData, reservationPhone: v })}
                        />
                      </>
                    )}

                    {adminView === "taxis" && (
                      <>
                        <div className="space-y-1.5 text-right">
                          <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center justify-between">
                            <span>فئة الخدمة / المهنة:</span>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                              اختر الفئة
                            </span>
                          </label>
                          <div className="relative">
                            <select
                              value={formData.category || formData.carType || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "__CUSTOM__") {
                                  setFormData({ ...formData, category: "", carType: "", _isCustomCategory: true });
                                } else {
                                  setFormData({ ...formData, category: val, carType: val, _isCustomCategory: false });
                                }
                              }}
                              className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 focus:border-amber-500 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none transition-all cursor-pointer appearance-none text-right"
                              dir="rtl"
                            >
                              <option value="">-- اختر فئة الخدمة / المهنة --</option>
                              {serviceCategoriesList?.map((cat) => (
                                <option key={cat.id} value={cat.name}>
                                  {cat.name}
                                </option>
                              ))}
                              {(formData.category || formData.carType) &&
                                !serviceCategoriesList?.some(
                                  (s) => s.name === (formData.category || formData.carType)
                                ) && (
                                  <option value={formData.category || formData.carType}>
                                    {formData.category || formData.carType}
                                  </option>
                                )}
                              <option value="__CUSTOM__">➕ إدخال فئة جديدة يدوياً...</option>
                            </select>
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <ChevronDown size={18} />
                            </div>
                          </div>

                          {(formData._isCustomCategory ||
                            ((formData.category || formData.carType) &&
                              !serviceCategoriesList?.some(
                                (s) => s.name === (formData.category || formData.carType)
                              ))) && (
                            <div className="pt-1.5 animate-in fade-in">
                              <AdminInput
                                placeholder="اكتب اسم الفئة الجديدة هنا..."
                                value={formData.category || formData.carType || ""}
                                onChange={(v) =>
                                  setFormData({ ...formData, category: v, carType: v })
                                }
                              />
                            </div>
                          )}
                        </div>

                        <AdminInput
                          placeholder="عنوان أو وصف الخدمة التفصيلي (مثال: سائق تاكسي / صيانة كهربائية / نجار أثاث)"
                          value={formData.subtitle || formData.craft || ""}
                          onChange={(v) => setFormData({ ...formData, subtitle: v, craft: v })}
                        />
                        <AdminInput
                          placeholder="رقم الهاتف والواتساب"
                          value={formData.phone || formData.phone1 || ""}
                          onChange={(v) => setFormData({ ...formData, phone: v, phone1: v })}
                        />
                        <AdminInput
                          placeholder="منطقة التواجد أو الخط الخارجي"
                          value={formData.area || formData.location || ""}
                          onChange={(v) => setFormData({ ...formData, area: v, location: v })}
                        />
                      </>
                    )}

                    {adminView === "medical_complexes" && (
                      <>
                        <AdminInput
                          placeholder="العنوان والموقع (مثال: الشارع العام، قرب المستشفى العام)"
                          value={formData.location || ""}
                          onChange={(v) => setFormData({ ...formData, location: v })}
                        />
                        <AdminInput
                          placeholder="رقم هاتف استعلامات وحجز المجمع الطبي"
                          value={formData.phone || formData.phone1 || ""}
                          onChange={(v) => setFormData({ ...formData, phone: v, phone1: v })}
                        />
                      </>
                    )}

                    {adminView === "market_stores" && (
                      <>
                        <div className="space-y-1.5 text-right">
                          <label className="text-xs font-black text-slate-700 dark:text-slate-200">
                            تصنيف المتجر / النشاط:
                          </label>
                          <select
                            value={formData.category || "مطاعم"}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 focus:border-teal-500 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none transition-all cursor-pointer"
                            dir="rtl"
                          >
                            <option value="مطاعم">مطاعم</option>
                            <option value="متاجر">متاجر</option>
                            <option value="مكاتب">مكاتب</option>
                          </select>
                        </div>
                        <AdminInput
                          placeholder="العنوان والموقع (مثال: السوق القديم، مجاور البريد)"
                          value={formData.location || ""}
                          onChange={(v) => setFormData({ ...formData, location: v })}
                        />
                        <AdminInput
                          placeholder="رقم هاتف الطلبات والتواصل"
                          value={formData.phone || formData.phone1 || ""}
                          onChange={(v) => setFormData({ ...formData, phone: v, phone1: v })}
                        />
                      </>
                    )}

                    {adminView === "market_products" && (
                      isSelectedStoreComplex ? (
                        <>
                          <div className="space-y-1.5 text-right">
                            <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center justify-between">
                              <span>التخصص الطبي للعيادة:</span>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                اختر التخصص
                              </span>
                            </label>
                            <div className="relative">
                              <select
                                value={formData.specialty || formData.category || formData.menuCategory || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === "__CUSTOM__") {
                                    setFormData({ ...formData, specialty: "", category: "", menuCategory: "", _isCustomSpecialty: true });
                                  } else {
                                    setFormData({ ...formData, specialty: val, category: val, menuCategory: val, _isCustomSpecialty: false });
                                  }
                                }}
                                className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 focus:border-emerald-500 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none transition-all cursor-pointer appearance-none text-right"
                                dir="rtl"
                              >
                                <option value="">-- حدد التخصص الطبي --</option>
                                {doctorSpecialtiesList?.map((spec) => (
                                  <option key={spec.id} value={spec.name}>
                                    {spec.name}
                                  </option>
                                ))}
                                {formData.specialty &&
                                  !doctorSpecialtiesList?.some((s) => s.name === formData.specialty) && (
                                    <option value={formData.specialty}>{formData.specialty}</option>
                                  )}
                                <option value="__CUSTOM__">➕ إدخال تخصص جديد يدوياً...</option>
                              </select>
                              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronDown size={18} />
                              </div>
                            </div>

                            {(formData._isCustomSpecialty ||
                              (formData.specialty &&
                                !doctorSpecialtiesList?.some((s) => s.name === formData.specialty))) && (
                              <div className="pt-1.5 animate-in fade-in">
                                <AdminInput
                                  placeholder="اكتب التخصص الجديد للعيادة..."
                                  value={formData.specialty || formData.category || ""}
                                  onChange={(v) =>
                                    setFormData({
                                      ...formData,
                                      specialty: v,
                                      category: v,
                                      menuCategory: v,
                                    })
                                  }
                                />
                              </div>
                            )}
                          </div>

                          <AdminInput
                            placeholder="رقم هاتف حجز العيادة داخل المجمع"
                            value={formData.reservationPhone || formData.phone || ""}
                            onChange={(v) => setFormData({ ...formData, reservationPhone: v, phone: v })}
                          />

                          <AdminInput
                            placeholder="ملاحظة اختيارية بجوار زر الحجز (مثال: الطابق الثاني / جناح الاستشاريين)"
                            value={formData.note || ""}
                            onChange={(v) => setFormData({ ...formData, note: v })}
                          />
                        </>
                      ) : (
                        <>
                          <AdminInput
                            placeholder="السعر (مثال: 5000 د.ع أو 7500)"
                            value={formData.price !== undefined ? String(formData.price) : ""}
                            onChange={(v) => setFormData({ ...formData, price: v })}
                          />

                          <div className="space-y-2 text-right sm:col-span-2">
                            <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center justify-between">
                              <span>قسم القائمة / التصنيف:</span>
                              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                                اختر التصنيف بضغطة زر أو أضف تصنيفاً جديداً
                              </span>
                            </label>

                            {/* Category Tabs list */}
                            <div className="flex items-center gap-1.5 flex-wrap bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-800">
                              {storeCategoriesList.map((cat) => {
                                const currentCat = formData.menuCategory || formData.category || "";
                                const isSelected = currentCat === cat && !formData._isCustomCategory;
                                return (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        menuCategory: cat,
                                        category: cat,
                                        _isCustomCategory: false,
                                      });
                                    }}
                                    className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                                      isSelected
                                        ? "bg-teal-600 text-white shadow-xs scale-102"
                                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                                    }`}
                                  >
                                    {isSelected && <Check size={14} />}
                                    <span>{cat}</span>
                                  </button>
                                );
                              })}

                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    _isCustomCategory: true,
                                    menuCategory: "",
                                    category: "",
                                  });
                                }}
                                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                                  formData._isCustomCategory
                                    ? "bg-amber-500 text-white shadow-xs"
                                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-300 dark:border-amber-800"
                                }`}
                              >
                                <Plus size={14} />
                                <span>إضافة تصنيف جديد</span>
                              </button>
                            </div>

                            {(formData._isCustomCategory ||
                              ((formData.menuCategory || formData.category) &&
                                !storeCategoriesList.includes(formData.menuCategory || formData.category))) && (
                              <div className="pt-1.5 animate-in fade-in">
                                <AdminInput
                                  placeholder="اكتب اسم التصنيف الجديد هنا (مثال: وجبات سريعة / برجر)..."
                                  value={formData.menuCategory || formData.category || ""}
                                  onChange={(v) =>
                                    setFormData({
                                      ...formData,
                                      menuCategory: v,
                                      category: v,
                                    })
                                  }
                                />
                              </div>
                            )}
                          </div>
                        </>
                      )
                    )}

                    {adminView === "offer_products" && (
                      <>
                        <AdminInput
                          placeholder="السعر (مثال: 5000 د.ع أو مجاني / حسب الطلب)"
                          value={formData.price !== undefined ? String(formData.price) : ""}
                          onChange={(v) => setFormData({ ...formData, price: v })}
                        />
                      </>
                    )}

                    {adminView === "serviceOffers" && (
                      <>
                        <AdminInput
                          placeholder="قيمة الخصم أو السعر الجديد (مثال: خصم 25% أو 15,000 د.ع)"
                          value={formData.price || ""}
                          onChange={(v) => setFormData({ ...formData, price: v })}
                        />
                        <AdminInput
                          placeholder="رقم التواصل والواتساب"
                          value={formData.whatsappNumber || formData.phone || ""}
                          onChange={(v) => setFormData({ ...formData, whatsappNumber: v, phone: v })}
                        />
                      </>
                    )}

                    {adminView === "banners" && (
                      <div className="sm:col-span-2 space-y-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-right">
                        <div className="space-y-1">
                          <label className="text-xs font-black text-slate-800 dark:text-slate-200">
                            نوع إجراء النقر على البنر:
                          </label>
                          <select
                            value={formData.type || "internal"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                type: e.target.value as any,
                                targetType: e.target.value === "internal" ? (formData.targetType || "doctor") : undefined,
                              })
                            }
                            className="w-full h-12 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-3 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="internal">ربط داخلي ببطاقة (طبيب / مجمع طبي / مطعم ومتجر / عرض / إعلان)</option>
                            <option value="external">فتح رابط خارجي (موقع / فيسبوك / واتساب)</option>
                            <option value="text">عرض نص تفصيلي داخل التطبيق</option>
                          </select>
                        </div>

                        {formData.type === "external" && (
                          <AdminInput
                            placeholder="رابط الموقع الخارجي (https://...)"
                            value={formData.url || ""}
                            onChange={(v) => setFormData({ ...formData, url: v })}
                          />
                        )}

                        {(formData.type === "internal" || !formData.type) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs font-black text-slate-800 dark:text-slate-200">
                                اختر القسم المراد الربط به:
                              </label>
                              <select
                                value={formData.targetType || "doctor"}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    targetType: e.target.value as any,
                                    targetId: "",
                                  })
                                }
                                className="w-full h-12 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-3 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                              >
                                <option value="doctor">بطاقة طبيب</option>
                                <option value="medical_complex">مجمع طبي / مستشفى</option>
                                <option value="restaurant">مطعم / متجر</option>
                                <option value="serviceOffers">عرض وخصم خدمات</option>
                                <option value="govAnnouncement">تنبيه / إعلان حكومي</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-black text-slate-800 dark:text-slate-200">
                                اختر البطاقة المحددة:
                              </label>
                              <select
                                value={formData.targetId || ""}
                                onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                                className="w-full h-12 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-3 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                              >
                                <option value="">-- اختر بطاقة من القائمة --</option>
                                {formData.targetType === "doctor" &&
                                  doctors.map((doc) => (
                                    <option key={doc.id} value={doc.id}>
                                      {doc.name} {doc.subtitle || (doc as any).specialty ? `(${doc.subtitle || (doc as any).specialty})` : ""}
                                    </option>
                                  ))}
                                {formData.targetType === "medical_complex" &&
                                  (medicalComplexes || []).map((complex) => (
                                    <option key={complex.id} value={complex.id}>
                                      {complex.name} {complex.location ? `(${complex.location})` : ""}
                                    </option>
                                  ))}
                                {formData.targetType === "restaurant" &&
                                  marketStores.map((store) => (
                                    <option key={store.id} value={store.id}>
                                      {store.name} {store.category ? `(${store.category})` : ""}
                                    </option>
                                  ))}
                                {formData.targetType === "serviceOffers" &&
                                  serviceOffers.map((offer) => (
                                    <option key={offer.id} value={offer.title || offer.name || offer.id}>
                                      {offer.title || offer.name} {offer.price ? `(${offer.price})` : ""}
                                    </option>
                                  ))}
                                {formData.targetType === "govAnnouncement" &&
                                  (govAnnouncements || []).map((gov) => (
                                    <option key={gov.id} value={gov.id}>
                                      {gov.title}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {adminView === "notifications" && (
                      <div className="sm:col-span-2">
                        <AdminTextarea
                          placeholder="نص رسالة الإشعار الفورية..."
                          value={formData.message || ""}
                          onChange={(v) => setFormData({ ...formData, message: v })}
                        />
                      </div>
                    )}
                  </div>

                  {adminView !== "notifications" && adminView !== "offer_products" && (
                    <AdminTextarea
                      placeholder={
                        adminView === "market_products" && !isSelectedStoreComplex
                          ? "الوصف التفصيلي أو المكونات (اختياري - غير مطلوب)"
                          : "الوصف التفصيلي أو الشرح والملاحظات وأوقات العمل..."
                      }
                      value={formData.description || formData.notes || ""}
                      onChange={(v) => setFormData({ ...formData, description: v, notes: v })}
                    />
                  )}

                  {/* Toggle Option for Show in Home/Carousel for Medical Complexes */}
                  {adminView === "medical_complexes" && (
                    <div
                      onClick={() =>
                        setFormData({
                          ...formData,
                          showInHome: formData.showInHome === false ? true : false,
                        })
                      }
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                        formData.showInHome !== false
                          ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200"
                          : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            formData.showInHome !== false
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          <Sparkles size={20} />
                        </div>
                        <div className="text-right">
                          <div className="text-xs sm:text-sm font-black">
                            إظهار ضمن الشريط الأفقي المميز في الصفحة الرئيسية
                          </div>
                          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                            عند تفعيل هذا الخيار، يظهر العنصر في شريط البطاقات المميزة بأعلى الصفحة
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.showInHome !== false}
                        onChange={(e) =>
                          setFormData({ ...formData, showInHome: e.target.checked })
                        }
                        className="w-5 h-5 accent-emerald-600 rounded-md cursor-pointer shrink-0"
                      />
                    </div>
                  )}

                  {/* LARGE HIGH-VISIBILITY FORM SAVE & CANCEL BUTTONS */}
                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={saveItem}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-md"
                    >
                      <Check size={22} />
                      <span>حفظ البيانات الآن</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsAdding(false);
                        setEditingItem(null);
                        setFormData({});
                      }}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 h-14 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                    >
                      <X size={20} />
                      <span>إلغاء التعديل</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : adminView === "doctors" && doctorSubTab === "specialties" ? (
              /* Specialties Management Section */
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Add Specialty Card */}
                <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500/30 dark:border-emerald-500/20 p-5 rounded-3xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Plus size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                          إضافة تخصص طبي جديد
                        </h3>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          سيظهر التخصص مباشرة في قوائم الاختيار وفلاتر البحث
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleResetDefaultSpecialties}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="استعادة قائمة التخصصات الافتراضية"
                    >
                      <RotateCcw size={14} />
                      <span className="hidden sm:inline">استعادة التخصصات الشاملة</span>
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      placeholder="اسم التخصص (مثال: أخصائي جراحة عامة، باطنية وقلبية، طب وجراحة العيون...)"
                      value={newSpecialtyName}
                      onChange={(e) => setNewSpecialtyName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddSpecialty();
                      }}
                      className="flex-1 h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 text-right"
                      dir="rtl"
                    />
                    <button
                      onClick={handleAddSpecialty}
                      className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-xs shrink-0"
                    >
                      <Plus size={18} />
                      <span>إضافة التخصص</span>
                    </button>
                  </div>
                </div>

                {/* Search & Specialties Grid */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="ابحث في التخصصات الطبية..."
                      className="w-full h-12 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl pr-11 pl-4 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-2xs text-right"
                      value={specialtySearch}
                      onChange={(e) => setSpecialtySearch(e.target.value)}
                    />
                    {specialtySearch && (
                      <button
                        onClick={() => setSpecialtySearch("")}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {/* Specialties List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {(() => {
                      const filteredSpecs = (doctorSpecialtiesList || []).filter((s) =>
                        s.name.toLowerCase().includes(specialtySearch.toLowerCase())
                      );

                      if (filteredSpecs.length === 0) {
                        return (
                          <div className="col-span-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-8 rounded-3xl text-center text-slate-500 space-y-2">
                            <Tag size={36} className="mx-auto opacity-30" />
                            <p className="text-sm font-black">لا توجد تخصصات مطابقة للبحث</p>
                            <p className="text-xs">أضف تخصص جديد باستخدام الحقل بالأعلى</p>
                          </div>
                        );
                      }

                      return filteredSpecs.map((spec) => {
                        const isEditing = editingSpecialtyId === spec.id;
                        // Count doctors with this specialty
                        const docCount = doctors.filter(
                          (d) =>
                            d.subtitle?.trim().toLowerCase() === spec.name.trim().toLowerCase() ||
                            (d as any).specialty?.trim().toLowerCase() === spec.name.trim().toLowerCase()
                        ).length;

                        return (
                          <div
                            key={spec.id}
                            className="bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-2 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all text-right"
                          >
                            {isEditing ? (
                              <div className="flex items-center gap-1.5 flex-1">
                                <input
                                  type="text"
                                  value={editingSpecialtyName}
                                  onChange={(e) => setEditingSpecialtyName(e.target.value)}
                                  className="flex-1 h-9 px-3 bg-slate-50 dark:bg-slate-950 border border-emerald-500 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                  dir="rtl"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleUpdateSpecialty(spec.id)}
                                  className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0 hover:bg-emerald-700"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingSpecialtyId(null);
                                    setEditingSpecialtyName("");
                                  }}
                                  className="w-8 h-8 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center shrink-0"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 truncate">
                                    {spec.name}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                                      <Stethoscope size={10} />
                                      <span>{docCount} طبيب</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => {
                                      setEditingSpecialtyId(spec.id);
                                      setEditingSpecialtyName(spec.name);
                                    }}
                                    className="w-8 h-8 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                                    title="تعديل اسم التخصص"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSpecialty(spec.id, spec.name)}
                                    className="w-8 h-8 bg-slate-100 dark:bg-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                                    title="حذف التخصص"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })
                    })()}
                  </div>
                </div>
              </div>
            ) : adminView === "taxis" && serviceSubTab === "categories" ? (
              /* Service Categories Management Section */
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Add Service Category Card */}
                <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500/30 dark:border-emerald-500/20 p-5 rounded-3xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Plus size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                          إضافة فئة أو مهنة خدمة جديدة
                        </h3>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          ستظهر الفئة مباشرة في فلتر الدليل الخدمي وقائمة الاختيار عند إضافة بطاقة
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleResetDefaultServiceCategories}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="استعادة الفئات الافتراضية"
                    >
                      <RotateCcw size={14} />
                      <span className="hidden sm:inline">استعادة الفئات الافتراضية</span>
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      placeholder="اسم الفئة أو المهنة (مثال: صيانة ومولدات، سواق تكسي ونقل، حرفيين ومهن حرة...)"
                      value={newServiceCategoryName}
                      onChange={(e) => setNewServiceCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddServiceCategory();
                      }}
                      className="flex-1 h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 text-right"
                      dir="rtl"
                    />
                    <button
                      onClick={handleAddServiceCategory}
                      className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-xs shrink-0"
                    >
                      <Plus size={18} />
                      <span>إضافة الفئة</span>
                    </button>
                  </div>
                </div>

                {/* Search & Categories Grid */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="ابحث في فئات المهن والخدمات..."
                      className="w-full h-12 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl pr-11 pl-4 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-2xs text-right"
                      value={serviceCategorySearch}
                      onChange={(e) => setServiceCategorySearch(e.target.value)}
                    />
                    {serviceCategorySearch && (
                      <button
                        onClick={() => setServiceCategorySearch("")}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {/* Service Categories List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {(() => {
                      const filteredCats = (serviceCategoriesList || []).filter((s) =>
                        s.name.toLowerCase().includes(serviceCategorySearch.toLowerCase())
                      );

                      if (filteredCats.length === 0) {
                        return (
                          <div className="col-span-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-8 rounded-3xl text-center text-slate-500 space-y-2">
                            <Tag size={36} className="mx-auto opacity-30" />
                            <p className="text-sm font-black">لا توجد فئات مطابقة للبحث</p>
                            <p className="text-xs">أضف فئة جديدة باستخدام الحقل بالأعلى</p>
                          </div>
                        );
                      }

                      return filteredCats.map((cat) => {
                        const isEditing = editingServiceCategoryId === cat.id;
                        const count = taxis.filter(
                          (t) =>
                            (t.category || t.carType)?.trim().toLowerCase() === cat.name.trim().toLowerCase()
                        ).length;

                        return (
                          <div
                            key={cat.id}
                            className="bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-2 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all text-right"
                          >
                            {isEditing ? (
                              <div className="flex items-center gap-1.5 flex-1">
                                <input
                                  type="text"
                                  value={editingServiceCategoryName}
                                  onChange={(e) => setEditingServiceCategoryName(e.target.value)}
                                  className="flex-1 h-9 px-3 bg-slate-50 dark:bg-slate-950 border border-emerald-500 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                  dir="rtl"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleUpdateServiceCategory(cat.id)}
                                  className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0 hover:bg-emerald-700"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingServiceCategoryId(null);
                                    setEditingServiceCategoryName("");
                                  }}
                                  className="w-8 h-8 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center shrink-0"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 truncate">
                                    {cat.name}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                                      <Wrench size={10} />
                                      <span>{count} بطاقة مسجلة</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => {
                                      setEditingServiceCategoryId(cat.id);
                                      setEditingServiceCategoryName(cat.name);
                                    }}
                                    className="w-8 h-8 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-600 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                                    title="تعديل اسم الفئة"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteServiceCategory(cat.id, cat.name)}
                                    className="w-8 h-8 bg-slate-100 dark:bg-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                                    title="حذف الفئة"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              /* Items Data List Grid */
              <div className="space-y-4">
                {/* Search Bar Input */}
                <div className="relative">
                  <Search
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="ابحث برقم الهاتف، الاسم، أو التفاصيل..."
                    className="w-full h-13 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl pr-12 pl-4 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-2xs text-right"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                  />
                  {adminSearch && (
                    <button
                      onClick={() => setAdminSearch("")}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* Grid of Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-right">
                  {(() => {
                    let items: any[] = [];
                    if (adminView === "doctors") items = doctors;
                    else if (adminView === "medical_complexes") items = medicalComplexes || [];
                    else if (adminView === "taxis") items = taxis;
                    else if (adminView === "serviceOffers") items = serviceOffers;
                    else if (adminView === "notifications") items = notifications;
                    else if (adminView === "market_stores") items = marketStores;
                    else if (adminView === "market_products") items = adminMarketProducts;
                    else if (adminView === "offer_products") items = adminOfferProducts;
                    else items = banners || [];

                    let filtered = (items || []).filter((i: any) =>
                      (i.name || i.title || i.description || i.message || "")
                        .toLowerCase()
                        .includes(adminSearch.toLowerCase()),
                    );

                    if (filtered.length === 0) {
                      return (
                        <div className="sm:col-span-2 lg:col-span-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-10 rounded-3xl text-center text-slate-500 space-y-3">
                          <Database size={40} className="mx-auto opacity-30" />
                          <p className="text-sm font-black">لا توجد عناصر مسجلة في هذا القسم</p>
                          <p className="text-xs">انقر فوق زر (إضافة عنصر جديد) بالأعلى لإدخال البيانات</p>
                        </div>
                      );
                    }

                    return filtered.map((item: any) => {
                      const isExpanded = expandedItemId === item.id;
                      return (
                        <div
                          key={item.id}
                          className="bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 p-4 rounded-3xl flex flex-col justify-between shadow-2xs hover:shadow-md transition-all text-right space-y-3"
                        >
                          {/* Item Header & Details */}
                          <div
                            onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                            className="flex items-start gap-3 cursor-pointer"
                          >
                            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                              {item.image || item.logoImage || (item.images && item.images[0]) ? (
                                <img
                                  src={item.image || item.logoImage || (item.images && item.images[0])}
                                  className="w-full h-full object-cover"
                                  alt=""
                                />
                              ) : adminView === "offer_products" ? (
                                <ShoppingBag className="text-emerald-500" size={24} />
                              ) : (
                                <Database className="text-slate-400" size={24} />
                              )}
                            </div>

                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-sm font-black text-slate-900 dark:text-white truncate">
                                {item.name || item.title || `عنصر #${item.id.slice(0, 6)}`}
                              </span>
                              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {adminView === "banners"
                                  ? item.type === "external"
                                    ? `رابط خارجي: ${item.url || "غير محدد"}`
                                    : item.targetType === "doctor"
                                    ? "مربوط ببطاقة طبيب"
                                    : item.targetType === "medical_complex"
                                    ? "مربوط بمجمع طبي"
                                    : item.targetType === "restaurant"
                                    ? "مربوط بمطعم أو متجر"
                                    : item.targetType === "serviceOffers"
                                    ? "مربوط بعرض خدمة"
                                    : item.targetType === "govAnnouncement"
                                    ? "مربوط بتنبيه/إعلان حكومي"
                                    : "ربط داخلي"
                                  : adminView === "offer_products"
                                  ? item.price
                                    ? `السعر: ${item.price}`
                                    : "منتج عرض"
                                  : adminView === "medical_complexes"
                                  ? (item.location || item.description || "مجمع طبي / مستشفى")
                                  : adminView === "market_stores"
                                  ? `${item.category ? item.category + " • " : ""}${item.location || item.description || "متجر / مطعم"}`
                                  : adminView === "market_products"
                                  ? isSelectedStoreComplex
                                    ? `${item.specialty || item.category || "عيادة تخصصية"}`
                                    : `${item.price ? `السعر: ${item.price}` : ""}${item.menuCategory ? ` • ${item.menuCategory}` : ""}`
                                  : adminView === "serviceOffers"
                                  ? `${item.price ? `العرض: ${item.price}` : "عرض ترويجي"}`
                                  : item.specialty || item.carType || item.craft || item.category || item.type || "التفاصيل"}
                              </span>
                              {adminView === "market_products" && (
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-1 space-y-0.5">
                                  {isSelectedStoreComplex ? (
                                    <>
                                      {item.reservationPhone && <div className="text-emerald-600 dark:text-emerald-400 font-black">📞 رقم الحجز: {item.reservationPhone}</div>}
                                      {(item.note || item.description) && <div className="text-slate-400 line-clamp-1 font-medium">📝 {item.note || item.description}</div>}
                                    </>
                                  ) : (
                                    <>
                                      {(item.description || item.note) && <div className="text-slate-400 line-clamp-1 font-medium">{item.description || item.note}</div>}
                                    </>
                                  )}
                                </div>
                              )}
                              {(item.phone || item.phone1 || item.whatsappNumber) && (
                                <span dir="ltr" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                  {item.phone || item.phone1 || item.whatsappNumber}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* LARGE HIGH-VISIBILITY ITEM MANAGEMENT BUTTONS */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Manage Doctors inside Medical Complexes */}
                              {adminView === "medical_complexes" && (
                                <button
                                  onClick={() => {
                                    if (setAdminSelectedStore) setAdminSelectedStore({ ...item, isMedicalComplex: true, _storeType: "complex" });
                                    setAdminView("market_products");
                                  }}
                                  className="h-10 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                                >
                                  <Stethoscope size={16} />
                                  <span>الكوادر الطبية</span>
                                </button>
                              )}

                              {/* Manage Menu/Products inside Market Stores & Restaurants */}
                              {adminView === "market_stores" && (
                                <button
                                  onClick={() => {
                                    if (setAdminSelectedStore) setAdminSelectedStore({ ...item, isMedicalComplex: false, _storeType: "store" });
                                    setAdminView("market_products");
                                  }}
                                  className="h-10 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                                >
                                  <ShoppingBag size={16} />
                                  <span>قائمة الوجبات والمنتجات</span>
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Edit Button */}
                              <button
                                onClick={() => startEdit(item)}
                                className="h-10 px-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                              >
                                <Edit3 size={16} />
                                <span>تعديل</span>
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => deleteItem(item.id, adminView)}
                                className={`h-10 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                  confirmDelete?.id === item.id
                                    ? "bg-rose-600 text-white shadow-md animate-pulse px-4"
                                    : "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 hover:bg-rose-200"
                                }`}
                              >
                                <Trash2 size={16} />
                                <span>{confirmDelete?.id === item.id ? "تأكيد؟" : "حذف"}</span>
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-2 text-xs bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl space-y-1.5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                              {item.description && <p className="leading-relaxed">{item.description}</p>}
                              {item.notes && <p className="leading-relaxed">{item.notes}</p>}
                              {item.workingHours && <p>أوقات العمل: {item.workingHours}</p>}
                              {item.area && <p>المنطقة: {item.area}</p>}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
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
    className="w-full h-12 bg-white dark:bg-slate-950 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-white px-4 shadow-2xs focus:border-emerald-500 outline-none transition-all text-right"
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
    className="w-full p-4 bg-white dark:bg-slate-950 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-white shadow-2xs h-32 focus:border-emerald-500 outline-none transition-all resize-none text-right"
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
    <label className="text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 bg-white dark:bg-slate-950 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-white shadow-2xs outline-none px-4 appearance-none focus:border-emerald-500 transition-all text-right cursor-pointer"
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

export default AdminPanel;

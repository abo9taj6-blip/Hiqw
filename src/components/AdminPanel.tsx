import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  Bell,
  Stethoscope,
  ImageIcon,
  Plus,
  X,
  Trash2,
  FileOutput,
  FileInput,
  Search,
  Wrench,
  ChevronDown,
  ArrowRight,
  Edit3,
  Hospital,
  SlidersHorizontal,
  RotateCcw,
  Calendar,
  Phone,
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
  banners: BannerAd[];
  appSettings: any;
  saveSettings: (v: any) => Promise<void>;
  medicalComplexes?: any[];
  setMedicalComplexes?: React.Dispatch<React.SetStateAction<any[]>>;
  adminSelectedStore?: any;
  setAdminSelectedStore?: (val: any) => void;
  adminMarketProducts?: any[];
  taxis?: any[];
  notifications?: any[];
  govAnnouncements?: any[];
  setNotifications?: React.Dispatch<React.SetStateAction<any[]>>;
  seedDatabase: () => Promise<void>;
  setDoctors?: React.Dispatch<React.SetStateAction<any[]>>;
  doctorSpecialtiesList?: DoctorSpecialty[];
  setDoctorSpecialtiesList?: React.Dispatch<React.SetStateAction<DoctorSpecialty[]>>;
  serviceCategoriesList?: ServiceCategory[];
  setServiceCategoriesList?: React.Dispatch<React.SetStateAction<ServiceCategory[]>>;
  // Optional compatibility props
  marketStores?: any[];
  setMarketStores?: any;
  serviceOffers?: any[];
  setServiceOffers?: any;
  adminSelectedOffer?: any;
  setAdminSelectedOffer?: any;
  adminOfferProducts?: any[];
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
    doctors = [],
    banners = [],
    medicalComplexes = [],
    adminSelectedStore,
    setAdminSelectedStore,
    adminMarketProducts = [],
    taxis = [],
    notifications = [],
    setDoctors,
    setMedicalComplexes,
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
      alert("يرجى كتابة الاسم الجديد");
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
      alert("✅ تم تعديل اسم الفئة بنجاح");
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
    if (!window.confirm("هل ترغب في استعادة وحفظ قائمة الفئات والمهن الافتراضية؟")) return;
    try {
      const defaultList: ServiceCategory[] = [
        "خصوصي",
        "دليفري",
        "ستاركس",
        "حمل",
        "كهربائي",
        "صحيات وسباكة",
        "تبريد وتكييف",
        "بناء وترميم",
        "حدادة",
        "نجارة وأثاث",
        "صباغة وديكور",
        "ستلايت وكاميرات",
        "صيانة موبايل",
        "صيانة حاسبات",
        "تصليح أجهزة منزلية",
        "سحب ونقل سيارات",
        "تنظيف منازل",
        "خدمات زراعية"
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
  const handleExportExcel = () => {
    try {
      if (adminView === "doctors") {
        excelService.exportToExcel(doctors, "دليل_الأطباء");
      } else if (adminView === "medical_complexes") {
        excelService.exportToExcel(medicalComplexes, "دليل_المجمعات_الطبية");
      } else if (adminView === "taxis") {
        excelService.exportToExcel(taxis, "دليل_الخدمات_والمهن");
      } else {
        alert("يرجى فتح قسم الأطباء، المجمعات الطبية، أو الخدمات للتصدير");
      }
    } catch (err: any) {
      console.error("Export error:", err);
      alert("حدث خطأ أثناء التصدير: " + (err?.message || "خطأ غير معروف"));
    }
  };

  // Import from Excel
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (adminView === "doctors") {
        const importedDoctors = await excelService.importFromExcel(file);
        if (!importedDoctors || importedDoctors.length === 0) {
          alert("لم يتم العثور على أطباء صالحين في الملف!");
          return;
        }

        const confirmMsg = `تم استخراج ${importedDoctors.length} طبيب من الملف.\nهل ترغب في حفظهم بقاعدة البيانات؟`;
        if (window.confirm(confirmMsg)) {
          for (const doc of importedDoctors) {
            const item = { ...doc, id: doc.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` };
            await firebaseService.saveDocument("doctors", item.id, item);
          }
          if (setDoctors) {
            setDoctors((prev) => {
              const prevMap = new Map(prev.map((d) => [d.id, d]));
              importedDoctors.forEach((d) => {
                const item = { ...d, id: d.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` };
                prevMap.set(item.id, item);
              });
              return Array.from(prevMap.values());
            });
          }
          alert(`✅ تم استيراد وحفظ ${importedDoctors.length} طبيب بنجاح!`);
        }
      } else if (adminView === "medical_complexes") {
        const importedComplexes = await excelService.importFromExcel(file);
        if (!importedComplexes || importedComplexes.length === 0) {
          alert("لم يتم العثور على مجمعات صالحة في الملف!");
          return;
        }
        const confirmMsg = `تم استخراج ${importedComplexes.length} مجمع طبي من الملف.\nهل ترغب في حفظهم بقاعدة البيانات؟`;
        if (window.confirm(confirmMsg)) {
          for (const complex of importedComplexes) {
            const complexItem = {
              ...complex,
              id: complex.id || `complex-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              _storeType: "complex",
              isMedicalComplex: true,
              category: complex.category || "مجمع طبي",
            };
            await firebaseService.saveDocument("medical_complexes", complexItem.id, complexItem);
          }
          if (setMedicalComplexes) {
            setMedicalComplexes((prev) => {
              const prevMap = new Map(prev.map((s) => [s.id, s]));
              importedComplexes.forEach((s) => {
                const complexItem = {
                  ...s,
                  id: s.id || `complex-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                  _storeType: "complex",
                  isMedicalComplex: true,
                  category: s.category || "مجمع طبي",
                };
                prevMap.set(complexItem.id, complexItem);
              });
              return Array.from(prevMap.values());
            });
          }
          alert(`✅ تم استيراد وحفظ ${importedComplexes.length} مجمع طبي بنجاح!`);
        }
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      console.error("Import error:", err);
      alert(`❌ حدث خطأ أثناء معالجة الملف: ${err?.message || "خطأ في قراءة الملف"}`);
    }
  };

  // Main Admin Grid Sections Configuration (Focused on user's core requests)
  const navSections = [
    {
      id: "medical_complexes",
      label: "المجمعات الطبية",
      subtitle: "دليل المجمعات والمراكز والمستشفيات والعيادات الاستشارية",
      icon: <Hospital size={24} />,
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
      accentBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      count: medicalComplexes?.length || 0,
    },
    {
      id: "doctors",
      label: "الأطباء",
      subtitle: "الأطباء والعيادات التخصصية وإدارة التخصصات",
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

  const currentSection =
    adminView === "market_products"
      ? {
          id: "market_products",
          label: `الكوادر الطبية: ${adminSelectedStore?.name || "المجمع الطبي"}`,
          subtitle: "إدارة قائمة الكوادر الطبية والأطباء مع التفاصيل وأرقام الحجز الخاصة بهم",
          icon: <Stethoscope size={24} />,
          badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
          accentBg: "bg-emerald-500/10 text-emerald-600",
          count: adminMarketProducts?.length || 0,
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
                    setAdminView("medical_complexes");
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
                  ? "اختر أي قسم لإدارة المحتوى بشكل مباشر"
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
            {/* Nav Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {navSections.map((sec) => (
                <motion.div
                  key={sec.id}
                  whileHover={{ scale: 1.015, y: -2 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => {
                    setAdminView(sec.id as any);
                    setIsAdding(false);
                    setEditingItem(null);
                    setFormData({});
                  }}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-emerald-500/50 dark:hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col justify-between min-h-[160px] group text-right"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`w-14 h-14 rounded-2xl ${sec.accentBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      {sec.icon}
                    </div>
                    <span className={`text-xs font-black px-3 py-1 rounded-xl border ${sec.badgeColor}`}>
                      {sec.count} عنصر
                    </span>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {sec.label}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {sec.subtitle}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          /* ================= ACTIVE SECTION DETAIL VIEW ================= */
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Top Toolbar: Search + Excel Operations */}
            <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full sm:flex-1">
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو التفاصيل داخل هذا القسم..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full h-11 pr-10 pl-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-right"
                />
                <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Excel Import / Export Toolbar for Doctors & Complexes */}
              {(adminView === "doctors" || adminView === "medical_complexes" || adminView === "taxis") && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleExportExcel}
                    className="flex-1 sm:flex-initial h-11 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
                    title="تصدير ملف إكسل"
                  >
                    <FileOutput size={16} />
                    <span>تصدير Excel</span>
                  </button>

                  <label className="flex-1 sm:flex-initial h-11 px-3.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0">
                    <FileInput size={16} />
                    <span>استيراد Excel</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleImportExcel}
                      className="hidden"
                    />
                  </label>
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
                      {formData.image || (formData.images && formData.images[0]) || formData.logoImage ? (
                        <img
                          src={formData.image || (formData.images && formData.images[0]) || formData.logoImage}
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
                        {adminView === "market_products"
                          ? "صورة الطبيب / الكادر الطبي"
                          : adminView === "medical_complexes"
                          ? "شعار المجمع الطبي (لوجو)"
                          : "صورة الغلاف / الصورة الشخصية"}
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
                          : adminView === "market_products"
                          ? "اسم الطبيب كامل (مثال: د. علي صبيح)"
                          : adminView === "medical_complexes"
                          ? "اسم المجمع الطبي أو المستشفى"
                          : adminView === "banners"
                          ? "عنوان الإعلان الترويجي"
                          : "الاسم / العنوان"
                      }
                      value={formData.name || formData.title || ""}
                      onChange={(v) =>
                        setFormData({ ...formData, name: v, title: v })
                      }
                    />

                    {/* Doctors Specialty Selector */}
                    {adminView === "doctors" && (
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
                    )}

                    {/* Complex Doctor Specialty */}
                    {adminView === "market_products" && (
                      <AdminInput
                        placeholder="التخصص الطبي (مثال: أخصائي جراحة عامة)"
                        value={formData.specialty || formData.subtitle || formData.menuCategory || ""}
                        onChange={(v) =>
                          setFormData({ ...formData, specialty: v, subtitle: v, menuCategory: v })
                        }
                      />
                    )}

                    {/* Medical Complex Category */}
                    {adminView === "medical_complexes" && (
                      <div className="space-y-1.5 text-right">
                        <label className="text-xs font-black text-slate-700 dark:text-slate-200">
                          نوع المنشأة الطبية:
                        </label>
                        <select
                          value={formData.category || "مجمع طبي"}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none cursor-pointer text-right"
                        >
                          <option value="مجمع طبي">مجمع طبي متكامل</option>
                          <option value="مستشفى">مستشفى أو مركز تخصصي</option>
                          <option value="عيادات">عيادات استشارية</option>
                          <option value="مختبر">مختبر تحليلات مرضية</option>
                          <option value="صيدلية">صيدلية</option>
                        </select>
                      </div>
                    )}

                    {/* Taxi & Service Category Selector */}
                    {adminView === "taxis" && (
                      <div className="space-y-1.5 text-right">
                        <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center justify-between">
                          <span>الفئة / المهنة:</span>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                            حدد المهنة أو وسيلة النقل
                          </span>
                        </label>
                        <div className="relative">
                          <select
                            value={formData.category || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "__CUSTOM__") {
                                setFormData({ ...formData, category: "", _isCustomCategory: true });
                              } else {
                                setFormData({ ...formData, category: val, _isCustomCategory: false });
                              }
                            }}
                            className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 focus:border-amber-500 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none transition-all cursor-pointer appearance-none text-right"
                            dir="rtl"
                          >
                            <option value="">-- اختر الفئة / المهنة --</option>
                            {serviceCategoriesList?.map((cat) => (
                              <option key={cat.id} value={cat.name}>
                                {cat.name}
                              </option>
                            ))}
                            {formData.category &&
                              !serviceCategoriesList?.some((s) => s.name === formData.category) && (
                                <option value={formData.category}>{formData.category}</option>
                              )}
                            <option value="__CUSTOM__">➕ إدخال فئة جديدة يدوياً...</option>
                          </select>
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <ChevronDown size={18} />
                          </div>
                        </div>

                        {(formData._isCustomCategory ||
                          (formData.category &&
                            !serviceCategoriesList?.some((s) => s.name === formData.category))) && (
                          <div className="pt-1.5 animate-in fade-in">
                            <AdminInput
                              placeholder="اكتب اسم الفئة الجديدة هنا..."
                              value={formData.category || ""}
                              onChange={(v) => setFormData({ ...formData, category: v })}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Phones & Contacts */}
                    {adminView !== "notifications" && adminView !== "banners" && (
                      <AdminInput
                        placeholder="رقم الهاتف الأساسي"
                        value={formData.phone1 || formData.phone || ""}
                        onChange={(v) =>
                          setFormData({ ...formData, phone1: v, phone: v })
                        }
                      />
                    )}

                    {/* Reservation phone for doctors */}
                    {(adminView === "doctors" || adminView === "market_products") && (
                      <AdminInput
                        placeholder="رقم الحجز المباشر (اختياري)"
                        value={formData.reservationPhone || ""}
                        onChange={(v) =>
                          setFormData({ ...formData, reservationPhone: v })
                        }
                      />
                    )}

                    {/* Working days for complex doctors */}
                    {adminView === "market_products" && (
                      <AdminInput
                        placeholder="أيام وأوقات الدوام (مثال: السبت إلى الخميس 4-8 مساءً)"
                        value={formData.workingDays || ""}
                        onChange={(v) =>
                          setFormData({ ...formData, workingDays: v })
                        }
                      />
                    )}

                    {/* Location */}
                    {adminView !== "notifications" && adminView !== "banners" && (
                      <AdminInput
                        placeholder="الموقع / العنوان (مثال: الشرقاط - شارع الأطباء)"
                        value={formData.location || ""}
                        onChange={(v) =>
                          setFormData({ ...formData, location: v })
                        }
                      />
                    )}

                    {/* WhatsApp */}
                    {(adminView === "medical_complexes" || adminView === "taxis") && (
                      <AdminInput
                        placeholder="رقم الواتساب (مثال: 07701234567)"
                        value={formData.whatsapp || formData.whatsappNumber || ""}
                        onChange={(v) =>
                          setFormData({ ...formData, whatsapp: v, whatsappNumber: v })
                        }
                      />
                    )}

                    {/* Taxi Car Type */}
                    {adminView === "taxis" && (
                      <AdminInput
                        placeholder="نوع السيارة / وسيلة النقل أو تفاصيل المهنة"
                        value={formData.carType || ""}
                        onChange={(v) =>
                          setFormData({ ...formData, carType: v })
                        }
                      />
                    )}
                  </div>

                  {/* Description / Message Area */}
                  <div className="space-y-1.5 text-right">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-200">
                      {adminView === "notifications" ? "نص الإشعار والتفاصيل:" : "التفاصيل والملاحظات:"}
                    </label>
                    <textarea
                      placeholder="اكتب هنا كافة التفاصيل والملاحظات..."
                      rows={3}
                      value={formData.description || formData.message || formData.content || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                          message: e.target.value,
                          content: e.target.value,
                        })
                      }
                      className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 transition-all text-right resize-none"
                    />
                  </div>

                  {/* Show in Home Checkbox */}
                  {adminView !== "notifications" && adminView !== "banners" && (
                    <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showInHome !== false}
                        onChange={(e) =>
                          setFormData({ ...formData, showInHome: e.target.checked })
                        }
                        className="w-5 h-5 rounded-lg text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                        عرض هذا العنصر في الصفحة الرئيسية للتطبيق
                      </span>
                    </label>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={saveItem}
                      className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>حفظ البيانات</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsAdding(false);
                        setEditingItem(null);
                        setFormData({});
                      }}
                      className="px-6 h-12 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-black text-sm transition-all active:scale-95 cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Specialties Management Panel (When in Specialties Sub-Tab) */}
            {adminView === "doctors" && doctorSubTab === "specialties" && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-display font-black text-slate-900 dark:text-white text-base">
                      إدارة التخصصات الطبية المعتمدة
                    </h3>
                    <p className="text-xs text-slate-400 font-bold">
                      أضف أو عدّل التخصصات التي تظهر في قوائم تصفية الأطباء
                    </p>
                  </div>
                  <button
                    onClick={handleResetDefaultSpecialties}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>استعادة التخصصات الافتراضية</span>
                  </button>
                </div>

                {/* Add New Specialty Bar */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="اكتب اسم التخصص الطبي الجديد..."
                    value={newSpecialtyName}
                    onChange={(e) => setNewSpecialtyName(e.target.value)}
                    className="flex-1 h-12 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-right"
                  />
                  <button
                    onClick={handleAddSpecialty}
                    className="h-12 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black flex items-center gap-2 active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    <Plus size={18} />
                    <span>إضافة</span>
                  </button>
                </div>

                {/* Search Specialties */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث في التخصصات..."
                    value={specialtySearch}
                    onChange={(e) => setSpecialtySearch(e.target.value)}
                    className="w-full h-10 pr-9 pl-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 text-right"
                  />
                  <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                {/* Specialties Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[420px] overflow-y-auto">
                  {doctorSpecialtiesList
                    ?.filter((s) => !specialtySearch || s.name.includes(specialtySearch))
                    .map((spec) => (
                      <div
                        key={spec.id}
                        className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-2"
                      >
                        {editingSpecialtyId === spec.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editingSpecialtyName}
                              onChange={(e) => setEditingSpecialtyName(e.target.value)}
                              className="flex-1 h-8 px-2 bg-white dark:bg-slate-800 border rounded-lg text-xs font-bold text-right"
                            />
                            <button
                              onClick={() => handleUpdateSpecialty(spec.id)}
                              className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-lg"
                            >
                              حفظ
                            </button>
                            <button
                              onClick={() => setEditingSpecialtyId(null)}
                              className="px-2 py-1 bg-slate-200 text-slate-700 text-[10px] font-black rounded-lg"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                              {spec.name}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  setEditingSpecialtyId(spec.id);
                                  setEditingSpecialtyName(spec.name);
                                }}
                                className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all"
                                title="تعديل"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteSpecialty(spec.id, spec.name)}
                                className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-all"
                                title="حذف"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Service Categories Management Panel (When in Categories Sub-Tab) */}
            {adminView === "taxis" && serviceSubTab === "categories" && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-display font-black text-slate-900 dark:text-white text-base">
                      إدارة فئات الخدمات والمهن
                    </h3>
                    <p className="text-xs text-slate-400 font-bold">
                      أضف أو عدّل الفئات والمهن الحرفية ووسائل النقل
                    </p>
                  </div>
                  <button
                    onClick={handleResetDefaultServiceCategories}
                    className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>استعادة الفئات الافتراضية</span>
                  </button>
                </div>

                {/* Add New Category Bar */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="اكتب اسم الفئة أو المهنة الجديدة..."
                    value={newServiceCategoryName}
                    onChange={(e) => setNewServiceCategoryName(e.target.value)}
                    className="flex-1 h-12 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-right"
                  />
                  <button
                    onClick={handleAddServiceCategory}
                    className="h-12 px-5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-black flex items-center gap-2 active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    <Plus size={18} />
                    <span>إضافة</span>
                  </button>
                </div>

                {/* Search Service Categories */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث في الفئات والمهن..."
                    value={serviceCategorySearch}
                    onChange={(e) => setServiceCategorySearch(e.target.value)}
                    className="w-full h-10 pr-9 pl-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 text-right"
                  />
                  <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[420px] overflow-y-auto">
                  {serviceCategoriesList
                    ?.filter((s) => !serviceCategorySearch || s.name.includes(serviceCategorySearch))
                    .map((cat) => (
                      <div
                        key={cat.id}
                        className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-2"
                      >
                        {editingServiceCategoryId === cat.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editingServiceCategoryName}
                              onChange={(e) => setEditingServiceCategoryName(e.target.value)}
                              className="flex-1 h-8 px-2 bg-white dark:bg-slate-800 border rounded-lg text-xs font-bold text-right"
                            />
                            <button
                              onClick={() => handleUpdateServiceCategory(cat.id)}
                              className="px-2.5 py-1 bg-amber-600 text-white text-[10px] font-black rounded-lg"
                            >
                              حفظ
                            </button>
                            <button
                              onClick={() => setEditingServiceCategoryId(null)}
                              className="px-2 py-1 bg-slate-200 text-slate-700 text-[10px] font-black rounded-lg"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                              {cat.name}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  setEditingServiceCategoryId(cat.id);
                                  setEditingServiceCategoryName(cat.name);
                                }}
                                className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all"
                                title="تعديل"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteServiceCategory(cat.id, cat.name)}
                                className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-all"
                                title="حذف"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Normal Items List (Doctors, Complexes, Notifications, Banners, Taxis) */}
            {(!isAdding &&
              !(adminView === "doctors" && doctorSubTab === "specialties") &&
              !(adminView === "taxis" && serviceSubTab === "categories")) && (
              <div className="space-y-3">
                {(() => {
                  let items: any[] = [];
                  if (adminView === "doctors") items = doctors;
                  else if (adminView === "medical_complexes") items = medicalComplexes;
                  else if (adminView === "market_products") items = adminMarketProducts;
                  else if (adminView === "banners") items = banners;
                  else if (adminView === "taxis") items = taxis;
                  else if (adminView === "notifications") items = notifications;

                  const filtered = items.filter((item) => {
                    if (!adminSearch.trim()) return true;
                    const q = adminSearch.toLowerCase().trim();
                    return (
                      (item.name && item.name.toLowerCase().includes(q)) ||
                      (item.title && item.title.toLowerCase().includes(q)) ||
                      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
                      (item.specialty && item.specialty.toLowerCase().includes(q)) ||
                      (item.phone1 && item.phone1.includes(q)) ||
                      (item.phone && item.phone.includes(q)) ||
                      (item.location && item.location.toLowerCase().includes(q)) ||
                      (item.description && item.description.toLowerCase().includes(q)) ||
                      (item.message && item.message.toLowerCase().includes(q))
                    );
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800">
                        <p className="text-sm font-black text-slate-500 dark:text-slate-400">
                          لا توجد عناصر مسجلة تطابق هذا البحث
                        </p>
                        <button
                          onClick={startAdd}
                          className="mt-4 px-5 py-2.5 bg-emerald-600 text-white rounded-2xl text-xs font-black inline-flex items-center gap-2 shadow-sm"
                        >
                          <Plus size={16} />
                          <span>إضافة أول عنصر</span>
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 gap-3">
                      {filtered.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-right"
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                              {item.image || (item.images && item.images[0]) || item.logoImage ? (
                                <img
                                  src={item.image || (item.images && item.images[0]) || item.logoImage}
                                  className="w-full h-full object-cover"
                                  alt=""
                                />
                              ) : adminView === "medical_complexes" ? (
                                <Hospital className="text-emerald-600" size={24} />
                              ) : adminView === "doctors" ? (
                                <Stethoscope className="text-indigo-600" size={24} />
                              ) : adminView === "notifications" ? (
                                <Bell className="text-rose-600" size={24} />
                              ) : adminView === "taxis" ? (
                                <Wrench className="text-amber-600" size={24} />
                              ) : (
                                <ImageIcon className="text-slate-400" size={24} />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white truncate">
                                  {item.name || item.title}
                                </h4>
                                {item.category && (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    {item.category}
                                  </span>
                                )}
                              </div>

                              {(item.subtitle || item.specialty || item.carType) && (
                                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                                  {item.subtitle || item.specialty || item.carType}
                                </p>
                              )}

                              <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-1 flex-wrap">
                                {(item.phone1 || item.phone) && (
                                  <span className="flex items-center gap-1">
                                    <Phone size={12} />
                                    <span>{item.phone1 || item.phone}</span>
                                  </span>
                                )}
                                {item.location && <span>📍 {item.location}</span>}
                                {item.reservationPhone && <span>📞 حجز: {item.reservationPhone}</span>}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            {/* Medical Complex: Manage Complex Doctors Button */}
                            {adminView === "medical_complexes" && (
                              <button
                                onClick={() => {
                                  if (setAdminSelectedStore) {
                                    setAdminSelectedStore(item);
                                  }
                                  setAdminView("market_products");
                                  setIsAdding(false);
                                }}
                                className="h-10 px-3.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                              >
                                <Stethoscope size={15} />
                                <span>الكوادر الطبية</span>
                              </button>
                            )}

                            <button
                              onClick={() => startEdit(item)}
                              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                              title="تعديل"
                            >
                              <Edit3 size={17} />
                            </button>

                            <button
                              onClick={() => deleteItem(item.id, adminView)}
                              className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                              title="حذف"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const AdminInput = ({
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) => (
  <div className="space-y-1.5 text-right">
    <label className="text-xs font-black text-slate-700 dark:text-slate-200">
      {placeholder}:
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 focus:border-emerald-500 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none transition-all text-right"
    />
  </div>
);

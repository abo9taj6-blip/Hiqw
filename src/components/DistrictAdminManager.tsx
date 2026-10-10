import React, { useState } from "react";
import {
  Landmark as LandmarkIcon,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  Save,
  ArrowUpDown,
} from "lucide-react";
import { District, Landmark, LandmarkType } from "../types";
import { DEFAULT_DISTRICTS } from "../data/salahaddin";
import { firebaseService } from "../services/firebaseService";

interface DistrictAdminManagerProps {
  districts: District[];
  setDistricts: React.Dispatch<React.SetStateAction<District[]>>;
  adminSearch?: string;
}

const VALID_LANDMARK_TYPES: LandmarkType[] = [
  "تاريخي",
  "سياحي",
  "تراثي",
  "طبيعي",
  "ثقافي",
];

export const DistrictAdminManager: React.FC<DistrictAdminManagerProps> = ({
  districts,
  setDistricts,
  adminSearch = "",
}) => {
  // Editing or adding modal/form state
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [activeDistrictId, setActiveDistrictId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    summary: string;
    order: number;
    isActive: boolean;
    landmarks: Landmark[];
  }>({
    id: "",
    name: "",
    summary: "",
    order: 1,
    isActive: true,
    landmarks: [],
  });

  // Landmark sub-form state
  const [newLandmarkId, setNewLandmarkId] = useState("");
  const [newLandmarkName, setNewLandmarkName] = useState("");
  const [newLandmarkDesc, setNewLandmarkDesc] = useState("");
  const [newLandmarkType, setNewLandmarkType] =
    useState<LandmarkType>("تاريخي");
  const [editingLandmarkIdx, setEditingLandmarkIdx] = useState<number | null>(
    null,
  );

  // Alerts & Notifications
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Start Adding a new District
  const handleStartAdd = () => {
    const nextOrder =
      districts.length > 0
        ? Math.max(...districts.map((d) => d.order || 0)) + 1
        : 1;

    setFormData({
      id: `district-${Date.now()}`,
      name: "",
      summary: "",
      order: nextOrder,
      isActive: true,
      landmarks: [],
    });
    setIsNew(true);
    setActiveDistrictId(null);
    setIsEditing(true);
    resetLandmarkForm();
  };

  // Start Editing an existing District
  const handleStartEdit = (d: District) => {
    setFormData({
      id: d.id,
      name: d.name || "",
      summary: d.summary || "",
      order: d.order || 1,
      isActive: d.isActive !== false,
      landmarks: Array.isArray(d.landmarks) ? [...d.landmarks] : [],
    });
    setIsNew(false);
    setActiveDistrictId(d.id);
    setIsEditing(true);
    resetLandmarkForm();
  };

  const resetLandmarkForm = () => {
    setNewLandmarkId("");
    setNewLandmarkName("");
    setNewLandmarkDesc("");
    setNewLandmarkType("تاريخي");
    setEditingLandmarkIdx(null);
  };

  // Toggle active directly from list
  const handleToggleActive = async (d: District) => {
    const newStatus = !d.isActive;
    try {
      await firebaseService.saveDocument("districts", d.id, {
        isActive: newStatus,
      });
      setDistricts((prev) =>
        prev.map((item) =>
          item.id === d.id ? { ...item, isActive: newStatus } : item,
        ),
      );
      showFeedback(
        "success",
        `تم ${newStatus ? "تفعيل" : "تعطيل"} قضاء "${d.name}" بنجاح`,
      );
    } catch (err: any) {
      showFeedback("error", `فشل تحديث حالة القضاء: ${err.message || ""}`);
    }
  };

  // Delete District
  const handleDeleteDistrict = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف قضاء "${name}" نهائياً؟`)) {
      return;
    }

    try {
      await firebaseService.deleteDocument("districts", id);
      setDistricts((prev) => prev.filter((item) => item.id !== id));
      showFeedback("success", `تم حذف قضاء "${name}" بنجاح`);
    } catch (err: any) {
      showFeedback("error", `فشل حذف القضاء: ${err.message || ""}`);
    }
  };

  // Landmark Management in Form
  const handleSaveLandmark = () => {
    const nameTrim = newLandmarkName.trim();
    if (!nameTrim) {
      showFeedback("error", "اسم المعلم مطلوب ولا يجوز تركه فارغاً.");
      return;
    }

    const lmId =
      newLandmarkId.trim() ||
      `${formData.id}-lm-${Date.now().toString().slice(-4)}`;

    // Check duplicate landmark id
    const currentList = formData.landmarks || [];
    const isDuplicate = currentList.some(
      (lm, idx) => lm.id === lmId && idx !== editingLandmarkIdx,
    );

    if (isDuplicate) {
      showFeedback(
        "error",
        "معرّف المعلم (ID) مكرر داخل هذا القضاء، يرجى كتابة معرّف فريد.",
      );
      return;
    }

    const newLm: Landmark = {
      id: lmId,
      name: nameTrim,
      description: newLandmarkDesc.trim(),
      type: newLandmarkType,
    };

    if (editingLandmarkIdx !== null) {
      const updated = [...currentList];
      updated[editingLandmarkIdx] = newLm;
      setFormData((prev) => ({ ...prev, landmarks: updated }));
      showFeedback("success", "تم تحديث بيانات المعلم.");
    } else {
      setFormData((prev) => ({
        ...prev,
        landmarks: [...currentList, newLm],
      }));
      showFeedback("success", "تمت إضافة المعلم بنجاح.");
    }

    resetLandmarkForm();
  };

  const handleEditLandmark = (lm: Landmark, idx: number) => {
    setNewLandmarkId(lm.id);
    setNewLandmarkName(lm.name);
    setNewLandmarkDesc(lm.description || "");
    setNewLandmarkType(lm.type || "تاريخي");
    setEditingLandmarkIdx(idx);
  };

  const handleDeleteLandmark = (idx: number) => {
    const updated = formData.landmarks.filter((_, i) => i !== idx);
    setFormData((prev) => ({ ...prev, landmarks: updated }));
    if (editingLandmarkIdx === idx) {
      resetLandmarkForm();
    }
  };

  // Save the full District to Firestore
  const handleSaveDistrict = async () => {
    const nameTrim = formData.name.trim();
    const idTrim = formData.id.trim();

    // 1. Validate empty name
    if (!nameTrim) {
      showFeedback("error", "اسم القضاء مطلوب ولا يمكن حفظ القضاء فارغاً.");
      return;
    }

    // 2. Validate empty id
    if (!idTrim) {
      showFeedback("error", "معرّف القضاء (ID) مطلوب.");
      return;
    }

    // 3. Prevent duplicate district ID
    if (isNew) {
      const duplicate = districts.some(
        (d) => d.id.toLowerCase() === idTrim.toLowerCase(),
      );
      if (duplicate) {
        showFeedback(
          "error",
          `معرّف القضاء "${idTrim}" موجود مسبقاً، اختر معرّفاً فريداً.`,
        );
        return;
      }
    }

    setIsSaving(true);
    try {
      const docData = {
        id: idTrim,
        name: nameTrim,
        summary: formData.summary.trim(),
        order: Number(formData.order) || 1,
        isActive: Boolean(formData.isActive),
        landmarks: formData.landmarks || [],
      };

      await firebaseService.saveDocument("districts", idTrim, docData);

      // Update state
      setDistricts((prev) => {
        const index = prev.findIndex((d) => d.id === idTrim);
        if (index >= 0) {
          const next = [...prev];
          next[index] = docData as District;
          return next.sort((a, b) => (a.order || 0) - (b.order || 0));
        } else {
          return [...prev, docData as District].sort(
            (a, b) => (a.order || 0) - (b.order || 0),
          );
        }
      });

      showFeedback("success", `تم حفظ قضاء "${nameTrim}" بنجاح في قاعدة البيانات.`);
      setIsEditing(false);
      setIsNew(false);
      setActiveDistrictId(null);
    } catch (err: any) {
      console.error(err);
      showFeedback(
        "error",
        `حدث خطأ أثناء حفظ القضاء: ${err.message || "يرجى المحاولة مجدداً"}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Seed default 8 districts into Firestore if empty
  const handleSeedDefaults = async () => {
    if (
      !window.confirm(
        "هل ترغب في رفع وتهيئة الأقضية الأساسية الـ 8 (سامراء، الشرقاط، تكريت، بلد، بيجي، طوزخورماتو، الدجيل، الدور) إلى Firestore؟",
      )
    ) {
      return;
    }

    setIsSeeding(true);
    try {
      for (const d of DEFAULT_DISTRICTS) {
        await firebaseService.saveDocument("districts", d.id, {
          id: d.id,
          name: d.name,
          summary: d.summary,
          order: d.order,
          isActive: true,
          landmarks: d.landmarks || [],
        });
      }

      setDistricts(DEFAULT_DISTRICTS);
      showFeedback("success", "تمت تهيئة وتحديث كافة الأقضية الـ 8 بنجاح في Firestore!");
    } catch (err: any) {
      console.error(err);
      showFeedback("error", `فشل تهيئة الأقضية: ${err.message || ""}`);
    } finally {
      setIsSeeding(false);
    }
  };

  // Filtered districts for search
  const filtered = districts.filter((d) => {
    if (!adminSearch.trim()) return true;
    const q = adminSearch.toLowerCase().trim();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.summary?.toLowerCase().includes(q) ||
      d.id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300 text-right" dir="rtl">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-black flex items-center justify-between gap-3 shadow-sm transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <Check size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top Header Actions */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800 shadow-xs">
            <LandmarkIcon size={24} />
          </div>
          <div>
            <h2 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white">
              إدارة أقضية محافظة صلاح الدين
            </h2>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              إضافة وتعديل الأقضية، ترتيب الظهور، وإدارة المعالم السياحية والتاريخية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSeedDefaults}
            disabled={isSeeding}
            className="h-11 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
            title="تهيئة الأقضية الثمانية الأساسية في قاعدة البيانات"
          >
            <RotateCcw size={16} className={isSeeding ? "animate-spin" : ""} />
            <span>تهيئة الأقضية الافتراضية</span>
          </button>

          <button
            onClick={handleStartAdd}
            className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95 shrink-0"
          >
            <Plus size={18} />
            <span>إضافة قضاء جديد</span>
          </button>
        </div>
      </div>

      {/* Editing / Adding Form Modal */}
      {isEditing && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border-2 border-indigo-500/30 dark:border-indigo-500/30 shadow-lg space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Edit3 size={20} />
              </div>
              <div>
                <h3 className="font-display font-black text-slate-900 dark:text-white text-base sm:text-lg">
                  {isNew ? "إضافة قضاء جديد" : `تعديل قضاء: ${formData.name}`}
                </h3>
                <p className="text-xs text-slate-400 font-bold">
                  املأ البيانات بدقة، الاسم مطلوب ومعرّف القضاء يجب أن يكون فريداً
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsEditing(false);
                setIsNew(false);
              }}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ID */}
            <div>
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1.5">
                معرّف القضاء (ID ثابت بالحروف الإنجليزية):
              </label>
              <input
                type="text"
                disabled={!isNew}
                value={formData.id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                  }))
                }
                placeholder="مثال: samarra, shirqat, tikrit"
                className={`w-full h-11 px-4 rounded-2xl text-xs sm:text-sm font-bold border transition-all text-left dir-ltr ${
                  isNew
                    ? "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent cursor-not-allowed"
                }`}
              />
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1.5">
                اسم القضاء <span className="text-rose-500">*</span>:
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="مثال: سامراء، تكريت، الشرقاط..."
                className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-right"
              />
            </div>

            {/* Order */}
            <div>
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1.5">
                ترتيب الظهور في القائمة:
              </label>
              <input
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    order: parseInt(e.target.value) || 1,
                  }))
                }
                className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white text-right"
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1.5">
                حالة الظهور للمستخدمين:
              </label>
              <div className="flex items-center gap-3 h-11">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: !prev.isActive,
                    }))
                  }
                  className={`flex-1 h-full px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    formData.isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                      : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                  }`}
                >
                  {formData.isActive ? (
                    <>
                      <Eye size={16} />
                      <span>نشط ومعروض بالتطبيق (Active)</span>
                    </>
                  ) : (
                    <>
                      <EyeOff size={16} />
                      <span>معطل ومخفي (Inactive)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1.5">
              النبذة التعريفية بالقضاء:
            </label>
            <textarea
              rows={3}
              value={formData.summary}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, summary: e.target.value }))
              }
              placeholder="اكتب نبذة موجزة عن تاريخ وجغرافية وأهمية القضاء..."
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-right leading-relaxed"
            />
          </div>

          {/* Landmarks Section Inside Form */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display font-black text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                  <LandmarkIcon size={18} className="text-amber-500" />
                  <span>معالم ووجهات القضاء ({formData.landmarks?.length || 0})</span>
                </h4>
                <p className="text-[11px] text-slate-400 font-bold">
                  أضف المعالم والآثار والمواقع الطبيعية والسياحية التابعة لهذا القضاء
                </p>
              </div>
            </div>

            {/* Sub-form: Add / Edit Landmark */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                {editingLandmarkIdx !== null
                  ? "تعديل المعلم المحدد:"
                  : "إضافة معلم جديد إلى القضاء:"}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  placeholder="اسم المعلم (مثال: قلعة آشور، جامع الملوية)..."
                  value={newLandmarkName}
                  onChange={(e) => setNewLandmarkName(e.target.value)}
                  className="sm:col-span-2 h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white text-right"
                />

                {/* Dropdown for Landmark Type */}
                <select
                  value={newLandmarkType}
                  onChange={(e) =>
                    setNewLandmarkType(e.target.value as LandmarkType)
                  }
                  className="h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white text-right cursor-pointer"
                >
                  {VALID_LANDMARK_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  placeholder="وصف مختصر للمعلم وأهميته..."
                  value={newLandmarkDesc}
                  onChange={(e) => setNewLandmarkDesc(e.target.value)}
                  className="sm:col-span-2 h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white text-right"
                />

                <input
                  type="text"
                  placeholder="معرّف المعلم ID (اختياري)..."
                  value={newLandmarkId}
                  onChange={(e) =>
                    setNewLandmarkId(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                    )
                  }
                  className="h-10 px-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white text-left dir-ltr"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                {editingLandmarkIdx !== null && (
                  <button
                    type="button"
                    onClick={resetLandmarkForm}
                    className="px-3.5 h-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black cursor-pointer"
                  >
                    إلغاء التعديل
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveLandmark}
                  className="px-4 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus size={15} />
                  <span>
                    {editingLandmarkIdx !== null
                      ? "حفظ تعديل المعلم"
                      : "إضافة المعلم للقائمة"}
                  </span>
                </button>
              </div>
            </div>

            {/* List of current landmarks in form */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {formData.landmarks.length === 0 ? (
                <div className="p-4 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  لم يتم إضافة معالم لهذا القضاء بعد
                </div>
              ) : (
                formData.landmarks.map((lm, idx) => (
                  <div
                    key={lm.id || idx}
                    className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-right"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                          {lm.name}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {lm.type}
                        </span>
                      </div>
                      {lm.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-normal">
                          {lm.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditLandmark(lm, idx)}
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer"
                        title="تعديل"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLandmark(idx)}
                        className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 flex items-center justify-center cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setIsNew(false);
              }}
              className="px-5 h-11 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-black cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveDistrict}
              className="px-7 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Save size={16} />
              <span>{isSaving ? "جاري الحفظ..." : "حفظ القضاء في Firestore"}</span>
            </button>
          </div>
        </div>
      )}

      {/* List of Districts */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 space-y-3">
            <p className="text-sm font-black text-slate-500 dark:text-slate-400">
              لا توجد أقضية مطابقة للبحث أو القائمة فارغة
            </p>
            <button
              onClick={handleSeedDefaults}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-black inline-flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <RotateCcw size={15} />
              <span>استعادة الأقضية الافتراضية للبدء</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map((d) => (
              <div
                key={d.id}
                className={`bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  d.isActive
                    ? "border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-sm"
                    : "border-slate-200/50 dark:border-slate-800/50 opacity-60 bg-slate-50/50 dark:bg-slate-950/50"
                }`}
              >
                {/* District Details */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800 font-display font-black text-sm">
                    {d.order || 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                        قضاء {d.name}
                      </h4>

                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {d.id}
                      </span>

                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          d.isActive
                            ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300"
                        }`}
                      >
                        {d.isActive ? "نشط" : "معطل"}
                      </span>

                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200">
                        {d.landmarks?.length || 0} معالم
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 font-normal leading-relaxed">
                      {d.summary}
                    </p>
                  </div>
                </div>

                {/* Operations Toolbar */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleToggleActive(d)}
                    className={`h-9 px-3 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      d.isActive
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        : "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    }`}
                    title={d.isActive ? "تعطيل القضاء" : "تفعيل القضاء"}
                  >
                    {d.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{d.isActive ? "تعطيل" : "تفعيل"}</span>
                  </button>

                  <button
                    onClick={() => handleStartEdit(d)}
                    className="h-9 px-3.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Edit3 size={14} />
                    <span>تعديل والمعالم</span>
                  </button>

                  <button
                    onClick={() => handleDeleteDistrict(d.id, d.name)}
                    className="h-9 w-9 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center cursor-pointer transition-all"
                    title="حذف القضاء"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

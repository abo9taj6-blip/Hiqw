import React, {
  useState,
  useEffect,
  useRef,
  lazy,
  Suspense,
  useMemo,
} from "react";
import {
  Zap,
  PlusCircle,
  PackageCheck,
  Package,
  Phone,
  MessageCircle,
  WifiOff,
  Search,
  Menu,
  Bell,
  X,
  Trash2,
  Info,
  Eye,
  Shield,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Stethoscope,
  Car,
  Hammer,
  Scale,
  Edit3,
  FileCheck,
  FileText,
  QrCode,
  Scan,
  RotateCcw,
  Calendar,
  Save,
  Share,
  StickyNote,
  ArrowLeft,
  ShieldAlert,
  CheckSquare,
  Gavel,
  Briefcase,
  List,
  Tag,
  Star,
  Sun,
  Moon,
  LayoutDashboard,
  Users,
  TrendingUp,
  ShieldCheck,
  Filter,
  SlidersHorizontal,
  Database,
  Settings as SettingsIcon,
  Sparkles,
  LayoutGrid,
  MessageCircle as Whatsapp,
  Pin,
  Check,
  Lock,
  LogOut,
  ShoppingCart,
  ShoppingBag,
  ExternalLink,
  AlertCircle,
  Home,
  Settings,
  CheckCircle,
  Hospital,
  Dumbbell,
  PartyPopper,
  CalendarHeart,
  Gift,
  Megaphone,
  History,
  Fuel,
  Utensils,
  Globe,
  BookOpen,
  Wrench,
  Smartphone,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toPng } from "html-to-image";
import { playSuccessSound } from "./utils/audio";

// Custom Components
import { DetailPage, SectionHeader, DetailRow } from "./components/DetailPage";
import { OverlayPage } from "./components/OverlayPage";
import { ItemCard } from "./components/ItemCard";
import { DoctorCard } from "./components/DoctorCard";
import { SearchBar } from "./components/SearchBar";
import { AdminPanel } from "./components/AdminPanel";

// Resilient LocalStorage Manager to prevent QuotaExceededError and quota overflows
export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e: any) {
      console.warn(`[safeStorage] Quota exceeded or error setting ${key}:`, e);
      try {
        // Free up space by removing non-critical large caches
        localStorage.removeItem("cached_marketProducts");
        localStorage.removeItem("cached_marketStores");
        localStorage.removeItem("cached_hospitalDoctors");
        localStorage.removeItem("cached_banners");
        localStorage.removeItem("cached_serviceOffers");
        localStorage.setItem(key, value);
      } catch {
        // If still exceeds quota (e.g., massive base64 payloads), sanitize array payload
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const stripped = parsed.slice(0, 40).map((item: any) => {
              if (item && typeof item === "object") {
                const copy = { ...item };
                if (
                  typeof copy.image === "string" &&
                  copy.image.startsWith("data:") &&
                  copy.image.length > 5000
                ) {
                  delete copy.image;
                }
                return copy;
              }
              return item;
            });
            localStorage.setItem(key, JSON.stringify(stripped));
          }
        } catch {
          // Gracefully fallback without throwing errors
        }
      }
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

const CountdownTimer = ({
  eventDate,
  onExpire,
}: {
  eventDate: string;
  onExpire?: () => void;
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    d: number;
    h: number;
    m: number;
    s: number;
  } | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(eventDate).getTime() - new Date().getTime();
      let timeLeftVar = null;

      if (difference > 0) {
        timeLeftVar = {
          d: Math.floor(difference / (1000 * 60 * 60 * 24)),
          h: Math.floor((difference / (1000 * 60 * 60)) % 24),
          m: Math.floor((difference / 1000 / 60) % 60),
          s: Math.floor((difference / 1000) % 60),
        };
      } else if (!expired) {
        setExpired(true);
        if (onExpire) onExpire();
      }
      return timeLeftVar;
    };

    const initial = calculateTimeLeft();
    setTimeLeft(initial);

    if (initial) {
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [eventDate, expired, onExpire]);

  if (!timeLeft) {
    return null;
  }

  return (
    <div className="mt-2 text-sky-700 dark:text-sky-300 flex items-center justify-center gap-1.5 opacity-80">
      <div className="flex flex-col items-center">
        <span className="text-sm font-black">{timeLeft.d}</span>
        <span className="text-xs">يوم</span>
      </div>
      <span className="text-sm font-black opacity-50">:</span>
      <div className="flex flex-col items-center">
        <span className="text-sm font-black">{timeLeft.h}</span>
        <span className="text-xs">ساعة</span>
      </div>
      <span className="text-sm font-black opacity-50">:</span>
      <div className="flex flex-col items-center">
        <span className="text-sm font-black">{timeLeft.m}</span>
        <span className="text-xs">دقيقة</span>
      </div>
      <span className="text-sm font-black opacity-50">:</span>
      <div className="flex flex-col items-center w-6 text-rose-500">
        <span className="text-sm font-black">{timeLeft.s}</span>
        <span className="text-xs">ثانية</span>
      </div>
    </div>
  );
};

// Constants & Types
import {
  Doctor,
  DoctorSpecialty,
  DoctorRegion,
  ServiceCategory,
  GovAnnouncement,
  BannerAd,
  HospitalDoctor,
  MarketStore,
  MarketProduct,
  ServiceOffer,
  TaxiDriver,
  Notification,
} from "./types";
import { firebaseService } from "./services/firebaseService";
import { auth } from "./lib/firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";

export const DetailsCarousel = ({ images, title, heightClass = "h-64", marginClass = "my-0" }: { images: string[]; title: string; heightClass?: string; marginClass?: string }) => {
  const [index, setIndex] = useState(0);

  const validImages = useMemo(() => {
    return (images || []).filter((img) => img && typeof img === "string" && img.trim() !== "");
  }, [images]);

  useEffect(() => {
    if (validImages.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % validImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [validImages]);

  if (validImages.length === 0) {
    return (
      <div className={`relative ${heightClass} ${marginClass} rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400`}>
        <span>لا توجد صور متوفرة</span>
      </div>
    );
  }

  return (
    <div className={`relative ${heightClass} ${marginClass} rounded-2xl overflow-hidden shadow-xs border border-slate-100/85 dark:border-slate-800 shrink-0`}>
      <AnimatePresence mode="popLayout">
        <motion.img 
          key={index}
          src={validImages[index]} 
          alt={`${title} - ${index + 1}`} 
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ x: "100%", opacity: 1 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        />
      </AnimatePresence>
      {validImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIndex((prev) => (prev - 1 + validImages.length) % validImages.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm active:scale-95 text-sm font-bold z-10"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setIndex((prev) => (prev + 1) % validImages.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm active:scale-95 text-sm font-bold z-10"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10 bg-black/30 px-2.5 py-1 rounded-full backdrop-blur-sm">
            {validImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === index ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const DashboardCard = ({
  icon,
  label,
  gradient,
  onClick,
  count,
  compact,
}: any) => {
  const handleClick = () => {
    if (window.navigator.vibrate) window.navigator.vibrate(8);
    onClick();
  };

  const renderIcon = () => {
    if (React.isValidElement(icon) && typeof icon.type !== "string") {
      if (compact) {
        return React.cloneElement(icon as any, {
          className: "w-5 h-5 xs:w-5 xs:h-5 sm:w-7 sm:h-7",
          strokeWidth: 2,
        });
      } else {
        return React.cloneElement(icon as any, { size: 20 });
      }
    }
    return icon;
  };

  if (compact) {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className={`w-full max-w-[120px] sm:max-w-[150px] aspect-[1.4/1] bg-gradient-to-br ${gradient} rounded-2xl text-white flex flex-col items-center justify-center shadow-sm hover:shadow-md border border-white/10 outline-none transition-all mx-auto`}
      >
        {renderIcon()}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`w-full bg-gradient-to-br ${gradient} m-1 p-3 rounded-[2rem] text-white flex flex-row items-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all text-right`}
    >
      <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner shrink-0">
        {renderIcon()}
      </div>
      <span className="font-display font-black text-sm tracking-tight leading-tight">
        {label}
      </span>
    </motion.button>
  );
};

const defaultServiceOffers: ServiceOffer[] = [
  {
    id: "offer-car-1",
    title: "تويوتا كورولا 2022 فول مواصفات",
    subtitle: "وارد خليجي - محرك 2000",
    description: "تويوتا كورولا موديل 2022، محرك 2000، كير اوتوماتيك، شاشة، كاميرا، بصمة، تبريد قطعتين، وارد خليجي، ماشية 35 ألف كم. مكان المعاينة الشرقاط.",
    price: "$ 16,500",
    whatsappNumber: "07700000001",
    buttonText: "اتصل الآن",
    tag: "سيارات",
    isActive: true,
    showInHome: true,
    createdAt: Date.now() - 10000,
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80"
    ],
  },
  {
    id: "offer-real-1",
    title: "منزل للبيع مساحة 200 متر طابقين",
    subtitle: "بناء حديث طابو صرف",
    description: "منزل حديث للبيع في الشرقاط - الحي العصري، طابقين، يحتوي على 4 غرف نوم، هول واسع، مطبخ مجهز، كراج سيارة، حديقة صغيرة. سند طابو صرف.",
    price: "85,000,000 د.ع",
    whatsappNumber: "07700000002",
    buttonText: "اتصل الآن",
    tag: "عقارات",
    isActive: true,
    showInHome: true,
    createdAt: Date.now() - 20000,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80"
    ],
  },
  {
    id: "offer-mobile-1",
    title: "آيفون 15 برو ماكس 256 جيجا",
    subtitle: "تيتانيوم طبيعي - حالة الزيرو",
    description: "آيفون 15 Pro Max ذاكرة 256GB، اللون تيتانيوم طبيعي، نسبة البطارية 98%، كامل الملحقات مع الكرتونة والشاحن الأصلي، بدون أي خدش.",
    price: "$ 1,150",
    whatsappNumber: "07700000003",
    buttonText: "اتصل الآن",
    tag: "موبايلات",
    isActive: true,
    showInHome: true,
    createdAt: Date.now() - 30000,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80"
    ],
  },
  {
    id: "offer-car-2",
    title: "هيونداي النترا 2021 أبيض",
    subtitle: "محرك 1600 - بصمة وشاشة",
    description: "هيونداي النترا موديل 2021، لون أبيض، بصمة، شاشة أندرويد، كشافات، حساسات خلفية، تبريد ممتاز، السيارة جاهزة للتحويل.",
    price: "$ 14,200",
    whatsappNumber: "07700000004",
    buttonText: "اتصل الآن",
    tag: "سيارات",
    isActive: true,
    showInHome: false,
    createdAt: Date.now() - 40000,
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80"
    ],
  }
];

const AnimatedCardImages = ({
  images,
  fallbackImage,
  title,
  heightClass = "h-32 sm:h-36",
  roundedClass = "rounded-2xl",
  autoPlay = false
}: {
  images?: string[],
  fallbackImage?: string,
  title: string,
  heightClass?: string,
  roundedClass?: string,
  autoPlay?: boolean
}) => {
  const allImages = useMemo(() => {
    const validImages = (images || []).filter((img) => img && typeof img === "string" && img.trim() !== "");
    if (validImages.length > 0) {
      // To reduce data consumption, only render/load the first image when autoPlay is false
      return autoPlay ? validImages.slice(0, 3) : [validImages[0]];
    }
    if (fallbackImage && typeof fallbackImage === "string" && fallbackImage.trim() !== "") {
      return [fallbackImage];
    }
    return [];
  }, [images, fallbackImage, autoPlay]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || allImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [allImages, autoPlay]);

  if (allImages.length === 0) {
    return (
      <div className={`w-full ${heightClass} bg-slate-100 dark:bg-slate-900 ${roundedClass} flex items-center justify-center text-slate-400`}>
        <Tag size={28} />
      </div>
    );
  }

  return (
    <div className={`w-full ${heightClass} bg-slate-900 ${roundedClass} relative overflow-hidden group`}>
      {allImages.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`${title} ${idx + 1}`}
          referrerPolicy="no-referrer"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
            idx === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
          }`}
        />
      ))}
      {autoPlay && allImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full">
          {allImages.map((_, idx) => (
            <span
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                idx === currentIndex ? "bg-white w-3" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const defaultTaxis: TaxiDriver[] = [
  {
    id: "taxi-0",
    name: "عبدالله الجبوري",
    carType: "كورولا حديث",
    phone: "07722427111",
    location: "الشرقاط",
    category: "خصوصي",
    notes: "تكسي خصوصي على خط كركوك - شرقاط بشكل يومي مع نقل بريد",
    createdAt: Date.now() - 86400000,
  },
  {
    id: "taxi-1",
    name: "الكابتن أبو محمد العبيدي",
    carType: "نيسان سنترا",
    phone: "07701234567",
    location: "داخل الشرقاط والقرى المجاورة",
    category: "خصوصي",
    notes: "تكسي جوال متوفر على مدار 24 ساعة داخل قضاء الشرقاط",
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: "taxi-2",
    name: "أبو سيف - سفريات المحافظات",
    carType: "هيونداي النترا",
    phone: "07809876543",
    location: "خط أربيل - بغداد - الموصل - كركوك",
    category: "خصوصي",
    notes: "سيارة حديثة ومكيفة لنقل المسافرين بين الشرقاط وبقية المحافظات",
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: "taxi-3",
    name: "الكابتن عمر الجبوري - ستاركس",
    carType: "كيا ستاركس 11 راكب",
    phone: "07712345678",
    location: "خط الشرقاط - الموصل وبالعكس",
    category: "ستاركس",
    notes: "رحلات يومية منتظمة بين الشرقاط ومدينة الموصل سيارة ستاركس مكيفة",
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: "taxi-4",
    name: "خدمة توصيل السريع - أبو فهد",
    carType: "تكسي ودراجة شحن دليفري",
    phone: "07811223344",
    location: "توصيل طلبات ومسواك وأغراض داخل الشرقاط",
    category: "دليفري",
    notes: "توصيل أطعمة، مسواك، أدوية وأغراض منزلية بأسعار مناسبة جداً",
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    id: "taxi-5",
    name: "نقل الحمولات والبضائع - أبو علي",
    carType: "كيا حمل 2 طن",
    phone: "07709988776",
    location: "داخل الشرقاط والمحافظات",
    category: "حمل",
    notes: "نقل أثاث، مواد بناء، وبضائع تجارية أينما تريد بأمان وسرعة",
    createdAt: Date.now() - 86400000 * 0.5,
  },
];

const onboardingSlides = [
  {
    title: "الدليل الشامل لأهالي قضاء الشرقاط",
    description: "تطبيق متكامل يوفر لأهالي قضاء الشرقاط الكرام كافة الخدمات، العناوين، الأرقام الهامة، والأنشطة المحلية بسهولة ويسر من مكانك.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
    badge: "دليل الشرقاط الأول",
    icon: "✨",
  },
  {
    title: "تسهيل البحث عن الأطباء والتاكسي",
    description: "اعثر على أطباء القضاء بمختلف الاختصاصات، واطلع على العيادات المفتوحة وأوقات عملها، أو تواصل مع كابتن تاكسي متوفر لتصل بأمان.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800",
    badge: "خدمات طبية ونقل فوري",
    icon: "🩺",
  },
  {
    title: "أفضل المحلات والعروض في السوق",
    description: "استكشف محلات ومطاعم ومكاتب الشرقاط وتابع أقوى العروض والمعروضات بسهولة.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800",
    badge: "السوق والعروض اليومية",
    icon: "🛍️",
  },
];

// Helper for store categories classification
const getStoreClassification = (store: any): "مطاعم" | "متاجر" | "مكاتب" => {
  const name = (store.name || "").toLowerCase();
  const desc = (store.description || "").toLowerCase();
  const cat = (store.category || "").toLowerCase();
  const text = `${name} ${desc} ${cat}`;

  if (cat === "مطاعم" || cat === "مطعم") return "مطاعم";
  if (cat === "متاجر" || cat === "متجر" || cat === "محل" || cat === "أسواق") return "متاجر";
  if (cat === "مكاتب" || cat === "مكتب") return "مكاتب";

  const foodKeywords = ["مطعم", "كافتريا", "مرطبات", "منزلي", "مأكولات", "مطاعم", "حلويات", "مطبخ", "مخبز", "أكل", "عصائر", "مشويات", "بيتزا", "كافيه", "شاورما", "فطائر", "وجبات"];
  if (store.isRestaurant || foodKeywords.some(kw => text.includes(kw))) {
    return "مطاعم";
  }

  const officeKeywords = ["مكتب", "مكاتب", "شركة", "حجز", "سفريات", "طيران", "شحن", "استشارات", "محاماة", "ترجمة", "خدمات عامة", "تخليص", "عقاري", "صرافة", "تحويل"];
  if (officeKeywords.some(kw => text.includes(kw))) {
    return "مكاتب";
  }

  return "متاجر";
};

const defaultAppBanners: BannerAd[] = [
  {
    id: "banner-1",
    title: "دليل أطباء قضاء الشرقاط",
    content: "احجز موعدك وتعرف على أوقات الدوام والعناوين الدقيقة لأبرز الأطباء والعيادات التخصصية والمراكز الطبية.",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&auto=format&fit=crop&q=80",
    type: "internal",
    buttonText: "تصفح الأطباء",
  },
  {
    id: "banner-2",
    title: "خدمة دليل الأطباء والعيادات التخصصية",
    content: "تحديثات يومية ومستمرة لأوقات دوام الأطباء والاستشاريين في كافة التخصصات الطبية.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80",
    type: "internal",
    buttonText: "استكشف التخصصات",
  },
  {
    id: "banner-3",
    title: "إعلانات وخدمات الرعاية الصحية المعتمدة",
    content: "متابعة مستمرة لجديد الأطباء الزائرين والخدمات الطبية المعتمدة في المنطقة.",
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&auto=format&fit=crop&q=80",
    type: "internal",
    buttonText: "عرض التفاصيل",
  },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (user && user.email !== "9botaj7@gmail.com") {
        await signOut(auth);
        alert("هذا التطبيق مخصص للإدارة فقط.");
        return;
      }

      setCurrentUser(user);
      if (user) {
        if (user.email === "9botaj7@gmail.com") {
          setIsAdmin(true);
        }
        try {
          // Fetch user profile for isAdmin flag
          const profile = await firebaseService.getDocument("users", user.uid);
          if (profile) {
            setUserProfile(profile);
            setIsAdmin(true);
          } else {
            // Auto-create profile if missing
            const newProfile = {
              uid: user.uid,
              email: user.email || "",
              isAdmin: true,
              displayName: user.displayName || "أدمن",
            };
            await firebaseService.saveDocument("users", user.uid, newProfile);
            setUserProfile(newProfile);
            setIsAdmin(true);
          }
        } catch (err) {
          console.warn("User profile sync notice:", err);
          if (user.email === "9botaj7@gmail.com") {
            setIsAdmin(true);
          }
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
    });
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setShowLoginModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const logout = () => {
    signOut(auth);
    setSidebarOpen(false);
    setTab("home");
  };

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [tab, setTab] = useState<"home" | "directory" | "doctors" | "services" | "restaurants" | "offers" | "events" | "settings" | "notifications">("home");
  const [eventsSubTab, setEventsSubTab] = useState<"events" | "offers">("events");
  const [homeEventsSubTab, setHomeEventsSubTab] = useState<"all" | "events" | "offers">("all");
  const [directorySubTab, setDirectorySubTab] = useState<"doctors" | "cars">("doctors");
  const [doctorCategoryFilter, setDoctorCategoryFilter] = useState("الكل");
  const [doctorRegionFilter, setDoctorRegionFilter] = useState("الكل");
  const [isCustomDoctorSearchOpen, setIsCustomDoctorSearchOpen] = useState(false);
  const [homeSubTab, setHomeSubTab] = useState<"doctors" | "cars" | "restaurants">("doctors");
  const [marketSearch, setMarketSearch] = useState("");
  const [marketCategoryFilter, setMarketCategoryFilter] = useState<string>("all");
  const [showAllStoresOverlay, setShowAllStoresOverlay] = useState(false);
  const [storeSearchText, setStoreSearchText] = useState("");
  const [selectedStoreCategoryTab, setSelectedStoreCategoryTab] = useState<string>("الكل");
  const [subTab, setSubTab] = useState<
    | "doctors"
    | "cars"
    | "service_offers"
    | "restaurants"
    | "complexes"
    | null
  >(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [eventCategoryFilter, setEventCategoryFilter] = useState("الكل");

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedGovAnnouncement, setSelectedGovAnnouncement] = useState<GovAnnouncement | null>(
    null,
  );
  const [selectedServiceOffer, setSelectedServiceOffer] = useState<ServiceOffer | null>(null);
  const [selectedTaxi, setSelectedTaxi] = useState<TaxiDriver | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<BannerAd | null>(null);
  const [search, setSearch] = useState("");
  const [restaurantSearch, setRestaurantSearch] = useState("");
  const [stationSearch, setStationSearch] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sortByClosest, setSortByClosest] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [taxiSearch, setTaxiSearch] = useState("");
  const [taxiCategoryFilter, setTaxiCategoryFilter] = useState("الكل");
  const [restaurantCategoryFilter, setRestaurantCategoryFilter] = useState("الكل");
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalFilterCategory, setGlobalFilterCategory] =
    useState<string>("all");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [homeSegment, setHomeSegment] = useState<"doctors" | "complexes">("doctors");
  const [bannerIdx, setBannerIdx] = useState(0);
  const [offerBannerIdx, setOfferBannerIdx] = useState(0);
  const [showAllOffersModal, setShowAllOffersModal] = useState(false);
  const [isHoveringOffers, setIsHoveringOffers] = useState(false);
  const offersScrollRef = useRef<HTMLDivElement>(null);

  // Data State
  const [taxis, setTaxis] = useState<TaxiDriver[]>(() => {
    try {
      const cached = localStorage.getItem("cached_taxis");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return defaultTaxis;
    } catch {
      return defaultTaxis;
    }
  });
  const [serviceOffers, setServiceOffers] = useState<ServiceOffer[]>(() => {
    try {
      const cached = localStorage.getItem("cached_serviceOffers");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return defaultServiceOffers;
    } catch {
      return defaultServiceOffers;
    }
  });
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cached_doctors") || "[]");
    } catch {
      return [];
    }
  });

  const [doctorSpecialtiesList, setDoctorSpecialtiesList] = useState<DoctorSpecialty[]>(() => {
    try {
      const cached = localStorage.getItem("cached_doctor_specialties");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return [
        { id: "s-1", name: "طب عام وطوارئ", order: 1 },
        { id: "s-2", name: "باطنية وقلبية", order: 2 },
        { id: "s-3", name: "جراحة عامة وناظورية", order: 3 },
        { id: "s-4", name: "طب وجراحة العظام والمفاصل", order: 4 },
        { id: "s-5", name: "نسائية وتوليد وعقم", order: 5 },
        { id: "s-6", name: "طب الأطفال وحديثي الولادة", order: 6 },
        { id: "s-7", name: "جلدية وتجميل وليزر", order: 7 },
        { id: "s-8", name: "أنف وأذن وحنجرة", order: 8 },
        { id: "s-9", name: "طب وجراحة العيون", order: 9 },
        { id: "s-10", name: "طب وجراحة الفم والأسنان", order: 10 },
        { id: "s-11", name: "جراحة المسالك البولية والتناسلية", order: 11 },
        { id: "s-12", name: "أمراض الكلى والغسيل الكلوي", order: 12 },
        { id: "s-13", name: "طب وجراحة الجملة العصبية", order: 13 },
        { id: "s-14", name: "أمراض الصدر والجهاز التنفسي", order: 14 },
        { id: "s-15", name: "أورام وسرطان", order: 15 },
        { id: "s-16", name: "علاج طبيعي وتأهيل", order: 16 },
        { id: "s-17", name: "مختبرات وتحليلات مرضية", order: 17 },
        { id: "s-18", name: "أشعة وسونار وتصوير طبقي", order: 18 },
        { id: "s-19", name: "تغذية علاجية ورشاقة", order: 19 },
        { id: "s-20", name: "طب الأسرة والرعاية الأولية", order: 20 },
      ];
    } catch {
      return [];
    }
  });

  const [doctorRegionsList, setDoctorRegionsList] = useState<DoctorRegion[]>(() => {
    try {
      const cached = safeStorage.getItem("cached_doctor_regions");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return [
        { id: "r-1", name: "الساحل الأيمن", order: 1 },
        { id: "r-2", name: "الساحل الأيسر", order: 2 },
        { id: "r-3", name: "المركز / السوق", order: 3 },
        { id: "r-4", name: "سديرة", order: 4 },
        { id: "r-5", name: "الزوية", order: 5 },
        { id: "r-6", name: "القرى المجاورة", order: 6 },
      ];
    } catch {
      return [
        { id: "r-1", name: "الساحل الأيمن", order: 1 },
        { id: "r-2", name: "الساحل الأيسر", order: 2 },
        { id: "r-3", name: "المركز / السوق", order: 3 },
        { id: "r-4", name: "سديرة", order: 4 },
        { id: "r-5", name: "الزوية", order: 5 },
        { id: "r-6", name: "القرى المجاورة", order: 6 },
      ];
    }
  });

  useEffect(() => {
    safeStorage.setItem("cached_doctor_regions", JSON.stringify(doctorRegionsList));
  }, [doctorRegionsList]);

  const [serviceCategoriesList, setServiceCategoriesList] = useState<ServiceCategory[]>(() => {
    try {
      const cached = localStorage.getItem("cached_service_categories");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return [
        { id: "sc-1", name: "سواق تكسي ونقل", order: 1 },
        { id: "sc-2", name: "صيانة ومولدات", order: 2 },
        { id: "sc-3", name: "حرفيين ومهن حرة", order: 3 },
        { id: "sc-4", name: "توصيل وشحن", order: 4 },
        { id: "sc-5", name: "خدمات عامة", order: 5 },
        { id: "sc-6", name: "محلات وتجارية", order: 6 },
      ];
    } catch {
      return [];
    }
  });

  const [govAnnouncements, setGovAnnouncements] = useState<GovAnnouncement[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cached_govAnnouncements") || "[]");
    } catch {
      return [];
    }
  });
  const [banners, setBanners] = useState<BannerAd[]>(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("cached_banners") || "[]");
      if (Array.isArray(cached) && cached.length > 0) return cached;
      return defaultAppBanners;
    } catch {
      return defaultAppBanners;
    }
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cached_notifications") || "[]");
    } catch {
      return [];
    }
  });
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("read_notification_ids") || "[]");
    } catch {
      return [];
    }
  });

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !readNotificationIds.includes(n.id)).length;
  }, [notifications, readNotificationIds]);

  const markAllNotificationsAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadNotificationIds(allIds);
    safeStorage.setItem("read_notification_ids", JSON.stringify(allIds));
  };
  const [reminders, setReminders] = useState<string[]>(() => {
    try {
      return JSON.parse(safeStorage.getItem("shirqat_reminders") || "[]");
    } catch {
      return [];
    }
  });

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      return JSON.parse(safeStorage.getItem("shirqat_favorite_ids") || "[]");
    } catch {
      return [];
    }
  });

  const toggleFavorite = async (id: string, type: 'doctor' | 'taxi' | 'store' | 'offer') => {
    const isFav = favoriteIds.includes(id);
    const nextFavs = isFav ? favoriteIds.filter((f) => f !== id) : [...favoriteIds, id];
    setFavoriteIds(nextFavs);
    safeStorage.setItem("shirqat_favorite_ids", JSON.stringify(nextFavs));

    const newShowInHome = !isFav;
    if (type === 'doctor') {
      setDoctors((prev) => prev.map((d) => d.id === id ? { ...d, showInHome: newShowInHome } : d));
      firebaseService.updateDocument('doctors', id, { showInHome: newShowInHome }).catch(() => {});
    } else if (type === 'taxi') {
      setTaxis((prev) => prev.map((t) => t.id === id ? { ...t, showInHome: newShowInHome } : t));
      firebaseService.updateDocument('taxis', id, { showInHome: newShowInHome }).catch(() => {});
    } else if (type === 'store') {
      setMarketStores((prev) => prev.map((s) => s.id === id ? { ...s, showInHome: newShowInHome } : s));
      firebaseService.updateDocument('marketStores', id, { showInHome: newShowInHome }).catch(() => {});
    } else if (type === 'offer') {
      setServiceOffers((prev) => prev.map((so) => so.id === id ? { ...so, showInHome: newShowInHome } : so));
      firebaseService.updateDocument('serviceOffers', id, { showInHome: newShowInHome }).catch(() => {});
    } else if (type === 'govAnnouncement' || (type as string) === 'event') {
      setGovAnnouncements((prev) => prev.map((g) => g.id === id ? { ...g, showInHome: newShowInHome } : g));
      firebaseService.updateDocument('govAnnouncements', id, { showInHome: newShowInHome }).catch(() => {});
    }
  };

  const [medicalComplexes, setMedicalComplexes] = useState<MarketStore[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cached_medicalComplexes") || "[]");
    } catch {
      return [];
    }
  });

  const [marketStores, setMarketStores] = useState<MarketStore[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cached_marketStores") || "[]");
    } catch {
      return [];
    }
  });

  const dirList = useMemo(() => {
    const doctorItems = doctors.map((d) => ({
      id: `doc_${d.id}`,
      type: 'doctor' as const,
      typeLabel: 'طبيب 🩺',
      name: d.name,
      subtitle: d.subtitle,
      image: d.image,
      showInHome: d.showInHome || favoriteIds.includes(d.id),
      original: d,
    }));

    const taxiItems = taxis.map((t) => ({
      id: `taxi_${t.id}`,
      type: 'taxi' as const,
      typeLabel: 'تكسي 🚕',
      name: t.name,
      subtitle: t.carType || t.category || 'سائق تكسي',
      image: (t as any).image,
      showInHome: t.showInHome || favoriteIds.includes(t.id),
      original: t,
    }));

    const complexItems = medicalComplexes.map((c) => ({
      id: `complex_${c.id}`,
      type: 'store' as const,
      typeLabel: 'مجمع طبي 🏥',
      name: c.name,
      subtitle: c.category || 'مجمع طبي',
      image: c.logoImage || c.coverImage,
      showInHome: (c as any).showInHome || (c as any).isFeatured || favoriteIds.includes(c.id),
      original: c,
    }));

    const storeItems = marketStores.map((s) => ({
      id: `store_${s.id}`,
      type: 'store' as const,
      typeLabel: (s as any).isRestaurant || s.category === 'مطاعم' || s.category === 'مطعم' ? 'مطعم 🍽️' : 'متجر 🏪',
      name: s.name,
      subtitle: s.category || 'متجر',
      image: s.logoImage || s.coverImage,
      showInHome: (s as any).showInHome || (s as any).isFeatured || favoriteIds.includes(s.id),
      original: s,
    }));

    const offerItems = serviceOffers.map((so) => ({
      id: `offer_${so.id}`,
      type: 'offer' as const,
      typeLabel: 'عرض 🏷️',
      name: so.title,
      subtitle: (so as any).category || 'عرض',
      image: so.image || (so.images && so.images[0]),
      showInHome: (so as any).showInHome || (so as any).isFeatured || favoriteIds.includes(so.id),
      original: so,
    }));

    const eventItems = govAnnouncements.map((g) => ({
      id: `event_${g.id}`,
      type: 'event' as const,
      typeLabel: 'حدث ⚡',
      name: g.title,
      subtitle: g.entity || 'حدث الشرقاط',
      image: g.image || (g.images && g.images[0]),
      showInHome: (g as any).showInHome || (g as any).isFeatured || favoriteIds.includes(g.id),
      original: g,
    }));

    const allItems = [...doctorItems, ...taxiItems, ...complexItems, ...storeItems, ...offerItems, ...eventItems];
    const featured = allItems.filter((item) => item.showInHome);
    return featured.length > 0 ? featured : allItems.slice(0, 20);
  }, [doctors, taxis, medicalComplexes, marketStores, serviceOffers, govAnnouncements, favoriteIds]);

  // Real-time Order Tracker State
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const clientId = useMemo(
    () => localStorage.getItem("shirqat_device_id") || "guest",
    [],
  );

  useEffect(() => {
    const unsub = firebaseService.subscribeToCollection<any>(
      "restaurant_orders",
      (data) => {
        const myOrders = data.filter((order) => order.clientId === clientId);
        myOrders.sort(
          (a, b) =>
            (b.createdAt?.toMillis
              ? b.createdAt.toMillis()
              : b.createdAt || 0) -
            (a.createdAt?.toMillis ? a.createdAt.toMillis() : a.createdAt || 0),
        );
        setActiveOrders(
          myOrders.filter(
            (o) => o.status !== "completed" && o.status !== "cancelled",
          ),
        );
      },
      "createdAt",
      "desc",
    );
    return () => unsub();
  }, [clientId]);

  // Automated Cache Syncing to LocalStorage to prevent stale cache or data loss
  useEffect(() => {
    safeStorage.setItem("cached_doctors", JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    safeStorage.setItem("cached_taxis", JSON.stringify(taxis));
  }, [taxis]);

  useEffect(() => {
    safeStorage.setItem("cached_govAnnouncements", JSON.stringify(govAnnouncements));
  }, [govAnnouncements]);

  useEffect(() => {
    safeStorage.setItem("cached_banners", JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    safeStorage.setItem("cached_medicalComplexes", JSON.stringify(medicalComplexes));
  }, [medicalComplexes]);

  useEffect(() => {
    safeStorage.setItem("cached_marketStores", JSON.stringify(marketStores));
  }, [marketStores]);

  useEffect(() => {
    safeStorage.setItem("cached_serviceOffers", JSON.stringify(serviceOffers));
  }, [serviceOffers]);

  useEffect(() => {
    safeStorage.setItem("cached_doctor_specialties", JSON.stringify(doctorSpecialtiesList));
  }, [doctorSpecialtiesList]);
  const [marketProducts, setMarketProducts] = useState<MarketProduct[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cached_marketProducts") || "[]");
    } catch {
      return [];
    }
  });
  const [marketViewMode, setMarketViewMode] = useState<
    "horizontal" | "vertical"
  >("horizontal");
  const [hospitalDoctors, setHospitalDoctors] = useState<HospitalDoctor[]>(
    () => {
      try {
        return JSON.parse(
          localStorage.getItem("cached_hospitalDoctors") || "[]",
        );
      } catch {
        return [];
      }
    },
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const activeDoctor = useMemo(() => {
    if (!selectedDoctor) return null;
    return doctors.find((d) => d.id === selectedDoctor.id) || selectedDoctor;
  }, [doctors, selectedDoctor]);


  const activeGovAnnouncement = useMemo(() => {
    if (!selectedGovAnnouncement) return null;
    return (
      govAnnouncements.find((c) => c.id === selectedGovAnnouncement.id) || selectedGovAnnouncement
    );
  }, [govAnnouncements, selectedGovAnnouncement]);

  const activeServiceOffer = useMemo(() => {
    if (!selectedServiceOffer) return null;
    return serviceOffers.find((so) => so.id === selectedServiceOffer.id) || selectedServiceOffer;
  }, [serviceOffers, selectedServiceOffer]);

  const filteredServiceOffers = useMemo(() => {
    return serviceOffers
      .filter((so) => {
        if (so.isActive === false) return false;
        const title = String(so.title || "").toLowerCase();
        const subtitle = String(so.subtitle || "").toLowerCase();
        const description = String(so.description || "").toLowerCase();
        const tag = String(so.tag || "").toLowerCase();
        const price = String(so.price || "").toLowerCase();
        const searchStr = search.toLowerCase();
        const matchesSearch =
          title.includes(searchStr) ||
          subtitle.includes(searchStr) ||
          description.includes(searchStr) ||
          tag.includes(searchStr) ||
          price.includes(searchStr);

        return matchesSearch;
      })
      .sort((a, b) => {
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
  }, [serviceOffers, search]);

  const serviceOfferTags: string[] = [];

  const filteredAnnouncements = useMemo(() => {
    return govAnnouncements
      .filter((ann) => {
        if (!ann.isActive) return false;
        const matchesCategory = eventCategoryFilter === "الكل" || ann.category === eventCategoryFilter;
        const q = marketSearch.trim().toLowerCase();
        const matchesSearch = !q ||
          String(ann.title || "").toLowerCase().includes(q) ||
          String(ann.description || "").toLowerCase().includes(q) ||
          String(ann.entity || "").toLowerCase().includes(q);
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [govAnnouncements, eventCategoryFilter, marketSearch]);

  const filteredStations = useMemo(() => {
    const list = govAnnouncements.length > 0 ? govAnnouncements : [
      {
        id: "station-1",
        title: "محطة تعبئة وقود الشرقاط الحكومية",
        entity: "الشرقاط - الساحل الأيمن / المركز",
        description: "توفير البنزين المحسن والعادي وزيت الكاز للمواطنين على مدار الساعة. تجهيز مجهز بأحدث العدادات الرقمية.",
        phoneNumber: "07701234567",
        phoneText: "اتصال بالمحطة",
        isActive: true,
        createdAt: Date.now() - 86400000 * 2,
        image: "https://images.unsplash.com/photo-1527018601619-a50d62b3b043?auto=format&fit=crop&q=80&w=800",
        category: "حكومية",
        lat: 35.5033,
        lng: 43.2389,
      },
      {
        id: "station-2",
        title: "محطة وقود القلعة الأهلية",
        entity: "الشرقاط - قرب مدخل القلعة",
        description: "محطة أهلية نموذجية تقدم خدمات تعبئة الوقود (بنزين ممتاز ومحسن وكاز)، بالإضافة إلى مركز غسيل وتبديل زيوت السيارات.",
        phoneNumber: "07809876543",
        phoneText: "اتصال بالمحطة",
        isActive: true,
        createdAt: Date.now() - 86400000 * 4,
        image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&q=80&w=800",
        category: "أهلية",
        lat: 35.4950,
        lng: 43.2450,
      },
      {
        id: "station-3",
        title: "محطة تعبئة وقود سديرة",
        entity: "الشرقاط - قرية سديرة السفلى",
        description: "خدمة تعبئة المنتجات النفطية (كاز ومحسن) لأهالي المنطقة والمزارعين وأصحاب السيارات.",
        phoneNumber: "07712345678",
        phoneText: "اتصال بالمحطة",
        isActive: true,
        createdAt: Date.now() - 86400000 * 6,
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800",
        category: "أهلية",
        lat: 35.5300,
        lng: 43.2000,
      },
    ];
    return list
      .filter((st) => {
        if (st.isActive === false) return false;
        const q = stationSearch.trim().toLowerCase();
        if (!q) return true;
        const title = String(st.title || "").toLowerCase();
        const entity = String(st.entity || "").toLowerCase();
        const desc = String(st.description || "").toLowerCase();
        const phone = String(st.phoneNumber || "").toLowerCase();
        return (
          title.includes(q) ||
          entity.includes(q) ||
          desc.includes(q) ||
          phone.includes(q)
        );
      })
      .sort((a, b) => {
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
  }, [govAnnouncements, stationSearch]);

  const [appSettings, setAppSettings] = useState<{
    hospitalDirector?: string;
    hospitalPhone?: string;
    hospitalImage?: string;
  }>({});

  // Market State
  const [showCart, setShowCart] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);

  // App Settings
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);

  // Automated Cache Syncing to LocalStorage to prevent stale cache or data loss
  const [sidebarPage, setSidebarPage] = useState<
    "about" | "privacy" | "contact" | "admin" | "terms" | null
  >(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadTracker, setLoadTracker] = useState<Record<string, boolean>>({
    doctors: false,
    govAnnouncements: false,
    banners: false,
    settings: false,
    marketStores: false,
    hospitalDoctors: false,
    serviceOffers: false,
  });

  // Arabic normalizer & search helpers
  const normalizeArabic = (str: string) => {
    if (!str) return "";
    return str
      .replace(/[أإآٱا]/g, "ا")
      .replace(/[ةه]/g, "ه")
      .replace(/[ىي]/g, "ي")
      .toLowerCase()
      .trim();
  };

  const searchableContacts = useMemo(() => {
    const list: {
      id: string;
      name: string;
      type: "doctor" | "govAnnouncement" | "taxi";
      subLabel: string;
      subtitle: string;
      phone1: string;
      phone2?: string;
      location: string;
      image?: string;
      originalItem: any;
    }[] = [];

    doctors.forEach((d) => {
      if (d.category === "lab" || d.category === "pharmacy") return;
      let tag = "طبيب 🩺";
      list.push({
        id: `doctor-${d.id}`,
        name: d.name,
        type: "doctor",
        subLabel: tag,
        subtitle: d.subtitle,
        phone1: d.phone1,
        phone2: d.phone2,
        location: d.location,
        image: d.image,
        originalItem: d,
      });
    });

    taxis.forEach((t) => {
      list.push({
        id: `taxi-${t.id}`,
        name: t.name,
        type: "taxi",
        subLabel: "تكسي 🚖",
        subtitle: t.carType || "",
        phone1: t.phone || "",
        phone2: "",
        location: t.location || "",
        originalItem: t,
      });
    });

    govAnnouncements.forEach((c) => {
      list.push({
        id: `govAnnouncement-${c.id}`,
        name: c.title,
        type: "govAnnouncement",
        subLabel: "سوق الشرقاط 🛍️",
        subtitle: c.entity,
        phone1: c.phoneNumber || "",
        phone2: "",
        location: "",
        image: c.image,
        originalItem: c,
      });
    });

    return list;
  }, [doctors, taxis, govAnnouncements]);

  const filteredContacts = useMemo(() => {
    let list = searchableContacts;

    if (globalFilterCategory !== "all") {
      list = list.filter((contact) => contact.type === globalFilterCategory);
    }

    if (globalSearch.trim()) {
      const normalizedQuery = normalizeArabic(globalSearch);
      list = list.filter((contact) => {
        const normName = normalizeArabic(contact.name);
        const normSubtitle = normalizeArabic(contact.subtitle);
        const normSubLabel = normalizeArabic(contact.subLabel);
        const normLocation = normalizeArabic(contact.location || "");

        return (
          normName.includes(normalizedQuery) ||
          normSubtitle.includes(normalizedQuery) ||
          normSubLabel.includes(normalizedQuery) ||
          normLocation.includes(normalizedQuery)
        );
      });
    }

    return list;
  }, [globalSearch, globalFilterCategory, searchableContacts]);

  // Check if initial load is complete
  useEffect(() => {
    const allLoaded = Object.values(loadTracker).every((v) => v === true);
    if (allLoaded) {
      // Small delay for smooth exit
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [loadTracker]);

  // Firebase Real-time listeners
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  };

  useEffect(() => {
    // 1) Show local cache immediately (instant loading feel without network reads)
    const loadFromCache = (key: string, setter: (data: any) => void) => {
      try {
        const cached = localStorage.getItem(key);
        if (cached) setter(JSON.parse(cached));
      } catch (e) { /* ignore */ }
    };
    loadFromCache('cached_doctors', setDoctors);
    loadFromCache('cached_banners', setBanners);
    loadFromCache('cached_notifications', setNotifications);
    loadFromCache('cached_doctorSpecialties', setDoctorSpecialtiesList);
    loadFromCache('cached_doctorRegions', setDoctorRegionsList);

    // Load settings from cache if needed
    try {
      const cachedSettings = localStorage.getItem('cached_settings');
      if (cachedSettings) setAppSettings(JSON.parse(cachedSettings));
    } catch(e) {}

    // 2) Cache window: Don't refetch from server unless 24 hours have passed or cache is empty
    const lastFetch = Number(localStorage.getItem('lastFullFetch') || 0);
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const hasCachedDoctors = Boolean(localStorage.getItem('cached_doctors'));

    if (hasCachedDoctors && (Date.now() - lastFetch < TWENTY_FOUR_HOURS)) {
      setLoadTracker({
        doctors: true, govAnnouncements: true, banners: true,
        marketStores: true, hospitalDoctors: true, settings: true, serviceOffers: true,
      });
      return; // Persistent local cache is valid (0 reads consumed)
    }

    // 3) Optimized fetch from server for Doctors App active collections
    const fetchAll = async () => {
      const [doctorsDocs, bannersDocs, settingsDocs, notificationsDocs, specsDocs, regionsDocs] = await Promise.all([
        firebaseService.fetchCollectionOnce<Doctor>('doctors', undefined, 'desc', 150),
        firebaseService.fetchCollectionOnce<BannerAd>('banners', undefined, 'desc', 50),
        firebaseService.fetchCollectionOnce<any>('settings', undefined, 'desc', 10),
        firebaseService.fetchCollectionOnce<Notification>('notifications', undefined, 'desc', 50),
        firebaseService.fetchCollectionOnce<DoctorSpecialty>('doctor_specialties', 'order', 'asc', 100),
        firebaseService.fetchCollectionOnce<DoctorRegion>('doctor_regions', 'order', 'asc', 100),
      ]);

      if (doctorsDocs && doctorsDocs.length > 0) {
        setDoctors(doctorsDocs);
        safeStorage.setItem('cached_doctors', JSON.stringify(doctorsDocs));
      }
      if (bannersDocs && bannersDocs.length > 0) {
        setBanners(bannersDocs);
        safeStorage.setItem('cached_banners', JSON.stringify(bannersDocs));
      }
      if (notificationsDocs) {
        setNotifications(notificationsDocs);
        safeStorage.setItem('cached_notifications', JSON.stringify(notificationsDocs));
      }
      if (specsDocs && specsDocs.length > 0) {
        setDoctorSpecialtiesList(specsDocs);
        safeStorage.setItem('cached_doctorSpecialties', JSON.stringify(specsDocs));
      }
      if (regionsDocs && regionsDocs.length > 0) {
        setDoctorRegionsList(regionsDocs);
        safeStorage.setItem('cached_doctorRegions', JSON.stringify(regionsDocs));
      }

      const config = settingsDocs.find((d) => d.id === "general");
      if (config) {
        const newSettings = {
          hospitalDirector: config.hospitalDirector,
          hospitalPhone: config.hospitalPhone,
          hospitalImage: config.hospitalImage,
        };
        setAppSettings(newSettings);
        safeStorage.setItem('cached_settings', JSON.stringify(newSettings));
      }

      safeStorage.setItem('lastFullFetch', String(Date.now()));

      setLoadTracker({
        doctors: true, govAnnouncements: true, banners: true,
        marketStores: true, hospitalDoctors: true, settings: true, serviceOffers: true,
      });
    };

    fetchAll();
  }, []);

  // Prayer Times Removed

  const [adminView, setAdminView] = useState<
    | "main"
    | "doctors"
    | "taxis"
    | "banners"
    | "settings"
    | "medical_complexes"
    | "market_stores"
    | "market_products"
    | "serviceOffers"
    | "offer_products"
    | "notifications"
  >("main");

  const [adminSelectedStore, setAdminSelectedStore] = useState<any>(null);
  const [adminMarketProducts, setAdminMarketProducts] = useState<any[]>([]);

  const [adminSelectedOffer, setAdminSelectedOffer] = useState<any>(null);
  const [adminOfferProducts, setAdminOfferProducts] = useState<any[]>([]);

  // Fetch Admin Market Products
  useEffect(() => {
    if (adminSelectedStore && isAdmin && adminView === "market_products") {
      const isComplex =
        adminSelectedStore._storeType === "complex" ||
        adminSelectedStore.isMedicalComplex === true ||
        adminSelectedStore.category === "مجمع طبي" ||
        adminSelectedStore.category === "مستشفى" ||
        adminSelectedStore.category === "عيادات";

      const targetPath = isComplex
        ? `medical_complexes/${adminSelectedStore.id}/complex_doctors`
        : `market_stores/${adminSelectedStore.id}/market_products`;

      firebaseService.fetchCollectionOnce<any>(targetPath)
        .then((items) => {
          if (items && items.length > 0) {
            setAdminMarketProducts(items);
          } else {
            // Check fallback path
            const fallbackPath = isComplex
              ? `market_stores/${adminSelectedStore.id}/market_products`
              : `medical_complexes/${adminSelectedStore.id}/complex_doctors`;
            return firebaseService.fetchCollectionOnce<any>(fallbackPath)
              .then((fallbackItems) => setAdminMarketProducts(fallbackItems || []));
          }
        })
        .catch((err) => {
          console.error(err);
          setAdminMarketProducts([]);
        });
    } else {
      setAdminMarketProducts([]);
    }
  }, [adminSelectedStore, isAdmin, adminView, medicalComplexes]);

  // Fetch Admin Offer Products
  useEffect(() => {
    if (adminSelectedOffer && isAdmin && adminView === "offer_products") {
      firebaseService.fetchCollectionOnce<any>(`serviceOffers/${adminSelectedOffer.id}/offer_products`)
        .then(setAdminOfferProducts)
        .catch(console.error);
    } else {
      setAdminOfferProducts([]);
    }
  }, [adminSelectedOffer, isAdmin, adminView]);

  const [activeOfferProductsList, setActiveOfferProductsList] = useState<any[]>([]);

  // Fetch Offer Products for public active offer modal
  useEffect(() => {
    if (activeServiceOffer?.id) {
      firebaseService.fetchCollectionOnce<any>(`serviceOffers/${activeServiceOffer.id}/offer_products`)
        .then((items) => setActiveOfferProductsList(items || []))
        .catch(() => setActiveOfferProductsList([]));
    } else {
      setActiveOfferProductsList([]);
    }
  }, [activeServiceOffer?.id]);

  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [adminSearch, setAdminSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    type: string;
  } | null>(null);

  // Sync Logic
  // Onboarding is dismissed manually via buttons now

  // Dynamic Banners Logic
  const allBanners = banners;

  useEffect(() => {
    if (allBanners.length <= 1) return;
    const interval = setInterval(() => {
      setBannerIdx((prev) => (prev + 1) % allBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [allBanners.length]);

  // Offer Banners Auto-Advance
  useEffect(() => {
    const activeOffersCount = (serviceOffers || []).filter(
      (o) => o.isActive !== false && o.title && o.title.trim() !== "",
    ).length;
    if (activeOffersCount <= 1) return;
    const interval = setInterval(() => {
      setOfferBannerIdx((prev) => (prev + 1) % activeOffersCount);
    }, 4500);
    return () => clearInterval(interval);
  }, [serviceOffers]);

  // Doctor Specialty Extractor: Show ONLY specialties that actually contain doctors
  const doctorSpecialties = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => {
      const spec = (d.subtitle || "").trim();
      if (spec) {
        set.add(spec);
      }
    });
    const activeSpecs = Array.from(set);
    activeSpecs.sort((a, b) => {
      const idxA = doctorSpecialtiesList.findIndex((s) => s.name?.trim() === a);
      const idxB = doctorSpecialtiesList.findIndex((s) => s.name?.trim() === b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b, "ar");
    });
    return ["الكل", ...activeSpecs];
  }, [doctors, doctorSpecialtiesList]);

  // Doctor Regions Extractor - combines managed regions and existing doctors
  const doctorRegions = useMemo(() => {
    const set = new Set<string>();
    doctorRegionsList.forEach((r) => {
      if (r.name && r.name.trim()) set.add(r.name.trim());
    });
    doctors.forEach((d) => {
      if (d.region && d.region.trim()) {
        set.add(d.region.trim());
      }
    });
    return ["الكل", ...Array.from(set)];
  }, [doctors, doctorRegionsList]);

  // Handlers
  const filteredDoctors = useMemo(() => {
    return doctors
      .filter((doc) => {
        // 1. Specialty Filter
        if (doctorCategoryFilter !== "الكل") {
          const matchSpecialty = (doc.subtitle || "").trim() === doctorCategoryFilter.trim();
          if (!matchSpecialty) return false;
        }

        // 2. Region Filter (Default "الكل" shows all regions - strictly matches doc.region added to doctor cards)
        if (doctorRegionFilter !== "الكل") {
          const normDocRegion = normalizeArabic(String(doc.region || ""));
          const normTargetRegion = normalizeArabic(doctorRegionFilter);
          const matchRegion =
            normDocRegion.includes(normTargetRegion) ||
            normTargetRegion.includes(normDocRegion);
          if (!matchRegion) return false;
        }

        // 3. Search query filter
        if (search.trim()) {
          const normSearch = normalizeArabic(search);
          const name = normalizeArabic(String(doc.name || ""));
          const subtitle = normalizeArabic(String(doc.subtitle || ""));
          const location = normalizeArabic(String(doc.location || ""));
          const region = normalizeArabic(String(doc.region || ""));
          const phone = String(doc.phone1 || "") + " " + String(doc.phone2 || "") + " " + String(doc.reservationPhone || "");
          return (
            name.includes(normSearch) ||
            subtitle.includes(normSearch) ||
            location.includes(normSearch) ||
            region.includes(normSearch) ||
            phone.includes(normSearch)
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (a.isVerified && !b.isVerified) return -1;
        if (!a.isVerified && b.isVerified) return 1;
        const nameA = String(a.name || "");
        const nameB = String(b.name || "");
        return nameA.localeCompare(nameB, "ar");
      });
  }, [doctors, search, doctorCategoryFilter, doctorRegionFilter]);


  const filteredGovAnnouncements = useMemo(() => {
    return govAnnouncements
      .filter((c) => {
        const name = String((c as any).title || "").toLowerCase();
        const subtitle = String((c as any).entity || "").toLowerCase();
        const location = String((c as any).entity || "").toLowerCase();
        const searchStr = search.toLowerCase();
        return (
          name.includes(searchStr) ||
          subtitle.includes(searchStr) ||
          location.includes(searchStr)
        );
      })
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [govAnnouncements, search]);

  // Loading Skeleton Component
  const SkeletonCard = () => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-700 animate-pulse flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded-full mb-2"></div>
          <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
        </div>
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl shrink-0"></div>
      </div>
    </div>
  );

  const activeServiceCategories = useMemo(() => {
    const listFromState = (serviceCategoriesList || []).map((c) => c.name.trim()).filter(Boolean);
    const listFromTaxis = (taxis || []).map((t) => (t.category || t.carType || "").trim()).filter(Boolean);
    const defaults = [
      "سواق تكسي ونقل",
      "صيانة ومولدات",
      "حرفيين ومهن حرة",
      "توصيل وشحن",
      "خدمات عامة",
      "محلات وتجارية",
    ];
    return Array.from(new Set([...listFromState, ...defaults, ...listFromTaxis]));
  }, [serviceCategoriesList, taxis]);

  const filteredTaxis = useMemo(() => {
    return taxis.filter((t) => {
      // 1. Category Filter
      if (taxiCategoryFilter && taxiCategoryFilter !== "الكل") {
        const cat = taxiCategoryFilter.trim().toLowerCase();
        const itemCat = (t.category || t.type || "").trim().toLowerCase();
        const itemText = (t.carType || "" + " " + ((t as any).subtitle || "") + " " + (t.notes || "")).toLowerCase();

        const matchCat = itemCat === cat;
        const matchText = itemText.includes(cat);
        if (!matchCat && !matchText) return false;
      }

      // 2. Search Filter
      if (!taxiSearch.trim()) return true;
      const q = normalizeArabic(taxiSearch);
      const name = normalizeArabic(String(t.name || ""));
      const carType = normalizeArabic(String(t.carType || ""));
      const location = normalizeArabic(String(t.location || ""));
      const phone = String(t.phone || "");
      const notes = normalizeArabic(String(t.notes || ""));
      const category = normalizeArabic(String(t.category || ""));

      return (
        name.includes(q) ||
        carType.includes(q) ||
        location.includes(q) ||
        phone.includes(q) ||
        notes.includes(q) ||
        category.includes(q)
      );
    });
  }, [taxis, taxiSearch, taxiCategoryFilter]);

  const resetViews = () => {
    setSubTab(null);
    setSelectedDoctor(null);
    setSelectedGovAnnouncement(null);
    setSelectedServiceOffer(null);
    setSelectedTaxi(null);
    setSearch("");
    setRestaurantSearch("");
    setTaxiSearch("");
    setCategoryFilter("all");
    setDoctorCategoryFilter("الكل");
    setDoctorRegionFilter("الكل");
    setIsCustomDoctorSearchOpen(false);
    setTaxiCategoryFilter("خصوصي");
    setRestaurantCategoryFilter("مطعم");
  };

  const changeTab = (newTab: any) => {
    setTab(newTab);
    setSidebarOpen(false);
    resetViews();
  };

  const formatWhatsApp = (phone: string) => {
    let digits = phone.replace(/\D/g, "");
    if (digits.startsWith("00")) {
      digits = digits.slice(2);
    }
    if (digits.startsWith("964")) return digits;
    if (digits.startsWith("0")) return "964" + digits.slice(1);
    return "964" + digits;
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string = "image",
  ) => {
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
          setFormData((prev) => ({ ...prev, [field]: compressedBase64 }));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const seedDatabase = async () => {
    const collections = {
      doctors: {
        path: "doctors",
        count: 10,
        schema: {
          name: "طبيب",
          category: "doctor",
          location: "الشرقاط",
          phone1: "07700000000",
        },
      },
      govAnnouncements: {
        path: "govAnnouncements",
        count: 10,
        schema: { name: "حرفي", location: "الشرقاط", phone1: "07700000000" },
      },
    };

    for (const [key, config] of Object.entries(collections)) {
      for (let i = 1; i <= config.count; i++) {
        await firebaseService.addDocument(config.path, {
          ...config.schema,
          name: `${config.schema.name} ${i}`,
          phone1: `0770000000${i}`,
          description: `وصف تجريبي لـ ${config.schema.name} ${i}`,
        });
      }
    }
    alert("تم إضافة 10 عناصر لكل قسم بنجاح!");
  };

  const deleteItem = async (id: string, type: string) => {
    if (confirmDelete?.id !== id) {
      setConfirmDelete({ id, type });
      setTimeout(() => setConfirmDelete(null), 3000);
      return;
    }

    const collectionMapping: Record<string, string> = {
      doctors: "doctors",
      banners: "banners",
      govAnnouncements: "govAnnouncements",
      medical_complexes: "medical_complexes",
      market_stores: "market_stores",
      serviceOffers: "serviceOffers",
      taxis: "taxis",
      notifications: "notifications",
    };

    let firestoreCol = collectionMapping[type];
    if (type === "market_products" && adminSelectedStore) {
      const isComplex =
        adminSelectedStore._storeType === "complex" ||
        adminSelectedStore.isMedicalComplex === true ||
        adminSelectedStore.category === "مجمع طبي" ||
        adminSelectedStore.category === "مستشفى" ||
        adminSelectedStore.category === "عيادات";
      firestoreCol = isComplex
        ? `medical_complexes/${adminSelectedStore.id}/complex_doctors`
        : `market_stores/${adminSelectedStore.id}/market_products`;
    } else if (type === "offer_products" && adminSelectedOffer) {
      firestoreCol = `serviceOffers/${adminSelectedOffer.id}/offer_products`;
    }

    // Update local state and local cache immediately
    if (type === "taxis") {
      setTaxis((prev) => {
        const next = prev.filter((item) => item.id !== id);
        safeStorage.setItem("cached_taxis", JSON.stringify(next));
        return next;
      });
    } else if (type === "doctors") {
      setDoctors((prev) => {
        const next = prev.filter((item) => item.id !== id);
        safeStorage.setItem("cached_doctors", JSON.stringify(next));
        return next;
      });
    } else if (type === "banners") {
      setBanners((prev) => {
        const next = prev.filter((item) => item.id !== id);
        safeStorage.setItem("cached_banners", JSON.stringify(next));
        return next;
      });
    } else if (type === "govAnnouncements") {
      setGovAnnouncements((prev) => {
        const next = prev.filter((item) => item.id !== id);
        safeStorage.setItem("cached_govAnnouncements", JSON.stringify(next));
        return next;
      });
    } else if (type === "medical_complexes") {
      setMedicalComplexes((prev) => {
        const next = prev.filter((item) => item.id !== id);
        safeStorage.setItem("cached_medicalComplexes", JSON.stringify(next));
        return next;
      });
    } else if (type === "market_stores") {
      setMarketStores((prev) => {
        const next = prev.filter((item) => item.id !== id);
        safeStorage.setItem("cached_marketStores", JSON.stringify(next));
        return next;
      });
    } else if (type === "serviceOffers") {
      setServiceOffers((prev) => {
        const next = prev.filter((item) => item.id !== id);
        safeStorage.setItem("cached_serviceOffers", JSON.stringify(next));
        return next;
      });
    } else if (type === "market_products") {
      setAdminMarketProducts((prev) => prev.filter((item) => item.id !== id));
      setMarketProducts((prev) => {
        const next = prev.filter((item) => item.id !== id);
        safeStorage.setItem("cached_marketProducts", JSON.stringify(next));
        return next;
      });
    } else if (type === "offer_products") {
      setAdminOfferProducts((prev) => prev.filter((item) => item.id !== id));
    } else if (type === "notifications") {
      setNotifications((prev) => {
        const next = prev.filter((item) => item.id !== id);
        safeStorage.setItem("cached_notifications", JSON.stringify(next));
        return next;
      });
    }

    if (firestoreCol) {
      try {
        await firebaseService.deleteDocument(firestoreCol, id);
        if (
          type === "market_products" &&
          adminSelectedStore &&
          adminSelectedStore.id !== "general"
        ) {
          const isComplex =
            medicalComplexes.some((c) => c.id === adminSelectedStore.id) ||
            adminSelectedStore.isMedicalComplex ||
            adminSelectedStore.category === "مجمع طبي" ||
            adminSelectedStore.category === "مستشفى";
          const parentCol = isComplex ? "medical_complexes" : "market_stores";
          await firebaseService.incrementDocumentField(
            parentCol,
            adminSelectedStore.id,
            "productCount",
            -1,
          ).catch((e) => console.warn("Failed to decrement count:", e));
        }
      } catch (err) {
        console.error("Firestore deletion error:", err);
      }
    }

    setConfirmDelete(null);
  };

  const saveItem = async () => {
    const isMarketProduct = adminView === "market_products" || adminView === "offer_products";
    if (adminView === "notifications") {
      if (!formData.message || !formData.message.trim()) {
        alert("يرجى كتابة نص رسالة الإشعار");
        return;
      }
    } else if (isMarketProduct && !formData.name && !formData.title) {
      alert("يرجى ملء اسم المنتج");
      return;
    }
    if (!isMarketProduct && adminView !== "notifications" && !formData.name && !formData.title) {
      alert("يرجى ملأ اسم العنصر أو العنوان");
      return;
    }

    const isEdit = !!editingItem;
    const collectionMapping: Record<string, string> = {
      doctors: "doctors",
      govAnnouncements: "govAnnouncements",
      banners: "banners",
      medical_complexes: "medical_complexes",
      market_stores: "market_stores",
      serviceOffers: "serviceOffers",
      taxis: "taxis",
      notifications: "notifications",
    };

    let firestoreCol = collectionMapping[adminView];
    if (adminView === "market_products" && adminSelectedStore) {
      const isComplex =
        adminSelectedStore._storeType === "complex" ||
        adminSelectedStore.isMedicalComplex === true ||
        adminSelectedStore.category === "مجمع طبي" ||
        adminSelectedStore.category === "مستشفى" ||
        adminSelectedStore.category === "عيادات";
      firestoreCol = isComplex
        ? `medical_complexes/${adminSelectedStore.id}/complex_doctors`
        : `market_stores/${adminSelectedStore.id}/market_products`;
    } else if (adminView === "offer_products" && adminSelectedOffer) {
      firestoreCol = `serviceOffers/${adminSelectedOffer.id}/offer_products`;
    }

    if (firestoreCol) {
      const dataToSave = { ...formData };

      // Remove UI-only scratch fields if any
      delete dataToSave.menuItemName;
      delete dataToSave.menuItemPrice;
      delete dataToSave.menuItemCategory;
      delete dataToSave.menuItemImage;

      if (adminView === "medical_complexes" || adminView === "market_stores") {
        if (dataToSave.image) {
          dataToSave.logoImage = dataToSave.image;
          delete dataToSave.image;
        }
        if (dataToSave.menuCategories && typeof dataToSave.menuCategories === "string") {
          dataToSave.menuCategories = dataToSave.menuCategories
            .split(/[,،]/)
            .map((cat: string) => cat.trim())
            .filter(Boolean);
        }
        if (!isEdit) {
          dataToSave.productCount = 0;
          dataToSave.createdAt = Date.now();
        }
        dataToSave.updatedAt = Date.now();
        dataToSave.isActive = dataToSave.isActive ?? true;
        dataToSave.isFeatured = dataToSave.isFeatured ?? false;
        if (adminView === "medical_complexes") {
          dataToSave.isMedicalComplex = true;
        }
      } else if (adminView === "market_products") {
        if (dataToSave.image) {
          dataToSave.images = [
            dataToSave.image,
            ...(isEdit
              ? (editingItem.images || []).filter(
                  (img: string) => img !== dataToSave.image,
                )
              : []),
          ];
          delete dataToSave.image;
        } else if (isEdit && editingItem.images) {
          dataToSave.images = editingItem.images;
        }
        if (dataToSave.price !== undefined && dataToSave.price !== null && String(dataToSave.price).trim() !== "") {
          dataToSave.price = String(dataToSave.price).trim();
        } else {
          dataToSave.price = "0";
        }
        dataToSave.productType = "menu";
        dataToSave.menuCategory = dataToSave.menuCategory || dataToSave.category || "عام";
        dataToSave.category = dataToSave.category || dataToSave.menuCategory;
        dataToSave.isAvailable = dataToSave.isAvailable ?? true;
        dataToSave.isFeatured = dataToSave.isFeatured ?? false;
        if (!isEdit) {
          dataToSave.createdAt = Date.now();
          dataToSave.storeId = adminSelectedStore?.id;
        }
        dataToSave.updatedAt = Date.now();
      } else if (adminView === "offer_products") {
        if (dataToSave.image) {
          dataToSave.images = [
            dataToSave.image,
            ...(isEdit
              ? (editingItem.images || []).filter(
                  (img: string) => img !== dataToSave.image,
                )
              : []),
          ];
          delete dataToSave.image;
        } else if (isEdit && editingItem.images) {
          dataToSave.images = editingItem.images;
        }
        if (dataToSave.price !== undefined && dataToSave.price !== null && String(dataToSave.price).trim() !== "") {
          dataToSave.price = String(dataToSave.price).trim();
        } else {
          dataToSave.price = "0";
        }
        dataToSave.productType = "offer_item";
        dataToSave.menuCategory = dataToSave.menuCategory || dataToSave.category || "عام";
        dataToSave.category = dataToSave.category || dataToSave.menuCategory;
        dataToSave.isAvailable = dataToSave.isAvailable ?? true;
        if (!isEdit) {
          dataToSave.createdAt = Date.now();
          dataToSave.offerId = adminSelectedOffer?.id;
        }
        dataToSave.updatedAt = Date.now();
      } else if (adminView === "serviceOffers") {
        if (!isEdit) dataToSave.createdAt = Date.now();
        dataToSave.isActive = dataToSave.isActive ?? true;
        if (dataToSave.images && dataToSave.images.length > 0) {
          dataToSave.image = dataToSave.images[0];
        }
      } else if (adminView === "taxis") {
        if (!isEdit) dataToSave.createdAt = Date.now();
        dataToSave.carType = dataToSave.carType || dataToSave.subtitle || "";
        dataToSave.phone = dataToSave.phone || dataToSave.phone1 || "";
        dataToSave.notes = dataToSave.notes || dataToSave.description || "";
      } else if (adminView === "notifications") {
        if (!isEdit) dataToSave.timestamp = Date.now();
        dataToSave.isRead = dataToSave.isRead ?? false;
        dataToSave.title = dataToSave.title || "تنبيه من تطبيق الشرقاط 🔔";
        dataToSave.name = dataToSave.name || dataToSave.title;
        dataToSave.message = dataToSave.message || "";
      }

      // Remove undefined values to prevent Firestore errors
      Object.keys(dataToSave).forEach((key) => {
        if (dataToSave[key] === undefined) {
          delete dataToSave[key];
        }
      });

      try {
        let savedId = editingItem?.id;
        if (isEdit) {
          await firebaseService.updateDocument(
            firestoreCol,
            editingItem.id,
            dataToSave,
          );
        } else {
          const docRef = await firebaseService.addDocument(
            firestoreCol,
            dataToSave,
          );
          savedId = docRef;
          if (
            adminView === "market_products" &&
            adminSelectedStore &&
            adminSelectedStore.id !== "general"
          ) {
            const isComplex =
              medicalComplexes.some((c) => c.id === adminSelectedStore.id) ||
              adminSelectedStore.isMedicalComplex ||
              adminSelectedStore.category === "مجمع طبي" ||
              adminSelectedStore.category === "مستشفى";
            const parentCol = isComplex ? "medical_complexes" : "market_stores";
            await firebaseService.incrementDocumentField(
              parentCol,
              adminSelectedStore.id,
              "productCount",
              1,
            ).catch((e) => console.warn("Failed to increment count:", e));
          }
        }

        const fullSavedItem = { ...dataToSave, id: savedId };

        if (adminView === "taxis") {
          setTaxis((prev) => {
            const exists = prev.some((i) => i.id === savedId);
            const next = exists
              ? prev.map((i) => (i.id === savedId ? (fullSavedItem as TaxiDriver) : i))
              : [fullSavedItem as TaxiDriver, ...prev];
            safeStorage.setItem("cached_taxis", JSON.stringify(next));
            return next;
          });
        } else if (adminView === "doctors") {
          setDoctors((prev) => {
            const exists = prev.some((i) => i.id === savedId);
            const next = exists
              ? prev.map((i) => (i.id === savedId ? fullSavedItem : i))
              : [fullSavedItem, ...prev];
            safeStorage.setItem("cached_doctors", JSON.stringify(next));
            return next;
          });
        } else if (adminView === "banners") {
          setBanners((prev) => {
            const exists = prev.some((i) => i.id === savedId);
            const next = exists
              ? prev.map((i) => (i.id === savedId ? fullSavedItem : i))
              : [fullSavedItem, ...prev];
            safeStorage.setItem("cached_banners", JSON.stringify(next));
            return next;
          });
        } else if (adminView === "medical_complexes") {
          setMedicalComplexes((prev) => {
            const exists = prev.some((i) => i.id === savedId);
            const next = exists
              ? prev.map((i) => (i.id === savedId ? fullSavedItem : i))
              : [fullSavedItem, ...prev];
            safeStorage.setItem("cached_medicalComplexes", JSON.stringify(next));
            return next;
          });
        } else if (adminView === "market_stores") {
          setMarketStores((prev) => {
            const exists = prev.some((i) => i.id === savedId);
            const next = exists
              ? prev.map((i) => (i.id === savedId ? fullSavedItem : i))
              : [fullSavedItem, ...prev];
            safeStorage.setItem("cached_marketStores", JSON.stringify(next));
            return next;
          });
        } else if (adminView === "serviceOffers") {
          setServiceOffers((prev) => {
            const exists = prev.some((i) => i.id === savedId);
            const next = exists
              ? prev.map((i) => (i.id === savedId ? fullSavedItem : i))
              : [fullSavedItem, ...prev];
            safeStorage.setItem("cached_serviceOffers", JSON.stringify(next));
            return next;
          });
        } else if (adminView === "market_products") {
          setAdminMarketProducts((prev) => {
            const exists = prev.some((i) => i.id === savedId);
            return exists
              ? prev.map((i) => (i.id === savedId ? fullSavedItem : i))
              : [fullSavedItem, ...prev];
          });
          setMarketProducts((prev) => {
            const exists = prev.some((i) => i.id === savedId);
            const next = exists
              ? prev.map((i) => (i.id === savedId ? fullSavedItem : i))
              : [fullSavedItem, ...prev];
            safeStorage.setItem("cached_marketProducts", JSON.stringify(next));
            return next;
          });
        } else if (adminView === "offer_products") {
          setAdminOfferProducts((prev) => {
            const exists = prev.some((i) => i.id === savedId);
            return exists
              ? prev.map((i) => (i.id === savedId ? fullSavedItem : i))
              : [fullSavedItem, ...prev];
          });
        } else if (adminView === "notifications") {
          setNotifications((prev) => {
            const exists = prev.some((i) => i.id === savedId);
            const next = exists
              ? prev.map((i) => (i.id === savedId ? (fullSavedItem as Notification) : i))
              : [fullSavedItem as Notification, ...prev];
            safeStorage.setItem("cached_notifications", JSON.stringify(next));
            return next;
          });
        }

        alert("✅ تم حفظ البيانات بنجاح");

        setIsAdding(false);
        setEditingItem(null);
        setFormData({});
      } catch (error: any) {
        console.error("Error saving item:", error);
        alert("❌ فشل حفظ البيانات: " + (error?.message || String(error)));
      }
    }
  };

  const saveSettings = async (newSettings: any) => {
    try {
      await firebaseService.saveDocument("settings", "general", newSettings);
    } catch (err) {
      console.error(err);
      alert("فشل حفظ الإعدادات");
    }
  };

  const startAdd = () => {
    setEditingItem(null);
    const defaults: any = {};
    if (adminView === "doctors") defaults.category = "doctor";
    if (adminView === "banners") {
      defaults.type = "internal";
      defaults.targetType = "doctor";
    }
    if (adminView === "medical_complexes") {
      defaults.isMedicalComplex = true;
      defaults.showInHome = true;
    }
    if (adminView === "market_stores") {
      defaults.category = "مطاعم";
      defaults.showInHome = true;
    }
    if (adminView === "serviceOffers") {
      defaults.isActive = true;
    }
    if (adminView === "market_products") {
      const isComplex =
        adminSelectedStore?._storeType === "complex" ||
        adminSelectedStore?.isMedicalComplex === true ||
        adminSelectedStore?.category === "مجمع طبي" ||
        adminSelectedStore?.category === "مستشفى" ||
        adminSelectedStore?.category === "عيادات";
      if (isComplex) {
        defaults.specialty = "";
      } else {
        defaults.menuCategory = "وجبات رئيسية";
        defaults.isAvailable = true;
      }
    }

    setFormData(defaults);
    setIsAdding(true);
  };

  const startEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      ...item,
      image: item.logoImage || (item.images && item.images[0]) || item.image,
      images: item.images || (item.image ? [item.image] : []),
    });
    setIsAdding(true);
  };

  // Removed handleLogin and related state as requested

  const exportBackup = () => {
    const data = {
      doctors,
      banners,
      govAnnouncements,
      marketStores,
      timestamp: Date.now(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `shirqat_backup.json`;
    link.click();
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>): void => {
    console.log("importBackup called");
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }
    console.log("File:", file.name);

    if (
      !window.confirm(
        "⚠️ تحذير\n\nاستيراد نسخة احتياطية سيقوم بتحديث البيانات في قاعدة البيانات.\n\nهل أنت متأكد من المتابعة؟",
      )
    ) {
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onerror = (err) => {
      console.error("FileReader error:", err);
      alert("❌ فشل قراءة الملف. تأكد أن الملف صحيح.");
      e.target.value = "";
    };

    reader.onload = async (ev) => {
      console.log("FileReader onload");
      let data: any;

      // Step 1: Parse JSON
      try {
        const text = ev.target?.result as string;
        if (!text || text.trim() === "") {
          alert("❌ الملف فارغ.");
          e.target.value = "";
          return;
        }
        data = JSON.parse(text);
      } catch (err) {
        console.error("JSON parse error:", err);
        alert(
          "❌ الملف ليس بصيغة JSON صحيحة. تأكد أنك تستخدم ملف النسخة الاحتياطية الصحيح.",
        );
        e.target.value = "";
        return;
      }

      // Step 2: Validate structure
      const validKeys = [
        "doctors",
        "banners",
        "govAnnouncements",
        "marketStores",
      ];
      const foundKeys = validKeys.filter((k) =>
        Array.isArray((data as any)[k]),
      );
      if (foundKeys.length === 0) {
        console.warn("Valid keys not found in data");
        alert(
          "❌ الملف لا يحتوي على بيانات معروفة. تأكد أنه ملف نسخة احتياطية من هذا التطبيق.",
        );
        e.target.value = "";
        return;
      }

      // Step 3: Import
      const importMapping: Record<string, string> = {
        doctors: "doctors",
          banners: "banners",
        govAnnouncements: "govAnnouncements",
        marketStores: "market_stores",
      };

      try {
        let batchUpdates: {
          collectionPath: string;
          id?: string;
          data: any;
          type: "set" | "add";
        }[] = [];
        let itemsProcessed = 0;

        for (const [key, col] of Object.entries(importMapping)) {
          const items = (data as any)[key];
          if (!Array.isArray(items) || items.length === 0) continue;

          for (const item of items) {
            const { id, ...itemData } = item;
            batchUpdates.push({
              collectionPath: col,
              id: id || undefined,
              data: itemData,
              type: id ? "set" : "add",
            });
            itemsProcessed++;

            if (batchUpdates.length === 400) {
              await firebaseService.batchWriteDocuments(batchUpdates);
              batchUpdates = [];
            }
          }
        }

        if (batchUpdates.length > 0) {
          await firebaseService.batchWriteDocuments(batchUpdates);
        }

        alert(
          `✅ تم الاستيراد بنجاح\n\nتم معالجة ${itemsProcessed} عنصراً من الأقسام: ${foundKeys.join(", ")}\n\nسيتم إعادة تحميل الصفحة.`,
        );
        window.location.reload();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Import error:", err);
        let friendlyMsg = "❌ فشل الاستيراد.";
        if (msg.includes("permission-denied")) {
          friendlyMsg =
            "❌ فشل الاستيراد: ليس لديك صلاحية الكتابة في قاعدة البيانات.\nتأكد أنك مسجل دخول كأدمن.";
        } else if (msg.includes("network")) {
          friendlyMsg = "❌ فشل الاستيراد: مشكلة في الاتصال بالإنترنت.";
        } else {
          friendlyMsg = `❌ فشل الاستيراد:\n${msg.substring(0, 200)}`;
        }
        alert(friendlyMsg);
      } finally {
        e.target.value = "";
      }
    };

    reader.readAsText(file);
  };

  const renderServiceOffersContent = (isEmbedded = false) => {
    return (
      <div className={`space-y-3 font-sans ${isEmbedded ? "pt-1 pb-4 px-0" : "pt-2 pb-20 px-3 animate-in fade-in duration-500"}`} dir="rtl">

        {/* Service Offers List - 2 Column Grid showing Image, Title, & View Details Button */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-2.5 animate-pulse space-y-2">
                <div className="w-full h-24 bg-slate-100 dark:bg-slate-700 rounded-xl" />
                <div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded-full w-3/4" />
                <div className="h-7 bg-slate-100 dark:bg-slate-700 rounded-xl w-full mt-2" />
              </div>
            ))}
          </div>
        ) : filteredServiceOffers.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400 font-bold border border-slate-100 dark:border-slate-800">
            لا توجد خدمات مطابقة حالياً
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredServiceOffers.map((so, i) => (
              <motion.div
                key={so.id}
                onClick={() => setSelectedServiceOffer(so)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-2.5 flex flex-col justify-between cursor-pointer group shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                <div>
                  {/* Image */}
                  <div className="w-full h-28 bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-2">
                    {so.image ? (
                      <img
                        src={so.image}
                        alt={so.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Briefcase size={22} className="text-slate-400 dark:text-slate-500" />
                    )}
                  </div>
                  {/* Title */}
                  <h4 className="font-display font-black text-xs sm:text-sm text-slate-800 dark:text-white line-clamp-2 text-right mb-2.5 min-h-[32px]">
                    {so.title}
                  </h4>
                </div>

                {/* View Details Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedServiceOffer(so);
                  }}
                  className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-600 dark:bg-emerald-950/40 dark:hover:bg-emerald-600 text-emerald-600 hover:text-white dark:text-emerald-400 dark:hover:text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1 group-hover:bg-emerald-600 group-hover:text-white"
                >
                  <span>عرض التفاصيل</span>
                  <ChevronLeft size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // UI Render Parts
  const renderHome = () => {
    const currentBanner = allBanners[bannerIdx % (allBanners.length || 1)];

    return (
      <div className="space-y-4 pt-3 pb-6 animate-in fade-in duration-500">
        {/* Sticky Header */}
        <div
          className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-shirqat-primary/10 shadow-xs relative overflow-hidden"
          dir="rtl"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-l from-shirqat-primary/80 via-shirqat-primary to-shirqat-primary/30" />

          {/* Right Side (على اليمين): Sidebar Menu / Settings (Show ONLY on main home) */}
          <div className="flex items-center gap-2 z-10">
            {subTab === null ? (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-white transition-all cursor-pointer active:scale-95 border border-slate-200/60 dark:border-slate-700 shadow-2xs"
                title="القائمة الجانبية والإعدادات"
              >
                <Menu size={20} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSubTab(null)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-white transition-all cursor-pointer active:scale-95 shrink-0"
                title="رجوع"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>

          {/* Center: App Branding */}
          <button
            onClick={() => {
              setTab("home");
              setSubTab(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 justify-center cursor-pointer active:scale-95 transition-transform z-10"
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm shadow-shirqat-primary/10 shrink-0">
              <img
                src="/logo_shirqat.svg"
                alt="دليل الشرقاط"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-display font-black text-sm sm:text-base text-slate-800 dark:text-white whitespace-nowrap">
              دليل <span className="text-shirqat-primary font-black">الشرقاط</span>
            </span>
          </button>

          {/* Left Side (على اليسار): Notifications Button (Show ONLY on main home) */}
          <div className="flex items-center justify-end z-10">
            <button
              onClick={() => {
                setTab("notifications");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="relative w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-white transition-all cursor-pointer active:scale-95 border border-slate-200/60 dark:border-slate-700"
              title="الإشعارات والتنبيهات"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center px-1 shadow-sm animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {subTab === null ? (
          <>
            {/* Animated Moving Ad Banner Carousel */}
            {allBanners && allBanners.length > 0 && (
              <div className="px-3" dir="rtl">
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 bg-slate-900 select-none">
                  {/* Banner Content Container */}
                  <div
                    className="relative w-full h-44 sm:h-52 cursor-pointer overflow-hidden group"
                    onClick={() => {
                      const b = currentBanner;
                      if (!b) return;
                      if (b.type === "external" && b.url) {
                        window.open(b.url, "_blank");
                      } else if (b.type === "internal" && b.targetType === "doctor" && b.targetId) {
                        const foundDoc = doctors.find((d) => d.id === b.targetId);
                        if (foundDoc) {
                          setSelectedDoctor(foundDoc);
                        } else {
                          setSelectedBanner(b);
                        }
                      } else {
                        setSelectedBanner(b);
                      }
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentBanner?.id || bannerIdx}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                        className="absolute inset-0"
                      >
                        {currentBanner?.image ? (
                          <img
                            src={currentBanner.image}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900" />
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Navigation Arrows for Banners */}
                    {allBanners.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBannerIdx((prev) => (prev - 1 + allBanners.length) % allBanners.length);
                          }}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 z-20 cursor-pointer shadow-md"
                          title="السابق"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBannerIdx((prev) => (prev + 1) % allBanners.length);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 z-20 cursor-pointer shadow-md"
                          title="التالي"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Banner Indicator Dots */}
                  {allBanners.length > 1 && (
                    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                      {allBanners.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBannerIdx(i);
                          }}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            i === bannerIdx % allBanners.length
                              ? "w-6 bg-white shadow-xs"
                              : "w-1.5 bg-white/40 hover:bg-white/70"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Direct Doctors Section */}
            <div className="px-3 space-y-2.5" dir="rtl">
              {/* Search Bar with "بحث مخصص" Button */}
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="ابحث عن طبيبك..."
                    focusRingClass="focus:ring-emerald-500/20"
                    className="mb-0"
                  />
                </div>

                {/* Specialty Filter Button (زر التخصص) */}
                <button
                  type="button"
                  onClick={() => setIsCustomDoctorSearchOpen(true)}
                  className={`h-12 px-3.5 sm:px-4 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 border shadow-xs cursor-pointer active:scale-95 shrink-0 ${
                    doctorCategoryFilter !== "الكل"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-emerald-500/20 shadow-md"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-700"
                  }`}
                  title="عرض واختيار التخصص الطبي"
                >
                  <Stethoscope size={15} className={doctorCategoryFilter !== "الكل" ? "text-white" : "text-emerald-600 dark:text-emerald-400"} />
                  <span className="whitespace-nowrap">التخصص</span>
                  {doctorCategoryFilter !== "الكل" && (
                    <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
                  )}
                </button>
              </div>

              {/* Active Filter Badges */}
              {doctorCategoryFilter !== "الكل" && (
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs">
                  <span className="text-[10px] font-bold text-slate-400">التخصص المحدد:</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-black">
                    <span>🩺 {doctorCategoryFilter}</span>
                    <button
                      type="button"
                      onClick={() => setDoctorCategoryFilter("الكل")}
                      className="hover:text-rose-500 cursor-pointer"
                      title="إلغاء تصفية التخصص"
                    >
                      <X size={12} />
                    </button>
                  </span>
                  <button
                    type="button"
                    onClick={() => setDoctorCategoryFilter("الكل")}
                    className="text-[10px] font-black text-rose-500 hover:underline mr-auto cursor-pointer"
                  >
                    عرض جميع التخصصات
                  </button>
                </div>
              )}

              {/* Doctors List */}
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : filteredDoctors.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400 font-bold border border-slate-100 dark:border-slate-800">
                  لا يوجد أطباء مطابقين للبحث أو التخصص المحدد
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800/90 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden">
                  {filteredDoctors.map((d, i) => (
                    <DoctorCard
                      key={d.id}
                      doctor={d}
                      onClick={() => setSelectedDoctor(d)}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="px-3 space-y-4">
            {/* DIRECT SUB-TAB CONTENT DISPLAY */}
            <div className="pt-1 space-y-4">
              {subTab === "doctors" && (
                <div className="space-y-4 animate-in fade-in duration-300" dir="rtl">
                  <SearchBar value={search} onChange={setSearch} placeholder="أبحث عن اسم الطبيب..." focusRingClass="focus:ring-emerald-500/20" />
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  ) : filteredDoctors.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400 font-bold border border-slate-100 dark:border-slate-800">
                      لا يوجد أطباء مطابقين للبحث
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-800/90 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden">
                      {filteredDoctors.map((d, i) => (
                        <DoctorCard
                          key={d.id}
                          doctor={d}
                          onClick={() => setSelectedDoctor(d)}
                          index={i}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {subTab === "cars" && (
                <div className="space-y-4 animate-in fade-in duration-300" dir="rtl">
                  <SearchBar value={taxiSearch} onChange={setTaxiSearch} placeholder="أبحث عن سائق التكسي..." focusRingClass="focus:ring-emerald-500/20" />
                  
                   {/* Taxi Categories Bar */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {["خصوصي", "دليفري", "ستاركس", "حمل"].map((cat) => {
                      const isActive = taxiCategoryFilter === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setTaxiCategoryFilter(cat)}
                          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                            isActive
                              ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  ) : filteredTaxis.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400 font-bold border border-slate-100 dark:border-slate-800">
                      لا يوجد سواق تكسي مطابقين للبحث
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {filteredTaxis.map((t, i) => (
                        <motion.div
                          key={t.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedTaxi(t)}
                          className="w-full bg-white dark:bg-slate-800 rounded-3xl p-3 flex items-center justify-between gap-4 border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900/40 hover:shadow-md transition-all duration-200 cursor-pointer group text-right relative overflow-hidden"
                          dir="rtl"
                        >
                          {/* Details indicator on the left */}
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 group-hover:translate-x-[-2px] transition-transform">
                              التفاصيل
                            </span>
                            <ChevronLeft size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" />
                          </div>

                          {/* Profile & info on the right */}
                          <div className="flex items-center gap-3 flex-1 min-w-0" dir="rtl">
                            {/* Avatar or Icon container */}
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-100/70 dark:border-emerald-900/30 shrink-0 flex items-center justify-center relative overflow-hidden">
                              {(t as any).image ? (
                                <img
                                  src={(t as any).image}
                                  alt=""
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="flex flex-col items-center">
                                  <Car size={18} className="text-emerald-500" />
                                  <span className="text-[7px] font-black mt-0.5 px-0.5 bg-emerald-500 text-white rounded-md">TAXI</span>
                                </div>
                              )}
                            </div>

                            {/* Driver Information details */}
                            <div className="flex-1 min-w-0 text-right">
                              <h4 className="font-display font-black text-slate-800 dark:text-white text-xs sm:text-sm truncate mb-0.5">
                                {t.name}
                              </h4>
                              <div className="flex items-center gap-1.5 flex-wrap justify-end flex-row-reverse">
                                {t.category && (
                                  <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 text-[8px] font-black rounded-md">
                                    {t.category}
                                  </span>
                                )}
                                {t.carType && (
                                  <span className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-[9px] font-bold rounded-md truncate max-w-[110px]">
                                    🚗 {t.carType}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {subTab === "restaurants" && (
                <div className="space-y-4 animate-in fade-in duration-300" dir="rtl">
                  {/* Search Bar & Category Select Box */}
                  <div className="flex items-center gap-2" dir="rtl">
                    <div className="relative flex-1">
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">🔍</span>
                      <input
                        type="text"
                        placeholder="أبحث عن..."
                        value={restaurantSearch}
                        onChange={e => setRestaurantSearch(e.target.value)}
                        className="w-full h-11 pr-10 pl-9 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs text-right"
                      />
                      {restaurantSearch && (
                        <button
                          onClick={() => setRestaurantSearch('')}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors text-[10px]"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="relative shrink-0">
                      <select
                        value={selectedStoreCategoryTab}
                        onChange={(e) => setSelectedStoreCategoryTab(e.target.value)}
                        className="h-11 px-5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs font-black text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs appearance-none cursor-pointer text-center pr-4.5 pl-9 min-w-[130px] sm:min-w-[150px]"
                      >
                        <option value="الكل">الكل</option>
                        <option value="مطاعم">مطاعم</option>
                        <option value="متاجر">متاجر</option>
                        <option value="مكاتب">مكاتب</option>
                      </select>
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]">
                        ▼
                      </span>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-full bg-white dark:bg-slate-800 rounded-3xl p-4 flex gap-4 items-center border border-slate-100 dark:border-slate-800 animate-pulse">
                          <div className="w-24 h-24 rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                          <div className="flex-1 space-y-3">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-1/3" />
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (() => {
                    const filteredMarketStores = marketStores.filter((s) => {
                      if (!s.isActive) return false;

                      // Category tab filter
                      if (selectedStoreCategoryTab !== "الكل" && getStoreClassification(s) !== selectedStoreCategoryTab) {
                        return false;
                      }

                      // Search text filter
                      const q = restaurantSearch.toLowerCase().trim();
                      return !q || 
                        s.name.toLowerCase().includes(q) ||
                        (s.description && s.description.toLowerCase().includes(q)) ||
                        (s.location && s.location.toLowerCase().includes(q));
                    });

                    if (filteredMarketStores.length === 0) {
                      return (
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400 font-bold border border-slate-100 dark:border-slate-800">
                          لا توجد نتائج مطابقة في السوق
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {filteredMarketStores.map((store) => (
                          <motion.div
                            key={store.id}
                            onClick={() => setSelectedStoreId(store.id)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-white dark:bg-slate-800/90 rounded-3xl p-3 sm:p-3.5 flex gap-3.5 items-center border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:shadow-md transition-all duration-200 cursor-pointer group text-right relative overflow-hidden"
                            dir="rtl"
                          >
                            {/* Square Image Container Aligned Right */}
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-50 dark:bg-slate-700/50 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700 relative">
                              {store.logoImage || store.coverImage ? (
                                <img
                                  src={store.logoImage || store.coverImage}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  alt={store.name}
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <ShoppingBag size={28} className="text-emerald-500/80" />
                              )}
                            </div>

                            {/* Details Card Adjacent on the Left (Title and Description only) */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5 text-right">
                              <h3 className="font-display font-black text-sm sm:text-base text-slate-800 dark:text-white truncate">
                                {store.name}
                              </h3>
                              {store.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed mt-1">
                                  {store.description}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}



              {subTab === "complexes" && (
                <div className="space-y-4 animate-in fade-in duration-300" dir="rtl">
                  {/* Search Bar */}
                  <SearchBar
                    value={storeSearchText}
                    onChange={setStoreSearchText}
                    placeholder="ابحث عن اسم المجمع أو المركز أو موقعه..."
                    focusRingClass="focus:ring-emerald-500/20"
                  />

                  {/* Complexes List */}
                  {(() => {
                    const complexesSource = medicalComplexes.length > 0 ? medicalComplexes : marketStores;
                    const filteredComplexes = complexesSource.filter((store) => {
                      if (!store.isActive) return false;
                      const q = storeSearchText.toLowerCase().trim();
                      return (
                        !q ||
                        store.name.toLowerCase().includes(q) ||
                        (store.description && store.description.toLowerCase().includes(q)) ||
                        (store.location && store.location.toLowerCase().includes(q))
                      );
                    });

                    if (filteredComplexes.length === 0) {
                      return (
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400 font-bold border border-slate-100 dark:border-slate-800">
                          لا توجد مجمعات أو مراكز طبية مطابقة للبحث
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3 pb-8">
                        {filteredComplexes.map((store) => (
                          <motion.div
                            key={store.id}
                            onClick={() => setSelectedStoreId(store.id)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-white dark:bg-slate-800/90 rounded-3xl p-3 sm:p-4 flex gap-3.5 items-center border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:shadow-md transition-all duration-200 cursor-pointer group text-right relative overflow-hidden"
                          >
                            {/* Square Image */}
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-50 dark:bg-slate-700/50 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700 relative">
                              {store.logoImage || store.coverImage ? (
                                <img
                                  src={store.logoImage || store.coverImage}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  alt={store.name}
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <Hospital size={28} className="text-emerald-500/80" />
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                              <h3 className="font-display font-black text-sm sm:text-base text-slate-800 dark:text-white truncate">
                                {store.name}
                              </h3>
                              {store.location && (
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-1 flex items-center gap-1">
                                  <MapPin size={12} className="text-emerald-500 shrink-0" />
                                  <span className="truncate">{store.location}</span>
                                </p>
                              )}
                            </div>

                            <ChevronLeft size={18} className="text-slate-300 dark:text-slate-600 shrink-0" />
                          </motion.div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {subTab === "service_offers" && renderServiceOffersContent()}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDoctorsTab = () => {
    return (
      <div className="space-y-4 pt-3 pb-20 px-3 animate-in fade-in duration-300 font-sans" dir="rtl">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 flex items-center justify-between py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 -mx-3 px-4 mb-2 shadow-xs">
          <button
            onClick={() => {
              setTab("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-white transition-all cursor-pointer active:scale-95 shrink-0"
            title="الرجوع للرئيسية"
          >
            <ChevronRight size={20} />
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm shrink-0">
              <Stethoscope size={18} />
            </div>
            <span className="font-display font-black text-sm sm:text-base text-slate-800 dark:text-white whitespace-nowrap">
              الأطباء والعيادات
            </span>
          </div>

          <div className="w-9 h-9" />
        </div>

        {/* Search Bar with "بحث مخصص" Button */}
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="ابحث عن طبيب أو عيادة أو تخصص..."
              focusRingClass="focus:ring-emerald-500/20"
              className="mb-0"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsCustomDoctorSearchOpen(true)}
            className={`h-12 px-3.5 sm:px-4 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 border shadow-xs cursor-pointer active:scale-95 shrink-0 ${
              doctorCategoryFilter !== "الكل" || doctorRegionFilter !== "الكل"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-emerald-500/20 shadow-md"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-700"
            }`}
            title="بحث وتصنيف مخصص حسب التخصص والمنطقة"
          >
            <SlidersHorizontal size={15} className={doctorCategoryFilter !== "الكل" || doctorRegionFilter !== "الكل" ? "text-white" : "text-emerald-600 dark:text-emerald-400"} />
            <span className="whitespace-nowrap">بحث مخصص</span>
            {(doctorCategoryFilter !== "الكل" || doctorRegionFilter !== "الكل") && (
              <span className="w-5 h-5 rounded-full bg-white text-emerald-700 text-[10px] font-black flex items-center justify-center shadow-xs">
                {(doctorCategoryFilter !== "الكل" ? 1 : 0) + (doctorRegionFilter !== "الكل" ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Active Filter Badges */}
        {(doctorCategoryFilter !== "الكل" || doctorRegionFilter !== "الكل") && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs">
            <span className="text-[10px] font-bold text-slate-400">التصنيف النشط:</span>
            {doctorCategoryFilter !== "الكل" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-black">
                <span>🩺 {doctorCategoryFilter}</span>
                <button
                  type="button"
                  onClick={() => setDoctorCategoryFilter("الكل")}
                  className="hover:text-rose-500 cursor-pointer"
                  title="إلغاء تصفية التخصص"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {doctorRegionFilter !== "الكل" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-black">
                <span>📍 {doctorRegionFilter}</span>
                <button
                  type="button"
                  onClick={() => setDoctorRegionFilter("الكل")}
                  className="hover:text-rose-500 cursor-pointer"
                  title="إلغاء تصفية المنطقة"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setDoctorCategoryFilter("الكل");
                setDoctorRegionFilter("الكل");
              }}
              className="text-[10px] font-black text-rose-500 hover:underline mr-auto cursor-pointer"
            >
              عرض عام لكافة الأطباء
            </button>
          </div>
        )}

        {/* Doctor List */}
        {isLoading ? (
          <div className="space-y-1.5">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400 font-bold border border-slate-100 dark:border-slate-800">
            لا يوجد أطباء مطابقين للبحث
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden">
            {filteredDoctors.map((d, i) => (
              <DoctorCard
                key={d.id}
                doctor={d}
                onClick={() => setSelectedDoctor(d)}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderServicesTab = () => {
    return renderDirectoryTab();
  };

  const renderDirectoryTab = () => {
    const activeOffers = (serviceOffers || []).filter(
      (o) => o.isActive !== false && o.title && o.title.trim() !== "",
    );

    const activeStores = marketStores.filter(
      (s) => s.isActive !== false && s.name && s.name.trim() !== "",
    );

    const filteredStores = activeStores.filter((s) => {
      if (restaurantCategoryFilter !== "الكل" && getStoreClassification(s) !== restaurantCategoryFilter) {
        return false;
      }
      const q = (storeSearchText || "").toLowerCase().trim();
      return (
        !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.location && s.location.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q))
      );
    });

    const currentOffer =
      activeOffers.length > 0
        ? activeOffers[offerBannerIdx % activeOffers.length]
        : null;

    return (
      <div
        className="space-y-4 pt-3 pb-24 px-3 animate-in fade-in duration-300 font-sans text-right"
        dir="rtl"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 flex items-center justify-between py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 -mx-3 px-4 mb-1 shadow-xs">
          <button
            onClick={() => {
              setTab("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-white transition-all cursor-pointer active:scale-95 shrink-0"
            title="الرجوع للرئيسية"
          >
            <ChevronRight size={20} />
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm shrink-0">
              <BookOpen size={18} />
            </div>
            <span className="font-display font-black text-sm sm:text-base text-slate-800 dark:text-white whitespace-nowrap">
              دليل الشرقاط
            </span>
          </div>

          <div className="w-9 h-9" />
        </div>

        {/* 1. ANIMATED OFFERS BANNER (بنر متحرك للعروض لاستغلال المساحة) */}
        {activeOffers.length > 0 && currentOffer && (
          <div className="relative w-full aspect-[16/7] sm:aspect-[21/8] max-h-[220px] overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm group">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={currentOffer.id}
                initial={{ x: "100%", opacity: 1 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 1 }}
                transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
                onClick={() => setSelectedServiceOffer(currentOffer)}
                className="absolute inset-0 w-full h-full cursor-pointer select-none"
              >
                {currentOffer.image ? (
                  <img
                    src={currentOffer.image}
                    className="w-full h-full object-cover"
                    alt={currentOffer.title}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-600 via-teal-700 to-amber-600" />
                )}

                {/* Dark Gradient Overlay for optimal legibility */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-between p-3.5 sm:p-4 text-right"
                  dir="rtl"
                >
                  {/* Top Price Badge */}
                  <div className="flex items-center justify-start gap-2">
                    {currentOffer.price && (
                      <span className="px-2.5 py-1 bg-amber-500/95 backdrop-blur-md text-white font-black text-[10px] sm:text-xs rounded-xl shadow-xs">
                        {currentOffer.price}
                      </span>
                    )}
                  </div>

                  {/* Bottom Title Only */}
                  <div className="mt-auto">
                    <h3 className="text-xs sm:text-base font-display font-black text-white line-clamp-1 drop-shadow-sm">
                      {currentOffer.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Banner Dots Indicators */}
            {activeOffers.length > 1 && (
              <div className="absolute bottom-2.5 left-3 flex items-center gap-1 bg-black/35 backdrop-blur-md px-2 py-1 rounded-full z-10">
                {activeOffers.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOfferBannerIdx(i);
                    }}
                    className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                      i === offerBannerIdx % activeOffers.length
                        ? "w-4 bg-white"
                        : "w-1.5 bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={`عرض ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. SEARCH BAR & CATEGORY SELECT FOR RESTAURANTS */}
        <div className="flex items-center gap-2" dir="rtl">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="أبحث عن..."
              value={storeSearchText}
              onChange={(e) => setStoreSearchText(e.target.value)}
              className="w-full h-11 pr-10 pl-9 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs text-right"
            />
            {storeSearchText && (
              <button
                onClick={() => setStoreSearchText("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors text-[10px]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown Box (مقابل شريط البحث) */}
          <div className="relative shrink-0">
            <select
              value={restaurantCategoryFilter}
              onChange={(e) => setRestaurantCategoryFilter(e.target.value)}
              className="h-11 px-5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs font-black text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs appearance-none cursor-pointer text-center pr-4.5 pl-9 min-w-[130px] sm:min-w-[150px]"
            >
              <option value="الكل">الكل</option>
              <option value="مطاعم">مطاعم</option>
              <option value="متاجر">متاجر</option>
              <option value="مكاتب">مكاتب</option>
            </select>
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]">
              ▼
            </span>
          </div>
        </div>

        {/* 3. 2-COLUMN GRID OF RESTAURANTS (المطاعم بشكل شبكة ثنائية) */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl h-44 animate-pulse border border-slate-100 dark:border-slate-800"
              />
            ))}
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400 font-bold border border-slate-100 dark:border-slate-800">
            لا توجد مطاعم أو محلات مطابقة للبحث
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 pb-8">
            {filteredStores.map((store, i) => (
              <motion.div
                key={store.id}
                onClick={() => setSelectedStoreId(store.id)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between group p-2 sm:p-2.5 shadow-xs text-right"
              >
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    {/* Restaurant Image Container */}
                    <div className="relative w-full aspect-[4/3] rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900 overflow-hidden mb-2 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                      {store.logoImage || store.coverImage ? (
                        <img
                          src={store.logoImage || store.coverImage}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          alt={store.name}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Utensils size={24} className="text-emerald-500/80" />
                      )}
                    </div>

                    {/* Restaurant Title */}
                    <h4 className="font-display font-black text-xs sm:text-sm text-slate-800 dark:text-white truncate">
                      {store.name}
                    </h4>
                  </div>

                  {/* Location / Address Footer (No description on card) */}
                  {store.location && (
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1">
                      <span>📍</span>
                      <span className="truncate">{store.location}</span>
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderRestaurantsTab = () => {
    const activeStores = marketStores.filter((s) => s.isActive !== false && s.name && s.name.trim() !== "");

    const filteredStores = activeStores.filter((s) => {
      const q = storeSearchText.toLowerCase().trim();
      return (
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.location && s.location.toLowerCase().includes(q))
      );
    });

    return (
      <div className="space-y-4 pt-3 pb-20 px-3 animate-in fade-in duration-300 font-sans text-right" dir="rtl">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 flex items-center justify-between py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 -mx-3 px-4 mb-2 shadow-xs">
          <button
            onClick={() => {
              setTab("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-white transition-all cursor-pointer active:scale-95 shrink-0"
            title="الرجوع للرئيسية"
          >
            <ChevronRight size={20} />
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm shrink-0">
              <Hospital size={18} />
            </div>
            <span className="font-display font-black text-sm sm:text-base text-slate-800 dark:text-white whitespace-nowrap">
              المجمعات الطبية
            </span>
          </div>

          <div className="w-9 h-9" />
        </div>

        {/* Search Input for Complexes */}
        <div className="relative">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base">🔍</span>
          <input
            type="text"
            placeholder="ابحث عن اسم المجمع الطبي أو عنوانه..."
            value={storeSearchText}
            onChange={(e) => setStoreSearchText(e.target.value)}
            className="w-full h-12 pr-11 pl-10 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs text-right"
          />
          {storeSearchText && (
            <button
              onClick={() => setStoreSearchText("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* List of Stores */}
        {filteredStores.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400 font-bold border border-slate-100 dark:border-slate-800">
            لا توجد مجمعات طبية مطابقة للبحث
          </div>
        ) : (
          <div className="space-y-3 pb-8">
            {filteredStores.map((store) => {
              const linkedDoctorsCount = doctors.filter((doc) => doc.complexId === store.id).length;

              return (
                <motion.div
                  key={store.id}
                  onClick={() => {
                    setSelectedStoreId(store.id);
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white dark:bg-slate-800/90 rounded-3xl p-3 sm:p-4 flex gap-3.5 items-center border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:shadow-md transition-all duration-200 cursor-pointer group text-right relative overflow-hidden"
                >
                  {/* Square Image Container Aligned Right */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-50 dark:bg-slate-700/50 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700 relative">
                    {store.logoImage || store.coverImage ? (
                      <img
                        src={store.logoImage || store.coverImage}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={store.name}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Hospital size={28} className="text-emerald-500/80" />
                    )}
                  </div>

                  {/* Details Card Adjacent on the Left */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5 text-right">
                    <h4 className="font-display font-black text-sm sm:text-base text-slate-800 dark:text-white truncate">
                      {store.name}
                    </h4>
                    {store.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1 leading-relaxed mt-0.5">
                        {store.description}
                      </p>
                    )}

                    {/* Location */}
                    {store.location && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1 flex items-center gap-1">
                        📍 العنوان: {store.location}
                      </p>
                    )}
                  </div>

                  <ChevronLeft size={18} className="text-slate-300 dark:text-slate-600 shrink-0" />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderOffersTab = () => {
    return (
      <div className="space-y-4 pt-3 pb-20 px-3 animate-in fade-in duration-500 font-sans text-right" dir="rtl">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 flex items-center justify-between py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 -mx-3 px-4 mb-2 shadow-xs">
          <button
            type="button"
            onClick={() => {
              setTab("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-white transition-all cursor-pointer active:scale-95 shrink-0"
            title="الرجوع للرئيسية"
          >
            <ChevronRight size={20} />
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Tag size={18} />
            </div>
            <span className="font-display font-black text-sm sm:text-base text-slate-800 dark:text-white whitespace-nowrap">
              إعلانات وعروض
            </span>
          </div>

          <div className="w-9 h-9" />
        </div>

        {/* Offers Cards List */}
        {renderServiceOffersContent(true)}
      </div>
    );
  };

  const renderEventsTab = () => {
    return (
      <div className="space-y-4 pt-3 pb-20 px-3 animate-in fade-in duration-500 font-sans text-right" dir="rtl">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 flex items-center justify-between py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 -mx-3 px-4 mb-2 shadow-xs">
          <button
            type="button"
            onClick={() => {
              setTab("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-white transition-all cursor-pointer active:scale-95 shrink-0"
            title="الرجوع للرئيسية"
          >
            <ChevronRight size={20} />
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              {eventsSubTab === "events" ? <Sparkles size={18} /> : <Tag size={18} />}
            </div>
            <span className="font-display font-black text-sm sm:text-base text-slate-800 dark:text-white whitespace-nowrap">
              أحداث وعروض الشرقاط
            </span>
          </div>

          <div className="w-9 h-9" />
        </div>

        {/* Sub-Tabs: الأحداث | العروض */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setEventsSubTab("events");
              setSearch("");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              eventsSubTab === "events"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]"
                : "text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
            }`}
          >
            <Sparkles size={16} />
            <span>أحداث الشرقاط</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEventsSubTab("offers");
              setSearch("");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              eventsSubTab === "offers"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]"
                : "text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
            }`}
          >
            <Tag size={16} />
            <span>عروض الشرقاط</span>
          </button>
        </div>

        {eventsSubTab === "events" ? (
          <>
            {/* Search Bar for Events */}
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="ابحث في أحداث وإعلانات الشرقاط..."
              focusRingClass="focus:ring-emerald-500/20"
            />

            {/* List of Events */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl h-28 animate-pulse border border-slate-100 dark:border-slate-800" />
                ))}
              </div>
            ) : filteredGovAnnouncements.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400 font-bold border border-slate-100 dark:border-slate-800">
                لا توجد أحداث أو إعلانات مطابقة حالياً
              </div>
            ) : (
              <div className="flex flex-col gap-3 pb-8">
                {filteredGovAnnouncements.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedGovAnnouncement(item)}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex items-center gap-3 text-right"
                  >
                    {item.image && (
                      <img src={item.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display font-black text-sm text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mt-1">
                        {(item as any).content || item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Search Bar for Offers */}
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="ابحث في عروض وخصومات الشرقاط..."
              focusRingClass="focus:ring-emerald-500/20"
            />
            {renderServiceOffersContent(true)}
          </>
        )}
      </div>
    );
  };

  const renderMarketContent = (isEmbedded = false) => {
    const marketCategories = [
      { id: "الكل", label: "الكل" },
      { id: "موبايلات", label: "موبايلات" },
      { id: "سيارات", label: "سيارات" },
      { id: "عقارات", label: "عقارات" },
    ];

    return (
      <div className={`space-y-4 px-3 font-sans ${isEmbedded ? "pt-1 pb-4" : "pt-4 pb-20 animate-in fade-in duration-500"}`} dir="rtl">
        {/* Category Pills - Clean and matches the home tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl shadow-inner">
          {marketCategories.map((cat) => {
            const isActive = eventCategoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setEventCategoryFilter(cat.id)}
                className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-[1.02]"
                    : "text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-700/40"
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Classified Ads List */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl h-52 animate-pulse border border-slate-100 dark:border-slate-800" />
            ))}
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 p-10 text-center text-xs text-slate-400 font-bold">
            لا توجد منشورات أو إعلانات تطابق هذا البحث حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredAnnouncements.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedGovAnnouncement(c)}
                className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col gap-2 text-right overflow-hidden"
              >
                {c.image && (
                  <img src={c.image} alt="" className="w-full h-28 rounded-xl object-cover" />
                )}
                <h4 className="font-display font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                  {c.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-2">
                  {(c as any).content || c.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-6 pt-4 pb-20 px-4 animate-in fade-in duration-500 font-sans" dir="rtl">
        {/* Settings Header Card */}
        <div className="bg-gradient-to-br from-shirqat-primary to-emerald-700 text-white rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white/15 rounded-full p-1 overflow-hidden border border-white/25 mb-3 shadow-lg">
            <img
              src="/logo_shirqat.svg"
              alt="دليل الشرقاط"
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-2xl font-display font-black mb-1">
            دليل <span className="text-amber-300">الشرقاط</span>
          </h2>
          <p className="text-xs font-bold opacity-90">
            الإعدادات والمعلومات العامة • الإصدار 3.0
          </p>
        </div>

        {/* Quick Add Button */}
        <div className="bg-gradient-to-r from-shirqat-primary to-emerald-600 p-0.5 rounded-3xl shadow-lg">
          <button
            onClick={() => setShowAdModal(true)}
            className="w-full bg-shirqat-primary hover:bg-shirqat-primary/90 text-white h-14 rounded-[1.4rem] font-display font-black flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all text-sm cursor-pointer"
          >
            <PlusCircle size={20} /> أضف معلوماتك أو إعلانك مجاناً
          </button>
        </div>

        {/* Group: App Information */}
        <div className="space-y-3">
          <span className="text-xs font-black text-slate-400 dark:text-slate-500 px-2 uppercase tracking-wider block">
            معلومات التطبيق
          </span>
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 overflow-hidden shadow-xs">
            {[
              {
                icon: <Info size={18} className="text-indigo-500" />,
                label: "من نحن",
                page: "about",
              },
              {
                icon: <ShieldCheck size={18} className="text-emerald-500" />,
                label: "سياسة الخصوصية",
                page: "privacy",
              },
              {
                icon: <Scale size={18} className="text-amber-500" />,
                label: "شروط الاستخدام",
                page: "terms",
              },
              {
                icon: <Mail size={18} className="text-rose-500" />,
                label: "اتصل بنا",
                page: "contact",
              },
            ].map((item, i, arr) => (
              <button
                key={item.page}
                onClick={() => setSidebarPage(item.page as any)}
                className={`w-full flex items-center justify-between px-5 py-4 text-right hover:bg-slate-50 dark:hover:bg-slate-750 transition-all cursor-pointer ${
                  i < arr.length - 1 ? "border-b border-slate-100 dark:border-slate-700/60" : ""
                }`}
              >
                <ChevronLeft size={16} className="text-slate-300 dark:text-slate-600" />
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                    {item.label}
                  </span>
                  <div className="w-8 h-8 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Group: Control Panel */}
        {currentUser && (
          <div className="space-y-3">
            <span className="text-xs font-black text-slate-400 dark:text-slate-500 px-2 uppercase tracking-wider block">
              لوحة التحكم والإدارة
            </span>
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 p-4 space-y-3 shadow-xs">
              {isAdmin && (
                <button
                  onClick={() => setSidebarPage("admin")}
                  className="w-full h-12 bg-shirqat-primary hover:bg-shirqat-primary/95 text-white rounded-2xl flex items-center justify-center gap-2.5 font-black shadow-md shadow-shirqat-primary/15 active:scale-95 transition-all text-xs cursor-pointer"
                >
                  <Lock size={18} /> لوحة التحكم (إدارة البيانات)
                </button>
              )}
              <button
                onClick={() => logout()}
                className="w-full h-12 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl flex items-center justify-center gap-2.5 font-black active:scale-95 transition-all text-xs cursor-pointer"
              >
                <LogOut size={18} /> تسجيل الخروج
              </button>
            </div>
          </div>
        )}

        {/* Group: Account & Admin */}
        <div className="space-y-3">
          <span className="text-xs font-black text-slate-400 dark:text-slate-500 px-2 uppercase tracking-wider block">
            الحساب والإدارة
          </span>
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 p-4 space-y-3 shadow-xs">
            {currentUser ? (
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-750 rounded-2xl">
                <div>
                  <p className="text-xs font-black text-slate-800 dark:text-white">
                    {currentUser.displayName || currentUser.email}
                  </p>
                  <p className="text-[10px] text-slate-400">مسجل الدخول حالياً</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs">
                  ✓
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full h-12 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl flex items-center justify-center gap-2.5 font-black active:scale-95 transition-all text-xs cursor-pointer"
              >
                <Lock size={18} /> دخول المشرفين / الإدارة
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 opacity-60">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
            جميع الحقوق محفوظة © دليل الشرقاط {new Date().getFullYear()}
          </p>
        </div>
      </div>
    );
  };

  const renderNotificationsTab = () => {
    return (
      <div className="space-y-4 pt-3 pb-20 px-3 animate-in fade-in duration-500 font-sans text-right" dir="rtl">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 flex justify-between items-center gap-3 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 -mx-3 px-4 mb-2 shadow-xs">
          {/* Back Button to Home */}
          <button
            onClick={() => {
              setTab("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-white transition-all cursor-pointer active:scale-95 shrink-0"
            title="الرجوع للرئيسية"
          >
            <ChevronRight size={20} />
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm shrink-0">
              <Bell size={18} />
            </div>
            <span className="font-display font-black text-sm sm:text-base text-slate-800 dark:text-white whitespace-nowrap">
              الإشعارات والتنبيهات 🔔
            </span>
          </div>

          <div className="w-10 h-10" />
        </div>

        <div className="space-y-4 pt-2 font-sans text-right" dir="rtl">
          {/* Unread Alert Indicator */}
          {unreadCount > 0 && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 rounded-3xl flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center animate-pulse shrink-0">
                <Bell size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-rose-800 dark:text-rose-200">إشعارات جديدة غير مقروءة!</p>
                <p className="text-[10px] text-rose-500/80 font-bold">لديك {unreadCount} إشعارات لم تقرأها بعد.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {notifications.length > 0 && (
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-black text-slate-400">إجمالي التنبيهات: {notifications.length}</span>
              <button
                onClick={markAllNotificationsAsRead}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 active:scale-95 cursor-pointer bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-xl transition-all"
              >
                تحديد الكل كمقروء ✓
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="space-y-3 pb-8">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-xs">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-750 text-slate-400 rounded-full flex items-center justify-center mb-4">
                  <Bell size={28} className="opacity-40" />
                </div>
                <p className="text-sm font-black text-slate-700 dark:text-slate-200">صندوق الإشعارات فارغ</p>
                <p className="text-xs text-slate-400 font-bold mt-1.5 leading-relaxed max-w-xs">
                  لا توجد أي إشعارات أو تنبيهات عامة مرسلة من لوحة الإدارة في الوقت الحالي.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !readNotificationIds.includes(notif.id);
                return (
                  <div
                    key={notif.id}
                    className={`p-5 rounded-[2rem] border transition-all duration-300 relative overflow-hidden shadow-xs flex flex-col gap-2.5 ${
                      isUnread
                        ? "bg-white dark:bg-slate-800 border-rose-100 dark:border-rose-900/50 hover:border-rose-200"
                        : "bg-white/70 dark:bg-slate-800/60 border-slate-100 dark:border-slate-850 hover:bg-white dark:hover:bg-slate-800"
                    }`}
                  >
                    {/* Unread Indicator Bar */}
                    {isUnread && (
                      <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-rose-500" />
                    )}

                    {/* Notification Header: Icon & Date */}
                    <div className="flex justify-between items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-rose-500 text-sm">🔔</span>
                        <span className="text-xs font-black text-rose-600 dark:text-rose-400">تنبيه</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0 bg-slate-50 dark:bg-slate-750 px-2 py-0.5 rounded-md">
                        {new Date(notif.timestamp || Date.now()).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Notification Message Text Only */}
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed pr-1 whitespace-pre-line">
                      {notif.message}
                    </p>

                    {/* Mark as read button if unread */}
                    {isUnread && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            const newRead = [...readNotificationIds, notif.id];
                            setReadNotificationIds(newRead);
                            safeStorage.setItem("read_notification_ids", JSON.stringify(newRead));
                          }}
                          className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-lg cursor-pointer"
                        >
                          تحديد كمقروء ✓
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSettingsTab = () => {
    return (
      <div className="space-y-4 pt-3 pb-20 px-3 animate-in fade-in duration-500 font-sans text-right" dir="rtl">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 flex justify-between items-center gap-3 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 -mx-3 px-4 mb-4 shadow-xs">
          {/* Back Button to Home */}
          <button
            onClick={() => {
              setTab("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-white transition-all cursor-pointer active:scale-95 shrink-0"
            title="الرجوع للرئيسية"
          >
            <ChevronRight size={20} />
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center font-black shadow-sm shrink-0">
              <Settings size={18} />
            </div>
            <span className="font-display font-black text-sm sm:text-base text-slate-800 dark:text-white whitespace-nowrap">
              الضبط والإعدادات ⚙️
            </span>
          </div>

          <div className="w-10 h-10" />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
          {renderSettings()}
        </div>
      </div>
    );
  };

  const showBottomBar = false;

  return (
    <div
      className="min-h-screen font-sans bg-slate-50 text-slate-800"
      dir="rtl"
    >
      {/* Ultra Lightweight & Fast Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900 text-white font-sans overflow-hidden select-none p-4"
            dir="rtl"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-white/10 p-2 flex items-center justify-center">
                <img
                  src="/logo_shirqat.svg"
                  alt="دليل الشرقاط"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h1 className="text-lg font-display font-black text-white">
                دليل <span className="text-emerald-400">الشرقاط</span>
              </h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <div className="max-w-lg mx-auto pb-6">
        {tab === "home" && renderHome()}
        {tab === "doctors" && renderDoctorsTab()}
        {(tab === "services" || tab === "directory") && renderServicesTab()}
        {tab === "notifications" && renderNotificationsTab()}
        {tab === "settings" && renderSettingsTab()}
      </div>


      <AnimatePresence>
        {selectedDoctor && activeDoctor && (
          <DetailPage
            title={activeDoctor.name}
            subtitle={activeDoctor.subtitle}
            icon={<Stethoscope className="text-emerald-500" size={56} />}
            onBack={() => setSelectedDoctor(null)}
            image={activeDoctor.image}
            isVerified={activeDoctor.isVerified}
          >
            <div className="space-y-3.5 font-sans" dir="rtl">
              {/* 1. التخصص الطبي */}
              {activeDoctor.subtitle && (
                <DetailRow
                  icon={<Stethoscope className="text-emerald-500" />}
                  label="التخصص الطبي"
                  value={activeDoctor.subtitle}
                />
              )}

              {/* 2. هاتف الحجز المباشر */}
              {activeDoctor.reservationPhone && (
                <DetailRow
                  icon={<Phone className="text-emerald-600" />}
                  label="رقم هاتف الحجز المباشر"
                  value={activeDoctor.reservationPhone}
                  actionIcon={<Phone size={14} />}
                  onAction={() => window.open(`tel:${activeDoctor.reservationPhone}`)}
                />
              )}

              {/* 3. رقم الهاتف الرئيسي والثانوي */}
              {activeDoctor.phone1 && (
                <DetailRow
                  icon={<Phone className="text-emerald-500" />}
                  label="رقم العيادة"
                  value={activeDoctor.phone1}
                  actionIcon={<Phone size={14} />}
                  onAction={() => window.open(`tel:${activeDoctor.phone1}`)}
                />
              )}
              {activeDoctor.phone2 && (
                <DetailRow
                  icon={<Phone className="text-emerald-500" />}
                  label="رقم ثانوي"
                  value={activeDoctor.phone2}
                  actionIcon={<Phone size={14} />}
                  onAction={() => window.open(`tel:${activeDoctor.phone2}`)}
                />
              )}

              {/* 4. العنوان */}
              {activeDoctor.location && (
                <DetailRow
                  icon={<MapPin className="text-emerald-500" />}
                  label="العنوان"
                  value={activeDoctor.location}
                />
              )}

              {/* 5. أوقات الدوام وأيام العيادة */}
              {activeDoctor.workingDays && (
                <DetailRow
                  icon={<Calendar className="text-teal-500" />}
                  label="أيام وأوقات الدوام"
                  value={activeDoctor.workingDays}
                />
              )}

              {/* 6. التفاصيل والملاحظات */}
              {activeDoctor.description && (
                <div className="flex items-start gap-3.5 p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 rounded-2xl text-right">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mb-1 uppercase tracking-wider">
                      التفاصيل والوصف
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {activeDoctor.description}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </DetailPage>
        )}

        {selectedTaxi && (
          <DetailPage
            title={selectedTaxi.name}
            subtitle={selectedTaxi.carType || (selectedTaxi as any).craft || selectedTaxi.category || "خدمة عامة"}
            icon={<Wrench size={56} />}
            onBack={() => setSelectedTaxi(null)}
            image={selectedTaxi.image}
            isVerified={false}
          >
            <div className="space-y-3.5 font-sans" dir="rtl">
              {/* 1. الخدمة / المهنة */}
              {(selectedTaxi.carType || (selectedTaxi as any).craft || selectedTaxi.category) && (
                <DetailRow
                  icon={<Wrench className="text-amber-500" />}
                  label="الخدمة / المهنة"
                  value={selectedTaxi.carType || (selectedTaxi as any).craft || selectedTaxi.category}
                />
              )}

              {/* 2. رقم الهاتف */}
              {selectedTaxi.phone && (
                <DetailRow
                  icon={<Phone className="text-emerald-500" />}
                  label="رقم الهاتف"
                  value={selectedTaxi.phone}
                  actionIcon={<Phone size={14} />}
                  onAction={() => window.open(`tel:${selectedTaxi.phone}`)}
                />
              )}

              {/* 3. المنطقة */}
              {selectedTaxi.location && (
                <DetailRow
                  icon={<MapPin className="text-emerald-500" />}
                  label="المنطقة"
                  value={selectedTaxi.location}
                />
              )}

              {/* 4. التفاصيل */}
              {selectedTaxi.notes && (
                <div className="flex items-start gap-3.5 p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mb-1 uppercase tracking-wider">
                      التفاصيل والوصف
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {selectedTaxi.notes}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </DetailPage>
        )}



        {selectedGovAnnouncement && activeGovAnnouncement && (
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-0 z-[120] bg-slate-50 dark:bg-slate-900 flex flex-col pointer-events-auto font-sans"
          >
            {/* Sticky Top Header Bar */}
            <div className="sticky top-0 z-[130] bg-white/90 backdrop-blur-md dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800 p-3.5 sm:p-4 flex items-center justify-between shrink-0" dir="rtl">
              <div className="w-10 h-10 shrink-0" />
              <div className="flex-1 text-center px-2 min-w-0">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider block">
                  تفاصيل الحدث والإعلان
                </span>
                <span className="font-black text-sm text-slate-800 dark:text-slate-100 truncate block">
                  {activeGovAnnouncement.title}
                </span>
              </div>
              <button 
                onClick={() => setSelectedGovAnnouncement(null)} 
                className="w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-800 dark:text-slate-200 cursor-pointer transition-all active:scale-95 shrink-0"
                title="رجوع"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-right pb-28 custom-scrollbar" dir="rtl">

              {/* Cover Image or Carousel */}
              {(() => {
                const detailImages = [];
                if (activeGovAnnouncement.images && activeGovAnnouncement.images.length > 0) {
                  detailImages.push(...activeGovAnnouncement.images);
                } else if (activeGovAnnouncement.image) {
                  detailImages.push(activeGovAnnouncement.image);
                }
                
                if (detailImages.length === 0) return null;
                
                return (
                  <div className="relative rounded-3xl overflow-hidden shadow-2xs border border-slate-100 dark:border-slate-800">
                    <DetailsCarousel 
                      images={detailImages} 
                      title={activeGovAnnouncement.title} 
                    />
                  </div>
                );
              })()}

              {/* Title & Category Summary Card */}
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/70 p-4 sm:p-5 rounded-3xl shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-xl text-[11px] font-black flex items-center gap-1.5">
                    <Sparkles size={12} />
                    <span>{activeGovAnnouncement.entity || "حدث / إعلان رسمى"}</span>
                  </span>

                  {(activeGovAnnouncement.publishDate || (activeGovAnnouncement as any).createdAt) && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1">
                      <Calendar size={13} />
                      <span>{activeGovAnnouncement.publishDate || "تاريخ حديث"}</span>
                    </span>
                  )}
                </div>

                <h2 className="font-display font-black text-base sm:text-lg text-slate-800 dark:text-white leading-snug">
                  {activeGovAnnouncement.title}
                </h2>
              </div>

              {/* Organized Key Information Cards */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                  بيانات التواصل والموقع
                </h3>

                {/* 1. Location / Entity */}
                {activeGovAnnouncement.entity && (
                  <DetailRow
                    icon={<MapPin size={20} className="text-emerald-500 dark:text-emerald-400" />}
                    label="الجهة / الموقع"
                    value={activeGovAnnouncement.entity}
                  />
                )}

                {/* 2. Contact Phone */}
                {activeGovAnnouncement.phoneNumber && (
                  <DetailRow
                    icon={<Phone size={20} className="text-emerald-500 dark:text-emerald-400" />}
                    label="رقم الاستفسار والتواصل"
                    value={activeGovAnnouncement.phoneNumber}
                    isPhone={true}
                  />
                )}

                {/* 3. External Link */}
                {activeGovAnnouncement.linkUrl && (
                  <DetailRow
                    icon={<Globe size={20} className="text-emerald-500 dark:text-emerald-400" />}
                    label="الرابط المرفق"
                    value={activeGovAnnouncement.linkText || "رابط التفاصيل والتسجيل"}
                    actionIcon={<ExternalLink size={16} />}
                    onAction={() => window.open(activeGovAnnouncement.linkUrl, '_blank')}
                  />
                )}
              </div>

              {/* Extended Description Box */}
              {activeGovAnnouncement.description && (
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/70 p-5 rounded-3xl shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3 text-slate-800 dark:text-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <FileText size={18} />
                    </div>
                    <span className="font-display font-black text-xs sm:text-sm">
                      تفاصيل الشرح والمعلومات
                    </span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-200 text-sm font-semibold leading-relaxed whitespace-pre-wrap text-right font-sans">
                    {activeGovAnnouncement.description}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Floating Action Bar if Phone or Link exists */}
            {(activeGovAnnouncement.phoneNumber || activeGovAnnouncement.linkUrl) && (
              <div className="fixed bottom-0 inset-x-0 z-[140] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 p-3 px-4 flex items-center gap-3 max-w-lg mx-auto shadow-2xl" dir="rtl">
                {activeGovAnnouncement.phoneNumber && (
                  <a
                    href={`tel:${activeGovAnnouncement.phoneNumber}`}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all"
                  >
                    <Phone size={16} />
                    <span>اتصل الآن ({activeGovAnnouncement.phoneText || "الاستفسار"})</span>
                  </a>
                )}

                {activeGovAnnouncement.linkUrl && (
                  <button
                    onClick={() => window.open(activeGovAnnouncement.linkUrl, '_blank')}
                    className={`flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-black py-3 rounded-2xl flex items-center justify-center gap-2 text-xs active:scale-[0.98] transition-all ${
                      !activeGovAnnouncement.phoneNumber ? "w-full" : ""
                    }`}
                  >
                    <ExternalLink size={16} />
                    <span>{activeGovAnnouncement.linkText || "فتح الرابط"}</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
        {selectedServiceOffer && activeServiceOffer && (
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-0 z-[120] bg-slate-50 dark:bg-slate-900 flex flex-col pointer-events-auto font-sans"
          >
            {/* Sticky Top Header Bar */}
            <div className="sticky top-0 z-[130] bg-white/90 backdrop-blur-md dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800 p-2.5 sm:p-3 flex items-center justify-between shrink-0" dir="rtl">
              <div className="w-9 h-9 shrink-0" />
              <div className="flex-1 text-center px-2 min-w-0">
                <span className="font-black text-base text-slate-800 dark:text-slate-100 truncate block">
                  تفاصيل
                </span>
              </div>
              <button 
                onClick={() => setSelectedServiceOffer(null)} 
                className="w-9 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-800 dark:text-slate-200 cursor-pointer transition-all active:scale-95 shrink-0"
                title="رجوع"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-2 text-right pb-24 custom-scrollbar" dir="rtl">

              {/* Cover Image or Carousel */}
              {(() => {
                const detailImages = [];
                if (activeServiceOffer.images && activeServiceOffer.images.length > 0) {
                  detailImages.push(...activeServiceOffer.images);
                } else if (activeServiceOffer.image) {
                  detailImages.push(activeServiceOffer.image);
                }
                
                if (detailImages.length === 0) return null;
                
                return (
                  <div className="relative rounded-2xl overflow-hidden shadow-2xs border border-slate-100 dark:border-slate-800">
                    <DetailsCarousel 
                      images={detailImages} 
                      title={activeServiceOffer.title} 
                      heightClass="h-40 sm:h-44"
                      marginClass="my-0"
                    />
                  </div>
                );
              })()}

              {/* Title Directly Under Image */}
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/70 p-3 sm:p-3.5 rounded-2xl shadow-2xs">
                <h2 className="font-display font-black text-sm sm:text-base text-slate-800 dark:text-white leading-snug">
                  {activeServiceOffer.title}
                </h2>
              </div>

              {/* Price & Call Button Bar */}
              {(activeServiceOffer.price || activeServiceOffer.whatsappNumber || activeServiceOffer.phone) && (
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/70 p-2.5 sm:p-3 rounded-2xl shadow-2xs flex items-center justify-between gap-3">
                  {activeServiceOffer.price ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black text-xs sm:text-sm">
                      <Tag size={16} className="shrink-0" />
                      <span>{activeServiceOffer.price}</span>
                    </div>
                  ) : (
                    <div />
                  )}

                  {(activeServiceOffer.whatsappNumber || activeServiceOffer.phone) && (
                    <a
                      href={`tel:${(activeServiceOffer.whatsappNumber || activeServiceOffer.phone).replace(/\D/g, '')}`}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
                    >
                      <Phone size={14} />
                      <span>اتصال</span>
                    </a>
                  )}
                </div>
              )}

              {/* Description Box Without Title */}
              {activeServiceOffer.description && (
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/70 p-3 sm:p-3.5 rounded-2xl shadow-2xs">
                  <p className="text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold leading-relaxed whitespace-pre-wrap text-right font-sans">
                    {activeServiceOffer.description}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}



        {selectedBanner && (
          <OverlayPage
            title={selectedBanner.title}
            onBack={() => setSelectedBanner(null)}
          >
            <div className="p-4 text-right">
              {selectedBanner.image && (
                <img
                  src={selectedBanner.image}
                  className="w-full h-48 object-cover rounded-3xl mb-6 shadow-xl"
                />
              )}
              <p className="text-slate-800 font-bold leading-loose text-lg">
                {selectedBanner.content}
              </p>
              {selectedBanner.type === "text" && selectedBanner.url && (
                <button
                  onClick={() => window.open(selectedBanner.url, "_blank")}
                  className="w-full h-16 bg-shirqat-primary text-white rounded-2xl flex items-center justify-center gap-2 mt-8 font-black"
                >
                  <ExternalLink size={20} />{" "}
                  {selectedBanner.buttonText || "زيارة الرابط"}
                </button>
              )}
            </div>
          </OverlayPage>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarPage === "admin" && isAdmin && (
          <OverlayPage title="لوحة التحكم" onBack={() => setSidebarPage(null)}>
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-20 text-slate-400 font-bold">
                  جاري تحميل لوحة التحكم...
                </div>
              }
            >
              <AdminPanel
                adminView={adminView}
                setAdminView={setAdminView}
                isAdding={isAdding}
                setIsAdding={setIsAdding}
                editingItem={editingItem}
                serviceOffers={serviceOffers}
                setEditingItem={setEditingItem}
                formData={formData}
                setFormData={setFormData}
                adminSearch={adminSearch}
                setAdminSearch={setAdminSearch}
                handleFileUpload={handleFileUpload}
                saveItem={saveItem}
                startAdd={startAdd}
                startEdit={startEdit}
                deleteItem={deleteItem}
                confirmDelete={confirmDelete}
                doctors={doctors}
                taxis={taxis}
                banners={banners}
                appSettings={appSettings}
                saveSettings={saveSettings}
                medicalComplexes={medicalComplexes}
                setMedicalComplexes={setMedicalComplexes}
                marketStores={marketStores}
                adminSelectedStore={adminSelectedStore}
                setAdminSelectedStore={setAdminSelectedStore}
                adminMarketProducts={adminMarketProducts}
                adminSelectedOffer={adminSelectedOffer}
                setAdminSelectedOffer={setAdminSelectedOffer}
                adminOfferProducts={adminOfferProducts}
                notifications={notifications}
                govAnnouncements={govAnnouncements}
                setNotifications={setNotifications}
                seedDatabase={seedDatabase}
                setDoctors={setDoctors}
                setMarketStores={setMarketStores}
                setServiceOffers={setServiceOffers}
                doctorSpecialtiesList={doctorSpecialtiesList}
                setDoctorSpecialtiesList={setDoctorSpecialtiesList}
                doctorRegionsList={doctorRegionsList}
                setDoctorRegionsList={setDoctorRegionsList}
                serviceCategoriesList={serviceCategoriesList}
                setServiceCategoriesList={setServiceCategoriesList}
              />
            </Suspense>
          </OverlayPage>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <div
            className="fixed inset-0 z-[700] flex items-center justify-center p-6"
            dir="rtl"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setConfirmDelete(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-lg font-display font-black text-slate-800 mb-2">
                تأكيد الحذف
              </h3>
              <p className="text-xs font-bold text-slate-400 mb-6 px-4 leading-relaxed">
                هل أنت متأكد من حذف هذا العنصر نهائياً؟ لا يمكن التراجع عن هذا
                الإجراء.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() =>
                    deleteItem(confirmDelete.id, confirmDelete.type)
                  }
                  className="h-12 bg-rose-500 text-white rounded-xl font-black text-xs shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                >
                  نعم، حذف
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="h-12 bg-slate-100 text-slate-600 rounded-xl font-black text-xs active:scale-95 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={scrollToTop}
            id="scroll-to-top-btn"
            className={`fixed ${selectedStoreId ? "bottom-20" : "bottom-6"} right-6 z-[250] w-14 h-14 bg-slate-900/90 dark:bg-shirqat-primary text-white rounded-full shadow-2xl flex items-center justify-center border border-white/20 active:scale-90 transition-all duration-300 pointer-events-auto backdrop-blur-md`}
          >
            <ArrowRight size={24} className="-rotate-90" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarPage === "about" && (
          <OverlayPage title="من نحن" onBack={() => setSidebarPage(null)}>
            <div className="p-6 space-y-6 text-right font-sans" dir="rtl">
              {/* Main Banner */}
              <div className="bg-gradient-to-br from-shirqat-primary via-emerald-700 to-teal-800 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col items-center text-center relative overflow-hidden">
                <div className="w-20 h-20 bg-white/15 rounded-full p-1 overflow-hidden border border-white/30 mb-4 shadow-lg">
                  <img
                    src="/logo_shirqat.svg"
                    alt="دليل الشرقاط"
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="text-2xl font-display font-black mb-3">
                  تطبيق دليل الشرقاط
                </h3>
                <p className="text-base font-medium leading-relaxed opacity-95 max-w-md">
                  تطبيق <span className="font-black text-amber-300">دليل الشرقاط</span> هو التطبيق الخدمي المباشر لقضاء الشرقاط، تم إنشاؤه لتوفير خدمة مجانية تسهّل على المواطنين البحث عن أرقام هواتف الأطباء، العيادات التخصصية، والإشعارات العاجلة.
                </p>
              </div>
            </div>
          </OverlayPage>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarPage === "privacy" && (
          <OverlayPage
            title="سياسة الخصوصية"
            onBack={() => setSidebarPage(null)}
          >
            <div className="p-6 space-y-8 text-right">
              <div className="flex flex-col items-center py-8 opacity-20">
                <Shield size={64} className="text-shirqat-primary" />
              </div>
              <div className="space-y-4">
                <h4 className="font-display font-black text-slate-800">
                  ما هي البيانات التي نجمعها؟
                </h4>
                <p className="text-sm font-bold text-slate-500 leading-loose">
                  لا نقوم بجمع أي بيانات شخصية حساسة عن المستخدمين. جميع
                  المعلومات المعروضة (أرقام الهواتف، العناوين) هي معلومات عامة
                  وافق أصحابها على نشرها لخدمة الصالح العام.
                </p>
              </div>
            </div>
          </OverlayPage>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarPage === "contact" && (
          <OverlayPage title="اتصل بنا" onBack={() => setSidebarPage(null)}>
            <div className="p-6 space-y-4 text-right">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-shirqat-primary/10 rounded-full flex items-center justify-center mx-auto text-shirqat-primary">
                    <Mail size={32} />
                  </div>
                  <h4 className="font-display font-black text-xl">
                    الدعم الفني والتواصل
                  </h4>
                  <p className="text-xs font-bold text-slate-400">
                    نحن هنا لمساعدتك في أي وقت
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => window.open("https://wa.me/9647740100909")}
                    className="w-full h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between px-6 font-bold text-emerald-700 hover:bg-emerald-100 transition-all"
                  >
                    <Whatsapp size={20} />
                    <span>تواصل عبر واتساب</span>
                  </button>
                  <a
                    href="mailto:adel20kh21@gmail.com"
                    className="w-full h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between px-6 font-bold text-indigo-700 hover:bg-indigo-100 transition-all"
                  >
                    <Mail size={20} />
                    <span>adel20kh21@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>
          </OverlayPage>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdModal && (
          <div
            className="fixed inset-0 z-[600] flex items-center justify-center p-6"
            dir="rtl"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowAdModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-shirqat-primary/10 rounded-full flex items-center justify-center mx-auto text-shirqat-primary mb-6">
                <PlusCircle size={40} />
              </div>
              <h3 className="text-2xl font-display font-black text-slate-800 mb-4">
                إضافة معلوماتك
              </h3>
              <p className="text-sm font-bold text-slate-500 leading-loose mb-8">
                لإضافة معلومات الخدمة أو إرسال اقتراح، يرجى
                التواصل معنا عبر واتساب الإدارة.
              </p>
              <button
                onClick={() =>
                  window.open("https://wa.me/9647730101010", "_blank")
                }
                className="w-full h-16 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Whatsapp size={24} /> تواصل مع الإدارة
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoginModal && (
          <div
            className="fixed inset-0 z-[600] flex items-center justify-center p-6"
            dir="rtl"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowLoginModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center border border-slate-100 dark:border-slate-700/50"
            >
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500 mb-5">
                <Lock size={32} />
              </div>
              <h3 className="text-xl font-display font-black text-slate-800 dark:text-white mb-2">
                تسجيل دخول الإدارة
              </h3>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400 leading-relaxed mb-6">
                هذه اللوحة مخصصة لإدارة تطبيق دليل الشرقاط فقط (تحديث المحتوى والرد على الطلبات).
              </p>

              <button
                onClick={loginWithGoogle}
                className="w-full h-14 bg-slate-900 dark:bg-amber-600 hover:bg-slate-800 dark:hover:bg-amber-700 text-white rounded-2xl font-black shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2.5 border border-transparent dark:border-amber-500/30 text-xs text-right"
              >
                <svg className="w-4 h-4 shrink-0 bg-white rounded-full p-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>تسجيل الدخول بواسطة Google</span>
              </button>

              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full h-10 mt-2 bg-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 rounded-2xl font-bold active:scale-95 transition-all flex items-center justify-center text-[10px]"
              >
                إلغاء الأمر
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Doctor Search & Filter Modal (بحث مخصص للأطباء) */}
      <AnimatePresence>
        {isCustomDoctorSearchOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCustomDoctorSearchOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-right space-y-4 z-10 font-sans"
              dir="rtl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Stethoscope size={18} />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-slate-900 dark:text-white text-base">
                      التخصص
                    </h3>
                    <p className="text-[11px] font-bold text-slate-400">
                      حدد التخصص الطبي لعرض الأطباء
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomDoctorSearchOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Specialty Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Stethoscope size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>التخصص الطبي المطلوب:</span>
                </label>
                <div className="relative">
                  <select
                    value={doctorCategoryFilter}
                    onChange={(e) => setDoctorCategoryFilter(e.target.value)}
                    className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none text-right"
                  >
                    {doctorSpecialties.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec === "الكل" ? "جميع التخصصات الطبية" : spec}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCustomDoctorSearchOpen(false)}
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all active:scale-95 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check size={16} />
                  <span>عرض الأطباء ({filteredDoctors.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDoctorCategoryFilter("الكل");
                    setIsCustomDoctorSearchOpen(false);
                  }}
                  className="px-3 h-11 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                >
                  إعادة ضبط
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Sidebar Drawer (قائمة الضبط الجانبية) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black z-[300] backdrop-blur-xs"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[70%] sm:w-[320px] bg-slate-50 dark:bg-slate-900 shadow-2xl z-[310] flex flex-col h-full border-l border-slate-100 dark:border-slate-800 font-sans"
              dir="rtl"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-850">
                <span className="font-display font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <span className="text-xl">⚙️</span>
                  <span>الضبط والإعدادات</span>
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 active:scale-95 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {renderSettings()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const SidebarItem = ({ icon, label, onClick }: any) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-right group"
  >
    <ChevronLeft
      size={16}
      className="text-slate-300 group-hover:text-shirqat-primary transition-colors"
    />
    <div className="flex items-center gap-3">
      <span className="text-xs font-black text-slate-600 dark:text-slate-300">
        {label}
      </span>
      <div className="text-shirqat-primary">{icon}</div>
    </div>
  </button>
);

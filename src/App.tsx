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
import { AutoHorizontalCarousel } from "./components/AutoHorizontalCarousel";

// Custom Components
import { NavButton } from "./components/NavButton";
import { DetailPage, SectionHeader, DetailRow } from "./components/DetailPage";
import { OverlayPage } from "./components/OverlayPage";
import { ItemCard } from "./components/ItemCard";
import { SearchBar } from "./components/SearchBar";
import MapPicker from "./components/MapPicker";
import StoreDetailPage from "./components/market/StoreDetailPage";
import EventPostCard from "./components/EventPostCard";

const AdminPanel = lazy(() =>
  import("./components/AdminPanel").then((m) => ({ default: m.AdminPanel })),
);

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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
  GovAnnouncement,
  BannerAd,
  HospitalDoctor,
  MarketStore,
  MarketProduct,
  MarketListing,
  ServiceOffer,
  TaxiDriver,
  Craftsman,
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

export const DetailsCarousel = ({ images, title }: { images: string[]; title: string }) => {
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
      <div className="relative h-64 rounded-3xl bg-slate-100 dark:bg-slate-900 mt-2 mb-6 flex items-center justify-center text-slate-400">
        <span>لا توجد صور متوفرة</span>
      </div>
    );
  }

  return (
    <div className="relative h-64 rounded-3xl overflow-hidden mt-2 mb-6 shadow-md border border-slate-100/85 dark:border-slate-800 shrink-0">
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

const defaultMarketListings: MarketListing[] = [
  {
    id: "listing-car-1",
    title: "تويوتا كورولا 2022 وارد خليجي",
    category: "سيارات",
    price: "$ 16,500",
    phone: "07700000001",
    whatsappNumber: "07700000001",
    location: "الشرقاط - الساحل الأيمن",
    description: "تويوتا كورولا موديل 2022، محرك 2000، كير اوتوماتيك، شاشة، كاميرا، بصمة، تبريد قطعتين، وارد خليجي، ماشية 35 ألف كم. مكان المعاينة الشرقاط.",
    images: [
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80"
    ],
    isActive: true,
    createdAt: Date.now() - 10000,
  },
  {
    id: "listing-real-1",
    title: "منزل للبيع مساحة 200 متر طابقين",
    category: "عقارات",
    price: "85,000,000 د.ع",
    phone: "07700000002",
    whatsappNumber: "07700000002",
    location: "الشرقاط - الحي العصري",
    description: "منزل حديث للبيع في الشرقاط - الحي العصري، طابقين، يحتوي على 4 غرف نوم، هول واسع، مطبخ مجهز، كراج سيارة، حديقة صغيرة. سند طابو صرف.",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80"
    ],
    isActive: true,
    createdAt: Date.now() - 20000,
  },
  {
    id: "listing-mobile-1",
    title: "آيفون 15 برو ماكس 256 جيجا",
    category: "موبايلات",
    price: "$ 1,150",
    phone: "07700000003",
    whatsappNumber: "07700000003",
    location: "الشرقاط - شارع الأطباء",
    description: "آيفون 15 Pro Max ذاكرة 256GB، اللون تيتانيوم طبيعي، نسبة البطارية 98%، كامل الملحقات مع الكرتونة والشاحن الأصلي، بدون أي خدش.",
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80"
    ],
    isActive: true,
    createdAt: Date.now() - 30000,
  },
  {
    id: "listing-car-2",
    title: "هيونداي النترا 2021 أبيض",
    category: "سيارات",
    price: "$ 14,200",
    phone: "07700000004",
    whatsappNumber: "07700000004",
    location: "الشرقاط - حي الشهداء",
    description: "هيونداي النترا موديل 2021، لون أبيض، بصمة، شاشة أندرويد، كشافات، حساسات خلفية، تبريد ممتاز، السيارة جاهزة للتحويل.",
    images: [
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80"
    ],
    isActive: true,
    createdAt: Date.now() - 40000,
  },
  {
    id: "listing-real-2",
    title: "قطعة أرض سكنية 300 متر واجهة 12م",
    category: "عقارات",
    price: "32,000,000 د.ع",
    phone: "07800000005",
    whatsappNumber: "07800000005",
    location: "الشرقاط - قرب المستشفى العام",
    description: "قطعة أرض سكنية ممتازة واجهة 12 متر وعمق 25 متر، تقع على الشارع العام، جميع الخدمات متوفرة (ماء، كهرباء، تبليط).",
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80"
    ],
    isActive: true,
    createdAt: Date.now() - 50000,
  },
  {
    id: "listing-mobile-2",
    title: "سامسونج S23 ألترا 512 جيجا أسود",
    category: "موبايلات",
    price: "$ 880",
    phone: "07710000006",
    whatsappNumber: "07710000006",
    location: "الشرقاط - السوق الرئيسي",
    description: "Samsung Galaxy S23 Ultra ذاكرة 512GB، رام 12GB، أسود ملكي، نظيف جداً زيرو مع القلم والشاحن الأصلي.",
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80"
    ],
    isActive: true,
    createdAt: Date.now() - 60000,
  }
];

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

const defaultCraftsmen: Craftsman[] = [
  {
    id: "craftsman-1",
    name: "أبو علي الكهربائي",
    craft: "كهربائي منازل وتأسيس",
    phone: "07700000001",
    location: "الشرقاط - المركز",
    notes: "تأسيس وصيانة كافة المجمعات السكنية والمنازل والأجهزة الكهربائية.",
    category: "الكل",
    createdAt: Date.now() - 10000,
  },
  {
    id: "craftsman-2",
    name: "الأسطة سعدون السباك",
    craft: "سباك وصيانة مجاري ومياه",
    phone: "07700000002",
    location: "الشرقاط - الساحل الأيمن",
    notes: "صيانة وتأسيس شبكات المياه والمجاري وتصفية الخزانات بأحدث الأجهزة.",
    category: "الكل",
    createdAt: Date.now() - 20000,
  },
  {
    id: "craftsman-3",
    name: "عمر فني التبريد",
    craft: "فني تبريد وتكييف (سبالت)",
    phone: "07700000003",
    location: "الشرقاط - الساحل الأيسر",
    notes: "تنظيف وغسل وشحن غاز السبالت والمكيفات وإصلاح الأعطال الميكانيكية.",
    category: "الكل",
    createdAt: Date.now() - 30000,
  },
  {
    id: "craftsman-4",
    name: "الأسطة أبو فهد الحداد",
    craft: "حداد أبواب ومظلات وخزانات",
    phone: "07700000004",
    location: "الشرقاط - حي العسكري",
    notes: "تصميم وتنفيذ كافة أنواع الأبواب والمظلات والشبابيك وسقائف السندويش بنل.",
    category: "الكل",
    createdAt: Date.now() - 40000,
  },
  {
    id: "craftsman-5",
    name: "أحمد النجار",
    craft: "نجار وديكورات وغرف نوم",
    phone: "07700000005",
    location: "الشرقاط - الشارع العام",
    notes: "شد وتفكيك غرف النوم وتعديل الأبواب وتركيب الديكورات الخشبية.",
    category: "الكل",
    createdAt: Date.now() - 50000,
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
    description: "اعثر على أطباء القضاء بمختلف الاختصاصات، واطلع على العيادات المفتوحة واحجز موعدك، أو تواصل مع كابتن تاكسي متوفر لتصل بأمان.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800",
    badge: "خدمات طبية ونقل فوري",
    icon: "🩺",
  },
  {
    title: "أفضل العروض والمطاعم المحلية",
    description: "استكشف قائمة Menu لأشهر المطاعم في الشرقاط واطلب وجبتك المفضلة، وتابع أقوى العروض والخصومات الحصرية في المحلات والأسواق.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800",
    badge: "المطاعم والعروض اليومية",
    icon: "🍕",
  },
];

// Helper for store categories classification
const getStoreClassification = (store: any): "محل" | "مطعم" | "مكتب" => {
  const name = (store.name || "").toLowerCase();
  const desc = (store.description || "").toLowerCase();
  const cat = (store.category || "").toLowerCase();
  const text = `${name} ${desc} ${cat}`;

  const foodKeywords = ["مطعم", "كافتريا", "مرطبات", "منزلي", "مأكولات", "مطاعم", "حلويات", "مطبخ", "مخبز", "أكل", "عصائر", "مشويات", "بيتزا", "كافيه", "شاورما", "فطائر", "وجبات"];
  if (store.isRestaurant || foodKeywords.some(kw => text.includes(kw))) {
    return "مطعم";
  }

  const officeKeywords = ["مكتب", "مكاتب", "شركة", "حجز", "سفريات", "طيران", "شحن", "استشارات", "محاماة", "ترجمة", "خدمات عامة", "تخليص", "عقاري", "صرافة", "تحويل"];
  if (officeKeywords.some(kw => text.includes(kw))) {
    return "مكتب";
  }

  return "محل";
};

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
        // Fetch user profile for isAdmin flag
        const profile = await firebaseService.getDocument("users", user.uid);
        if (profile) {
          setUserProfile(profile);
          setIsAdmin(true); // Since we restricted to admin email only
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

  const [splash, setSplash] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [tab, setTab] = useState<"home" | "directory" | "doctors" | "restaurants" | "offers" | "settings" | "notifications">("home");
  const [directorySubTab, setDirectorySubTab] = useState<"doctors" | "cars" | "craftsmen">("doctors");
  const [homeSubTab, setHomeSubTab] = useState<"doctors" | "cars" | "restaurants">("doctors");
  const [marketSearch, setMarketSearch] = useState("");
  const [marketCategoryFilter, setMarketCategoryFilter] = useState<string>("all");
  const [showAllStoresOverlay, setShowAllStoresOverlay] = useState(false);
  const [storeSearchText, setStoreSearchText] = useState("");
  const [subTab, setSubTab] = useState<
    | "doctors"
    | "cars"
    | "service_offers"
    | "restaurants"
    | "craftsmen"
    | null
  >(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [eventCategoryFilter, setEventCategoryFilter] = useState("الكل");

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedGovAnnouncement, setSelectedGovAnnouncement] = useState<GovAnnouncement | null>(
    null,
  );
  const [selectedServiceOffer, setSelectedServiceOffer] = useState<ServiceOffer | null>(null);
  const [selectedMarketListing, setSelectedMarketListing] = useState<MarketListing | null>(null);
  const [selectedTaxi, setSelectedTaxi] = useState<TaxiDriver | null>(null);
  const [selectedCraftsman, setSelectedCraftsman] = useState<Craftsman | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<BannerAd | null>(null);
  const [search, setSearch] = useState("");
  const [restaurantSearch, setRestaurantSearch] = useState("");
  const [stationSearch, setStationSearch] = useState("");
  const [craftsmanSearch, setCraftsmanSearch] = useState("");
  const [craftsmanCategoryFilter, setCraftsmanCategoryFilter] = useState("الكل");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sortByClosest, setSortByClosest] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [taxiSearch, setTaxiSearch] = useState("");
  const [taxiCategoryFilter, setTaxiCategoryFilter] = useState("خصوصي");
  const [restaurantCategoryFilter, setRestaurantCategoryFilter] = useState("الكل");
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalFilterCategory, setGlobalFilterCategory] =
    useState<string>("all");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [bannerIdx, setBannerIdx] = useState(0);
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
  const [craftsmen, setCraftsmen] = useState<Craftsman[]>(() => {
    try {
      const cached = localStorage.getItem("cached_craftsmen");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return defaultCraftsmen;
    } catch {
      return defaultCraftsmen;
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
  const [marketListings, setMarketListings] = useState<MarketListing[]>(() => {
    try {
      const cached = localStorage.getItem("cached_marketListings");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return defaultMarketListings;
    } catch {
      return defaultMarketListings;
    }
  });
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cached_doctors") || "[]");
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
      return JSON.parse(localStorage.getItem("cached_banners") || "[]");
    } catch {
      return [];
    }
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cached_notifications") || "[]");
    } catch {
      return [];
    }
  });
  const [reminders, setReminders] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("shirqat_reminders") || "[]");
    } catch {
      return [];
    }
  });

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("shirqat_favorite_ids") || "[]");
    } catch {
      return [];
    }
  });

  const toggleFavorite = async (id: string, type: 'doctor' | 'taxi' | 'craftsman' | 'market_listing' | 'store' | 'offer') => {
    const isFav = favoriteIds.includes(id);
    const nextFavs = isFav ? favoriteIds.filter((f) => f !== id) : [...favoriteIds, id];
    setFavoriteIds(nextFavs);
    try {
      localStorage.setItem("shirqat_favorite_ids", JSON.stringify(nextFavs));
    } catch {}

    const newShowInHome = !isFav;
    if (type === 'doctor') {
      setDoctors((prev) => prev.map((d) => d.id === id ? { ...d, showInHome: newShowInHome } : d));
      firebaseService.updateDocument('doctors', id, { showInHome: newShowInHome }).catch(() => {});
    } else if (type === 'taxi') {
      setTaxis((prev) => prev.map((t) => t.id === id ? { ...t, showInHome: newShowInHome } : t));
      firebaseService.updateDocument('taxis', id, { showInHome: newShowInHome }).catch(() => {});
    } else if (type === 'craftsman') {
      setCraftsmen((prev) => prev.map((c) => c.id === id ? { ...c, showInHome: newShowInHome } : c));
      firebaseService.updateDocument('craftsmen', id, { showInHome: newShowInHome }).catch(() => {});
    } else if (type === 'market_listing') {
      setMarketListings((prev) => prev.map((ml) => ml.id === id ? { ...ml, showInHome: newShowInHome } : ml));
      firebaseService.updateDocument('govAnnouncements', id, { showInHome: newShowInHome }).catch(() => {});
    } else if (type === 'store') {
      setMarketStores((prev) => prev.map((s) => s.id === id ? { ...s, showInHome: newShowInHome } : s));
      firebaseService.updateDocument('marketStores', id, { showInHome: newShowInHome }).catch(() => {});
    } else if (type === 'offer') {
      setServiceOffers((prev) => prev.map((so) => so.id === id ? { ...so, showInHome: newShowInHome } : so));
      firebaseService.updateDocument('serviceOffers', id, { showInHome: newShowInHome }).catch(() => {});
    }
  };

  const [marketStores, setMarketStores] = useState<MarketStore[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cached_marketStores") || "[]");
    } catch {
      return [];
    }
  });

  const dirList = useMemo(() => {
    const doctorItems = doctors.map((d) => ({
      id: d.id,
      type: 'doctor' as const,
      typeLabel: 'طبيب 🩺',
      name: d.name,
      subtitle: d.subtitle,
      image: d.image,
      showInHome: d.showInHome || favoriteIds.includes(d.id),
      original: d,
    }));

    const taxiItems = taxis.map((t) => ({
      id: t.id,
      type: 'taxi' as const,
      typeLabel: 'تكسي 🚕',
      name: t.name,
      subtitle: t.carType || t.category || 'سائق تكسي',
      image: (t as any).image,
      showInHome: t.showInHome || favoriteIds.includes(t.id),
      original: t,
    }));

    const craftsmanItems = craftsmen.map((c) => ({
      id: c.id,
      type: 'craftsman' as const,
      typeLabel: 'أسطى 🛠️',
      name: c.name,
      subtitle: c.craft || c.category || 'أسطى / حرفي',
      image: c.image,
      showInHome: c.showInHome || favoriteIds.includes(c.id),
      original: c,
    }));

    const storeItems = marketStores.map((s) => ({
      id: s.id,
      type: 'store' as const,
      typeLabel: 'متجر 🏪',
      name: s.name,
      subtitle: s.category || 'متجر',
      image: s.logoImage || s.coverImage,
      showInHome: (s as any).showInHome || (s as any).isFeatured || favoriteIds.includes(s.id),
      original: s,
    }));

    const offerItems = serviceOffers.map((so) => ({
      id: so.id,
      type: 'offer' as const,
      typeLabel: 'عرض 🏷️',
      name: so.title,
      subtitle: (so as any).category || 'عرض',
      image: so.image || (so.images && so.images[0]),
      showInHome: (so as any).showInHome || (so as any).isFeatured || favoriteIds.includes(so.id),
      original: so,
    }));

    const listingItems = marketListings.map((ml) => ({
      id: ml.id,
      type: 'market_listing' as const,
      typeLabel: ml.category === 'سيارات' ? 'سيارة 🚗' : ml.category === 'عقارات' ? 'عقار 🏠' : ml.category === 'موبايلات' ? 'موبايل 📱' : 'سوق 🛍️',
      name: ml.title,
      subtitle: ml.price || ml.category || 'سوق',
      image: ml.image || (ml.images && ml.images[0]),
      showInHome: ml.showInHome || (ml as any).isFeatured || favoriteIds.includes(ml.id),
      original: ml,
    }));

    const allItems = [...doctorItems, ...taxiItems, ...craftsmanItems, ...storeItems, ...offerItems, ...listingItems];
    const featured = allItems.filter((item) => item.showInHome);
    return featured.length > 0 ? featured : allItems.slice(0, 15);
  }, [doctors, taxis, craftsmen, marketStores, serviceOffers, marketListings, favoriteIds]);

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
    try {
      localStorage.setItem("cached_marketListings", JSON.stringify(marketListings));
    } catch (e) {}
  }, [marketListings]);

  useEffect(() => {
    try {
      localStorage.setItem("cached_doctors", JSON.stringify(doctors));
    } catch (e) {}
  }, [doctors]);

  useEffect(() => {
    try {
      localStorage.setItem("cached_taxis", JSON.stringify(taxis));
    } catch (e) {}
  }, [taxis]);

  useEffect(() => {
    try {
      localStorage.setItem("cached_craftsmen", JSON.stringify(craftsmen));
    } catch (e) {}
  }, [craftsmen]);

  useEffect(() => {
    try {
      localStorage.setItem("cached_govAnnouncements", JSON.stringify(govAnnouncements));
    } catch (e) {}
  }, [govAnnouncements]);

  useEffect(() => {
    try {
      localStorage.setItem("cached_banners", JSON.stringify(banners));
    } catch (e) {}
  }, [banners]);

  useEffect(() => {
    try {
      localStorage.setItem("cached_marketStores", JSON.stringify(marketStores));
    } catch (e) {}
  }, [marketStores]);

  useEffect(() => {
    try {
      localStorage.setItem("cached_serviceOffers", JSON.stringify(serviceOffers));
    } catch (e) {}
  }, [serviceOffers]);
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

  const activeMarketListing = useMemo(() => {
    if (!selectedMarketListing) return null;
    return marketListings.find((ml) => ml.id === selectedMarketListing.id) || selectedMarketListing;
  }, [marketListings, selectedMarketListing]);

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
        if (sortByClosest && userLocation) {
          const hasA = typeof a.lat === "number" && typeof a.lng === "number";
          const hasB = typeof b.lat === "number" && typeof b.lng === "number";
          if (hasA && hasB) {
            const distA = getDistance(userLocation.lat, userLocation.lng, a.lat!, a.lng!);
            const distB = getDistance(userLocation.lat, userLocation.lng, b.lat!, b.lng!);
            return distA - distB;
          }
          if (hasA) return -1;
          if (hasB) return 1;
        }
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
  }, [govAnnouncements, stationSearch, sortByClosest, userLocation]);

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
    localStorage.setItem("read_notification_ids", JSON.stringify(allIds));
  };

  useEffect(() => {
    if (isHoveringOffers) return;
    const interval = setInterval(() => {
      if (offersScrollRef.current) {
        const container = offersScrollRef.current;
        const maxScroll = container.scrollWidth - container.clientWidth;
        const currentScroll = Math.abs(container.scrollLeft);

        if (currentScroll >= maxScroll - 15) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: -210, behavior: "smooth" });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isHoveringOffers]);
  const [sidebarPage, setSidebarPage] = useState<
    "about" | "privacy" | "contact" | "admin" | "terms" | null
  >(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [bookingData, setBookingData] = useState({
    patientName: "",
    patientPhone: "",
  });
  const [bookingToast, setBookingToast] = useState(false);
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
    // 1) Show local cache immediately (instant loading feel without read)
    const loadFromCache = (key: string, setter: (data: any) => void) => {
      try {
        const cached = localStorage.getItem(key);
        if (cached) setter(JSON.parse(cached));
      } catch (e) { /* ignore */ }
    };
    loadFromCache('cached_doctors', setDoctors);
    loadFromCache('cached_taxis', setTaxis);
    loadFromCache('cached_craftsmen', setCraftsmen);
    loadFromCache('cached_govAnnouncements', setGovAnnouncements);
    loadFromCache('cached_banners', setBanners);
    loadFromCache('cached_marketStores', setMarketStores);
    loadFromCache('cached_marketProducts', setMarketProducts);
    loadFromCache('cached_hospitalDoctors', setHospitalDoctors);
    loadFromCache('cached_serviceOffers', setServiceOffers);
    loadFromCache('cached_marketListings', setMarketListings);

    // Load settings from cache if needed
    try {
        const cachedSettings = localStorage.getItem('cached_settings');
        if (cachedSettings) setAppSettings(JSON.parse(cachedSettings));
    } catch(e) {}

    // 2) Don't refetch from server unless it's been 10 minutes in this browser session
    const lastFetch = Number(sessionStorage.getItem('lastFullFetch') || 0);
    const TEN_MIN = 10 * 60 * 1000;
    if (Date.now() - lastFetch < TEN_MIN) {
      setLoadTracker({
        doctors: true, govAnnouncements: true, banners: true,
        marketStores: true, hospitalDoctors: true, settings: true, serviceOffers: true,
      });
      return; // Data in cache is sufficient
    }

    // 3) Actual read from server once (not a permanent listener)
    const fetchAll = async () => {
      const [doctors, taxisDocs, gov, banners, stores, products, hospDoctors, offers, settingsDocs, notificationsDocs, craftsmenDocs, marketListingsDocs] = await Promise.all([
        firebaseService.fetchCollectionOnce<Doctor>('doctors'),
        firebaseService.fetchCollectionOnce<TaxiDriver>('taxis'),
        firebaseService.fetchCollectionOnce<GovAnnouncement>('govAnnouncements'),
        firebaseService.fetchCollectionOnce<BannerAd>('banners'),
        firebaseService.fetchCollectionOnce<any>('market_stores'),
        firebaseService.fetchAllProductsOnce(),
        firebaseService.fetchCollectionOnce<HospitalDoctor>('hospital_doctors'),
        firebaseService.fetchCollectionOnce<ServiceOffer>('serviceOffers'),
        firebaseService.fetchCollectionOnce<any>('settings'),
        firebaseService.fetchCollectionOnce<Notification>('notifications'),
        firebaseService.fetchCollectionOnce<Craftsman>('craftsmen'),
        firebaseService.fetchCollectionOnce<MarketListing>('govAnnouncements'),
      ]);

      setDoctors(doctors);
      if (taxisDocs && taxisDocs.length > 0) setTaxis(taxisDocs);
      if (craftsmenDocs && craftsmenDocs.length > 0) setCraftsmen(craftsmenDocs);
      setGovAnnouncements(gov);
      setBanners(banners);
      setMarketStores(stores);
      setMarketProducts(products);
      setHospitalDoctors(hospDoctors);
      setServiceOffers(offers);
      setNotifications(notificationsDocs || []);
      if (marketListingsDocs) {
        setMarketListings(marketListingsDocs);
        localStorage.setItem('cached_marketListings', JSON.stringify(marketListingsDocs));
      }

      const config = settingsDocs.find((d) => d.id === "general");
      if (config) {
        const newSettings = {
          hospitalDirector: config.hospitalDirector,
          hospitalPhone: config.hospitalPhone,
          hospitalImage: config.hospitalImage,
        };
        setAppSettings(newSettings);
        localStorage.setItem('cached_settings', JSON.stringify(newSettings));
      }

      localStorage.setItem('cached_doctors', JSON.stringify(doctors));
      if (taxisDocs && taxisDocs.length > 0) localStorage.setItem('cached_taxis', JSON.stringify(taxisDocs));
      if (craftsmenDocs && craftsmenDocs.length > 0) localStorage.setItem('cached_craftsmen', JSON.stringify(craftsmenDocs));
      localStorage.setItem('cached_govAnnouncements', JSON.stringify(gov));
      localStorage.setItem('cached_banners', JSON.stringify(banners));
      localStorage.setItem('cached_marketStores', JSON.stringify(stores));
      localStorage.setItem('cached_marketProducts', JSON.stringify(products));
      localStorage.setItem('cached_hospitalDoctors', JSON.stringify(hospDoctors));
      localStorage.setItem('cached_serviceOffers', JSON.stringify(offers));
      localStorage.setItem('cached_notifications', JSON.stringify(notificationsDocs || []));
      if (marketListingsDocs) {
        localStorage.setItem('cached_marketListings', JSON.stringify(marketListingsDocs));
      }
      sessionStorage.setItem('lastFullFetch', String(Date.now()));

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
    | "craftsmen"
    | "banners"
    | "govAnnouncements"
    | "settings"
    | "market_stores"
    | "market_products"
    | "hospital_doctors"
    | "restaurant_orders"
    | "serviceOffers"
    | "notifications"
    | "market_listings"
  >("main");

  const [adminSelectedStore, setAdminSelectedStore] = useState<any>(null);
  const [adminMarketProducts, setAdminMarketProducts] = useState<any[]>([]);

  // Fetch Admin Market Products
  useEffect(() => {
    if (adminSelectedStore && isAdmin && adminView === "market_products") {
      firebaseService.fetchCollectionOnce<any>(`market_stores/${adminSelectedStore.id}/market_products`)
        .then(setAdminMarketProducts)
        .catch(console.error);
    } else {
      setAdminMarketProducts([]);
    }
  }, [adminSelectedStore, isAdmin, adminView]);

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

  // Handlers
  const filteredDoctors = useMemo(() => {
    return doctors
      .filter((doc) => {
        const name = String(doc.name || "").toLowerCase();
        const subtitle = String(doc.subtitle || "").toLowerCase();
        const location = String(doc.location || "").toLowerCase();
        const booking = doc.isBookingEnabled ? "حجز" : "";
        const searchStr = search.toLowerCase();
        return (
          name.includes(searchStr) ||
          subtitle.includes(searchStr) ||
          location.includes(searchStr) ||
          booking.includes(searchStr)
        );
      })
      .sort((a, b) => {
        if (a.isVerified && !b.isVerified) return -1;
        if (!a.isVerified && b.isVerified) return 1;
        const nameA = String(a.name || "");
        const nameB = String(b.name || "");
        return nameA.localeCompare(nameB, "ar");
      });
  }, [doctors, search]);


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

  const filteredTaxis = useMemo(() => {
    return taxis.filter((t) => {
      // 1. Category Filter
      if (taxiCategoryFilter !== "الكل") {
        const cat = taxiCategoryFilter;
        const matchCat = t.category === cat || t.type === cat;
        const matchText = (t.carType || "").includes(cat) || (t.notes || "").includes(cat);
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

      return (
        name.includes(q) ||
        carType.includes(q) ||
        location.includes(q) ||
        phone.includes(q) ||
        notes.includes(q)
      );
    });
  }, [taxis, taxiSearch, taxiCategoryFilter]);

  const filteredCraftsmen = useMemo(() => {
    return craftsmen.filter((c) => {
      // Search Filter
      if (!craftsmanSearch.trim()) return true;
      const q = normalizeArabic(craftsmanSearch);
      const name = normalizeArabic(String(c.name || ""));
      const craft = normalizeArabic(String(c.craft || ""));
      const location = normalizeArabic(String(c.location || ""));
      const phone = String(c.phone || "");
      const notes = normalizeArabic(String(c.notes || ""));

      return (
        name.includes(q) ||
        craft.includes(q) ||
        location.includes(q) ||
        phone.includes(q) ||
        notes.includes(q)
      );
    });
  }, [craftsmen, craftsmanSearch]);

  const resetViews = () => {
    setSubTab(null);
    setSelectedDoctor(null);
    setSelectedGovAnnouncement(null);
    setSelectedServiceOffer(null);
    setSelectedTaxi(null);
    setSelectedCraftsman(null);
    setSearch("");
    setRestaurantSearch("");
    setTaxiSearch("");
    setCraftsmanSearch("");
    setCategoryFilter("all");
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
      market_stores: "market_stores",
      hospital_doctors: "hospital_doctors",
      serviceOffers: "serviceOffers",
      taxis: "taxis",
      craftsmen: "craftsmen",
      notifications: "notifications",
      market_listings: "govAnnouncements",
    };

    let firestoreCol = collectionMapping[type];
    if (type === "market_products" && adminSelectedStore) {
      firestoreCol = `market_stores/${adminSelectedStore.id}/market_products`;
    }

    // Update local state and local cache immediately
    if (type === "taxis") {
      setTaxis((prev) => {
        const next = prev.filter((item) => item.id !== id);
        try { localStorage.setItem("cached_taxis", JSON.stringify(next)); } catch {}
        return next;
      });
    } else if (type === "craftsmen") {
      setCraftsmen((prev) => {
        const next = prev.filter((item) => item.id !== id);
        try { localStorage.setItem("cached_craftsmen", JSON.stringify(next)); } catch {}
        return next;
      });
    } else if (type === "doctors") {
      setDoctors((prev) => {
        const next = prev.filter((item) => item.id !== id);
        try { localStorage.setItem("cached_doctors", JSON.stringify(next)); } catch {}
        return next;
      });
    } else if (type === "banners") {
      setBanners((prev) => {
        const next = prev.filter((item) => item.id !== id);
        try { localStorage.setItem("cached_banners", JSON.stringify(next)); } catch {}
        return next;
      });
    } else if (type === "govAnnouncements") {
      setGovAnnouncements((prev) => {
        const next = prev.filter((item) => item.id !== id);
        try { localStorage.setItem("cached_govAnnouncements", JSON.stringify(next)); } catch {}
        return next;
      });
    } else if (type === "market_stores") {
      setMarketStores((prev) => {
        const next = prev.filter((item) => item.id !== id);
        try { localStorage.setItem("cached_marketStores", JSON.stringify(next)); } catch {}
        return next;
      });
    } else if (type === "hospital_doctors") {
      setHospitalDoctors((prev) => {
        const next = prev.filter((item) => item.id !== id);
        try { localStorage.setItem("cached_hospitalDoctors", JSON.stringify(next)); } catch {}
        return next;
      });
    } else if (type === "serviceOffers") {
      setServiceOffers((prev) => {
        const next = prev.filter((item) => item.id !== id);
        try { localStorage.setItem("cached_serviceOffers", JSON.stringify(next)); } catch {}
        return next;
      });
    } else if (type === "market_products") {
      setMarketProducts((prev) => {
        const next = prev.filter((item) => item.id !== id);
        try { localStorage.setItem("cached_marketProducts", JSON.stringify(next)); } catch {}
        return next;
      });
    } else if (type === "notifications") {
      setNotifications((prev) => {
        const next = prev.filter((item) => item.id !== id);
        try { localStorage.setItem("cached_notifications", JSON.stringify(next)); } catch {}
        return next;
      });
    } else if (type === "market_listings") {
      setMarketListings((prev) => {
        const next = prev.filter((item) => item.id !== id);
        try { localStorage.setItem("cached_marketListings", JSON.stringify(next)); } catch {}
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
          await firebaseService.incrementDocumentField(
            "market_stores",
            adminSelectedStore.id,
            "productCount",
            -1,
          );
        }
      } catch (err) {
        console.error("Firestore deletion error:", err);
      }
    }

    setConfirmDelete(null);
  };

  const saveItem = async () => {
    const isMarketProduct = adminView === "market_products";
    if (adminView === "notifications") {
      if (!formData.message || !formData.message.trim()) {
        alert("يرجى كتابة نص رسالة الإشعار");
        return;
      }
    } else if (isMarketProduct && !formData.name) {
      alert("يرجى ملء اسم المنتج");
      return;
    }
    if (
      isMarketProduct &&
      adminSelectedStore?.isRestaurant &&
      !formData.productType
    ) {
      alert("إضافة إجبارية: يرجى تحديد هل هذا (عرض خاص) أم (منيو/وجبة ثابتة).");
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
      market_stores: "market_stores",
      hospital_doctors: "hospital_doctors",
      serviceOffers: "serviceOffers",
      taxis: "taxis",
      craftsmen: "craftsmen",
      notifications: "notifications",
      market_listings: "govAnnouncements",
    };

    let firestoreCol = collectionMapping[adminView];
    if (adminView === "market_products" && adminSelectedStore) {
      firestoreCol = `market_stores/${adminSelectedStore.id}/market_products`;
    }

    if (firestoreCol) {
      const dataToSave = { ...formData };

      // Remove UI-only scratch fields if any
      delete dataToSave.menuItemName;
      delete dataToSave.menuItemPrice;
      delete dataToSave.menuItemCategory;
      delete dataToSave.menuItemImage;

      if (adminView === "market_stores") {
        if (dataToSave.image) {
          dataToSave.logoImage = dataToSave.image;
          delete dataToSave.image;
        }
        if (!isEdit) {
          dataToSave.productCount = 0;
          dataToSave.createdAt = Date.now();
        }
        dataToSave.updatedAt = Date.now();
        dataToSave.isActive = dataToSave.isActive ?? true;
        dataToSave.isFeatured = dataToSave.isFeatured ?? false;
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
        dataToSave.price = Number(dataToSave.price) || 0;
        dataToSave.isAvailable = dataToSave.isAvailable ?? true;
        dataToSave.isFeatured = dataToSave.isFeatured ?? false;
        if (!isEdit) {
          dataToSave.createdAt = Date.now();
          dataToSave.storeId = adminSelectedStore?.id;
        }
        dataToSave.updatedAt = Date.now();
      } else if (adminView === "hospital_doctors") {
        if (!isEdit) dataToSave.createdAt = Date.now();
        dataToSave.days = dataToSave.days || [];
        dataToSave.isActive = dataToSave.isActive ?? true;
        dataToSave.shift = dataToSave.shift || "صباحي";
      } else if (adminView === "serviceOffers" || adminView === "govAnnouncements" || adminView === "market_listings") {
        if (!isEdit) dataToSave.createdAt = Date.now();
        dataToSave.isActive = dataToSave.isActive ?? true;
        if (adminView === "market_listings") {
          dataToSave.name = dataToSave.title || "";
          if (dataToSave.image) {
            dataToSave.images = [dataToSave.image];
          } else {
            dataToSave.images = dataToSave.images || [];
          }
          dataToSave.tag = dataToSave.tag || dataToSave.category || "سيارات";
        } else {
          if (dataToSave.images && dataToSave.images.length > 0) {
            dataToSave.image = dataToSave.images[0];
          }
        }
      } else if (adminView === "taxis") {
        if (!isEdit) dataToSave.createdAt = Date.now();
        dataToSave.carType = dataToSave.carType || dataToSave.subtitle || "";
        dataToSave.phone = dataToSave.phone || dataToSave.phone1 || "";
        dataToSave.notes = dataToSave.notes || dataToSave.description || "";
      } else if (adminView === "craftsmen") {
        if (!isEdit) dataToSave.createdAt = Date.now();
        dataToSave.craft = dataToSave.craft || dataToSave.subtitle || "";
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
            await firebaseService.incrementDocumentField(
              "market_stores",
              adminSelectedStore.id,
              "productCount",
              1,
            );
          }
        }

        const fullSavedItem = { ...dataToSave, id: savedId };

        if (adminView === "taxis") {
          setTaxis((prev) => {
            const exists = prev.some((i) => i.id === savedId);
            const next = exists
              ? prev.map((i) => (i.id === savedId ? (fullSavedItem as TaxiDriver) : i))
              : [fullSavedItem as TaxiDriver, ...prev];
            try { localStorage.setItem("cached_taxis", JSON.stringify(next)); } catch {}
            return next;
          });
        } else if (adminView === "craftsmen") {
          setCraftsmen((prev) => {
            const exists = prev.some((i) => i.id === savedId);
            const next = exists
              ? prev.map((i) => (i.id === savedId ? (fullSavedItem as Craftsman) : i))
              : [fullSavedItem as Craftsman, ...prev];
            try { localStorage.setItem("cached_craftsmen", JSON.stringify(next)); } catch {}
            return next;
          });
        } else if (adminView === "doctors") {
          setDoctors((prev) => {
            const exists = prev.some((i) => i.id === savedId);
            const next = exists
              ? prev.map((i) => (i.id === savedId ? fullSavedItem : i))
              : [fullSavedItem, ...prev];
            try { localStorage.setItem("cached_doctors", JSON.stringify(next)); } catch {}
            return next;
          });
        } else if (adminView === "banners") {
          setBanners((prev) => {
            const exists = prev.some((i) => i.id === savedId);
            const next = exists
              ? prev.map((i) => (i.id === savedId ? fullSavedItem : i))
              : [fullSavedItem, ...prev];
            try { localStorage.setItem("cached_banners", JSON.stringify(next)); } catch {}
            return next;
          });
        } else if (adminView === "govAnnouncements") {
          setGovAnnouncements((prev) => {
            const exists = prev.some((i) => i.id === savedId);
            const next = exists
              ? prev.map((i) => (i.id === savedId ? fullSavedItem : i))
              : [fullSavedItem, ...prev];
            try { localStorage.setItem("cached_govAnnouncements", JSON.stringify(next)); } catch {}
            return next;
          });
        } else if (adminView === "market_stores") {
          setMarketStores((prev) => {
            const exists = prev.some((i) => i.id === savedId);
            const next = exists
              ? prev.map((i) => (i.id === savedId ? fullSavedItem : i))
              : [fullSavedItem, ...prev];
            try { localStorage.setItem("cached_marketStores", JSON.stringify(next)); } catch {}
            return next;
          });
        } else if (adminView === "hospital_doctors") {
          setHospitalDoctors((prev) => {
            const exists = prev.some((i) => i.id === savedId);
            const next = exists
              ? prev.map((i) => (i.id === savedId ? fullSavedItem : i))
              : [fullSavedItem, ...prev];
            try { localStorage.setItem("cached_hospitalDoctors", JSON.stringify(next)); } catch {}
            return next;
          });
        } else if (adminView === "serviceOffers") {
          setServiceOffers((prev) => {
            const exists = prev.some((i) => i.id === savedId);
            const next = exists
              ? prev.map((i) => (i.id === savedId ? fullSavedItem : i))
              : [fullSavedItem, ...prev];
            try { localStorage.setItem("cached_serviceOffers", JSON.stringify(next)); } catch {}
            return next;
          });
        } else if (adminView === "market_products") {
          setMarketProducts((prev) => {
            const exists = prev.some((i) => i.id === savedId);
            const next = exists
              ? prev.map((i) => (i.id === savedId ? fullSavedItem : i))
              : [fullSavedItem, ...prev];
            try { localStorage.setItem("cached_marketProducts", JSON.stringify(next)); } catch {}
            return next;
          });
        } else if (adminView === "notifications") {
          setNotifications((prev) => {
            const exists = prev.some((i) => i.id === savedId);
            const next = exists
              ? prev.map((i) => (i.id === savedId ? (fullSavedItem as Notification) : i))
              : [fullSavedItem as Notification, ...prev];
            try { localStorage.setItem("cached_notifications", JSON.stringify(next)); } catch {}
            return next;
          });
        } else if (adminView === "market_listings") {
          setMarketListings((prev) => {
            const exists = prev.some((i) => i.id === savedId);
            const next = exists
              ? prev.map((i) => (i.id === savedId ? (fullSavedItem as MarketListing) : i))
              : [fullSavedItem as MarketListing, ...prev];
            try { localStorage.setItem("cached_marketListings", JSON.stringify(next)); } catch {}
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
    if (adminView === "craftsmen") defaults.craft = "";
    if (adminView === "market_stores") {
      defaults.isRestaurant = true;
      defaults.category = "مطاعم";
    }
    if (adminView === "market_listings") {
      defaults.category = "سيارات";
      defaults.showInHome = false;
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

    const filteredMarketListings = marketListings.filter((ml) => {
      if (ml.isActive === false) return false;
      if (!ml.title || ml.title.trim() === "") return false;
      const q = restaurantSearch.toLowerCase().trim();
      const matchesQuery = !q ||
        ml.title.toLowerCase().includes(q) ||
        (ml.description && ml.description.toLowerCase().includes(q)) ||
        (ml.location && ml.location.toLowerCase().includes(q)) ||
        (ml.price && ml.price.toLowerCase().includes(q));

      if (!matchesQuery) return false;

      if (marketCategoryFilter === "all") return true;
      return ml.category === marketCategoryFilter;
    });

    return (
      <div className="space-y-4 pt-3 pb-20 animate-in fade-in duration-500">
        {/* Sticky Header */}
        <div
          className="sticky top-0 z-50 flex items-center justify-center px-4 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-shirqat-primary/10 shadow-xs relative overflow-hidden"
          dir="rtl"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-l from-shirqat-primary/80 via-shirqat-primary to-shirqat-primary/30" />

          {/* Back Button for subTab view */}
          {subTab !== null && (
            <button
              onClick={() => setSubTab(null)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-white transition-all cursor-pointer active:scale-95"
              title="رجوع"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* App Branding */}
          <div className="flex items-center gap-2 justify-center">
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
          </div>
        </div>

        {subTab === null ? (
          <>
            {/* Banner Carousel */}
            {allBanners.length > 0 && (
              <div className="px-3">
                <div className="relative w-full aspect-[82/50] max-h-[450px] overflow-hidden rounded-[2rem] shadow-lg group">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={currentBanner?.id}
                      initial={{ x: "100%", opacity: 1 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: "-100%", opacity: 1 }}
                      transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                      onClick={() => {
                        if (!currentBanner) return;
                        if ((currentBanner as any).isDynamic) return;
                        setBanners((prev) =>
                          prev.map((b) =>
                            b.id === currentBanner.id
                              ? { ...b, clicks: (b.clicks || 0) + 1 }
                              : b,
                          ),
                        );
                        if (currentBanner.type === "text")
                          setSelectedBanner(currentBanner);
                        if (
                          currentBanner.type === "internal" &&
                          (currentBanner.targetId || currentBanner.targetType === "hospital")
                        ) {
                          if (currentBanner.targetType === "doctor") {
                            const doc = doctors.find((d) => d.id === currentBanner.targetId);
                            if (doc) {
                              setSubTab("doctors");
                              setSelectedDoctor(doc);
                            }
                          } else if (currentBanner.targetType === "restaurant") {
                            const store = marketStores.find((s) => s.id === currentBanner.targetId);
                            if (store) {
                              setSelectedStoreId(store.id);
                            }
                          } else if (currentBanner.targetType === "govAnnouncement") {
                            const gov = govAnnouncements.find((g) => g.id === currentBanner.targetId);
                            if (gov) {
                              setSelectedGovAnnouncement(gov);
                            }
                          }
                        }
                      }}
                      className={`absolute inset-0 w-full h-full ${(currentBanner as any).isDynamic ? "" : "cursor-pointer"}`}
                    >
                      {currentBanner?.image ? (
                        <img
                          src={currentBanner?.image}
                          className="w-full h-full object-cover"
                          alt=""
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-shirqat-primary to-emerald-700" />
                      )}

                      <div
                        className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px] flex flex-col p-5 text-right"
                        dir="rtl"
                      >
                        <div className="flex items-center justify-start gap-3 mb-4">
                          <h3 className="text-base font-display font-black text-white">
                            {currentBanner?.title}
                          </h3>
                        </div>

                        {!(currentBanner as any).isDynamic && (
                          <div className="mt-auto">
                            <p className="text-xs font-bold text-white/90 line-clamp-2">
                              {currentBanner?.content}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <div className="absolute bottom-3 left-5 flex gap-1.5 bg-black/20 backdrop-blur-md p-1.5 rounded-full">
                    {allBanners.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setBannerIdx(i)}
                        className={`h-1.5 transition-all duration-300 rounded-full ${i === bannerIdx % allBanners.length ? "w-5 bg-white" : "w-1.5 bg-white/40"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* أقسام التطبيق الرئيسية (أيقونات الأقسام في أعلى الصفحة) */}
            <div className="px-3 pt-0.5" dir="rtl">
              <div className="grid grid-cols-3 gap-2">
                {/* 1. المتاجر والمطاعم */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setTab("restaurants");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl px-2 py-2.5 flex flex-row items-center justify-center gap-1.5 shadow-xs hover:shadow-md hover:border-emerald-200 dark:hover:border-slate-700 transition-all cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                    <ShoppingBag size={15} className="stroke-[2.5]" />
                  </div>
                  <span className="text-[11px] font-black text-slate-800 dark:text-white leading-tight truncate">
                    المتاجر
                  </span>
                </motion.button>

                {/* 2. الدليل والخدمات */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setTab("directory");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl px-2 py-2.5 flex flex-row items-center justify-center gap-1.5 shadow-xs hover:shadow-md hover:border-emerald-200 dark:hover:border-slate-700 transition-all cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                    <BookOpen size={15} className="stroke-[2.5]" />
                  </div>
                  <span className="text-[11px] font-black text-slate-800 dark:text-white leading-tight truncate">
                    الدليل
                  </span>
                </motion.button>

                {/* 3. العروض */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setTab("offers");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl px-2 py-2.5 flex flex-row items-center justify-center gap-1.5 shadow-xs hover:shadow-md hover:border-emerald-200 dark:hover:border-slate-700 transition-all cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                    <Tag size={15} className="stroke-[2.5]" />
                  </div>
                  <span className="text-[11px] font-black text-slate-800 dark:text-white leading-tight truncate">
                    العروض
                  </span>
                </motion.button>
              </div>
            </div>

            <div className="px-3">
              <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-slate-200/80 dark:via-slate-700/60 to-transparent my-0.5" />
            </div>

            {/* البطاقات المميزة Section (إطار مخصص للهوية البصرية بدون عنوان) */}
            <div className="px-3" dir="rtl">
              <div className="p-2 sm:p-2.5 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 dark:from-emerald-950/40 dark:via-slate-800/80 dark:to-emerald-950/30 border border-emerald-500/20 dark:border-emerald-500/30 rounded-3xl shadow-xs relative overflow-hidden">
                {dirList.length === 0 ? (
                  <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 text-center text-xs text-slate-400 font-bold border border-slate-100 dark:border-slate-800">
                    لا توجد بطاقات مميزة حالياً
                  </div>
                ) : (
                  <AutoHorizontalCarousel
                    items={dirList}
                    intervalMs={3000}
                    renderItem={(item) => (
                      <div
                        onClick={() => {
                          if (item.type === 'doctor') setSelectedDoctor(item.original);
                          else if (item.type === 'taxi') setSelectedTaxi(item.original);
                          else if (item.type === 'craftsman') setSelectedCraftsman(item.original);
                          else if (item.type === 'store') setSelectedStoreId(item.id);
                          else if (item.type === 'offer') setSelectedServiceOffer(item.original);
                          else if (item.type === 'market_listing') setSelectedMarketListing(item.original);
                        }}
                        className="w-[105px] sm:w-[115px] h-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-1.5 flex flex-col items-center justify-between cursor-pointer group shadow-xs hover:shadow-md transition-all active:scale-95 relative"
                      >
                        <span className="absolute top-1 right-1 text-[7px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 z-10">
                          {item.typeLabel}
                        </span>
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden border-2 border-emerald-500/20 group-hover:border-emerald-500 flex items-center justify-center mt-2.5 mb-0.5 shrink-0 shadow-xs transition-all relative">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="text-emerald-500">
                              {item.type === 'doctor' ? <Stethoscope size={20} /> : item.type === 'taxi' ? <Car size={20} /> : item.type === 'craftsman' ? <Wrench size={20} /> : <ShoppingBag size={20} />}
                            </div>
                          )}
                        </div>
                        <h4 className="font-display font-bold text-[9px] sm:text-[10px] text-slate-800 dark:text-white line-clamp-2 text-center w-full leading-tight my-auto">
                          {item.name}
                        </h4>
                      </div>
                    )}
                  />
                )}
              </div>
            </div>

            {/* سوق الشرقاط المفتوح Section */}
            <div className="px-3 space-y-3" dir="rtl">
              {/* Category Tab Bar (الكل | سيارات | عقارات | موبايلات) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar" dir="rtl">
                {[
                  { id: "all", label: "الكل", icon: <LayoutGrid size={14} /> },
                  { id: "سيارات", label: "سيارات", icon: <Car size={14} /> },
                  { id: "عقارات", label: "عقارات", icon: <Home size={14} /> },
                  { id: "موبايلات", label: "موبايلات", icon: <Smartphone size={14} /> },
                ].map((item) => {
                  const isActive = marketCategoryFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setMarketCategoryFilter(item.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-105"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Grid Display for Market */}
              {filteredMarketListings.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400 font-bold border border-slate-100 dark:border-slate-800">
                  لا توجد عناصر حالياً في هذا القسم
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pb-6">
                  {filteredMarketListings.map((item, i) => (
                    <motion.div
                      key={item.id}
                      onClick={() => setSelectedMarketListing(item)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-2 flex flex-col justify-between cursor-pointer group shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden relative"
                    >
                      <div>
                        {/* Image Container */}
                        <div className="relative mb-2 w-full overflow-hidden rounded-xl">
                          <AnimatedCardImages
                            images={item.images}
                            fallbackImage={item.image}
                            title={item.title}
                            heightClass="h-28 sm:h-32"
                            roundedClass="rounded-xl"
                          />
                        </div>

                        {/* Title */}
                        <h4 className="font-display font-semibold text-xs text-slate-800 dark:text-white line-clamp-2 text-right mb-2 min-h-[32px] leading-snug">
                          {item.title}
                        </h4>
                      </div>

                      {/* Bottom section with price and details */}
                      <div className="border-t border-slate-100 dark:border-slate-700/50 pt-2 mt-0.5 flex items-center justify-between w-full">
                        {/* Price Badge */}
                        {item.price ? (
                          <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-lg font-black">
                            {item.price}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 text-[9px] font-bold">غير محدد</span>
                        )}

                        {/* View Details Link */}
                        <div className="flex items-center gap-0.5 text-slate-400 dark:text-slate-500 font-bold text-[11px] transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          <span className="transition-transform group-hover:-translate-x-0.5 duration-300">←</span>
                          <span>التفاصيل</span>
                        </div>
                      </div>
                    </motion.div>
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
                    <div className="grid grid-cols-1 gap-3">
                      {filteredDoctors.map((d, i) => (
                        <motion.div
                          key={d.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                        >
                          <ItemCard
                            item={{
                              id: d.id,
                              name: d.name,
                              subtitle: d.subtitle,
                              image: d.image,
                            }}
                            icon={<Stethoscope />}
                            color="emerald"
                            onClick={() => setSelectedDoctor(d)}
                          />
                        </motion.div>
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
                                {t.location && (
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold truncate max-w-[100px]" title={t.location}>
                                    📍 {t.location}
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
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base">🔍</span>
                    <input
                      type="text"
                      placeholder="أبحث عن متجر، مطعم، كوافير، محل..."
                      value={restaurantSearch}
                      onChange={e => setRestaurantSearch(e.target.value)}
                      className="w-full h-12 pr-11 pl-10 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs text-right"
                    />
                    {restaurantSearch && (
                      <button
                        onClick={() => setRestaurantSearch('')}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Market Categories Bar */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {["الكل", "مأكولات", "متاجر", "نسائي"].map((cat) => {
                      const isActive = restaurantCategoryFilter === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setRestaurantCategoryFilter(cat)}
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
                        <div key={i} className="w-full bg-white dark:bg-slate-800 rounded-3xl p-4 flex gap-4 items-center border border-slate-100 dark:border-slate-800 animate-pulse">
                          <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                          <div className="flex-1 space-y-3">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-1/3" />
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-2/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (() => {
                    const filteredMarketStores = marketStores.filter((s) => {
                      if (!s.isActive) return false;

                      // Category Filter Match
                      let matchesCategory = true;
                      if (restaurantCategoryFilter !== "الكل") {
                        matchesCategory = getStoreClassification(s) === restaurantCategoryFilter;
                      }

                      // Search text filter
                      const q = restaurantSearch.toLowerCase().trim();
                      const matchesSearch = !q || 
                        s.name.toLowerCase().includes(q) ||
                        (s.description && s.description.toLowerCase().includes(q)) ||
                        (s.location && s.location.toLowerCase().includes(q));

                      return matchesCategory && matchesSearch;
                    });

                    if (filteredMarketStores.length === 0) {
                      return (
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400 font-bold border border-slate-100 dark:border-slate-800">
                          لا توجد نتائج مطابقة لتصنيف {restaurantCategoryFilter} في السوق
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
                            className="w-full bg-white dark:bg-slate-800 rounded-3xl p-3 flex gap-3.5 items-center border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900/40 hover:shadow-md transition-all duration-200 cursor-pointer"
                            dir="rtl"
                          >
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-700/50 overflow-hidden shrink-0 flex items-center justify-center relative border border-slate-100 dark:border-slate-700">
                              {store.logoImage ? (
                                <img
                                  src={store.logoImage}
                                  className="w-full h-full object-cover"
                                  alt={store.name}
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <ShoppingBag size={26} className="text-emerald-500/80" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-center text-right">
                              <h3 className="font-display font-black text-sm text-slate-800 dark:text-white truncate">
                                {store.name}
                              </h3>
                              <div className="flex items-center gap-1.5 mt-1">
                                {store.location && (
                                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                                    <span>📍</span>
                                    <span className="truncate">{store.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <ChevronLeft size={18} className="text-slate-300 dark:text-slate-655 shrink-0" />
                          </motion.div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {subTab === "craftsmen" && (
                <div className="space-y-4 animate-in fade-in duration-300" dir="rtl">
                  <SearchBar
                    value={craftsmanSearch}
                    onChange={setCraftsmanSearch}
                    placeholder="أبحث عن اسم الأسطى أو المهنة..."
                    focusRingClass="focus:ring-emerald-500/20"
                  />

                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  ) : filteredCraftsmen.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400 font-bold border border-slate-100 dark:border-slate-800">
                      لا يوجد أسطوات مطبقين للبحث
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {filteredCraftsmen.map((c, i) => (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedCraftsman(c)}
                          className="w-full bg-white dark:bg-slate-800 rounded-3xl p-3 flex items-center justify-between gap-4 border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900/40 hover:shadow-md transition-all duration-200 cursor-pointer group text-right relative overflow-hidden"
                          dir="rtl"
                        >
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 group-hover:translate-x-[-2px] transition-transform">
                              التفاصيل
                            </span>
                            <ChevronLeft size={18} className="text-emerald-500 shrink-0" />
                          </div>

                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="flex-1 min-w-0 text-right">
                              <h3 className="font-display font-black text-sm text-slate-800 dark:text-white truncate">
                                {c.name}
                              </h3>
                              <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                                <span>🛠️</span>
                                <span className="truncate">
                                  {c.craft || c.category || "أسطى / فني"}
                                </span>
                              </div>
                            </div>

                            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-700/50 overflow-hidden shrink-0 flex items-center justify-center relative border border-slate-100 dark:border-slate-700">
                              {c.image ? (
                                <img
                                  src={c.image}
                                  className="w-full h-full object-cover"
                                  alt={c.name}
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <Wrench size={26} className="text-emerald-500/80" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {subTab === "service_offers" && renderServiceOffersContent()}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDirectoryTab = () => {
    return (
      <div className="space-y-4 pt-3 pb-20 px-3 animate-in fade-in duration-500 font-sans" dir="rtl">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 -mx-3 px-4 mb-2 shadow-xs space-y-3">
          <div className="flex justify-between items-center gap-3">
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
                <BookOpen size={18} />
              </div>
              <span className="font-display font-black text-sm sm:text-base text-slate-800 dark:text-white whitespace-nowrap">
                دليل الشرقاط
              </span>
            </div>

            <div className="w-10 h-10" />
          </div>

          {/* Directory Sub-Tabs Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setDirectorySubTab("doctors")}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                directorySubTab === "doctors"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Stethoscope size={15} />
              <span>الأطباء</span>
            </button>
            <button
              onClick={() => setDirectorySubTab("cars")}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                directorySubTab === "cars"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Car size={15} />
              <span>التكسي</span>
            </button>
            <button
              onClick={() => setDirectorySubTab("craftsmen")}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                directorySubTab === "craftsmen"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Wrench size={15} />
              <span>الأسطوات</span>
            </button>
          </div>
        </div>

        {/* Directory Sub-Tab Content */}
        {directorySubTab === "doctors" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="ابحث عن طبيب أو عيادة أو تخصص..."
              focusRingClass="focus:ring-emerald-500/20"
            />

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400 font-bold border border-slate-100 dark:border-slate-800">
                لا يوجد أطباء مطابقين للبحث
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDoctors.map((d, i) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedDoctor(d)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white dark:bg-slate-800 rounded-3xl p-3 flex gap-3.5 items-center border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900/40 hover:shadow-md transition-all duration-200 cursor-pointer"
                    dir="rtl"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-700/50 overflow-hidden shrink-0 flex items-center justify-center relative border border-slate-100 dark:border-slate-700">
                      {d.image ? (
                        <img
                          src={d.image}
                          className="w-full h-full object-cover"
                          alt={d.name}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Stethoscope size={26} className="text-emerald-500/80" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center text-right">
                      <h3 className="font-display font-black text-sm text-slate-800 dark:text-white truncate">
                        {d.name}
                      </h3>
                      {d.subtitle && (
                        <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                          <span>👨‍⚕️</span>
                          <span className="truncate">{d.subtitle}</span>
                        </div>
                      )}
                    </div>

                    <ChevronLeft size={18} className="text-slate-300 dark:text-slate-600 shrink-0" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {directorySubTab === "cars" && (
          <div className="space-y-4 animate-in fade-in duration-300" dir="rtl">
            <SearchBar
              value={taxiSearch}
              onChange={setTaxiSearch}
              placeholder="أبحث عن سائق التكسي..."
              focusRingClass="focus:ring-emerald-500/20"
            />

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
                  <div key={i} className="w-full bg-white dark:bg-slate-800 rounded-3xl p-4 flex gap-4 items-center border border-slate-100 dark:border-slate-800 animate-pulse">
                    <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-1/3" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTaxis.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400 font-bold border border-slate-100 dark:border-slate-800">
                لا توجد نتائج مطابقة لتصنيف {taxiCategoryFilter}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTaxis.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedTaxi(t)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white dark:bg-slate-800 rounded-3xl p-3 flex gap-3.5 items-center border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900/40 hover:shadow-md transition-all duration-200 cursor-pointer"
                    dir="rtl"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-700/50 overflow-hidden shrink-0 flex items-center justify-center relative border border-slate-100 dark:border-slate-700">
                      {t.image ? (
                        <img
                          src={t.image}
                          className="w-full h-full object-cover"
                          alt={t.name}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Car size={26} className="text-emerald-500/80" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center text-right">
                      <h3 className="font-display font-black text-sm text-slate-800 dark:text-white truncate">
                        {t.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                        <span>🚕</span>
                        <span className="truncate">
                          {t.carType || t.category || "تكسي"}
                        </span>
                      </div>
                    </div>

                    <ChevronLeft size={18} className="text-slate-300 dark:text-slate-600 shrink-0" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {directorySubTab === "craftsmen" && (
          <div className="space-y-4 animate-in fade-in duration-300" dir="rtl">
            <SearchBar
              value={craftsmanSearch}
              onChange={setCraftsmanSearch}
              placeholder="أبحث عن اسم الأسطى أو المهنة..."
              focusRingClass="focus:ring-emerald-500/20"
            />

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-full bg-white dark:bg-slate-800 rounded-3xl p-4 flex gap-4 items-center border border-slate-100 dark:border-slate-800 animate-pulse">
                    <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-1/3" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCraftsmen.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400 font-bold border border-slate-100 dark:border-slate-800">
                لا يوجد أسطوات مطبقين للبحث
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCraftsmen.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedCraftsman(c)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white dark:bg-slate-800 rounded-3xl p-3 flex gap-3.5 items-center border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900/40 hover:shadow-md transition-all duration-200 cursor-pointer"
                    dir="rtl"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-700/50 overflow-hidden shrink-0 flex items-center justify-center relative border border-slate-100 dark:border-slate-700">
                      {c.image ? (
                        <img
                          src={c.image}
                          className="w-full h-full object-cover"
                          alt={c.name}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Wrench size={26} className="text-emerald-500/80" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center text-right">
                      <h3 className="font-display font-black text-sm text-slate-800 dark:text-white truncate">
                        {c.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                        <span>🛠️</span>
                        <span className="truncate">
                          {c.craft || c.category || "أسطى / فني"}
                        </span>
                      </div>
                    </div>

                    <ChevronLeft size={18} className="text-slate-300 dark:text-slate-600 shrink-0" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderRestaurantsTab = () => {
    const activeStores = marketStores.filter((s) => s.isActive !== false && s.name && s.name.trim() !== "");

    return (
      <div className="space-y-4 pt-3 pb-20 px-3 animate-in fade-in duration-300 font-sans text-right" dir="rtl">
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
              <ShoppingBag size={18} />
            </div>
            <span className="font-display font-black text-sm sm:text-base text-slate-800 dark:text-white whitespace-nowrap">
              المتاجر والمطاعم
            </span>
          </div>

          <div className="w-10 h-10" />
        </div>

        {/* Search Input for Stores */}
        <div className="relative">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base">🔍</span>
          <input
            type="text"
            placeholder="أبحث عن متجر أو محل..."
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

        {/* Category Tab Bar (الكل | محل | مطعم | مكتب) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar" dir="rtl">
          {[
            { id: "الكل", label: "الكل", icon: <LayoutGrid size={14} /> },
            { id: "محل", label: "محل", icon: <ShoppingBag size={14} /> },
            { id: "مطعم", label: "مطعم", icon: <Utensils size={14} /> },
            { id: "مكتب", label: "مكتب", icon: <Briefcase size={14} /> },
          ].map((tab) => {
            const isActive = restaurantCategoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setRestaurantCategoryFilter(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-105"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* List of Stores */}
        {activeStores.filter((s) => {
          const q = storeSearchText.toLowerCase().trim();
          const matchesSearch = !q ||
            s.name.toLowerCase().includes(q) ||
            (s.description && s.description.toLowerCase().includes(q)) ||
            (s.category && s.category.toLowerCase().includes(q));

          if (!matchesSearch) return false;
          if (restaurantCategoryFilter !== "الكل") {
            return getStoreClassification(s) === restaurantCategoryFilter;
          }
          return true;
        }).length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400 font-bold border border-slate-100 dark:border-slate-800">
            لا توجد محلات أو متاجر مطابقة
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-8">
            {activeStores.filter((s) => {
              const q = storeSearchText.toLowerCase().trim();
              const matchesSearch = !q ||
                s.name.toLowerCase().includes(q) ||
                (s.description && s.description.toLowerCase().includes(q)) ||
                (s.category && s.category.toLowerCase().includes(q));

              if (!matchesSearch) return false;
              if (restaurantCategoryFilter !== "الكل") {
                return getStoreClassification(s) === restaurantCategoryFilter;
              }
              return true;
            }).map((store) => (
              <motion.div
                key={store.id}
                onClick={() => {
                  setSelectedStoreId(store.id);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="bg-white dark:bg-slate-800 rounded-3xl p-3 flex flex-col justify-between border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
              >
                <div className="w-full h-28 rounded-2xl bg-slate-50 dark:bg-slate-700/50 overflow-hidden flex items-center justify-center relative border border-slate-100 dark:border-slate-700/60 mb-2.5">
                  {store.logoImage || store.coverImage ? (
                    <img
                      src={store.logoImage || store.coverImage}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      alt={store.name}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <ShoppingBag size={32} className="text-emerald-500/80" />
                  )}
                </div>
                <h4 className="font-display font-black text-xs text-slate-800 dark:text-white line-clamp-1 text-center leading-tight">
                  {store.name}
                </h4>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 text-center truncate mt-0.5">
                  {store.category || "متجر"}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderOffersTab = () => {
    return (
      <div className="space-y-4 pt-3 pb-20 px-3 animate-in fade-in duration-500 font-sans" dir="rtl">
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
              <Tag size={18} />
            </div>
            <span className="font-display font-black text-sm sm:text-base text-slate-800 dark:text-white whitespace-nowrap">
              عروض الشرقاط
            </span>
          </div>

          <div className="w-10 h-10" />
        </div>

        {renderServiceOffersContent(false)}
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
              <EventPostCard
                key={c.id}
                item={c}
                onClick={() => setSelectedGovAnnouncement(c)}
              />
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
                            localStorage.setItem("read_notification_ids", JSON.stringify(newRead));
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

  const showBottomBar =
    !splash &&
    !selectedDoctor &&
    !selectedTaxi &&
    !selectedCraftsman &&
    !selectedGovAnnouncement &&
    !selectedBanner &&
    !selectedStoreId &&
    (!sidebarPage || sidebarPage === null);

  return (
    <div
      className="min-h-screen font-sans bg-slate-50 text-slate-800"
      dir="rtl"
    >


      <div className="max-w-lg mx-auto pb-24">
        {selectedStoreId && marketStores.find((s) => s.id === selectedStoreId) ? (
          <StoreDetailPage
            store={marketStores.find((s) => s.id === selectedStoreId)!}
            activeOrders={activeOrders}
            onBack={() => setSelectedStoreId(null)}
          />
        ) : (
          <>
            {tab === "home" && renderHome()}
            {(tab === "directory" || tab === "doctors") && renderDirectoryTab()}
            {tab === "restaurants" && renderRestaurantsTab()}
            {tab === "offers" && renderOffersTab()}
            {tab === "notifications" && renderNotificationsTab()}
            {tab === "settings" && renderSettingsTab()}
          </>
        )}
      </div>


      <AnimatePresence>
        {selectedDoctor && activeDoctor && (
          <DetailPage
            title={activeDoctor.name}
            subtitle={undefined}
            icon={<Stethoscope className="text-emerald-500" size={56} />}
            onBack={() => setSelectedDoctor(null)}
            image={activeDoctor.image}
            isVerified={false}
            headerAction={
              <button
                type="button"
                onClick={() => toggleFavorite(activeDoctor.id, 'doctor')}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-950/40 text-amber-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={activeDoctor.showInHome || favoriteIds.includes(activeDoctor.id) ? "إزالة من دليل الشرقاط" : "إضافة إلى دليل الشرقاط"}
              >
                <Star size={18} className={activeDoctor.showInHome || favoriteIds.includes(activeDoctor.id) ? "fill-amber-500 text-amber-500" : "text-slate-400"} />
              </button>
            }
          >
            <div className="space-y-3.5 font-sans" dir="rtl">
              {/* 1. التخصص */}
              {activeDoctor.subtitle && (
                <DetailRow
                  icon={<Stethoscope className="text-emerald-500" />}
                  label="التخصص الطبي"
                  value={activeDoctor.subtitle}
                />
              )}

              {/* 2. رقم الهاتف */}
              <DetailRow
                icon={<Phone className="text-emerald-500" />}
                label="رقم الهاتف"
                value={activeDoctor.phone1}
                actionIcon={<Phone size={14} />}
                onAction={() => window.open(`tel:${activeDoctor.phone1}`)}
              />
              {activeDoctor.phone2 && (
                <DetailRow
                  icon={<Phone className="text-emerald-500" />}
                  label="رقم ثانوي"
                  value={activeDoctor.phone2}
                  actionIcon={<Phone size={14} />}
                  onAction={() => window.open(`tel:${activeDoctor.phone2}`)}
                />
              )}

              {/* 3. الموقع */}
              <DetailRow
                icon={<MapPin className="text-emerald-500" />}
                label="الموقع"
                value={activeDoctor.location}
              />

              {/* 4. التفاصيل */}
              {activeDoctor.description && (
                <div className="flex items-start gap-3.5 p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 rounded-2xl text-right">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                     <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mb-1 uppercase tracking-wider">
                      التفاصيل
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {activeDoctor.description}
                    </span>
                  </div>
                </div>
              )}

              {/* 5. الحجز الإلكتروني */}
              {activeDoctor.isBookingEnabled && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-dashed border-shirqat-primary/30 text-center col-span-full">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                    خدمة الحجز الإلكتروني
                  </p>
                  <button
                    onClick={() => setBookingDoctor(activeDoctor)}
                    className="w-full h-14 bg-shirqat-primary text-white rounded-2xl font-black shadow-lg shadow-shirqat-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar size={20} /> احجز موعدك الآن
                  </button>
                </div>
              )}

              {/* 6. الموقع الجغرافي الخريطة */}
              {activeDoctor.lat && activeDoctor.lng && (
                <div
                  className="bg-slate-50 dark:bg-slate-850 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col gap-3 shadow-sm text-right"
                  dir="rtl"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <MapPin size={16} className="text-emerald-500" />
                      الموقع الجغرافي الدقيق 📍
                    </span>
                    <button
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${activeDoctor.lat},${activeDoctor.lng}`,
                          "_blank",
                        )
                      }
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                    >
                      عرض المسار 🚗
                    </button>
                  </div>

                  <MapPicker
                    lat={activeDoctor.lat}
                    lng={activeDoctor.lng}
                    readOnly={true}
                    color="#10b981"
                    height="240px"
                  />
                </div>
              )}

            </div>
          </DetailPage>
        )}

        {selectedTaxi && (
          <DetailPage
            title={selectedTaxi.name}
            subtitle={undefined}
            icon={<Car size={56} />}
            onBack={() => setSelectedTaxi(null)}
            image={selectedTaxi.image}
            isVerified={false}
            headerAction={
              <button
                type="button"
                onClick={() => toggleFavorite(selectedTaxi.id, 'taxi')}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-950/40 text-amber-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={selectedTaxi.showInHome || favoriteIds.includes(selectedTaxi.id) ? "إزالة من دليل الشرقاط" : "إضافة إلى دليل الشرقاط"}
              >
                <Star size={18} className={selectedTaxi.showInHome || favoriteIds.includes(selectedTaxi.id) ? "fill-amber-500 text-amber-500" : "text-slate-400"} />
              </button>
            }
          >
            <div className="space-y-3.5 font-sans" dir="rtl">
              {/* 1. نوع السيارة */}
              {selectedTaxi.carType && (
                <DetailRow
                  icon={<Car className="text-emerald-500" />}
                  label="نوع السيارة"
                  value={selectedTaxi.carType}
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
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mb-1 uppercase tracking-wider">
                      التفاصيل
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

        {selectedCraftsman && (
          <DetailPage
            title={selectedCraftsman.name}
            subtitle={selectedCraftsman.craft}
            icon={<Wrench size={56} />}
            onBack={() => setSelectedCraftsman(null)}
            image={selectedCraftsman.image}
            isVerified={false}
            headerAction={
              <button
                type="button"
                onClick={() => toggleFavorite(selectedCraftsman.id, 'craftsman')}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-950/40 text-amber-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={selectedCraftsman.showInHome || favoriteIds.includes(selectedCraftsman.id) ? "إزالة من دليل الشرقاط" : "إضافة إلى دليل الشرقاط"}
              >
                <Star size={18} className={selectedCraftsman.showInHome || favoriteIds.includes(selectedCraftsman.id) ? "fill-amber-500 text-amber-500" : "text-slate-400"} />
              </button>
            }
          >
            <div className="space-y-3.5 font-sans" dir="rtl">
              {/* 1. المهنة والتخصص */}
              {selectedCraftsman.craft && (
                <DetailRow
                  icon={<Wrench className="text-emerald-500" />}
                  label="المهنة والتخصص"
                  value={selectedCraftsman.craft}
                />
              )}

              {/* 2. رقم الهاتف */}
              {selectedCraftsman.phone && (
                <DetailRow
                  icon={<Phone className="text-emerald-500" />}
                  label="رقم الهاتف"
                  value={selectedCraftsman.phone}
                  actionIcon={<Phone size={14} />}
                  onAction={() => window.open(`tel:${selectedCraftsman.phone}`)}
                />
              )}

              {/* 3. المنطقة */}
              {selectedCraftsman.location && (
                <DetailRow
                  icon={<MapPin className="text-emerald-500" />}
                  label="المنطقة"
                  value={selectedCraftsman.location}
                />
              )}

              {/* 4. التفاصيل */}
              {selectedCraftsman.notes && (
                <div className="flex items-start gap-3.5 p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mb-1 uppercase tracking-wider">
                      التفاصيل
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {selectedCraftsman.notes}
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
            className="fixed inset-0 z-[120] bg-slate-50 dark:bg-slate-900 flex flex-col pointer-events-auto"
          >
            {/* Sticky Top Header Bar */}
            <div className="sticky top-0 z-[130] bg-white/90 backdrop-blur-md dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between shrink-0" dir="rtl">
              <div className="w-10 h-10 shrink-0" />
              <span className="font-black text-sm text-slate-800 dark:text-slate-100 truncate flex-1 text-center px-4">
                {activeGovAnnouncement.title}
              </span>
              <button 
                onClick={() => setSelectedGovAnnouncement(null)} 
                className="w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-800 dark:text-slate-200 cursor-pointer transition-all active:scale-95 shrink-0"
                title="رجوع"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-right pb-24 custom-scrollbar" dir="rtl">

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
                  <DetailsCarousel 
                    images={detailImages} 
                    title={activeGovAnnouncement.title} 
                  />
                );
              })()}

              {/* Content details like HeritagePage */}
              <div className="space-y-4">
                {/* Unified Price & Contact Bar */}
                {(activeGovAnnouncement.entity || activeGovAnnouncement.phoneNumber || activeGovAnnouncement.linkUrl) && (
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2.5 px-3 rounded-2xl flex flex-row items-center justify-between gap-3 text-right shadow-sm">
                    {/* Right side: Location / Status */}
                    {activeGovAnnouncement.entity ? (
                      <div>
                        <p className="text-[8px] text-slate-400 dark:text-slate-500 font-black leading-none">الموقع</p>
                        <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{activeGovAnnouncement.entity}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-[8px] text-slate-400 dark:text-slate-500 font-black leading-none">خيارات</p>
                        <p className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 mt-0.5">التواصل متوفر</p>
                      </div>
                    )}

                    {/* Left side: Communication Buttons */}
                    <div className="flex items-center gap-1.5">
                      {activeGovAnnouncement.phoneNumber && (
                        <button
                          onClick={() => {
                            window.location.href = `tel:${activeGovAnnouncement.phoneNumber}`;
                          }}
                          className="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-[10px] font-black transition-all active:scale-[0.97] border border-indigo-500/5"
                        >
                          <Phone size={10} />
                          <span>{activeGovAnnouncement.phoneText || "اتصال"}</span>
                        </button>
                      )}

                      {activeGovAnnouncement.linkUrl && (
                        <button
                          onClick={() => {
                            window.open(activeGovAnnouncement.linkUrl, '_blank');
                          }}
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-[10px] font-black transition-all active:scale-[0.97] border border-slate-200 dark:border-slate-650"
                        >
                          <Globe size={10} />
                          <span>{activeGovAnnouncement.linkText || "الرابط"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Extended Details Box with spacing preservation like HeritagePage */}
                <div className="bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700 p-5 rounded-[2rem] shadow-sm">
                  <p className="text-slate-800 dark:text-slate-100 text-sm md:text-base font-semibold leading-relaxed whitespace-pre-wrap text-right font-sans">
                    {activeGovAnnouncement.description}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {selectedServiceOffer && activeServiceOffer && (
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-0 z-[120] bg-slate-50 dark:bg-slate-900 flex flex-col pointer-events-auto"
          >
            {/* Sticky Top Header Bar */}
            <div className="sticky top-0 z-[130] bg-white/90 backdrop-blur-md dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between shrink-0" dir="rtl">
              <div className="w-10 h-10 shrink-0" />
              <span className="font-black text-sm text-slate-800 dark:text-slate-100 truncate flex-1 text-center px-4">
                {activeServiceOffer.title}
              </span>
              <button 
                onClick={() => setSelectedServiceOffer(null)} 
                className="w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-800 dark:text-slate-200 cursor-pointer transition-all active:scale-95 shrink-0"
                title="رجوع"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-right pb-24 custom-scrollbar" dir="rtl">

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
                  <DetailsCarousel 
                    images={detailImages} 
                    title={activeServiceOffer.title} 
                  />
                );
              })()}

              <div className="space-y-4">
                {/* Unified Price & Contact Bar */}
                {(activeServiceOffer.price || activeServiceOffer.whatsappNumber || activeServiceOffer.tag) && (
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2.5 px-3 rounded-2xl flex flex-row items-center justify-between gap-3 text-right shadow-sm">
                    {/* Right side: Price / Tag */}
                    {activeServiceOffer.price ? (
                      <div>
                        <p className="text-[8px] text-slate-400 dark:text-slate-500 font-black leading-none">السعر / العرض</p>
                        <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{activeServiceOffer.price}</p>
                      </div>
                    ) : activeServiceOffer.tag ? (
                      <div>
                        <p className="text-[8px] text-slate-400 dark:text-slate-500 font-black leading-none">التصنيف</p>
                        <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{activeServiceOffer.tag}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-[8px] text-slate-400 dark:text-slate-500 font-black leading-none">خيارات</p>
                        <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 mt-0.5">التواصل متوفر</p>
                      </div>
                    )}

                    {/* Left side: Communication Buttons */}
                    <div className="flex items-center gap-1.5">
                      {activeServiceOffer.whatsappNumber && (
                        <button
                          onClick={() => {
                            const cleanNum = activeServiceOffer.whatsappNumber.replace(/\D/g, '');
                            window.open(`tel:${cleanNum}`, '_self');
                          }}
                          className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-[10px] font-black transition-all active:scale-[0.97] border border-emerald-500/5"
                        >
                          <Phone size={10} />
                          <span>{activeServiceOffer.buttonText || "اتصال مباشر"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Extended Details Box */}
                <div className="bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700 p-5 rounded-[2rem] shadow-sm">
                  {activeServiceOffer.subtitle && (
                    <div className="mb-3 text-xs font-black text-slate-400 dark:text-slate-450">
                      🏷️ {activeServiceOffer.subtitle}
                    </div>
                  )}
                  <p className="text-slate-800 dark:text-slate-100 text-sm md:text-base font-semibold leading-relaxed whitespace-pre-wrap text-right font-sans">
                    {activeServiceOffer.description}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {selectedMarketListing && activeMarketListing && (
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-0 z-[120] bg-slate-50 dark:bg-slate-900 flex flex-col pointer-events-auto"
          >
            {/* Sticky Top Header Bar */}
            <div className="sticky top-0 z-[130] bg-white/90 backdrop-blur-md dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between shrink-0" dir="rtl">
              <div className="w-10 h-10 shrink-0" />
              <span className="font-black text-sm text-slate-800 dark:text-slate-100 truncate flex-1 text-center px-4">
                {activeMarketListing.title}
              </span>
              <button 
                onClick={() => setSelectedMarketListing(null)} 
                className="w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-800 dark:text-slate-200 cursor-pointer transition-all active:scale-95 shrink-0"
                title="رجوع"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-right pb-24 custom-scrollbar" dir="rtl">

              {/* Cover Images Carousel (up to 3 images) */}
              {(() => {
                const detailImages = [];
                if (activeMarketListing.images && activeMarketListing.images.length > 0) {
                  detailImages.push(...activeMarketListing.images.slice(0, 3));
                } else if (activeMarketListing.image) {
                  detailImages.push(activeMarketListing.image);
                }
                
                if (detailImages.length === 0) return null;
                
                return (
                  <DetailsCarousel 
                    images={detailImages} 
                    title={activeMarketListing.title} 
                  />
                );
              })()}

              <div className="space-y-4">
                {/* Title & Price & Category Box */}
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                      {activeMarketListing.category}
                    </span>
                    {activeMarketListing.price && (
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {activeMarketListing.price}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-black text-base text-slate-800 dark:text-white leading-snug">
                    {activeMarketListing.title}
                  </h3>
                  {activeMarketListing.location && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold pt-1">
                      <MapPin size={14} className="text-emerald-500" />
                      <span>{activeMarketListing.location}</span>
                    </div>
                  )}
                </div>

                {/* Contact Actions (Phone & WhatsApp) */}
                {(activeMarketListing.phone || activeMarketListing.whatsappNumber) && (
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-3.5 rounded-3xl flex items-center justify-between gap-3 shadow-xs">
                    <div className="text-right">
                      <p className="text-[9px] text-slate-400 font-bold">رقم التواصل</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white" dir="ltr">
                        {activeMarketListing.phone || activeMarketListing.whatsappNumber}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeMarketListing.phone && (
                        <a
                          href={`tel:${activeMarketListing.phone.replace(/\D/g, '')}`}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-black transition-all active:scale-95 shadow-xs"
                        >
                          <Phone size={14} />
                          <span>اتصال</span>
                        </a>
                      )}
                      {!["سيارات", "عقارات", "موبايلات"].includes(activeMarketListing.category || "") && (activeMarketListing.whatsappNumber || activeMarketListing.phone) && (
                        <a
                          href={`https://wa.me/${(activeMarketListing.whatsappNumber || activeMarketListing.phone).replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-black transition-all active:scale-95"
                        >
                          <Whatsapp size={14} />
                          <span>واتساب</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Description Box */}
                {activeMarketListing.description && (
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl shadow-xs space-y-2">
                    <h4 className="font-display font-black text-xs text-slate-400 dark:text-slate-500">
                      التفاصيل والوصف
                    </h4>
                    <p className="text-slate-800 dark:text-slate-100 text-xs md:text-sm font-bold leading-relaxed whitespace-pre-wrap">
                      {activeMarketListing.description}
                    </p>
                  </div>
                )}
              </div>
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
                craftsmen={craftsmen}
                setCraftsmen={setCraftsmen}
                govAnnouncements={govAnnouncements}
                banners={banners}
                appSettings={appSettings}
                saveSettings={saveSettings}
                marketStores={marketStores}
                adminSelectedStore={adminSelectedStore}
                setAdminSelectedStore={setAdminSelectedStore}
                adminMarketProducts={adminMarketProducts}
                hospitalDoctors={hospitalDoctors}
                notifications={notifications}
                setNotifications={setNotifications}
                seedDatabase={seedDatabase}
                setDoctors={setDoctors}
                setMarketStores={setMarketStores}
                setServiceOffers={setServiceOffers}
                marketListings={marketListings}
                setMarketListings={setMarketListings}
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
            className="fixed bottom-28 right-6 z-[250] w-14 h-14 bg-slate-900/90 dark:bg-shirqat-primary text-white rounded-full shadow-2xl flex items-center justify-center border border-white/20 active:scale-90 transition-all pointer-events-auto backdrop-blur-md"
          >
            <ArrowRight size={24} className="-rotate-90" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarPage === "about" && (
          <OverlayPage title="عن التطبيق" onBack={() => setSidebarPage(null)}>
            <div className="p-6 space-y-6 text-right">
              <div className="bg-gradient-to-br from-shirqat-primary to-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white/15 rounded-full p-0.5 overflow-hidden border border-white/25 mb-4 shadow-lg animate-pulse">
                  <img
                    src="/logo_shirqat.svg"
                    alt="دليل الشرقاط"
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="text-2xl font-display font-black mb-2">
                  دليل الشرقاط
                </h3>
                <p className="text-sm font-bold opacity-90 leading-loose">
                  هو التطبيق الرسمي الأول والوحيد لخدمة أهالي قضاء الشرقاط، يهدف
                  لتسهيل الوصول للخدمات الطبية، سواق الأجرة، التبليغات، وغيرها من
                  الخدمات الحيوية.
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
              <div className="space-y-4">
                <h4 className="font-display font-black text-slate-800">
                  كيف نستخدم المعلومات؟
                </h4>
                <p className="text-sm font-bold text-slate-500 leading-loose">
                  تُستخدم المعلومات فقط لتمكين المستخدم من التواصل مع مقدمي
                  الخدمة مباشرة عبر الهاتف أو واتساب.
                </p>
              </div>
            </div>
          </OverlayPage>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarPage === "terms" && (
          <OverlayPage
            title="شروط الاستخدام"
            onBack={() => setSidebarPage(null)}
          >
            <div className="p-6 space-y-8 text-right">
              <div className="flex flex-col items-center py-8 opacity-20">
                <Scale size={64} className="text-shirqat-primary" />
              </div>
              <div className="space-y-4">
                <h4 className="font-display font-black text-slate-800">
                  صحة المعلومات
                </h4>
                <p className="text-sm font-bold text-slate-500 leading-loose">
                  نحن نسعى جاهدين لضمان دقة جميع البيانات في التطبيق، ولكننا لا
                  نتحقق من الهويات الشخصية لكل مشترك بشكل كامل، لذا يجب على
                  المستخدم التأكد قبل التعامل المالي.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-display font-black text-slate-800">
                  السلوك المحظور
                </h4>
                <p className="text-sm font-bold text-slate-500 leading-loose">
                  يُحظر تماماً استخدام أرقام الهواتف الموجودة في التطبيق لأغراض
                  الإزعاج أو التهديد، وسيعرض ذلك الفاعل للمظائلة القانونية.
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
        {bookingDoctor && (
          <div
            className="fixed inset-0 z-[600] flex items-end justify-center p-0"
            dir="rtl"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setBookingDoctor(null)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative bg-white dark:bg-slate-800 w-full max-w-lg rounded-t-[3rem] p-8 pb-[calc(5rem+env(safe-area-inset-bottom))] shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
              <div className="text-right mb-8">
                <h3 className="text-2xl font-display font-black text-slate-800">
                  حجز موعد
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  احجز موعدك عند الدكتور {bookingDoctor.name}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                    اسم المريض
                  </label>
                  <input
                    type="text"
                    placeholder="أدخل اسمك الكامل"
                    value={bookingData.patientName}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        patientName: e.target.value,
                      })
                    }
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-right font-bold focus:ring-2 focus:ring-shirqat-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    placeholder="07xx xxx xxxx"
                    value={bookingData.patientPhone}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        patientPhone: e.target.value,
                      })
                    }
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-right font-bold focus:ring-2 focus:ring-shirqat-primary/20 outline-none"
                  />
                </div>

                <button
                  onClick={() => {
                    if (!bookingData.patientName || !bookingData.patientPhone) {
                      alert("يرجى ملء البيانات");
                      return;
                    }
                    const msg = `مرحباً، أود حجز موعد باسم المريض: ${bookingData.patientName}، رقم الهاتف: ${bookingData.patientPhone}`;
                    window.open(
                      `https://wa.me/${formatWhatsApp(bookingDoctor.whatsappBookingNumber || bookingDoctor.phone1)}?text=${encodeURIComponent(msg)}`,
                      "_blank",
                    );

                    playSuccessSound();
                    if (window.navigator.vibrate)
                      window.navigator.vibrate([20, 50, 20]);
                    setBookingDoctor(null);
                    setBookingData({ patientName: "", patientPhone: "" });
                    setBookingToast(true);
                    setTimeout(() => setBookingToast(false), 3000);
                  }}
                  className="w-full h-16 bg-shirqat-primary text-white rounded-2xl font-black shadow-xl shadow-shirqat-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3 mt-4 mb-6"
                >
                  <Whatsapp size={24} /> إرسال الطلب عبر واتساب
                </button>
              </div>
            </motion.div>
          </div>
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
                هذه اللوحة مخصصة لإدارة تطبيق دليل الشرقاط فقط (تحديث المحتوى، الرد على الطلبات، وإرسال الإشعارات).
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

      <AnimatePresence>
        {bookingToast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[700] bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-black text-sm whitespace-nowrap"
          >
            <CheckCircle size={18} /> تم إرسال طلب الحجز بنجاح
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar (التبويب السفلي) */}
      {showBottomBar && (
        <div className="fixed bottom-0 left-0 right-0 z-[200] pointer-events-none" dir="rtl">
          <div className="max-w-lg mx-auto px-4 pb-3 pt-4">
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-1.5 shadow-2xl shadow-slate-900/10 flex items-center justify-around pointer-events-auto relative">
              {[
                { id: "home", label: "الرئيسية", icon: <Home size={20} />, activeColor: "bg-emerald-600 text-white" },
                { 
                  id: "notifications", 
                  label: "الإشعارات", 
                  icon: (
                    <div className="relative">
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -left-1 bg-rose-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  ), 
                  activeColor: "bg-emerald-600 text-white" 
                },
                { id: "settings", label: "الإعدادات", icon: <Settings size={20} />, activeColor: "bg-emerald-600 text-white" },
              ].map((item) => {
                const isActive = tab === item.id && subTab === null;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (window.navigator.vibrate) window.navigator.vibrate(6);
                      setTab(item.id as any);
                      setSubTab(null);
                      setShowAllOffersModal(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-300 cursor-pointer active:scale-95 flex-1 ${
                      isActive
                        ? `${item.activeColor} shadow-md`
                        : "text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="mb-0.5">{item.icon}</div>
                    <span className={`text-[9px] font-black tracking-tight ${isActive ? "text-white" : ""}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

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

      {/* Notifications Overlay Page (صفحة الإشعارات) */}
      <AnimatePresence>
        {showNotificationsPanel && (
          <OverlayPage
            title="الإشعارات والتنبيهات 🔔"
            onBack={() => {
              setShowNotificationsPanel(false);
              markAllNotificationsAsRead();
            }}
          >
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
                                localStorage.setItem("read_notification_ids", JSON.stringify(newRead));
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
          </OverlayPage>
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

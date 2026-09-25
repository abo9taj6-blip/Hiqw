export interface BannerAd {
  id: string;
  image?: string;
  type: 'internal' | 'external' | 'text';
  targetId?: string;
  targetType?: 'doctor' | 'restaurant' | 'hospital' | 'govAnnouncement' | 'serviceOffers';
  title?: string;
  content?: string;
  buttonText?: string;
  url?: string;
  clicks?: number;
}

export interface TaxiDriver {
  id: string;
  name: string;
  carType: string;
  phone: string;
  location?: string;
  notes?: string;
  whatsappNumber?: string;
  whatsapp?: string;
  image?: string;
  category?: string;
  type?: string;
  createdAt?: number;
  showInHome?: boolean;
}

export interface DoctorSpecialty {
  id: string;
  name: string;
  order?: number;
  createdAt?: number;
}

export interface DoctorRegion {
  id: string;
  name: string;
  order?: number;
  createdAt?: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  order?: number;
  createdAt?: number;
}

export interface Doctor {
  id: string;
  name: string;
  subtitle: string; // Specialty
  category: 'doctor' | 'lab' | 'pharmacy';
  description: string;
  location: string;
  phone1: string;
  phone2?: string;
  image?: string;
  reviews?: number;
  isVerified?: boolean;
  showInHome?: boolean;
  complexId?: string;       // Linked Medical Complex
  workingDays?: string;     // Days of duty / work days
  reservationPhone?: string; // Doctor's reservation phone number
  region?: string;           // Region / Area (المنطقة)
}

export interface GovAnnouncement {
  id: string;
  title: string;
  entity: string;
  description: string;
  phoneText?: string;
  phoneNumber?: string;
  linkText?: string;
  linkUrl?: string;
  isActive: boolean;
  createdAt: number;
  image?: string;
  images?: string[];
  category?: string;
  publishDate?: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  discountPercentage?: number;
  discountAmount?: number; // Either percentage or flat amount
  isActive: boolean;
}

export interface MarketStore {
  id: string;
  name: string;
  category: string;
  description: string;
  phone: string;
  whatsapp?: string;
  coverImage?: string;
  logoImage?: string;
  location?: string;
  maxProducts: number;
  productCount: number;
  isFeatured: boolean;
  isCarShowroom?: boolean;
  isRestaurant?: boolean;
  isActive: boolean;
  showInHome?: boolean;
  discountCodes?: DiscountCode[];
  createdAt: number;
  menuCategories?: string[];
  isMedicalComplex?: boolean;
}

export type MedicalComplex = MarketStore;


export interface HospitalDoctor {
  id: string;
  name: string;
  specialty: string;
  shift: string;
  days: string[];
  isActive: boolean;
  createdAt: number;
  isVerified?: boolean;
  image?: string;
}

export interface HospitalStat {
  id: string;
  title: string;
  value: string;
  iconType: string; // e.g., 'activity', 'heart', 'users'
  createdAt: number;
}

export interface ServiceMenuItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  price?: string;
  image?: string;
  category?: string;
  isAvailable?: boolean;
  isTemporary?: boolean;
  durationDays?: number;
  expiryDate?: number;
}

export interface ServiceOffer {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image?: string;
  images?: string[];
  whatsappNumber?: string;
  phone?: string;
  buttonText?: string;
  price?: string;
  discount?: string;
  tag?: string;
  isActive: boolean;
  showInHome?: boolean;
  createdAt: number;
  publishDate?: string;
  hasMenu?: boolean;
  menuTitle?: string;
  menuCategories?: string[];
  menuItems?: ServiceMenuItem[];
}

export interface MarketProduct {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  price: number | string;
  images: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  createdAt: number;
  // Temporary Offer feature
  isTemporary?: boolean;
  durationDays?: number;
  expiryDate?: number;
  productType?: 'offer' | 'menu' | string;
  // Iraqi style car details
  carBrand?: string;
  carModel?: string;
  carYear?: string | number;
  carColor?: string;
  carTransmission?: string;
  carMileage?: string;
  carSpecs?: string;
  carEngine?: string;
  menuCategory?: string;
  category?: string;
  isAnnouncement?: boolean;
  announcementType?: string;
  whatsappOrder?: string;
}

export function parsePriceNumber(price: any): number {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  const cleaned = String(price).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

export function formatPriceDisplay(price: any): string {
  if (price === undefined || price === null || price === "") return "0 د.ع";
  if (typeof price === "number") {
    return `${price.toLocaleString()} د.ع`;
  }
  const str = String(price).trim();
  const num = Number(str.replace(/,/g, ""));
  if (!isNaN(num) && str.length > 0) {
    return `${num.toLocaleString()} د.ع`;
  }
  return str;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  isRead?: boolean;
}
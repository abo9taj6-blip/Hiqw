export interface BannerAd {
  id: string;
  image: string;
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

export interface Craftsman {
  id: string;
  name: string;
  craft: string;
  phone: string;
  location?: string;
  notes?: string;
  whatsappNumber?: string;
  image?: string;
  category?: string;
  createdAt?: number;
  showInHome?: boolean;
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
  isBookingEnabled?: boolean;
  whatsappBookingNumber?: string;
  lat?: number;
  lng?: number;
  isVerified?: boolean;
  showInHome?: boolean;
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
  lat?: number;
  lng?: number;
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
}


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
  whatsappNumber: string;
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

export interface MarketListing {
  id: string;
  title: string;
  category: 'سيارات' | 'عقارات' | 'موبايلات' | string;
  price: string;
  phone: string;
  whatsappNumber?: string;
  location: string;
  description: string;
  images: string[];
  image?: string;
  isActive?: boolean;
  showInHome?: boolean;
  createdAt: number;
}

export interface MarketProduct {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  price: number;
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
  isAnnouncement?: boolean;
  announcementType?: string;
  whatsappOrder?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  isRead?: boolean;
}
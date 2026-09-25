# دليل مواصفات وتطوير تطبيق "دليل الشرقاط" لربطه مع Supabase
## Comprehensive Architecture, Visual Identity & Supabase Database Schema

---

## 1. نظرة عامة على المشروع (Project Overview)

- **اسم التطبيق**: دليل الشرقاط الشامل (Shirqat Community & Services Directory)
- **الهدف والوظيفة**: منصة محلية وتطبيق ويب تقدم لأهالي قضاء الشرقاط دليلاً رقمياً متكاملاً يتضمن:
  1. **دليل الأطباء والعيادات التخصصية**: استعراض الأطباء، التخصصات، أرقام الحجز، أيام وأوقات الدوام، والعناوين مع الاتصال المباشر.
  2. **دليل المجمعات الطبية والمستشفيات**: استعراض المجمعات، العيادات التخصصية التابعة لكل مجمع، الكوادر الطبية العاملة فيه، وطرق التواصل.
  3. **دليل الخدمات، النقل والمهن الحرفية**: أصحاب التكاسي (خصوصي، ستاركس، سفريات، دليفري، حمل) والمهن الحرفية (كهربائي، سباكة، تبريد، نجارة، إلخ) مع زر اتصال وواتساب.
  4. **شريط الإعلانات الترويجية (Banners)**: إعلانات تفاعلية في أعلى الواجهة للأنشطة والخدمات المتميزة.
  5. **نظام الإشعارات والتنبيهات المباشرة**: بث أخبار وتنبيهات محلية للأهالي.
  6. **لوحة تحكم إدارية شاملة (Admin Panel)**: لإدارة المحتوى، إضافة وتعديل وحذف العناصر، إدارة التخصصات والمهن ديناميكياً، واستيراد وتصدير البيانات عبر ملفات Excel (.xlsx).
- **اللغة والاتجاه**: اللغة العربية، واجهة كاملة من اليمين إلى اليسار (`dir="rtl"`).
- **المنصات المستهدفة**: تطبيق ويب متجاوب بالكامل (Mobile-First Web App / PWA).

---

## 2. الهوية البصرية ونظام التصميم (Visual Identity & Design System)

### 2.1. الطباعة والخطوط (Typography)
- **خط العناوين البارزة (Headings)**: `Cairo` (أوزان: 700 Bold، 800 ExtraBold، 900 Black) لإضفاء وضوح وهيبة على العناوين.
- **خط النصوص والمحتوى والواجهة (Body / UI)**: `Almarai` (أوزان: 400 Regular، 700 Bold، 800 ExtraBold) وهو خط عربي حديث عالي المقروئية على شاشات الهواتف.

```html
<!-- رابط الخطوط من Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
```

### 2.2. لوحة الألوان (Color Palette)

| الاستخدام | اللون / الكود | الوصف والدلالة |
| :--- | :--- | :--- |
| **اللون الرئيسي (Primary)** | `#10b981` (Emerald-500 / 600) | اللون الأخضر الزمردي المريح للعين، يرمز للحيوية والخدمات الطبية والتنموية |
| **اللون الثانوي (Secondary)** | `#64748b` (Slate-500) | للرموز الثانوية والنصوص التوضيحية |
| **خلفية النهاري (Light Canvas)** | `#f8fafc` (Slate-50) | خلفية ناصعة ومريحة لسهولة القراءة |
| **خلفية الليلي (Dark Canvas)** | `#0f172a` أو `#020617` (Slate-950) | خلفية داكنة فخمة ومريحة للبطاريات والشاشات |
| **بطاقات المحتوى (Cards)** | `#ffffff` / `#1e293b` | بطاقات بيضاء ناصعة مع إطار خفيف `#e2e8f0` في النهاري، و `#334155` في الليلي |
| **قسم الأطباء (Doctors Accent)** | `#4f46e5` (Indigo-600) | شارات وأزرار تفاصيل الأطباء والتخصصات |
| **قسم المجمعات الطبية (Medical)** | `#059669` (Emerald-600 / Teal) | للمجمعات الطبية والمستشفيات والعيادات |
| **قسم الخدمات والنقل (Services)** | `#d97706` (Amber-600) | للتكاسي والنقل والمهن الحرفية والخدمية |
| **قسم الإشعارات (Alerts)** | `#e11d48` (Rose-600) | لأيقونات وتنبيهات الإشعارات الهامة |

### 2.3. المقاييس الهندسية والحواف (Border Radii & Metrics)
- **البطاقات الرئيسية (Cards)**: `rounded-2xl` (16px) أو `rounded-3xl` (24px).
- **أزرار التحكم والإدخال (Buttons & Inputs)**: `rounded-2xl` (16px) مع ارتفاع قياسي `h-11` (44px) إلى `h-12` (48px) لضمان سهولة النقر بالأصابع (Mobile Touch Targets).
- **أزرار الرجوع والأيقونات الدائرية**: `rounded-2xl` بحجم `w-10 h-10` أو `w-11 h-11`.
- **الظلال (Shadows)**: ظلال ناعمة خفيفة جداً (`shadow-xs` / `shadow-sm`) والابتعاد عن الظلال الثقيلة غير الواقعية.
- **الحواف والإطارات**: إطارات رقيقة موحدة `border border-slate-200/80` (في النهاري) و `border-slate-700/80` (في الليلي).

---

## 3. معمارية وهيكلية الشاشات (App Architecture & Screens)

```
┌─────────────────────────────────────────────────────────────┐
│                    تطبيق دليل الشرقاط                       │
├─────────────────────────────────────────────────────────────┤
│ 1. الشاشة الرئيسية (Home):                                   │
│    - شريط الإعلانات المتحرك (Banner Carousel)                │
│    - شريط التنبيهات العاجلة (Marquee / Alert ticker)         │
│    - بطاقات الوصول السريع للأقسام (Quick Access Grid)       │
│    - قسم المجمعات الطبية المميزة                             │
│    - قسم الأطباء المميزين                                   │
│                                                             │
│ 2. دليل الأطباء (Doctors View):                              │
│    - حقل بحث سريع (بالاسم، التخصص، أو العنوان)              │
│    - شريط تصفية التخصصات (أفقي قابل للتمرير)               │
│    - بطاقة الطبيب: صورة، اسم، تخصص، موقع، هاتف، زر حجز       │
│                                                             │
│ 3. صفحة المجمع الطبي (MedicalComplexDetailPage):            │
│    - معلومات المجمع (اسم، شعار، عنوان، هاتف، واتساب)         │
│    - الكوادر والعيادات التابعة للمجمع (اسم الطبيب، دوامه)   │
│    - زر حجز موعد مباشر لكل طبيب                             │
│                                                             │
│ 4. دليل الخدمات والمهن والتكسي (Services & Taxis View):      │
│    - حقل بحث فوري                                           │
│    - فلترة حسب المهن ووسائل النقل (خصوصي، دليفري، كهربائي...)│
│    - بطاقات مزودي الخدمة (اتصال مباشر، واتساب مباشر)        │
│                                                             │
│ 5. مركز الإشعارات (Notifications View):                      │
│    - قائمة التنبيهات المباشرة، التوقيت، وحالة القراءة        │
│                                                             │
│ 6. لوحة الإدارة (Admin Panel):                               │
│    - واجهة لإدارة الأقسام الـ 5 الأساسية                    │
│    - إضافة / تعديل / حذف فوري                                │
│    - إدارة التخصصات الطبية ديناميكياً (إضافة/تعديل/حذف)       │
│    - إدارة فئات المهن الحرفية ديناميكياً                    │
│    - استيراد وتصدير البيانات عبر Excel (.xlsx)              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. مخطط قاعدة البيانات الكامل لـ Supabase (PostgreSQL Schema)

فيما يلي كود SQL متكامل جاهز للتشغيل مباشرة في **Supabase SQL Editor** لإنشاء الجداول، العلاقات، الفهارس، وتفعيل سياسات الأمان (RLS):

```sql
-- ============================================================================
-- 1. تفعيل الإضافات الضرورية (Extensions)
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. جدول ملفات المستخدمين والصلاحيات (Profiles & Admins)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. جدول التخصصات الطبية (Doctor Specialties)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.doctor_specialties (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. جدول المجمعات الطبية والمستشفيات (Medical Complexes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.medical_complexes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'مجمع طبي', -- 'مجمع طبي', 'مستشفى', 'عيادات', 'مختبر', 'صيدلية'
    description TEXT,
    location TEXT,
    phone TEXT,
    whatsapp TEXT,
    logo_image TEXT,
    cover_image TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    show_in_home BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. جدول الأطباء والعيادات (Doctors)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.doctors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subtitle TEXT NOT NULL, -- اسم التخصص (مثل: باطنية وقلبية)
    category TEXT DEFAULT 'doctor', -- 'doctor', 'lab', 'pharmacy'
    specialty_id TEXT REFERENCES public.doctor_specialties(id) ON DELETE SET NULL,
    complex_id TEXT REFERENCES public.medical_complexes(id) ON DELETE SET NULL, -- في حال كان تابعاً لمجمع طبي
    description TEXT,
    location TEXT,
    region TEXT,            -- المنطقة / القضاء لتصنيف والبحث المخصص (مثل: المركز، الساحل الأيمن، الساحل الأيسر...)
    phone1 TEXT NOT NULL,
    phone2 TEXT,
    reservation_phone TEXT, -- رقم الحجز المباشر
    working_days TEXT,      -- أيام وأوقات الدوام (مثال: السبت إلى الأربعاء 4 - 8 مساءً)
    image TEXT,
    reviews NUMERIC DEFAULT 5.0,
    is_verified BOOLEAN DEFAULT TRUE,
    show_in_home BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. جدول أطباء وكوادر المجمع الطبي (Complex Doctors / Sub-collection)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.complex_doctors (
    id TEXT PRIMARY KEY,
    complex_id TEXT NOT NULL REFERENCES public.medical_complexes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    description TEXT,
    phone TEXT,
    reservation_phone TEXT,
    working_days TEXT,
    image TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. جدول فئات الخدمات والمهن الحرفية (Service Categories)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.service_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. جدول التكاسي والخدمات والمهن الحرفية (Taxis & Direct Services)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.services_and_taxis (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- الفئة: خصوصي، ستاركس، دليفري، حمل، كهربائي، صحيات...
    car_type TEXT,          -- نوع وسيلة النقل أو تفاصيل الحرفة
    phone TEXT NOT NULL,
    whatsapp TEXT,
    location TEXT,
    notes TEXT,             -- ملاحظات وتفاصيل الخدمة أو خط السير
    image TEXT,
    show_in_home BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. جدول الإعلانات الترويجية (Banner Ads)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.banner_ads (
    id TEXT PRIMARY KEY,
    title TEXT,
    content TEXT,
    image TEXT NOT NULL,
    type TEXT DEFAULT 'internal', -- 'internal', 'external', 'text'
    target_type TEXT,            -- 'doctor', 'hospital', 'complex', 'service'
    target_id TEXT,              -- معرف العنصر المرتبط
    url TEXT,                    -- رابط خارجي في حال كان external
    button_text TEXT DEFAULT 'عرض التفاصيل',
    clicks INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. جدول الإشعارات والتنبيهات المباشرة (Notifications)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 11. جدول إعدادات التطبيق العامة (App Settings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 12. إنشاء الفهارس لتحسين سرعة الاستعلامات والبحث (Indexes)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_doctors_name ON public.doctors USING gin(to_tsvector('simple', name));
CREATE INDEX IF NOT EXISTS idx_doctors_subtitle ON public.doctors(subtitle);
CREATE INDEX IF NOT EXISTS idx_doctors_complex_id ON public.doctors(complex_id);
CREATE INDEX IF NOT EXISTS idx_complex_doctors_complex_id ON public.complex_doctors(complex_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services_and_taxis(category);
CREATE INDEX IF NOT EXISTS idx_banner_ads_active ON public.banner_ads(is_active);
```

---

## 5. سياسات الأمان والحماية (Row Level Security - RLS)

في تطبيق الدليل، يحتاج عامة المستخدمين (Public) إلى **قراءة كافة البيانات** بدون الحاجة لتسجيل دخول، بينما تكون عمليات **الإضافة والتعديل والحذف محصورة بمدراء التطبيق فقط** (Authenticated Admins):

```sql
-- 1. تفعيل RLS على كافة الجداول
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_complexes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complex_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services_and_taxis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banner_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 2. دالة مساعدة للتحقق مما إذا كان المستخدم مديراً
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. سياسات القراءة العامة للجميع (Public Read Access)
CREATE POLICY "Public can view doctor_specialties" ON public.doctor_specialties FOR SELECT USING (true);
CREATE POLICY "Public can view medical_complexes" ON public.medical_complexes FOR SELECT USING (true);
CREATE POLICY "Public can view doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Public can view complex_doctors" ON public.complex_doctors FOR SELECT USING (true);
CREATE POLICY "Public can view service_categories" ON public.service_categories FOR SELECT USING (true);
CREATE POLICY "Public can view services_and_taxis" ON public.services_and_taxis FOR SELECT USING (true);
CREATE POLICY "Public can view banner_ads" ON public.banner_ads FOR SELECT USING (true);
CREATE POLICY "Public can view notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Public can view app_settings" ON public.app_settings FOR SELECT USING (true);

-- 4. سياسات التعديل والإدارة للمدراء فقط (Admin Write Access)
CREATE POLICY "Admins can manage doctor_specialties" ON public.doctor_specialties FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can manage medical_complexes" ON public.medical_complexes FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can manage doctors" ON public.doctors FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can manage complex_doctors" ON public.complex_doctors FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can manage service_categories" ON public.service_categories FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can manage services_and_taxis" ON public.services_and_taxis FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can manage banner_ads" ON public.banner_ads FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can manage app_settings" ON public.app_settings FOR ALL TO authenticated USING (public.is_admin());
```

---

## 6. إعداد حاوية تخزين الصور (Supabase Storage Setup)

1. توجه إلى تبويب **Storage** في لوحة Supabase وأنشئ حاوية جديدة:
   - **Bucket Name**: `app-images`
   - **Public Bucket**: نعم (فعّل الخيار `Public`).
2. قم بتنظيم المجلدات داخل الحاوية بالشكل التالي:
   - `doctors/`: للصور الشخصية للأطباء والكوادر.
   - `complexes/`: لشعارات وصور المجمعات الطبية والمستشفيات.
   - `banners/`: لصور الإعلانات الترويجية.
   - `services/`: لصور التكاسي ومزودي الخدمات والمهن.
3. أضف سياسة أمان للـ Storage تسمح للعامة بعرض الصور، وللمدراء برفع وتعديل الصور:

```sql
-- السماح للجميع بمشاهدة صور الحاوية
CREATE POLICY "Public Access to app-images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'app-images');

-- السماح للمستخدمين المصادق عليهم (المدراء) برفع الصور
CREATE POLICY "Admins can upload images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'app-images');

-- السماح للمدراء بحذف الصور القديمة
CREATE POLICY "Admins can delete images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'app-images');
```

---

## 7. البيانات الافتراضية الأولية (Seed Data)

يمكنك إدخال هذه البيانات الأولية في SQL Editor لتبدأ قاعدة البيانات ببيانات حقيقية جاهزة:

```sql
-- إدخال التخصصات الطبية الأساسية
INSERT INTO public.doctor_specialties (id, name, sort_order) VALUES
('spec-1', 'باطنية وقلبية', 1),
('spec-2', 'جراحة عامة وناظورية', 2),
('spec-3', 'طب وجراحة العظام والمفاصل', 3),
('spec-4', 'نسائية وتوليد وعقم', 4),
('spec-5', 'طب الأطفال وحديثي الولادة', 5),
('spec-6', 'جلدية وتجميل وليزر', 6),
('spec-7', 'أنف وأذن وحنجرة', 7),
('spec-8', 'طب وجراحة العيون', 8),
('spec-9', 'أسنان وجراحة الفم والفكين', 9),
('spec-10', 'مسالك بولية وتناسلية', 10),
('spec-11', 'أعصاب ودماغ', 11),
('spec-12', 'أشعة وسونار', 12),
('spec-13', 'مختبرات وتحاليل طبية', 13),
('spec-14', 'طب عام وطوارئ', 14)
ON CONFLICT (id) DO NOTHING;

-- إدخال فئات المهن الحرفية ووسائل النقل
INSERT INTO public.service_categories (id, name, sort_order) VALUES
('scat-1', 'خصوصي', 1),
('scat-2', 'دليفري وتوصيل طلبات', 2),
('scat-3', 'ستاركس وسفريات المحافظات', 3),
('scat-4', 'سيارات حمل ونقل بضائع', 4),
('scat-5', 'كهربائي وتأسيسات', 5),
('scat-6', 'صحيات وسباكة', 6),
('scat-7', 'تبريد وتكييف', 7),
('scat-8', 'بناء وترميم', 8),
('scat-9', 'حدادة وشبابيك', 9),
('scat-10', 'نجارة وأثاث منزلي', 10),
('scat-11', 'ستلايت وكاميرات مراقبة', 11),
('scat-12', 'تصليح أجهزة كهربائية', 12)
ON CONFLICT (id) DO NOTHING;

-- مجمع طبي تجريبي
INSERT INTO public.medical_complexes (id, name, category, description, location, phone, whatsapp) VALUES
('comp-1', 'مجمع الشرقاط الطبي الاستشاري', 'مجمع طبي', 'يضم نخبة من كبار الأطباء والعيادات التخصصية ومختبر تحليلات حديث وقسم أشعة وسونار', 'الشرقاط - الشارع العام مقابل المستشفى', '07701234567', '07701234567')
ON CONFLICT (id) DO NOTHING;
```

---

## 8. كيفية ربط تطبيق React مع Supabase (Integration Code)

### 8.1. تثبيت الحزمة
```bash
npm install @supabase/supabase-js
```

### 8.2. ملف العميل `src/services/supabaseClient.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials are missing in .env file!');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
```

### 8.3. ملف المتغيرات البيئية `.env`
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 8.4. كود خدمة البيانات `src/services/supabaseService.ts`
بديل شامل وسريع لخدمة Firebase السابقة:

```typescript
import { supabase } from './supabaseClient';

export const supabaseService = {
  // جلب جدول كامل
  async fetchTable<T>(tableName: string, orderBy = 'sort_order'): Promise<T[]> {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order(orderBy, { ascending: true });
    
    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      throw error;
    }
    return (data as T[]) || [];
  },

  // جلب عنصر فردي
  async fetchById<T>(tableName: string, id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as T;
  },

  // حفظ أو تحديث عنصر (Upsert)
  async upsertItem(tableName: string, item: any): Promise<void> {
    const { error } = await supabase.from(tableName).upsert(item);
    if (error) throw error;
  },

  // حذف عنصر
  async deleteItem(tableName: string, id: string): Promise<void> {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw error;
  },

  // رفع صورة إلى Storage وإرجاع الرابط العام
  async uploadImage(file: File, folder = 'general'): Promise<string> {
    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('app-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('app-images').getPublicUrl(fileName);
    return data.publicUrl;
  }
};
```

---

## 9. خلاصة الفروقات ومزايا الانتقال إلى Supabase

1. **الاستعلامات والبحث السريع (SQL Queries & Full-Text Search)**:
   - في Firebase Firestore كانت عمليات البحث الجزئي بالنصوص تتطلب حقولاً خاصة أو أدوات خارجية.
   - في Supabase (PostgreSQL) يمكنك استخدام عوامل التصفية `ilike` أو `to_tsvector` للبحث الفوري بالعربية عن أي جزء من اسم الطبيب، التخصص، أو العنوان.
2. **العلاقات المباشرة (Foreign Keys)**:
   - يمكنك إجراء استعلام واحد يجمع المجمع الطبي مع جميع أطبائه عبر `select('*, complex_doctors(*)')`.
3. **التكلفة والتحكم بالبيانات**:
   - لا توجد قيود على عدد قراءات المستندات في الخطة المجانية بنفس طريقة فايربيس، مع توفير واجهة بيانات مرئية سهلة للتعديل اليدوي في لوحة تحكم Supabase.
4. **تصدير واستيراد Excel**:
   - يتكامل جدول Postgres بسهولة تامة مع تصدير واستيراد ملفات CSV / Excel.

---
*تم إعداد هذا التوثيق ليكون مرجعاً هندسياً وتقنياً دقيقاً وشاملاً لكافة مكونات وهوية وقواعد بيانات تطبيق دليل الشرقاط.*

// lib/types/campaign.ts

export type AdType = 'call' | 'search' | 'text' | 'youtube' | 'gmail';

export interface CampaignFormData {
  name: string;
  type: AdType | null;
  websiteUrl: string;
}

export interface LocationData {
  name: string;
  coordinates: [number, number];
  polygon?: [number, number][];
  timezone: string;
  utcOffset: number;
  country: string;
  region?: string;
}

export interface BudgetData {
  dailyAmount: number;
  currency: 'USD' | 'SAR' | 'AED' | 'EGP' | 'TRY';
  estimatedReach: number;
  estimatedClicks: number;
  avgCPC: number;
}

export interface ScheduleData {
  type: 'preset' | 'custom';
  preset?: 'peak' | 'business' | 'night';
  custom?: {
    days: string[];
    timeSlots: { start: string; end: string }[];
  };
  timezone: string;
}

export interface AdCreativeData {
  headlines: string[];
  descriptions: string[];
  phoneNumber?: string;
  businessName?: string;
  images?: File[];
  logo?: File;
  callToAction?: string;
  finalUrl: string;
}

export interface CampaignData {
  // الخطوة 1: معلومات أساسية
  name: string;
  type: AdType;
  websiteUrl: string;
  
  // الخطوة 2: الاستهداف الجغرافي
  targetLocation: LocationData;
  
  // الخطوة 3: الميزانية والجدولة
  budget: BudgetData;
  schedule: ScheduleData;
  
  // الخطوة 4: تصميم الإعلان
  adCreative: AdCreativeData;
  
  // الخطوة 5: الحساب
  accountChoice: 'existing' | 'new';
  selectedAccountId?: string;
  
  // معلومات إضافية
  status: 'draft' | 'pending' | 'active' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}

export interface GoogleAdsAccount {
  id: string;
  name: string;
  currency: string;
  timezone: string;
  status: 'ENABLED' | 'DISABLED' | 'SUSPENDED';
  type: 'MANAGER' | 'CLIENT';
  canManageClients: boolean;
  testAccount: boolean;
}

export interface BudgetEstimate {
  minBudget: number;
  maxBudget: number;
  recommendedBudget: number;
  estimatedClicks: number;
  estimatedImpressions: number;
  estimatedCPC: number;
  estimatedCTR: number;
  competitionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface CampaignValidation {
  isValid: boolean;
  errors: {
    [key: string]: string[];
  };
  warnings: {
    [key: string]: string[];
  };
}

export interface CampaignStep {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
  route: string;
}

// Constants
export const CAMPAIGN_STEPS: CampaignStep[] = [
  {
    id: 1,
    title: 'المعلومات الأساسية',
    description: 'اسم الحملة ونوع الإعلان',
    isCompleted: false,
    isActive: true,
    route: '/campaign/new'
  },
  {
    id: 2,
    title: 'الاستهداف الجغرافي',
    description: 'تحديد المنطقة المستهدفة',
    isCompleted: false,
    isActive: false,
    route: '/campaign/location-targeting'
  },
  {
    id: 3,
    title: 'الميزانية والجدولة',
    description: 'تحديد الميزانية وأوقات العرض',
    isCompleted: false,
    isActive: false,
    route: '/campaign/budget-scheduling'
  },
  {
    id: 4,
    title: 'تصميم الإعلان',
    description: 'إنشاء محتوى الإعلان',
    isCompleted: false,
    isActive: false,
    route: '/campaign/ad-creative'
  }
];

export const AD_TYPE_REQUIREMENTS = {
  call: {
    required: ['phoneNumber', 'businessName', 'headlines', 'descriptions'],
    optional: ['logo', 'images'],
    validation: {
      phoneNumber: /^[\+]?[1-9][\d]{0,15}$/,
      headlines: { min: 1, max: 3, maxLength: 30 },
      descriptions: { min: 1, max: 2, maxLength: 90 }
    }
  },
  search: {
    required: ['headlines', 'descriptions', 'finalUrl'],
    optional: ['phoneNumber', 'sitelinks'],
    validation: {
      headlines: { min: 3, max: 15, maxLength: 30 },
      descriptions: { min: 2, max: 4, maxLength: 90 }
    }
  },
  text: {
    required: ['headlines', 'descriptions', 'finalUrl'],
    optional: ['phoneNumber', 'logo'],
    validation: {
      headlines: { min: 1, max: 5, maxLength: 30 },
      descriptions: { min: 1, max: 2, maxLength: 90 }
    }
  },
  youtube: {
    required: ['video', 'headlines', 'descriptions', 'logo'],
    optional: ['companionBanner', 'callToAction'],
    validation: {
      headlines: { min: 1, max: 2, maxLength: 30 },
      descriptions: { min: 1, max: 1, maxLength: 90 },
      logo: { dimensions: '1200x1200', formats: ['JPG', 'PNG'] }
    }
  },
  gmail: {
    required: ['logo', 'headlines', 'descriptions', 'images'],
    optional: ['video', 'callToAction'],
    validation: {
      headlines: { min: 1, max: 3, maxLength: 30 },
      descriptions: { min: 1, max: 2, maxLength: 90 },
      logo: { dimensions: '1200x1200', formats: ['JPG', 'PNG'] },
      images: { dimensions: '1200x628', formats: ['JPG', 'PNG'] }
    }
  }
};

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'دولار أمريكي', symbol: '$' },
  { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س' },
  { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ' },
  { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م' },
  { code: 'TRY', name: 'ليرة تركية', symbol: '₺' }
];

export const TIMEZONE_MAP = {
  'مصر': 'Africa/Cairo',
  'تركيا': 'Europe/Istanbul',
  'الإمارات': 'Asia/Dubai',
  'السعودية': 'Asia/Riyadh',
  'الكويت': 'Asia/Kuwait',
  'قطر': 'Asia/Qatar',
  'البحرين': 'Asia/Bahrain',
  'عمان': 'Asia/Muscat',
  'الأردن': 'Asia/Amman',
  'لبنان': 'Asia/Beirut',
  'سوريا': 'Asia/Damascus',
  'العراق': 'Asia/Baghdad',
  'فلسطين': 'Asia/Gaza',
  'ليبيا': 'Africa/Tripoli',
  'تونس': 'Africa/Tunis',
  'الجزائر': 'Africa/Algiers',
  'المغرب': 'Africa/Casablanca',
  'السودان': 'Africa/Khartoum',
  'اليمن': 'Asia/Aden'
};


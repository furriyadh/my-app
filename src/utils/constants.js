// Google Ads AI Platform - Constants
// ===================================================
// ثوابت المشروع والإعدادات العامة
// محدث بالـ OAuth client ID الجديد

// ===== API ENDPOINTS =====
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    GOOGLE_STATUS: '/oauth/status',
GOOGLE_INITIATE: '/oauth/login',
GOOGLE_CALLBACK: '/oauth/callback',
REFRESH_TOKEN: '/oauth/refresh',
LOGOUT: '/oauth/logout'
  },

  // Accounts
  ACCOUNTS: {
    LIST: '/accounts/google-ads',
    SELECT: '/accounts/select',
    DETAILS: '/accounts/:id',
    MCC: '/accounts/mcc'
  },

  // Campaigns
  CAMPAIGNS: {
    LIST: '/campaigns',
    CREATE: '/campaigns',
    UPDATE: '/campaigns/:id',
    DELETE: '/campaigns/:id',
    LAUNCH: '/campaigns/launch',
    PAUSE: '/campaigns/:id/pause',
    PERFORMANCE: '/campaigns/:id/performance'
  }
};

// ===== HTTP STATUS CODES =====
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// ===== LOCAL STORAGE KEYS ===== (محدث بالقيم الجديدة)
export const STORAGE_KEYS = {
  // OAuth Tokens - محدث للـ OAuth client الجديد
  AUTH_TOKEN: 'google_ads_auth_token_new',
  REFRESH_TOKEN: 'google_ads_refresh_token_new',
  USER_INFO: 'google_ads_user_info_new',
  SELECTED_ACCOUNT: 'google_ads_selected_account_new',
  CAMPAIGN_DRAFT: 'google_ads_campaign_draft_new',
  WEBSITE_DATA: 'google_ads_website_data_new',
  PREFERENCES: 'google_ads_preferences_new',
  THEME: 'google_ads_theme_new',
  LANGUAGE: 'google_ads_language_new'
};

// ===== EVENT NAMES =====
export const EVENTS = {
  AUTH_SUCCESS: 'auth:success',
  AUTH_FAILURE: 'auth:failure',
  AUTH_LOGOUT: 'auth:logout',
  CAMPAIGN_CREATED: 'campaign:created',
  CAMPAIGN_UPDATED: 'campaign:updated',
  CAMPAIGN_LAUNCHED: 'campaign:launched',
  WEBSITE_ANALYZED: 'website:analyzed',
  ERROR_OCCURRED: 'error:occurred'
};

// ===== REGEX PATTERNS =====
export const REGEX_PATTERNS = {
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  CURRENCY: /^\d+(\.\d{1,2})?$/,
  PERCENTAGE: /^(100|[1-9]?\d)(\.\d+)?$/
};

// ===== GOOGLE ADS CONFIGURATION ===== (محدث)
export const GOOGLE_ADS_CONFIG = {
  // OAuth Configuration - محدث بالـ client ID الجديد
  CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID,
  REDIRECT_URI: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || (process.env.NODE_ENV === 'production' ? 'https://furriyadh.com/api/oauth/google/callback' : 'http://localhost:3000/api/oauth/google/callback'), // تم توحيد المسار مع الباك اند
  
  // API Configuration
  DEVELOPER_TOKEN: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
  MCC_CUSTOMER_ID: process.env.MCC_LOGIN_CUSTOMER_ID || '',
  
  // OAuth Scopes
  SCOPES: [
    'https://www.googleapis.com/auth/adwords',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ],
  
  // API Version
  API_VERSION: 'v20',
  BASE_URL: 'https://googleads.googleapis.com'
};

// ===== CAMPAIGN DEFAULTS =====
export const CAMPAIGN_DEFAULTS = {
  BUDGET: {
    MIN: 10,
    MAX: 10000,
    DEFAULT: 100,
    CURRENCY: 'USD'
  },
  
  TARGETING: {
    LOCATIONS: ['Egypt', 'Saudi Arabia', 'UAE'],
    LANGUAGES: ['ar', 'en'],
    AGE_RANGES: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
    GENDERS: ['MALE', 'FEMALE', 'UNDETERMINED']
  },
  
  BIDDING: {
    STRATEGY: 'MAXIMIZE_CLICKS',
    MAX_CPC: 1.0,
    TARGET_CPA: 50.0,
    TARGET_ROAS: 4.0
  }
};

// ===== UI CONSTANTS =====
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  PAGINATION_SIZE: 20,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200
  }
};

// ===== ERROR MESSAGES ===== (بالعربية)
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'خطأ في الاتصال بالشبكة',
  AUTH_FAILED: 'فشل في المصادقة',
  INVALID_TOKEN: 'رمز المصادقة غير صالح',
  EXPIRED_TOKEN: 'انتهت صلاحية رمز المصادقة',
  PERMISSION_DENIED: 'ليس لديك صلاحية للوصول',
  INVALID_DATA: 'البيانات المدخلة غير صحيحة',
  SERVER_ERROR: 'خطأ في الخادم',
  UNKNOWN_ERROR: 'حدث خطأ غير معروف'
};

// ===== SUCCESS MESSAGES ===== (بالعربية)
export const SUCCESS_MESSAGES = {
  AUTH_SUCCESS: 'تم تسجيل الدخول بنجاح',
  LOGOUT_SUCCESS: 'تم تسجيل الخروج بنجاح',
  CAMPAIGN_CREATED: 'تم إنشاء الحملة بنجاح',
  CAMPAIGN_UPDATED: 'تم تحديث الحملة بنجاح',
  CAMPAIGN_LAUNCHED: 'تم إطلاق الحملة بنجاح',
  DATA_SAVED: 'تم حفظ البيانات بنجاح',
  SETTINGS_UPDATED: 'تم تحديث الإعدادات بنجاح'
};

// ===== LOADING MESSAGES ===== (بالعربية)
export const LOADING_MESSAGES = {
  AUTHENTICATING: 'جاري المصادقة...',
  LOADING_ACCOUNTS: 'جاري تحميل الحسابات...',
  CREATING_CAMPAIGN: 'جاري إنشاء الحملة...',
  ANALYZING_WEBSITE: 'جاري تحليل الموقع...',
  GENERATING_ADS: 'جاري إنشاء الإعلانات...',
  SAVING_DATA: 'جاري حفظ البيانات...'
};

// ===== THEME CONFIGURATION =====
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: '#4285f4',
    SECONDARY: '#34a853',
    SUCCESS: '#0f9d58',
    WARNING: '#fbbc04',
    ERROR: '#ea4335',
    INFO: '#4285f4'
  },
  
  FONTS: {
    PRIMARY: 'Inter, sans-serif',
    SECONDARY: 'Roboto, sans-serif',
    ARABIC: 'Cairo, sans-serif'
  }
};

// ===== VALIDATION RULES =====
export const VALIDATION_RULES = {
  CAMPAIGN_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    REQUIRED: true
  },
  
  BUDGET: {
    MIN: 1,
    MAX: 100000,
    REQUIRED: true
  },
  
  WEBSITE_URL: {
    REQUIRED: true,
    PATTERN: REGEX_PATTERNS.URL
  },
  
  EMAIL: {
    REQUIRED: true,
    PATTERN: REGEX_PATTERNS.EMAIL
  }
};

export default {
  API_ENDPOINTS,
  HTTP_STATUS,
  STORAGE_KEYS,
  EVENTS,
  REGEX_PATTERNS,
  GOOGLE_ADS_CONFIG,
  CAMPAIGN_DEFAULTS,
  UI_CONSTANTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_MESSAGES,
  THEME_CONFIG,
  VALIDATION_RULES
};


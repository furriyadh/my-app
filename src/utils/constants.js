// Google Ads AI Platform - Constants
// ===================================================

// ===== API ENDPOINTS =====
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    GOOGLE_STATUS: '/auth/google/status',
    GOOGLE_INITIATE: '/auth/google/initiate',
    GOOGLE_CALLBACK: '/auth/google/callback',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout'
  },
  
  // AI Processing
  AI: {
    ANALYZE_WEBSITE: '/ai/analyze-website',
    GENERATE_CAMPAIGN: '/ai/generate-campaign',
    OPTIMIZE_KEYWORDS: '/ai/optimize-keywords',
    GENERATE_ADS: '/ai/generate-ads'
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
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
};

// ===== LOCAL STORAGE KEYS =====
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'google_ads_auth_token',
  REFRESH_TOKEN: 'google_ads_refresh_token',
  USER_INFO: 'google_ads_user_info',
  SELECTED_ACCOUNT: 'google_ads_selected_account',
  CAMPAIGN_DRAFT: 'google_ads_campaign_draft',
  WEBSITE_DATA: 'google_ads_website_data',
  PREFERENCES: 'google_ads_preferences',
  THEME: 'google_ads_theme',
  LANGUAGE: 'google_ads_language'
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
  DOMAIN: /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/,
  IPV4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  ARABIC_TEXT: /[\u0600-\u06FF\u0750-\u077F]/,
  ENGLISH_TEXT: /^[a-zA-Z\s]+$/,
  NUMBERS_ONLY: /^\d+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/
};

// ===== LIMITS & CONSTRAINTS =====
export const LIMITS = {
  CAMPAIGN: {
    NAME_MIN_LENGTH: 3,
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 500,
    MIN_BUDGET: 1,
    MAX_BUDGET: 1000000,
    MAX_KEYWORDS: 20000,
    MAX_ADS_PER_GROUP: 50
  },
  
  AD: {
    HEADLINE_MIN_LENGTH: 15,
    HEADLINE_MAX_LENGTH: 30,
    DESCRIPTION_MIN_LENGTH: 35,
    DESCRIPTION_MAX_LENGTH: 90,
    MAX_HEADLINES: 15,
    MAX_DESCRIPTIONS: 4
  },
  
  KEYWORD: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 80,
    MAX_PER_GROUP: 20000
  },
  
  FILE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  
  API: {
    REQUEST_TIMEOUT: 30000, // 30 seconds
    MAX_RETRIES: 3,
    RATE_LIMIT: 100, // requests per minute
    BATCH_SIZE: 50
  }
};

// ===== DEFAULT CONFIGURATIONS =====
export const DEFAULT_CONFIG = {
  THEME: 'light',
  LANGUAGE: 'ar',
  CURRENCY: 'USD',
  TIMEZONE: 'Asia/Riyadh',
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: '24h',
  
  CAMPAIGN: {
    TYPE: 'SEARCH',
    STATUS: 'DRAFT',
    BID_STRATEGY: 'MAXIMIZE_CLICKS',
    BUDGET: 100,
    LANGUAGE: 'ar',
    LOCATIONS: ['SA'] // Saudi Arabia
  },
  
  PERFORMANCE: {
    TIME_RANGE: 'LAST_7_DAYS',
    METRICS: ['impressions', 'clicks', 'ctr', 'cpc', 'cost'],
    CHART_TYPE: 'line'
  },
  
  PAGINATION: {
    PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
  }
};

// ===== ERROR MESSAGES =====
export const ERROR_MESSAGES = {
  // Network Errors
  NETWORK_ERROR: 'خطأ في الاتصال بالشبكة',
  TIMEOUT_ERROR: 'انتهت مهلة الطلب',
  SERVER_ERROR: 'خطأ في الخادم',
  
  // Authentication Errors
  AUTH_REQUIRED: 'يجب تسجيل الدخول أولاً',
  AUTH_EXPIRED: 'انتهت صلاحية جلسة العمل',
  AUTH_INVALID: 'بيانات المصادقة غير صحيحة',
  PERMISSION_DENIED: 'ليس لديك صلاحية للوصول',
  
  // Validation Errors
  REQUIRED_FIELD: 'هذا الحقل مطلوب',
  INVALID_URL: 'رابط غير صحيح',
  INVALID_EMAIL: 'بريد إلكتروني غير صحيح',
  INVALID_PHONE: 'رقم هاتف غير صحيح',
  
  // Campaign Errors
  CAMPAIGN_NOT_FOUND: 'الحملة غير موجودة',
  CAMPAIGN_CREATION_FAILED: 'فشل في إنشاء الحملة',
  CAMPAIGN_UPDATE_FAILED: 'فشل في تحديث الحملة',
  BUDGET_TOO_LOW: 'الميزانية منخفضة جداً',
  BUDGET_TOO_HIGH: 'الميزانية مرتفعة جداً',
  
  // Website Analysis Errors
  WEBSITE_NOT_ACCESSIBLE: 'لا يمكن الوصول للموقع',
  WEBSITE_ANALYSIS_FAILED: 'فشل في تحليل الموقع',
  INSUFFICIENT_CONTENT: 'محتوى الموقع غير كافي للتحليل',
  
  // General Errors
  UNKNOWN_ERROR: 'حدث خطأ غير متوقع',
  OPERATION_FAILED: 'فشلت العملية',
  DATA_NOT_FOUND: 'البيانات غير موجودة'
};

// ===== SUCCESS MESSAGES =====
export const SUCCESS_MESSAGES = {
  AUTH_SUCCESS: 'تم تسجيل الدخول بنجاح',
  LOGOUT_SUCCESS: 'تم تسجيل الخروج بنجاح',
  CAMPAIGN_CREATED: 'تم إنشاء الحملة بنجاح',
  CAMPAIGN_UPDATED: 'تم تحديث الحملة بنجاح',
  CAMPAIGN_LAUNCHED: 'تم إطلاق الحملة بنجاح',
  CAMPAIGN_PAUSED: 'تم إيقاف الحملة بنجاح',
  WEBSITE_ANALYZED: 'تم تحليل الموقع بنجاح',
  DATA_SAVED: 'تم حفظ البيانات بنجاح',
  SETTINGS_UPDATED: 'تم تحديث الإعدادات بنجاح'
};

// ===== NOTIFICATION SETTINGS =====
export const NOTIFICATIONS = {
  DURATION: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 8000,
    PERSISTENT: 0
  },
  
  POSITIONS: {
    TOP_RIGHT: 'top-right',
    TOP_LEFT: 'top-left',
    TOP_CENTER: 'top-center',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_CENTER: 'bottom-center'
  },
  
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  }
};

// ===== ANIMATION SETTINGS =====
export const ANIMATIONS = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  
  EASING: {
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },
  
  VARIANTS: {
    FADE_IN: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    
    SLIDE_UP: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    },
    
    SCALE_IN: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 }
    }
  }
};

// ===== BREAKPOINTS =====
export const BREAKPOINTS = {
  XS: '480px',
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  XXL: '1536px'
};

// ===== Z-INDEX LAYERS =====
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080
};

// ===== GOOGLE ADS SPECIFIC =====
export const GOOGLE_ADS = {
  API_VERSION: 'v14',
  
  CUSTOMER_ID_FORMAT: /^\d{3}-\d{3}-\d{4}$/,
  
  REQUIRED_SCOPES: [
    'https://www.googleapis.com/auth/adwords',
    'https://www.googleapis.com/auth/userinfo.email'
  ],
  
  CAMPAIGN_SETTINGS: {
    MIN_DAILY_BUDGET: 1,
    MAX_DAILY_BUDGET: 1000000,
    DEFAULT_BID_STRATEGY: 'MAXIMIZE_CLICKS',
    SUPPORTED_LANGUAGES: ['ar', 'en'],
    SUPPORTED_CURRENCIES: ['USD', 'SAR', 'AED', 'EUR']
  }
};

// ===== FEATURE FLAGS =====
export const FEATURE_FLAGS = {
  ENABLE_DARK_MODE: true,
  ENABLE_RTL: true,
  ENABLE_ANALYTICS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_AUTO_SAVE: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_BETA_FEATURES: false
};

// ===== ENVIRONMENT VARIABLES =====
export const ENV_VARS = {
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN,
  ANALYTICS_ID: process.env.REACT_APP_ANALYTICS_ID,
  NODE_ENV: process.env.NODE_ENV || 'development'
};

// ===== EXPORT ALL =====
export default {
  API_ENDPOINTS,
  HTTP_STATUS,
  STORAGE_KEYS,
  EVENTS,
  REGEX_PATTERNS,
  LIMITS,
  DEFAULT_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  NOTIFICATIONS,
  ANIMATIONS,
  BREAKPOINTS,
  Z_INDEX,
  GOOGLE_ADS,
  FEATURE_FLAGS,
  ENV_VARS
};


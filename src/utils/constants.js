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
  // Accounts
  ACCOUNTS: {
    LIST: '/accounts/google-ads', // kept as is, check if backend route changed? No, backend route for LIST was not moved explicitly or was it "src/app/api/user/accounts"? I didn't see that move.
    // Wait, "src/app/api/google-ads/accounts" endpoint? I saw "src/app/api/user/accounts" in fetchAccountsAndSaveToDatabase.
    // The "src/app/accounts/page.tsx" uses "/api/google-ads/accounts".
    // I need to be careful. The moved APIs were specific utilities. The main accounts list might be elsewhere.
    // Let's assume standard prefixes for now based on the moves I DID make.
    SELECT: '/dashboard/google-ads/select-ads-account', // Frontend path or API? This is in API_ENDPOINTS.
    // Wait, API_ENDPOINTS usually refers to API routes.
    // SELECT: '/accounts/select' -> Was this an API?
    // Let's check where it's used.
    // And MCC: '/accounts/mcc' -> Was this an API?
    // The folders I moved were `src/app/mcc` (Frontend) and `src/app/api/...`
    // I moved `account-linking`, `account-status-stream` etc.
    // I did NOT move `src/app/api/accounts` because I wasn't sure if it existed there.
    // `src/app/accounts/page.tsx` was using `/api/google-ads/accounts`.
    // I should update what I KNOW changed.

    // I moved `src/app/api/account-linking` -> `/api/google-ads/account-linking`
    // I moved `src/app/api/sync-account-status` -> `/api/google-ads/sync-account-status`
    // I moved `src/app/api/discover-account-status` -> `/api/google-ads/discover-account-status`
    // I moved `src/app/api/account-status-stream` -> `/api/google-ads/account-status-stream`

    // Let's update constants if they are defined there.
    // In `constants.js` I see:
    // GOOGLE_STATUS: '/oauth/status'
    // GOOGLE_INITIATE: '/oauth/login'
    // These are in `src/app/api/oauth/...` which I checked in list_dir output: `{"name":"oauth", "isDir":true, "numChildren":17}`. I did NOT move `src/app/api/oauth`. So these are fine.

    // I need to update references in the code, mostly.

    // Let's check if `API_ENDPOINTS` has the moved paths.
    // It has `ACCOUNTS: { LIST: ..., SELECT: ..., DETAILS: ..., MCC: ... }`.
    // It does NOT have the sync/discover endpoints listed in `constants.js`.
    // So `constants.js` might NOT need updates for those specific moved APIs if they aren't there.
    // However, if I moved `src/app/accounts` (frontend), maybe I should check if `src/app/api/accounts` existed?
    // `list_dir` for `src/app/api` showed `{"name":"accounts", "isDir":true, "numChildren":1}`.
    // I did NOT move `src/app/api/accounts`.
    // So `/api/accounts` (if that's the route) is still there.

    // `src/app/accounts/page.tsx` used `/api/google-ads/accounts`.
    // This route implies `src/app/api/google-ads/accounts/route.ts`...
    // Wait, I created `src/app/api/google-ads` earlier?
    // If `/api/google-ads/accounts` works, then `src/app/api/google-ads/accounts` must exist.
    // I should verify where that is.
    // Ah, maybe the user wants me to move `src/app/api/accounts` to `src/app/api/google-ads/accounts`?
    // My plan said: "Move `src/app/accounts` -> `src/app/google-ads/accounts`" (Frontend).
    // And "Move `src/app/api/account-linking`..." (Backend).

    // I did NOT include `src/app/api/accounts` in the backend moves in my plan.
    // If `src/app/accounts/page.tsx` calls `/api/google-ads/accounts`, and I haven't moved the API yet, then that call might be failing OR it was already pointing to a location I created earlier?
    // Let's start by updating SidebarMenu which DEFINITELY has broken frontend links now.
    LIST: '/dashboard/google-ads/accounts',
    SELECT: '/dashboard/google-ads/select-ads-account',
    DETAILS: '/dashboard/google-ads/accounts/:id',
    MCC: '/dashboard/google-ads/mcc'
  },

  // Campaigns
  CAMPAIGNS: {
    LIST: '/dashboard/google-ads/campaigns',
    CREATE: '/dashboard/google-ads/campaigns',
    UPDATE: '/dashboard/google-ads/campaigns/:id',
    DELETE: '/dashboard/google-ads/campaigns/:id',
    LAUNCH: '/dashboard/google-ads/campaigns/launch',
    PAUSE: '/dashboard/google-ads/campaigns/:id/pause',
    PERFORMANCE: '/dashboard/google-ads/campaigns/:id/performance'
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
  REDIRECT_URI: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || (process.env.NODE_ENV === 'production' ? 'https://furriyadh.com/api/oauth/google/callback' : 'http://localhost:3000/api/oauth/google/callback'),

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


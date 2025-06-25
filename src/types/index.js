// Google Ads AI Platform - Types & Constants
// ===================================================

// ===== CAMPAIGN TYPES =====
export const CAMPAIGN_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  REMOVED: 'REMOVED',
  ENDED: 'ENDED'
};

export const CAMPAIGN_TYPES = {
  SEARCH: 'SEARCH',
  DISPLAY: 'DISPLAY',
  SHOPPING: 'SHOPPING',
  VIDEO: 'VIDEO',
  SMART: 'SMART',
  PERFORMANCE_MAX: 'PERFORMANCE_MAX'
};

export const BID_STRATEGIES = {
  MANUAL_CPC: 'MANUAL_CPC',
  ENHANCED_CPC: 'ENHANCED_CPC',
  MAXIMIZE_CLICKS: 'MAXIMIZE_CLICKS',
  MAXIMIZE_CONVERSIONS: 'MAXIMIZE_CONVERSIONS',
  TARGET_CPA: 'TARGET_CPA',
  TARGET_ROAS: 'TARGET_ROAS',
  MAXIMIZE_CONVERSION_VALUE: 'MAXIMIZE_CONVERSION_VALUE'
};

// ===== USER & AUTH TYPES =====
export const AUTH_STATUS = {
  AUTHENTICATED: 'AUTHENTICATED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  PENDING: 'PENDING',
  ERROR: 'ERROR'
};

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  VIEWER: 'VIEWER'
};

export const OAUTH_SCOPES = {
  GOOGLE_ADS: 'https://www.googleapis.com/auth/adwords',
  GOOGLE_ADS_READONLY: 'https://www.googleapis.com/auth/adwords.readonly',
  USERINFO_EMAIL: 'https://www.googleapis.com/auth/userinfo.email',
  USERINFO_PROFILE: 'https://www.googleapis.com/auth/userinfo.profile'
};

// ===== WORKFLOW STEPS =====
export const WORKFLOW_STEPS = {
  WEBSITE: 'website',
  PROCESSING: 'processing',
  AUTH: 'auth',
  ACCOUNT: 'account',
  RESULTS: 'results',
  DASHBOARD: 'dashboard'
};

export const STEP_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR',
  SKIPPED: 'SKIPPED'
};

// ===== API RESPONSE TYPES =====
export const API_STATUS = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  LOADING: 'LOADING',
  IDLE: 'IDLE'
};

export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// ===== ACCOUNT TYPES =====
export const ACCOUNT_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  CANCELLED: 'CANCELLED'
};

export const ACCOUNT_TYPES = {
  INDIVIDUAL: 'INDIVIDUAL',
  BUSINESS: 'BUSINESS',
  MCC: 'MCC'
};

// ===== AD TYPES =====
export const AD_TYPES = {
  TEXT_AD: 'TEXT_AD',
  EXPANDED_TEXT_AD: 'EXPANDED_TEXT_AD',
  RESPONSIVE_SEARCH_AD: 'RESPONSIVE_SEARCH_AD',
  DISPLAY_AD: 'DISPLAY_AD',
  VIDEO_AD: 'VIDEO_AD',
  SHOPPING_AD: 'SHOPPING_AD'
};

export const AD_STATUS = {
  ENABLED: 'ENABLED',
  PAUSED: 'PAUSED',
  REMOVED: 'REMOVED'
};

// ===== KEYWORD TYPES =====
export const KEYWORD_MATCH_TYPES = {
  EXACT: 'EXACT',
  PHRASE: 'PHRASE',
  BROAD: 'BROAD',
  BROAD_MODIFIED: 'BROAD_MODIFIED'
};

export const KEYWORD_STATUS = {
  ENABLED: 'ENABLED',
  PAUSED: 'PAUSED',
  REMOVED: 'REMOVED'
};

// ===== PERFORMANCE METRICS =====
export const PERFORMANCE_METRICS = {
  IMPRESSIONS: 'impressions',
  CLICKS: 'clicks',
  CTR: 'ctr',
  CPC: 'cpc',
  COST: 'cost',
  CONVERSIONS: 'conversions',
  CONVERSION_RATE: 'conversion_rate',
  CPA: 'cpa',
  ROAS: 'roas',
  QUALITY_SCORE: 'quality_score'
};

export const TIME_RANGES = {
  TODAY: 'TODAY',
  YESTERDAY: 'YESTERDAY',
  LAST_7_DAYS: 'LAST_7_DAYS',
  LAST_14_DAYS: 'LAST_14_DAYS',
  LAST_30_DAYS: 'LAST_30_DAYS',
  LAST_90_DAYS: 'LAST_90_DAYS',
  THIS_MONTH: 'THIS_MONTH',
  LAST_MONTH: 'LAST_MONTH',
  THIS_YEAR: 'THIS_YEAR',
  LAST_YEAR: 'LAST_YEAR',
  CUSTOM: 'CUSTOM'
};

// ===== CURRENCIES =====
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  SAR: 'SAR',
  AED: 'AED',
  EGP: 'EGP',
  JOD: 'JOD',
  KWD: 'KWD',
  QAR: 'QAR',
  BHD: 'BHD',
  OMR: 'OMR'
};

// ===== LANGUAGES =====
export const LANGUAGES = {
  AR: 'ar',
  EN: 'en',
  FR: 'fr',
  ES: 'es',
  DE: 'de'
};

// ===== COUNTRIES/LOCATIONS =====
export const COUNTRIES = {
  SA: 'SA', // Saudi Arabia
  AE: 'AE', // UAE
  EG: 'EG', // Egypt
  JO: 'JO', // Jordan
  KW: 'KW', // Kuwait
  QA: 'QA', // Qatar
  BH: 'BH', // Bahrain
  OM: 'OM', // Oman
  US: 'US', // United States
  GB: 'GB', // United Kingdom
  FR: 'FR', // France
  DE: 'DE', // Germany
  ES: 'ES'  // Spain
};

// ===== DEVICE TYPES =====
export const DEVICE_TYPES = {
  DESKTOP: 'DESKTOP',
  MOBILE: 'MOBILE',
  TABLET: 'TABLET'
};

// ===== NOTIFICATION TYPES =====
export const NOTIFICATION_TYPES = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  WARNING: 'WARNING',
  INFO: 'INFO'
};

// ===== PROCESSING STEPS =====
export const PROCESSING_STEPS = {
  ANALYZING_WEBSITE: 'ANALYZING_WEBSITE',
  EXTRACTING_KEYWORDS: 'EXTRACTING_KEYWORDS',
  GENERATING_ADS: 'GENERATING_ADS',
  OPTIMIZING_CAMPAIGN: 'OPTIMIZING_CAMPAIGN',
  FINALIZING: 'FINALIZING'
};

// ===== DEFAULT VALUES =====
export const DEFAULT_VALUES = {
  CAMPAIGN: {
    budget: 100,
    bidStrategy: BID_STRATEGIES.MAXIMIZE_CLICKS,
    type: CAMPAIGN_TYPES.SEARCH,
    status: CAMPAIGN_STATUS.DRAFT,
    language: LANGUAGES.AR,
    currency: CURRENCIES.USD
  },
  AD: {
    type: AD_TYPES.RESPONSIVE_SEARCH_AD,
    status: AD_STATUS.ENABLED
  },
  KEYWORD: {
    matchType: KEYWORD_MATCH_TYPES.BROAD,
    status: KEYWORD_STATUS.ENABLED,
    maxCpc: 1.0
  },
  PERFORMANCE: {
    timeRange: TIME_RANGES.LAST_7_DAYS,
    metrics: [
      PERFORMANCE_METRICS.IMPRESSIONS,
      PERFORMANCE_METRICS.CLICKS,
      PERFORMANCE_METRICS.CTR,
      PERFORMANCE_METRICS.CPC,
      PERFORMANCE_METRICS.COST
    ]
  }
};

// ===== VALIDATION RULES =====
export const VALIDATION_RULES = {
  WEBSITE_URL: {
    pattern: /^https?:\/\/.+/,
    message: 'يجب أن يكون الرابط صحيحاً ويبدأ بـ http أو https'
  },
  EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'يجب أن يكون البريد الإلكتروني صحيحاً'
  },
  CAMPAIGN_NAME: {
    minLength: 3,
    maxLength: 100,
    message: 'يجب أن يكون اسم الحملة بين 3 و 100 حرف'
  },
  BUDGET: {
    min: 1,
    max: 1000000,
    message: 'يجب أن تكون الميزانية بين 1 و 1,000,000'
  },
  KEYWORD: {
    minLength: 2,
    maxLength: 80,
    message: 'يجب أن تكون الكلمة المفتاحية بين 2 و 80 حرف'
  }
};

// ===== UI CONSTANTS =====
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  AUTO_REFRESH_INTERVAL: 30000,
  MAX_RETRIES: 3,
  TOAST_DURATION: 5000,
  MODAL_Z_INDEX: 1000,
  DROPDOWN_Z_INDEX: 999
};

// ===== HELPER FUNCTIONS =====
export const getStatusColor = (status) => {
  const colors = {
    [CAMPAIGN_STATUS.ACTIVE]: 'green',
    [CAMPAIGN_STATUS.PAUSED]: 'yellow',
    [CAMPAIGN_STATUS.DRAFT]: 'gray',
    [CAMPAIGN_STATUS.REMOVED]: 'red',
    [CAMPAIGN_STATUS.ENDED]: 'gray'
  };
  return colors[status] || 'gray';
};

export const getStatusText = (status) => {
  const texts = {
    [CAMPAIGN_STATUS.ACTIVE]: 'نشطة',
    [CAMPAIGN_STATUS.PAUSED]: 'متوقفة',
    [CAMPAIGN_STATUS.DRAFT]: 'مسودة',
    [CAMPAIGN_STATUS.REMOVED]: 'محذوفة',
    [CAMPAIGN_STATUS.ENDED]: 'منتهية'
  };
  return texts[status] || status;
};

export const formatCurrency = (amount, currency = CURRENCIES.USD) => {
  const formatter = new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  });
  return formatter.format(amount);
};

export const formatPercentage = (value) => {
  return `${(value * 100).toFixed(2)}%`;
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat('ar-SA').format(number);
};

export const isValidUrl = (url) => {
  return VALIDATION_RULES.WEBSITE_URL.pattern.test(url);
};

export const isValidEmail = (email) => {
  return VALIDATION_RULES.EMAIL.pattern.test(email);
};

// ===== TYPE DEFINITIONS (for JSDoc) =====

/**
 * @typedef {Object} Campaign
 * @property {string} id - Campaign ID
 * @property {string} name - Campaign name
 * @property {string} status - Campaign status
 * @property {string} type - Campaign type
 * @property {number} budget - Daily budget
 * @property {string} bidStrategy - Bid strategy
 * @property {string} currency - Currency code
 * @property {string} language - Language code
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} name - User name
 * @property {string} picture - Profile picture URL
 * @property {string[]} scopes - OAuth scopes
 * @property {string} role - User role
 */

/**
 * @typedef {Object} Account
 * @property {string} id - Account ID
 * @property {string} name - Account name
 * @property {string} currency - Account currency
 * @property {string} status - Account status
 * @property {string} type - Account type
 */

/**
 * @typedef {Object} Performance
 * @property {number} impressions - Number of impressions
 * @property {number} clicks - Number of clicks
 * @property {number} ctr - Click-through rate
 * @property {number} cpc - Cost per click
 * @property {number} cost - Total cost
 * @property {number} conversions - Number of conversions
 * @property {number} conversionRate - Conversion rate
 * @property {number} cpa - Cost per acquisition
 * @property {number} roas - Return on ad spend
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Success status
 * @property {*} data - Response data
 * @property {string} error - Error message
 * @property {string} message - Success message
 */

// Export all constants as default
export default {
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPES,
  BID_STRATEGIES,
  AUTH_STATUS,
  USER_ROLES,
  OAUTH_SCOPES,
  WORKFLOW_STEPS,
  STEP_STATUS,
  API_STATUS,
  ERROR_TYPES,
  ACCOUNT_STATUS,
  ACCOUNT_TYPES,
  AD_TYPES,
  AD_STATUS,
  KEYWORD_MATCH_TYPES,
  KEYWORD_STATUS,
  PERFORMANCE_METRICS,
  TIME_RANGES,
  CURRENCIES,
  LANGUAGES,
  COUNTRIES,
  DEVICE_TYPES,
  NOTIFICATION_TYPES,
  PROCESSING_STEPS,
  DEFAULT_VALUES,
  VALIDATION_RULES,
  UI_CONSTANTS,
  getStatusColor,
  getStatusText,
  formatCurrency,
  formatPercentage,
  formatNumber,
  isValidUrl,
  isValidEmail
};


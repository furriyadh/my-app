// Google Ads AI Platform - Helper Functions
// ===================================================

import { REGEX_PATTERNS, DEFAULT_CONFIG, STORAGE_KEYS } from './constants';

// ===== STRING UTILITIES =====

/**
 * Capitalize first letter of a string
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert string to title case
 * @param {string} str - Input string
 * @returns {string} Title case string
 */
export const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.split(' ').map(word => capitalize(word)).join(' ');
};

/**
 * Truncate string with ellipsis
 * @param {string} str - Input string
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
export const truncate = (str, maxLength = 50) => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
};

/**
 * Generate slug from string
 * @param {string} str - Input string
 * @returns {string} URL-friendly slug
 */
export const slugify = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Remove HTML tags from string
 * @param {string} html - HTML string
 * @returns {string} Clean text
 */
export const stripHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Extract domain from URL
 * @param {string} url - URL string
 * @returns {string} Domain name
 */
export const extractDomain = (url) => {
  if (!url || typeof url !== 'string') return '';
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

// ===== NUMBER UTILITIES =====

/**
 * Format number with commas
 * @param {number} num - Input number
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  return new Intl.NumberFormat('ar-SA').format(num);
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0';
  
  const formatter = new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
};

/**
 * Format percentage
 * @param {number} value - Value to format (0-1 or 0-100)
 * @param {boolean} isDecimal - Whether input is decimal (0-1)
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, isDecimal = true) => {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  
  const percentage = isDecimal ? value * 100 : value;
  return `${percentage.toFixed(2)}%`;
};

/**
 * Round number to specified decimal places
 * @param {number} num - Number to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded number
 */
export const roundTo = (num, decimals = 2) => {
  if (typeof num !== 'number' || isNaN(num)) return 0;
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Generate random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
export const randomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ===== DATE UTILITIES =====

/**
 * Format date
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Intl.DateTimeFormat('ar-SA', options).format(dateObj);
};

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return `منذ ${interval} ${getArabicTimeUnit(unit, interval)}`;
    }
  }
  
  return 'الآن';
};

/**
 * Get Arabic time unit
 * @param {string} unit - Time unit
 * @param {number} count - Count
 * @returns {string} Arabic time unit
 */
const getArabicTimeUnit = (unit, count) => {
  const units = {
    year: count === 1 ? 'سنة' : count === 2 ? 'سنتين' : 'سنوات',
    month: count === 1 ? 'شهر' : count === 2 ? 'شهرين' : 'أشهر',
    week: count === 1 ? 'أسبوع' : count === 2 ? 'أسبوعين' : 'أسابيع',
    day: count === 1 ? 'يوم' : count === 2 ? 'يومين' : 'أيام',
    hour: count === 1 ? 'ساعة' : count === 2 ? 'ساعتين' : 'ساعات',
    minute: count === 1 ? 'دقيقة' : count === 2 ? 'دقيقتين' : 'دقائق'
  };
  
  return units[unit] || unit;
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  const today = new Date();
  
  return dateObj.toDateString() === today.toDateString();
};

// ===== ARRAY UTILITIES =====

/**
 * Remove duplicates from array
 * @param {Array} arr - Input array
 * @param {string} key - Key to compare for objects
 * @returns {Array} Array without duplicates
 */
export const removeDuplicates = (arr, key = null) => {
  if (!Array.isArray(arr)) return [];
  
  if (key) {
    const seen = new Set();
    return arr.filter(item => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }
  
  return [...new Set(arr)];
};

/**
 * Chunk array into smaller arrays
 * @param {Array} arr - Input array
 * @param {number} size - Chunk size
 * @returns {Array} Array of chunks
 */
export const chunkArray = (arr, size) => {
  if (!Array.isArray(arr) || size <= 0) return [];
  
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

/**
 * Shuffle array
 * @param {Array} arr - Input array
 * @returns {Array} Shuffled array
 */
export const shuffleArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ===== OBJECT UTILITIES =====

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (obj) => {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Get nested object property safely
 * @param {Object} obj - Object to traverse
 * @param {string} path - Property path (e.g., 'user.profile.name')
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Property value or default
 */
export const getNestedProperty = (obj, path, defaultValue = null) => {
  if (!obj || typeof path !== 'string') return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') return defaultValue;
    result = result[key];
  }
  
  return result !== undefined ? result : defaultValue;
};

// ===== VALIDATION UTILITIES =====

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return REGEX_PATTERNS.URL.test(url);
};

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return REGEX_PATTERNS.EMAIL.test(email);
};

/**
 * Validate phone number
 * @param {string} phone - Phone to validate
 * @returns {boolean} True if valid
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  return REGEX_PATTERNS.PHONE.test(phone);
};

/**
 * Check if string contains Arabic text
 * @param {string} text - Text to check
 * @returns {boolean} True if contains Arabic
 */
export const hasArabicText = (text) => {
  if (!text || typeof text !== 'string') return false;
  return REGEX_PATTERNS.ARABIC_TEXT.test(text);
};

// ===== LOCAL STORAGE UTILITIES =====

/**
 * Set item in localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} True if successful
 */
export const setStorageItem = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error('Error setting localStorage item:', error);
    return false;
  }
};

/**
 * Get item from localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Stored value or default
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error getting localStorage item:', error);
    return defaultValue;
  }
};

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} True if successful
 */
export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing localStorage item:', error);
    return false;
  }
};

/**
 * Clear all localStorage items
 * @returns {boolean} True if successful
 */
export const clearStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

// ===== ID GENERATION =====

/**
 * Generate unique ID
 * @param {string} prefix - ID prefix
 * @returns {string} Unique ID
 */
export const generateId = (prefix = 'id') => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${randomStr}`;
};

/**
 * Generate campaign ID
 * @returns {string} Campaign ID
 */
export const generateCampaignId = () => {
  return generateId('camp');
};

/**
 * Generate analysis ID
 * @returns {string} Analysis ID
 */
export const generateAnalysisId = () => {
  return generateId('analysis');
};

/**
 * Generate UUID v4
 * @returns {string} UUID
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// ===== UTILITY FUNCTIONS =====

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxAttempts - Maximum attempts
 * @param {number} delay - Initial delay
 * @returns {Promise} Promise with result or error
 */
export const retry = async (fn, maxAttempts = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await sleep(delay * Math.pow(2, attempt - 1));
    }
  }
};

/**
 * Sanitize text for safe display
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} True if successful
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

// ===== EXPORT ALL =====
export default {
  // String utilities
  capitalize,
  toTitleCase,
  truncate,
  slugify,
  stripHtml,
  extractDomain,
  
  // Number utilities
  formatNumber,
  formatCurrency,
  formatPercentage,
  roundTo,
  randomBetween,
  
  // Date utilities
  formatDate,
  getRelativeTime,
  isToday,
  
  // Array utilities
  removeDuplicates,
  chunkArray,
  shuffleArray,
  
  // Object utilities
  deepClone,
  isEmpty,
  getNestedProperty,
  
  // Validation utilities
  isValidUrl,
  isValidEmail,
  isValidPhone,
  hasArabicText,
  
  // Storage utilities
  setStorageItem,
  getStorageItem,
  removeStorageItem,
  clearStorage,
  
  // ID generation
  generateId,
  generateCampaignId,
  generateAnalysisId,
  generateUUID,
  
  // Utility functions
  debounce,
  throttle,
  sleep,
  retry,
  sanitizeText,
  copyToClipboard
};


// Google Ads AI Platform - Validation Functions
// ===================================================

import { REGEX_PATTERNS, LIMITS, ERROR_MESSAGES } from './constants';

// ===== BASIC VALIDATION FUNCTIONS =====

/**
 * Check if value is required and not empty
 * @param {*} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const validateRequired = (value, fieldName = 'الحقل') => {
  const isEmpty = value === null || 
                  value === undefined || 
                  value === '' || 
                  (Array.isArray(value) && value.length === 0) ||
                  (typeof value === 'object' && Object.keys(value).length === 0);
  
  return {
    isValid: !isEmpty,
    error: isEmpty ? `${fieldName} مطلوب` : null
  };
};

/**
 * Validate string length
 * @param {string} value - String to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const validateLength = (value, min = 0, max = Infinity, fieldName = 'الحقل') => {
  if (typeof value !== 'string') {
    return {
      isValid: false,
      error: `${fieldName} يجب أن يكون نص`
    };
  }
  
  const length = value.length;
  
  if (length < min) {
    return {
      isValid: false,
      error: `${fieldName} يجب أن يكون على الأقل ${min} أحرف`
    };
  }
  
  if (length > max) {
    return {
      isValid: false,
      error: `${fieldName} يجب ألا يزيد عن ${max} حرف`
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};

/**
 * Validate number range
 * @param {number} value - Number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const validateRange = (value, min = -Infinity, max = Infinity, fieldName = 'الحقل') => {
  if (typeof value !== 'number' || isNaN(value)) {
    return {
      isValid: false,
      error: `${fieldName} يجب أن يكون رقم صحيح`
    };
  }
  
  if (value < min) {
    return {
      isValid: false,
      error: `${fieldName} يجب أن يكون على الأقل ${min}`
    };
  }
  
  if (value > max) {
    return {
      isValid: false,
      error: `${fieldName} يجب ألا يزيد عن ${max}`
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};

/**
 * Validate using regex pattern
 * @param {string} value - Value to validate
 * @param {RegExp} pattern - Regex pattern
 * @param {string} errorMessage - Error message
 * @returns {Object} Validation result
 */
export const validatePattern = (value, pattern, errorMessage) => {
  if (typeof value !== 'string') {
    return {
      isValid: false,
      error: errorMessage || 'قيمة غير صحيحة'
    };
  }
  
  const isValid = pattern.test(value);
  
  return {
    isValid,
    error: isValid ? null : errorMessage || 'تنسيق غير صحيح'
  };
};

// ===== SPECIFIC VALIDATION FUNCTIONS =====

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {Object} Validation result
 */
export const validateUrl = (url) => {
  const requiredCheck = validateRequired(url, 'رابط الموقع');
  if (!requiredCheck.isValid) return requiredCheck;
  
  return validatePattern(
    url,
    REGEX_PATTERNS.URL,
    ERROR_MESSAGES.INVALID_URL
  );
};

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {Object} Validation result
 */
export const validateEmail = (email) => {
  const requiredCheck = validateRequired(email, 'البريد الإلكتروني');
  if (!requiredCheck.isValid) return requiredCheck;
  
  return validatePattern(
    email,
    REGEX_PATTERNS.EMAIL,
    ERROR_MESSAGES.INVALID_EMAIL
  );
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {Object} Validation result
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return { isValid: true, error: null }; // Phone is optional
  }
  
  return validatePattern(
    phone,
    REGEX_PATTERNS.PHONE,
    ERROR_MESSAGES.INVALID_PHONE
  );
};

// ===== CAMPAIGN VALIDATION FUNCTIONS =====

/**
 * Validate campaign name
 * @param {string} name - Campaign name
 * @returns {Object} Validation result
 */
export const validateCampaignName = (name) => {
  const requiredCheck = validateRequired(name, 'اسم الحملة');
  if (!requiredCheck.isValid) return requiredCheck;
  
  return validateLength(
    name,
    LIMITS.CAMPAIGN.NAME_MIN_LENGTH,
    LIMITS.CAMPAIGN.NAME_MAX_LENGTH,
    'اسم الحملة'
  );
};

/**
 * Validate campaign budget
 * @param {number} budget - Campaign budget
 * @returns {Object} Validation result
 */
export const validateCampaignBudget = (budget) => {
  const requiredCheck = validateRequired(budget, 'ميزانية الحملة');
  if (!requiredCheck.isValid) return requiredCheck;
  
  return validateRange(
    budget,
    LIMITS.CAMPAIGN.MIN_BUDGET,
    LIMITS.CAMPAIGN.MAX_BUDGET,
    'ميزانية الحملة'
  );
};

/**
 * Validate campaign description
 * @param {string} description - Campaign description
 * @returns {Object} Validation result
 */
export const validateCampaignDescription = (description) => {
  if (!description) {
    return { isValid: true, error: null }; // Description is optional
  }
  
  return validateLength(
    description,
    0,
    LIMITS.CAMPAIGN.DESCRIPTION_MAX_LENGTH,
    'وصف الحملة'
  );
};

// ===== AD VALIDATION FUNCTIONS =====

/**
 * Validate ad headline
 * @param {string} headline - Ad headline
 * @returns {Object} Validation result
 */
export const validateAdHeadline = (headline) => {
  const requiredCheck = validateRequired(headline, 'عنوان الإعلان');
  if (!requiredCheck.isValid) return requiredCheck;
  
  return validateLength(
    headline,
    LIMITS.AD.HEADLINE_MIN_LENGTH,
    LIMITS.AD.HEADLINE_MAX_LENGTH,
    'عنوان الإعلان'
  );
};

/**
 * Validate ad description
 * @param {string} description - Ad description
 * @returns {Object} Validation result
 */
export const validateAdDescription = (description) => {
  const requiredCheck = validateRequired(description, 'وصف الإعلان');
  if (!requiredCheck.isValid) return requiredCheck;
  
  return validateLength(
    description,
    LIMITS.AD.DESCRIPTION_MIN_LENGTH,
    LIMITS.AD.DESCRIPTION_MAX_LENGTH,
    'وصف الإعلان'
  );
};

/**
 * Validate multiple ad headlines
 * @param {Array} headlines - Array of headlines
 * @returns {Object} Validation result
 */
export const validateAdHeadlines = (headlines) => {
  if (!Array.isArray(headlines)) {
    return {
      isValid: false,
      error: 'عناوين الإعلان يجب أن تكون مصفوفة'
    };
  }
  
  if (headlines.length === 0) {
    return {
      isValid: false,
      error: 'يجب إضافة عنوان واحد على الأقل'
    };
  }
  
  if (headlines.length > LIMITS.AD.MAX_HEADLINES) {
    return {
      isValid: false,
      error: `عدد العناوين يجب ألا يزيد عن ${LIMITS.AD.MAX_HEADLINES}`
    };
  }
  
  // Validate each headline
  for (let i = 0; i < headlines.length; i++) {
    const validation = validateAdHeadline(headlines[i]);
    if (!validation.isValid) {
      return {
        isValid: false,
        error: `العنوان ${i + 1}: ${validation.error}`
      };
    }
  }
  
  return {
    isValid: true,
    error: null
  };
};

/**
 * Validate multiple ad descriptions
 * @param {Array} descriptions - Array of descriptions
 * @returns {Object} Validation result
 */
export const validateAdDescriptions = (descriptions) => {
  if (!Array.isArray(descriptions)) {
    return {
      isValid: false,
      error: 'أوصاف الإعلان يجب أن تكون مصفوفة'
    };
  }
  
  if (descriptions.length === 0) {
    return {
      isValid: false,
      error: 'يجب إضافة وصف واحد على الأقل'
    };
  }
  
  if (descriptions.length > LIMITS.AD.MAX_DESCRIPTIONS) {
    return {
      isValid: false,
      error: `عدد الأوصاف يجب ألا يزيد عن ${LIMITS.AD.MAX_DESCRIPTIONS}`
    };
  }
  
  // Validate each description
  for (let i = 0; i < descriptions.length; i++) {
    const validation = validateAdDescription(descriptions[i]);
    if (!validation.isValid) {
      return {
        isValid: false,
        error: `الوصف ${i + 1}: ${validation.error}`
      };
    }
  }
  
  return {
    isValid: true,
    error: null
  };
};

// ===== KEYWORD VALIDATION FUNCTIONS =====

/**
 * Validate keyword
 * @param {string} keyword - Keyword to validate
 * @returns {Object} Validation result
 */
export const validateKeyword = (keyword) => {
  const requiredCheck = validateRequired(keyword, 'الكلمة المفتاحية');
  if (!requiredCheck.isValid) return requiredCheck;
  
  return validateLength(
    keyword,
    LIMITS.KEYWORD.MIN_LENGTH,
    LIMITS.KEYWORD.MAX_LENGTH,
    'الكلمة المفتاحية'
  );
};

/**
 * Validate keywords array
 * @param {Array} keywords - Array of keywords
 * @returns {Object} Validation result
 */
export const validateKeywords = (keywords) => {
  if (!Array.isArray(keywords)) {
    return {
      isValid: false,
      error: 'الكلمات المفتاحية يجب أن تكون مصفوفة'
    };
  }
  
  if (keywords.length === 0) {
    return {
      isValid: false,
      error: 'يجب إضافة كلمة مفتاحية واحدة على الأقل'
    };
  }
  
  // Validate each keyword
  for (let i = 0; i < keywords.length; i++) {
    const validation = validateKeyword(keywords[i]);
    if (!validation.isValid) {
      return {
        isValid: false,
        error: `الكلمة المفتاحية ${i + 1}: ${validation.error}`
      };
    }
  }
  
  // Check for duplicates
  const uniqueKeywords = [...new Set(keywords.map(k => k.toLowerCase()))];
  if (uniqueKeywords.length !== keywords.length) {
    return {
      isValid: false,
      error: 'توجد كلمات مفتاحية مكررة'
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};

// ===== FORM VALIDATION FUNCTIONS =====

/**
 * Validate entire form object
 * @param {Object} formData - Form data to validate
 * @param {Object} validationRules - Validation rules
 * @returns {Object} Validation result with errors object
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isFormValid = true;
  
  for (const [fieldName, rules] of Object.entries(validationRules)) {
    const fieldValue = formData[fieldName];
    const fieldErrors = [];
    
    // Apply each validation rule
    for (const rule of rules) {
      let validation;
      
      switch (rule.type) {
        case 'required':
          validation = validateRequired(fieldValue, rule.message || fieldName);
          break;
          
        case 'length':
          validation = validateLength(
            fieldValue,
            rule.min || 0,
            rule.max || Infinity,
            rule.message || fieldName
          );
          break;
          
        case 'range':
          validation = validateRange(
            fieldValue,
            rule.min || -Infinity,
            rule.max || Infinity,
            rule.message || fieldName
          );
          break;
          
        case 'pattern':
          validation = validatePattern(
            fieldValue,
            rule.pattern,
            rule.message || 'تنسيق غير صحيح'
          );
          break;
          
        case 'email':
          validation = validateEmail(fieldValue);
          break;
          
        case 'url':
          validation = validateUrl(fieldValue);
          break;
          
        case 'phone':
          validation = validatePhone(fieldValue);
          break;
          
        case 'custom':
          validation = rule.validator(fieldValue);
          break;
          
        default:
          validation = { isValid: true, error: null };
      }
      
      if (!validation.isValid) {
        fieldErrors.push(validation.error);
        isFormValid = false;
      }
    }
    
    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors;
    }
  }
  
  return {
    isValid: isFormValid,
    errors
  };
};

// ===== WEBSITE ANALYSIS VALIDATION =====

/**
 * Validate website analysis form
 * @param {Object} data - Website analysis data
 * @returns {Object} Validation result
 */
export const validateWebsiteAnalysis = (data) => {
  const validationRules = {
    websiteUrl: [
      { type: 'required' },
      { type: 'url' }
    ]
  };
  
  return validateForm(data, validationRules);
};

// ===== CAMPAIGN CREATION VALIDATION =====

/**
 * Validate campaign creation form
 * @param {Object} data - Campaign data
 * @returns {Object} Validation result
 */
export const validateCampaignCreation = (data) => {
  const validationRules = {
    name: [
      { type: 'required' },
      { 
        type: 'length', 
        min: LIMITS.CAMPAIGN.NAME_MIN_LENGTH, 
        max: LIMITS.CAMPAIGN.NAME_MAX_LENGTH 
      }
    ],
    budget: [
      { type: 'required' },
      { 
        type: 'range', 
        min: LIMITS.CAMPAIGN.MIN_BUDGET, 
        max: LIMITS.CAMPAIGN.MAX_BUDGET 
      }
    ],
    description: [
      { 
        type: 'length', 
        max: LIMITS.CAMPAIGN.DESCRIPTION_MAX_LENGTH 
      }
    ]
  };
  
  const formValidation = validateForm(data, validationRules);
  
  // Additional validations
  if (data.keywords && data.keywords.length > 0) {
    const keywordsValidation = validateKeywords(data.keywords);
    if (!keywordsValidation.isValid) {
      formValidation.isValid = false;
      formValidation.errors.keywords = [keywordsValidation.error];
    }
  }
  
  return formValidation;
};

// ===== AD CREATION VALIDATION =====

/**
 * Validate ad creation form
 * @param {Object} data - Ad data
 * @returns {Object} Validation result
 */
export const validateAdCreation = (data) => {
  const errors = {};
  let isValid = true;
  
  // Validate headlines
  if (data.headlines) {
    const headlinesValidation = validateAdHeadlines(data.headlines);
    if (!headlinesValidation.isValid) {
      errors.headlines = [headlinesValidation.error];
      isValid = false;
    }
  }
  
  // Validate descriptions
  if (data.descriptions) {
    const descriptionsValidation = validateAdDescriptions(data.descriptions);
    if (!descriptionsValidation.isValid) {
      errors.descriptions = [descriptionsValidation.error];
      isValid = false;
    }
  }
  
  return {
    isValid,
    errors
  };
};

// ===== UTILITY VALIDATION FUNCTIONS =====

/**
 * Check if all validations in array are valid
 * @param {Array} validations - Array of validation results
 * @returns {Object} Combined validation result
 */
export const combineValidations = (validations) => {
  const errors = [];
  let isValid = true;
  
  for (const validation of validations) {
    if (!validation.isValid) {
      isValid = false;
      if (validation.error) {
        errors.push(validation.error);
      }
    }
  }
  
  return {
    isValid,
    error: errors.length > 0 ? errors.join(', ') : null,
    errors
  };
};

/**
 * Create validation rule object
 * @param {string} type - Validation type
 * @param {Object} options - Validation options
 * @returns {Object} Validation rule
 */
export const createValidationRule = (type, options = {}) => {
  return {
    type,
    ...options
  };
};

// ===== EXPORT ALL =====
export default {
  // Basic validation
  validateRequired,
  validateLength,
  validateRange,
  validatePattern,
  
  // Specific validation
  validateUrl,
  validateEmail,
  validatePhone,
  
  // Campaign validation
  validateCampaignName,
  validateCampaignBudget,
  validateCampaignDescription,
  
  // Ad validation
  validateAdHeadline,
  validateAdDescription,
  validateAdHeadlines,
  validateAdDescriptions,
  
  // Keyword validation
  validateKeyword,
  validateKeywords,
  
  // Form validation
  validateForm,
  validateWebsiteAnalysis,
  validateCampaignCreation,
  validateAdCreation,
  
  // Utility functions
  combineValidations,
  createValidationRule
};


// Google Ads AI Platform - API Service
// ====================================

import axios from 'axios'
import { API_ENDPOINTS, HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants'
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/helpers'

/**
 * API Service Class
 * Handles all HTTP requests to the backend API
 */
class APIService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? 'https://furriyadh.com/api' : 'http://localhost:3000/api')
    this.timeout = 30000 // 30 seconds
    this.retryAttempts = 3
    this.retryDelay = 1000 // 1 second
    
    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    // Setup interceptors
    this.setupInterceptors()
  }

  /**
   * Setup axios interceptors for request/response handling
   */
  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = getStorageItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        
        // Add request timestamp
        config.metadata = { startTime: new Date() }
        
        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
        }
        
        return config
      },
      (error) => {
        console.error('Request interceptor error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Calculate request duration
        const duration = new Date() - response.config.metadata.startTime
        
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ API Response: ${response.status} ${response.config.url} (${duration}ms)`)
        }
        
        return response
      },
      async (error) => {
        const originalRequest = error.config
        
        // Handle token refresh for 401 errors
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
          originalRequest._retry = true
          
          try {
            await this.refreshToken()
            const token = getStorageItem('auth_token')
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return this.client(originalRequest)
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError)
            this.handleAuthError()
            return Promise.reject(refreshError)
          }
        }
        
        // Log error in development
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data)
        }
        
        return Promise.reject(this.handleError(error))
      }
    )
  }

  /**
   * Handle API errors and return standardized error object
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case HTTP_STATUS.BAD_REQUEST:
          return {
            type: 'VALIDATION_ERROR',
            message: data.message || ERROR_MESSAGES.VALIDATION_ERROR,
            details: data.errors || null,
            status
          }
          
        case HTTP_STATUS.UNAUTHORIZED:
          return {
            type: 'AUTH_ERROR',
            message: data.message || ERROR_MESSAGES.AUTH_REQUIRED,
            status
          }
          
        case HTTP_STATUS.FORBIDDEN:
          return {
            type: 'PERMISSION_ERROR',
            message: data.message || ERROR_MESSAGES.PERMISSION_DENIED,
            status
          }
          
        case HTTP_STATUS.NOT_FOUND:
          return {
            type: 'NOT_FOUND_ERROR',
            message: data.message || ERROR_MESSAGES.DATA_NOT_FOUND,
            status
          }
          
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          return {
            type: 'SERVER_ERROR',
            message: data.message || ERROR_MESSAGES.SERVER_ERROR,
            status
          }
          
        default:
          return {
            type: 'API_ERROR',
            message: data.message || ERROR_MESSAGES.UNKNOWN_ERROR,
            status
          }
      }
    } else if (error.request) {
      // Network error
      return {
        type: 'NETWORK_ERROR',
        message: ERROR_MESSAGES.NETWORK_ERROR,
        details: error.message
      }
    } else {
      // Other error
      return {
        type: 'UNKNOWN_ERROR',
        message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR
      }
    }
  }

  /**
   * Handle authentication errors
   */
  handleAuthError() {
    // Clear stored auth data
    removeStorageItem('auth_token')
    removeStorageItem('refresh_token')
    removeStorageItem('user_info')
    
    // Redirect to login or emit auth error event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    const refreshToken = getStorageItem('refresh_token')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await axios.post(`${this.baseURL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
        refresh_token: refreshToken
      })

      const { access_token, refresh_token: newRefreshToken } = response.data
      
      setStorageItem('auth_token', access_token)
      if (newRefreshToken) {
        setStorageItem('refresh_token', newRefreshToken)
      }

      return access_token
    } catch (error) {
      removeStorageItem('auth_token')
      removeStorageItem('refresh_token')
      throw error
    }
  }

  /**
   * Retry failed requests with exponential backoff
   */
  async retryRequest(requestFn, attempts = this.retryAttempts) {
    try {
      return await requestFn()
    } catch (error) {
      if (attempts > 1 && this.shouldRetry(error)) {
        await this.delay(this.retryDelay * (this.retryAttempts - attempts + 1))
        return this.retryRequest(requestFn, attempts - 1)
      }
      throw error
    }
  }

  /**
   * Check if request should be retried
   */
  shouldRetry(error) {
    // Retry on network errors or 5xx server errors
    return !error.response || 
           (error.response.status >= 500 && error.response.status < 600) ||
           error.code === 'NETWORK_ERROR'
  }

  /**
   * Delay utility for retry logic
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // ===== HTTP METHODS =====

  /**
   * GET request
   */
  async get(url, config = {}) {
    return this.retryRequest(async () => {
      const response = await this.client.get(url, config)
      return response.data
    })
  }

  /**
   * POST request
   */
  async post(url, data = {}, config = {}) {
    return this.retryRequest(async () => {
      const response = await this.client.post(url, data, config)
      return response.data
    })
  }

  /**
   * PUT request
   */
  async put(url, data = {}, config = {}) {
    return this.retryRequest(async () => {
      const response = await this.client.put(url, data, config)
      return response.data
    })
  }

  /**
   * PATCH request
   */
  async patch(url, data = {}, config = {}) {
    return this.retryRequest(async () => {
      const response = await this.client.patch(url, data, config)
      return response.data
    })
  }

  /**
   * DELETE request
   */
  async delete(url, config = {}) {
    return this.retryRequest(async () => {
      const response = await this.client.delete(url, config)
      return response.data
    })
  }

  // ===== AUTHENTICATION ENDPOINTS =====

  /**
   * Check Google authentication status
   */
  async checkGoogleAuthStatus() {
    try {
      return await this.get(API_ENDPOINTS.AUTH.GOOGLE_STATUS)
    } catch (error) {
      return {
        isAuthenticated: false,
        error: error.message
      }
    }
  }

  /**
   * Initiate Google OAuth flow
   */
  async initiateGoogleAuth() {
    return await this.post(API_ENDPOINTS.AUTH.GOOGLE_INITIATE)
  }

  /**
   * Handle Google OAuth callback
   */
  async handleGoogleCallback(code, state = null) {
    return await this.post(API_ENDPOINTS.AUTH.GOOGLE_CALLBACK, {
      code,
      state
    })
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await this.post(API_ENDPOINTS.AUTH.LOGOUT)
    } catch (error) {
      console.warn('Logout API call failed:', error)
    } finally {
      this.handleAuthError()
    }
  }

  // ===== AI PROCESSING ENDPOINTS =====

  /**
   * Analyze website
   */
  async analyzeWebsite(websiteUrl) {
    return await this.post(API_ENDPOINTS.AI.ANALYZE_WEBSITE, {
      website_url: websiteUrl
    })
  }

  /**
   * Generate campaign from website data
   */
  async generateCampaign(websiteData) {
    return await this.post(API_ENDPOINTS.AI.GENERATE_CAMPAIGN, websiteData)
  }

  /**
   * Optimize keywords
   */
  async optimizeKeywords(keywords, targetAudience = null) {
    return await this.post(API_ENDPOINTS.AI.OPTIMIZE_KEYWORDS, {
      keywords,
      target_audience: targetAudience
    })
  }

  /**
   * Generate ads
   */
  async generateAds(campaignData) {
    return await this.post(API_ENDPOINTS.AI.GENERATE_ADS, campaignData)
  }

  // ===== ACCOUNT ENDPOINTS =====

  /**
   * Get Google Ads accounts
   */
  async getGoogleAdsAccounts() {
    return await this.get(API_ENDPOINTS.ACCOUNTS.LIST)
  }

  /**
   * Select Google Ads account
   */
  async selectAccount(accountId) {
    return await this.post(API_ENDPOINTS.ACCOUNTS.SELECT, {
      account_id: accountId
    })
  }

  /**
   * Get account details
   */
  async getAccountDetails(accountId) {
    const url = API_ENDPOINTS.ACCOUNTS.DETAILS.replace(':id', accountId)
    return await this.get(url)
  }

  /**
   * Get MCC accounts
   */
  async getMCCAccounts() {
    return await this.get(API_ENDPOINTS.ACCOUNTS.MCC)
  }

  // ===== CAMPAIGN ENDPOINTS =====

  /**
   * Get all campaigns
   */
  async getCampaigns(filters = {}) {
    return await this.get(API_ENDPOINTS.CAMPAIGNS.LIST, { params: filters })
  }

  /**
   * Get single campaign
   */
  async getCampaign(campaignId) {
    const url = API_ENDPOINTS.CAMPAIGNS.LIST + `/${campaignId}`
    return await this.get(url)
  }

  /**
   * Create new campaign
   */
  async createCampaign(campaignData) {
    return await this.post(API_ENDPOINTS.CAMPAIGNS.CREATE, campaignData)
  }

  /**
   * Update campaign
   */
  async updateCampaign(campaignId, updates) {
    const url = API_ENDPOINTS.CAMPAIGNS.UPDATE.replace(':id', campaignId)
    return await this.put(url, updates)
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(campaignId) {
    const url = API_ENDPOINTS.CAMPAIGNS.DELETE.replace(':id', campaignId)
    return await this.delete(url)
  }

  /**
   * Launch campaign
   */
  async launchCampaign(campaignData) {
    return await this.post(API_ENDPOINTS.CAMPAIGNS.LAUNCH, campaignData)
  }

  /**
   * Pause campaign
   */
  async pauseCampaign(campaignId) {
    const url = API_ENDPOINTS.CAMPAIGNS.PAUSE.replace(':id', campaignId)
    return await this.post(url)
  }

  /**
   * Get campaign performance
   */
  async getCampaignPerformance(campaignId, options = {}) {
    const url = API_ENDPOINTS.CAMPAIGNS.PERFORMANCE.replace(':id', campaignId)
    return await this.get(url, { params: options })
  }

  // ===== UTILITY METHODS =====

  /**
   * Upload file
   */
  async uploadFile(file, endpoint = '/upload') {
    const formData = new FormData()
    formData.append('file', file)
    
    return await this.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  /**
   * Download file
   */
  async downloadFile(url, filename = null) {
    const response = await this.client.get(url, {
      responseType: 'blob'
    })
    
    // Create download link
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    
    return response.data
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await this.get('/health')
      return {
        status: 'healthy',
        ...response
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      }
    }
  }

  /**
   * Get API version
   */
  async getVersion() {
    return await this.get('/version')
  }
}

// Create and export singleton instance
export const apiService = new APIService()
export default apiService


// Google Ads AI Platform - Google Authentication Service
// =====================================================

import { apiService } from './api'
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/helpers'
import { OAUTH_SCOPES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants'

/**
 * Google Authentication Service
 * Handles Google OAuth flow and token management
 */
class GoogleAuthService {
  constructor() {
    this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID
    this.redirectUri = process.env.REACT_APP_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/callback`
    this.scopes = OAUTH_SCOPES.REQUIRED_SCOPES || [
      'https://www.googleapis.com/auth/adwords',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]
    
    // OAuth state for security
    this.state = null
    
    // Event listeners
    this.listeners = new Map()
    
    // Initialize
    this.init()
  }

  /**
   * Initialize the service
   */
  async init() {
    try {
      // Check if we're handling OAuth callback
      await this.handleOAuthCallback()
      
      // Check existing authentication
      await this.checkAuthStatus()
      
    } catch (error) {
      console.error('GoogleAuth initialization error:', error)
    }
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * Emit event
   */
  emit(event, data = null) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in ${event} listener:`, error)
        }
      })
    }
  }

  /**
   * Check current authentication status
   */
  async checkAuthStatus() {
    try {
      const token = getStorageItem('auth_token')
      if (!token) {
        this.emit('auth:status', { isAuthenticated: false })
        return { isAuthenticated: false }
      }

      // Verify token with backend
      const response = await apiService.checkGoogleAuthStatus()
      
      if (response.success && response.isAuthenticated) {
        const userInfo = response.userInfo || getStorageItem('user_info')
        
        this.emit('auth:status', {
          isAuthenticated: true,
          userInfo
        })
        
        return {
          isAuthenticated: true,
          userInfo
        }
      } else {
        // Token is invalid, clear storage
        this.clearAuthData()
        this.emit('auth:status', { isAuthenticated: false })
        return { isAuthenticated: false }
      }
      
    } catch (error) {
      console.error('Auth status check failed:', error)
      this.clearAuthData()
      this.emit('auth:status', { isAuthenticated: false, error: error.message })
      return { isAuthenticated: false, error: error.message }
    }
  }

  /**
   * Initiate Google OAuth flow
   */
  async initiateAuth() {
    try {
      if (!this.clientId) {
        throw new Error('Google Client ID not configured')
      }

      // Generate state for security
      this.state = this.generateState()
      setStorageItem('oauth_state', this.state)

      // Get auth URL from backend
      const response = await apiService.initiateGoogleAuth()
      
      if (response.success && response.authUrl) {
        // Redirect to Google OAuth
        window.location.href = response.authUrl
        return { success: true }
      } else {
        throw new Error(response.error || 'Failed to initiate authentication')
      }
      
    } catch (error) {
      console.error('Auth initiation failed:', error)
      this.emit('auth:error', {
        type: 'INITIATION_FAILED',
        message: error.message || ERROR_MESSAGES.AUTH_INVALID
      })
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.AUTH_INVALID
      }
    }
  }

  /**
   * Handle OAuth callback from Google
   */
  async handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const error = urlParams.get('error')

    // Check if this is an OAuth callback
    if (!code && !error) {
      return
    }

    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname)

    if (error) {
      const errorDescription = urlParams.get('error_description') || 'Authentication failed'
      this.emit('auth:error', {
        type: 'OAUTH_ERROR',
        message: errorDescription
      })
      return {
        success: false,
        error: errorDescription
      }
    }

    if (!code) {
      this.emit('auth:error', {
        type: 'NO_AUTH_CODE',
        message: 'No authorization code received'
      })
      return {
        success: false,
        error: 'No authorization code received'
      }
    }

    try {
      // Verify state parameter
      const storedState = getStorageItem('oauth_state')
      if (state !== storedState) {
        throw new Error('Invalid state parameter')
      }

      // Exchange code for tokens
      const response = await apiService.handleGoogleCallback(code, state)
      
      if (response.success) {
        // Store authentication data
        if (response.accessToken) {
          setStorageItem('auth_token', response.accessToken)
        }
        if (response.refreshToken) {
          setStorageItem('refresh_token', response.refreshToken)
        }
        if (response.userInfo) {
          setStorageItem('user_info', response.userInfo)
        }

        // Clean up OAuth state
        removeStorageItem('oauth_state')

        this.emit('auth:success', {
          userInfo: response.userInfo,
          message: SUCCESS_MESSAGES.AUTH_SUCCESS
        })

        return {
          success: true,
          userInfo: response.userInfo
        }
      } else {
        throw new Error(response.error || 'Authentication failed')
      }
      
    } catch (error) {
      console.error('OAuth callback handling failed:', error)
      this.clearAuthData()
      this.emit('auth:error', {
        type: 'CALLBACK_FAILED',
        message: error.message || ERROR_MESSAGES.AUTH_INVALID
      })
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.AUTH_INVALID
      }
    }
  }

  /**
   * Sign out user
   */
  async signOut() {
    try {
      // Call backend logout endpoint
      await apiService.logout()
      
      this.emit('auth:logout', {
        message: SUCCESS_MESSAGES.LOGOUT_SUCCESS
      })
      
      return { success: true }
      
    } catch (error) {
      console.error('Sign out error:', error)
      
      // Clear local data even if backend call fails
      this.clearAuthData()
      this.emit('auth:logout', {
        message: SUCCESS_MESSAGES.LOGOUT_SUCCESS
      })
      
      return { success: true }
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    try {
      const refreshToken = getStorageItem('refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const newToken = await apiService.refreshToken()
      
      if (newToken) {
        setStorageItem('auth_token', newToken)
        this.emit('auth:token_refreshed', { token: newToken })
        return { success: true, token: newToken }
      } else {
        throw new Error('Failed to refresh token')
      }
      
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.clearAuthData()
      this.emit('auth:error', {
        type: 'TOKEN_REFRESH_FAILED',
        message: error.message || ERROR_MESSAGES.AUTH_EXPIRED
      })
      return { success: false, error: error.message }
    }
  }

  /**
   * Get current user info
   */
  getUserInfo() {
    return getStorageItem('user_info')
  }

  /**
   * Get current auth token
   */
  getAuthToken() {
    return getStorageItem('auth_token')
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = getStorageItem('auth_token')
    const userInfo = getStorageItem('user_info')
    return !!(token && userInfo)
  }

  /**
   * Check if user has required scopes
   */
  hasRequiredScopes(requiredScopes = this.scopes) {
    const userInfo = this.getUserInfo()
    if (!userInfo || !userInfo.scopes) {
      return false
    }

    return requiredScopes.every(scope => 
      userInfo.scopes.includes(scope)
    )
  }

  /**
   * Get user permissions
   */
  async getUserPermissions() {
    try {
      if (!this.isAuthenticated()) {
        return {
          success: false,
          error: 'User not authenticated'
        }
      }

      // This would typically call a backend endpoint
      // For now, return stored user info
      const userInfo = this.getUserInfo()
      
      return {
        success: true,
        permissions: {
          canManageCampaigns: userInfo.scopes?.includes('https://www.googleapis.com/auth/adwords'),
          canViewReports: true,
          canEditAccount: userInfo.role === 'admin',
          scopes: userInfo.scopes || []
        }
      }
      
    } catch (error) {
      console.error('Get user permissions failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Clear authentication data
   */
  clearAuthData() {
    removeStorageItem('auth_token')
    removeStorageItem('refresh_token')
    removeStorageItem('user_info')
    removeStorageItem('oauth_state')
  }

  /**
   * Generate random state for OAuth security
   */
  generateState() {
    const array = new Uint32Array(4)
    crypto.getRandomValues(array)
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('')
  }

  /**
   * Build Google OAuth URL (client-side method)
   */
  buildAuthUrl() {
    if (!this.clientId) {
      throw new Error('Google Client ID not configured')
    }

    const state = this.generateState()
    setStorageItem('oauth_state', state)

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(' '),
      response_type: 'code',
      state: state,
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true'
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(error) {
    console.error('Authentication error:', error)
    
    // Clear auth data on certain errors
    const clearAuthErrors = [
      'TOKEN_EXPIRED',
      'INVALID_TOKEN',
      'TOKEN_REFRESH_FAILED'
    ]
    
    if (clearAuthErrors.includes(error.type)) {
      this.clearAuthData()
    }
    
    this.emit('auth:error', error)
  }

  /**
   * Auto-refresh token before expiration
   */
  startTokenRefreshTimer() {
    // Get token expiration time
    const userInfo = this.getUserInfo()
    if (!userInfo || !userInfo.tokenExpiry) {
      return
    }

    const now = Date.now()
    const expiry = new Date(userInfo.tokenExpiry).getTime()
    const timeUntilExpiry = expiry - now
    
    // Refresh 5 minutes before expiration
    const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 60000)
    
    setTimeout(() => {
      this.refreshToken()
    }, refreshTime)
  }

  /**
   * Validate Google Client ID format
   */
  validateClientId(clientId) {
    const pattern = /^\d+-[a-zA-Z0-9_]+\.apps\.googleusercontent\.com$/
    return pattern.test(clientId)
  }

  /**
   * Get authentication status for display
   */
  getAuthStatus() {
    const isAuth = this.isAuthenticated()
    const userInfo = this.getUserInfo()
    
    return {
      isAuthenticated: isAuth,
      user: isAuth ? {
        name: userInfo?.name,
        email: userInfo?.email,
        picture: userInfo?.picture,
        scopes: userInfo?.scopes || []
      } : null,
      hasRequiredScopes: isAuth ? this.hasRequiredScopes() : false
    }
  }
}

// Create and export singleton instance
export const googleAuthService = new GoogleAuthService()
export default googleAuthService


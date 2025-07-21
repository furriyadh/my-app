// Google Ads AI Platform - Google Authentication Service
// ===================================================

import { apiService } from './api'
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/helpers'
import { OAUTH_SCOPES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants'

/**
 * Google Authentication Service
 * Handles Google OAuth flow and token management
 */
class GoogleAuthService {
  constructor() {
    // ===================================================
    // OAuth Configuration - محدث بالقيم الجديدة الصحيحة
    // ===================================================
    this.clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '366144291902-u75bec3sviur9nrutbslt14ob14hrgud.apps.googleusercontent.com'
    this.redirectUri = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:3000/api/oauth/callback'
    this.scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/adwords'
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
      // Check if user has session cookie
      const response = await fetch('/api/oauth/refresh?provider=google', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        const isAuthenticated = !data.is_expired
        this.emit('auth_status_changed', { authenticated: isAuthenticated })
        return isAuthenticated
      } else {
        this.emit('auth_status_changed', { authenticated: false })
        return false
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      this.emit('auth_status_changed', { authenticated: false })
      return false
    }
  }

  /**
   * Start OAuth flow
   */
  async startOAuthFlow() {
    try {
      // Redirect to our OAuth endpoint which will handle the Google OAuth flow
      window.location.href = '/api/oauth/google'
    } catch (error) {
      console.error('Error starting OAuth flow:', error)
      this.emit('auth_error', { error: 'Failed to start OAuth flow' })
      throw error
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback() {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const connected = urlParams.get('connected')
      const error = urlParams.get('error')
      const adsAccounts = urlParams.get('ads_accounts')

      if (error) {
        console.error('OAuth error:', error)
        this.emit('auth_error', { error })
        return false
      }

      if (connected === 'true') {
        this.emit('auth_success', { 
          connected: true,
          ads_accounts: parseInt(adsAccounts) || 0
        })
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
        return true
      }

      return false
    } catch (error) {
      console.error('Error handling OAuth callback:', error)
      this.emit('auth_error', { error: 'Failed to handle OAuth callback' })
      return false
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken() {
    try {
      const response = await fetch('/api/oauth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          provider: 'google',
          force_refresh: false
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        this.emit('token_refreshed', data)
        return true
      } else if (data.reauthenticate) {
        // User needs to re-authenticate
        this.emit('auth_status_changed', { authenticated: false, reauthenticate: true })
        return false
      } else {
        throw new Error(data.error || 'Failed to refresh token')
      }
    } catch (error) {
      console.error('Error refreshing access token:', error)
      return false
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    try {
      const response = await fetch('/api/oauth/refresh?provider=google', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        return !data.is_expired
      }
      
      return false
    } catch (error) {
      console.error('Error checking authentication:', error)
      return false
    }
  }

  /**
   * Sign out user
   */
  async signOut() {
    try {
      // Clear any local storage (if used)
      this.clearTokens()
      
      // Emit sign out event
      this.emit('auth_status_changed', { authenticated: false })
      this.emit('sign_out')
      
      // Redirect to home page
      window.location.href = '/'
      
      return true
    } catch (error) {
      console.error('Error signing out:', error)
      return false
    }
  }

  /**
   * Clear stored tokens (for backward compatibility)
   */
  clearTokens() {
    try {
      removeStorageItem('google_access_token')
      removeStorageItem('google_refresh_token')
      removeStorageItem('google_token_expires_at')
      removeStorageItem('google_token_scope')
      removeStorageItem('oauth_state')
    } catch (error) {
      console.error('Error clearing tokens:', error)
    }
  }

  /**
   * Get user info from cookies
   */
  async getUserInfo() {
    try {
      // Get user info from cookie
      const userCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('user_info='))
      
      if (userCookie) {
        const userInfo = JSON.parse(decodeURIComponent(userCookie.split('=')[1]))
        return userInfo
      }
      
      throw new Error('No user info available')
    } catch (error) {
      console.error('Error getting user info:', error)
      throw error
    }
  }

  /**
   * Get Google Ads accounts
   */
  async getGoogleAdsAccounts() {
    try {
      const response = await fetch('/api/google-ads/accounts', {
        method: 'GET',
        credentials: 'include' // Include cookies for session_token
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - user needs to re-authenticate
          this.emit('auth_status_changed', { authenticated: false, reauthenticate: true })
          throw new Error('Authentication required')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.accounts || []
    } catch (error) {
      console.error('Error getting Google Ads accounts:', error)
      throw error
    }
  }

  /**
   * Update Google Ads account settings
   */
  async updateGoogleAdsAccount(accountId, action, additionalData = {}) {
    try {
      const response = await fetch('/api/google-ads/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          account_id: accountId,
          action: action,
          ...additionalData
        })
      })

      if (!response.ok) {
        if (response.status === 401) {
          this.emit('auth_status_changed', { authenticated: false, reauthenticate: true })
          throw new Error('Authentication required')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error updating Google Ads account:', error)
      throw error
    }
  }

  /**
   * Remove Google Ads account
   */
  async removeGoogleAdsAccount(accountId) {
    try {
      const response = await fetch(`/api/google-ads/accounts?account_id=${accountId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          this.emit('auth_status_changed', { authenticated: false, reauthenticate: true })
          throw new Error('Authentication required')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error removing Google Ads account:', error)
      throw error
    }
  }
}

// Create and export singleton instance
const googleAuthService = new GoogleAuthService()
export default googleAuthService

// Named exports for convenience
export { GoogleAuthService }
export const {
  startOAuthFlow,
  handleOAuthCallback,
  checkAuthStatus,
  isAuthenticated,
  getUserInfo,
  getGoogleAdsAccounts,
  updateGoogleAdsAccount,
  removeGoogleAdsAccount,
  refreshAccessToken,
  signOut,
  on,
  off
} = googleAuthService


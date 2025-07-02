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
      const accessToken = getStorageItem('google_access_token')
      const refreshToken = getStorageItem('google_refresh_token')
      const expiresAt = getStorageItem('google_token_expires_at')

      if (!accessToken) {
        this.emit('auth_status_changed', { authenticated: false })
        return false
      }

      // Check if token is expired
      if (expiresAt && Date.now() > parseInt(expiresAt)) {
        if (refreshToken) {
          // Try to refresh token
          const refreshed = await this.refreshAccessToken(refreshToken)
          if (refreshed) {
            this.emit('auth_status_changed', { authenticated: true })
            return true
          }
        }
        
        // Token expired and couldn't refresh
        this.clearTokens()
        this.emit('auth_status_changed', { authenticated: false })
        return false
      }

      // Token is valid
      this.emit('auth_status_changed', { authenticated: true })
      return true
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
      // Generate state for security
      this.state = this.generateState()
      setStorageItem('oauth_state', this.state)

      // Build OAuth URL
      const params = new URLSearchParams({
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        response_type: 'code',
        scope: this.scopes.join(' '),
        state: this.state,
        access_type: 'offline',
        prompt: 'consent'
      })

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
      
      // Redirect to Google OAuth
      window.location.href = authUrl
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
      const code = urlParams.get('code')
      const state = urlParams.get('state')
      const error = urlParams.get('error')

      if (error) {
        console.error('OAuth error:', error)
        this.emit('auth_error', { error })
        return false
      }

      if (!code || !state) {
        return false
      }

      // Verify state
      const storedState = getStorageItem('oauth_state')
      if (state !== storedState) {
        console.error('OAuth state mismatch')
        this.emit('auth_error', { error: 'State mismatch' })
        return false
      }

      // Exchange code for tokens
      const tokens = await this.exchangeCodeForTokens(code)
      if (tokens) {
        this.storeTokens(tokens)
        this.emit('auth_success', { tokens })
        
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
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code) {
    try {
      const response = await fetch('/api/oauth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          redirect_uri: this.redirectUri,
          client_id: this.clientId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.tokens) {
        return data.tokens
      } else {
        throw new Error(data.error || 'Failed to exchange code for tokens')
      }
    } catch (error) {
      console.error('Error exchanging code for tokens:', error)
      throw error
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const response = await fetch('/api/oauth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
          client_id: this.clientId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.tokens) {
        this.storeTokens(data.tokens)
        return true
      } else {
        throw new Error(data.error || 'Failed to refresh token')
      }
    } catch (error) {
      console.error('Error refreshing access token:', error)
      return false
    }
  }

  /**
   * Store tokens in localStorage
   */
  storeTokens(tokens) {
    try {
      if (tokens.access_token) {
        setStorageItem('google_access_token', tokens.access_token)
      }
      
      if (tokens.refresh_token) {
        setStorageItem('google_refresh_token', tokens.refresh_token)
      }
      
      if (tokens.expires_in) {
        const expiresAt = Date.now() + (tokens.expires_in * 1000)
        setStorageItem('google_token_expires_at', expiresAt.toString())
      }

      if (tokens.scope) {
        setStorageItem('google_token_scope', tokens.scope)
      }
    } catch (error) {
      console.error('Error storing tokens:', error)
    }
  }

  /**
   * Clear stored tokens
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
   * Get current access token
   */
  getAccessToken() {
    return getStorageItem('google_access_token')
  }

  /**
   * Get current refresh token
   */
  getRefreshToken() {
    return getStorageItem('google_refresh_token')
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const accessToken = this.getAccessToken()
    const expiresAt = getStorageItem('google_token_expires_at')
    
    if (!accessToken) {
      return false
    }

    if (expiresAt && Date.now() > parseInt(expiresAt)) {
      return false
    }

    return true
  }

  /**
   * Sign out user
   */
  async signOut() {
    try {
      const accessToken = this.getAccessToken()
      
      if (accessToken) {
        // Revoke token with Google
        await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
          method: 'POST'
        })
      }

      // Clear local tokens
      this.clearTokens()
      
      // Emit sign out event
      this.emit('auth_status_changed', { authenticated: false })
      this.emit('sign_out')
      
      return true
    } catch (error) {
      console.error('Error signing out:', error)
      // Clear tokens anyway
      this.clearTokens()
      this.emit('auth_status_changed', { authenticated: false })
      return false
    }
  }

  /**
   * Generate random state for OAuth security
   */
  generateState() {
    const array = new Uint32Array(1)
    crypto.getRandomValues(array)
    return array[0].toString(36)
  }

  /**
   * Get user info from Google
   */
  async getUserInfo() {
    try {
      const accessToken = this.getAccessToken()
      if (!accessToken) {
        throw new Error('No access token available')
      }

      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const userInfo = await response.json()
      return userInfo
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
      const accessToken = this.getAccessToken()
      if (!accessToken) {
        throw new Error('No access token available')
      }

      const response = await fetch('/api/google-ads/accounts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.accounts || []
    } catch (error) {
      console.error('Error getting Google Ads accounts:', error)
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
  getAccessToken,
  getRefreshToken,
  getUserInfo,
  getGoogleAdsAccounts,
  signOut,
  on,
  off
} = googleAuthService


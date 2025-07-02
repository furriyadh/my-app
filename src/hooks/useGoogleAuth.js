// Google Ads AI Platform - useGoogleAuth Hook
// ================================================
// React Hook للتعامل مع Google OAuth Authentication
// محدث بالـ OAuth client ID الجديد

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

export const useGoogleAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authUrl, setAuthUrl] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check current authentication status
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.checkGoogleAuthStatus();
      
      if (response.success && response.isAuthenticated) {
        setIsAuthenticated(true);
        setUserInfo(response.userInfo);
      } else {
        setIsAuthenticated(false);
        setUserInfo(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setError('فشل في التحقق من حالة المصادقة');
      setIsAuthenticated(false);
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initiate Google OAuth flow
  const initiateAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.initiateGoogleAuth();
      
      if (response.success && response.authUrl) {
        setAuthUrl(response.authUrl);
        // Redirect to Google OAuth - استخدام OAuth client ID الجديد
        window.location.href = response.authUrl;
      } else {
        setError(response.error || 'فشل في بدء عملية المصادقة');
      }
    } catch (error) {
      console.error('Error initiating auth:', error);
      setError('فشل في بدء عملية المصادقة');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle OAuth callback
  const handleCallback = useCallback(async (code, state) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.handleGoogleAuthCallback(code, state);
      
      if (response.success) {
        setIsAuthenticated(true);
        setUserInfo(response.userInfo);
        
        // Store tokens securely
        if (response.tokens) {
          localStorage.setItem('google_ads_auth_token', response.tokens.access_token);
          localStorage.setItem('google_ads_refresh_token', response.tokens.refresh_token);
          localStorage.setItem('google_ads_user_info', JSON.stringify(response.userInfo));
        }
        
        return { success: true };
      } else {
        setError(response.error || 'فشل في معالجة رد المصادقة');
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error handling callback:', error);
      setError('فشل في معالجة رد المصادقة');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Clear local storage
      localStorage.removeItem('google_ads_auth_token');
      localStorage.removeItem('google_ads_refresh_token');
      localStorage.removeItem('google_ads_user_info');
      localStorage.removeItem('google_ads_selected_account');
      
      // Call logout API
      await apiService.logoutGoogleAuth();
      
      setIsAuthenticated(false);
      setUserInfo(null);
      setAuthUrl(null);
      setError(null);
      
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh authentication token
  const refreshAuth = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('google_ads_refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await apiService.refreshGoogleAuthToken(refreshToken);
      
      if (response.success && response.tokens) {
        localStorage.setItem('google_ads_auth_token', response.tokens.access_token);
        if (response.tokens.refresh_token) {
          localStorage.setItem('google_ads_refresh_token', response.tokens.refresh_token);
        }
        return { success: true };
      } else {
        throw new Error(response.error || 'Failed to refresh token');
      }
    } catch (error) {
      console.error('Error refreshing auth:', error);
      // If refresh fails, logout user
      logout();
      return { success: false, error: error.message };
    }
  }, [logout]);

  // Get current access token
  const getAccessToken = useCallback(() => {
    return localStorage.getItem('google_ads_auth_token');
  }, []);

  // Check if token is expired and refresh if needed
  const ensureValidToken = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      return { success: false, error: 'No access token' };
    }
    
    // Try to use the token, if it fails, try to refresh
    try {
      const response = await apiService.validateToken(token);
      if (response.valid) {
        return { success: true, token };
      } else {
        // Token is invalid, try to refresh
        const refreshResult = await refreshAuth();
        if (refreshResult.success) {
          return { success: true, token: getAccessToken() };
        } else {
          return { success: false, error: 'Token refresh failed' };
        }
      }
    } catch (error) {
      // Try to refresh on any error
      const refreshResult = await refreshAuth();
      if (refreshResult.success) {
        return { success: true, token: getAccessToken() };
      } else {
        return { success: false, error: 'Token validation and refresh failed' };
      }
    }
  }, [getAccessToken, refreshAuth]);

  return {
    // State
    isAuthenticated,
    userInfo,
    isLoading,
    error,
    authUrl,
    
    // Actions
    initiateAuth,
    handleCallback,
    logout,
    refreshAuth,
    checkAuthStatus,
    getAccessToken,
    ensureValidToken
  };
};

export default useGoogleAuth;


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
        // Redirect to Google OAuth
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
  const handleAuthCallback = useCallback(async (code) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.handleGoogleCallback(code);
      
      if (response.success) {
        setIsAuthenticated(true);
        setUserInfo(response.userInfo);
        return { success: true, userInfo: response.userInfo };
      } else {
        setError(response.error || 'فشل في إكمال عملية المصادقة');
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error handling auth callback:', error);
      const errorMessage = 'فشل في إكمال عملية المصادقة';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call API to revoke tokens if needed
      await apiService.signOut?.();
      
      // Clear local state
      setIsAuthenticated(false);
      setUserInfo(null);
      setAuthUrl(null);
      
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      const errorMessage = 'فشل في تسجيل الخروج';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh authentication
  const refreshAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.refreshAuth?.();
      
      if (response?.success) {
        setUserInfo(response.userInfo);
        return { success: true };
      } else {
        // If refresh fails, check auth status
        await checkAuthStatus();
        return { success: false };
      }
    } catch (error) {
      console.error('Error refreshing auth:', error);
      await checkAuthStatus();
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [checkAuthStatus]);

  // Get user permissions
  const getUserPermissions = useCallback(async () => {
    try {
      if (!isAuthenticated) {
        return { success: false, error: 'المستخدم غير مصادق عليه' };
      }
      
      const response = await apiService.getUserPermissions?.();
      return response || { success: false, error: 'فشل في جلب الصلاحيات' };
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return { success: false, error: 'فشل في جلب الصلاحيات' };
    }
  }, [isAuthenticated]);

  // Check if user has required scopes
  const hasRequiredScopes = useCallback((requiredScopes = []) => {
    if (!userInfo?.scopes) return false;
    
    return requiredScopes.every(scope => 
      userInfo.scopes.includes(scope)
    );
  }, [userInfo]);

  return {
    // State
    isAuthenticated,
    userInfo,
    isLoading,
    error,
    authUrl,
    
    // Actions
    initiateAuth,
    handleAuthCallback,
    signOut,
    refreshAuth,
    checkAuthStatus,
    getUserPermissions,
    
    // Utilities
    hasRequiredScopes,
    
    // Computed values
    isReady: !isLoading,
    hasError: !!error,
    userName: userInfo?.name || userInfo?.email || null,
    userEmail: userInfo?.email || null,
    userPicture: userInfo?.picture || null
  };
};

export default useGoogleAuth;


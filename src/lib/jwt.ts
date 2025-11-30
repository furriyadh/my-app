/**
 * JWT Utility Functions for Next.js
 * Secure JWT handling with HttpOnly Cookies
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// JWT Configuration
const JWT_CONFIG = {
  accessTokenMaxAge: 3600, // 1 hour
  refreshTokenMaxAge: 30 * 24 * 3600, // 30 days
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/'
  }
};

/**
 * Set JWT tokens in HttpOnly cookies
 */
export function setJWTCookies(
  accessToken: string, 
  refreshToken?: string
): NextResponse {
  const response = NextResponse.json({ success: true });
  
  // Set access token
  response.cookies.set('authToken', accessToken, {
    ...JWT_CONFIG.cookieOptions,
    maxAge: JWT_CONFIG.accessTokenMaxAge
  });
  
  // Set refresh token if provided
  if (refreshToken) {
    response.cookies.set('refreshToken', refreshToken, {
      ...JWT_CONFIG.cookieOptions,
      maxAge: JWT_CONFIG.refreshTokenMaxAge
    });
  }
  
  return response;
}

/**
 * Get JWT token from HttpOnly cookie
 */
export function getJWTFromCookie(): string | null {
  const cookieStore = cookies();
  return cookieStore.get('authToken')?.value || null;
}

/**
 * Get refresh token from HttpOnly cookie
 */
export function getRefreshTokenFromCookie(): string | null {
  const cookieStore = cookies();
  return cookieStore.get('refreshToken')?.value || null;
}

/**
 * Clear JWT cookies
 */
export function clearJWTCookies(): NextResponse {
  const response = NextResponse.json({ success: true });
  
  response.cookies.delete('authToken');
  response.cookies.delete('refreshToken');
  
  return response;
}

/**
 * Verify JWT token with backend
 */
export async function verifyJWTWithBackend(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${getBackendUrl()}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return false;
  }
}

/**
 * Refresh JWT token using refresh token
 */
export async function refreshJWTToken(): Promise<{ success: boolean; newToken?: string }> {
  try {
    const refreshToken = getRefreshTokenFromCookie();
    
    if (!refreshToken) {
      return { success: false };
    }
    
    const response = await fetch(`${getBackendUrl()}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return { success: true, newToken: data.access_token };
    }
    
    return { success: false };
  } catch (error) {
    console.error('JWT refresh failed:', error);
    return { success: false };
  }
}

/**
 * Middleware helper to check authentication
 */
export async function checkAuthentication(): Promise<{ authenticated: boolean; user?: any }> {
  const token = getJWTFromCookie();
  
  if (!token) {
    return { authenticated: false };
  }
  
  const isValid = await verifyJWTWithBackend(token);
  
  if (!isValid) {
    // Try to refresh token
    const refreshResult = await refreshJWTToken();
    
    if (refreshResult.success && refreshResult.newToken) {
      return { authenticated: true, user: { token: refreshResult.newToken } };
    }
    
    return { authenticated: false };
  }
  
  return { authenticated: true, user: { token } };
}

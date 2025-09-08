// Configuration file for API URLs and environment variables
export const config = {
  // API Configuration - Using Railway Backend
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://my-app-production-28d2.up.railway.app/api' : 'http://localhost:3000/api'),
    backendUrl: process.env.BACKEND_API_URL || (process.env.NODE_ENV === 'production' ? 'https://my-app-production-28d2.up.railway.app' : 'http://localhost:5000'),
    frontendUrl: process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://furriyadh.com' : 'http://localhost:3000'),
  },
  
  // Environment detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Google Ads Configuration
  googleAds: {
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    clientId: process.env.GOOGLE_ADS_CLIENT_ID,
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    mccCustomerId: process.env.MCC_LOGIN_CUSTOMER_ID,
    apiVersion: process.env.GOOGLE_ADS_API_VERSION || 'v21',
  },
  
  // OAuth Configuration
  oauth: {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || (process.env.NODE_ENV === 'production' ? 'https://furriyadh.com/api/oauth/google/callback' : 'http://localhost:3000/api/oauth/google/callback'),
    scopes: process.env.GOOGLE_OAUTH_SCOPES?.split(' ') || [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/adwords'
    ],
  },
  
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  
  // Environment
  env: process.env.NODE_ENV || 'development',
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = config.api.baseUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

// Helper function to get Backend URL (now points to Next.js API Routes)
export const getBackendUrl = (endpoint: string): string => {
  const baseUrl = config.api.backendUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/api/${cleanEndpoint}`;
};

// Smart function to get the correct API URL based on environment
export const getSmartApiUrl = (endpoint: string): string => {
  // Always use Next.js API Routes (same domain)
  return `/api/${endpoint.replace(/^\/+/, '')}`;
};

export default config;

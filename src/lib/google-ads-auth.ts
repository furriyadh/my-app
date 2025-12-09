/**
 * Google Ads Authentication Helper
 * ================================
 * ملف موحد لإدارة تجديد MCC Token تلقائياً
 * يُستخدم في جميع APIs التي تحتاج للوصول لـ Google Ads
 * 
 * الاستخدام:
 * ---------
 * import { getMCCAccessToken, googleAdsQuery } from '@/lib/google-ads-auth';
 * 
 * const accessToken = await getMCCAccessToken();
 * const results = await googleAdsQuery(customerId, accessToken, query);
 */

// Cache للـ access token لتجنب التجديد المتكرر
let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * تجديد access token باستخدام refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error('❌ Missing OAuth credentials for token refresh');
      return null;
    }
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Token refresh failed:', response.status, errorText);
      return null;
    }
    
    const data = await response.json();
    console.log('✅ Token refreshed successfully');
    return data.access_token;
  } catch (error) {
    console.error('❌ خطأ في تجديد التوكن:', error);
    return null;
  }
}

/**
 * الحصول على MCC Access Token
 * يُجدد تلقائياً إذا انتهت صلاحيته
 */
export async function getMCCAccessToken(): Promise<string | null> {
  // التحقق من الـ cache أولاً
  const now = Date.now();
  if (cachedAccessToken && tokenExpiresAt > now) {
    console.log('🔑 Using cached MCC access token');
    return cachedAccessToken;
  }
  
  // تجديد الـ token
  const mccRefreshToken = process.env.MCC_REFRESH_TOKEN || process.env.GOOGLE_ADS_REFRESH_TOKEN;
  
  if (!mccRefreshToken) {
    console.error('❌ No MCC refresh token found in environment variables');
    console.error('   Expected: MCC_REFRESH_TOKEN or GOOGLE_ADS_REFRESH_TOKEN');
    return null;
  }
  
  console.log('🔄 Refreshing MCC access token...');
  const newToken = await refreshAccessToken(mccRefreshToken);
  
  if (newToken) {
    cachedAccessToken = newToken;
    // الـ token صالح لمدة ساعة تقريباً، نُجدده قبل 5 دقائق من انتهائه
    tokenExpiresAt = now + (55 * 60 * 1000); // 55 دقيقة
    console.log('✅ MCC access token refreshed and cached');
    return newToken;
  }
  
  console.error('❌ Failed to refresh MCC access token');
  return null;
}

/**
 * الحصول على Developer Token
 */
export function getDeveloperToken(): string {
  const token = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  if (!token) {
    throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN is not set in environment variables');
  }
  return token;
}

/**
 * الحصول على MCC ID (login-customer-id)
 */
export function getMCCId(): string {
  const mccId = (process.env.MCC_LOGIN_CUSTOMER_ID || process.env.GOOGLE_ADS_MCC_ID || '').replace(/-/g, '');
  if (!mccId) {
    console.warn('⚠️ MCC_LOGIN_CUSTOMER_ID or GOOGLE_ADS_MCC_ID not set');
  }
  return mccId;
}

/**
 * إنشاء headers لـ Google Ads API
 */
export function getGoogleAdsHeaders(accessToken: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${accessToken}`,
    'developer-token': getDeveloperToken(),
    'Content-Type': 'application/json',
    'login-customer-id': getMCCId()
  };
}

/**
 * استعلام Google Ads API
 */
export async function googleAdsQuery(
  customerId: string, 
  accessToken: string, 
  query: string
): Promise<any[]> {
  try {
    const cleanCustomerId = customerId.replace(/-/g, '');
    
    const response = await fetch(
      `https://googleads.googleapis.com/v21/customers/${cleanCustomerId}/googleAds:search`,
      {
        method: 'POST',
        headers: getGoogleAdsHeaders(accessToken),
        body: JSON.stringify({ query })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Google Ads API Error for ${cleanCustomerId}:`, response.status, errorText.substring(0, 300));
      return [];
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`❌ Exception in googleAdsQuery for ${customerId}:`, error);
    return [];
  }
}

/**
 * تحديث حالة حملة (Enable/Pause)
 */
export async function mutateCampaignStatus(
  customerId: string,
  campaignId: string,
  newStatus: 'ENABLED' | 'PAUSED'
): Promise<{ success: boolean; error?: string }> {
  try {
    const accessToken = await getMCCAccessToken();
    if (!accessToken) {
      return { success: false, error: 'Failed to get access token' };
    }
    
    const cleanCustomerId = customerId.replace(/-/g, '');
    const cleanCampaignId = campaignId.toString().replace(/-/g, '');
    
    const mutateUrl = `https://googleads.googleapis.com/v21/customers/${cleanCustomerId}/campaigns:mutate`;
    
    const mutateBody = {
      operations: [{
        update: {
          resourceName: `customers/${cleanCustomerId}/campaigns/${cleanCampaignId}`,
          status: newStatus
        },
        updateMask: 'status'
      }]
    };
    
    console.log(`🔄 Updating campaign ${cleanCampaignId} status to ${newStatus}...`);
    
    const response = await fetch(mutateUrl, {
      method: 'POST',
      headers: getGoogleAdsHeaders(accessToken),
      body: JSON.stringify(mutateBody)
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('❌ Campaign mutate failed:', response.status, responseText);
      
      // استخراج رسالة الخطأ
      try {
        const errorData = JSON.parse(responseText);
        const errorMessage = errorData.error?.message || 
                            errorData.error?.details?.[0]?.errors?.[0]?.message ||
                            'Unknown error';
        return { success: false, error: errorMessage };
      } catch {
        return { success: false, error: responseText.substring(0, 200) };
      }
    }
    
    console.log(`✅ Campaign ${cleanCampaignId} status updated to ${newStatus}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Exception in mutateCampaignStatus:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * مسح الـ cache (مفيد للاختبار)
 */
export function clearTokenCache(): void {
  cachedAccessToken = null;
  tokenExpiresAt = 0;
  console.log('🗑️ Token cache cleared');
}


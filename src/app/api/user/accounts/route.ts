import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Types for Google Accounts
interface GoogleAccount {
  id: string;
  name: string;
  type: 'google_ads' | 'merchant_center' | 'youtube' | 'analytics' | 'business';
  details?: {
    currency_code?: string;
    website_url?: string;
    subscriber_count?: number;
    video_count?: number;
    view_count?: number;
    property_count?: number;
    location_count?: number;
    country?: string;
    time_zone?: string;
    is_manager_account?: boolean;
    thumbnail_url?: string;
    published_at?: string;
    address?: string;
    phone_number?: string;
    category?: string;
    rating?: number;
    review_count?: number;
  };
}

interface UserAccounts {
  google_ads: GoogleAccount[];
  merchant_center: GoogleAccount[];
  youtube: GoogleAccount[];
  analytics: GoogleAccount[];
  business: GoogleAccount[];
}

// إعداد Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // الحصول على معلومات المستخدم من session
    const userId = await getUserIdFromSession(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in to access your accounts' },
        { status: 401 }
      );
    }

    // جلب جميع حسابات المستخدم من قاعدة البيانات
    const userAccounts: UserAccounts = {
      google_ads: [],
      merchant_center: [],
      youtube: [],
      analytics: [],
      business: []
    };

    try {
      // جلب حسابات Google Ads
      const googleAdsAccounts = await fetchGoogleAdsAccounts(userId);
      userAccounts.google_ads = googleAdsAccounts;

      // جلب حسابات Merchant Center
      const merchantCenterAccounts = await fetchMerchantCenterAccounts(userId);
      userAccounts.merchant_center = merchantCenterAccounts;

      // جلب قنوات YouTube
      const youtubeChannels = await fetchYouTubeChannels(userId);
      userAccounts.youtube = youtubeChannels;

      // جلب حسابات Google Analytics
      const analyticsAccounts = await fetchAnalyticsAccounts(userId);
      userAccounts.analytics = analyticsAccounts;

      // جلب مواقع Google My Business
      const businessLocations = await fetchBusinessLocations(userId);
      userAccounts.business = businessLocations;

    } catch (dbError) {
      console.error('Database error while fetching accounts:', dbError);
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to fetch user accounts' },
        { status: 500 }
      );
    }

    // إرجاع البيانات
    return NextResponse.json(userAccounts, { status: 200 });

  } catch (error) {
    console.error('Error in /api/user/accounts:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}

// الحصول على user ID من session
async function getUserIdFromSession(request: NextRequest): Promise<string | null> {
  try {
    // محاولة الحصول على session token من cookie
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      // محاولة الحصول على user info من cookie كبديل
      const userInfoCookie = request.cookies.get('user_info')?.value;
      if (userInfoCookie) {
        try {
          const userInfo = JSON.parse(userInfoCookie);
          return userInfo.id || null;
        } catch {
          return null;
        }
      }
      return null;
    }

    // البحث عن الجلسة في قاعدة البيانات
    const { data: session, error } = await supabase
      .from('user_sessions')
      .select('user_id, expires_at')
      .eq('session_token', sessionToken)
      .single();

    if (error || !session) {
      return null;
    }

    // التحقق من انتهاء صلاحية الجلسة
    const expiresAt = new Date(session.expires_at);
    if (expiresAt < new Date()) {
      // حذف الجلسة المنتهية الصلاحية
      await supabase
        .from('user_sessions')
        .delete()
        .eq('session_token', sessionToken);
      
      return null;
    }

    return session.user_id;

  } catch (error) {
    console.error('Error getting user ID from session:', error);
    return null;
  }
}

// جلب حسابات Google Ads
async function fetchGoogleAdsAccounts(userId: string): Promise<GoogleAccount[]> {
  try {
    const { data: accounts, error } = await supabase
      .from('user_google_ads_accounts')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching Google Ads accounts:', error);
      return [];
    }

    return accounts?.map(account => ({
      id: account.account_id,
      name: account.account_name,
      type: 'google_ads' as const,
      details: {
        currency_code: account.currency_code,
        time_zone: account.time_zone,
        is_manager_account: account.is_manager_account
      }
    })) || [];

  } catch (error) {
    console.error('Error fetching Google Ads accounts:', error);
    return [];
  }
}

// جلب حسابات Merchant Center
async function fetchMerchantCenterAccounts(userId: string): Promise<GoogleAccount[]> {
  try {
    const { data: accounts, error } = await supabase
      .from('user_merchant_center_accounts')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching Merchant Center accounts:', error);
      return [];
    }

    return accounts?.map(account => ({
      id: account.account_id,
      name: account.account_name,
      type: 'merchant_center' as const,
      details: {
        website_url: account.website_url,
        country: account.country
      }
    })) || [];

  } catch (error) {
    console.error('Error fetching Merchant Center accounts:', error);
    return [];
  }
}

// جلب قنوات YouTube
async function fetchYouTubeChannels(userId: string): Promise<GoogleAccount[]> {
  try {
    const { data: channels, error } = await supabase
      .from('user_youtube_channels')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching YouTube channels:', error);
      return [];
    }

    return channels?.map(channel => ({
      id: channel.channel_id,
      name: channel.channel_title,
      type: 'youtube' as const,
      details: {
        subscriber_count: channel.subscriber_count,
        video_count: channel.video_count,
        view_count: channel.view_count,
        thumbnail_url: channel.thumbnail_url,
        country: channel.country,
        published_at: channel.published_at
      }
    })) || [];

  } catch (error) {
    console.error('Error fetching YouTube channels:', error);
    return [];
  }
}

// جلب حسابات Google Analytics
async function fetchAnalyticsAccounts(userId: string): Promise<GoogleAccount[]> {
  try {
    // جلب الحسابات مع عدد الخصائص
    const { data: accounts, error } = await supabase
      .from('user_google_analytics_accounts')
      .select(`
        *,
        properties:user_google_analytics_properties(count)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching Analytics accounts:', error);
      return [];
    }

    return accounts?.map(account => ({
      id: account.account_id,
      name: account.account_name,
      type: 'analytics' as const,
      details: {
        property_count: account.properties?.[0]?.count || 0
      }
    })) || [];

  } catch (error) {
    console.error('Error fetching Analytics accounts:', error);
    return [];
  }
}

// جلب مواقع Google My Business
async function fetchBusinessLocations(userId: string): Promise<GoogleAccount[]> {
  try {
    const { data: locations, error } = await supabase
      .from('user_google_business_locations')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching Business locations:', error);
      return [];
    }

    return locations?.map(location => ({
      id: location.location_name, // استخدام location_name كـ ID
      name: location.location_name,
      type: 'business' as const,
      details: {
        address: location.address,
        phone_number: location.phone_number,
        website_url: location.website_url,
        category: location.category,
        rating: location.rating,
        review_count: location.review_count
      }
    })) || [];

  } catch (error) {
    console.error('Error fetching Business locations:', error);
    return [];
  }
}

// دعم POST method للمستقبل (إذا احتجنا تحديث البيانات)
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'Use GET to fetch user accounts' },
    { status: 405 }
  );
}

// دعم PUT method للمستقبل (إذا احتجنا تحديث البيانات)
export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'Use GET to fetch user accounts' },
    { status: 405 }
  );
}

// دعم DELETE method للمستقبل (إذا احتجنا حذف البيانات)
export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'Use GET to fetch user accounts' },
    { status: 405 }
  );
}


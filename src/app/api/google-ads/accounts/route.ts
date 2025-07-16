import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OAuth2Client } from 'google-auth-library';

// TypeScript interfaces
interface GoogleAdsAccount {
  id: string;
  name: string;
  currency_code: string;
  time_zone: string;
  is_manager_account: boolean;
}

interface MerchantCenterAccount {
  id: string;
  name: string;
  website_url: string;
  country: string;
}

interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  subscriber_count: string;
  video_count: string;
  view_count: string;
  thumbnail_url: string;
  country: string;
  published_at: string;
}

interface GoogleAnalyticsAccount {
  account_id: string;
  account_name: string;
  properties: GoogleAnalyticsProperty[];
}

interface GoogleAnalyticsProperty {
  property_id: string;
  property_name: string;
  website_url: string;
  industry_category: string;
  time_zone: string;
}

interface GoogleMyBusinessLocation {
  name: string;
  location_name: string;
  address: string;
  phone_number: string;
  website_url: string;
  category: string;
  rating: number;
  review_count: number;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  verified_email?: boolean;
}

// إعداد Supabase - هذا ملف API route يعمل على الخادم، لا يحتاج Dynamic Import
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// إعداد Google OAuth مع جميع الـ Scopes الجديدة
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Google APIs configuration
const GOOGLE_ADS_API_VERSION = 'v16';
const GOOGLE_ADS_API_BASE_URL = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;
const YOUTUBE_API_VERSION = 'v3';
const YOUTUBE_API_BASE_URL = `https://www.googleapis.com/youtube/${YOUTUBE_API_VERSION}`;
const ANALYTICS_API_BASE_URL = 'https://analyticsadmin.googleapis.com/v1beta';
const BUSINESS_PROFILE_API_BASE_URL = 'https://mybusinessbusinessinformation.googleapis.com/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    // التحقق من state parameter للحماية من CSRF
    const storedState = request.cookies.get('oauth_state')?.value;
    if (!state || state !== storedState) {
      console.error('Invalid state parameter');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?error=invalid_state`
      );
    }

    // التحقق من وجود خطأ في OAuth
    if (error) {
      console.error('OAuth Error:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?error=oauth_error&message=${encodeURIComponent(error)}`
      );
    }

    // التحقق من وجود authorization code
    if (!code) {
      console.error('No authorization code received');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?error=no_code`
      );
    }

    // تبديل authorization code بـ access token
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Failed to get tokens from Google');
    }

    // الحصول على معلومات المستخدم من Google
    oauth2Client.setCredentials(tokens);
    
    const userInfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`
    );
    
    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info from Google');
    }
    
    const userInfo: GoogleUserInfo = await userInfoResponse.json();

    // التحقق من صحة البيانات المطلوبة
    if (!userInfo.email || !userInfo.id) {
      throw new Error('Invalid user info received from Google');
    }

    // جلب جميع البيانات من Google APIs
    let googleAdsAccounts: GoogleAdsAccount[] = [];
    let merchantCenterAccounts: MerchantCenterAccount[] = [];
    let youtubeChannels: YouTubeChannel[] = [];
    let analyticsAccounts: GoogleAnalyticsAccount[] = [];
    let businessLocations: GoogleMyBusinessLocation[] = [];
    
    try {
      // جلب حسابات Google Ads
      googleAdsAccounts = await fetchGoogleAdsAccounts(tokens.access_token);
      
      // جلب حسابات Merchant Center
      merchantCenterAccounts = await fetchMerchantCenterAccounts(tokens.access_token);
      
      // جلب قنوات YouTube
      youtubeChannels = await fetchYouTubeChannels(tokens.access_token);
      
      // جلب حسابات Google Analytics
      analyticsAccounts = await fetchGoogleAnalyticsAccounts(tokens.access_token);
      
      // جلب مواقع Google My Business
      businessLocations = await fetchGoogleMyBusinessLocations(tokens.access_token);
      
    } catch (apiError) {
      console.warn('Failed to fetch some Google API data:', apiError);
      // لا نرمي خطأ هنا، سنحاول لاحقاً
    }

    // البحث عن المستخدم في قاعدة البيانات
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userInfo.email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Database fetch error:', fetchError);
      throw new Error('Database error while fetching user');
    }

    let userId: string;
    let isNewUser = false;

    if (existingUser) {
      // تحديث المستخدم الموجود
      userId = existingUser.id;
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: userInfo.name || existingUser.name,
          picture: userInfo.picture || existingUser.picture,
          google_id: userInfo.id,
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user:', updateError);
        throw new Error('Failed to update user information');
      }
    } else {
      // إنشاء مستخدم جديد
      isNewUser = true;
      
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          email: userInfo.email,
          name: userInfo.name || userInfo.email.split('@')[0],
          picture: userInfo.picture,
          google_id: userInfo.id,
          provider: 'google',
          email_verified: userInfo.verified_email || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError || !newUser) {
        console.error('Error creating user:', insertError);
        throw new Error('Failed to create user account');
      }

      userId = newUser.id;
    }

    // حفظ أو تحديث Google OAuth tokens مع جميع الـ Scopes الجديدة
    const allScopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/adwords',
      'https://www.googleapis.com/auth/content',
      'https://www.googleapis.com/auth/business.manage',
      'https://www.googleapis.com/auth/plus.business.manage',
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/analytics',
      'https://www.googleapis.com/auth/analytics.manage.users',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.channel-memberships.creator',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
      'https://www.googleapis.com/auth/yt-analytics-monetary.readonly'
    ].join(' ');

    const { error: tokenError } = await supabase
      .from('user_oauth_tokens')
      .upsert({
        user_id: userId,
        provider: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        scope: tokens.scope || allScopes,
        token_type: tokens.token_type || 'Bearer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,provider'
      });

    if (tokenError) {
      console.error('Error saving OAuth tokens:', tokenError);
      // لا نرمي خطأ هنا لأن المستخدم تم إنشاؤه بنجاح
    }

    // حفظ حسابات Google Ads إذا تم جلبها بنجاح
    if (googleAdsAccounts.length > 0) {
      const { error: adsError } = await supabase
        .from('user_google_ads_accounts')
        .upsert(
          googleAdsAccounts.map((account: GoogleAdsAccount) => ({
            user_id: userId,
            account_id: account.id,
            account_name: account.name,
            currency_code: account.currency_code,
            time_zone: account.time_zone,
            is_manager_account: account.is_manager_account || false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })),
          { onConflict: 'user_id,account_id' }
        );

      if (adsError) {
        console.error('Error saving Google Ads accounts:', adsError);
      }
    }

    // حفظ حسابات Merchant Center إذا تم جلبها بنجاح
    if (merchantCenterAccounts.length > 0) {
      const { error: merchantError } = await supabase
        .from('user_merchant_center_accounts')
        .upsert(
          merchantCenterAccounts.map((account: MerchantCenterAccount) => ({
            user_id: userId,
            account_id: account.id,
            account_name: account.name,
            website_url: account.website_url,
            country: account.country,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })),
          { onConflict: 'user_id,account_id' }
        );

      if (merchantError) {
        console.error('Error saving Merchant Center accounts:', merchantError);
      }
    }

    // حفظ قنوات YouTube إذا تم جلبها بنجاح
    if (youtubeChannels.length > 0) {
      const { error: youtubeError } = await supabase
        .from('user_youtube_channels')
        .upsert(
          youtubeChannels.map((channel: YouTubeChannel) => ({
            user_id: userId,
            channel_id: channel.id,
            channel_title: channel.title,
            channel_description: channel.description,
            subscriber_count: parseInt(channel.subscriber_count) || 0,
            video_count: parseInt(channel.video_count) || 0,
            view_count: parseInt(channel.view_count) || 0,
            thumbnail_url: channel.thumbnail_url,
            country: channel.country,
            published_at: channel.published_at,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })),
          { onConflict: 'user_id,channel_id' }
        );

      if (youtubeError) {
        console.error('Error saving YouTube channels:', youtubeError);
      }
    }

    // حفظ حسابات Google Analytics إذا تم جلبها بنجاح
    if (analyticsAccounts.length > 0) {
      for (const account of analyticsAccounts) {
        // حفظ الحساب
        const { error: accountError } = await supabase
          .from('user_google_analytics_accounts')
          .upsert({
            user_id: userId,
            account_id: account.account_id,
            account_name: account.account_name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,account_id'
          });

        if (accountError) {
          console.error('Error saving Analytics account:', accountError);
          continue;
        }

        // حفظ الخصائص
        if (account.properties.length > 0) {
          const { error: propertiesError } = await supabase
            .from('user_google_analytics_properties')
            .upsert(
              account.properties.map((property: GoogleAnalyticsProperty) => ({
                user_id: userId,
                account_id: account.account_id,
                property_id: property.property_id,
                property_name: property.property_name,
                website_url: property.website_url,
                industry_category: property.industry_category,
                time_zone: property.time_zone,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })),
              { onConflict: 'user_id,property_id' }
            );

          if (propertiesError) {
            console.error('Error saving Analytics properties:', propertiesError);
          }
        }
      }
    }

    // حفظ مواقع Google My Business إذا تم جلبها بنجاح
    if (businessLocations.length > 0) {
      const { error: businessError } = await supabase
        .from('user_google_business_locations')
        .upsert(
          businessLocations.map((location: GoogleMyBusinessLocation) => ({
            user_id: userId,
            location_name: location.location_name,
            address: location.address,
            phone_number: location.phone_number,
            website_url: location.website_url,
            category: location.category,
            rating: location.rating,
            review_count: location.review_count,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })),
          { onConflict: 'user_id,location_name' }
        );

      if (businessError) {
        console.error('Error saving Business locations:', businessError);
      }
    }

    // إنشاء session token
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 يوم

    // حفظ الجلسة في قاعدة البيانات
    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      });

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      throw new Error('Failed to create user session');
    }

    // إعداد الاستجابة مع cookies
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // توجيه المستخدم إلى صفحة إنشاء الحملة مع معلومات جميع الحسابات المربوطة
    const redirectUrl = `${baseUrl}/campaign/new?connected=true&ads_accounts=${googleAdsAccounts.length}&merchant_accounts=${merchantCenterAccounts.length}&youtube_channels=${youtubeChannels.length}&analytics_accounts=${analyticsAccounts.length}&business_locations=${businessLocations.length}`;

    const response = NextResponse.redirect(redirectUrl);

    // إعداد session cookie
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 يوم
      path: '/'
    });

    // إعداد user info cookie مع جميع البيانات الجديدة
    const userCookie = {
      id: userId,
      email: userInfo.email,
      name: userInfo.name || userInfo.email.split('@')[0],
      picture: userInfo.picture,
      service_type: 'client',
      google_ads_accounts: googleAdsAccounts.length,
      merchant_center_accounts: merchantCenterAccounts.length,
      youtube_channels: youtubeChannels.length,
      analytics_accounts: analyticsAccounts.length,
      business_locations: businessLocations.length
    };

    response.cookies.set('user_info', JSON.stringify(userCookie), {
      httpOnly: false, // يمكن الوصول إليه من JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 يوم
      path: '/'
    });

    // حذف state cookie
    response.cookies.delete('oauth_state');

    return response;

  } catch (error) {
    console.error('OAuth callback error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    return NextResponse.redirect(
      `${baseUrl}/?error=oauth_callback_error&message=${encodeURIComponent(errorMessage)}`
    );
  }
}

// جلب حسابات Google Ads
async function fetchGoogleAdsAccounts(accessToken: string): Promise<GoogleAdsAccount[]> {
  try {
    const response = await fetch(`${GOOGLE_ADS_API_BASE_URL}/customers:listAccessibleCustomers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Ads API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.resourceNames || data.resourceNames.length === 0) {
      return [];
    }

    // جلب تفاصيل كل حساب
    const accounts: GoogleAdsAccount[] = [];
    for (const resourceName of data.resourceNames) {
      const customerId = resourceName.split('/')[1];
      
      try {
        const accountResponse = await fetch(`${GOOGLE_ADS_API_BASE_URL}/customers/${customerId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
            'Content-Type': 'application/json',
          },
        });

        if (accountResponse.ok) {
          const accountData = await accountResponse.json();
          accounts.push({
            id: customerId,
            name: accountData.descriptiveName || `Account ${customerId}`,
            currency_code: accountData.currencyCode || 'USD',
            time_zone: accountData.timeZone || 'UTC',
            is_manager_account: accountData.manager || false,
          });
        }
      } catch (accountError) {
        console.warn(`Failed to fetch details for account ${customerId}:`, accountError);
      }
    }

    return accounts;
  } catch (error) {
    console.error('Error fetching Google Ads accounts:', error);
    return [];
  }
}

// جلب حسابات Merchant Center
async function fetchMerchantCenterAccounts(accessToken: string): Promise<MerchantCenterAccount[]> {
  try {
    const response = await fetch('https://shoppingcontent.googleapis.com/content/v2.1/accounts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Merchant Center API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.resources || data.resources.length === 0) {
      return [];
    }

    return data.resources.map((account: any): MerchantCenterAccount => ({
      id: account.id,
      name: account.name || `Merchant Account ${account.id}`,
      website_url: account.websiteUrl || '',
      country: account.country || '',
    }));
  } catch (error) {
    console.error('Error fetching Merchant Center accounts:', error);
    return [];
  }
}

// جلب قنوات YouTube
async function fetchYouTubeChannels(accessToken: string): Promise<YouTubeChannel[]> {
  try {
    const response = await fetch(`${YOUTUBE_API_BASE_URL}/channels?part=snippet,statistics&mine=true`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items.map((channel: any): YouTubeChannel => ({
      id: channel.id,
      title: channel.snippet.title || 'Untitled Channel',
      description: channel.snippet.description || '',
      subscriber_count: channel.statistics.subscriberCount || '0',
      video_count: channel.statistics.videoCount || '0',
      view_count: channel.statistics.viewCount || '0',
      thumbnail_url: channel.snippet.thumbnails?.default?.url || '',
      country: channel.snippet.country || '',
      published_at: channel.snippet.publishedAt || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching YouTube channels:', error);
    return [];
  }
}

// جلب حسابات Google Analytics
async function fetchGoogleAnalyticsAccounts(accessToken: string): Promise<GoogleAnalyticsAccount[]> {
  try {
    const response = await fetch(`${ANALYTICS_API_BASE_URL}/accounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.accounts || data.accounts.length === 0) {
      return [];
    }

    const accounts: GoogleAnalyticsAccount[] = [];
    
    for (const account of data.accounts) {
      try {
        // جلب الخصائص لكل حساب
        const propertiesResponse = await fetch(`${ANALYTICS_API_BASE_URL}/${account.name}/properties`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        let properties: GoogleAnalyticsProperty[] = [];
        
        if (propertiesResponse.ok) {
          const propertiesData = await propertiesResponse.json();
          properties = propertiesData.properties?.map((property: any): GoogleAnalyticsProperty => ({
            property_id: property.name.split('/')[1],
            property_name: property.displayName || 'Untitled Property',
            website_url: property.websiteUrl || '',
            industry_category: property.industryCategory || '',
            time_zone: property.timeZone || 'UTC',
          })) || [];
        }

        accounts.push({
          account_id: account.name.split('/')[1],
          account_name: account.displayName || 'Untitled Account',
          properties: properties,
        });
      } catch (propertyError) {
        console.warn(`Failed to fetch properties for account ${account.name}:`, propertyError);
        accounts.push({
          account_id: account.name.split('/')[1],
          account_name: account.displayName || 'Untitled Account',
          properties: [],
        });
      }
    }

    return accounts;
  } catch (error) {
    console.error('Error fetching Analytics accounts:', error);
    return [];
  }
}

// جلب مواقع Google My Business
async function fetchGoogleMyBusinessLocations(accessToken: string): Promise<GoogleMyBusinessLocation[]> {
  try {
    // أولاً، جلب الحسابات
    const accountsResponse = await fetch(`${BUSINESS_PROFILE_API_BASE_URL}/accounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!accountsResponse.ok) {
      throw new Error(`Business Profile API error: ${accountsResponse.status}`);
    }

    const accountsData = await accountsResponse.json();
    
    if (!accountsData.accounts || accountsData.accounts.length === 0) {
      return [];
    }

    const locations: GoogleMyBusinessLocation[] = [];

    // جلب المواقع لكل حساب
    for (const account of accountsData.accounts) {
      try {
        const locationsResponse = await fetch(`${BUSINESS_PROFILE_API_BASE_URL}/${account.name}/locations`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json();
          
          if (locationsData.locations) {
            for (const location of locationsData.locations) {
              locations.push({
                name: location.name,
                location_name: location.title || 'Untitled Location',
                address: location.storefrontAddress ? 
                  `${location.storefrontAddress.addressLines?.join(', ') || ''}, ${location.storefrontAddress.locality || ''}, ${location.storefrontAddress.administrativeArea || ''}` : '',
                phone_number: location.phoneNumbers?.primaryPhone || '',
                website_url: location.websiteUri || '',
                category: location.primaryCategory?.displayName || '',
                rating: 0, // سيتم جلبها من API منفصل
                review_count: 0, // سيتم جلبها من API منفصل
              });
            }
          }
        }
      } catch (locationError) {
        console.warn(`Failed to fetch locations for account ${account.name}:`, locationError);
      }
    }

    return locations;
  } catch (error) {
    console.error('Error fetching Business locations:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

// دالة مساعدة لإنشاء session token
function generateSessionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// دالة مساعدة للتحقق من صحة البريد الإلكتروني
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// دالة مساعدة لتنظيف البيانات
function sanitizeUserData(data: GoogleUserInfo) {
  return {
    email: data.email?.toLowerCase().trim(),
    name: data.name?.trim() || data.email?.split('@')[0],
    picture: data.picture || null,
    google_id: data.id?.toString()
  };
}


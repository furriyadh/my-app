import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Cache للنتائج لتجنب المكالمات المتكررة
const accountsCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION = 30000; // 30 ثانية

// دالة لتجديد access token باستخدام أي refresh token
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    console.log('🔄 محاولة تجديد access token...');
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });
    if (response.ok) {
      const data = await response.json();
      console.log('✅ تم تجديد access token بنجاح');
      return data.access_token;
    }
    console.error('❌ فشل تجديد token:', response.status);
    return null;
  } catch (error) {
    console.error('❌ خطأ في تجديد token:', error);
    return null;
  }
}

// دالة للحصول على Access Token - تستخدم MCC Token أولاً ثم User Token كـ fallback
async function getValidAccessToken(userAccessToken?: string, userRefreshToken?: string): Promise<string | null> {
  // 1. أولاً: نحاول استخدام MCC refresh token من البيئة (الأفضل)
  const mccRefreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;
  
  if (mccRefreshToken) {
    console.log('🔑 محاولة استخدام MCC Token من البيئة...');
    const mccAccessToken = await refreshAccessToken(mccRefreshToken);
    if (mccAccessToken) {
      console.log('✅ تم الحصول على MCC Access Token بنجاح');
      return mccAccessToken;
    }
    console.warn('⚠️ فشل MCC Token، سنحاول User Token...');
  }
  
  // 2. ثانياً: نحاول User Access Token الموجود
  if (userAccessToken) {
    console.log('🔑 استخدام User Access Token الموجود...');
    return userAccessToken;
  }
  
  // 3. ثالثاً: نحاول تجديد User OAuth Token
  if (userRefreshToken) {
    console.log('🔑 محاولة تجديد User OAuth Token...');
    const newUserToken = await refreshAccessToken(userRefreshToken);
    if (newUserToken) {
      console.log('✅ تم الحصول على User Access Token بنجاح');
      return newUserToken;
    }
  }
  
  console.error('❌ فشل الحصول على أي Access Token صالح');
  return null;
}

// دالة للحصول على حسابات العميل الفعلية فقط (وليس MCC accounts)
async function getRealCustomerAccounts(accessToken: string) {
  try {
    console.log('📊 جلب حسابات العميل الفعلية من Google Ads API...');
    
    // الخطوة 1: الحصول على قائمة الحسابات المتاحة
    const listResponse = await fetch('https://googleads.googleapis.com/v21/customers:listAccessibleCustomers', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!listResponse.ok) {
      console.error('❌ فشل في الحصول على قائمة الحسابات');
      return [];
    }
    
    const listData = await listResponse.json();
    const resourceNames = listData.resourceNames || [];
    console.log('📋 عدد الحسابات المتاحة:', resourceNames.length);
    
    // الخطوة 2: فلترة الحسابات للحصول على حسابات العميل الفعلية فقط
    const realAccounts = [];
    
    for (const resourceName of resourceNames) {
      const customerId = resourceName.split('/').pop();
      console.log(`🔍 معالجة الحساب: ${customerId} من ${resourceName}`);
      
      try {
        // الخطوة 3: الحصول على تفاصيل كل حساب لتحديد نوعه
        console.log(`📡 جلب تفاصيل الحساب ${customerId}...`);
        const detailsResponse = await fetch(`https://googleads.googleapis.com/v21/customers/${customerId}/googleAds:search`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: `
              SELECT 
                customer.id,
                customer.descriptive_name,
                customer.currency_code,
                customer.time_zone,
                customer.status,
                customer.manager,
                customer.auto_tagging_enabled,
                customer.final_url_suffix,
                customer.test_account
              FROM customer
              LIMIT 1
            `
          }),
          signal: AbortSignal.timeout(5000)
        });
        
        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json();
          const results = detailsData.results || [];
          console.log(`✅ نجح جلب تفاصيل ${customerId}:`, { resultsCount: results.length });
          
          if (results.length > 0) {
            const customer = results[0].customer;
            
            // إضافة جميع الحسابات - حتى MCC accounts للعرض
            const accountType = customer.manager ? 'MCC_MANAGER' : 'REGULAR_ACCOUNT';
            
            realAccounts.push({
              id: customerId,
              customerId: customerId, // إضافة customerId للواجهة الأمامية
              name: customer.descriptive_name || `Google Ads Account ${customerId}`,
              type: 'google_ads' as const,
              status: customer.status || 'ENABLED', // ENABLED, SUSPENDED, CANCELLED
              isTestAccount: customer.test_account || false,
              isManager: customer.manager || false,
              accountType: accountType,
              details: {
                currency_code: customer.currency_code || 'USD',
                time_zone: customer.time_zone || 'UTC',
                auto_tagging_enabled: customer.auto_tagging_enabled || false,
                final_url_suffix: customer.final_url_suffix || null,
                last_updated: new Date().toISOString()
              }
            });
            
            console.log(`✅ تمت إضافة ${accountType}:`, {
              id: customerId,
              name: customer.descriptive_name,
              status: customer.status,
              isManager: customer.manager,
              isTest: customer.test_account
            });
          }
        } else {
          console.error(`❌ فشل API call للحساب ${customerId}:`, {
            status: detailsResponse.status,
            statusText: detailsResponse.statusText
          });
          
          // إضافة الحساب حتى لو فشل API call
          realAccounts.push({
            id: customerId,
            customerId: customerId,
            name: `Google Ads Account ${customerId}`,
            type: 'google_ads' as const,
            status: 'ENABLED',
            isTestAccount: false,
            isManager: false,
            accountType: 'REGULAR_ACCOUNT',
            details: {
              currency_code: 'USD',
              time_zone: 'UTC',
              auto_tagging_enabled: false,
              final_url_suffix: null,
              last_updated: new Date().toISOString()
            }
          });
          console.log(`✅ تمت إضافة الحساب ${customerId} كحساب افتراضي`);
        }
      } catch (accountError) {
        console.warn(`⚠️ فشل في الحصول على تفاصيل الحساب ${customerId}:`, accountError);
        // في حالة الخطأ، أضف الحساب كحساب عادي
        realAccounts.push({
          id: customerId,
          customerId: customerId,
          name: `Google Ads Account ${customerId}`,
          type: 'google_ads' as const,
          status: 'ENABLED',
          isTestAccount: false,
          isManager: false,
          accountType: 'REGULAR_ACCOUNT',
          details: {
            currency_code: 'USD',
            time_zone: 'UTC',
            auto_tagging_enabled: false,
            final_url_suffix: null,
            last_updated: new Date().toISOString()
          }
        });
        console.log(`✅ تمت إضافة الحساب ${customerId} من catch block`);
      }
    }
    
    console.log(`📊 تم العثور على ${realAccounts.length} حساب عميل فعلي من أصل ${resourceNames.length} حساب متاح`);
    return realAccounts;
    
  } catch (error) {
    console.error('❌ خطأ في جلب حسابات العميل الفعلية:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 GET /api/user/accounts - جلب حسابات المستخدم الحالي فقط...');
    
    // الحصول على access token من HttpOnly cookies
    const cookieStore = await cookies();
    
    // تشخيص cookies أولاً
    const allCookies = cookieStore.getAll();
    console.log('🔍 جميع cookies الموجودة:', allCookies.map(c => ({ 
      name: c.name, 
      hasValue: !!c.value, 
      valueLength: c.value?.length || 0,
      valuePreview: c.value?.substring(0, 30) + '...' || 'empty'
    })));
    
    const accessToken = cookieStore.get('oauth_access_token')?.value;
    const refreshToken = cookieStore.get('oauth_refresh_token')?.value;
    const userInfoCookie = cookieStore.get('oauth_user_info')?.value;
    
    // استخراج معلومات المستخدم الحالي
    let currentUserEmail = null;
    let currentUserId = null;
    if (userInfoCookie) {
      try {
        const userInfo = JSON.parse(userInfoCookie);
        currentUserEmail = userInfo.email;
        currentUserId = userInfo.id;
        console.log('👤 المستخدم الحالي:', { id: currentUserId, email: currentUserEmail });
      } catch (e) {
        console.warn('⚠️ فشل في تحليل oauth_user_info');
      }
    }
    
    console.log('🔍 فحص OAuth tokens:', {
      oauth_access_token: accessToken ? `موجود (${accessToken.length} chars)` : 'غير موجود',
      oauth_refresh_token: refreshToken ? `موجود (${refreshToken.length} chars)` : 'غير موجود',
      currentUser: currentUserEmail || 'غير معروف',
      cookiesCount: allCookies.length,
      allCookieNames: allCookies.map(c => c.name)
    });
    
    // فحص الكاش أولاً - استخدام مفتاح يشمل user ID لضمان عدم خلط البيانات
    const cacheKey = currentUserId ? `${currentUserId}_${accessToken}` : accessToken;
    if (cacheKey) {
      const cached = accountsCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('✅ إرجاع البيانات من الكاش للمستخدم:', currentUserEmail);
        return NextResponse.json(cached.data);
      }
    }
    
    // 🔑 الحصول على Access Token - MCC أولاً ثم User Token
    console.log('🔑 جلب Access Token (MCC أولاً)...');
    const validAccessToken = await getValidAccessToken(accessToken, refreshToken);
    
    if (validAccessToken) {
      console.log('✅ استخدام Access Token صالح مع Google API');
      
      // جلب الحسابات مباشرة من Google API باستخدام access token
      const directAccounts = await getRealCustomerAccounts(validAccessToken);
      
      console.log(`📊 تم جلب ${directAccounts.length} حساب للمستخدم ${currentUserEmail}`);
      
      const formattedAccounts = {
        google_ads: directAccounts,
        merchant_center: [],
        youtube: [],
        analytics: [],
        business: [],
        user: {
          id: currentUserId,
          email: currentUserEmail
        }
      };
      
      // حفظ في الكاش مع مفتاح يشمل user ID
      if (cacheKey) {
        accountsCache.set(cacheKey, {
          data: formattedAccounts,
          timestamp: Date.now()
        });
      }
      
      return NextResponse.json(formattedAccounts);
    }
    
    // إذا لم يوجد access token صالح
    console.log('⚠️ لا يوجد access token صالح');
    
    // إذا فشل كل شيء، إرجاع بيانات فارغة
    console.log('⚠️ لا يمكن الحصول على access token - إرجاع بيانات فارغة');
    console.log('📊 سبب عدم وجود access token:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      currentUser: currentUserEmail,
      suggestion: 'العميل قد يحتاج لإعادة OAuth'
    });
    
    return NextResponse.json({
      google_ads: [],
      merchant_center: [],
      youtube: [],
      analytics: [],
      business: [],
      user: {
        id: currentUserId,
        email: currentUserEmail
      },
      debug: {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        message: 'No OAuth tokens found - customer may need to re-authenticate'
      }
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
  } catch (error) {
    console.error('❌ خطأ في جلب حسابات المستخدم:', error);
    
    // إرجاع بيانات فارغة في حالة الخطأ
    return NextResponse.json({
      google_ads: [],
      merchant_center: [],
      youtube: [],
      analytics: [],
      business: []
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}
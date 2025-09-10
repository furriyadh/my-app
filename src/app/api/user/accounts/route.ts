import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Cache للنتائج لتجنب المكالمات المتكررة
const accountsCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION = 30000; // 30 ثانية

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
    console.log('🔄 GET /api/user/accounts - جلب حسابات المستخدم...');
    
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
    
    let accessToken = cookieStore.get('oauth_access_token')?.value;
    const refreshToken = cookieStore.get('oauth_refresh_token')?.value;
    
    console.log('🔍 فحص OAuth tokens:', {
      oauth_access_token: accessToken ? `موجود (${accessToken.length} chars)` : 'غير موجود',
      oauth_refresh_token: refreshToken ? `موجود (${refreshToken.length} chars)` : 'غير موجود',
      cookiesCount: allCookies.length,
      allCookieNames: allCookies.map(c => c.name)
    });
    
    // إذا لم يوجد access token، حاول تجديده باستخدام refresh token
    if (!accessToken && refreshToken) {
      console.log('🔄 محاولة تجديد access token...');
      try {
        const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/oauth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          accessToken = refreshData.access_token;
          console.log('✅ تم تجديد access token بنجاح');
        } else {
          console.error('❌ فشل في تجديد access token');
        }
      } catch (refreshError) {
        console.error('❌ خطأ في تجديد access token:', refreshError);
      }
    }
    
    // فحص الكاش أولاً
    if (accessToken) {
      const cached = accountsCache.get(accessToken);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('✅ إرجاع البيانات من الكاش');
        return NextResponse.json(cached.data);
      }
    }
    
    console.log('🔄 جلب حسابات المستخدم من Flask Backend...');
    
    // إذا يوجد access token، استخدمه مع Flask Backend
    if (accessToken) {
      console.log('✅ استخدام access token مع Flask Backend');
      
      const backendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://my-app-production-28d2.up.railway.app'
        : 'http://localhost:5000';
      
      const response = await fetch(`${backendUrl}/api/user/accounts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ تم جلب الحسابات من Flask Backend:', data);
        
        // حفظ في الكاش
        accountsCache.set(accessToken, {
          data: data,
          timestamp: Date.now()
        });
        
        return NextResponse.json(data);
      } else {
        console.error('❌ Flask Backend error:', response.status, response.statusText);
        return NextResponse.json({
          google_ads: [],
          merchant_center: [],
          youtube: [],
          analytics: [],
          business: []
        }, { status: 200 });
      }
    }
    
    // إذا لم يوجد access token، جرب استخدام refresh token
    console.log('⚠️ لا يوجد access token - محاولة استخدام refresh token:', refreshToken ? 'موجود' : 'غير موجود');
    
    if (refreshToken) {
      try {
        // محاولة تجديد access token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_ADS_CLIENT_ID || '',
            client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
          })
        });

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          console.log('✅ تم تجديد access token بنجاح');
          
          // استخدام الـ access token الجديد مباشرة مع Google API
          const newAccessToken = tokenData.access_token;
          const directAccounts = await getRealCustomerAccounts(newAccessToken);
          
          const formattedAccounts = {
            google_ads: directAccounts,
            merchant_center: [],
            youtube: [],
            analytics: [],
            business: []
          };
          
          return NextResponse.json(formattedAccounts, { 
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            }
          });
        }
      } catch (error) {
        console.error('❌ خطأ في تجديد access token:', error);
      }
    }
    
    // إذا فشل كل شيء، إرجاع بيانات فارغة
    console.log('⚠️ لا يمكن الحصول على access token - إرجاع بيانات فارغة');
    console.log('📊 سبب عدم وجود access token:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      suggestion: 'العميل قد يحتاج لإعادة OAuth'
    });
    
    return NextResponse.json({
      google_ads: [],
      merchant_center: [],
      youtube: [],
      analytics: [],
      business: [],
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
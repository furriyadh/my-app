// API to fetch all campaigns with comprehensive metrics from Google Ads
// 📊 يجلب البيانات فقط من الحسابات المرتبطة (Connected) في صفحة /integrations/google-ads
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { getMCCAccessToken, getDeveloperToken, getMCCId, mutateCampaignStatus } from '@/lib/google-ads-auth';

// إنشاء Supabase client
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
};

// دالة لجلب الحسابات المرتبطة من Supabase
async function getConnectedAccounts(userId: string): Promise<string[]> {
  try {
    const supabase = getSupabaseAdmin();
    
    // جلب الحسابات المرتبطة (Connected) - نفس المنطق المستخدم في صفحة الحسابات
    console.log(`🔍 البحث عن حسابات مرتبطة للمستخدم: ${userId}`);
    
    // جلب جميع الحسابات للمستخدم
    const { data: allData, error: allError } = await supabase
      .from('client_requests')
      .select('customer_id, status, link_details')
      .eq('user_id', userId);
    
    if (allError) {
      console.error('❌ خطأ في جلب الحسابات:', allError);
      return [];
    }
    
    console.log(`📋 جميع الحسابات للمستخدم (${allData?.length || 0}):`, allData?.map(d => `${d.customer_id}: ${d.status}`));
    
    // فلترة الحسابات المرتبطة (Connected) - نفس المنطق في صفحة الحسابات
    // الحسابات المرتبطة هي:
    // 1. status = ACTIVE أو DISABLED أو SUSPENDED أو CUSTOMER_NOT_ENABLED
    // 2. أو link_details.link_status = ACTIVE
    // 3. أو link_details.verified = true
    // نضيف ENABLED لأن بعض الحسابات تُحفظ بهذه الحالة من Google Ads API
    const connectedStatuses = ['ACTIVE', 'ENABLED', 'DISABLED', 'SUSPENDED', 'CUSTOMER_NOT_ENABLED', 'PENDING'];
    const connectedAccounts = (allData || []).filter(row => {
      if (!row.customer_id) return false;
      
      console.log(`🔍 Checking account ${row.customer_id}: status=${row.status}`);
      
      // التحقق من الحالة المباشرة
      if (connectedStatuses.includes(row.status)) {
        console.log(`✅ Account ${row.customer_id} connected via status: ${row.status}`);
        return true;
      }
      
      // التحقق من link_details
      const linkDetails = row.link_details as any;
      if (linkDetails) {
        // إذا كان link_status = ACTIVE أو verified = true
        if (linkDetails.link_status === 'ACTIVE' || linkDetails.verified === true || linkDetails.status === 'ACTIVE') {
          console.log(`✅ الحساب ${row.customer_id} مرتبط عبر link_details:`, linkDetails.link_status || 'verified');
          return true;
        }
      }
      
      // إذا لم يكن هناك status محدد لكن الحساب موجود، نعتبره متصل
      if (!row.status && row.customer_id) {
        console.log(`✅ Account ${row.customer_id} connected (no status, assuming connected)`);
        return true;
      }
      
      return false;
    });
    
    console.log(`📋 الحسابات المرتبطة (Connected): ${connectedAccounts.length}`, connectedAccounts.map(d => `${d.customer_id}: ${d.status}`));
    
    // إزالة التكرارات باستخدام Set
    const uniqueIds = [...new Set(connectedAccounts.map(row => row.customer_id))];
    console.log(`✅ تم العثور على ${uniqueIds.length} حساب مرتبط (فريد):`, uniqueIds);
    return uniqueIds;
  } catch (error) {
    console.error('❌ خطأ في getConnectedAccounts:', error);
    return [];
  }
}

// ==================== استخدام Helper موحد ====================
// الآن نستخدم getMCCAccessToken() من @/lib/google-ads-auth
// يُجدد تلقائياً ويخزن في cache لتجنب التجديد المتكرر
// ============================================================

// دالة للحصول على Access Token - تستخدم الـ helper الموحد
async function getValidAccessToken(_userRefreshToken?: string): Promise<string | null> {
  // استخدام الـ helper الموحد - يُجدد تلقائياً
  return getMCCAccessToken();
}

// دالة لجلب عملة الحساب
async function getAccountCurrency(customerId: string, accessToken: string): Promise<string> {
  try {
    const loginCustomerId = getMCCId();
    const developerToken = getDeveloperToken();
    
    const response = await fetch(`https://googleads.googleapis.com/v21/customers/${customerId}/googleAds:search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'login-customer-id': loginCustomerId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `SELECT customer.currency_code FROM customer LIMIT 1`
      }),
      signal: AbortSignal.timeout(10000)
    });
    
    if (response.ok) {
      const data = await response.json();
      const currency = data.results?.[0]?.customer?.currencyCode || 'USD';
      console.log(`💱 عملة الحساب ${customerId}: ${currency}`);
      return currency;
    }
    return 'USD';
  } catch (error) {
    return 'USD';
  }
}

// دالة لجلب الحملات من حساب واحد
async function fetchCampaignsFromAccount(customerId: string, accessToken: string, timeRange: string, startDateParam?: string, endDateParam?: string) {
  try {
    console.log(`📊 جلب حملات الحساب ${customerId}...`);
    
    // جلب عملة الحساب أولاً
    const currency = await getAccountCurrency(customerId, accessToken);
    
    // استخدام التواريخ المرسلة من العميل إذا وجدت، وإلا حساب التواريخ
    let startDateStr: string;
    let endDateStr: string;
    
    if (startDateParam && endDateParam) {
      // استخدام التواريخ المرسلة من العميل (بتوقيته المحلي)
      startDateStr = startDateParam;
      endDateStr = endDateParam;
      console.log(`📅 استخدام تواريخ العميل: ${startDateStr} - ${endDateStr}`);
    } else {
      // حساب التواريخ على الخادم (للتوافق مع الطلبات القديمة)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));
      startDateStr = startDate.toISOString().split('T')[0];
      endDateStr = endDate.toISOString().split('T')[0];
      console.log(`📅 حساب التواريخ على الخادم: ${startDateStr} - ${endDateStr}`);
    }
    
    const loginCustomerId = getMCCId();
    const developerToken = getDeveloperToken();
    
    const response = await fetch(`https://googleads.googleapis.com/v21/customers/${customerId}/googleAds:search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'login-customer-id': loginCustomerId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
          SELECT 
            campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type,
            campaign.start_date, campaign.end_date, campaign_budget.amount_micros,
            metrics.impressions, metrics.clicks, metrics.ctr, metrics.conversions,
            metrics.conversions_value, metrics.cost_micros, metrics.average_cpc,
            metrics.average_cpm, metrics.cost_per_conversion
          FROM campaign
          WHERE segments.date BETWEEN '${startDateStr}' AND '${endDateStr}'
            AND campaign.status != REMOVED
          ORDER BY metrics.cost_micros DESC
          LIMIT 100
        `
      }),
      signal: AbortSignal.timeout(15000)
    });
    
    if (!response.ok) {
      console.warn(`⚠️ فشل جلب حملات الحساب ${customerId}:`, response.status);
      return [];
    }
    
    const data = await response.json();
    const results = data.results || [];
    console.log(`✅ تم جلب ${results.length} حملة من الحساب ${customerId}`);
    
    return results.map((row: any) => {
      const campaign = row.campaign || {};
      const metrics = row.metrics || {};
      const budget = row.campaignBudget || {};
      
      const typeMap: Record<string, string> = {
        'SEARCH': 'SEARCH', 'DISPLAY': 'DISPLAY', 'VIDEO': 'VIDEO',
        'SHOPPING': 'SHOPPING', 'PERFORMANCE_MAX': 'PERFORMANCE_MAX'
      };
      
      return {
        id: campaign.id?.toString() || '',
        name: campaign.name || 'Unnamed Campaign',
        type: typeMap[campaign.advertisingChannelType] || campaign.advertisingChannelType || 'UNKNOWN',
        status: campaign.status || 'UNKNOWN',
        customerId: customerId,
        currency: currency,
        budget: budget.amountMicros ? budget.amountMicros / 1000000 : 0,
        impressions: parseInt(metrics.impressions) || 0,
        clicks: parseInt(metrics.clicks) || 0,
        ctr: parseFloat(metrics.ctr) || 0,
        conversions: parseFloat(metrics.conversions) || 0,
        conversionsValue: parseFloat(metrics.conversionsValue) || 0,
        cost: metrics.costMicros ? metrics.costMicros / 1000000 : 0,
        averageCpc: metrics.averageCpc ? metrics.averageCpc / 1000000 : 0,
        averageCpm: metrics.averageCpm ? metrics.averageCpm / 1000000 : 0,
        costPerConversion: metrics.costPerConversion ? metrics.costPerConversion / 1000000 : 0,
        roas: metrics.costMicros && metrics.costMicros > 0 
          ? (parseFloat(metrics.conversionsValue) || 0) / (metrics.costMicros / 1000000) : 0
      };
    });
  } catch (error) {
    console.error(`❌ خطأ في جلب حملات الحساب ${customerId}:`, error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 GET /api/campaigns - جلب حملات الحسابات المرتبطة فقط...');
    
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30';
    // جلب التواريخ المرسلة من العميل (بتوقيته المحلي)
    const startDateParam = searchParams.get('startDate') || undefined;
    const endDateParam = searchParams.get('endDate') || undefined;
    
    console.log(`📅 الفترة الزمنية: ${timeRange} يوم، التواريخ: ${startDateParam || 'غير محدد'} - ${endDateParam || 'غير محدد'}`);
    
    // الحصول على معلومات المستخدم و tokens من cookies
    const cookieStore = await cookies();
    const userRefreshToken = cookieStore.get('oauth_refresh_token')?.value;
    const userInfoCookie = cookieStore.get('oauth_user_info')?.value;
    
    // استخراج user ID
    let userId = null;
    if (userInfoCookie) {
      try {
        const userInfo = JSON.parse(userInfoCookie);
        userId = userInfo.id;
        console.log('👤 المستخدم:', userInfo.email);
      } catch (e) {}
    }
    
    // 🔑 الحصول على Access Token - MCC أولاً ثم User Token
    console.log('🔑 جلب Access Token (MCC أولاً)...');
    const accessToken = await getValidAccessToken(userRefreshToken);
    
    // إذا لم يوجد access token أو user ID - إرجاع بيانات فارغة (وليس mock)
    if (!accessToken || !userId) {
      console.log('⚠️ لا يوجد access token أو user ID - إرجاع بيانات فارغة');
      return NextResponse.json({
        success: true,
        campaigns: [],
        accounts: [],
        accountsCount: 0,
        metrics: {
          totalCampaigns: 0, activeCampaigns: 0, totalSpend: 0,
          impressions: 0, clicks: 0, ctr: '0', conversions: 0,
          conversionsValue: 0, roas: '0', averageCpc: '0', averageCpm: '0',
          conversionRate: '0', costPerConversion: '0',
          campaignTypes: { SEARCH: 0, VIDEO: 0, SHOPPING: 0, DISPLAY: 0, PERFORMANCE_MAX: 0 }
        },
        timeRange: parseInt(timeRange),
        message: 'يرجى تسجيل الدخول وربط حساباتك الإعلانية.'
      });
    }
    
    // 🔑 جلب الحسابات المرتبطة فقط من Supabase
    const connectedAccountIds = await getConnectedAccounts(userId);
    
    if (connectedAccountIds.length === 0) {
      console.log('⚠️ لا توجد حسابات مرتبطة - إرجاع بيانات فارغة');
      return NextResponse.json({
        success: true,
        campaigns: [],
        accounts: [],
        accountsCount: 0,
        metrics: {
          totalCampaigns: 0, activeCampaigns: 0, totalSpend: 0,
          impressions: 0, clicks: 0, ctr: '0', conversions: 0,
          conversionsValue: 0, roas: '0', averageCpc: '0', averageCpm: '0',
          conversionRate: '0', costPerConversion: '0',
          campaignTypes: { SEARCH: 0, VIDEO: 0, SHOPPING: 0, DISPLAY: 0, PERFORMANCE_MAX: 0 }
        },
        timeRange: parseInt(timeRange),
        message: 'لا توجد حسابات مرتبطة. قم بربط حساباتك من صفحة التكاملات.'
      });
    }
    
    console.log(`🔗 جلب الحملات من ${connectedAccountIds.length} حساب مرتبط:`, connectedAccountIds);
    
    // جلب الحملات من جميع الحسابات المرتبطة بالتوازي
    const campaignsPromises = connectedAccountIds.map(customerId => 
      fetchCampaignsFromAccount(customerId, accessToken!, timeRange, startDateParam, endDateParam)
    );
    
    const allCampaignsArrays = await Promise.all(campaignsPromises);
    const allCampaigns = allCampaignsArrays.flat();
    
    console.log(`✅ تم جلب ${allCampaigns.length} حملة من ${connectedAccountIds.length} حساب مرتبط`);
    
    // إذا لم توجد حملات، إرجاع بيانات فارغة (وليس mock)
    if (allCampaigns.length === 0) {
      return NextResponse.json({
        success: true,
        campaigns: [],
        accounts: connectedAccountIds,
        accountsCount: connectedAccountIds.length,
        metrics: {
          totalCampaigns: 0, activeCampaigns: 0, totalSpend: 0,
          impressions: 0, clicks: 0, ctr: '0', conversions: 0,
          conversionsValue: 0, roas: '0', averageCpc: '0', averageCpm: '0',
          conversionRate: '0', costPerConversion: '0',
          campaignTypes: { SEARCH: 0, VIDEO: 0, SHOPPING: 0, DISPLAY: 0, PERFORMANCE_MAX: 0 }
        },
        timeRange: parseInt(timeRange),
        message: 'لا توجد حملات نشطة في الحسابات المرتبطة.'
      });
    }
    
    // حساب المقاييس الإجمالية
    const totalImpressions = allCampaigns.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = allCampaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalConversions = allCampaigns.reduce((sum, c) => sum + c.conversions, 0);
    const totalCost = allCampaigns.reduce((sum, c) => sum + c.cost, 0);
    const totalConversionsValue = allCampaigns.reduce((sum, c) => sum + c.conversionsValue, 0);
    
    // جلب العملة من أول حملة
    const primaryCurrency = allCampaigns.length > 0 ? allCampaigns[0].currency : 'USD';
    console.log(`💱 العملة الرئيسية: ${primaryCurrency}`);
    
    return NextResponse.json({
      success: true,
      campaigns: allCampaigns,
      accounts: connectedAccountIds,
      accountsCount: connectedAccountIds.length,
      metrics: {
        totalCampaigns: allCampaigns.length,
        activeCampaigns: allCampaigns.filter(c => c.status === 'ENABLED').length,
        totalSpend: totalCost,
        impressions: totalImpressions,
        clicks: totalClicks,
        ctr: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0',
        conversions: totalConversions,
        conversionsValue: totalConversionsValue,
        roas: totalCost > 0 ? (totalConversionsValue / totalCost).toFixed(2) : '0',
        averageCpc: totalClicks > 0 ? (totalCost / totalClicks).toFixed(2) : '0',
        averageCpm: totalImpressions > 0 ? ((totalCost / totalImpressions) * 1000).toFixed(2) : '0',
        conversionRate: totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0',
        costPerConversion: totalConversions > 0 ? (totalCost / totalConversions).toFixed(2) : '0',
        currency: primaryCurrency,
        campaignTypes: {
          SEARCH: allCampaigns.filter(c => c.type === 'SEARCH').length,
          VIDEO: allCampaigns.filter(c => c.type === 'VIDEO').length,
          SHOPPING: allCampaigns.filter(c => c.type === 'SHOPPING').length,
          DISPLAY: allCampaigns.filter(c => c.type === 'DISPLAY').length,
          PERFORMANCE_MAX: allCampaigns.filter(c => c.type === 'PERFORMANCE_MAX').length
        }
      },
      timeRange: parseInt(timeRange),
      source: 'google_ads_connected_accounts'
    });

  } catch (error) {
    console.error('❌ Error fetching campaigns:', error);
    // إرجاع بيانات فارغة في حالة الخطأ (وليس mock)
    return NextResponse.json({
      success: true,
      campaigns: [],
      accounts: [],
      accountsCount: 0,
      metrics: {
        totalCampaigns: 0, activeCampaigns: 0, totalSpend: 0,
        impressions: 0, clicks: 0, ctr: '0', conversions: 0,
        conversionsValue: 0, roas: '0', averageCpc: '0', averageCpm: '0',
        conversionRate: '0', costPerConversion: '0',
        campaignTypes: { SEARCH: 0, VIDEO: 0, SHOPPING: 0, DISPLAY: 0, PERFORMANCE_MAX: 0 }
      },
      timeRange: 30,
      error: 'حدث خطأ في جلب البيانات'
    });
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

// PATCH - تحديث حالة الحملة (تشغيل/إيقاف)
// يستخدم mutateCampaignStatus من الـ helper الموحد
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, customerId, status } = body;
    
    console.log('📥 PATCH Request received:', { campaignId, customerId, status });
    
    if (!campaignId || !status) {
      return NextResponse.json({ error: 'Missing campaignId or status' }, { status: 400 });
    }
    
    // التحقق من المستخدم
    const cookieStore = await cookies();
    const userInfoCookie = cookieStore.get('oauth_user_info')?.value;
    
    if (!userInfoCookie) {
      console.error('❌ No oauth_user_info found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // استخراج user ID
    let userId = null;
    try {
      const userInfo = JSON.parse(userInfoCookie);
      userId = userInfo.id || userInfo.sub;
      console.log('👤 User ID:', userId);
    } catch (e) {
      console.error('❌ Error parsing user info:', e);
    }
    
    // تحديد الحساب
    let targetCustomerId = customerId;
    if (!targetCustomerId && userId) {
      const connectedAccounts = await getConnectedAccounts(userId);
      console.log('📋 Connected accounts:', connectedAccounts);
      if (connectedAccounts.length > 0) {
        targetCustomerId = connectedAccounts[0];
      }
    }
    
    if (!targetCustomerId) {
      console.error('❌ No connected account found');
      return NextResponse.json({ error: 'No connected account found' }, { status: 400 });
    }
    
    // استخدام الـ helper الموحد لتحديث الحملة
    const result = await mutateCampaignStatus(
      targetCustomerId,
      campaignId,
      status as 'ENABLED' | 'PAUSED'
    );
    
    if (!result.success) {
      console.error('❌ Campaign update failed:', result.error);
      return NextResponse.json({ 
        error: result.error || 'Failed to update campaign',
        success: false 
      }, { status: 400 });
    }
    
    console.log(`✅ Campaign ${campaignId} updated to ${status}`);
    return NextResponse.json({ 
      success: true, 
      message: `Campaign status updated to ${status}` 
    });
    
  } catch (error) {
    console.error('❌ Error in PATCH /api/campaigns:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


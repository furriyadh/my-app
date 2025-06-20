// supabase/functions/google-ads-data/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

serve(async (req ) => {
  try {
    // قراءة متغيرات البيئة
    const DEVELOPER_TOKEN = Deno.env.get('DEVELOPER_TOKEN');
    const CLIENT_ID = Deno.env.get('CLIENT_ID');
    const CLIENT_SECRET = Deno.env.get('CLIENT_SECRET');
    const REFRESH_TOKEN = Deno.env.get('REFRESH_TOKEN');
    const LOGIN_CUSTOMER_ID = Deno.env.get('LOGIN_CUSTOMER_ID'); // هذا هو معرف العميل الذي تريد جلب البيانات منه

    // التحقق من وجود جميع المتغيرات
    if (!DEVELOPER_TOKEN || !CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !LOGIN_CUSTOMER_ID) {
      return new Response(JSON.stringify({ error: 'Missing environment variables' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // الخطوة 1: الحصول على Access Token باستخدام Refresh Token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        grant_type: 'refresh_token',
      } ).toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      return new Response(JSON.stringify({ error: 'Failed to get access token', details: errorData }), {
        headers: { 'Content-Type': 'application/json' },
        status: tokenResponse.status,
      });
    }

    const tokenData = await tokenResponse.json();
    const ACCESS_TOKEN = tokenData.access_token;

    // الخطوة 2: إجراء طلب إلى Google Ads API لجلب بيانات الحملات
    const GOOGLE_ADS_API_VERSION = 'v17'; // يمكنك تحديث هذا الإصدار إذا لزم الأمر
    const GOOGLE_ADS_ENDPOINT = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${LOGIN_CUSTOMER_ID}/googleAds:search`;

    // استعلام GAQL لجلب معرف واسم الحملة
    const GAQL_QUERY = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status
      FROM
        campaign
      ORDER BY
        campaign.id
      LIMIT 10
    `;

    const googleAdsResponse = await fetch(GOOGLE_ADS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'developer-token': DEVELOPER_TOKEN,
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'login-customer-id': LOGIN_CUSTOMER_ID, // مهم جداً إذا كنت تدير حسابات متعددة
      },
      body: JSON.stringify({
        query: GAQL_QUERY,
      } ),
    });

    if (!googleAdsResponse.ok) {
      const errorData = await googleAdsResponse.json();
      return new Response(JSON.stringify({ error: 'Failed to fetch Google Ads data', details: errorData }), {
        headers: { 'Content-Type': 'application/json' },
        status: googleAdsResponse.status,
      });
    }

    const googleAdsData = await googleAdsResponse.json();

    return new Response(JSON.stringify(googleAdsData), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

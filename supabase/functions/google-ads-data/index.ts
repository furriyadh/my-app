// supabase/functions/google-ads-data/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

serve(async (req ) => {
  console.log('🚀 Google Ads Data Function started');
  
  try {
    // قراءة متغيرات البيئة
    const DEVELOPER_TOKEN = Deno.env.get('DEVELOPER_TOKEN');
    const CLIENT_ID = Deno.env.get('CLIENT_ID');
    const CLIENT_SECRET = Deno.env.get('CLIENT_SECRET');
    const REFRESH_TOKEN = Deno.env.get('REFRESH_TOKEN');
    const MCC_LOGIN_CUSTOMER_ID = Deno.env.get('LOGIN_CUSTOMER_ID');

    console.log('📋 Environment variables check:');
    console.log('DEVELOPER_TOKEN:', DEVELOPER_TOKEN ? '✅ Set' : '❌ Missing');
    console.log('CLIENT_ID:', CLIENT_ID ? '✅ Set' : '❌ Missing');
    console.log('CLIENT_SECRET:', CLIENT_SECRET ? '✅ Set' : '❌ Missing');
    console.log('REFRESH_TOKEN:', REFRESH_TOKEN ? '✅ Set' : '❌ Missing');
    console.log('MCC_LOGIN_CUSTOMER_ID:', MCC_LOGIN_CUSTOMER_ID ? `✅ Set (${MCC_LOGIN_CUSTOMER_ID})` : '❌ Missing');

    // التحقق من وجود جميع المتغيرات
    if (!DEVELOPER_TOKEN || !CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !MCC_LOGIN_CUSTOMER_ID) {
      console.error('❌ Missing required environment variables');
      return new Response(JSON.stringify({ 
        error: 'Missing environment variables',
        missing: {
          DEVELOPER_TOKEN: !DEVELOPER_TOKEN,
          CLIENT_ID: !CLIENT_ID,
          CLIENT_SECRET: !CLIENT_SECRET,
          REFRESH_TOKEN: !REFRESH_TOKEN,
          MCC_LOGIN_CUSTOMER_ID: !MCC_LOGIN_CUSTOMER_ID
        }
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // قراءة جسم الطلب
    const requestBody = await req.json();
    console.log('📨 Request body:', JSON.stringify(requestBody, null, 2));
    
    const { loginCustomerId } = requestBody;

    if (!loginCustomerId) {
      console.error('❌ Missing loginCustomerId in request body');
      return new Response(JSON.stringify({ error: 'Missing loginCustomerId in request body' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log('🎯 Target Customer ID:', loginCustomerId);
    console.log('🏢 MCC Login Customer ID:', MCC_LOGIN_CUSTOMER_ID);

    // الخطوة 1: الحصول على Access Token
    console.log('🔑 Getting access token...');
    
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

    console.log('🔑 Token response status:', tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('❌ Failed to get access token:', errorData);
      return new Response(JSON.stringify({ 
        error: 'Failed to get access token', 
        details: errorData,
        status: tokenResponse.status
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: tokenResponse.status,
      });
    }

    const tokenData = await tokenResponse.json();
    const ACCESS_TOKEN = tokenData.access_token;
    console.log('✅ Access token obtained successfully');

    // الخطوة 2: إجراء طلب إلى Google Ads API
    const GOOGLE_ADS_API_VERSION = 'v17';
    const GOOGLE_ADS_ENDPOINT = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${loginCustomerId}/googleAds:search`;
    
    console.log('🌐 Google Ads API endpoint:', GOOGLE_ADS_ENDPOINT );

    // استعلام GAQL مبسط جداً للاختبار
    const GAQL_QUERY = `
      SELECT
        customer.id
      FROM
        customer
      LIMIT 1
    `;

    console.log('📝 GAQL Query (simplified):', GAQL_QUERY.trim());

    const requestHeaders = {
      'Content-Type': 'application/json',
      'developer-token': DEVELOPER_TOKEN,
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'login-customer-id': MCC_LOGIN_CUSTOMER_ID,
    };

    console.log('📤 Request headers:');
    console.log('Content-Type: application/json');
    console.log('developer-token: [HIDDEN]');
    console.log('Authorization: Bearer [HIDDEN]');
    console.log('login-customer-id:', MCC_LOGIN_CUSTOMER_ID);

    const googleAdsResponse = await fetch(GOOGLE_ADS_ENDPOINT, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({
        query: GAQL_QUERY.trim(),
      }),
    });

    console.log('📥 Google Ads API response status:', googleAdsResponse.status);
    console.log('📥 Google Ads API response headers:', Object.fromEntries(googleAdsResponse.headers.entries()));

    if (!googleAdsResponse.ok) {
      const errorData = await googleAdsResponse.json();
      console.error('❌ Google Ads API error:', JSON.stringify(errorData, null, 2));
      
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch Google Ads data', 
        details: errorData,
        status: googleAdsResponse.status,
        endpoint: GOOGLE_ADS_ENDPOINT,
        loginCustomerId: loginCustomerId,
        mccLoginCustomerId: MCC_LOGIN_CUSTOMER_ID
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: googleAdsResponse.status,
      });
    }

    const googleAdsData = await googleAdsResponse.json();
    console.log('✅ Google Ads data retrieved successfully');
    console.log('📊 Data preview:', JSON.stringify(googleAdsData, null, 2));

    return new Response(JSON.stringify({
      success: true,
      data: googleAdsData,
      metadata: {
        targetCustomerId: loginCustomerId,
        mccLoginCustomerId: MCC_LOGIN_CUSTOMER_ID,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('💥 Unexpected error:', error);
    console.error('💥 Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message,
      stack: error.stack
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

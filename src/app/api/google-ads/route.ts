// src/app/api/google-ads/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// @ts-ignore - Google Ads API doesn't have official TypeScript types
const { GoogleAdsApi } = require('google-ads-api');

// إنشاء Supabase client للخادم
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Next.js API Route: استدعاء Google Ads data مع Client Library...');
    
    const body = await request.json();
    const { loginCustomerId, startDate, endDate, dataType } = body;
    
    console.log('📥 Request body:', { loginCustomerId, startDate, endDate, dataType });
    
    // Get environment variables
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const developerId = process.env.GOOGLE_DEVELOPER_TOKEN;
    const mccCustomerId = process.env.MCC_LOGIN_CUSTOMER_ID;

    console.log('🔑 Environment check:', {
      hasRefreshToken: !!refreshToken,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasDeveloperToken: !!developerId,
      hasMccCustomerId: !!mccCustomerId
    });

    if (!refreshToken || !clientId || !clientSecret || !developerId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required environment variables',
          details: {
            hasRefreshToken: !!refreshToken,
            hasClientId: !!clientId,
            hasClientSecret: !!clientSecret,
            hasDeveloperToken: !!developerId,
            hasMccCustomerId: !!mccCustomerId
          }
        },
        { status: 400 }
      );
    }

    // إنشاء Google Ads API client
    console.log('🔧 Creating Google Ads API client...');
    
    const client = new GoogleAdsApi({
      client_id: clientId,
      client_secret: clientSecret,
      developer_token: developerId,
    });

    // Format customer ID (remove dashes)
    const formattedCustomerId = loginCustomerId?.replace(/-/g, '') || '3271710441';
    console.log('🎯 Using customer ID:', formattedCustomerId);

    // إنشاء customer instance
    console.log('👤 Creating customer instance...');
    
    const customer = client.Customer({
      customer_id: formattedCustomerId,
      refresh_token: refreshToken,
      login_customer_id: mccCustomerId?.replace(/-/g, '') || undefined,
    });

    // تحديد التواريخ (آخر 7 أيام)
    const endDateFormatted = endDate || new Date().toISOString().split('T')[0];
    const startDateFormatted = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log('📅 Date range:', { startDateFormatted, endDateFormatted });

    // Google Ads API query المحدث
    const query = `
      SELECT 
        campaign.id,
        campaign.name,
        campaign.status,
        metrics.cost_micros,
        metrics.clicks,
        metrics.impressions,
        segments.date
      FROM campaign 
      WHERE campaign.status = 'ENABLED' 
        AND segments.date >= '${startDateFormatted}'
        AND segments.date <= '${endDateFormatted}'
    `;

    console.log('📡 Executing Google Ads query...');
    console.log('🔍 Query:', query.trim());

    // تنفيذ الاستعلام
    const results = await customer.query(query.trim());
    
    console.log('✅ Query executed successfully');
    console.log('📊 Results count:', results.length);

    // Transform data to match Frontend expectations
    const transformedData = results.map((row: any, index: number) => {
      const campaign = row.campaign || {};
      const metrics = row.metrics || {};
      const segments = row.segments || {};
      
      return {
        id: campaign.id?.toString() || `campaign_${index}`,
        name: campaign.name || 'Unknown Campaign',
        status: campaign.status || 'UNKNOWN',
        cost: metrics.cost_micros ? (parseInt(metrics.cost_micros) / 1000000).toFixed(2) : '0.00',
        clicks: parseInt(metrics.clicks) || 0,
        impressions: parseInt(metrics.impressions) || 0,
        date: segments.date || 'unknown',
        // إضافة خصائص إضافية للتوافق مع Frontend
        type: 'campaign',
        platform: 'google_ads',
        currency: 'USD'
      };
    });

    // تجميع البيانات حسب الحملة (إذا كان هناك عدة أيام)
    const campaignSummary = transformedData.reduce((acc: any, row: any) => {
      const campaignId = row.id;
      if (!acc[campaignId]) {
        acc[campaignId] = {
          id: row.id,
          name: row.name,
          status: row.status,
          cost: 0,
          clicks: 0,
          impressions: 0,
          dates: [],
          type: row.type,
          platform: row.platform,
          currency: row.currency
        };
      }
      
      acc[campaignId].cost += parseFloat(row.cost);
      acc[campaignId].clicks += parseInt(row.clicks);
      acc[campaignId].impressions += parseInt(row.impressions);
      acc[campaignId].dates.push(row.date);
      
      return acc;
    }, {});

    const finalData = Object.values(campaignSummary).map((campaign: any) => ({
      ...campaign,
      cost: campaign.cost.toFixed(2),
      // إضافة معلومات إضافية
      ctr: campaign.impressions > 0 ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : '0.00',
      cpc: campaign.clicks > 0 ? (campaign.cost / campaign.clicks).toFixed(2) : '0.00',
      dateRange: `${startDateFormatted} to ${endDateFormatted}`
    }));

    console.log('🔄 Data transformed and summarized:', finalData);

    // Save data to Supabase Database with proper structure
    try {
      console.log('💾 Saving data to Supabase...');
      
      // إنشاء record واحد للحفظ
      const supabaseRecord = {
        customer_id: formattedCustomerId,
        campaigns_data: finalData, // حفظ البيانات كـ JSON
        total_campaigns: finalData.length,
        total_cost: finalData.reduce((sum: number, campaign: any) => sum + parseFloat(campaign.cost), 0).toFixed(2),
        total_clicks: finalData.reduce((sum: number, campaign: any) => sum + campaign.clicks, 0),
        total_impressions: finalData.reduce((sum: number, campaign: any) => sum + campaign.impressions, 0),
        date_range_start: startDateFormatted,
        date_range_end: endDateFormatted,
        fetched_at: new Date().toISOString(),
        data_type: dataType || 'campaigns'
      };

      const { error: saveError } = await supabase
        .from('google_ads_campaigns')
        .upsert(supabaseRecord, {
          onConflict: 'customer_id,date_range_start,date_range_end'
        });

      if (saveError) {
        console.error('❌ Supabase save error:', saveError);
      } else {
        console.log('✅ Data saved to Supabase successfully');
      }
    } catch (saveError) {
      console.error('❌ Supabase save failed:', saveError);
      // Continue even if save fails
    }
    
    // إرجاع البيانات بالتنسيق المتوقع من Frontend
    const response = {
      success: true,
      data: finalData,
      summary: {
        totalCampaigns: finalData.length,
        totalCost: finalData.reduce((sum: number, campaign: any) => sum + parseFloat(campaign.cost), 0).toFixed(2),
        totalClicks: finalData.reduce((sum: number, campaign: any) => sum + campaign.clicks, 0),
        totalImpressions: finalData.reduce((sum: number, campaign: any) => sum + campaign.impressions, 0),
        dateRange: `${startDateFormatted} to ${endDateFormatted}`
      },
      metadata: {
        query: query.trim(),
        customerId: formattedCustomerId,
        fetchedAt: new Date().toISOString(),
        source: 'google_ads_api'
      }
    };

    console.log('📤 Sending response:', response);
    
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('💥 خطأ في Google Ads API:', error);
    
    // تفصيل أكثر للأخطاء
    let errorMessage = error.message || 'Unknown error';
    let errorDetails = {};
    
    if (error.details) {
      errorDetails = error.details;
    }
    
    if (error.failure) {
      errorDetails = { ...errorDetails, failure: error.failure };
    }
    
    if (error.errors) {
      errorDetails = { ...errorDetails, errors: error.errors };
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Google Ads API error',
        message: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Google Ads API Route is working with Client Library. Use POST method to fetch data.',
    timestamp: new Date().toISOString(),
    library: 'google-ads-api',
    status: 'ready',
    endpoints: {
      campaigns: 'POST /api/google-ads with dataType: campaigns',
      keywords: 'POST /api/google-ads with dataType: keywords',
      ads: 'POST /api/google-ads with dataType: ads'
    }
  });
}


// src/app/api/google-ads/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleAdsApi, enums } from 'google-ads-api';

// Enhanced interfaces for comprehensive campaign management
interface Campaign {
  id: string;
  name: string;
  status: 'ENABLED' | 'PAUSED' | 'REMOVED';
  type: string;
  subType: string;
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  avgCpc: number;
  conversionRate: number;
  costPerConversion: number;
  qualityScore: number;
  impressionShare: number;
  targetLocation: string;
  bidStrategy: string;
  startDate: string;
  endDate: string;
  devicePerformance: {
    desktop: { impressions: number; clicks: number; cost: number };
    mobile: { impressions: number; clicks: number; cost: number };
    tablet: { impressions: number; clicks: number; cost: number };
  };
  audienceData: {
    ageGroups: { [key: string]: number };
    genders: { male: number; female: number; unknown: number };
    interests: string[];
  };
  geoPerformance: {
    [country: string]: { impressions: number; clicks: number; cost: number };
  };
}

interface Summary {
  totalSpend: number;
  totalClicks: number;
  totalImpressions: number;
  totalConversions: number;
  avgCpc: number;
  avgCtr: number;
  conversionRate: number;
  impressionShare: number;
  qualityScore: number;
  campaignTypes: Record<string, number>;
  statusBreakdown: {
    enabled: number;
    paused: number;
    removed: number;
  };
  performanceTrends: {
    impressions: { current: number; previous: number; change: number };
    clicks: { current: number; previous: number; change: number };
    cost: { current: number; previous: number; change: number };
    conversions: { current: number; previous: number; change: number };
  };
  topPerformingCampaigns: Campaign[];
  recommendations: {
    type: 'budget' | 'keyword' | 'audience' | 'bidding';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    campaignId?: string;
  }[];
}

interface ApiResponse {
  success: boolean;
  data?: {
    campaigns: Campaign[];
    summary: Summary;
    totalCount?: number;
    filteredCount?: number;
  };
  error?: string;
  note?: string;
  isDemo?: boolean;
  customerId?: string;
}

// Initialize Google Ads API client
const initializeGoogleAdsClient = () => {
  try {
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_DEVELOPER_TOKEN!,
    });

    return client;
  } catch (error) {
    console.error('❌ Failed to initialize Google Ads client:', error);
    throw new Error('Google Ads API initialization failed');
  }
};

// Fetch data for specific customer ID
const fetchCustomerData = async (customerId: string): Promise<{ campaigns: Campaign[]; summary: Summary }> => {
  try {
    console.log(`🔄 Fetching data for customer: ${customerId}`);
    
    const client = initializeGoogleAdsClient();
    
    const customer = client.Customer({
      customer_id: customerId,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      login_customer_id: process.env.MCC_LOGIN_CUSTOMER_ID!,
    });

    // Simplified campaign query without problematic segments
    const campaignQuery = `
      SELECT 
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.advertising_channel_sub_type,
        campaign.start_date,
        campaign.end_date,
        campaign.bidding_strategy_type,
        campaign_budget.amount_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.ctr,
        metrics.average_cpc,
        metrics.conversions_from_interactions_rate,
        metrics.cost_per_conversion,
        metrics.search_impression_share
      FROM campaign
      WHERE 
        campaign.status IN ('ENABLED', 'PAUSED')
        AND segments.date DURING LAST_30_DAYS
    `;

    console.log('🔄 Executing basic campaign query...');
    const campaignResponse = await customer.query(campaignQuery);
    
    if (!campaignResponse || campaignResponse.length === 0) {
      console.log('⚠️ No campaigns found for customer:', customerId);
      throw new Error(`No campaigns found for customer ${customerId}`);
    }

    console.log(`✅ Found ${campaignResponse.length} campaign records`);

    // Process campaign data
    const campaignMap = new Map<string, any>();
    
    campaignResponse.forEach((row: any) => {
      const campaignId = row.campaign.id.toString();
      
      if (!campaignMap.has(campaignId)) {
        campaignMap.set(campaignId, {
          id: campaignId,
          name: row.campaign.name,
          status: row.campaign.status,
          type: getCampaignType(row.campaign.advertising_channel_type),
          subType: row.campaign.advertising_channel_sub_type || 'Standard',
          budget: row.campaign_budget?.amount_micros ? row.campaign_budget.amount_micros / 1000000 : 0,
          spend: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0,
          avgCpc: 0,
          conversionRate: 0,
          costPerConversion: 0,
          qualityScore: 8.0, // Default value
          impressionShare: 0,
          targetLocation: 'Multiple Locations',
          bidStrategy: getBiddingStrategy(row.campaign.bidding_strategy_type),
          startDate: row.campaign.start_date || '2024-01-01',
          endDate: row.campaign.end_date || '2024-12-31',
          devicePerformance: {
            desktop: { impressions: 0, clicks: 0, cost: 0 },
            mobile: { impressions: 0, clicks: 0, cost: 0 },
            tablet: { impressions: 0, clicks: 0, cost: 0 }
          },
          audienceData: {
            ageGroups: { '18-24': 20, '25-34': 35, '35-44': 25, '45-54': 15, '55+': 5 },
            genders: { male: 50, female: 48, unknown: 2 },
            interests: ['General']
          },
          geoPerformance: {
            'Egypt': { impressions: 0, clicks: 0, cost: 0 }
          }
        });
      }
      
      const campaign = campaignMap.get(campaignId);
      
      // Aggregate metrics
      campaign.spend += (row.metrics?.cost_micros || 0) / 1000000;
      campaign.impressions += row.metrics?.impressions || 0;
      campaign.clicks += row.metrics?.clicks || 0;
      campaign.conversions += row.metrics?.conversions || 0;
      campaign.ctr = row.metrics?.ctr || 0;
      campaign.avgCpc = (row.metrics?.average_cpc || 0) / 1000000;
      campaign.conversionRate = (row.metrics?.conversions_from_interactions_rate || 0) * 100;
      campaign.costPerConversion = (row.metrics?.cost_per_conversion || 0) / 1000000;
      campaign.impressionShare = (row.metrics?.search_impression_share || 0) * 100;
    });

    // Try to fetch device performance data separately
    try {
      console.log('🔄 Fetching device performance data...');
      const deviceQuery = `
        SELECT 
          campaign.id,
          segments.device,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros
        FROM campaign
        WHERE 
          campaign.status IN ('ENABLED', 'PAUSED')
          AND segments.date DURING LAST_30_DAYS
      `;

      const deviceResponse = await customer.query(deviceQuery);
      
      deviceResponse.forEach((row: any) => {
        const campaignId = row.campaign.id.toString();
        const campaign = campaignMap.get(campaignId);
        
        if (campaign) {
          const device = row.segments?.device?.toLowerCase() || 'unknown';
          if (device === 'desktop' || device === 'mobile' || device === 'tablet') {
            campaign.devicePerformance[device].impressions += row.metrics?.impressions || 0;
            campaign.devicePerformance[device].clicks += row.metrics?.clicks || 0;
            campaign.devicePerformance[device].cost += (row.metrics?.cost_micros || 0) / 1000000;
          }
        }
      });
      
      console.log('✅ Device performance data fetched successfully');
    } catch (deviceError) {
      console.log('⚠️ Could not fetch device performance data:', deviceError);
    }

    // Try to fetch geographic data separately (simplified)
    try {
      console.log('🔄 Fetching geographic data...');
      const geoQuery = `
        SELECT 
          campaign.id,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros
        FROM campaign
        WHERE 
          campaign.status IN ('ENABLED', 'PAUSED')
          AND segments.date DURING LAST_30_DAYS
      `;

      const geoResponse = await customer.query(geoQuery);
      
      // Aggregate geo data (simplified - assign all to Egypt for now)
      geoResponse.forEach((row: any) => {
        const campaignId = row.campaign.id.toString();
        const campaign = campaignMap.get(campaignId);
        
        if (campaign) {
          campaign.geoPerformance['Egypt'].impressions += row.metrics?.impressions || 0;
          campaign.geoPerformance['Egypt'].clicks += row.metrics?.clicks || 0;
          campaign.geoPerformance['Egypt'].cost += (row.metrics?.cost_micros || 0) / 1000000;
        }
      });
      
      console.log('✅ Geographic data fetched successfully');
    } catch (geoError) {
      console.log('⚠️ Could not fetch geographic data:', geoError);
    }
    
    // Convert map to array
    const campaigns = Array.from(campaignMap.values());
    
    if (campaigns.length === 0) {
      throw new Error(`No campaigns found for customer ${customerId}`);
    }
    
    // Calculate summary
    const summary = calculateSummary(campaigns);
    
    console.log(`✅ Successfully fetched ${campaigns.length} campaigns for customer ${customerId}`);
    
    return { campaigns, summary };
    
  } catch (error) {
    console.error(`❌ Error fetching data for customer ${customerId}:`, error);
    throw error;
  }
};

// Helper function to map campaign types
const getCampaignType = (channelType: string): string => {
  const typeMap: Record<string, string> = {
    'SEARCH': 'Search',
    'DISPLAY': 'Display',
    'SHOPPING': 'Shopping',
    'VIDEO': 'Video',
    'PERFORMANCE_MAX': 'Performance Max',
    'LOCAL': 'Local',
    'SMART': 'Smart',
    'DISCOVERY': 'Discovery',
    'LOCAL_SERVICES': 'Local Services'
  };
  
  return typeMap[channelType] || 'Other';
};

// Helper function to map bidding strategies
const getBiddingStrategy = (strategyType: string): string => {
  const strategyMap: Record<string, string> = {
    'MAXIMIZE_CONVERSIONS': 'Maximize Conversions',
    'MAXIMIZE_CONVERSION_VALUE': 'Maximize Conversion Value',
    'TARGET_CPA': 'Target CPA',
    'TARGET_ROAS': 'Target ROAS',
    'MAXIMIZE_CLICKS': 'Maximize Clicks',
    'TARGET_SPEND': 'Target Spend',
    'TARGET_IMPRESSION_SHARE': 'Target Impression Share',
    'ENHANCED_CPC': 'Enhanced CPC',
    'MANUAL_CPC': 'Manual CPC',
    'MANUAL_CPM': 'Manual CPM',
    'MANUAL_CPV': 'Manual CPV'
  };
  
  return strategyMap[strategyType] || 'Unknown';
};

// Calculate comprehensive summary
const calculateSummary = (campaigns: Campaign[]): Summary => {
  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);

  // Calculate campaign types
  const campaignTypes: Record<string, number> = {};
  campaigns.forEach(campaign => {
    campaignTypes[campaign.type] = (campaignTypes[campaign.type] || 0) + 1;
  });

  // Calculate status breakdown
  const statusBreakdown = {
    enabled: campaigns.filter(c => c.status === 'ENABLED').length,
    paused: campaigns.filter(c => c.status === 'PAUSED').length,
    removed: campaigns.filter(c => c.status === 'REMOVED').length
  };

  // Generate performance trends (mock data for now)
  const performanceTrends = {
    impressions: { 
      current: totalImpressions, 
      previous: Math.round(totalImpressions * 0.9), 
      change: 10 
    },
    clicks: { 
      current: totalClicks, 
      previous: Math.round(totalClicks * 0.95), 
      change: 5 
    },
    cost: { 
      current: totalSpend, 
      previous: Math.round(totalSpend * 1.05), 
      change: -5 
    },
    conversions: { 
      current: totalConversions, 
      previous: Math.round(totalConversions * 0.85), 
      change: 15 
    }
  };

  // Get top performing campaigns
  const topPerformingCampaigns = campaigns
    .filter(c => c.status === 'ENABLED' && c.conversions > 0)
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 3);

  // Generate AI recommendations
  const recommendations = generateRecommendations(campaigns);

  return {
    totalSpend,
    totalClicks,
    totalImpressions,
    totalConversions,
    avgCpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
    avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
    conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
    impressionShare: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.impressionShare, 0) / campaigns.length : 0,
    qualityScore: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.qualityScore, 0) / campaigns.length : 0,
    campaignTypes,
    statusBreakdown,
    performanceTrends,
    topPerformingCampaigns,
    recommendations
  };
};

// Generate AI recommendations based on real data
const generateRecommendations = (campaigns: Campaign[]) => {
  const recommendations: any[] = [];
  
  // Find high-performing campaigns for budget increase
  const highPerformers = campaigns
    .filter(c => c.status === 'ENABLED' && c.conversionRate > 5)
    .sort((a, b) => b.conversionRate - a.conversionRate);
    
  if (highPerformers.length > 0) {
    recommendations.push({
      type: 'budget',
      title: 'Increase Budget for Top Performers',
      description: `${highPerformers[0].name} has a ${highPerformers[0].conversionRate.toFixed(2)}% conversion rate. Consider increasing budget by 20%.`,
      impact: 'high',
      campaignId: highPerformers[0].id
    });
  }
  
  // Find paused campaigns with good historical performance
  const pausedCampaigns = campaigns.filter(c => c.status === 'PAUSED' && c.conversions > 0);
  if (pausedCampaigns.length > 0) {
    recommendations.push({
      type: 'bidding',
      title: 'Resume High-Performing Paused Campaigns',
      description: `${pausedCampaigns[0].name} is paused but had ${pausedCampaigns[0].conversions} conversions. Consider resuming with optimized targeting.`,
      impact: 'high',
      campaignId: pausedCampaigns[0].id
    });
  }
  
  // Find campaigns with low impression share
  const lowImpressionShare = campaigns
    .filter(c => c.status === 'ENABLED' && c.impressionShare < 50 && c.impressionShare > 0);
    
  if (lowImpressionShare.length > 0) {
    recommendations.push({
      type: 'keyword',
      title: 'Improve Impression Share',
      description: `${lowImpressionShare[0].name} has only ${lowImpressionShare[0].impressionShare.toFixed(1)}% impression share. Consider increasing bids or budget.`,
      impact: 'medium',
      campaignId: lowImpressionShare[0].id
    });
  }
  
  return recommendations;
};

// Fallback demo data for specific customer
const generateCustomerDemoData = (customerId: string): { campaigns: Campaign[]; summary: Summary } => {
  const campaigns: Campaign[] = [
    {
      id: `demo_${customerId}_001`,
      name: `Demo Campaign for Customer ${customerId}`,
      status: 'ENABLED',
      type: 'Performance Max',
      subType: 'All Products',
      budget: 5000,
      spend: 3456.78,
      impressions: 125000,
      clicks: 2500,
      conversions: 125,
      ctr: 2.0,
      avgCpc: 1.38,
      conversionRate: 5.0,
      costPerConversion: 27.65,
      qualityScore: 8.5,
      impressionShare: 75.0,
      targetLocation: 'Egypt',
      bidStrategy: 'Maximize Conversions',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      devicePerformance: {
        desktop: { impressions: 50000, clicks: 1000, cost: 1382.71 },
        mobile: { impressions: 62500, clicks: 1250, cost: 1728.39 },
        tablet: { impressions: 12500, clicks: 250, cost: 345.68 }
      },
      audienceData: {
        ageGroups: { '18-24': 20, '25-34': 35, '35-44': 25, '45-54': 15, '55+': 5 },
        genders: { male: 55, female: 43, unknown: 2 },
        interests: ['Technology', 'Shopping']
      },
      geoPerformance: {
        'Egypt': { impressions: 125000, clicks: 2500, cost: 3456.78 }
      }
    }
  ];
  
  const summary = calculateSummary(campaigns);
  return { campaigns, summary };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get('dataType') || 'campaigns';
    const campaignType = searchParams.get('campaignType');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // Get customer ID from query params or use default
    const customerId = searchParams.get('customerId') || '3271710441';
    
    console.log('🔍 GET Request params:', { dataType, campaignType, status, search, customerId });

    let campaignsData: { campaigns: Campaign[]; summary: Summary };
    let isDemo = false;

    try {
      // Try to fetch real Google Ads data for specific customer
      console.log(`🔄 Attempting to fetch real Google Ads data for customer: ${customerId}`);
      campaignsData = await fetchCustomerData(customerId);
      console.log('✅ Successfully fetched real Google Ads data');
    } catch (error) {
      console.error(`❌ Failed to fetch real data for customer ${customerId}, falling back to demo:`, error);
      campaignsData = generateCustomerDemoData(customerId);
      isDemo = true;
    }
    
    // Apply filters if provided
    let filteredCampaigns = campaignsData.campaigns;
    
    if (campaignType && campaignType !== 'all') {
      filteredCampaigns = filteredCampaigns.filter(c => 
        c.type.toLowerCase().includes(campaignType.toLowerCase())
      );
    }
    
    if (status && status !== 'all') {
      filteredCampaigns = filteredCampaigns.filter(c => 
        c.status.toLowerCase() === status.toLowerCase()
      );
    }
    
    if (search) {
      filteredCampaigns = filteredCampaigns.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    const response: ApiResponse = {
      success: true,
      data: {
        campaigns: filteredCampaigns,
        summary: campaignsData.summary,
        totalCount: campaignsData.campaigns.length,
        filteredCount: filteredCampaigns.length
      },
      note: isDemo ? `Using demo data for customer ${customerId} - Google Ads API connection failed` : `Real Google Ads data for customer ${customerId}`,
      isDemo,
      customerId
    };

    console.log(`✅ Returning ${isDemo ? 'demo' : 'real'} data with ${filteredCampaigns.length} campaigns for customer ${customerId}`);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ API Error:', error);
    
    const customerId = '3271710441'; // Default customer ID
    const fallbackData = generateCustomerDemoData(customerId);
    
    return NextResponse.json({
      success: true,
      data: {
        campaigns: fallbackData.campaigns,
        summary: fallbackData.summary,
        totalCount: fallbackData.campaigns.length,
        filteredCount: fallbackData.campaigns.length
      },
      note: `Using fallback demo data for customer ${customerId} due to API error`,
      isDemo: true,
      customerId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST Request: Fetching Google Ads data...');
    
    const body = await request.json();
    const { customerId, startDate, endDate, dataType } = body;
    
    // Use provided customer ID or default
    const targetCustomerId = customerId || '3271710441';
    
    console.log('📥 Request body:', { customerId: targetCustomerId, startDate, endDate, dataType });
    
    let campaignsData: { campaigns: Campaign[]; summary: Summary };
    let isDemo = false;

    try {
      // Try to fetch real Google Ads data for specific customer
      campaignsData = await fetchCustomerData(targetCustomerId);
    } catch (error) {
      console.error(`❌ Failed to fetch real data for customer ${targetCustomerId}, using demo:`, error);
      campaignsData = generateCustomerDemoData(targetCustomerId);
      isDemo = true;
    }
    
    return NextResponse.json({
      success: true,
      data: campaignsData,
      message: isDemo ? `Demo data loaded for customer ${targetCustomerId} (API connection failed)` : `Real Google Ads data loaded successfully for customer ${targetCustomerId}`,
      isDemo,
      customerId: targetCustomerId
    });
    
  } catch (error: any) {
    console.error('❌ POST request error:', error);
    
    const customerId = '3271710441';
    const fallbackData = generateCustomerDemoData(customerId);
    
    return NextResponse.json({
      success: true,
      data: fallbackData,
      message: `Fallback demo data loaded for customer ${customerId} due to error`,
      isDemo: true,
      customerId,
      error: error.message
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔧 PUT Request: Campaign action...');
    
    const body = await request.json();
    const { campaignId, action, customerId } = body;
    
    console.log('📥 Campaign action:', { campaignId, action, customerId });
    
    // For now, return success (campaign actions would require additional Google Ads API calls)
    return NextResponse.json({
      success: true,
      message: `Campaign ${action} action completed for customer ${customerId}`,
      isDemo: true,
      note: 'Campaign actions are simulated - implement Google Ads API campaign management for real actions'
    });
    
  } catch (error: any) {
    console.error('❌ PUT request error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Campaign action failed'
    }, { status: 500 });
  }
}
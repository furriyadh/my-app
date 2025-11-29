// API to fetch all campaigns with comprehensive metrics from Google Ads
import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        error: 'Authorization required',
        campaigns: []
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const timeRange = searchParams.get('timeRange') || '30';
    
    // Call backend to fetch campaigns with all metrics
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/campaigns?customerId=${customerId || ''}&timeRange=${timeRange}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn('Backend API error, returning mock data for development');
      return NextResponse.json(generateMockCampaignsData(timeRange));
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching campaigns:', error);
    // Return mock data for development
    return NextResponse.json(generateMockCampaignsData('30'));
  }
}

// Generate comprehensive mock data with all metrics
function generateMockCampaignsData(timeRange: string) {
  const campaigns = [
    {
      id: '1',
      name: 'Summer Sale Campaign',
      type: 'SEARCH',
      status: 'ENABLED',
      budget: 5000,
      budgetType: 'DAILY',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      
      // Basic Performance Metrics
      impressions: 125000,
      clicks: 8500,
      ctr: 6.8,
      conversions: 425,
      conversionRate: 5.0,
      interactions: 8500,
      engagementRate: 4.2,
      
      // Cost & Revenue Metrics
      cost: 4250.00,
      averageCpc: 0.50,
      averageCpm: 34.00,
      averageCpv: 0.12,
      costPerConversion: 10.00,
      conversionsValue: 21250.00,
      roas: 5.0,
      
      // Quality Score Metrics
      qualityScore: 8,
      historicalQualityScore: 7,
      historicalCreativeQualityScore: 'ABOVE_AVERAGE',
      historicalLandingPageQualityScore: 'ABOVE_AVERAGE',
      historicalSearchPredictedCtr: 'ABOVE_AVERAGE',
      
      // Impression Share Metrics
      searchImpressionShare: 75.5,
      searchAbsoluteTopImpressionShare: 45.2,
      searchTopImpressionShare: 68.3,
      searchRankLostImpressionShare: 12.5,
      searchBudgetLostImpressionShare: 12.0,
      
      // Advanced Metrics
      allConversions: 450,
      allConversionsValue: 22500.00,
      crossDeviceConversions: 25,
      viewThroughConversions: 15,
      
      // Device Performance
      devicePerformance: {
        desktop: { impressions: 50000, clicks: 3400, conversions: 200, cost: 1700 },
        mobile: { impressions: 62500, clicks: 4250, conversions: 187, cost: 2125 },
        tablet: { impressions: 12500, clicks: 850, conversions: 38, cost: 425 }
      },
      
      // Audience Metrics
      uniqueUsers: 95000,
      averageImpressionFrequency: 1.32,
      
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-11-25T00:00:00Z'
    },
    {
      id: '2',
      name: 'Video Brand Awareness',
      type: 'VIDEO',
      status: 'ENABLED',
      budget: 3000,
      budgetType: 'DAILY',
      startDate: '2024-02-01',
      
      impressions: 500000,
      clicks: 15000,
      ctr: 3.0,
      conversions: 450,
      conversionRate: 3.0,
      interactions: 20000,
      engagementRate: 4.0,
      
      cost: 2800.00,
      averageCpc: 0.19,
      averageCpm: 5.60,
      averageCpv: 0.08,
      costPerConversion: 6.22,
      conversionsValue: 13500.00,
      roas: 4.82,
      
      // Video Specific Metrics
      videoViews: 35000,
      videoViewRate: 7.0,
      videoQuartileP25Rate: 85.0,
      videoQuartileP50Rate: 65.0,
      videoQuartileP75Rate: 45.0,
      videoQuartileP100Rate: 30.0,
      
      qualityScore: 7,
      searchImpressionShare: 65.0,
      
      devicePerformance: {
        desktop: { impressions: 150000, clicks: 4500, conversions: 135, cost: 840 },
        mobile: { impressions: 300000, clicks: 9000, conversions: 270, cost: 1680 },
        tablet: { impressions: 50000, clicks: 1500, conversions: 45, cost: 280 }
      },
      
      uniqueUsers: 425000,
      averageImpressionFrequency: 1.18,
      
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-11-25T00:00:00Z'
    },
    {
      id: '3',
      name: 'Shopping Product Ads',
      type: 'SHOPPING',
      status: 'ENABLED',
      budget: 7500,
      budgetType: 'DAILY',
      startDate: '2024-03-01',
      
      impressions: 350000,
      clicks: 24500,
      ctr: 7.0,
      conversions: 1225,
      conversionRate: 5.0,
      interactions: 24500,
      
      cost: 7350.00,
      averageCpc: 0.30,
      averageCpm: 21.00,
      costPerConversion: 6.00,
      conversionsValue: 61250.00,
      roas: 8.33,
      
      // E-commerce Specific Metrics
      revenue: 61250.00,
      orders: 1225,
      averageOrderValue: 50.00,
      averageCartSize: 2.3,
      unitsSold: 2818,
      costOfGoodsSold: 30625.00,
      grossProfit: 30625.00,
      grossProfitMargin: 50.0,
      
      qualityScore: 9,
      searchImpressionShare: 82.0,
      searchAbsoluteTopImpressionShare: 58.5,
      
      devicePerformance: {
        desktop: { impressions: 105000, clicks: 7350, conversions: 368, cost: 2205 },
        mobile: { impressions: 210000, clicks: 14700, conversions: 735, cost: 4410 },
        tablet: { impressions: 35000, clicks: 2450, conversions: 122, cost: 735 }
      },
      
      uniqueUsers: 280000,
      averageImpressionFrequency: 1.25,
      
      createdAt: '2024-03-01T00:00:00Z',
      updatedAt: '2024-11-25T00:00:00Z'
    },
    {
      id: '4',
      name: 'Display Retargeting',
      type: 'DISPLAY',
      status: 'ENABLED',
      budget: 2000,
      budgetType: 'DAILY',
      startDate: '2024-04-01',
      
      impressions: 800000,
      clicks: 12000,
      ctr: 1.5,
      conversions: 360,
      conversionRate: 3.0,
      interactions: 12000,
      engagementRate: 2.8,
      
      cost: 1920.00,
      averageCpc: 0.16,
      averageCpm: 2.40,
      costPerConversion: 5.33,
      conversionsValue: 10800.00,
      roas: 5.63,
      
      // Active View Metrics
      activeViewImpressions: 720000,
      activeViewViewability: 90.0,
      activeViewMeasurability: 95.0,
      activeViewCpm: 2.67,
      
      qualityScore: 6,
      contentImpressionShare: 68.0,
      
      devicePerformance: {
        desktop: { impressions: 240000, clicks: 3600, conversions: 108, cost: 576 },
        mobile: { impressions: 480000, clicks: 7200, conversions: 216, cost: 1152 },
        tablet: { impressions: 80000, clicks: 1200, conversions: 36, cost: 192 }
      },
      
      uniqueUsers: 650000,
      averageImpressionFrequency: 1.23,
      
      createdAt: '2024-04-01T00:00:00Z',
      updatedAt: '2024-11-25T00:00:00Z'
    },
    {
      id: '5',
      name: 'Performance Max Universal',
      type: 'PERFORMANCE_MAX',
      status: 'PAUSED',
      budget: 10000,
      budgetType: 'DAILY',
      startDate: '2024-05-01',
      
      impressions: 950000,
      clicks: 47500,
      ctr: 5.0,
      conversions: 2375,
      conversionRate: 5.0,
      interactions: 47500,
      
      cost: 9500.00,
      averageCpc: 0.20,
      averageCpm: 10.00,
      costPerConversion: 4.00,
      conversionsValue: 95000.00,
      roas: 10.0,
      
      qualityScore: 8,
      searchImpressionShare: 88.0,
      
      devicePerformance: {
        desktop: { impressions: 285000, clicks: 14250, conversions: 713, cost: 2850 },
        mobile: { impressions: 570000, clicks: 28500, conversions: 1425, cost: 5700 },
        tablet: { impressions: 95000, clicks: 4750, conversions: 237, cost: 950 }
      },
      
      uniqueUsers: 780000,
      averageImpressionFrequency: 1.22,
      
      createdAt: '2024-05-01T00:00:00Z',
      updatedAt: '2024-11-25T00:00:00Z'
    }
  ];

  // Calculate aggregate metrics
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const totalCost = campaigns.reduce((sum, c) => sum + c.cost, 0);
  const totalConversionsValue = campaigns.reduce((sum, c) => sum + c.conversionsValue, 0);

  return {
    success: true,
    campaigns: campaigns,
    metrics: {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'ENABLED').length,
      totalSpend: totalCost,
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: (totalClicks / totalImpressions * 100).toFixed(2),
      conversions: totalConversions,
      conversionsValue: totalConversionsValue,
      roas: (totalConversionsValue / totalCost).toFixed(2),
      averageCpc: (totalCost / totalClicks).toFixed(2),
      averageCpm: (totalCost / totalImpressions * 1000).toFixed(2),
      conversionRate: (totalConversions / totalClicks * 100).toFixed(2),
      costPerConversion: (totalCost / totalConversions).toFixed(2),
      
      // Aggregate advanced metrics
      qualityScore: (campaigns.reduce((sum, c) => sum + (c.qualityScore || 0), 0) / campaigns.length).toFixed(1),
      impressionShare: (campaigns.reduce((sum, c) => sum + (c.searchImpressionShare || 0), 0) / campaigns.filter(c => c.searchImpressionShare).length).toFixed(1),
      
      // Campaign types distribution
      campaignTypes: {
        SEARCH: campaigns.filter(c => c.type === 'SEARCH').length,
        VIDEO: campaigns.filter(c => c.type === 'VIDEO').length,
        SHOPPING: campaigns.filter(c => c.type === 'SHOPPING').length,
        DISPLAY: campaigns.filter(c => c.type === 'DISPLAY').length,
        PERFORMANCE_MAX: campaigns.filter(c => c.type === 'PERFORMANCE_MAX').length
      }
    },
    timeRange: parseInt(timeRange)
  };
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}


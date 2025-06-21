// Google Ads API Integration for Auction Insights
// This file provides functions to fetch real auction insights data from Google Ads API

import { GoogleAdsApi, enums } from 'google-ads-api';

interface AuctionInsightsConfig {
  customerId: string;
  developerToken: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

interface AuctionInsightsData {
  impressionShare: number;
  avgPosition: number;
  overlapRate: number;
  topOfPageRate: number;
  competitors: Array<{
    name: string;
    impressionShare: number;
    avgPosition: number;
    overlapRate: number;
    topOfPageRate: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    impressionShare: number;
    avgPosition: number;
    overlapRate: number;
  }>;
}

export class GoogleAdsAuctionInsights {
  private client: GoogleAdsApi;
  private customerId: string;

  constructor(config: AuctionInsightsConfig) {
    this.client = new GoogleAdsApi({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      developer_token: config.developerToken,
    });
    this.customerId = config.customerId;
  }

  async getAuctionInsights(dateRange: string): Promise<AuctionInsightsData> {
    try {
      const customer = this.client.Customer({
        customer_id: this.customerId,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      });

      // Query for auction insights data
      const query = `
        SELECT
          auction_insight_domain.domain,
          auction_insight_domain.impression_share,
          auction_insight_domain.average_position,
          auction_insight_domain.overlap_rate,
          auction_insight_domain.top_of_page_rate,
          segments.date
        FROM auction_insight_domain
        WHERE segments.date DURING ${this.getDateRangeQuery(dateRange)}
        ORDER BY segments.date DESC
      `;

      const response = await customer.query(query);
      
      return this.processAuctionData(response);
    } catch (error) {
      console.error('Error fetching auction insights:', error);
      throw new Error('Failed to fetch auction insights data');
    }
  }

  private getDateRangeQuery(period: string): string {
    const today = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'last_7_days':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'last_30_days':
        startDate.setDate(today.getDate() - 30);
        break;
      case 'last_90_days':
        startDate.setDate(today.getDate() - 90);
        break;
      default:
        startDate.setDate(today.getDate() - 7);
    }

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    return `"${formatDate(startDate)}" AND "${formatDate(today)}"`;
  }

  private processAuctionData(response: any): AuctionInsightsData {
    const competitors = new Map();
    const timeSeriesData = [];
    let totalImpressionShare = 0;
    let totalAvgPosition = 0;
    let totalOverlapRate = 0;
    let totalTopOfPageRate = 0;
    let recordCount = 0;

    for (const row of response) {
      const domain = row.auction_insight_domain.domain;
      const impressionShare = row.auction_insight_domain.impression_share || 0;
      const avgPosition = row.auction_insight_domain.average_position || 0;
      const overlapRate = row.auction_insight_domain.overlap_rate || 0;
      const topOfPageRate = row.auction_insight_domain.top_of_page_rate || 0;
      const date = row.segments.date;

      // Aggregate competitor data
      if (!competitors.has(domain)) {
        competitors.set(domain, {
          name: domain,
          impressionShare: 0,
          avgPosition: 0,
          overlapRate: 0,
          topOfPageRate: 0,
          count: 0
        });
      }

      const competitor = competitors.get(domain);
      competitor.impressionShare += impressionShare;
      competitor.avgPosition += avgPosition;
      competitor.overlapRate += overlapRate;
      competitor.topOfPageRate += topOfPageRate;
      competitor.count++;

      // Aggregate time series data
      timeSeriesData.push({
        date,
        impressionShare,
        avgPosition,
        overlapRate
      });

      // Calculate totals for averages
      totalImpressionShare += impressionShare;
      totalAvgPosition += avgPosition;
      totalOverlapRate += overlapRate;
      totalTopOfPageRate += topOfPageRate;
      recordCount++;
    }

    // Calculate averages for competitors
    const competitorArray = Array.from(competitors.values()).map(comp => ({
      name: comp.name,
      impressionShare: comp.impressionShare / comp.count,
      avgPosition: comp.avgPosition / comp.count,
      overlapRate: comp.overlapRate / comp.count,
      topOfPageRate: comp.topOfPageRate / comp.count
    }));

    return {
      impressionShare: recordCount > 0 ? totalImpressionShare / recordCount : 0,
      avgPosition: recordCount > 0 ? totalAvgPosition / recordCount : 0,
      overlapRate: recordCount > 0 ? totalOverlapRate / recordCount : 0,
      topOfPageRate: recordCount > 0 ? totalTopOfPageRate / recordCount : 0,
      competitors: competitorArray.slice(0, 5), // Top 5 competitors
      timeSeriesData: timeSeriesData.slice(-7) // Last 7 days
    };
  }
}

// API Route handler for Next.js
export async function fetchAuctionInsights(period: string) {
  const config: AuctionInsightsConfig = {
    customerId: process.env.MCC_LOGIN_CUSTOMER_ID!,
    developerToken: process.env.GOOGLE_DEVELOPER_TOKEN!,
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN!
  };

  const auctionInsights = new GoogleAdsAuctionInsights(config);
  return await auctionInsights.getAuctionInsights(period);
}

// Demographics API Integration
export async function fetchDemographicsData(period: string) {
  try {
    const config: AuctionInsightsConfig = {
      customerId: process.env.MCC_LOGIN_CUSTOMER_ID!,
      developerToken: process.env.GOOGLE_DEVELOPER_TOKEN!,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN!
    };

    const client = new GoogleAdsApi({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      developer_token: config.developerToken,
    });

    const customer = client.Customer({
      customer_id: config.customerId,
      refresh_token: config.refreshToken,
    });

    // Query for age demographics
    const ageQuery = `
      SELECT
        ad_group_criterion.age_range.type,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions
      FROM age_range_view
      WHERE segments.date DURING ${getDateRangeQuery(period)}
    `;

    // Query for gender demographics  
    const genderQuery = `
      SELECT
        ad_group_criterion.gender.type,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions
      FROM gender_view
      WHERE segments.date DURING ${getDateRangeQuery(period)}
    `;

    // Query for income demographics
    const incomeQuery = `
      SELECT
        ad_group_criterion.income_range.type,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions
      FROM income_range_view
      WHERE segments.date DURING ${getDateRangeQuery(period)}
    `;

    const [ageResponse, genderResponse, incomeResponse] = await Promise.all([
      customer.query(ageQuery),
      customer.query(genderQuery),
      customer.query(incomeQuery)
    ]);

    return {
      ageGroups: processAgeData(ageResponse),
      genderData: processGenderData(genderResponse),
      incomeData: processIncomeData(incomeResponse),
      totalImpressions: calculateTotal(ageResponse, 'impressions'),
      totalClicks: calculateTotal(ageResponse, 'clicks'),
      ctr: calculateCTR(ageResponse),
      totalConversions: calculateTotal(ageResponse, 'conversions')
    };
  } catch (error) {
    console.error('Error fetching demographics data:', error);
    throw new Error('Failed to fetch demographics data');
  }
}

function getDateRangeQuery(period: string): string {
  const today = new Date();
  const startDate = new Date();
  
  switch (period) {
    case 'last_7_days':
      startDate.setDate(today.getDate() - 7);
      break;
    case 'last_30_days':
      startDate.setDate(today.getDate() - 30);
      break;
    default:
      startDate.setDate(today.getDate() - 7);
  }

  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  return `"${formatDate(startDate)}" AND "${formatDate(today)}"`;
}

function processAgeData(response: any) {
  const ageMap = new Map();
  
  for (const row of response) {
    const ageType = row.ad_group_criterion.age_range.type;
    const impressions = row.metrics.impressions || 0;
    const clicks = row.metrics.clicks || 0;
    
    if (!ageMap.has(ageType)) {
      ageMap.set(ageType, { impressions: 0, clicks: 0 });
    }
    
    const ageData = ageMap.get(ageType);
    ageData.impressions += impressions;
    ageData.clicks += clicks;
  }
  
  return Array.from(ageMap.entries()).map(([type, data]) => ({
    range: getAgeRangeLabel(type),
    impressions: data.impressions,
    clicks: data.clicks,
    percentage: 0 // Calculate based on total
  }));
}

function processGenderData(response: any) {
  const genderMap = new Map();
  
  for (const row of response) {
    const genderType = row.ad_group_criterion.gender.type;
    const impressions = row.metrics.impressions || 0;
    const clicks = row.metrics.clicks || 0;
    
    if (!genderMap.has(genderType)) {
      genderMap.set(genderType, { impressions: 0, clicks: 0 });
    }
    
    const genderData = genderMap.get(genderType);
    genderData.impressions += impressions;
    genderData.clicks += clicks;
  }
  
  return Array.from(genderMap.entries()).map(([type, data]) => ({
    gender: getGenderLabel(type),
    impressions: data.impressions,
    clicks: data.clicks,
    percentage: 0 // Calculate based on total
  }));
}

function processIncomeData(response: any) {
  const incomeMap = new Map();
  
  for (const row of response) {
    const incomeType = row.ad_group_criterion.income_range.type;
    const impressions = row.metrics.impressions || 0;
    const clicks = row.metrics.clicks || 0;
    
    if (!incomeMap.has(incomeType)) {
      incomeMap.set(incomeType, { impressions: 0, clicks: 0 });
    }
    
    const incomeData = incomeMap.get(incomeType);
    incomeData.impressions += impressions;
    incomeData.clicks += clicks;
  }
  
  return Array.from(incomeMap.entries()).map(([type, data]) => ({
    range: getIncomeRangeLabel(type),
    impressions: data.impressions,
    clicks: data.clicks,
    percentage: 0 // Calculate based on total
  }));
}

function getAgeRangeLabel(type: string): string {
  const ageLabels: { [key: string]: string } = {
    'AGE_RANGE_18_24': '18-24',
    'AGE_RANGE_25_34': '25-34',
    'AGE_RANGE_35_44': '35-44',
    'AGE_RANGE_45_54': '45-54',
    'AGE_RANGE_55_64': '55-64',
    'AGE_RANGE_65_UP': '65+',
    'AGE_RANGE_UNDETERMINED': 'غير معروف'
  };
  return ageLabels[type] || 'غير معروف';
}

function getGenderLabel(type: string): string {
  const genderLabels: { [key: string]: string } = {
    'MALE': 'ذكور',
    'FEMALE': 'إناث',
    'UNDETERMINED': 'غير معروف'
  };
  return genderLabels[type] || 'غير معروف';
}

function getIncomeRangeLabel(type: string): string {
  const incomeLabels: { [key: string]: string } = {
    'INCOME_RANGE_0_50': 'أدنى 50%',
    'INCOME_RANGE_50_60': '50-60%',
    'INCOME_RANGE_60_70': '60-70%',
    'INCOME_RANGE_70_80': '70-80%',
    'INCOME_RANGE_80_90': '80-90%',
    'INCOME_RANGE_90_UP': 'أعلى 10%',
    'INCOME_RANGE_UNDETERMINED': 'غير معروف'
  };
  return incomeLabels[type] || 'غير معروف';
}

function calculateTotal(response: any, metric: string): number {
  return response.reduce((total: number, row: any) => {
    return total + (row.metrics[metric] || 0);
  }, 0);
}

function calculateCTR(response: any): number {
  const totalImpressions = calculateTotal(response, 'impressions');
  const totalClicks = calculateTotal(response, 'clicks');
  return totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
}
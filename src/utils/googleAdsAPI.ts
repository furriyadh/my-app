// Google Ads AI Platform - Google Ads API Client (Secure Version)
// ================================================
// TypeScript client للتعامل مع Google Ads API

import googleAuthService from "../services/googleAuth";

// تكوين Google Ads API
const GOOGLE_ADS_API_VERSION = "v16";
const GOOGLE_ADS_API_BASE_URL = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;

// التحقق من وجود المتغيرات المطلوبة
const validateConfig = () => {
  const requiredVars = ["GOOGLE_ADS_DEVELOPER_TOKEN", "MCC_LOGIN_CUSTOMER_ID"];
  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(", ")}`);
  }
};

// استدعاء التحقق عند تحميل الملف
validateConfig();

export class GoogleAdsAPIClient {
  private customerId: string;

  constructor(customerId: string) {
    this.customerId = customerId;
  }

  // إعداد headers للطلبات
  private async getHeaders(): Promise<Record<string, string>> {
    const accessToken = await googleAuthService.refreshAccessToken();
    if (!accessToken) {
      throw new Error("Failed to get access token for Google Ads API");
    }
    return {
      Authorization: `Bearer ${accessToken}`,
      "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      "login-customer-id": process.env.MCC_LOGIN_CUSTOMER_ID!,
      "Content-Type": "application/json",
    };
  }

  // الحصول على معلومات الحساب
  async getAccountInfo(): Promise<any> {
    try {
      const query = `
        SELECT 
          customer.id,
          customer.descriptive_name,
          customer.currency_code,
          customer.time_zone,
          customer.status
        FROM customer
        WHERE customer.id = '${this.customerId}'
      `;

      const response = await this.executeQuery(query);
      return response.results?.[0]?.customer || null;
    } catch (error) {
      console.error("Error getting account info:", error);
      throw new Error(
        `Failed to get account info: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // الحصول على الحملات
  async getCampaigns(): Promise<any[]> {
    try {
      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          campaign.start_date,
          campaign.end_date,
          campaign_budget.amount_micros
        FROM campaign
        WHERE campaign.status != 'REMOVED'
        ORDER BY campaign.name
      `;

      const response = await this.executeQuery(query);
      return (
        response.results?.map((row: any) => ({
          id: row.campaign.id.toString(),
          name: row.campaign.name,
          status: row.campaign.status,
          type: row.campaign.advertising_channel_type,
          startDate: row.campaign.start_date,
          endDate: row.campaign.end_date,
          budget: row.campaign_budget?.amount_micros
            ? parseInt(row.campaign_budget.amount_micros.toString()) / 1000000
            : 0,
        })) || []
      );
    } catch (error) {
      console.error("Error getting campaigns:", error);
      throw new Error(
        `Failed to get campaigns: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // إنشاء حملة جديدة
  async createCampaign(campaignData: CampaignData): Promise<any> {
    try {
      // إنشاء الميزانية أولاً
      const budgetOperation = {
        create: {
          name: `Budget for ${campaignData.name}`,
          amount_micros: (campaignData.budget * 1000000).toString(), // تحويل إلى string
          delivery_method: "STANDARD",
        },
      };

      const budgetResponse = await this.executeMutation(
        "campaignBudgets",
        [budgetOperation]
      );
      const budgetResourceName = budgetResponse.results?.[0]?.resource_name;

      if (!budgetResourceName) {
        throw new Error("Failed to create campaign budget");
      }

      // إنشاء الحملة
      const campaignOperation = {
        create: {
          name: campaignData.name,
          advertising_channel_type: campaignData.type || "SEARCH",
          status: "PAUSED", // تبدأ متوقفة
          campaign_budget: budgetResourceName,
          network_settings: {
            target_google_search: true,
            target_search_network: true,
            target_content_network: false,
            target_partner_search_network: false,
          },
          start_date: campaignData.startDate,
          end_date: campaignData.endDate,
        },
      };

      const campaignResponse = await this.executeMutation(
        "campaigns",
        [campaignOperation]
      );

      return {
        success: true,
        campaignId: campaignResponse.results?.[0]?.resource_name,
        budgetId: budgetResourceName,
      };
    } catch (error) {
      console.error("Error creating campaign:", error);
      throw new Error(
        `Failed to create campaign: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // الحصول على إحصائيات الحملة
  async getCampaignStats(campaignId: string, dateRange: string): Promise<StatsData> {
    try {
      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.ctr,
          metrics.average_cpc,
          segments.date
        FROM campaign
        WHERE campaign.id = '${campaignId}'
        AND segments.date DURING ${this.getDateRangeQuery(dateRange)}
        ORDER BY segments.date DESC
      `;

      const response = await this.executeQuery(query);
      return this.processStatsData(response.results || []);
    } catch (error) {
      console.error("Error getting campaign stats:", error);
      throw new Error(
        `Failed to get campaign stats: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // الحصول على رؤى المزاد
  async getAuctionInsights(dateRange: string): Promise<AuctionInsightsData[]> {
    try {
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

      const response = await this.executeQuery(query);
      return this.processAuctionData(response.results || []);
    } catch (error) {
      console.error("Error fetching auction insights:", error);
      throw new Error("Failed to fetch auction insights data");
    }
  }

  // تنفيذ استعلام
  private async executeQuery(query: string): Promise<any> {
    try {
      const url = `${GOOGLE_ADS_API_BASE_URL}/customers/${this.customerId}/googleAds:search`;

      const response = await fetch(url, {
        method: "POST",
        headers: await this.getHeaders(),
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  }

  // تنفيذ mutation
  private async executeMutation(resource: string, operations: any[]): Promise<any> {
    try {
      const url = `${GOOGLE_ADS_API_BASE_URL}/customers/${this.customerId}/${resource}:mutate`;

      const response = await fetch(url, {
        method: "POST",
        headers: await this.getHeaders(),
        body: JSON.stringify({ operations }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error executing mutation:", error);
      throw error;
    }
  }

  // معالجة بيانات الإحصائيات
  private processStatsData(results: any[]): StatsData {
    const processedData = results.map((row) => ({
      date: row.segments?.date || "",
      impressions: parseInt(row.metrics?.impressions?.toString() || "0"),
      clicks: parseInt(row.metrics?.clicks?.toString() || "0"),
      cost: parseInt(row.metrics?.cost_micros?.toString() || "0") / 1000000,
      conversions: parseFloat(row.metrics?.conversions?.toString() || "0"),
      ctr: parseFloat(row.metrics?.ctr?.toString() || "0"),
      averageCpc: parseInt(row.metrics?.average_cpc?.toString() || "0") / 1000000,
    }));

    // حساب الإجماليات
    const totals = processedData.reduce(
      (acc, day) => ({
        impressions: acc.impressions + day.impressions,
        clicks: acc.clicks + day.clicks,
        cost: acc.cost + day.cost,
        conversions: acc.conversions + day.conversions,
      }),
      { impressions: 0, clicks: 0, cost: 0, conversions: 0 }
    );

    return {
      dailyData: processedData,
      totals: {
        ...totals,
        ctr: (totals.clicks / totals.impressions) * 100 || 0,
        averageCpc: totals.cost / totals.clicks || 0,
        costPerConversion: totals.cost / totals.conversions || 0,
      },
    };
  }

  // معالجة بيانات المزاد
  private processAuctionData(results: any[]): AuctionInsightsData[] {
    return results.map((row) => ({
      domain: row.auction_insight_domain?.domain || "",
      impressionShare: parseFloat(
        row.auction_insight_domain?.impression_share?.toString() || "0"
      ),
      averagePosition: parseFloat(
        row.auction_insight_domain?.average_position?.toString() || "0"
      ),
      overlapRate: parseFloat(
        row.auction_insight_domain?.overlap_rate?.toString() || "0"
      ),
      topOfPageRate: parseFloat(
        row.auction_insight_domain?.top_of_page_rate?.toString() || "0"
      ),
      date: row.segments?.date || "",
    }));
  }

  // تحويل نطاق التاريخ إلى استعلام
  private getDateRangeQuery(period: string): string {
    const today = new Date();
    const startDate = new Date();

    switch (period) {
      case "last_7_days":
        startDate.setDate(today.getDate() - 7);
        break;
      case "last_30_days":
        startDate.setDate(today.getDate() - 30);
        break;
      case "last_90_days":
        startDate.setDate(today.getDate() - 90);
        break;
      default:
        startDate.setDate(today.getDate() - 30);
    }

    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    return `${formatDate(startDate)} AND ${formatDate(today)}`;
  }

  // التحقق من صحة الاتصال
  async validateConnection(): Promise<boolean> {
    try {
      const query = `
        SELECT customer.id
        FROM customer
        WHERE customer.id = '${this.customerId}'
        LIMIT 1
      `;

      await this.executeQuery(query);
      return true;
    } catch (error) {
      console.error("Connection validation failed:", error);
      return false;
    }
  }

  // الحصول على الكلمات المفتاحية المقترحة
  async getKeywordSuggestions(seedKeywords: string[]): Promise<KeywordSuggestion[]> {
    try {
      const url = `${GOOGLE_ADS_API_BASE_URL}/customers/${this.customerId}/keywordPlanIdeas:generateKeywordIdeas`;

      const requestBody = {
        customerId: this.customerId,
        language: { languageCode: "ar" }, // العربية
        geoTargetConstants: [{ geoTargetConstant: "geoTargetConstants/2818" }], // مصر
        keywordSeed: {
          keywords: seedKeywords,
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: await this.getHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return (
        data.results?.map((idea: any) => ({
          keyword: idea.text || "",
          avgMonthlySearches: parseInt(
            idea.keywordIdeaMetrics?.avgMonthlySearches?.toString() || "0"
          ),
          competition: idea.keywordIdeaMetrics?.competition || "UNKNOWN",
          lowTopOfPageBid: idea.keywordIdeaMetrics?.lowTopOfPageBidMicros
            ? parseInt(
                idea.keywordIdeaMetrics.lowTopOfPageBidMicros.toString()
              ) / 1000000
            : 0,
          highTopOfPageBid: idea.keywordIdeaMetrics?.highTopOfPageBidMicros
            ? parseInt(
                idea.keywordIdeaMetrics.highTopOfPageBidMicros.toString()
              ) / 1000000
            : 0,
        })) || []
      );
    } catch (error) {
      console.error("Error getting keyword suggestions:", error);
      throw new Error(
        `Failed to get keyword suggestions: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // الحصول على قائمة الحسابات المتاحة
  async getAccessibleAccounts(): Promise<AccountInfo[]> {
    try {
      const query = `
        SELECT 
          customer_client.id,
          customer_client.descriptive_name,
          customer_client.currency_code,
          customer_client.time_zone,
          customer_client.status
        FROM customer_client
        WHERE customer_client.status = 'ENABLED'
        ORDER BY customer_client.descriptive_name
      `;

      const response = await this.executeQuery(query);
      return (
        response.results?.map((row: any) => ({
          id: row.customer_client?.id?.toString() || "",
          name: row.customer_client?.descriptive_name || "",
          currencyCode: row.customer_client?.currency_code || "",
          timeZone: row.customer_client?.time_zone || "",
          status: row.customer_client?.status || "",
        })) || []
      );
    } catch (error) {
      console.error("Error getting accessible accounts:", error);
      throw new Error(
        `Failed to get accessible accounts: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

// أنواع البيانات
export interface AuctionInsightsData {
  domain: string;
  impressionShare: number;
  averagePosition: number;
  overlapRate: number;
  topOfPageRate: number;
  date: string;
}

export interface CampaignData {
  name: string;
  type?: string;
  budget: number;
  startDate?: string;
  endDate?: string;
}

export interface StatsData {
  dailyData: Array<{
    date: string;
    impressions: number;
    clicks: number;
    cost: number;
    conversions: number;
    ctr: number;
    averageCpc: number;
  }>;
  totals: {
    impressions: number;
    clicks: number;
    cost: number;
    conversions: number;
    ctr: number;
    averageCpc: number;
    costPerConversion: number;
  };
}

export interface KeywordSuggestion {
  keyword: string;
  avgMonthlySearches: number;
  competition: string;
  lowTopOfPageBid: number;
  highTopOfPageBid: number;
}

export interface AccountInfo {
  id: string;
  name: string;
  currencyCode: string;
  timeZone: string;
  status: string;
}

export default GoogleAdsAPIClient;



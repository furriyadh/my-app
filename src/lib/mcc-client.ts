// src/lib/mcc-client.ts
// عميل MCC مصحح مع Google Ads API methods الصحيحة

// تكوين عميل Google Ads (آمن من متغيرات البيئة)
interface GoogleAdsConfig {
  client_id: string;
  client_secret: string;
  refresh_token: string;
  developer_token: string;
  manager_account_id: string;
  login_customer_id?: string;
}

// واجهة بيانات العميل
interface CustomerData {
  name: string;
  currency: string;
  timezone: string;
  descriptiveName?: string;
  countryCode?: string;
}

// واجهة نتيجة إنشاء العميل
interface CreateCustomerResult {
  success: boolean;
  customerId?: string;
  customerName?: string;
  resourceName?: string;
  error?: string;
  details?: any;
}

// واجهة بيانات الحملة
interface CampaignData {
  customerId: string;
  name: string;
  objective: string;
  budgetType: 'daily' | 'total';
  budget: number;
  locations: string[];
  languages: string[];
  keywords: string[];
  headlines: string[];
  descriptions: string[];
  startDate: string;
  endDate?: string;
  deviceTargeting?: string[];
  networkSettings?: {
    search: boolean;
    display: boolean;
    youtube: boolean;
    partners: boolean;
  };
}

// واجهة نتيجة إنشاء الحملة
interface CreateCampaignResult {
  success: boolean;
  campaignId?: string;
  campaignName?: string;
  customerId?: string;
  budgetId?: string;
  adGroupId?: string;
  adIds?: string[];
  keywordIds?: string[];
  error?: string;
  details?: any;
}

// واجهة معلومات العميل
interface CustomerInfo {
  id: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
  status: string;
  testAccount: boolean;
  manager: boolean;
}

class MCCClient {
  private config: GoogleAdsConfig;

  constructor() {
    // تحميل التكوين بشكل آمن من متغيرات البيئة
    this.config = this.loadSecureConfig();
    
    // التحقق من وجود جميع المتغيرات المطلوبة
    this.validateConfig();
  }

  // تحميل التكوين بشكل آمن من متغيرات البيئة المحمية
  private loadSecureConfig(): GoogleAdsConfig {
    return {
      client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      manager_account_id: process.env.GOOGLE_ADS_MANAGER_ACCOUNT_ID!,
              login_customer_id: process.env.MCC_LOGIN_CUSTOMER_ID,
    };
  }

  // التحقق من صحة التكوين
  private validateConfig(): void {
    const requiredFields = ['client_id', 'client_secret', 'refresh_token', 'developer_token', 'manager_account_id'];
    
    for (const field of requiredFields) {
      if (!this.config[field as keyof GoogleAdsConfig]) {
        throw new Error(`Missing required Google Ads API configuration: ${field}. Please check your .env file.`);
      }
    }
  }

  // إنشاء عميل جديد تحت MCC
  async createSubAccount(customerData: CustomerData): Promise<CreateCustomerResult> {
    try {
      console.log('🚀 Creating new sub-account under MCC:', customerData.name);

      // استخدام fetch API للتعامل مع Google Ads API
      const response = await this.makeGoogleAdsRequest('POST', 'customers', {
        descriptive_name: customerData.descriptiveName || customerData.name,
        currency_code: customerData.currency.toUpperCase(),
        time_zone: customerData.timezone,
        ...(customerData.countryCode && { country_code: customerData.countryCode }),
      });

      if (response.success && response.data) {
        const newCustomerId = response.data.customer_id;
        
        console.log('✅ Sub-account created successfully:', newCustomerId);

        // إنشاء رابط الإدارة
        await this.createManagerLink(newCustomerId);
        
        return {
          success: true,
          customerId: newCustomerId,
          customerName: customerData.name,
          resourceName: `customers/${newCustomerId}`,
          details: response.data
        };
      } else {
        throw new Error(response.error || 'Failed to create customer');
      }

    } catch (error: any) {
      console.error('❌ Error creating sub-account:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to create sub-account',
        details: error
      };
    }
  }

  // إنشاء رابط الإدارة بين MCC والحساب الفرعي
  private async createManagerLink(customerId: string): Promise<void> {
    try {
      const response = await this.makeGoogleAdsRequest('POST', 'customer-manager-links', {
        client_customer: `customers/${customerId}`,
        manager_customer: `customers/${this.config.manager_account_id}`,
        status: 'ACTIVE',
      });

      if (response.success) {
        console.log('✅ Manager link created for customer:', customerId);
      }

    } catch (error) {
      console.warn('⚠️ Warning: Could not create manager link:', error);
    }
  }

  // إنشاء حملة كاملة مع استراتيجيات Google التلقائية
  async createCampaign(campaignData: CampaignData): Promise<CreateCampaignResult> {
    try {
      console.log('🚀 Creating campaign with Google\'s automatic bidding strategies:', campaignData.name);

      // 1. إنشاء الميزانية
      const budgetId = await this.createCampaignBudget(campaignData);
      
      // 2. إنشاء الحملة مع استراتيجية Google التلقائية
      const campaignId = await this.createCampaignEntity(campaignData, budgetId);
      
      // 3. إنشاء مجموعة الإعلانات
      const adGroupId = await this.createAdGroup(campaignId, campaignData);
      
      // 4. إضافة الكلمات المفتاحية
      const keywordIds = await this.addKeywords(adGroupId, campaignData.keywords, campaignData.customerId);
      
      // 5. إنشاء الإعلانات
      const adIds = await this.createAds(adGroupId, campaignData);
      
      // 6. إضافة استهداف المواقع
      await this.addLocationTargeting(campaignId, campaignData.locations, campaignData.customerId);
      
      // 7. إضافة استهداف اللغات
      await this.addLanguageTargeting(campaignId, campaignData.languages, campaignData.customerId);

      console.log('✅ Campaign created successfully with Google\'s automatic optimization:', {
        campaignId,
        budgetId,
        adGroupId,
        adIds,
        keywordIds
      });

      return {
        success: true,
        campaignId,
        campaignName: campaignData.name,
        customerId: campaignData.customerId,
        budgetId,
        adGroupId,
        adIds,
        keywordIds,
        details: {
          campaign: campaignId,
          budget: budgetId,
          adGroup: adGroupId,
          ads: adIds,
          keywords: keywordIds
        }
      };

    } catch (error: any) {
      console.error('❌ Error creating campaign:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to create campaign',
        details: error
      };
    }
  }

  // إنشاء ميزانية الحملة
  private async createCampaignBudget(campaignData: CampaignData): Promise<string> {
    const budgetData = {
      name: `Budget for ${campaignData.name}`,
      amount_micros: campaignData.budget * 1000000,
      delivery_method: 'STANDARD',
      period: campaignData.budgetType === 'daily' ? 'DAILY' : 'CUSTOM_PERIOD',
      explicitly_shared: false,
    };

    const response = await this.makeGoogleAdsRequest('POST', 'campaign-budgets', budgetData, campaignData.customerId);
    
    if (response.success && response.data) {
      const budgetId = response.data.resource_name.split('/')[3];
      console.log('✅ Budget created:', budgetId);
      return budgetId;
    } else {
      throw new Error('Failed to create campaign budget');
    }
  }

  // إنشاء كيان الحملة مع استراتيجية Google التلقائية
  private async createCampaignEntity(campaignData: CampaignData, budgetId: string): Promise<string> {
    const biddingStrategy = this.getAutomaticBiddingStrategy(campaignData.objective);
    
    const campaignDataPayload = {
      name: campaignData.name,
      status: 'PAUSED',
      campaign_budget: `customers/${campaignData.customerId}/campaignBudgets/${budgetId}`,
      advertising_channel_type: 'SEARCH',
      bidding_strategy_type: biddingStrategy,
      start_date: campaignData.startDate.replace(/-/g, ''),
      ...(campaignData.endDate && { end_date: campaignData.endDate.replace(/-/g, '') }),
      network_settings: {
        target_google_search: campaignData.networkSettings?.search ?? true,
        target_search_network: campaignData.networkSettings?.partners ?? false,
        target_content_network: campaignData.networkSettings?.display ?? false,
        target_partner_search_network: campaignData.networkSettings?.partners ?? false,
      },
      optimization_score_weight: 1.0,
      url_expansion_opt_out: false,
    };

    const response = await this.makeGoogleAdsRequest('POST', 'campaigns', campaignDataPayload, campaignData.customerId);
    
    if (response.success && response.data) {
      const campaignId = response.data.resource_name.split('/')[3];
      console.log('✅ Campaign entity created with automatic bidding:', campaignId);
      return campaignId;
    } else {
      throw new Error('Failed to create campaign');
    }
  }

  // تحديد استراتيجية المزايدة التلقائية حسب هدف الحملة
  private getAutomaticBiddingStrategy(objective: string): string {
    const strategyMap: { [key: string]: string } = {
      'sales': 'MAXIMIZE_CONVERSIONS',
      'leads': 'MAXIMIZE_CONVERSIONS',
      'traffic': 'MAXIMIZE_CLICKS',
      'awareness': 'MAXIMIZE_CLICKS',
      'consideration': 'MAXIMIZE_CLICKS',
      'app': 'MAXIMIZE_CONVERSIONS',
    };
    
    return strategyMap[objective] || 'MAXIMIZE_CLICKS';
  }

  // إنشاء مجموعة الإعلانات
  private async createAdGroup(campaignId: string, campaignData: CampaignData): Promise<string> {
    const adGroupData = {
      name: `${campaignData.name} - Ad Group`,
      campaign: `customers/${campaignData.customerId}/campaigns/${campaignId}`,
      status: 'ENABLED',
      type: 'SEARCH_STANDARD',
    };

    const response = await this.makeGoogleAdsRequest('POST', 'ad-groups', adGroupData, campaignData.customerId);
    
    if (response.success && response.data) {
      const adGroupId = response.data.resource_name.split('/')[3];
      console.log('✅ Ad Group created:', adGroupId);
      return adGroupId;
    } else {
      throw new Error('Failed to create ad group');
    }
  }

  // إضافة الكلمات المفتاحية
  private async addKeywords(adGroupId: string, keywords: string[], customerId: string): Promise<string[]> {
    if (!keywords || keywords.length === 0) {
      return [];
    }

    const keywordOperations = keywords.map(keyword => ({
      ad_group: `customers/${customerId}/adGroups/${adGroupId}`,
      status: 'ENABLED',
      keyword: {
        text: keyword,
        match_type: 'BROAD',
      },
    }));

    const response = await this.makeGoogleAdsRequest('POST', 'ad-group-criteria', { operations: keywordOperations }, customerId);
    
    if (response.success && response.data) {
      const keywordIds = response.data.results?.map((result: any) => result.resource_name.split('/')[3]) || [];
      console.log('✅ Keywords added with automatic bidding:', keywordIds.length);
      return keywordIds;
    } else {
      console.warn('⚠️ Failed to add keywords');
      return [];
    }
  }

  // إنشاء الإعلانات
  private async createAds(adGroupId: string, campaignData: CampaignData): Promise<string[]> {
    if (!campaignData.headlines || campaignData.headlines.length < 3 || 
        !campaignData.descriptions || campaignData.descriptions.length < 2) {
      throw new Error('At least 3 headlines and 2 descriptions are required');
    }

    const adData = {
      ad_group: `customers/${campaignData.customerId}/adGroups/${adGroupId}`,
      status: 'ENABLED',
      ad: {
        type: 'RESPONSIVE_SEARCH_AD',
        responsive_search_ad: {
          headlines: campaignData.headlines.slice(0, 15).map(headline => ({
            text: headline,
            pinned_field: undefined,
          })),
          descriptions: campaignData.descriptions.slice(0, 4).map(description => ({
            text: description,
            pinned_field: undefined,
          })),
          path1: '',
          path2: '',
        },
        final_urls: ['https://example.com'],
      }
    };

    const response = await this.makeGoogleAdsRequest('POST', 'ad-group-ads', adData, campaignData.customerId);
    
    if (response.success && response.data) {
      const adIds = response.data.results?.map((result: any) => result.resource_name.split('/')[3]) || [];
      console.log('✅ Responsive Search Ads created:', adIds.length);
      return adIds;
    } else {
      console.warn('⚠️ Failed to create ads');
      return [];
    }
  }

  // إضافة استهداف المواقع
  private async addLocationTargeting(campaignId: string, userSelectedLocations: string[], customerId: string): Promise<void> {
    if (!userSelectedLocations || userSelectedLocations.length === 0) {
      console.log('⚠️ No locations selected by user, skipping location targeting');
      return;
    }

    try {
      const locationIds = await this.resolveLocationIds(userSelectedLocations);
      
      if (locationIds.length === 0) {
        console.warn('⚠️ Could not resolve any location IDs from user selection');
        return;
      }

      const locationOperations = locationIds.map(locationId => ({
        campaign: `customers/${customerId}/campaigns/${campaignId}`,
        location: {
          geo_target_constant: `geoTargetConstants/${locationId}`,
        },
        bid_modifier: 1.0,
      }));

      const response = await this.makeGoogleAdsRequest('POST', 'campaign-criteria', { operations: locationOperations }, customerId);
      
      if (response.success) {
        console.log('✅ Location targeting added for user-selected locations:', locationIds.length);
      }

    } catch (error) {
      console.error('❌ Error adding location targeting:', error);
    }
  }

  // إضافة استهداف اللغات
  private async addLanguageTargeting(campaignId: string, userSelectedLanguages: string[], customerId: string): Promise<void> {
    if (!userSelectedLanguages || userSelectedLanguages.length === 0) {
      console.log('⚠️ No languages selected by user, skipping language targeting');
      return;
    }

    try {
      const languageIds = this.resolveLanguageIds(userSelectedLanguages);
      
      if (languageIds.length === 0) {
        console.warn('⚠️ Could not resolve any language IDs from user selection');
        return;
      }

      const languageOperations = languageIds.map(languageId => ({
        campaign: `customers/${customerId}/campaigns/${campaignId}`,
        language: {
          language_constant: `languageConstants/${languageId}`,
        },
      }));

      const response = await this.makeGoogleAdsRequest('POST', 'campaign-criteria', { operations: languageOperations }, customerId);
      
      if (response.success) {
        console.log('✅ Language targeting added for user-selected languages:', languageIds.length);
      }

    } catch (error) {
      console.error('❌ Error adding language targeting:', error);
    }
  }

  // طلب HTTP إلى Google Ads API
  private async makeGoogleAdsRequest(method: string, endpoint: string, data?: any, customerId?: string): Promise<any> {
    try {
      const targetCustomerId = customerId || this.config.manager_account_id;
             const url = `https://googleads.googleapis.com/v20/customers/${targetCustomerId}/${endpoint}`;
      
      const headers = {
        'Authorization': `Bearer ${await this.getAccessToken()}`,
        'developer-token': this.config.developer_token,
        'login-customer-id': this.config.login_customer_id || this.config.manager_account_id,
        'Content-Type': 'application/json',
      };

      const response = await fetch(url, {
        method,
        headers,
        ...(data && { body: JSON.stringify(data) }),
      });

      if (response.ok) {
        const responseData = await response.json();
        return { success: true, data: responseData };
      } else {
        const errorData = await response.text();
        return { success: false, error: errorData };
      }

    } catch (error) {
      console.error('❌ Google Ads API request failed:', error);
      return { success: false, error: error };
    }
  }

  // الحصول على access token
  private async getAccessToken(): Promise<string> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.client_id,
          client_secret: this.config.client_secret,
          refresh_token: this.config.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.access_token;
      } else {
        throw new Error('Failed to refresh access token');
      }

    } catch (error) {
      console.error('❌ Error getting access token:', error);
      throw error;
    }
  }

  // حل معرفات المواقع من اختيار المستخدم
  private async resolveLocationIds(userSelectedLocations: string[]): Promise<number[]> {
    const locationMap: { [key: string]: number } = {
      'United States': 2840,
      'Canada': 2124,
      'Mexico': 2484,
      'United Kingdom': 2826,
      'Germany': 2276,
      'France': 2250,
      'Spain': 2724,
      'Italy': 2380,
      'Netherlands': 2528,
      'Sweden': 2752,
      'Norway': 2578,
      'Denmark': 2208,
      'Finland': 2246,
      'Belgium': 2056,
      'Switzerland': 2756,
      'Austria': 2040,
      'Poland': 2616,
      'Australia': 2036,
      'Japan': 2392,
      'South Korea': 2410,
      'Singapore': 2702,
      'India': 2356,
      'China': 2156,
      'Thailand': 2764,
      'Malaysia': 2458,
      'Philippines': 2608,
      'Indonesia': 2360,
      'Vietnam': 2704,
      'Saudi Arabia': 2682,
      'UAE': 2784,
      'Egypt': 2818,
      'Jordan': 2400,
      'Lebanon': 2422,
      'Kuwait': 2414,
      'Qatar': 2634,
      'Bahrain': 2048,
      'Oman': 2512,
      'Morocco': 2504,
      'Tunisia': 2788,
      'South Africa': 2710,
      'Brazil': 2076,
      'Argentina': 2032,
      'Chile': 2152,
      'Colombia': 2170,
      'Peru': 2604,
    };

    return userSelectedLocations
      .map(location => locationMap[location])
      .filter(id => id !== undefined);
  }

  // حل معرفات اللغات من اختيار المستخدم
  private resolveLanguageIds(userSelectedLanguages: string[]): number[] {
    const languageMap: { [key: string]: number } = {
      'English': 1000,
      'Arabic': 1019,
      'Spanish': 1003,
      'French': 1002,
      'German': 1001,
      'Italian': 1004,
      'Portuguese': 1014,
      'Dutch': 1043,
      'Swedish': 1015,
      'Norwegian': 1013,
      'Danish': 1009,
      'Finnish': 1011,
      'Polish': 1016,
      'Russian': 1018,
      'Japanese': 1005,
      'Korean': 1012,
      'Chinese (Simplified)': 1017,
      'Chinese (Traditional)': 1018,
      'Thai': 1044,
      'Vietnamese': 1045,
      'Hindi': 1020,
      'Turkish': 1037,
      'Hebrew': 1027,
      'Greek': 1006,
    };

    return userSelectedLanguages
      .map(language => languageMap[language])
      .filter(id => id !== undefined);
  }

  // الحصول على معلومات العميل
  async getCustomerInfo(customerId: string): Promise<CustomerInfo | null> {
    try {
      const response = await this.makeGoogleAdsRequest('GET', `query?query=SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone, customer.status, customer.test_account, customer.manager FROM customer LIMIT 1`, undefined, customerId);

      if (response.success && response.data && response.data.results && response.data.results.length > 0) {
        const customerData = response.data.results[0].customer;
        return {
          id: customerData.id.toString(),
          descriptiveName: customerData.descriptive_name,
          currencyCode: customerData.currency_code,
          timeZone: customerData.time_zone,
          status: customerData.status,
          testAccount: customerData.test_account,
          manager: customerData.manager,
        };
      }

      return null;

    } catch (error) {
      console.error('❌ Error getting customer info:', error);
      return null;
    }
  }

  // التحقق من حالة الاتصال
  async checkConnection(): Promise<boolean> {
    try {
      const response = await this.makeGoogleAdsRequest('GET', 'query?query=SELECT customer.id FROM customer LIMIT 1');
      
      if (response.success) {
        console.log('✅ Google Ads API connection verified');
        return true;
      } else {
        console.error('❌ Google Ads API connection failed:', response.error);
        return false;
      }

    } catch (error) {
      console.error('❌ Google Ads API connection failed:', error);
      return false;
    }
  }
}

// إنشاء مثيل العميل الآمن
export const createMCCClient = (): MCCClient => {
  return new MCCClient();
};

// تصدير الأنواع
export type {
  CustomerData,
  CreateCustomerResult,
  CampaignData,
  CreateCampaignResult,
  CustomerInfo,
  GoogleAdsConfig
};

// تصدير العميل الافتراضي
export default MCCClient;


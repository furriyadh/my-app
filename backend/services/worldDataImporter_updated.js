import { createClient } from '@supabase/supabase-js';

// إعداد Supabase - يجب إضافة القيم في ملف .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// التحقق من وجود متغيرات البيئة المطلوبة
if (!supabaseUrl || !supabaseKey) {
  throw new Error('متغيرات البيئة Supabase مطلوبة: NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// إعداد Google Maps API - يجب إضافة القيمة في ملف .env
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// التحقق من وجود Google Maps API Key
if (!GOOGLE_MAPS_API_KEY) {
  throw new Error('متغير البيئة GOOGLE_MAPS_API_KEY مطلوب');
}

class WorldDataImporter {
  constructor() {
    this.importStats = {
      countries: 0,
      regions: 0,
      cities: 0,
      districts: 0,
      postalCodes: 0,
      airports: 0,
      universities: 0,
      landmarks: 0,
      errors: []
    };
    
    this.requestDelay = parseInt(process.env.GOOGLE_MAPS_REQUEST_DELAY_MS) || 100;
    this.maxRequestsPerMinute = parseInt(process.env.GOOGLE_MAPS_MAX_REQUESTS_PER_MINUTE) || 60;
    this.requestCount = 0;
    this.lastRequestTime = Date.now();
  }

  // تسجيل بداية عملية الاستيراد
  async logImportStart(importType, source = 'google_maps') {
    const { data, error } = await supabase
      .from('geo_data_import_logs')
      .insert({
        import_type: importType,
        source: source,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('خطأ في تسجيل بداية الاستيراد:', error);
      return null;
    }
    
    return data.id;
  }

  // تسجيل انتهاء عملية الاستيراد
  async logImportEnd(logId, recordsProcessed, recordsSuccess, recordsFailed, errorDetails = null) {
    if (!logId) return;

    const startTime = new Date();
    const { error } = await supabase
      .from('geo_data_import_logs')
      .update({
        records_processed: recordsProcessed,
        records_success: recordsSuccess,
        records_failed: recordsFailed,
        status: recordsFailed > 0 ? 'completed_with_errors' : 'completed',
        error_details: errorDetails,
        completed_at: new Date().toISOString(),
        duration_seconds: Math.floor((Date.now() - startTime.getTime()) / 1000)
      })
      .eq('id', logId);

    if (error) {
      console.error('خطأ في تسجيل انتهاء الاستيراد:', error);
    }
  }

  // إدارة معدل الطلبات
  async manageRequestRate() {
    this.requestCount++;
    const now = Date.now();
    
    // إعادة تعيين العداد كل دقيقة
    if (now - this.lastRequestTime > 60000) {
      this.requestCount = 1;
      this.lastRequestTime = now;
    }
    
    // تأخير إذا تجاوزنا الحد المسموح
    if (this.requestCount > this.maxRequestsPerMinute) {
      const waitTime = 60000 - (now - this.lastRequestTime);
      console.log(`⏳ انتظار ${Math.ceil(waitTime / 1000)} ثانية لتجنب تجاوز حدود API...`);
      await this.delay(waitTime);
      this.requestCount = 1;
      this.lastRequestTime = Date.now();
    }
    
    await this.delay(this.requestDelay);
  }

  // تأخير
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // حفظ نتائج API في التخزين المؤقت
  async cacheApiResponse(apiType, queryParams, responseData) {
    const queryHash = this.generateQueryHash(queryParams);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (parseInt(process.env.GOOGLE_MAPS_CACHE_DURATION_DAYS) || 30));

    const { error } = await supabase
      .from('google_maps_api_cache')
      .upsert({
        api_type: apiType,
        query_hash: queryHash,
        query_params: queryParams,
        response_data: responseData,
        expires_at: expiresAt.toISOString(),
        last_accessed: new Date().toISOString()
      }, { onConflict: 'api_type,query_hash' });

    if (error) {
      console.error('خطأ في حفظ التخزين المؤقت:', error);
    }
  }

  // البحث في التخزين المؤقت
  async getCachedResponse(apiType, queryParams) {
    const queryHash = this.generateQueryHash(queryParams);
    
    const { data, error } = await supabase
      .from('google_maps_api_cache')
      .select('response_data, hit_count')
      .eq('api_type', apiType)
      .eq('query_hash', queryHash)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return null;
    }

    // تحديث عدد الاستخدام
    await supabase
      .from('google_maps_api_cache')
      .update({ 
        hit_count: data.hit_count + 1,
        last_accessed: new Date().toISOString()
      })
      .eq('api_type', apiType)
      .eq('query_hash', queryHash);

    return data.response_data;
  }

  // توليد hash للاستعلام
  generateQueryHash(queryParams) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(JSON.stringify(queryParams)).digest('hex');
  }

  // تسجيل استخدام API
  async logApiUsage(apiType, endpoint, cacheHit = false) {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const hour = now.getHours();

    const { error } = await supabase
      .from('google_maps_api_usage')
      .upsert({
        api_type: apiType,
        endpoint: endpoint,
        date: date,
        hour: hour,
        requests_count: 1,
        cache_hits: cacheHit ? 1 : 0,
        cache_misses: cacheHit ? 0 : 1,
        cost_estimate: cacheHit ? 0 : this.getApiCost(apiType)
      }, { 
        onConflict: 'api_type,endpoint,date,hour',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('خطأ في تسجيل استخدام API:', error);
    }
  }

  // حساب تكلفة API
  getApiCost(apiType) {
    const costs = {
      'places_new': 0.017,
      'places_autocomplete': 0.00283,
      'geocoding': 0.005,
      'maps_javascript': 0.007
    };
    return costs[apiType] || 0.01;
  }

  // البحث في Google Places مع التخزين المؤقت
  async searchGooglePlaces(query, type = 'establishment', countryCode = null) {
    const queryParams = { query, type, countryCode };
    
    // البحث في التخزين المؤقت أولاً
    const cachedResult = await this.getCachedResponse('places_new', queryParams);
    if (cachedResult) {
      await this.logApiUsage('places_new', 'search', true);
      return cachedResult;
    }

    await this.manageRequestRate();

    try {
      let searchQuery = query;
      if (countryCode) {
        searchQuery += ` in ${countryCode}`;
      }

      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&type=${type}&key=${GOOGLE_MAPS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      await this.logApiUsage('places_new', 'search', false);

      if (data.status === 'OK' && data.results.length > 0) {
        const place = data.results[0];
        const result = {
          place_id: place.place_id,
          name: place.name,
          formatted_address: place.formatted_address,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          types: place.types,
          rating: place.rating || null,
          user_ratings_total: place.user_ratings_total || null
        };

        // حفظ في التخزين المؤقت
        await this.cacheApiResponse('places_new', queryParams, result);
        
        return result;
      }

      return null;
    } catch (error) {
      console.error('خطأ في البحث في Google Places:', error);
      return null;
    }
  }

  // ترجمة القارة للعربية
  translateContinent(continent) {
    const translations = {
      'Asia': 'آسيا',
      'Africa': 'أفريقيا',
      'Europe': 'أوروبا',
      'North America': 'أمريكا الشمالية',
      'South America': 'أمريكا الجنوبية',
      'Oceania': 'أوقيانوسيا',
      'Antarctica': 'القارة القطبية الجنوبية'
    };
    return translations[continent] || continent;
  }

  // استيراد جميع بلدان العالم
  async importAllCountries() {
    console.log('🌍 بدء استيراد بلدان العالم...');
    
    const logId = await this.logImportStart('world_countries', 'google_places');
    let processed = 0, success = 0, failed = 0;

    const countries = [
      // الشرق الأوسط
      { name: 'المملكة العربية السعودية', name_en: 'Saudi Arabia', iso2: 'SA', iso3: 'SAU', continent: 'Asia', capital: 'الرياض', capital_en: 'Riyadh', currency: 'SAR', phone: '+966' },
      { name: 'الإمارات العربية المتحدة', name_en: 'United Arab Emirates', iso2: 'AE', iso3: 'ARE', continent: 'Asia', capital: 'أبوظبي', capital_en: 'Abu Dhabi', currency: 'AED', phone: '+971' },
      { name: 'الكويت', name_en: 'Kuwait', iso2: 'KW', iso3: 'KWT', continent: 'Asia', capital: 'الكويت', capital_en: 'Kuwait City', currency: 'KWD', phone: '+965' },
      { name: 'قطر', name_en: 'Qatar', iso2: 'QA', iso3: 'QAT', continent: 'Asia', capital: 'الدوحة', capital_en: 'Doha', currency: 'QAR', phone: '+974' },
      { name: 'البحرين', name_en: 'Bahrain', iso2: 'BH', iso3: 'BHR', continent: 'Asia', capital: 'المنامة', capital_en: 'Manama', currency: 'BHD', phone: '+973' },
      { name: 'عُمان', name_en: 'Oman', iso2: 'OM', iso3: 'OMN', continent: 'Asia', capital: 'مسقط', capital_en: 'Muscat', currency: 'OMR', phone: '+968' },
      { name: 'الأردن', name_en: 'Jordan', iso2: 'JO', iso3: 'JOR', continent: 'Asia', capital: 'عمان', capital_en: 'Amman', currency: 'JOD', phone: '+962' },
      { name: 'لبنان', name_en: 'Lebanon', iso2: 'LB', iso3: 'LBN', continent: 'Asia', capital: 'بيروت', capital_en: 'Beirut', currency: 'LBP', phone: '+961' },
      { name: 'سوريا', name_en: 'Syria', iso2: 'SY', iso3: 'SYR', continent: 'Asia', capital: 'دمشق', capital_en: 'Damascus', currency: 'SYP', phone: '+963' },
      { name: 'العراق', name_en: 'Iraq', iso2: 'IQ', iso3: 'IRQ', continent: 'Asia', capital: 'بغداد', capital_en: 'Baghdad', currency: 'IQD', phone: '+964' },
      { name: 'إيران', name_en: 'Iran', iso2: 'IR', iso3: 'IRN', continent: 'Asia', capital: 'طهران', capital_en: 'Tehran', currency: 'IRR', phone: '+98' },
      { name: 'تركيا', name_en: 'Turkey', iso2: 'TR', iso3: 'TUR', continent: 'Asia', capital: 'أنقرة', capital_en: 'Ankara', currency: 'TRY', phone: '+90' },
      { name: 'إسرائيل', name_en: 'Israel', iso2: 'IL', iso3: 'ISR', continent: 'Asia', capital: 'القدس', capital_en: 'Jerusalem', currency: 'ILS', phone: '+972' },
      { name: 'فلسطين', name_en: 'Palestine', iso2: 'PS', iso3: 'PSE', continent: 'Asia', capital: 'القدس', capital_en: 'Jerusalem', currency: 'ILS', phone: '+970' },
      
      // أفريقيا
      { name: 'مصر', name_en: 'Egypt', iso2: 'EG', iso3: 'EGY', continent: 'Africa', capital: 'القاهرة', capital_en: 'Cairo', currency: 'EGP', phone: '+20' },
      { name: 'المغرب', name_en: 'Morocco', iso2: 'MA', iso3: 'MAR', continent: 'Africa', capital: 'الرباط', capital_en: 'Rabat', currency: 'MAD', phone: '+212' },
      { name: 'الجزائر', name_en: 'Algeria', iso2: 'DZ', iso3: 'DZA', continent: 'Africa', capital: 'الجزائر', capital_en: 'Algiers', currency: 'DZD', phone: '+213' },
      { name: 'تونس', name_en: 'Tunisia', iso2: 'TN', iso3: 'TUN', continent: 'Africa', capital: 'تونس', capital_en: 'Tunis', currency: 'TND', phone: '+216' },
      { name: 'ليبيا', name_en: 'Libya', iso2: 'LY', iso3: 'LBY', continent: 'Africa', capital: 'طرابلس', capital_en: 'Tripoli', currency: 'LYD', phone: '+218' },
      { name: 'السودان', name_en: 'Sudan', iso2: 'SD', iso3: 'SDN', continent: 'Africa', capital: 'الخرطوم', capital_en: 'Khartoum', currency: 'SDG', phone: '+249' },
      { name: 'جنوب أفريقيا', name_en: 'South Africa', iso2: 'ZA', iso3: 'ZAF', continent: 'Africa', capital: 'كيب تاون', capital_en: 'Cape Town', currency: 'ZAR', phone: '+27' },
      { name: 'نيجيريا', name_en: 'Nigeria', iso2: 'NG', iso3: 'NGA', continent: 'Africa', capital: 'أبوجا', capital_en: 'Abuja', currency: 'NGN', phone: '+234' },
      { name: 'كينيا', name_en: 'Kenya', iso2: 'KE', iso3: 'KEN', continent: 'Africa', capital: 'نيروبي', capital_en: 'Nairobi', currency: 'KES', phone: '+254' },
      { name: 'إثيوبيا', name_en: 'Ethiopia', iso2: 'ET', iso3: 'ETH', continent: 'Africa', capital: 'أديس أبابا', capital_en: 'Addis Ababa', currency: 'ETB', phone: '+251' },
      
      // أوروبا
      { name: 'المملكة المتحدة', name_en: 'United Kingdom', iso2: 'GB', iso3: 'GBR', continent: 'Europe', capital: 'لندن', capital_en: 'London', currency: 'GBP', phone: '+44' },
      { name: 'فرنسا', name_en: 'France', iso2: 'FR', iso3: 'FRA', continent: 'Europe', capital: 'باريس', capital_en: 'Paris', currency: 'EUR', phone: '+33' },
      { name: 'ألمانيا', name_en: 'Germany', iso2: 'DE', iso3: 'DEU', continent: 'Europe', capital: 'برلين', capital_en: 'Berlin', currency: 'EUR', phone: '+49' },
      { name: 'إيطاليا', name_en: 'Italy', iso2: 'IT', iso3: 'ITA', continent: 'Europe', capital: 'روما', capital_en: 'Rome', currency: 'EUR', phone: '+39' },
      { name: 'إسبانيا', name_en: 'Spain', iso2: 'ES', iso3: 'ESP', continent: 'Europe', capital: 'مدريد', capital_en: 'Madrid', currency: 'EUR', phone: '+34' },
      { name: 'هولندا', name_en: 'Netherlands', iso2: 'NL', iso3: 'NLD', continent: 'Europe', capital: 'أمستردام', capital_en: 'Amsterdam', currency: 'EUR', phone: '+31' },
      { name: 'بلجيكا', name_en: 'Belgium', iso2: 'BE', iso3: 'BEL', continent: 'Europe', capital: 'بروكسل', capital_en: 'Brussels', currency: 'EUR', phone: '+32' },
      { name: 'سويسرا', name_en: 'Switzerland', iso2: 'CH', iso3: 'CHE', continent: 'Europe', capital: 'برن', capital_en: 'Bern', currency: 'CHF', phone: '+41' },
      { name: 'النمسا', name_en: 'Austria', iso2: 'AT', iso3: 'AUT', continent: 'Europe', capital: 'فيينا', capital_en: 'Vienna', currency: 'EUR', phone: '+43' },
      { name: 'السويد', name_en: 'Sweden', iso2: 'SE', iso3: 'SWE', continent: 'Europe', capital: 'ستوكهولم', capital_en: 'Stockholm', currency: 'SEK', phone: '+46' },
      { name: 'النرويج', name_en: 'Norway', iso2: 'NO', iso3: 'NOR', continent: 'Europe', capital: 'أوسلو', capital_en: 'Oslo', currency: 'NOK', phone: '+47' },
      { name: 'الدنمارك', name_en: 'Denmark', iso2: 'DK', iso3: 'DNK', continent: 'Europe', capital: 'كوبنهاغن', capital_en: 'Copenhagen', currency: 'DKK', phone: '+45' },
      { name: 'فنلندا', name_en: 'Finland', iso2: 'FI', iso3: 'FIN', continent: 'Europe', capital: 'هلسنكي', capital_en: 'Helsinki', currency: 'EUR', phone: '+358' },
      { name: 'روسيا', name_en: 'Russia', iso2: 'RU', iso3: 'RUS', continent: 'Europe', capital: 'موسكو', capital_en: 'Moscow', currency: 'RUB', phone: '+7' },
      { name: 'بولندا', name_en: 'Poland', iso2: 'PL', iso3: 'POL', continent: 'Europe', capital: 'وارسو', capital_en: 'Warsaw', currency: 'PLN', phone: '+48' },
      
      // آسيا
      { name: 'الصين', name_en: 'China', iso2: 'CN', iso3: 'CHN', continent: 'Asia', capital: 'بكين', capital_en: 'Beijing', currency: 'CNY', phone: '+86' },
      { name: 'اليابان', name_en: 'Japan', iso2: 'JP', iso3: 'JPN', continent: 'Asia', capital: 'طوكيو', capital_en: 'Tokyo', currency: 'JPY', phone: '+81' },
      { name: 'كوريا الجنوبية', name_en: 'South Korea', iso2: 'KR', iso3: 'KOR', continent: 'Asia', capital: 'سيول', capital_en: 'Seoul', currency: 'KRW', phone: '+82' },
      { name: 'الهند', name_en: 'India', iso2: 'IN', iso3: 'IND', continent: 'Asia', capital: 'نيودلهي', capital_en: 'New Delhi', currency: 'INR', phone: '+91' },
      { name: 'باكستان', name_en: 'Pakistan', iso2: 'PK', iso3: 'PAK', continent: 'Asia', capital: 'إسلام آباد', capital_en: 'Islamabad', currency: 'PKR', phone: '+92' },
      { name: 'بنغلاديش', name_en: 'Bangladesh', iso2: 'BD', iso3: 'BGD', continent: 'Asia', capital: 'دكا', capital_en: 'Dhaka', currency: 'BDT', phone: '+880' },
      { name: 'إندونيسيا', name_en: 'Indonesia', iso2: 'ID', iso3: 'IDN', continent: 'Asia', capital: 'جاكرتا', capital_en: 'Jakarta', currency: 'IDR', phone: '+62' },
      { name: 'ماليزيا', name_en: 'Malaysia', iso2: 'MY', iso3: 'MYS', continent: 'Asia', capital: 'كوالالمبور', capital_en: 'Kuala Lumpur', currency: 'MYR', phone: '+60' },
      { name: 'سنغافورة', name_en: 'Singapore', iso2: 'SG', iso3: 'SGP', continent: 'Asia', capital: 'سنغافورة', capital_en: 'Singapore', currency: 'SGD', phone: '+65' },
      { name: 'تايلاند', name_en: 'Thailand', iso2: 'TH', iso3: 'THA', continent: 'Asia', capital: 'بانكوك', capital_en: 'Bangkok', currency: 'THB', phone: '+66' },
      { name: 'فيتنام', name_en: 'Vietnam', iso2: 'VN', iso3: 'VNM', continent: 'Asia', capital: 'هانوي', capital_en: 'Hanoi', currency: 'VND', phone: '+84' },
      { name: 'الفلبين', name_en: 'Philippines', iso2: 'PH', iso3: 'PHL', continent: 'Asia', capital: 'مانيلا', capital_en: 'Manila', currency: 'PHP', phone: '+63' },
      
      // أمريكا الشمالية
      { name: 'الولايات المتحدة', name_en: 'United States', iso2: 'US', iso3: 'USA', continent: 'North America', capital: 'واشنطن', capital_en: 'Washington D.C.', currency: 'USD', phone: '+1' },
      { name: 'كندا', name_en: 'Canada', iso2: 'CA', iso3: 'CAN', continent: 'North America', capital: 'أوتاوا', capital_en: 'Ottawa', currency: 'CAD', phone: '+1' },
      { name: 'المكسيك', name_en: 'Mexico', iso2: 'MX', iso3: 'MEX', continent: 'North America', capital: 'مكسيكو سيتي', capital_en: 'Mexico City', currency: 'MXN', phone: '+52' },
      
      // أمريكا الجنوبية
      { name: 'البرازيل', name_en: 'Brazil', iso2: 'BR', iso3: 'BRA', continent: 'South America', capital: 'برازيليا', capital_en: 'Brasilia', currency: 'BRL', phone: '+55' },
      { name: 'الأرجنتين', name_en: 'Argentina', iso2: 'AR', iso3: 'ARG', continent: 'South America', capital: 'بوينس آيرس', capital_en: 'Buenos Aires', currency: 'ARS', phone: '+54' },
      { name: 'تشيلي', name_en: 'Chile', iso2: 'CL', iso3: 'CHL', continent: 'South America', capital: 'سانتياغو', capital_en: 'Santiago', currency: 'CLP', phone: '+56' },
      { name: 'كولومبيا', name_en: 'Colombia', iso2: 'CO', iso3: 'COL', continent: 'South America', capital: 'بوغوتا', capital_en: 'Bogota', currency: 'COP', phone: '+57' },
      { name: 'بيرو', name_en: 'Peru', iso2: 'PE', iso3: 'PER', continent: 'South America', capital: 'ليما', capital_en: 'Lima', currency: 'PEN', phone: '+51' },
      { name: 'فنزويلا', name_en: 'Venezuela', iso2: 'VE', iso3: 'VEN', continent: 'South America', capital: 'كاراكاس', capital_en: 'Caracas', currency: 'VES', phone: '+58' },
      
      // أوقيانوسيا
      { name: 'أستراليا', name_en: 'Australia', iso2: 'AU', iso3: 'AUS', continent: 'Oceania', capital: 'كانبرا', capital_en: 'Canberra', currency: 'AUD', phone: '+61' },
      { name: 'نيوزيلندا', name_en: 'New Zealand', iso2: 'NZ', iso3: 'NZL', continent: 'Oceania', capital: 'ويلينغتون', capital_en: 'Wellington', currency: 'NZD', phone: '+64' }
    ];

    for (const country of countries) {
      processed++;
      try {
        // البحث عن البلد في Google Places
        const placeData = await this.searchGooglePlaces(country.name_en, 'country');
        
        const countryData = {
          name: country.name,
          name_ar: country.name,
          name_en: country.name_en,
          iso_code_2: country.iso2,
          iso_code_3: country.iso3,
          continent: country.continent,
          continent_ar: this.translateContinent(country.continent),
          capital: country.capital,
          capital_ar: country.capital,
          currency_code: country.currency,
          phone_code: country.phone,
          latitude: placeData?.latitude || null,
          longitude: placeData?.longitude || null,
          google_place_id: placeData?.place_id || null,
          flag_emoji: this.getCountryFlag(country.iso2)
        };

        const { error } = await supabase
          .from('world_countries')
          .upsert(countryData, { onConflict: 'iso_code_2' });

        if (error) {
          console.error(`خطأ في إدراج ${country.name}:`, error);
          this.importStats.errors.push(`Country ${country.name}: ${error.message}`);
          failed++;
        } else {
          this.importStats.countries++;
          success++;
          console.log(`✅ تم إدراج ${country.name}`);
        }

      } catch (error) {
        console.error(`خطأ في معالجة ${country.name}:`, error);
        this.importStats.errors.push(`Country ${country.name}: ${error.message}`);
        failed++;
      }
    }

    await this.logImportEnd(logId, processed, success, failed, this.importStats.errors);
    console.log(`✅ تم الانتهاء من استيراد البلدان: ${success}/${processed} بلد`);
  }

  // الحصول على علم البلد
  getCountryFlag(iso2) {
    const flags = {
      'SA': '🇸🇦', 'AE': '🇦🇪', 'KW': '🇰🇼', 'QA': '🇶🇦', 'BH': '🇧🇭', 'OM': '🇴🇲',
      'JO': '🇯🇴', 'LB': '🇱🇧', 'SY': '🇸🇾', 'IQ': '🇮🇶', 'IR': '🇮🇷', 'TR': '🇹🇷',
      'IL': '🇮🇱', 'PS': '🇵🇸', 'EG': '🇪🇬', 'MA': '🇲🇦', 'DZ': '🇩🇿', 'TN': '🇹🇳',
      'LY': '🇱🇾', 'SD': '🇸🇩', 'ZA': '🇿🇦', 'NG': '🇳🇬', 'KE': '🇰🇪', 'ET': '🇪🇹',
      'GB': '🇬🇧', 'FR': '🇫🇷', 'DE': '🇩🇪', 'IT': '🇮🇹', 'ES': '🇪🇸', 'NL': '🇳🇱',
      'BE': '🇧🇪', 'CH': '🇨🇭', 'AT': '🇦🇹', 'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰',
      'FI': '🇫🇮', 'RU': '🇷🇺', 'PL': '🇵🇱', 'CN': '🇨🇳', 'JP': '🇯🇵', 'KR': '🇰🇷',
      'IN': '🇮🇳', 'PK': '🇵🇰', 'BD': '🇧🇩', 'ID': '🇮🇩', 'MY': '🇲🇾', 'SG': '🇸🇬',
      'TH': '🇹🇭', 'VN': '🇻🇳', 'PH': '🇵🇭', 'US': '🇺🇸', 'CA': '🇨🇦', 'MX': '🇲🇽',
      'BR': '🇧🇷', 'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴', 'PE': '🇵🇪', 'VE': '🇻🇪',
      'AU': '🇦🇺', 'NZ': '🇳🇿'
    };
    return flags[iso2] || '🏳️';
  }

  // استيراد المدن الرئيسية لبلد معين
  async importMajorCitiesForCountry(countryCode, countryName) {
    console.log(`🏙️ بدء استيراد المدن الرئيسية لـ ${countryName}...`);

    const logId = await this.logImportStart('world_cities', 'google_places');
    let processed = 0, success = 0, failed = 0;

    try {
      // الحصول على معرف البلد
      const { data: countryData, error: countryError } = await supabase
        .from('world_countries')
        .select('id')
        .eq('iso_code_2', countryCode)
        .single();

      if (countryError || !countryData) {
        console.error(`لم يتم العثور على البلد ${countryCode}`);
        return;
      }

      const countryId = countryData.id;

      // البحث عن المدن الرئيسية
      const searchQuery = `major cities in ${countryName}`;
      const placesData = await this.searchGooglePlaces(searchQuery, 'locality');

      if (placesData) {
        processed++;
        
        const cityData = {
          country_id: countryId,
          name: placesData.name,
          name_en: placesData.name,
          type: 'city',
          type_ar: 'مدينة',
          latitude: placesData.latitude,
          longitude: placesData.longitude,
          is_major_city: true,
          google_place_id: placesData.place_id,
          importance: 0.8
        };

        const { error } = await supabase
          .from('world_cities')
          .upsert(cityData, { onConflict: 'google_place_id' });

        if (error) {
          console.error(`خطأ في إدراج مدينة ${placesData.name}:`, error);
          failed++;
        } else {
          this.importStats.cities++;
          success++;
          console.log(`✅ تم إدراج مدينة ${placesData.name}`);
        }
      }

    } catch (error) {
      console.error(`خطأ في استيراد مدن ${countryName}:`, error);
      failed++;
    }

    await this.logImportEnd(logId, processed, success, failed);
    console.log(`✅ تم الانتهاء من استيراد مدن ${countryName}: ${success}/${processed} مدينة`);
  }

  // استيراد جميع البيانات
  async importAllWorldData() {
    console.log('🚀 بدء استيراد بيانات العالم الشاملة...');
    
    const startTime = Date.now();
    
    try {
      // 1. استيراد البلدان
      await this.importAllCountries();
      
      // 2. استيراد المدن الرئيسية لبعض البلدان المهمة
      const majorCountries = [
        { code: 'SA', name: 'Saudi Arabia' },
        { code: 'AE', name: 'United Arab Emirates' },
        { code: 'EG', name: 'Egypt' },
        { code: 'US', name: 'United States' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'FR', name: 'France' },
        { code: 'DE', name: 'Germany' },
        { code: 'CN', name: 'China' },
        { code: 'JP', name: 'Japan' },
        { code: 'IN', name: 'India' }
      ];

      for (const country of majorCountries) {
        await this.importMajorCitiesForCountry(country.code, country.name);
      }

      // 3. تنظيف التخزين المؤقت المنتهي الصلاحية
      await this.cleanupExpiredCache();

      const duration = Math.floor((Date.now() - startTime) / 1000);
      
      console.log('🎉 تم الانتهاء من استيراد بيانات العالم!');
      console.log('📊 إحصائيات الاستيراد:');
      console.log(`   البلدان: ${this.importStats.countries}`);
      console.log(`   المدن: ${this.importStats.cities}`);
      console.log(`   الأخطاء: ${this.importStats.errors.length}`);
      console.log(`   المدة: ${duration} ثانية`);

      return {
        success: true,
        stats: this.importStats,
        duration: duration
      };

    } catch (error) {
      console.error('خطأ في استيراد بيانات العالم:', error);
      return {
        success: false,
        error: error.message,
        stats: this.importStats
      };
    }
  }

  // تنظيف التخزين المؤقت المنتهي الصلاحية
  async cleanupExpiredCache() {
    console.log('🧹 تنظيف التخزين المؤقت المنتهي الصلاحية...');
    
    const { data, error } = await supabase
      .rpc('cleanup_expired_maps_cache');

    if (error) {
      console.error('خطأ في تنظيف التخزين المؤقت:', error);
    } else {
      console.log(`✅ تم حذف ${data} سجل منتهي الصلاحية`);
    }
  }

  // الحصول على إحصائيات الاستخدام
  async getUsageStats() {
    const { data, error } = await supabase
      .from('google_maps_api_usage')
      .select('*')
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) {
      console.error('خطأ في جلب إحصائيات الاستخدام:', error);
      return null;
    }

    return data;
  }
}

export { WorldDataImporter };

// مثال على الاستخدام
/*
const importer = new WorldDataImporter();

// استيراد جميع البيانات
await importer.importAllWorldData();

// أو استيراد البلدان فقط
await importer.importAllCountries();

// أو استيراد مدن بلد معين
await importer.importMajorCitiesForCountry('SA', 'Saudi Arabia');

// الحصول على إحصائيات الاستخدام
const stats = await importer.getUsageStats();
console.log('إحصائيات الاستخدام:', stats);
*/


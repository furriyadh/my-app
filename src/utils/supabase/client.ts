// src/utils/supabase/client.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// الحصول على متغيرات البيئة مع قيم افتراضية آمنة
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// التحقق من وجود متغيرات البيئة مع رسائل خطأ واضحة
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing from environment variables');
  console.log('📝 Please add NEXT_PUBLIC_SUPABASE_URL to your .env.local file');
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing from environment variables');
  console.log('📝 Please add NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file');
}

// إنشاء دالة createClient مع معالجة أفضل للأخطاء
export const createClient = () => {
  // التحقق من وجود المتغيرات قبل إنشاء العميل
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase client created with missing environment variables');
    console.log('🔧 Using fallback configuration for development');
    
    // إرجاع عميل وهمي للتطوير إذا كانت المتغيرات مفقودة
    return createSupabaseClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-anon-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );
  }

  // إنشاء العميل الحقيقي مع الإعدادات الكاملة
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    global: {
      headers: {
        'X-Client-Info': 'furriyadh-ads-platform',
      },
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
};

// تصدير دالة createSupabaseClient للاستخدام في مكونات أخرى
export { createSupabaseClient };

// تصدير instance جاهز للاستخدام المباشر
export const supabase = createClient();

// تصدير معلومات الإعداد للتشخيص
export const supabaseConfig = {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  isConfigured: !!(supabaseUrl && supabaseAnonKey),
  environment: process.env.NODE_ENV || 'development',
};

// دالة مساعدة للتحقق من حالة الاتصال
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('_health_check').select('*').limit(1);
    if (error) {
      console.log('🔍 Supabase connection test failed:', error.message);
      return false;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.log('🔍 Supabase connection test error:', error);
    return false;
  }
};

// تسجيل معلومات الإعداد في وضع التطوير
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Supabase Configuration:', {
    url: supabaseUrl ? '✅ Configured' : '❌ Missing',
    anonKey: supabaseAnonKey ? '✅ Configured' : '❌ Missing',
    environment: process.env.NODE_ENV,
  });
}


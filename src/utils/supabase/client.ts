// src/utils/supabase/client.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// الحصول على متغيرات البيئة مع قيم افتراضية آمنة
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// إنشاء دالة createClient مع معالجة أفضل للأخطاء
export const createClient = () => {
  // التحقق من وجود المتغيرات قبل إنشاء العميل
  if (!supabaseUrl || !supabaseAnonKey) {
    // إرجاع عميل وهمي آمن للبناء
    return createSupabaseClient(
      'https://placeholder.supabase.co',
      'placeholder-anon-key',
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

// تصدير instance جاهز للاستخدام المباشر - آمن للبناء
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
    if (!supabaseConfig.isConfigured) {
      return false;
    }
    
    const { data, error } = await supabase.from('_health_check').select('*').limit(1);
    if (error) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};


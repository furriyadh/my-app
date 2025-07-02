// Supabase Client Configuration - Updated & Optimized
// ===================================================
// ملف إعداد عميل Supabase المحدث والمحسن للمشروع

import { createClient } from '@supabase/supabase-js';

// إعدادات Supabase من متغيرات البيئة
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// التحقق من وجود المتغيرات المطلوبة
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// إنشاء عميل Supabase مع إعدادات محسنة
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'furriyadh-app'
    }
  }
});

// تصدير createClient للاستخدام المباشر إذا لزم الأمر
export { createClient } from '@supabase/supabase-js';

// تصدير إعدادات Supabase
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey
};

// دوال مساعدة محسنة للمصادقة
export const authHelpers = {
  // تسجيل الدخول بالإيميل وكلمة المرور
  signInWithEmail: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  // تسجيل حساب جديد
  signUpWithEmail: async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  // تسجيل الدخول بـ Google OAuth
  signInWithGoogle: async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            scope: 'https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'
          }
        }
      });
      
      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  // تسجيل الخروج
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // الحصول على المستخدم الحالي
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { success: true, user, error: null };
    } catch (error: any) {
      return { success: false, user: null, error: error.message };
    }
  },

  // الحصول على الجلسة الحالية
  getCurrentSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { success: true, session, error: null };
    } catch (error: any) {
      return { success: false, session: null, error: error.message };
    }
  },

  // إعادة تعيين كلمة المرور
  resetPassword: async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  // تحديث كلمة المرور
  updatePassword: async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password
      });
      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  // تحديث بيانات المستخدم
  updateUserMetadata: async (metadata: any) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata
      });
      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  }
};

// دوال مساعدة محسنة لقاعدة البيانات
export const dbHelpers = {
  // الحصول على بيانات من جدول
  select: async (table: string, columns = '*', filters?: Record<string, any>) => {
    try {
      let query = supabase.from(table).select(columns);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  // إدراج بيانات جديدة
  insert: async (table: string, data: any) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select();
      
      if (error) throw error;
      return { success: true, data: result, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  // تحديث بيانات
  update: async (table: string, data: any, filters: Record<string, any>) => {
    try {
      let query = supabase.from(table).update(data);
      
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { data: result, error } = await query.select();
      if (error) throw error;
      return { success: true, data: result, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  // حذف بيانات
  delete: async (table: string, filters: Record<string, any>) => {
    try {
      let query = supabase.from(table).delete();
      
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  // البحث في البيانات
  search: async (table: string, column: string, query: string, columns = '*') => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select(columns)
        .textSearch(column, query);
      
      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  }
};

// دوال مساعدة للتخزين
export const storageHelpers = {
  // رفع ملف
  upload: async (bucket: string, path: string, file: File, options?: any) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, options);
      
      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  // تحميل ملف
  download: async (bucket: string, path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);
      
      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  // الحصول على رابط عام للملف
  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  },

  // حذف ملف
  remove: async (bucket: string, paths: string[]) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove(paths);
      
      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  // إنشاء رابط موقع للملف
  createSignedUrl: async (bucket: string, path: string, expiresIn: number = 3600) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);
      
      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  }
};

// دوال مساعدة للـ Real-time
export const realtimeHelpers = {
  // الاشتراك في تغييرات جدول
  subscribeToTable: (table: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`public:${table}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table }, 
        callback
      )
      .subscribe();
  },

  // إلغاء الاشتراك
  unsubscribe: (subscription: any) => {
    return supabase.removeChannel(subscription);
  }
};

// تصدير العميل كـ default
export default supabase;


// src/utils/supabase/client.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// تأكد من أن هذه الشروط موجودة لمعالجة الأخطاء إذا كانت المتغيرات مفقودة
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
  );
}

export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });
};

// تصدير دالة createClient للاستخدام في مكونات أخرى
// هذا هو التصدير الذي يحتاجه AccountSelectionModal.tsx
export { createSupabaseClient };

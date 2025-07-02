// src/utils/supabase/client.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// تم إزالة الأسطر 8-12 كما طلب المستخدم
// الأسطر المحذوفة كانت:
// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error(
//     'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables'
//   );
// }

export const createClient = () => {
  return createSupabaseClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });
};

// للاستخدام في مكونات أخرى createClient تصدير دالة
// AccountSelectionModal.tsx هذا هو التصدير الذي يحتاجه
export { createSupabaseClient };

// تصدير instance جاهز للاستخدام المباشر
export const supabase = createClient();


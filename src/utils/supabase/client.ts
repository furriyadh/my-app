import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// هذا الملف الأساسي لإنشاء Supabase client
// لا يحتاج Dynamic Import لأنه مجرد تصدير للـ client
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)
export const createClient = () => createSupabaseClient(supabaseUrl, supabaseAnonKey)
export default supabase


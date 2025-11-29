import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Service role client for admin operations (bypasses RLS)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

// Function to save or update user profile
export async function saveUserProfile(userInfo: any): Promise<UserProfile | null> {
  if (!supabaseAdmin) {
    console.error('Supabase admin not configured');
    return null;
  }
  
  try {
    // تحويل Google ID إلى UUID format
    const generateUUID = (googleId: string) => {
      // استخدام Google ID كأساس لإنشاء UUID
      const hash = googleId.padEnd(32, '0').substring(0, 32);
      return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
    };

    const userId = generateUUID(userInfo.id);

    // أولاً: إنشاء user في جدول users إذا لم يكن موجوداً
    const { data: existingUser, error: userSelectError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!existingUser) {
      // إنشاء user جديد لمستخدم OAuth (بدون كلمة مرور فعلية)
      const { error: userInsertError } = await supabaseAdmin
        .from('users')
        .insert([{
          id: userId,
          email: userInfo.email,
          // تعيين قيم آمنة للمستخدمين القادمين من Google لتجنب قيود NOT NULL
          password: 'oauth_user',
          auth_provider: 'google',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (userInsertError) {
        console.error('❌ Error creating user:', userInsertError);
        return null;
      }
      console.log('✅ Created user in users table');
    }

    const profileData = {
      id: userId,
      user_id: userId, // إضافة user_id المطلوب
      email: userInfo.email,
      name: userInfo.name || null,
      picture: userInfo.picture || null,
      verified_email: userInfo.verified_email || false,
      locale: userInfo.locale || null,
      updated_at: new Date().toISOString()
    };

    // محاولة التحديث أولاً
    const { data: existingProfile, error: selectError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userInfo.id)
      .single();

    if (existingProfile) {
      // تحديث الملف الموجود
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .update(profileData)
        .eq('id', userInfo.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating user profile:', error);
        return null;
      }

      console.log('✅ Updated user profile:', data);
      return data;
    } else {
      // إنشاء ملف جديد
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .insert([{
          ...profileData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating user profile:', error);
        return null;
      }

      console.log('✅ Created user profile:', data);
      return data;
    }
  } catch (error) {
    console.error('❌ Error in saveUserProfile:', error);
    return null;
  }
}

// Types for client requests
export interface ClientRequest {
  id: string
  customer_id: string
  account_name: string | null
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'CANCELLED' | 'NOT_LINKED' | 'SUSPENDED'
  request_type: string
  link_details: any | null
  oauth_data: any | null
  user_id: string | null
  user_email: string | null
  user_name: string | null
  user_picture: string | null
  created_at: string
  updated_at: string
  expires_at: string
}

// Types for user profiles
export interface UserProfile {
  id: string
  email: string
  name: string | null
  picture: string | null
  verified_email: boolean
  locale: string | null
  created_at: string
  updated_at: string
}

// Function to get all client requests
export async function getClientRequests(): Promise<ClientRequest[]> {
  try {
    // جلب طلبات العملاء عبر الباك إند (Flask) بدلاً من الوصول المباشر لـ Supabase من المتصفح
    const backendUrl =
      process.env.BACKEND_API_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://my-app-production-28d2.up.railway.app'
        : 'http://localhost:5000');

    const response = await fetch(`${backendUrl}/api/get-client-requests/all`, {
      method: 'GET',
    });

    if (!response.ok) {
      console.error('❌ Backend get-client-requests error:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();

    // في حالة /all، الباك إند يرجّع قائمة مباشرة
    if (Array.isArray(data)) {
      console.log('✅ Fetched client requests from backend:', data.length);
      return data as ClientRequest[];
    }

    // في الحالات الأخرى (لو تغيّر الـ endpoint)، نحاول التعامل مع شكل كائن
    const requests = (data && Array.isArray(data.requests)) ? data.requests : [];
    console.log('✅ Fetched client requests from backend (wrapped):', requests.length);
    return requests as ClientRequest[];
  } catch (error) {
    console.error('❌ Error fetching client requests:', error)
    return []
  }
}

// Function to update client request status
export async function updateClientRequestStatus(
  customerId: string, 
  status: ClientRequest['status'], 
  linkDetails?: any
): Promise<boolean> {
  if (!supabase) {
    console.error('Supabase not configured');
    return false;
  }
  
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (linkDetails) {
      updateData.link_details = linkDetails
    }

    const { error } = await supabase
      .from('client_requests')
      .update(updateData)
      .eq('customer_id', customerId)

    if (error) {
      console.error('❌ Supabase update error:', error)
      throw error
    }

    console.log(`✅ Updated client request ${customerId} to status: ${status}`)
    return true
  } catch (error) {
    console.error('❌ Error updating client request:', error)
    return false
  }
}

// Function to subscribe to real-time changes
export function subscribeToClientRequests(callback: (payload: any) => void) {
  const subscription = supabase
    .channel('client_requests_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'client_requests'
      },
      callback
    )
    .subscribe()

  return subscription
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// إنشاء Supabase client مع service role key للوصول الكامل
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// دالة للحصول على userId من الـ session
async function getUserIdFromSession(request: NextRequest): Promise<string | null> {
  try {
    // الحصول على Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // إذا لم يكن هناك Authorization header، جرب الحصول على session_token من cookies
      const sessionToken = request.cookies.get('session_token')?.value;
      
      if (!sessionToken) {
        // جرب الحصول على user_info من cookies كبديل
        const userInfoCookie = request.cookies.get('user_info')?.value;
        if (userInfoCookie) {
          try {
            const userInfo = JSON.parse(userInfoCookie);
            return userInfo.id || null;
          } catch (error) {
            console.error('Error parsing user_info cookie:', error);
            return null;
          }
        }
        return null;
      }
      
      // التحقق من صحة session_token مع Supabase
      const { data: { user }, error } = await supabase.auth.getUser(sessionToken);
      
      if (error || !user) {
        console.error('Error verifying session token:', error);
        return null;
      }
      
      return user.id;
    }
    
    // استخراج token من Authorization header
    const token = authHeader.substring(7); // إزالة "Bearer "
    
    // التحقق من صحة token مع Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Error verifying auth token:', error);
      return null;
    }
    
    return user.id;
    
  } catch (error) {
    console.error('Error in getUserIdFromSession:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // الحصول على userId من الـ session
    const userId = await getUserIdFromSession(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in to access your accounts' },
        { status: 401 }
      );
    }

    // جلب حسابات المستخدم من قاعدة البيانات
    const { data: userAccounts, error: accountsError } = await supabase
      .from('user_accounts')
      .select('*')
      .eq('user_id', userId);

    if (accountsError) {
      console.error('Error fetching user accounts:', accountsError);
      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to fetch user accounts' },
        { status: 500 }
      );
    }

    // تنظيم البيانات حسب نوع الحساب
    const organizedAccounts = {
      google_ads: userAccounts?.filter(account => account.account_type === 'google_ads') || [],
      merchant_center: userAccounts?.filter(account => account.account_type === 'merchant_center') || [],
      youtube: userAccounts?.filter(account => account.account_type === 'youtube') || [],
      analytics: userAccounts?.filter(account => account.account_type === 'analytics') || [],
      business: userAccounts?.filter(account => account.account_type === 'business') || []
    };

    return NextResponse.json(organizedAccounts, { status: 200 });

  } catch (error) {
    console.error('Unexpected error in GET /api/user/accounts:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OAuth2Client } from 'google-auth-library';

// إعداد Supabase - هذا ملف API route يعمل على الخادم، لا يحتاج Dynamic Import
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// إعداد Google OAuth
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    // التحقق من وجود خطأ في OAuth
    if (error) {
      console.error('OAuth Error:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?error=oauth_error&message=${encodeURIComponent(error)}`
      );
    }

    // التحقق من وجود authorization code
    if (!code) {
      console.error('No authorization code received');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?error=no_code`
      );
    }

    // تبديل authorization code بـ access token
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Failed to get tokens from Google');
    }

    // الحصول على معلومات المستخدم من Google
    oauth2Client.setCredentials(tokens);
    
    const userInfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`
    );
    
    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info from Google');
    }
    
    const userInfo = await userInfoResponse.json();

    // التحقق من صحة البيانات المطلوبة
    if (!userInfo.email || !userInfo.id) {
      throw new Error('Invalid user info received from Google');
    }

    // البحث عن المستخدم في قاعدة البيانات
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userInfo.email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Database fetch error:', fetchError);
      throw new Error('Database error while fetching user');
    }

    let userId: string;
    let isNewUser = false;

    if (existingUser) {
      // تحديث المستخدم الموجود
      userId = existingUser.id;
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: userInfo.name || existingUser.name,
          picture: userInfo.picture || existingUser.picture,
          google_id: userInfo.id,
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user:', updateError);
        throw new Error('Failed to update user information');
      }
    } else {
      // إنشاء مستخدم جديد
      isNewUser = true;
      
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          email: userInfo.email,
          name: userInfo.name || userInfo.email.split('@')[0],
          picture: userInfo.picture,
          google_id: userInfo.id,
          provider: 'google',
          email_verified: userInfo.verified_email || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError || !newUser) {
        console.error('Error creating user:', insertError);
        throw new Error('Failed to create user account');
      }

      userId = newUser.id;
    }

    // حفظ أو تحديث Google OAuth tokens
    const { error: tokenError } = await supabase
      .from('user_oauth_tokens')
      .upsert({
        user_id: userId,
        provider: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        scope: tokens.scope || 'https://www.googleapis.com/auth/adwords',
        token_type: tokens.token_type || 'Bearer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,provider'
      });

    if (tokenError) {
      console.error('Error saving OAuth tokens:', tokenError);
      // لا نرمي خطأ هنا لأن المستخدم تم إنشاؤه بنجاح
    }

    // إنشاء session token
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 يوم

    // حفظ الجلسة في قاعدة البيانات
    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      });

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      throw new Error('Failed to create user session');
    }

    // إعداد الاستجابة مع cookies
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUrl = isNewUser 
      ? `${baseUrl}/dashboard?welcome=true`
      : `${baseUrl}/dashboard`;

    const response = NextResponse.redirect(redirectUrl);

    // إعداد session cookie
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 يوم
      path: '/'
    });

    // إعداد user info cookie (للوصول السريع في Frontend)
    const userCookie = {
      id: userId,
      email: userInfo.email,
      name: userInfo.name || userInfo.email.split('@')[0],
      picture: userInfo.picture
    };

    response.cookies.set('user_info', JSON.stringify(userCookie), {
      httpOnly: false, // يمكن الوصول إليه من JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 يوم
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('OAuth callback error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    return NextResponse.redirect(
      `${baseUrl}/?error=oauth_callback_error&message=${encodeURIComponent(errorMessage)}`
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

// دالة مساعدة لإنشاء session token
function generateSessionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// دالة مساعدة للتحقق من صحة البريد الإلكتروني
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// دالة مساعدة لتنظيف البيانات
function sanitizeUserData(data: any) {
  return {
    email: data.email?.toLowerCase().trim(),
    name: data.name?.trim() || data.email?.split('@')[0],
    picture: data.picture || null,
    google_id: data.id?.toString()
  };
}


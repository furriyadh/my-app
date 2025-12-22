// src/app/api/check-user/route.ts
// API متكامل لفحص العميل الجديد مع قاعدة البيانات

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// إنشاء عميل Supabase من متغيرات البيئة
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// التحقق من وجود المتغيرات المطلوبة
if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase environment variables not found');
}

// إنشاء عميل Supabase فقط إذا كانت المتغيرات متوفرة
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(request: NextRequest) {
  try {
    // التحقق من توفر Supabase
    if (!supabase) {
      return NextResponse.json(
        { 
          error: 'Database not configured',
          isNewUser: true // في حالة عدم توفر قاعدة البيانات، نعتبره مستخدم جديد
        },
        { status: 503 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Checking user in database:', email);

    // فحص المستخدم في قاعدة البيانات
    const isNewUser = await checkUserInSupabase(email);

    // إذا كان مستخدم جديد، نحفظه في قاعدة البيانات
    if (isNewUser) {
      await saveNewUserToDatabase(email);
    }

    return NextResponse.json({
      isNewUser,
      email,
      message: isNewUser ? 'New user detected - welcome!' : 'Welcome back!',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error checking user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check user status',
        isNewUser: true // في حالة الخطأ، نعتبره مستخدم جديد للأمان
      },
      { status: 500 }
    );
  }
}

// فحص المستخدم في Supabase
async function checkUserInSupabase(email: string): Promise<boolean> {
  try {
    // البحث في جدول المستخدمين
    const { data: user, error } = await supabase
      .from('users') // اسم الجدول - غير هذا حسب جدولك
      .select('id, email, created_at')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = لا توجد نتائج (مستخدم جديد)
      console.error('❌ Supabase error:', error);
      return true; // في حالة الخطأ، نعتبره مستخدم جديد
    }

    const isNewUser = !user;
    
    if (isNewUser) {
      console.log('✅ New user detected:', email);
    } else {
      console.log('👤 Existing user found:', email, 'created:', user.created_at);
    }

    return isNewUser;

  } catch (error) {
    console.error('❌ Database check error:', error);
    return true; // في حالة الخطأ، نعتبره مستخدم جديد
  }
}

// حفظ المستخدم الجديد في قاعدة البيانات
async function saveNewUserToDatabase(email: string): Promise<void> {
  try {
    console.log('💾 Saving new user to database:', email);

    const { data, error } = await supabase
      .from('users') // اسم الجدول - غير هذا حسب جدولك
      .insert([
        {
          email: email.toLowerCase(),
          created_at: new Date().toISOString(),
          onboarding_completed: false,
          account_type: null,
          customer_id: null,
          status: 'active'
        }
      ])
      .select();

    if (error) {
      console.error('❌ Error saving new user:', error);
      // لا نرمي خطأ هنا لأن العملية الأساسية (فحص المستخدم) نجحت
    } else {
      console.log('✅ New user saved successfully:', data);
    }

  } catch (error) {
    console.error('❌ Error saving new user:', error);
    // لا نرمي خطأ هنا لأن العملية الأساسية (فحص المستخدم) نجحت
  }
}

// API إضافي لحفظ اختيار المستخدم
export async function PUT(request: NextRequest) {
  try {
    // التحقق من توفر Supabase
    if (!supabase) {
      return NextResponse.json(
        { 
          error: 'Database not configured',
          isNewUser: true
        },
        { status: 503 }
      );
    }

    const { email, accountType, customerId, onboardingCompleted } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('🔄 Updating user selection:', { email, accountType, customerId });

    // تحديث بيانات المستخدم
    const { data, error } = await supabase
      .from('users')
      .update({
        account_type: accountType,
        customer_id: customerId,
        onboarding_completed: onboardingCompleted || true,
        updated_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase())
      .select();

    if (error) {
      console.error('❌ Error updating user:', error);
      return NextResponse.json(
        { error: 'Failed to update user selection' },
        { status: 500 }
      );
    }

    console.log('✅ User selection updated successfully:', data);

    return NextResponse.json({
      success: true,
      message: 'User selection saved successfully',
      data: data[0]
    });

  } catch (error) {
    console.error('❌ Error updating user selection:', error);
    return NextResponse.json(
      { error: 'Failed to update user selection' },
      { status: 500 }
    );
  }
}

// API للحصول على معلومات المستخدم
export async function GET(request: NextRequest) {
  try {
    // التحقق من توفر Supabase
    if (!supabase) {
      return NextResponse.json(
        { 
          error: 'Database not configured',
          isNewUser: true
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    console.log('📊 Getting user info:', email);

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      console.error('❌ Error getting user info:', error);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        accountType: user.account_type,
        customerId: user.customer_id,
        onboardingCompleted: user.onboarding_completed,
        status: user.status,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });

  } catch (error) {
    console.error('❌ Error getting user info:', error);
    return NextResponse.json(
      { error: 'Failed to get user info' },
      { status: 500 }
    );
  }
}


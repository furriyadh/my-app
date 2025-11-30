import { NextRequest, NextResponse } from 'next/server';

interface MCCAccountsResponse {
  success: boolean;
  accounts?: any[];
  statistics?: any;
  error?: string;
  message?: string;
}

export async function GET(request: NextRequest) {
  try {
    // التحقق من وجود بيانات المستخدم
    const userInfoCookie = request.cookies.get('oauth_user_info')?.value;
    if (!userInfoCookie) {
      return NextResponse.json({
        success: false,
        error: 'User session not found'
      }, { status: 401 });
    }

    let userInfo;
    try {
      userInfo = JSON.parse(userInfoCookie);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid user session data'
      }, { status: 401 });
    }

    // الاتصال بالباك اند للحصول على بيانات MCC
    const response = await fetch(`${getBackendUrl()}/api/mcc/accounts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userInfo.sessionToken || ''}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      
      return NextResponse.json({
        success: true,
        accounts: data.accounts || [],
        statistics: data.statistics || null,
        message: 'تم تحميل بيانات MCC بنجاح'
      });
    } else {
      const errorData = await response.text();
      console.error('Backend MCC API error:', errorData);
      
      return NextResponse.json({
        success: false,
        error: 'فشل في تحميل بيانات MCC من الخادم',
        details: errorData
      }, { status: response.status });
    }

  } catch (error) {
    console.error('Error in MCC accounts API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, account_ids, account_data } = body;

    // التحقق من وجود بيانات المستخدم
    const userInfoCookie = request.cookies.get('oauth_user_info')?.value;
    if (!userInfoCookie) {
      return NextResponse.json({
        success: false,
        error: 'User session not found'
      }, { status: 401 });
    }

    let userInfo;
    try {
      userInfo = JSON.parse(userInfoCookie);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid user session data'
      }, { status: 401 });
    }

    // الاتصال بالباك اند لتنفيذ العملية
    const response = await fetch(`${getBackendUrl()}/api/mcc/accounts/${operation}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userInfo.sessionToken || ''}`
      },
      body: JSON.stringify({
        account_ids,
        account_data,
        user_id: userInfo.id
      })
    });

    if (response.ok) {
      const data = await response.json();
      
      return NextResponse.json({
        success: true,
        message: `تم تنفيذ العملية ${operation} بنجاح`,
        data: data
      });
    } else {
      const errorData = await response.text();
      console.error('Backend MCC operation error:', errorData);
      
      return NextResponse.json({
        success: false,
        error: `فشل في تنفيذ العملية ${operation}`,
        details: errorData
      }, { status: response.status });
    }

  } catch (error) {
    console.error('Error in MCC operation API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

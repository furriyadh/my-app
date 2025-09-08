import { NextRequest, NextResponse } from 'next/server';
import { setJWTCookies } from '@/lib/jwt';

/**
 * Login API Route - JWT + HttpOnly Cookies
 * Frontend → Backend → JWT → HttpOnly Cookies
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }
    
    console.log('🔐 Login attempt:', { email });
    
    // Send credentials to Flask backend
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://my-app-production-28d2.up.railway.app/api/auth/login'
      : 'http://localhost:5000/api/auth/login';
    
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json({
        success: false,
        error: errorData.message || 'Authentication failed'
      }, { status: backendResponse.status });
    }
    
    const { access_token, refresh_token, user } = await backendResponse.json();
    
    console.log('✅ Login successful, setting JWT cookies');
    
    // Set JWT tokens in HttpOnly cookies
    const response = setJWTCookies(access_token, refresh_token);
    
    // Add user info to response (without sensitive data)
    const responseData = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

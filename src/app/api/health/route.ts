import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // فحص حالة الخادم الأمامي
    const frontendStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    };

    // محاولة فحص الخادم الخلفي
    let backendStatus = null;
    try {
      const backendUrl = process.env.NODE_ENV === 'production'
        ? 'https://my-app-production-28d2.up.railway.app'
        : 'http://localhost:5000';
      
      const backendResponse = await fetch(`${backendUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000) // timeout بعد 5 ثوان
      });

      if (backendResponse.ok) {
        backendStatus = await backendResponse.json();
      } else {
        backendStatus = {
          status: 'unhealthy',
          error: `Backend returned ${backendResponse.status}`,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      backendStatus = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }

    return NextResponse.json({
      success: true,
      frontend: frontendStatus,
      backend: backendStatus,
      overall: backendStatus?.status === 'healthy' ? 'healthy' : 'degraded'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

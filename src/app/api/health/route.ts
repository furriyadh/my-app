import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = getBackendUrl();

    let backendHealth = {};
    try {
      const backendResponse = await fetch(`${backendUrl}/api/health`);
      if (backendResponse.ok) {
        backendHealth = await backendResponse.json();
      } else {
        backendHealth = { status: 'unhealthy', message: `Backend responded with status ${backendResponse.status}` };
      }
    } catch (error) {
      backendHealth = { status: 'unhealthy', message: `Could not connect to backend: ${error instanceof Error ? error.message : String(error)}` };
    }

    return NextResponse.json({
      success: true,
      frontend: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: '1.0.0' // يمكنك تحديث هذا الإصدار حسب الحاجة
      },
      backend: backendHealth,
      overall_status: (backendHealth as any).status === 'healthy' ? 'healthy' : 'degraded'
    }, { status: 200 });

  } catch (error) {
    console.error('Error in frontend health check:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during health check',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

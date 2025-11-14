import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // الاتصال بالباك اند للحصول على SSE stream
    const backendUrl = process.env.BACKEND_API_URL || (process.env.NODE_ENV === 'production' ? 'https://my-app-production-28d2.up.railway.app' : 'http://localhost:5000');
    
    const response = await fetch(`${backendUrl}/api/account-status-stream`, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      }
    });

    if (!response.ok) {
      throw new Error(`Backend SSE stream failed: ${response.status}`);
    }

    // إرجاع الاستجابة كـ stream
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });

  } catch (error) {
    console.error('SSE stream error:', error);
    return NextResponse.json(
      { error: 'Failed to establish SSE connection' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://furriyadh.com' : 'http://localhost:5000');

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Next.js API: Syncing all statuses from Google Ads API...');
    
    const response = await fetch(`${backendUrl}/api/sync-all-statuses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to sync statuses from backend:', errorText);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to sync statuses', 
        details: errorText 
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ Status sync completed:', data);
    
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('❌ Error in /api/sync-statuses POST:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

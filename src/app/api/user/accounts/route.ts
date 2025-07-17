import { NextRequest, NextResponse } from 'next/server';

// Mock user accounts data
const mockUserAccounts = {
  google_ads: [
    {
      id: 'ga_001',
      name: 'Main Google Ads Account',
      type: 'google_ads',
      details: {
        currency_code: 'USD'
      }
    },
    {
      id: 'ga_002', 
      name: 'Secondary Ads Account',
      type: 'google_ads',
      details: {
        currency_code: 'EUR'
      }
    }
  ],
  merchant_center: [
    {
      id: 'mc_001',
      name: 'Main Store',
      type: 'merchant_center',
      details: {
        website_url: 'https://example.com'
      }
    }
  ],
  youtube: [
    {
      id: 'yt_001',
      name: 'Brand Channel',
      type: 'youtube',
      details: {
        subscriber_count: 15000
      }
    }
  ],
  analytics: [
    {
      id: 'ga4_001',
      name: 'Website Analytics',
      type: 'analytics',
      details: {
        property_count: 3
      }
    }
  ],
  business: [
    {
      id: 'gmb_001',
      name: 'Main Location',
      type: 'business',
      details: {
        location_count: 1
      }
    }
  ]
};

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, always return mock data
    // In production, you would check authentication and fetch real data
    
    return NextResponse.json(mockUserAccounts, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
  } catch (error) {
    console.error('Error fetching user accounts:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to fetch user accounts'
      }, 
      { status: 500 }
    );
  }
}


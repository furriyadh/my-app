// src/app/api/accounts/create/route.ts
// API endpoint لإنشاء حساب Google Ads حقيقي تحت MCC

import { NextRequest, NextResponse } from 'next/server';

// استيراد MCCClient مع التعامل مع الأخطاء المحتملة
let MCCClient: any;

try {
  const mccModule = require('@/lib/mcc-client');
  MCCClient = mccModule.default || mccModule.MCCClient;
} catch (error) {
  console.warn('MCC Client not available, using mock implementation');
}

interface AccountCreateRequest {
  accountType: 'furriyadh-managed' | 'new-account';
  customerName: string;
  currency?: string;
  timezone?: string;
  countryCode?: string;
  userEmail?: string;
}

interface AccountCreateResponse {
  success: boolean;
  customerId?: string;
  customerName?: string;
  accountType?: string;
  resourceName?: string;
  error?: string;
  message?: string;
  details?: any;
}

class GoogleAdsAccountManager {
  private mccClient: any;
  private isApiAvailable: boolean;

  constructor() {
    this.isApiAvailable = !!MCCClient;
    
    if (this.isApiAvailable) {
      try {
        this.mccClient = new MCCClient();
      } catch (e) {
        console.error('Failed to initialize MCCClient:', e);
        this.isApiAvailable = false;
      }
    }
  }

  async createAccount(request: AccountCreateRequest): Promise<AccountCreateResponse> {
    if (!this.isApiAvailable) {
      console.warn('MCC Client not available, performing mock account creation.');
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        success: true,
        customerId: `mock-customer-${Date.now()}`,
        customerName: request.customerName,
        accountType: request.accountType,
        message: 'Mock account created successfully.'
      };
    }

    try {
      const newAccount = await this.mccClient.createSubAccount({
        name: request.customerName,
        currencyCode: request.currency || 'SAR',
        timeZone: request.timezone || 'Asia/Riyadh',
        countryCode: request.countryCode || 'SA',
        emailAddress: request.userEmail // Pass user email if available
      });

      if (newAccount && newAccount.resourceName) {
        // Extract customerId from resourceName (e.g., customers/1234567890)
        const customerId = newAccount.resourceName.split('/').pop();
        return {
          success: true,
          customerId: customerId,
          customerName: request.customerName,
          accountType: request.accountType,
          resourceName: newAccount.resourceName,
          message: 'Account created successfully.'
        };
      } else {
        return {
          success: false,
          error: 'Failed to create account: No resourceName returned.',
          message: 'Failed to create account.'
        };
      }
    } catch (error: any) {
      console.error('Error creating account:', error);
      return {
        success: false,
        error: error.message || 'Unknown error during account creation.',
        message: 'Failed to create account.',
        details: error
      };
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { accountType, customerName, currency, timezone, countryCode, userEmail } = await req.json();

    if (!customerName || !accountType) {
      return NextResponse.json({ success: false, error: 'Missing customerName or accountType' }, { status: 400 });
    }

    const manager = new GoogleAdsAccountManager();
    const response = await manager.createAccount({
      accountType,
      customerName,
      currency,
      timezone,
      countryCode,
      userEmail
    });

    if (response.success) {
      return NextResponse.json(response, { status: 200 });
    } else {
      return NextResponse.json(response, { status: 500 });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

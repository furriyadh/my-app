import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// TypeScript interfaces
interface MerchantCenterAccount {
  id: string;
  name: string;
  website_url: string;
  country: string;
  adult_content: boolean;
  business_information?: {
    address?: {
      country: string;
      locality?: string;
      region?: string;
    };
    phone_number?: string;
  };
}

// إعداد Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // التحقق من session token
    const sessionToken = request.cookies.get('session_token')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No session token' },
        { status: 401 }
      );
    }

    // التحقق من صحة الجلسة
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('user_id, expires_at')
      .eq('session_token', sessionToken)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    // التحقق من انتهاء صلاحية الجلسة
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Unauthorized - Session expired' },
        { status: 401 }
      );
    }

    const userId = session.user_id;

    // جلب Google OAuth token للمستخدم
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_oauth_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Google account not connected' },
        { status: 400 }
      );
    }

    // التحقق من صلاحية access token وتحديثه إذا لزم الأمر
    let accessToken = tokenData.access_token;
    if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
      try {
        accessToken = await refreshAccessToken(userId, tokenData.refresh_token);
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        return NextResponse.json(
          { error: 'Failed to refresh Google token' },
          { status: 400 }
        );
      }
    }

    // جلب حسابات Merchant Center
    const merchantAccounts = await fetchMerchantCenterAccounts(accessToken);

    // حفظ أو تحديث الحسابات في قاعدة البيانات
    if (merchantAccounts.length > 0) {
      const { error: saveError } = await supabase
        .from('user_merchant_center_accounts')
        .upsert(
          merchantAccounts.map((account: MerchantCenterAccount) => ({
            user_id: userId,
            account_id: account.id,
            account_name: account.name,
            website_url: account.website_url,
            country: account.country,
            adult_content: account.adult_content,
            phone_number: account.business_information?.phone_number || null,
            updated_at: new Date().toISOString()
          })),
          { onConflict: 'user_id,account_id' }
        );

      if (saveError) {
        console.error('Error saving Merchant Center accounts:', saveError);
      }
    }

    return NextResponse.json({
      success: true,
      accounts: merchantAccounts,
      total: merchantAccounts.length
    });

  } catch (error) {
    console.error('Merchant Center accounts API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // التحقق من session token
    const sessionToken = request.cookies.get('session_token')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No session token' },
        { status: 401 }
      );
    }

    // التحقق من صحة الجلسة
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('user_id')
      .eq('session_token', sessionToken)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, account_id } = body;

    if (action === 'refresh') {
      // إعادة جلب الحسابات من Google
      return GET(request);
    }

    if (action === 'select' && account_id) {
      // تحديد حساب افتراضي للمستخدم
      const { error: updateError } = await supabase
        .from('user_merchant_center_accounts')
        .update({ is_default: false })
        .eq('user_id', session.user_id);

      if (!updateError) {
        await supabase
          .from('user_merchant_center_accounts')
          .update({ is_default: true })
          .eq('user_id', session.user_id)
          .eq('account_id', account_id);
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'sync_products' && account_id) {
      // مزامنة المنتجات من Merchant Center
      const products = await syncMerchantCenterProducts(session.user_id, account_id);
      return NextResponse.json({ 
        success: true, 
        products_synced: products.length 
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Merchant Center accounts POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// جلب حسابات Merchant Center من API
async function fetchMerchantCenterAccounts(accessToken: string): Promise<MerchantCenterAccount[]> {
  try {
    const response = await fetch('https://shoppingcontent.googleapis.com/content/v2.1/accounts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        console.warn('No access to Merchant Center API or no accounts found');
        return [];
      }
      throw new Error(`Merchant Center API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.resources || data.resources.length === 0) {
      return [];
    }

    return data.resources.map((account: any): MerchantCenterAccount => ({
      id: account.id.toString(),
      name: account.name || `Merchant Account ${account.id}`,
      website_url: account.websiteUrl || '',
      country: account.country || '',
      adult_content: account.adultContent || false,
      business_information: account.businessInformation ? {
        address: account.businessInformation.address ? {
          country: account.businessInformation.address.country || '',
          locality: account.businessInformation.address.locality,
          region: account.businessInformation.address.region,
        } : undefined,
        phone_number: account.businessInformation.phoneNumber,
      } : undefined,
    }));
  } catch (error) {
    console.error('Error fetching Merchant Center accounts:', error);
    return [];
  }
}

// مزامنة المنتجات من Merchant Center
async function syncMerchantCenterProducts(userId: string, accountId: string): Promise<any[]> {
  try {
    // جلب access token للمستخدم
    const { data: tokenData } = await supabase
      .from('user_oauth_tokens')
      .select('access_token')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single();

    if (!tokenData) {
      throw new Error('No access token found');
    }

    // جلب المنتجات من Merchant Center
    const response = await fetch(`https://shoppingcontent.googleapis.com/content/v2.1/${accountId}/products`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    const data = await response.json();
    const products = data.resources || [];

    // حفظ المنتجات في قاعدة البيانات
    if (products.length > 0) {
      const productsToSave = products.map((product: any) => ({
        user_id: userId,
        merchant_account_id: accountId,
        product_id: product.id,
        title: product.title,
        description: product.description,
        link: product.link,
        image_link: product.imageLink,
        price: product.price?.value || null,
        currency: product.price?.currency || null,
        availability: product.availability,
        condition: product.condition,
        brand: product.brand,
        gtin: product.gtin,
        mpn: product.mpn,
        google_product_category: product.googleProductCategory,
        product_type: product.productType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: saveError } = await supabase
        .from('merchant_center_products')
        .upsert(productsToSave, { 
          onConflict: 'user_id,merchant_account_id,product_id' 
        });

      if (saveError) {
        console.error('Error saving products:', saveError);
      }
    }

    return products;
  } catch (error) {
    console.error('Error syncing Merchant Center products:', error);
    return [];
  }
}

// تحديث access token
async function refreshAccessToken(userId: string, refreshToken: string): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();
  const newAccessToken = data.access_token;
  const expiresIn = data.expires_in || 3600;
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  // تحديث token في قاعدة البيانات
  await supabase
    .from('user_oauth_tokens')
    .update({
      access_token: newAccessToken,
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('provider', 'google');

  return newAccessToken;
}


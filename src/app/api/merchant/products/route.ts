import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Fetch products from Google Merchant Center
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const merchantId = searchParams.get('merchantId');

        if (!merchantId) {
            return NextResponse.json({
                success: false,
                error: 'Merchant ID is required'
            }, { status: 400 });
        }

        // Get access token from cookies
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('google_access_token')?.value;

        if (!accessToken) {
            return NextResponse.json({
                success: false,
                error: 'Not authenticated'
            }, { status: 401 });
        }

        // Fetch products from Google Content API
        const response = await fetch(
            `https://shoppingcontent.googleapis.com/content/v2.1/${merchantId}/products?maxResults=20`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Merchant Center Products API error:', errorData);

            // Return mock products if API fails
            return NextResponse.json({
                success: true,
                products: getMockProducts(),
                source: 'mock'
            });
        }

        const data = await response.json();

        // Transform products to our format
        const products = (data.resources || []).map((product: any) => ({
            id: product.id,
            name: product.title || 'Product',
            price: product.price?.value ? parseFloat(product.price.value) : 0,
            currency: product.price?.currency || 'USD',
            image: product.imageLink || product.additionalImageLinks?.[0] || null,
            category: product.productTypes?.[0] || product.googleProductCategory || null,
            brand: product.brand || null,
            availability: product.availability || 'in_stock',
            link: product.link || null
        }));

        return NextResponse.json({
            success: true,
            products: products.length > 0 ? products : getMockProducts(),
            source: products.length > 0 ? 'merchant_center' : 'mock',
            total: products.length
        });

    } catch (error: any) {
        console.error('Error fetching Merchant Center products:', error);

        // Return mock products on error
        return NextResponse.json({
            success: true,
            products: getMockProducts(),
            source: 'mock',
            error: error.message
        });
    }
}

// Mock products for fallback
function getMockProducts() {
    return [
        {
            id: '1',
            name: 'خاتم ذهب 18 قيراط مرصع بالألماس',
            price: 1299,
            currency: 'SAR',
            category: 'خواتم',
            image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
            brand: 'لازوردي'
        },
        {
            id: '2',
            name: 'سلسلة ألماس فاخرة عيار 21',
            price: 2499,
            currency: 'SAR',
            category: 'سلاسل',
            image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
            brand: 'لازوردي'
        },
        {
            id: '3',
            name: 'أقراط ذهب مرصعة بالأحجار الكريمة',
            price: 899,
            currency: 'SAR',
            category: 'أقراط',
            image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
            brand: 'لازوردي'
        },
        {
            id: '4',
            name: 'أسورة ذهب إيطالي فاخرة',
            price: 1899,
            currency: 'SAR',
            category: 'أساور',
            image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop',
            brand: 'لازوردي'
        },
        {
            id: '5',
            name: 'طقم مجوهرات زفاف كامل',
            price: 4999,
            currency: 'SAR',
            category: 'طقم',
            image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
            brand: 'لازوردي'
        },
        {
            id: '6',
            name: 'خاتم خطوبة ألماس سوليتير',
            price: 3499,
            currency: 'SAR',
            category: 'خواتم خطوبة',
            image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
            brand: 'لازوردي'
        },
    ];
}

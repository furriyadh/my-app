import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Types for URL detection
interface UrlDetectionResult {
    type: 'website' | 'store' | 'app' | 'video';
    platform?: 'android' | 'ios';
    appId?: string;
    videoId?: string;
    channelId?: string;
    url: string;
    suggestedCampaignType: 'SEARCH' | 'SHOPPING' | 'APP' | 'VIDEO' | 'DISPLAY' | 'PERFORMANCE_MAX';
    details?: {
        name?: string;
        icon?: string;
        description?: string;
        storePlatform?: string; // e.g., "Shopify", "Salla", "WooCommerce"
    };
}

// Helper: Extract domain from URL
function extractDomain(urlStr: string): string {
    try {
        let fullUrl = urlStr;
        if (!fullUrl.startsWith('http')) {
            fullUrl = 'https://' + fullUrl;
        }
        const parsed = new URL(fullUrl);
        return parsed.hostname.replace(/^www\./, '').toLowerCase();
    } catch {
        return urlStr.toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .split('/')[0]
            .split('?')[0];
    }
}

// 🔒 SSRF Protection: التحقق من أن URL آمن قبل عمل الطلب
function isUrlSafe(urlStr: string): { safe: boolean; reason?: string } {
    try {
        const url = new URL(urlStr);
        const hostname = url.hostname.toLowerCase();

        // ❌ منع localhost و 127.x.x.x
        if (hostname === 'localhost' || hostname.startsWith('127.')) {
            return { safe: false, reason: 'localhost not allowed' };
        }

        // ❌ منع IPs الداخلية (Private Networks)
        const ipPatterns = [
            /^10\./,                    // 10.0.0.0/8
            /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
            /^192\.168\./,              // 192.168.0.0/16
            /^169\.254\./,              // Link-local
            /^0\./,                     // 0.0.0.0/8
            /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // Carrier-grade NAT
        ];

        for (const pattern of ipPatterns) {
            if (pattern.test(hostname)) {
                return { safe: false, reason: 'private IP not allowed' };
            }
        }

        // ❌ منع AWS/GCP/Azure Metadata endpoints
        const metadataHosts = [
            '169.254.169.254',      // AWS/GCP metadata
            'metadata.google.internal',
            'metadata.google',
            '100.100.100.200',      // Alibaba Cloud
        ];

        if (metadataHosts.includes(hostname)) {
            return { safe: false, reason: 'cloud metadata endpoint not allowed' };
        }

        // ❌ منع file:// و ftp:// protocols
        if (!['http:', 'https:'].includes(url.protocol)) {
            return { safe: false, reason: 'only http/https allowed' };
        }

        return { safe: true };
    } catch {
        return { safe: false, reason: 'invalid URL' };
    }
}

// Check if URL domain matches any Merchant Center account
async function checkMerchantCenterMatch(url: string): Promise<{ isMatch: boolean; accountName?: string }> {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('oauth_access_token')?.value;

        if (!accessToken) return { isMatch: false };

        // Fetch merchant accounts
        const response = await fetch('https://shoppingcontent.googleapis.com/content/v2.1/accounts/authinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return { isMatch: false };

        const authInfo = await response.json();
        const enteredDomain = extractDomain(url);

        // Check each merchant account's website
        if (authInfo.accountIdentifiers) {
            for (const identifier of authInfo.accountIdentifiers) {
                const merchantId = identifier.merchantId || identifier.aggregatorId;
                if (!merchantId) continue;

                try {
                    const detailsRes = await fetch(
                        `https://shoppingcontent.googleapis.com/content/v2.1/${merchantId}/accounts/${merchantId}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (detailsRes.ok) {
                        const details = await detailsRes.json();
                        if (details.websiteUrl) {
                            const accountDomain = extractDomain(details.websiteUrl);
                            if (enteredDomain === accountDomain) {
                                console.log('🎯 Merchant Center match found:', details.name);
                                return { isMatch: true, accountName: details.name };
                            }
                        }
                    }
                } catch {
                    // Skip this account
                }
            }
        }

        return { isMatch: false };
    } catch (error) {
        console.log('Merchant Center check skipped:', error);
        return { isMatch: false };
    }
}

// Wappalyzer-style e-commerce detection (enhanced)
async function detectStoreFromHTML(url: string): Promise<{ isStore: boolean; platform?: string }> {
    try {
        // 🔒 SSRF Protection - التحقق من أن URL آمن قبل عمل الطلب
        const urlCheck = isUrlSafe(url);
        if (!urlCheck.safe) {
            console.warn(`⚠️ SSRF protection: blocked ${url} - ${urlCheck.reason}`);
            return { isStore: false };
        }

        // === Explicit Exclusions (Classifieds/Services) ===
        // Check BEFORE fetching HTML to save time and prevent false positives
        const nonStorePatterns = [
            'haraj.com',
            'opensooq.com',
            'olx.',
            'dubizzle.',
            'useddm.com', // Explicit fix for user's site
        ];

        for (const pattern of nonStorePatterns) {
            if (url.includes(pattern)) {
                console.log(`ℹ️ Known classifieds/service site detected: ${pattern}`);
                return { isStore: false };
            }
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html',
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) return { isStore: false };

        // Read first 100KB for better detection
        const reader = response.body?.getReader();
        if (!reader) return { isStore: false };

        let html = '';
        const decoder = new TextDecoder();
        let bytesRead = 0;
        const maxBytes = 100000;

        while (bytesRead < maxBytes) {
            const { done, value } = await reader.read();
            if (done) break;
            html += decoder.decode(value, { stream: true });
            bytesRead += value.length;
        }
        reader.cancel();

        html = html.toLowerCase();

        // === STRONG E-commerce Platform Detection (Wappalyzer-style) ===
        const platformPatterns: { pattern: RegExp | string; platform: string; confidence: 'high' | 'medium' }[] = [
            // High confidence - specific platform markers
            { pattern: /cdn\.shopify\.com/i, platform: 'Shopify', confidence: 'high' },
            { pattern: /myshopify\.com/i, platform: 'Shopify', confidence: 'high' },
            { pattern: /salla\.sa|assets\.salla/i, platform: 'Salla', confidence: 'high' },
            { pattern: /zid\.store|cdn\.zid/i, platform: 'Zid', confidence: 'high' },
            { pattern: /woocommerce/i, platform: 'WooCommerce', confidence: 'high' },
            { pattern: /wp-content.*woocommerce/i, platform: 'WooCommerce', confidence: 'high' },
            { pattern: /magento/i, platform: 'Magento', confidence: 'high' },
            { pattern: /mage\/cookies/i, platform: 'Magento', confidence: 'high' },
            { pattern: /prestashop/i, platform: 'PrestaShop', confidence: 'high' },
            { pattern: /opencart/i, platform: 'OpenCart', confidence: 'high' },
            { pattern: /bigcommerce/i, platform: 'BigCommerce', confidence: 'high' },
            { pattern: /expandcart/i, platform: 'ExpandCart', confidence: 'high' },
            { pattern: /youcan\.shop/i, platform: 'YouCan', confidence: 'high' },
            { pattern: /ecwid/i, platform: 'Ecwid', confidence: 'high' },

            // Payment Gateway Detection (High confidence store indicator)
            { pattern: /stripe\.js|js\.stripe\.com/i, platform: 'Stripe Payment', confidence: 'high' },
            { pattern: /paypal\.com\/sdk/i, platform: 'PayPal Payment', confidence: 'high' },
            { pattern: /checkout\.paypal/i, platform: 'PayPal Payment', confidence: 'high' },
            { pattern: /myfatoorah/i, platform: 'MyFatoorah Payment', confidence: 'high' },
            { pattern: /tap\.company|goSell/i, platform: 'Tap Payment', confidence: 'high' },
            { pattern: /hyperpay/i, platform: 'HyperPay Payment', confidence: 'high' },
            { pattern: /moyasar/i, platform: 'Moyasar Payment', confidence: 'high' },
            { pattern: /paytabs/i, platform: 'PayTabs Payment', confidence: 'high' },
        ];

        for (const { pattern, platform, confidence } of platformPatterns) {
            if (typeof pattern === 'string' ? html.includes(pattern) : pattern.test(html)) {
                if (confidence === 'high') {
                    console.log(`✅ Store detected via: ${platform}`);
                    return { isStore: true, platform };
                }
            }
        }



        // === Schema.org Product Detection (contributes to score) ===
        const schemaPatterns = [
            '"@type":"product"',
            '"@type":"offer"',
            '"@type":"itemlist"',
            'schema.org/product',
            'schema.org/offer',
            'itemtype="http://schema.org/product"',
        ];

        let schemaScore = 0;
        for (const pattern of schemaPatterns) {
            if (html.includes(pattern)) {
                schemaScore = 2; // Worth 2 points
                break; // Max 2 points from schema
            }
        }

        // === Meta Tags & Common E-commerce Patterns ===
        const ecommerceIndicators = [
            // Cart & Checkout patterns
            'add-to-cart',
            'add_to_cart',
            'addtocart',
            'buy-now',
            'buy_now',
            'buynow',
            'add-to-bag',
            'add_to_bag',
            'checkout',
            'shopping-cart',
            'shopping_cart',
            'shoppingcart',
            'cart-count',
            'cart-total',
            'minicart',
            'mini-cart',
            'view-cart',
            'viewcart',

            // Product patterns
            'product-price',
            'product_price',
            'product-detail',
            'product-image',
            'product-gallery',
            'product-info',
            'product-page',
            'productprice',
            'data-product-id',
            'data-variant-id',
            'data-sku',
            'data-price',

            // Open Graph patterns
            'og:type" content="product',
            'og:type" content="og:product',
            'product:price',
            'product:availability',
            'product:condition',

            // Currency & Price patterns (SAR, EGP, USD, etc.)
            'class=\"price\"',
            'class=\"amount\"',
            'itemprop=\"price\"',
            'data-currency',
            'currency-symbol',

            // Arabic e-commerce patterns (STRONG ONLY - must be in HTML context, not content)
            // Removed weak patterns: 'شراء الآن', 'سلة التسوق' - too generic

            // Wishlist & Favorites - Strong indicators
            'add-to-wishlist',
            'add_to_wishlist',

            // Stock & Inventory - Strong indicators
            'in-stock',
            'out-of-stock',
            'add-to-compare',
        ];

        let matchCount = schemaScore;
        const matchedPatterns: string[] = [];
        if (schemaScore > 0) matchedPatterns.push('schema-product');

        for (const pattern of ecommerceIndicators) {
            if (html.includes(pattern)) {
                matchCount++;
                matchedPatterns.push(pattern);
                if (matchCount >= 5) { // Need at least 5 points (Score + Matches)
                    console.log('E-commerce detected with patterns:', matchedPatterns);
                    return { isStore: true, platform: 'E-commerce' };
                }
            }
        }

        // Price patterns add to count but need combination with other indicators
        const pricePatterns = [
            /\$\d+[\.,]\d{2}/,           // $99.99
            /\d+[\.,]\d{2}\s*(sar|ر\.س)/i, // 99.00 SAR
            /\d+[\.,]\d{2}\s*(egp|ج\.م)/i, // 99.00 EGP
            /\d+[\.,]\d{2}\s*(aed|د\.إ)/i, // 99.00 AED
            /\d+[\.,]\d{2}\s*(usd|eur|gbp)/i,
        ];

        for (const pattern of pricePatterns) {
            if (pattern.test(html)) {
                matchCount++;
                if (matchCount >= 4) { // Still need 4 total matches
                    return { isStore: true, platform: 'E-commerce' };
                }
            }
        }

        return { isStore: false };

    } catch (error) {
        // Timeout or fetch error - return false quickly
        return { isStore: false };
    }
}

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        // Normalize URL
        let normalizedUrl = url.trim().toLowerCase();
        if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
            normalizedUrl = 'https://' + normalizedUrl;
        }

        let urlObj: URL;
        try {
            urlObj = new URL(normalizedUrl);
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        const hostname = urlObj.hostname;
        const pathname = urlObj.pathname;
        const searchParams = urlObj.searchParams;

        // 🔒 SSRF Protection - رفض URLs الداخلية والخطيرة
        const urlCheck = isUrlSafe(normalizedUrl);
        if (!urlCheck.safe) {
            console.warn(`⚠️ SSRF blocked in POST: ${normalizedUrl} - ${urlCheck.reason}`);
            return NextResponse.json(
                { error: 'Invalid URL', reason: urlCheck.reason },
                { status: 400 }
            );
        }

        let result: UrlDetectionResult;

        // ==========================================
        // PRIORITY 1: Check if URL matches Merchant Center account
        // If yes, it's DEFINITELY a store (highest confidence)
        // ==========================================
        const merchantMatch = await checkMerchantCenterMatch(normalizedUrl);
        if (merchantMatch.isMatch) {
            console.log('🛒 URL matched Merchant Center account - auto-detecting as store');
            return NextResponse.json({
                type: 'store',
                url: normalizedUrl,
                suggestedCampaignType: 'SHOPPING',
                details: {
                    name: merchantMatch.accountName,
                    storePlatform: 'Merchant Center Verified'
                }
            });
        }

        // 1. Check for Google Play Store
        if (hostname.includes('play.google.com') && pathname.includes('/store/apps')) {
            const appId = searchParams.get('id') || pathname.split('/').pop();
            result = {
                type: 'app',
                platform: 'android',
                appId: appId || undefined,
                url: normalizedUrl,
                suggestedCampaignType: 'APP',
                details: {
                    name: appId || 'Android App'
                }
            };
        }
        // 2. Check for Apple App Store
        else if (hostname.includes('apps.apple.com') || hostname.includes('itunes.apple.com')) {
            // Extract app ID from URL like /app/app-name/id123456789
            const idMatch = pathname.match(/\/id(\d+)/);
            const appId = idMatch ? idMatch[1] : undefined;
            result = {
                type: 'app',
                platform: 'ios',
                appId: appId,
                url: normalizedUrl,
                suggestedCampaignType: 'APP',
                details: {
                    name: 'iOS App'
                }
            };
        }
        // 3. Check for YouTube video
        else if (hostname.includes('youtube.com') && pathname.includes('/watch')) {
            const videoId = searchParams.get('v');
            result = {
                type: 'video',
                videoId: videoId || undefined,
                url: normalizedUrl,
                suggestedCampaignType: 'VIDEO',
                details: {
                    name: 'YouTube Video'
                }
            };
        }
        // 4. Check for YouTube short URL
        else if (hostname.includes('youtu.be')) {
            const videoId = pathname.slice(1);
            result = {
                type: 'video',
                videoId: videoId || undefined,
                url: normalizedUrl,
                suggestedCampaignType: 'VIDEO',
                details: {
                    name: 'YouTube Video'
                }
            };
        }
        // 5. Check for YouTube channel
        else if (hostname.includes('youtube.com') && (pathname.includes('/channel') || pathname.includes('/@'))) {
            const channelId = pathname.includes('/channel/')
                ? pathname.split('/channel/')[1]?.split('/')[0]
                : pathname.split('/@')[1]?.split('/')[0];
            result = {
                type: 'video',
                channelId: channelId || undefined,
                url: normalizedUrl,
                suggestedCampaignType: 'VIDEO',
                details: {
                    name: 'YouTube Channel'
                }
            };
        }
        // 6. Check for known e-commerce platforms (comprehensive global list)
        else if (
            // === Global E-commerce Platforms ===
            hostname.includes('shopify.com') ||
            hostname.includes('myshopify.com') ||
            hostname.includes('woocommerce') ||
            hostname.includes('bigcommerce.com') ||
            hostname.includes('magento') ||
            hostname.includes('squarespace.com') ||
            hostname.includes('wix.com') ||
            hostname.includes('weebly.com') ||
            hostname.includes('volusion.com') ||
            hostname.includes('3dcart.com') ||
            hostname.includes('shift4shop.com') ||
            hostname.includes('prestashop.com') ||
            hostname.includes('opencart') ||
            hostname.includes('oscommerce') ||
            hostname.includes('zen-cart') ||
            hostname.includes('ecwid.com') ||
            hostname.includes('bigcartel.com') ||
            hostname.includes('gumroad.com') ||
            hostname.includes('sellfy.com') ||
            hostname.includes('paddle.com') ||
            hostname.includes('lemonsqueezy.com') ||

            // === Middle East & Arabic Platforms ===
            hostname.includes('salla.sa') ||
            hostname.includes('salla.com') ||
            hostname.includes('zid.sa') ||
            hostname.includes('zid.store') ||
            hostname.includes('expandcart.com') ||
            hostname.includes('youcan.shop') ||
            hostname.includes('storefront.me') ||
            hostname.includes('noon.com') ||
            hostname.includes('souq.com') ||
            hostname.includes('jarir.com') ||
            hostname.includes('extra.com') ||
            hostname.includes('namshi.com') ||
            hostname.includes('ounass.com') ||
            hostname.includes('sivvi.com') ||
            hostname.includes('mumzworld.com') ||
            hostname.includes('lootah.ae') ||
            hostname.includes('carrefouruae.com') ||
            hostname.includes('carrefour.sa') ||
            hostname.includes('elaraby.com') ||
            hostname.includes('jumia.') || // jumia.com.eg, jumia.com.ng, etc.

            // === Saudi & Gulf Jewelry/Fashion Stores ===
            hostname.includes('lazurde.com') ||
            hostname.includes('alammari') ||
            hostname.includes('alammarigold') ||
            hostname.includes('lcwaikiki') ||
            hostname.includes('max') ||
            hostname.includes('centrepoint') ||
            hostname.includes('panda.sa') ||
            hostname.includes('danube') ||
            hostname.includes('xcite.com') ||
            hostname.includes('aldawaa') ||
            hostname.includes('alnahdi') ||
            hostname.includes('styli.') ||
            hostname.includes('vogacloset') ||
            hostname.includes('6thstreet') ||
            hostname.includes('nisnass') ||
            hostname.includes('vipbrands') ||
            hostname.includes('brandatt') ||
            hostname.includes('tamimi') ||
            hostname.includes('luluhypermarket') ||

            // === Asian Platforms ===
            hostname.includes('shopee.') || // shopee.sg, shopee.my, etc.
            hostname.includes('lazada.') || // lazada.sg, lazada.com.my, etc.
            hostname.includes('tokopedia.com') ||
            hostname.includes('bukalapak.com') ||
            hostname.includes('blibli.com') ||
            hostname.includes('alibaba.com') ||
            hostname.includes('aliexpress.com') ||
            hostname.includes('taobao.com') ||
            hostname.includes('tmall.com') ||
            hostname.includes('jd.com') ||
            hostname.includes('pinduoduo.com') ||
            hostname.includes('rakuten.') || // rakuten.co.jp, rakuten.com, etc.
            hostname.includes('amazon.') || // amazon.com, amazon.ae, amazon.sa, etc.
            hostname.includes('flipkart.com') ||
            hostname.includes('myntra.com') ||
            hostname.includes('snapdeal.com') ||
            hostname.includes('meesho.com') ||
            hostname.includes('shein.com') ||
            hostname.includes('temu.com') ||

            // === European Platforms ===
            hostname.includes('zalando.') || // zalando.de, zalando.co.uk, etc.
            hostname.includes('otto.de') ||
            hostname.includes('aboutyou.') ||
            hostname.includes('bol.com') ||
            hostname.includes('allegro.pl') ||
            hostname.includes('ozon.ru') ||
            hostname.includes('wildberries.ru') ||
            hostname.includes('cdiscount.com') ||
            hostname.includes('fnac.com') ||
            hostname.includes('elcorteingles.es') ||
            hostname.includes('asos.com') ||
            hostname.includes('boohoo.com') ||
            hostname.includes('prettylittlething.com') ||

            // === Americas Platforms ===
            hostname.includes('mercadolibre.') || // mercadolibre.com.ar, mercadolibre.com.mx, etc.
            hostname.includes('mercadolivre.com.br') ||
            hostname.includes('etsy.com') ||
            hostname.includes('ebay.') || // ebay.com, ebay.co.uk, etc.
            hostname.includes('walmart.') ||
            hostname.includes('target.com') ||
            hostname.includes('bestbuy.com') ||
            hostname.includes('wayfair.com') ||
            hostname.includes('overstock.com') ||
            hostname.includes('newegg.com') ||
            hostname.includes('homedepot.com') ||
            hostname.includes('lowes.com') ||
            hostname.includes('costco.com') ||
            hostname.includes('samsclub.com') ||

            // === URL Path patterns indicating e-commerce ===
            pathname.includes('/shop') ||
            pathname.includes('/store') ||
            pathname.includes('/products') ||
            pathname.includes('/product/') ||
            pathname.includes('/cart') ||
            pathname.includes('/checkout') ||
            pathname.includes('/collection') ||
            pathname.includes('/collections') ||
            pathname.includes('/catalog') ||
            pathname.includes('/buy') ||
            pathname.includes('/order') ||
            pathname.includes('/basket')
        ) {
            result = {
                type: 'store',
                url: normalizedUrl,
                suggestedCampaignType: 'SHOPPING',
                details: {
                    name: 'E-commerce Store'
                }
            };
        }
        // 7. Default: Check if it's a store via HTML analysis (runs async for speed)
        else {
            // First return quick result, then optionally detect via HTML
            // For immediate response, assume website; smart detection happens in background

            // Try fast HTML detection (3s timeout)
            const htmlDetection = await detectStoreFromHTML(normalizedUrl);

            if (htmlDetection.isStore) {
                result = {
                    type: 'store',
                    url: normalizedUrl,
                    suggestedCampaignType: 'SHOPPING',
                    details: {
                        name: 'E-commerce Store',
                        storePlatform: htmlDetection.platform
                    }
                };
            } else {
                result = {
                    type: 'website',
                    url: normalizedUrl,
                    suggestedCampaignType: 'SEARCH',
                    details: {
                        name: hostname
                    }
                };
            }
        }

        return NextResponse.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('URL detection error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to detect URL type',
                type: 'website',
                suggestedCampaignType: 'SEARCH'
            },
            { status: 500 }
        );
    }
}

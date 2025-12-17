import { NextRequest, NextResponse } from 'next/server';

interface AppResult {
    id: string;
    name: string;
    icon: string;
    developer: string;
    packageName: string;
    platform: 'android' | 'ios';
    rating?: number;
    downloads?: string;
    category?: string;
}

// Fetch real iOS app data from iTunes Search API
async function fetchIOSAppData(appId: string): Promise<AppResult | null> {
    try {
        const response = await fetch(
            `https://itunes.apple.com/lookup?id=${appId}&country=us`,
            { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const app = data.results[0];
                return {
                    id: String(app.trackId),
                    name: app.trackName || 'iOS App',
                    icon: app.artworkUrl512 || app.artworkUrl100 || app.artworkUrl60 || '',
                    developer: app.sellerName || app.artistName || 'Developer',
                    packageName: app.bundleId || String(app.trackId),
                    platform: 'ios',
                    rating: app.averageUserRating || 0,
                    downloads: app.userRatingCount ? `${(app.userRatingCount / 1000).toFixed(0)}K+` : '1K+',
                    category: app.primaryGenreName || 'App'
                };
            }
        }
    } catch (error) {
        console.error('Error fetching iOS app data:', error);
    }
    return null;
}

// Search iOS apps by name
async function searchIOSApps(query: string): Promise<AppResult[]> {
    try {
        const response = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=software&limit=15`,
            { next: { revalidate: 3600 } }
        );

        if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                return data.results.map((app: any) => ({
                    id: String(app.trackId),
                    name: app.trackName || 'iOS App',
                    icon: app.artworkUrl512 || app.artworkUrl100 || app.artworkUrl60 || '',
                    developer: app.sellerName || app.artistName || 'Developer',
                    packageName: app.bundleId || String(app.trackId),
                    platform: 'ios' as const,
                    rating: app.averageUserRating || 0,
                    downloads: app.userRatingCount ? `${(app.userRatingCount / 1000).toFixed(0)}K+` : '1K+',
                    category: app.primaryGenreName || 'App'
                }));
            }
        }
    } catch (error) {
        console.error('Error searching iOS apps:', error);
    }
    return [];
}

// Fetch iOS app by bundle ID (com.xxx.yyy format)
async function fetchIOSAppByBundleId(bundleId: string): Promise<AppResult | null> {
    try {
        const response = await fetch(
            `https://itunes.apple.com/lookup?bundleId=${bundleId}&country=us`,
            { next: { revalidate: 3600 } }
        );

        if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const app = data.results[0];
                return {
                    id: String(app.trackId),
                    name: app.trackName || 'iOS App',
                    icon: app.artworkUrl512 || app.artworkUrl100 || app.artworkUrl60 || '',
                    developer: app.sellerName || app.artistName || 'Developer',
                    packageName: app.bundleId || bundleId,
                    platform: 'ios',
                    rating: app.averageUserRating || 0,
                    downloads: app.userRatingCount ? `${(app.userRatingCount / 1000).toFixed(0)}K+` : '1K+',
                    category: app.primaryGenreName || 'App'
                };
            }
        }
    } catch (error) {
        console.error('Error fetching iOS app by bundle ID:', error);
    }
    return null;
}

// Search Android apps by name using Google Play search
async function searchAndroidApps(query: string): Promise<AppResult[]> {
    try {
        // Use Google Play Store search page
        const response = await fetch(
            `https://play.google.com/store/search?q=${encodeURIComponent(query)}&c=apps&hl=en&gl=US`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': 'en-US,en;q=0.9',
                }
            }
        );

        if (response.ok) {
            const html = await response.text();

            // Extract unique package names from search results
            const packagePattern = /\/store\/apps\/details\?id=([a-zA-Z0-9_\.]+)/g;
            const foundPackages: string[] = [];
            let match;

            while ((match = packagePattern.exec(html)) !== null && foundPackages.length < 15) {
                const pkg = match[1];
                if (!foundPackages.includes(pkg)) {
                    foundPackages.push(pkg);
                }
            }

            // Fetch real data for each package in PARALLEL for speed
            const fetchPromises = foundPackages.slice(0, 8).map(pkg => fetchAndroidAppData(pkg));
            const results = await Promise.allSettled(fetchPromises);

            const apps: AppResult[] = [];
            for (const result of results) {
                if (result.status === 'fulfilled' && result.value) {
                    apps.push(result.value);
                }
            }

            return apps;
        }
    } catch (error) {
        console.error('Error searching Android apps:', error);
    }
    return [];
}

// Fetch real Android app data from Google Play Store page
async function fetchAndroidAppData(packageName: string, language: string = 'en'): Promise<AppResult | null> {
    try {
        // Use the provided language for accurate regional rating
        console.log(`📱 Fetching Play Store data for ${packageName} with language: ${language}`);
        const response = await fetch(
            `https://play.google.com/store/apps/details?id=${packageName}&hl=${language}&gl=US`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': `${language},en;q=0.9`,
                }
            }
        );

        if (response.ok) {
            const html = await response.text();

            // Try multiple patterns for app name
            let appName = packageName;
            const titlePatterns = [
                /<meta\s+property="og:title"\s+content="([^"]+)"/i,
                /<meta\s+content="([^"]+)"\s+property="og:title"/i,
                /<title>([^<]+)<\/title>/i,
                /itemprop="name"[^>]*>([^<]+)</i
            ];

            for (const pattern of titlePatterns) {
                const match = html.match(pattern);
                if (match && match[1]) {
                    appName = match[1].replace(' - Apps on Google Play', '').replace(' - التطبيقات على Google Play', '').trim();
                    break;
                }
            }

            // Try multiple patterns for icon URL
            let iconUrl = '';

            // Pattern 1: Try og:image meta tag (most reliable)
            const ogImagePatterns = [
                /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i,
                /<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i,
                /property="og:image"\s+content="([^"]+)"/i,
                /content="([^"]+)"\s+property="og:image"/i,
            ];
            for (const pattern of ogImagePatterns) {
                const match = html.match(pattern);
                if (match && match[1] && (match[1].includes('googleusercontent') || match[1].includes('play-lh'))) {
                    iconUrl = match[1];
                    break;
                }
            }

            // Pattern 2: Find play-lh.googleusercontent.com URLs directly in page
            if (!iconUrl) {
                // More permissive regex - captures the full URL including query params
                const allPlayLhUrls = html.match(/https:\/\/play-lh\.googleusercontent\.com\/[^\s"'<>]+/g);
                if (allPlayLhUrls && allPlayLhUrls.length > 0) {
                    // Filter out screenshots and keyboard images, prefer shorter URLs (icons)
                    const validUrls = allPlayLhUrls.filter(u =>
                        !u.includes('screenshot') &&
                        !u.includes('keyboard') &&
                        u.length < 200
                    );
                    if (validUrls.length > 0) {
                        iconUrl = validUrls[0];
                    }
                }
            }

            // Ensure high quality icon
            if (iconUrl) {
                console.log(`🖼️ Raw icon URL found: ${iconUrl.substring(0, 80)}...`);
                // Clean up the URL - remove any trailing special chars and set quality
                // Google Play uses format like: https://play-lh.googleusercontent.com/xxxx=w256-h256-rw
                if (iconUrl.includes('play-lh.googleusercontent.com') || iconUrl.includes('googleusercontent.com')) {
                    // Find the base URL part (before any size params)
                    const baseUrl = iconUrl.replace(/=w\d+-h\d+.*$/i, '').replace(/=s\d+.*$/i, '');
                    iconUrl = baseUrl + '=w256-h256-rw';
                }
                console.log(`🖼️ Final icon URL: ${iconUrl.substring(0, 80)}...`);
            } else {
                console.log(`⚠️ No icon URL found for ${packageName}`);
            }

            // If not found, try og:image patterns
            if (!iconUrl) {
                const iconPatterns = [
                    /<meta\s+property="og:image"\s+content="([^"]+)"/i,
                    /<meta\s+content="([^"]+)"\s+property="og:image"/i,
                    /itemprop="image"[^>]*content="([^"]+)"/i,
                    /"url":"(https:\/\/play-lh\.googleusercontent\.com\/[^"]+)"/,
                ];

                for (const pattern of iconPatterns) {
                    const match = html.match(pattern);
                    if (match && match[1]) {
                        iconUrl = match[1];
                        // Ensure high quality icon
                        if (iconUrl.includes('=')) {
                            iconUrl = iconUrl.split('=')[0] + '=w256-h256-rw';
                        } else {
                            iconUrl = iconUrl + '=w256-h256-rw';
                        }
                        break;
                    }
                }
            }

            // Try to find developer from page content
            const devMatch = html.match(/<a[^>]*href="\/store\/apps\/developer\?id=[^"]*"[^>]*>([^<]+)<\/a>/i) ||
                html.match(/<a[^>]*href="\/store\/apps\/dev\?id=[^"]*"[^>]*>([^<]+)<\/a>/i);

            // Extract rating - Google Play shows "4.3 star 16.7M reviews 100M+ Downloads" pattern
            let rating = 0;

            // DEBUG: Log all rating patterns found in HTML
            const allRatingsFound = html.match(/(\d\.\d)\s*star/gi);
            console.log('🔍 DEBUG: All "X.X star" in HTML:', allRatingsFound);

            // Priority 1: Extract from visible text "X.X star" - THIS IS WHAT USER SEES
            // Take the FIRST occurrence which is usually the main app's rating
            if (allRatingsFound && allRatingsFound.length > 0) {
                const firstRating = allRatingsFound[0].match(/(\d\.\d)/);
                if (firstRating && firstRating[1]) {
                    rating = parseFloat(firstRating[1]);
                    console.log(`⭐ Found rating from visible text: ${rating}`);
                }
            }

            // Priority 2: Fallback to structured data (may have raw precision like 4.408)
            if (rating === 0) {
                const structuredRatingPatterns = [
                    /content="([\d.]+)"[^>]*itemprop="ratingValue"/i,
                    /itemprop="ratingValue"[^>]*content="([\d.]+)"/i,
                    /"ratingValue":\s*"?([\d.]+)"?/i,
                    /aria-label="[^"]*Rated\s*([\d.]+)/i,
                ];

                for (const pattern of structuredRatingPatterns) {
                    const match = html.match(pattern);
                    if (match && match[1]) {
                        const parsed = parseFloat(match[1]);
                        console.log(`🔍 Pattern matched: ${pattern} -> ${parsed}`);
                        if (parsed > 0 && parsed <= 5) {
                            rating = Math.round(parsed * 10) / 10; // Round to 1 decimal
                            console.log(`⭐ Found rating from structured data: ${rating}`);
                            break;
                        }
                    }
                }
            }

            // Priority 1.5: Look for "X.X star" patterns and pick the HIGHEST one (main app usually has highest rating)
            if (rating === 0) {
                console.log('🔍 Searching for rating patterns in HTML...');

                // Pattern 1: ">X.X star" format
                const allRatingMatches = [...html.matchAll(/>([\d]\.[0-9])\s*star/gi)];
                console.log(`   Found ${allRatingMatches.length} ">X.X star" patterns`);

                // Pattern 2: "★X.X" or "X.X★" format
                const starSymbolMatches = [...html.matchAll(/([\d]\.[0-9])\s*★|★\s*([\d]\.[0-9])/gi)];
                console.log(`   Found ${starSymbolMatches.length} "★X.X" patterns`);

                // Pattern 3: Look in text like "4.8star" directly
                const directMatches = [...html.matchAll(/(\d\.\d)star/gi)];
                console.log(`   Found ${directMatches.length} "X.Xstar" direct patterns`);

                let highestRating = 0;

                // Check all patterns
                for (const match of allRatingMatches) {
                    const parsed = parseFloat(match[1]);
                    console.log(`   Pattern 1 found: ${parsed}`);
                    if (parsed >= 1 && parsed <= 5 && parsed > highestRating) {
                        highestRating = parsed;
                    }
                }

                for (const match of starSymbolMatches) {
                    const value = match[1] || match[2];
                    if (value) {
                        const parsed = parseFloat(value);
                        console.log(`   Pattern 2 found: ${parsed}`);
                        if (parsed >= 1 && parsed <= 5 && parsed > highestRating) {
                            highestRating = parsed;
                        }
                    }
                }

                for (const match of directMatches) {
                    const parsed = parseFloat(match[1]);
                    console.log(`   Pattern 3 found: ${parsed}`);
                    if (parsed >= 1 && parsed <= 5 && parsed > highestRating) {
                        highestRating = parsed;
                    }
                }

                if (highestRating > 0) {
                    rating = highestRating;
                    console.log(`⭐ Selected HIGHEST rating: ${rating}`);
                } else {
                    console.log('⚠️ No rating patterns found');
                }
            }

            // Priority 2: Strip JavaScript and get cleaner text for text-based extraction
            const cleanerHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
            const textContent = cleanerHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

            if (rating === 0) {

                // Find ALL "X.X star X.XM reviews" patterns and pick the one with highest review count
                const ratingPattern = /(\d+\.?\d*)\s*star\s+([\d.]+)([MKB])\s*reviews/gi;
                const allMatches = [...textContent.matchAll(ratingPattern)];

                if (allMatches.length > 0) {
                    console.log(`📊 Found ${allMatches.length} rating patterns`);

                    // Find the match with the highest review count
                    let bestMatch = allMatches[0];
                    let maxReviews = 0;

                    for (const match of allMatches) {
                        const reviewNum = parseFloat(match[2]);
                        const suffix = match[3].toUpperCase();
                        // Convert to absolute number for comparison
                        let reviews = reviewNum;
                        if (suffix === 'B') reviews *= 1000000000;
                        else if (suffix === 'M') reviews *= 1000000;
                        else if (suffix === 'K') reviews *= 1000;

                        console.log(`   Found: ${match[1]} star ${match[2]}${match[3]} reviews (${reviews} total)`);

                        if (reviews > maxReviews) {
                            maxReviews = reviews;
                            bestMatch = match;
                        }
                    }

                    const parsed = parseFloat(bestMatch[1]);
                    if (parsed > 0 && parsed <= 5) {
                        rating = parsed;
                        console.log(`⭐ Selected rating: ${rating} (${bestMatch[2]}${bestMatch[3]} reviews - highest count)`);
                    }
                }
            }

            // Fallback: Look for just "X.X star" but validate it's a reasonable rating
            if (rating === 0) {
                const simpleStarMatch = textContent.match(/(\d+\.\d)\s*star/i);
                if (simpleStarMatch && simpleStarMatch[1]) {
                    const parsed = parseFloat(simpleStarMatch[1]);
                    if (parsed >= 1 && parsed <= 5) {
                        rating = parsed;
                        console.log('⭐ Found rating from simple star pattern:', rating);
                    }
                }
            }

            // Fallback to HTML structured data patterns
            if (rating === 0) {
                const ratingPatterns = [
                    /aria-label="Rated\s*([\d.,]+)\s*(?:out|stars)/i,
                    /content="([\d.]+)"[^>]*itemprop="ratingValue"/i,
                    /"ratingValue":\s*"?([\d.]+)"?/,
                    /"aggregateRating"[^}]*"ratingValue":\s*"?([\d.]+)"?/,
                ];
                for (const pattern of ratingPatterns) {
                    const match = html.match(pattern);
                    if (match && match[1]) {
                        const parsed = parseFloat(match[1].replace(',', '.'));
                        if (parsed > 0 && parsed <= 5) {
                            rating = parsed;
                            console.log('⭐ Found rating from HTML structured data:', rating);
                            break;
                        }
                    }
                }
            }

            // Extract downloads count - Google Play shows "100M+ Downloads" format
            let downloads = '1M+';

            // Pattern: "100M+ Downloads" in text
            const downloadsTextMatch = textContent.match(/(\d+[KMB]+\+?)\s*Downloads/i);
            if (downloadsTextMatch && downloadsTextMatch[1]) {
                downloads = downloadsTextMatch[1];
                console.log('📥 Found downloads from text:', downloads);
            } else {
                // Fallback patterns
                const downloadsPatterns = [
                    /(\d+[,\d]*[KMB]+\+?)\s*(?:downloads|تنزيل)/i,
                    /aria-label="[^"]*(\d+[KMB]+\+?)\s*downloads/i,
                    /"numDownloads":\s*"([^"]+)"/,
                ];
                for (const pattern of downloadsPatterns) {
                    const match = html.match(pattern);
                    if (match && match[1]) {
                        downloads = match[1].replace(/\s+/g, '');
                        console.log('📥 Found downloads from HTML:', downloads);
                        break;
                    }
                }
            }

            console.log('📱 Final extraction:', { name: appName, rating, downloads, iconUrl: iconUrl || 'NOT FOUND' });

            // Extract category
            let category = 'App';
            const categoryMatch = html.match(/itemprop="genre"[^>]*>([^<]+)</i) ||
                html.match(/<a[^>]*href="\/store\/apps\/category\/[^"]*"[^>]*>([^<]+)</i);
            if (categoryMatch && categoryMatch[1]) {
                category = categoryMatch[1].trim();
            }

            // Return result even if we only got the name
            if (appName !== packageName || iconUrl) {
                return {
                    id: packageName,
                    name: appName,
                    icon: iconUrl,
                    developer: devMatch && devMatch[1] ? devMatch[1].trim() : 'Google Play',
                    packageName: packageName,
                    platform: 'android',
                    rating: rating,
                    downloads: downloads,
                    category: category
                };
            }
        }
    } catch (error) {
        console.error('Error fetching Android app data:', error);
    }
    return null;
}

// Try to extract app name from package name (for Android fallback)
function extractAppNameFromPackage(packageName: string): string {
    // com.testa.databot -> Databot
    // com.google.android.apps.maps -> Maps
    const parts = packageName.split('.');
    const lastPart = parts[parts.length - 1];
    // Capitalize first letter
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
}

export async function POST(request: NextRequest) {
    try {
        const { query, platform } = await request.json();

        if (!query) {
            return NextResponse.json(
                { error: 'Search query is required' },
                { status: 400 }
            );
        }

        let apps: AppResult[] = [];

        // Android apps - Fetch real data from Google Play Store
        if (platform === 'android' || !platform) {
            if (query.includes('play.google.com') || query.includes('com.')) {
                // Extract package name from URL or use as-is
                let packageName = query;
                if (query.includes('play.google.com')) {
                    const match = query.match(/id=([^&]+)/);
                    if (match) {
                        packageName = match[1];
                    }
                }

                // Clean package name
                packageName = packageName.replace(/https?:\/\//g, '').trim();

                // Extract language from URL if available (e.g., hl=ar, hl=en)
                let urlLanguage = 'en'; // default
                const hlMatch = query.match(/[?&]hl=([a-z]{2})/i);
                if (hlMatch && hlMatch[1]) {
                    urlLanguage = hlMatch[1].toLowerCase();
                    console.log(`🌐 Using language from URL: ${urlLanguage}`);
                }

                // Try to fetch real app data from Google Play Store with correct language
                const androidApp = await fetchAndroidAppData(packageName, urlLanguage);

                if (androidApp) {
                    apps.push(androidApp);
                } else {
                    // Fallback: format app name from package name
                    const appName = extractAppNameFromPackage(packageName);
                    const formattedName = appName
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, c => c.toUpperCase());

                    apps.push({
                        id: packageName,
                        name: formattedName,
                        icon: '',
                        developer: 'Google Play',
                        packageName: packageName,
                        platform: 'android'
                    });
                }
            } else {
                // Generic Android search by name - search Google Play
                const searchResults = await searchAndroidApps(query);

                if (searchResults.length > 0) {
                    apps.push(...searchResults);
                } else {
                    // Fallback if search fails
                    const formattedName = query
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, c => c.toUpperCase());

                    apps.push({
                        id: `com.${query.toLowerCase().replace(/\s+/g, '.')}`,
                        name: formattedName,
                        icon: '',
                        developer: 'Google Play',
                        packageName: `com.${query.toLowerCase().replace(/\s+/g, '.')}`,
                        platform: 'android'
                    });
                }
            }
        }

        // iOS apps - Use iTunes API for real data
        if (platform === 'ios' || !platform) {
            // Check if query is a numeric ID (direct lookup)
            const isNumericId = /^\d+$/.test(query.trim());

            if (query.includes('apps.apple.com') || query.includes('itunes.apple.com')) {
                // Extract app ID from URL
                const idMatch = query.match(/\/id(\d+)/);
                if (idMatch) {
                    const appId = idMatch[1];
                    // Fetch real app data from iTunes API
                    const iosApp = await fetchIOSAppData(appId);
                    if (iosApp) {
                        apps.push(iosApp);
                    } else {
                        // Fallback if fetch fails
                        apps.push({
                            id: appId,
                            name: 'iOS App',
                            icon: '',
                            developer: 'Developer',
                            packageName: appId,
                            platform: 'ios'
                        });
                    }
                }
            } else if (isNumericId) {
                // Query is a numeric App ID - use lookup directly
                const iosApp = await fetchIOSAppData(query.trim());
                if (iosApp) {
                    apps.push(iosApp);
                } else {
                    apps.push({
                        id: query.trim(),
                        name: 'iOS App',
                        icon: '',
                        developer: 'Developer',
                        packageName: query.trim(),
                        platform: 'ios'
                    });
                }
            } else if (query.includes('com.') || query.includes('net.') || query.includes('org.')) {
                // Query looks like a bundle ID - try to fetch by bundle ID
                const iosApp = await fetchIOSAppByBundleId(query.trim());
                if (iosApp) {
                    apps.push(iosApp);
                } else {
                    // Fallback if bundle ID not found
                    apps.push({
                        id: query.trim(),
                        name: query.split('.').pop() || 'iOS App',
                        icon: '',
                        developer: 'Developer',
                        packageName: query.trim(),
                        platform: 'ios'
                    });
                }
            } else {
                // Search iOS apps by name using iTunes API
                const iosResults = await searchIOSApps(query);
                if (iosResults.length > 0) {
                    apps.push(...iosResults);
                } else {
                    // Fallback
                    apps.push({
                        id: query.replace(/\s+/g, '-').toLowerCase(),
                        name: query,
                        icon: '',
                        developer: 'Search',
                        packageName: query.replace(/\s+/g, '-').toLowerCase(),
                        platform: 'ios'
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            apps: apps,
            total: apps.length,
            platform: platform || 'all'
        });

    } catch (error) {
        console.error('App search error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to search apps',
                apps: []
            },
            { status: 500 }
        );
    }
}

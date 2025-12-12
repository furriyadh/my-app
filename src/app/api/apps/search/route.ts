import { NextRequest, NextResponse } from 'next/server';

interface AppResult {
    id: string;
    name: string;
    icon: string;
    developer: string;
    packageName: string;
    platform: 'android' | 'ios';
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
                    platform: 'ios'
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
                    platform: 'ios' as const
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
                    platform: 'ios'
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

            // Fetch real data for each package
            const apps: AppResult[] = [];
            for (const pkg of foundPackages.slice(0, 10)) { // Limit to 10 for speed
                const appData = await fetchAndroidAppData(pkg);
                if (appData) {
                    apps.push(appData);
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
async function fetchAndroidAppData(packageName: string): Promise<AppResult | null> {
    try {
        const response = await fetch(
            `https://play.google.com/store/apps/details?id=${packageName}&hl=en&gl=US`,
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

            // Try multiple patterns for icon URL - prioritize play-lh URLs
            let iconUrl = '';

            // First, try to find any play-lh.googleusercontent.com URL in the page
            const playLhMatch = html.match(/https:\/\/play-lh\.googleusercontent\.com\/[a-zA-Z0-9_\-\/]+/g);
            if (playLhMatch && playLhMatch.length > 0) {
                // Get the first valid icon URL (usually the app icon)
                for (const url of playLhMatch) {
                    if (!url.includes('keyboard') && !url.includes('screenshot')) {
                        iconUrl = url + '=w256-h256-rw';
                        break;
                    }
                }
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

            // Return result even if we only got the name
            if (appName !== packageName || iconUrl) {
                return {
                    id: packageName,
                    name: appName,
                    icon: iconUrl,
                    developer: devMatch && devMatch[1] ? devMatch[1].trim() : 'Google Play',
                    packageName: packageName,
                    platform: 'android'
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

                // Try to fetch real app data from Google Play Store
                const androidApp = await fetchAndroidAppData(packageName);

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

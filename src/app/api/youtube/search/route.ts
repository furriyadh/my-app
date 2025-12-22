import { NextRequest, NextResponse } from 'next/server';

interface VideoResult {
    id: string;
    title: string;
    channelTitle: string;
    thumbnail: string;
    publishedAt: string;
    viewCount: string;
    description: string;
}

// Extract Video ID from Various YouTube URL Formats
function extractVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Fetch Single Video Data using YouTube oEmbed + Page Scraping for View Count
async function fetchVideoViaOEmbed(videoId: string): Promise<VideoResult | null> {
    try {
        // 1. Get basic info via oEmbed (title, channel, thumbnail)
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

        const oembedResponse = await fetch(oembedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            }
        });

        if (!oembedResponse.ok) {
            console.error('oEmbed fetch failed:', oembedResponse.status);
            return null;
        }

        const oembedData = await oembedResponse.json();

        // 2. Scrape the video page for view count
        let viewCount = '0';
        try {
            const videoPageUrl = `https://www.youtube.com/watch?v=${videoId}`;
            const pageResponse = await fetch(videoPageUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': 'en-US,en;q=0.9',
                }
            });

            if (pageResponse.ok) {
                const html = await pageResponse.text();

                // Try to extract view count from ytInitialPlayerResponse or ytInitialData
                const viewCountMatch = html.match(/"viewCount":"(\d+)"/) ||
                    html.match(/"viewCount":\s*"(\d+)"/) ||
                    html.match(/(\d[\d,]*)\s*views/i);

                if (viewCountMatch && viewCountMatch[1]) {
                    viewCount = viewCountMatch[1].replace(/,/g, '');
                    console.log(`✅ Extracted view count: ${viewCount}`);
                }
            }
        } catch (scrapeError) {
            console.error('Error scraping view count:', scrapeError);
        }

        return {
            id: videoId,
            title: oembedData.title || 'Video',
            channelTitle: oembedData.author_name || 'Unknown',
            thumbnail: oembedData.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            publishedAt: '',
            viewCount: viewCount,
            description: ''
        };
    } catch (error) {
        console.error('Error fetching via oEmbed:', error);
    }
    return null;
}

// Scrape YouTube Search Results (Similar to App Search Approach)
async function searchYouTubeVideos(query: string): Promise<VideoResult[]> {
    try {
        console.log(`🔍 Scraping YouTube search for: "${query}"`);

        // Use YouTube search page
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });

        if (!response.ok) {
            console.error('YouTube search fetch failed:', response.status);
            return [];
        }

        const html = await response.text();

        // Extract video data from ytInitialData JSON embedded in page
        const ytInitialDataMatch = html.match(/var ytInitialData = ({.*?});<\/script>/s);

        if (ytInitialDataMatch) {
            try {
                const ytData = JSON.parse(ytInitialDataMatch[1]);
                const contents = ytData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;

                if (contents && Array.isArray(contents)) {
                    const videos: VideoResult[] = [];

                    for (const item of contents) {
                        if (item.videoRenderer && videos.length < 10) {
                            const video = item.videoRenderer;
                            videos.push({
                                id: video.videoId,
                                title: video.title?.runs?.[0]?.text || 'Video',
                                channelTitle: video.ownerText?.runs?.[0]?.text || 'Channel',
                                thumbnail: video.thumbnail?.thumbnails?.[video.thumbnail?.thumbnails?.length - 1]?.url || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
                                publishedAt: video.publishedTimeText?.simpleText || '',
                                viewCount: video.viewCountText?.simpleText?.replace(/[^0-9]/g, '') || '0',
                                description: video.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map((r: any) => r.text).join('') || ''
                            });
                        }
                    }

                    console.log(`✅ Found ${videos.length} videos via scraping`);
                    return videos;
                }
            } catch (parseError) {
                console.error('Error parsing ytInitialData:', parseError);
            }
        }

        // Fallback: Extract video IDs with regex
        const videoIdPattern = /\/watch\?v=([a-zA-Z0-9_-]{11})/g;
        const foundIds: string[] = [];
        let match;

        while ((match = videoIdPattern.exec(html)) !== null && foundIds.length < 10) {
            if (!foundIds.includes(match[1])) {
                foundIds.push(match[1]);
            }
        }

        console.log(`📹 Found ${foundIds.length} video IDs via regex fallback`);

        // Fetch details for each video via oEmbed
        const videos: VideoResult[] = [];
        for (const id of foundIds) {
            const video = await fetchVideoViaOEmbed(id);
            if (video) {
                videos.push(video);
            }
        }

        return videos;

    } catch (error) {
        console.error('Error in searchYouTubeVideos:', error);
        return [];
    }
}

export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        let videos: VideoResult[] = [];

        // 1. Check if query is a YouTube URL => Extract Video ID
        const urlId = extractVideoId(query);
        if (urlId) {
            console.log(`🎥 Detected YouTube URL, fetching ID: ${urlId}`);
            const video = await fetchVideoViaOEmbed(urlId);
            if (video) {
                videos = [video];
            }
        } else {
            // 2. It's a text search => Scrape YouTube Search
            videos = await searchYouTubeVideos(query);
        }

        return NextResponse.json({
            success: true,
            videos: videos,
            total: videos.length
        });

    } catch (error) {
        console.error('❌ Error in YouTube Search API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

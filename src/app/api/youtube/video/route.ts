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

export async function POST(request: NextRequest) {
    try {
        const { videoId } = await request.json();

        if (!videoId) {
            return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
        }

        console.log(`🎥 Fetching single video by ID: ${videoId}`);
        const video = await fetchVideoViaOEmbed(videoId);

        if (video) {
            return NextResponse.json({
                success: true,
                video: video
            });
        } else {
            return NextResponse.json({
                success: false,
                error: 'Video not found'
            }, { status: 404 });
        }

    } catch (error) {
        console.error('❌ Error in YouTube Video API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

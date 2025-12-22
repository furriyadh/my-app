import { NextRequest, NextResponse } from 'next/server';

interface VideoMetadata {
    id: string;
    title: string;
    description: string;
    channelTitle: string;
    channelId: string;
    thumbnailUrl: string;
    publishedAt: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    duration: string;
    tags: string[];
    categoryId: string;
    categoryName: string;
    defaultLanguage: string;
    detectedLanguage: string;
    defaultAudioLanguage: string;
    liveBroadcastContent: string;
}

// YouTube video category mapping
const YOUTUBE_CATEGORIES: { [key: string]: string } = {
    '1': 'Film & Animation',
    '2': 'Autos & Vehicles',
    '10': 'Music',
    '15': 'Pets & Animals',
    '17': 'Sports',
    '18': 'Short Movies',
    '19': 'Travel & Events',
    '20': 'Gaming',
    '21': 'Videoblogging',
    '22': 'People & Blogs',
    '23': 'Comedy',
    '24': 'Entertainment',
    '25': 'News & Politics',
    '26': 'Howto & Style',
    '27': 'Education',
    '28': 'Science & Technology',
    '29': 'Nonprofits & Activism',
    '30': 'Movies',
    '31': 'Anime/Animation',
    '32': 'Action/Adventure',
    '33': 'Classics',
    '34': 'Comedy',
    '35': 'Documentary',
    '36': 'Drama',
    '37': 'Family',
    '38': 'Foreign',
    '39': 'Horror',
    '40': 'Sci-Fi/Fantasy',
    '41': 'Thriller',
    '42': 'Shorts',
    '43': 'Shows',
    '44': 'Trailers',
};

// Detect language from text - supports multiple languages
function detectLanguage(text: string): string {
    if (!text) return 'unknown';

    const lowerText = text.toLowerCase();

    // Arabic detection (includes Urdu, Persian, Pashto scripts)
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    if (arabicRegex.test(text)) return 'ar';

    // Hebrew detection
    const hebrewRegex = /[\u0590-\u05FF]/;
    if (hebrewRegex.test(text)) return 'he';

    // Chinese detection (Simplified & Traditional)
    const chineseRegex = /[\u4E00-\u9FFF\u3400-\u4DBF]/;
    if (chineseRegex.test(text)) return 'zh';

    // Japanese detection (Hiragana, Katakana, Kanji)
    const japaneseRegex = /[\u3040-\u30FF\u31F0-\u31FF]/;
    if (japaneseRegex.test(text)) return 'ja';

    // Korean detection (Hangul)
    const koreanRegex = /[\uAC00-\uD7AF\u1100-\u11FF]/;
    if (koreanRegex.test(text)) return 'ko';

    // Russian/Cyrillic detection
    const cyrillicRegex = /[\u0400-\u04FF]/;
    if (cyrillicRegex.test(text)) return 'ru';

    // Greek detection
    const greekRegex = /[\u0370-\u03FF]/;
    if (greekRegex.test(text)) return 'el';

    // Hindi/Devanagari detection
    const hindiRegex = /[\u0900-\u097F]/;
    if (hindiRegex.test(text)) return 'hi';

    // Thai detection
    const thaiRegex = /[\u0E00-\u0E7F]/;
    if (thaiRegex.test(text)) return 'th';

    // ============================================================
    // LATIN-BASED LANGUAGES - Order matters! More specific first
    // ============================================================

    // French detection - BEFORE Vietnamese because 'à' is shared
    // Use unique French characters and common French words
    const frenchCharsRegex = /[éèêëçœûùï]/i;  // Unique French characters
    const frenchWords = ['le', 'la', 'les', 'de', 'des', 'un', 'une', 'et', 'est', 'en', 'que', 'pour', 'dans', 'sur', 'avec', 'pas', 'plus', 'tout', 'comme', 'mais', "l'", "d'", 'à', 'ou', 'heure', 'débutant', 'expert', 'formation', 'cours', 'gratuit'];
    const frenchWordCount = frenchWords.filter(word =>
        lowerText.includes(` ${word} `) ||
        lowerText.includes(`${word}'`) ||
        lowerText.includes(` ${word}`) ||
        lowerText.startsWith(`${word} `)
    ).length;
    if (frenchCharsRegex.test(text) && frenchWordCount >= 1) return 'fr';
    if (frenchWordCount >= 2) return 'fr';

    // Vietnamese detection - use ONLY unique Vietnamese chars (not shared with French)
    const vietnameseRegex = /[ăđơưảẩẫậắằẳẵặẻẽẹếềểễệỉĩịỏốồổỗộớờởỡợủũụứừửữự]/i;
    if (vietnameseRegex.test(text)) return 'vi';

    // Turkish detection
    const turkishWords = ['ve', 'bir', 'bu', 'için', 'ile', 'olan', 'nasıl', 'gibi', 'çok', 'daha'];
    const turkishChars = /[ğışöü]/i;
    if (turkishChars.test(text) || turkishWords.some(word => lowerText.includes(` ${word} `))) return 'tr';

    // German detection
    const germanCharsRegex = /[äöüß]/i;
    const germanWords = ['und', 'der', 'die', 'das', 'ist', 'nicht', 'ein', 'eine', 'mit', 'für', 'auf', 'werden'];
    if (germanCharsRegex.test(text) && germanWords.some(word => lowerText.includes(` ${word} `))) return 'de';
    if (germanWords.filter(word => lowerText.includes(` ${word} `)).length >= 2) return 'de';

    // Spanish detection
    const spanishCharsRegex = /[ñ¿¡]/i;
    const spanishWords = ['el', 'la', 'los', 'las', 'de', 'un', 'una', 'es', 'que', 'por', 'para', 'con', 'como', 'más', 'pero'];
    if (spanishCharsRegex.test(text)) return 'es';
    if (spanishWords.filter(word => lowerText.includes(` ${word} `)).length >= 2) return 'es';

    // Portuguese detection
    const portugueseCharsRegex = /[ãõç]/i;
    const portugueseWords = ['o', 'a', 'os', 'as', 'de', 'um', 'uma', 'é', 'que', 'por', 'para', 'com', 'como', 'não'];
    if (portugueseCharsRegex.test(text) && portugueseWords.some(word => lowerText.includes(` ${word} `))) return 'pt';
    if (portugueseWords.filter(word => lowerText.includes(` ${word} `)).length >= 2) return 'pt';

    // Italian detection
    const italianWords = ['il', 'la', 'le', 'di', 'un', 'una', 'è', 'che', 'per', 'con', 'come', 'non', 'sono'];
    if (italianWords.filter(word => lowerText.includes(` ${word} `)).length >= 2) return 'it';

    // Dutch detection
    const dutchWords = ['de', 'het', 'een', 'en', 'van', 'is', 'op', 'te', 'voor', 'met', 'dat', 'niet'];
    if (dutchWords.filter(word => lowerText.includes(` ${word} `)).length >= 2) return 'nl';

    // Polish detection
    const polishCharsRegex = /[ąćęłńóśźż]/i;
    const polishWords = ['i', 'w', 'na', 'do', 'z', 'się', 'jest', 'to', 'nie', 'że', 'jak', 'ale'];
    if (polishCharsRegex.test(text)) return 'pl';
    if (polishWords.filter(word => lowerText.includes(` ${word} `)).length >= 2) return 'pl';

    // Default to English if Latin characters present
    const latinRegex = /[a-zA-Z]/;
    if (latinRegex.test(text)) return 'en';

    return 'unknown';
}

// Parse ISO 8601 duration to readable format
function parseDuration(isoDuration: string): string {
    if (!isoDuration) return '0:00';

    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Fetch video metadata using YouTube Data API v3 with fetch
async function fetchVideoMetadataFromAPI(videoId: string): Promise<VideoMetadata | null> {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!apiKey) {
            console.log('⚠️ No YOUTUBE_API_KEY found, using fallback method');
            return null;
        }

        console.log(`📹 Fetching video metadata via YouTube Data API: ${videoId}`);

        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`;

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            console.error('YouTube API error:', response.status, response.statusText);
            return null;
        }

        const data = await response.json();
        const video = data.items?.[0];

        if (!video) {
            console.log('❌ Video not found via API');
            return null;
        }

        const snippet = video.snippet;
        const statistics = video.statistics;
        const contentDetails = video.contentDetails;

        // Detect language from title and description
        const textForLanguageDetection = `${snippet?.title || ''} ${snippet?.description || ''}`;
        const detectedLanguage = detectLanguage(textForLanguageDetection);

        const metadata: VideoMetadata = {
            id: videoId,
            title: snippet?.title || '',
            description: snippet?.description || '',
            channelTitle: snippet?.channelTitle || '',
            channelId: snippet?.channelId || '',
            thumbnailUrl: snippet?.thumbnails?.maxres?.url ||
                snippet?.thumbnails?.high?.url ||
                snippet?.thumbnails?.medium?.url ||
                `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
            publishedAt: snippet?.publishedAt || '',
            viewCount: parseInt(statistics?.viewCount || '0'),
            likeCount: parseInt(statistics?.likeCount || '0'),
            commentCount: parseInt(statistics?.commentCount || '0'),
            duration: parseDuration(contentDetails?.duration || ''),
            tags: snippet?.tags || [],
            categoryId: snippet?.categoryId || '',
            categoryName: YOUTUBE_CATEGORIES[snippet?.categoryId || ''] || 'Other',
            defaultLanguage: snippet?.defaultLanguage || '',
            detectedLanguage: detectedLanguage,
            defaultAudioLanguage: snippet?.defaultAudioLanguage || '',
            liveBroadcastContent: snippet?.liveBroadcastContent || 'none'
        };

        console.log(`✅ Video metadata fetched successfully:`);
        console.log(`   📺 Title: ${metadata.title}`);
        console.log(`   👀 Views: ${metadata.viewCount.toLocaleString()}`);
        console.log(`   🏷️ Tags: ${metadata.tags.length} tags`);
        console.log(`   📂 Category: ${metadata.categoryName}`);
        console.log(`   🌍 Language: ${metadata.detectedLanguage || metadata.defaultLanguage || 'unknown'}`);

        return metadata;

    } catch (error: any) {
        console.error('❌ Error fetching via YouTube API:', error.message);
        return null;
    }
}

// Fallback: Fetch video via oEmbed + scraping
async function fallbackFetchVideo(videoId: string): Promise<VideoMetadata | null> {
    try {
        console.log(`🔄 Using fallback method for video: ${videoId}`);

        // 1. Get basic info via oEmbed
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const oembedResponse = await fetch(oembedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            }
        });

        let title = 'YouTube Video';
        let channelTitle = 'Unknown';
        let thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

        if (oembedResponse.ok) {
            const oembedData = await oembedResponse.json();
            title = oembedData.title || title;
            channelTitle = oembedData.author_name || channelTitle;
            thumbnailUrl = oembedData.thumbnail_url || thumbnailUrl;
        }

        // 2. Scrape video page for more data
        let viewCount = 0;
        let description = '';
        let tags: string[] = [];

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

                // Extract view count
                const viewCountMatch = html.match(/"viewCount":"(\d+)"/) ||
                    html.match(/"viewCount":\s*"(\d+)"/);
                if (viewCountMatch?.[1]) {
                    viewCount = parseInt(viewCountMatch[1]);
                }

                // Extract description
                const descMatch = html.match(/"description":{"simpleText":"([^"]+)"/);
                if (descMatch?.[1]) {
                    description = descMatch[1].replace(/\\n/g, '\n');
                }

                // Extract keywords/tags
                const keywordsMatch = html.match(/"keywords":\s*\[([^\]]+)\]/);
                if (keywordsMatch?.[1]) {
                    tags = keywordsMatch[1].match(/"([^"]+)"/g)?.map(t => t.replace(/"/g, '')) || [];
                }
            }
        } catch (scrapeError) {
            console.error('Error scraping video page:', scrapeError);
        }

        const detectedLanguage = detectLanguage(`${title} ${description}`);

        return {
            id: videoId,
            title,
            description,
            channelTitle,
            channelId: '',
            thumbnailUrl,
            publishedAt: '',
            viewCount,
            likeCount: 0,
            commentCount: 0,
            duration: '',
            tags,
            categoryId: '',
            categoryName: 'Unknown',
            defaultLanguage: '',
            detectedLanguage,
            defaultAudioLanguage: '',
            liveBroadcastContent: 'none'
        };

    } catch (error) {
        console.error('❌ Fallback fetch failed:', error);
        return null;
    }
}

// Generate keywords from title and description
function generateKeywords(title: string, description: string, tags: string[]): string[] {
    const allText = `${title} ${description}`.toLowerCase();

    // Split into words and filter
    const words = allText
        .replace(/[^\w\s\u0600-\u06FF]/g, ' ') // Keep Arabic and alphanumeric
        .split(/\s+/)
        .filter(word => word.length > 2)
        .filter(word => !['the', 'and', 'for', 'with', 'this', 'that', 'from', 'are', 'was', 'were', 'been', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall'].includes(word));

    // Count word frequency
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Get top words by frequency
    const topWords = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);

    // Combine with original tags (remove duplicates)
    const allKeywords = [...new Set([...tags, ...topWords])];

    return allKeywords.slice(0, 20);
}

export async function POST(request: NextRequest) {
    try {
        const { videoId } = await request.json();

        if (!videoId) {
            return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
        }

        console.log(`🎥 Fetching complete video metadata: ${videoId}`);

        // Try YouTube API first, then fallback
        let metadata = await fetchVideoMetadataFromAPI(videoId);

        if (!metadata) {
            metadata = await fallbackFetchVideo(videoId);
        }

        if (!metadata) {
            return NextResponse.json({
                error: 'Could not fetch video metadata',
                videoId
            }, { status: 404 });
        }

        // Generate additional keywords from content
        const generatedKeywords = generateKeywords(
            metadata.title,
            metadata.description,
            metadata.tags
        );

        return NextResponse.json({
            success: true,
            video: {
                ...metadata,
                generatedKeywords,
                // Formatted for ad creation
                adData: {
                    suggestedHeadlines: [
                        metadata.title.slice(0, 30),
                        metadata.channelTitle.slice(0, 30),
                    ].filter(h => h.length > 0),
                    language: metadata.detectedLanguage || metadata.defaultLanguage || 'en',
                    targetAudience: metadata.categoryName,
                    keywords: generatedKeywords.slice(0, 10)
                }
            }
        });

    } catch (error) {
        console.error('❌ Error in YouTube Video Metadata API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

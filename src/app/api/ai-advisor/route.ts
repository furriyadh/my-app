import { NextRequest, NextResponse } from "next/server";

// CometAPI Configuration Only
const COMETAPI = {
    name: "CometAPI",
    baseUrl: process.env.COMETAPI_BASE_URL || "https://api.cometapi.com/v1",
    model: process.env.COMETAPI_MODEL || "gpt-4o-mini",
    apiKey: process.env.COMETAPI_API_KEY
};

type Message = {
    role: string;
    content: string;
};

// استخراج URL من النص
function extractUrl(text: string): string | null {
    // نمط للكشف عن URLs (بدون https أو معها)
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+)(?:\/[^\s]*)?/gi;
    const match = text.match(urlPattern);
    if (match && match.length > 0) {
        let url = match[0];
        // تنظيف URL
        url = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');
        return url;
    }
    return null;
}

// تحليل URL باستخدام /api/url/detect
async function analyzeUrl(url: string, baseUrl: string): Promise<{
    type: string;
    suggestedCampaignType: string;
    details?: { name?: string; storePlatform?: string };
} | null> {
    try {
        const response = await fetch(`${baseUrl}/api/url/detect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        if (response.ok) {
            const data = await response.json();
            return {
                type: data.type,
                suggestedCampaignType: data.suggestedCampaignType,
                details: data.details
            };
        }
    } catch (error) {
        console.log('URL analysis skipped:', error);
    }
    return null;
}

export async function POST(req: NextRequest) {
    try {
        const { prompt, conversationHistory = [] } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // استخراج URL من رسالة المستخدم وتحليله
        const extractedUrl = extractUrl(prompt);
        let urlAnalysis: { type: string; suggestedCampaignType: string; details?: { name?: string; storePlatform?: string } } | null = null;
        let urlContext = '';

        if (extractedUrl) {
            // تحديد base URL للـ API call
            const protocol = req.headers.get('x-forwarded-proto') || 'http';
            const host = req.headers.get('host') || 'localhost:3000';
            const baseUrl = `${protocol}://${host}`;

            urlAnalysis = await analyzeUrl(extractedUrl, baseUrl);

            if (urlAnalysis) {
                const campaignTypeNames: Record<string, string> = {
                    'SEARCH': 'حملة بحث (Search)',
                    'SHOPPING': 'حملة تسوق (Shopping)',
                    'VIDEO': 'حملة فيديو (Video)',
                    'APP': 'حملة تطبيق (App)',
                    'DISPLAY': 'حملة عرض (Display)',
                    'PERFORMANCE_MAX': 'حملة أداء أقصى (Performance Max)'
                };

                const typeNames: Record<string, string> = {
                    'website': 'موقع عادي',
                    'store': 'متجر إلكتروني',
                    'video': 'قناة/فيديو يوتيوب',
                    'app': 'تطبيق جوال'
                };

                urlContext = `
🔍 تحليل الرابط المُرسل (${extractedUrl}):
• نوع الموقع: ${typeNames[urlAnalysis.type] || urlAnalysis.type}
• نوع الحملة المقترح: ${campaignTypeNames[urlAnalysis.suggestedCampaignType] || urlAnalysis.suggestedCampaignType}
${urlAnalysis.details?.storePlatform ? `• المنصة: ${urlAnalysis.details.storePlatform}` : ''}
${urlAnalysis.details?.name ? `• الاسم: ${urlAnalysis.details.name}` : ''}

استخدم هذه المعلومات في ردك لتوضيح أننا نفهم نوع موقعه ونقترح الحملة الأنسب له.
`;
            }
        }

        // Build messages for chat completion
        const messages: Message[] = [
            {
                role: "system",
                content: `أنت مستشار مبيعات محترف في منصة Furriyadh لإعلانات Google Ads.
${urlContext}

معلومات الشركة:
Furriyadh LTD - شركة بريطانية مسجلة رسمياً
العنوان: Office 7132KR, 182-184 High Street North, East Ham, London E6 2JA

هدفك: إقناع العميل بإنشاء حملة إعلانية وتوضيح مدى سهولة وسرعة العملية.

⚠️ قواعد التنسيق المهمة:
- لا تستخدم النجوم ** أبداً
- لا تستخدم أي تنسيق markdown
- لا تستخدم أرقام مرتبة (1. 2. 3.)
- استخدم النقاط • فقط عند الضرورة
- اجعل ردودك طبيعية كمحادثة عادية

ما تقدمه المنصة (7 أنواع حملات رسمية من Google مع متطلباتها):

• حملات البحث (Search) - تظهر في نتائج بحث جوجل
  المتطلبات: 15 عنوان (30 حرف) + 4 أوصاف (90 حرف) + كلمات مفتاحية

• حملات التسوق (Shopping) - للمتاجر الإلكترونية
  المتطلبات: ربط حساب Merchant Center + 15 عنوان + 4 أوصاف + صور المنتجات

• حملات الفيديو (Video) - إعلانات يوتيوب
  المتطلبات: فيديو يوتيوب + 5 عناوين + 5 أوصاف

• حملات التطبيقات (App) - لترويج تطبيقات الجوال
  المتطلبات: معرف التطبيق + 5 عناوين (30 حرف) + 5 أوصاف (90 حرف) + صور اختيارية

• حملات العرض (Display) - تظهر في ملايين المواقع والتطبيقات
  المتطلبات: 5 عناوين + 5 أوصاف + عنوان طويل + صور (1.91:1 + 1:1)

• حملات الأداء الأقصى (Performance Max) - تغطي جميع شبكات جوجل تلقائياً
  المتطلبات: 15 عنوان + 4 أوصاف + عنوان طويل + 4-10 صور متنوعة

• حملات زيادة الطلب (Demand Gen) - لزيادة الوعي بالعلامة التجارية
  المتطلبات: 15 عنوان + 4 أوصاف + عنوان طويل + صور

عند الرد على العميل الذي أرسل رابط، اذكر نوع الحملة المقترحة ووضح بإيجاز أن الذكاء الاصطناعي سيتولى إنشاء العناوين والأوصاف والصور تلقائياً.

كيف نختلف عن غيرنا:
• الذكاء الاصطناعي يحلل موقعك ويختار نوع الحملة الأنسب تلقائياً (من 7 أنواع رسمية)
• نكتب نسخ إعلانية احترافية بعناوين جذابة وأوصاف مقنعة
• نستخرج الكلمات المفتاحية الذهبية من موقعك تلقائياً
• نستهدف المواقع الجغرافية بدقة متناهية
• الحملة جاهزة في 30 ثانية فقط بدلاً من ساعات العمل اليدوي
• الحد الأدنى: 20 ريال يومياً فقط

للرد على الشكوك:
• إذا سأل "أنتم نصابين؟" أو ما شابه: أكد أننا شركة بريطانية مسجلة رسمياً (Furriyadh LTD) ونستخدم Google Ads API الرسمي
• إذا سأل "ليش أدفعلكم؟": وضح أننا نوفر عليه ساعات من العمل ونضمن إعلانات احترافية مكتوبة بالذكاء الاصطناعي
• إذا سأل عن الأرباح: لا تعد بأرقام محددة، لكن أكد أن إعلانات جوجل من أفضل طرق الإعلان الرقمي عالمياً
• إذا قال "أسعاركم غالية" أو "كثير": وضح أن لدينا باقة مجانية للتجربة، وأن توظيف متخصص إعلانات يكلف آلاف الدولارات شهرياً بينما نحن نوفر نفس الخدمة بجزء بسيط من التكلفة، مع ذكاء اصطناعي يعمل 24 ساعة. اقترح البدء بالباقة المجانية أو حساباتنا الموثوقة (20% عمولة فقط بدون رسوم شهرية)

💰 هيكل التسعير (مهم جداً - أجب بدقة):
طريقتان للدفع:

الطريقة الأولى - الإدارة الذاتية (اشتراك شهري):
• مجاني: 0$ شهرياً (حملة واحدة + ميزانية 100$)
• أساسي: 49$ شهرياً (3 حملات + ميزانية غير محدودة)
• احترافي: 99$ شهرياً (10 حملات + تحسين AI متقدم) - الأفضل
• وكالة: 249$ شهرياً (حملات غير محدودة + 10 حسابات)
• مؤسسي: سعر مخصص

الطريقة الثانية - حساباتنا الموثوقة (الأكثر شعبية):
• عمولة 20% فقط من ميزانية الإعلانات
• بدون رسوم شهرية
• حسابات موثوقة بدون خطر إيقاف
• إعداد كامل بالذكاء الاصطناعي

ملاحظة: الميزانية الإعلانية (20 ريال يومياً كحد أدنى) تذهب لجوجل مباشرة، ونحن نأخذ رسوم الخدمة فقط.

أسلوب ردودك:
• كن ودوداً ومقنعاً وثق من نفسك
• اشرح الفوائد بوضوح
• استخدم "30 ثانية فقط" للتأكيد على السرعة
• لا تستخدم خطوات مرقمة أو نجوم
• إيموجي واحد أو اثنين فقط
• كن مختصراً لكن مقنعاً

مثال رد على "كيف أبدأ حملة؟":
"مرحباً! 👋

مع Furriyadh، إنشاء حملتك يستغرق 30 ثانية فقط.

أدخل رابط موقعك وسيحلله الذكاء الاصطناعي تلقائياً، ثم يختار أفضل نوع حملة لنشاطك ويكتب إعلانات احترافية بعناوين جذابة.

لا تحتاج أي خبرة سابقة في الإعلانات، نحن نتولى كل شيء.

[BUTTON:🚀 ابدأ حملتي الآن:/dashboard/google-ads/campaigns/website-url]"

مثال رد على "أنتم نصابين؟":
"نحن Furriyadh LTD، شركة بريطانية مسجلة رسمياً في لندن. ✅

نستخدم Google Ads API الرسمي لإنشاء الحملات مباشرة في حسابك على جوجل.

أنت تتحكم بحسابك بالكامل، ونحن فقط نسهل عملية الإنشاء. يمكنك إيقاف أو تعديل أي حملة في أي وقت من حسابك.

جرب بنفسك بميزانية بسيطة تبدأ من 20 ريال يومياً.

[BUTTON:🚀 جرب الآن:/dashboard/google-ads/campaigns/website-url]"

مثال رد على إرسال رابط (مثلاً lazurde.com):
"ممتاز! ✅

استلمت رابطك. الذكاء الاصطناعي سيحلل موقعك ويستخرج أفضل الكلمات المفتاحية ويكتب إعلانات احترافية خصيصاً لك.

كل هذا في 30 ثانية فقط.

[BUTTON:🚀 ابدأ حملتي الآن:/dashboard/google-ads/campaigns/website-url?url=lazurde.com]"

⚠️ قواعد الزر المهمة:
- الزر بالصيغة: [BUTTON:نص الزر القصير:/المسار]
- نص الزر يكون قصير مثل "🚀 ابدأ حملتي الآن" أو "🚀 جرب الآن"
- لا تكتب URL في نص الزر نفسه
- ضع URL في نهاية المسار فقط مثل: ?url=example.com`
            },
            ...conversationHistory.map((msg: any) => ({
                role: msg.role,
                content: msg.content
            })),
            {
                role: "user",
                content: prompt
            }
        ];

        // Call CometAPI
        const apiKey = COMETAPI.apiKey?.trim();
        if (!apiKey) {
            throw new Error("CometAPI API key is not configured");
        }

        const baseUrl = COMETAPI.baseUrl.endsWith('/') ? COMETAPI.baseUrl.slice(0, -1) : COMETAPI.baseUrl;

        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: COMETAPI.model,
                messages: messages,
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`CometAPI Error ${response.status}:`, errText);
            throw new Error(`CometAPI API Error ${response.status}: ${errText.slice(0, 100)}`);
        }

        const data = await response.json();
        const strategy = data.choices[0].message.content;

        console.log(`✅ Success with CometAPI (${COMETAPI.model})`);
        return NextResponse.json({ strategy });

    } catch (error) {
        console.error("AI Advisor Error:", error);
        return NextResponse.json({
            strategy: "عذراً، حدث خطأ مؤقت. يرجى المحاولة مرة أخرى."
        }, { status: 200 });
    }
}

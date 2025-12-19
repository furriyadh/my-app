import { NextRequest, NextResponse } from "next/server";

// Provider Configuration
const PROVIDERS = {
    groq: {
        name: "Groq",
        baseUrl: "https://api.groq.com/openai/v1",
        model: "llama-3.3-70b-versatile",
        rateLimit: 14400, // per day
    },
    google: {
        name: "Google AI",
        baseUrl: "https://generativelanguage.googleapis.com/v1beta",
        model: "gemini-2.0-flash-exp",
        rateLimit: 7500,
    },
    cerebras: {
        name: "Cerebras",
        baseUrl: "https://api.cerebras.ai/v1",
        model: "llama-3.3-70b",
        rateLimit: 14400,
    },
    cometapi: {
        name: "CometAPI",
        baseUrl: process.env.COMETAPI_BASE_URL || "https://api.cometapi.com/v1",
        model: "gemini-2.5-flash-lite",
        rateLimit: 1000000, // 1M tokens (one-time)
    }
};

type Message = {
    role: string;
    content: string;
};

export async function POST(req: NextRequest) {
    try {
        const { prompt, conversationHistory = [] } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // Build messages for chat completion
        const messages: Message[] = [
            {
                role: "system",
                content: `You are an enthusiastic sales expert for a Google Ads platform. Your mission: Get users EXCITED and guide them to create campaigns!

PLATFORM STRENGTHS (always highlight):
✨ Official Google Premier Partner 2025 (top 3% globally!)
✨ 30-second campaign creation (competitors take days!)
✨ AI handles everything: analysis, ads, keywords, images
✨ 24/7 automatic optimization
✨ No expertise needed
✨ Budget starts at just SR 19/day ($5/day)
✨ Professional results like big brands get

PRICING PLANS (mention when asked about pricing or plans):

Plan 1: Manage Client Accounts (Your Own Accounts)
• Single Account: $30/month
  - Perfect for small businesses
  - AI-generated ad images and creatives
  - AI ad copy and headlines writing
  - Smart keyword research
  - Real-time campaign optimization
  - Automated A/B testing
  - Advanced analytics dashboard
  - 24/7 AI monitoring
  - Email and chat support

• Multiple Accounts: $100/month (Best Value!)
  - Unlimited accounts for agencies
  - Everything in Single Account plus:
  - Manage unlimited client accounts
  - Perfect for marketing agencies

Plan 2: Work on Our Verified Accounts (Most Popular! ⭐)
• 20% commission of ad spend only
• No monthly fees - Pay as you go
• Premium verified accounts with full AI campaign creation
• Benefits:
  - Verified high-trust ad accounts
  - No suspension risk - Guaranteed
  - AI-generated ad images and banners
  - AI-written ad copy and headlines
  - Complete campaign setup by AI
  - Keyword research and bid strategy
  - Real-time 24/7 optimization
  - Dedicated account manager
  - Priority support and reporting
  - Unlimited campaigns and ad groups
  - 30-day money-back guarantee

✨ Most clients choose Plan 2 (20% commission) because it has zero monthly cost and includes verified accounts!

CRITICAL LANGUAGE RULE:
🚨 IF USER WRITES ENGLISH → RESPOND 100% ENGLISH (no Arabic words!)
🚨 IF USER WRITES ARABIC → RESPOND 100% ARABIC (no English words!)
🚨 NEVER MIX LANGUAGES IN ONE RESPONSE!

RESPONSE STYLE:
- Be exciting and enthusiastic
- Focus on benefits (what THEY get)
- Build confidence (it's easy and fast)
- End with strong call-to-action

═══════════════════════════════════════════
ENGLISH EXAMPLES (NO ARABIC WORDS):
═══════════════════════════════════════════

Q: "What campaign type suits my restaurant?"
A: "Perfect choice! Restaurant owners get amazing results with Search campaigns! 🍽️

Here's what you get:
• Professional ads that attract hungry customers
• Smart keywords targeting local diners
• Eye-catching images (AI-generated)
• Complete setup in 30 seconds

Big agencies charge thousands. You pay as little as $5/day!

As an official Google Premier Partner, we guarantee top results. Ready to fill your tables? 🚀"

Q: "How does it work?"
A: "Super simple! Just 3 steps:

1. Enter your website URL
2. Pick your target location  
3. Approve the suggested budget

Done! Our AI handles everything else - analyzing your business, writing compelling ads, choosing winning keywords, generating professional images.

Everything big brands pay agencies $5,000+ for, you get in 30 seconds automatically!

Want to see the magic? 🎯"

Q: "How much does it cost?"
A: "Great news - more affordable than you think! 💰

Budgets:
• Minimum: $5/day (less than a coffee!)
• Recommended: $15/day for best results
• Flexible: adjust anytime

What you get:
✅ Complete professional campaign
✅ 24/7 automatic optimization
✅ Reach thousands of potential customers
✅ Google Premier Partner support

Agencies charge thousands monthly. You get the same quality (or better!) at a fraction of the cost.

Ready for smart advertising? 🚀"

Q: "What are your pricing plans?"
A: "We have 2 flexible plans:

📋 Plan 1: Manage Your Own Accounts
• Single: $30/month (perfect for small businesses)
• Multiple: $100/month (best for agencies, unlimited accounts!)

⭐ Plan 2: Use Our Verified Accounts (Most Popular!)
• 20% commission of ad spend only
• Zero monthly fees!
• Premium verified accounts (no suspension risk)
• Dedicated account manager
• 30-day money-back guarantee

Most clients love Plan 2 because there are no upfront costs and you get verified premium accounts!

Want to view full pricing details? Check the Pricing button below! 🎯"

═══════════════════════════════════════════
ARABIC EXAMPLES (NO ENGLISH WORDS):
═══════════════════════════════════════════

س: "نقل عفش"
ج: "ممتاز! خدمات نقل العفش تحقق نتائج رائعة معنا! 🚚

ما ستحصل عليه:
• حملة بحث احترافية كاملة
• إعلانات جذابة تجلب عملاء حقيقيين
• كلمات مفتاحية ذكية ومستهدفة
• صور احترافية (بالذكاء الاصطناعي)
• جاهز في 30 ثانية فقط!

الشركات الكبرى تدفع آلاف الريالات لوكالات التسويق. أنت تبدأ من 19 ريال/يوم فقط!

نحن شركاء رسميون معتمدون من قوقل (أعلى مستوى عالمياً). جاهز لتجربة القوة الحقيقية؟ 🚀"

س: "كيف يعمل؟"
ج: "سهل جداً! 3 خطوات فقط:

1. أدخل رابط موقعك
2. اختر المنطقة المستهدفة
3. وافق على الميزانية المقترحة

انتهى! الذكاء الاصطناعي يتولى كل شيء - تحليل نشاطك، كتابة إعلانات مقنعة، اختيار كلمات مفتاحية رابحة، توليد صور احترافية.

كل ما تدفع له العلامات الكبرى آلاف الدولارات، تحصل عليه تلقائياً في 30 ثانية!

جاهز لرؤية السحر؟ 🎯"

س: "كم التكلفة؟"
ج: "أخبار رائعة - أرخص مما تتخيل! 💰

الميزانيات:
• الحد الأدنى: 19 ريال/يوم (أقل من وجبة!)
• الموصى به: 56 ريال/يوم لأفضل نتائج
• مرن: يمكنك التعديل متى شئت

ما تحصل عليه:
✅ حملة احترافية كاملة
✅ تحسين تلقائي على مدار الساعة
✅ وصول لآلاف العملاء المحتملين
✅ دعم من شريك قوقل الرسمي

الوكالات تأخذ آلاف الريالات شهرياً. تحصل على نفس الجودة (أو أفضل!) بجزء بسيط من التكلفة.

جاهز للإعلان الذكي؟ 🚀"

س: "ما هي باقاتكم؟"
ج: "لدينا باقتان مرنتان:

📋 الباقة الأولى: إدارة حساباتك الخاصة
• حساب واحد: 30 دولار/شهر (مثالي للشركات الصغيرة)
• حسابات متعددة: 100 دولار/شهر (الأفضل للوكالات، حسابات غير محدودة!)

⭐ الباقة الثانية: العمل على حساباتنا الموثقة (الأكثر شعبية!)
• عمولة 20% من المصروف الإعلاني فقط
• بدون رسوم شهرية!
• حسابات موثقة ممتازة (بدون خطر إيقاف)
• مدير حساب مخصص
• ضمان استرداد المال لمدة 30 يوم

معظم العملاء يفضلون الباقة الثانية لأنها بدون تكاليف مقدمة وتحصل على حسابات موثقة ممتازة!

تريد رؤية التفاصيل الكاملة؟ اضغط على زر التسعير بالأسفل! 🎯"

s: "أريد حملة"
ج: "قرار ممتاز! 🎉

أنت على بُعد 30 ثانية فقط من حملتك الأولى!

الخطوات:
1. اضغط زر 'إنشاء حملة الآن' بالأسفل
2. أدخل رابط موقعك
3. شاهد السحر يحدث!

الذكاء الاصطناعي سيعمل لصالحك فوراً. كشركاء رسميين معتمدين، نضمن جودة عالمية.

هل أنت جاهز للانطلاق؟ 🚀✨"

CRITICAL REMINDERS:
- ONE language per response (pure English OR pure Arabic)
- Show excitement and value
- Focus on benefits
- Build confidence
- Strong call-to-action always`
            }
        ];

        // Add conversation history
        conversationHistory.forEach((msg: any) => {
            messages.push({
                role: msg.role,
                content: msg.content
            });
        });

        // Add current user message
        messages.push({
            role: "user",
            content: prompt
        });

        // Try providers in order  
        const providers = ["groq", "cerebras", "google", "google2", "google3", "cometapi"];

        for (const providerKey of providers) {
            try {
                // Cast providerKey to a type that callProvider can accept, or handle "google2" specifically
                const strategy = await callProvider(providerKey as keyof typeof PROVIDERS | "google2" | "google3", messages);
                if (strategy) {
                    const providerName = providerKey === "google2" ? "Google AI (Account 2)" :
                        providerKey === "google3" ? "Google AI (Account 3)" :
                            PROVIDERS[providerKey as keyof typeof PROVIDERS]?.name || providerKey;
                    console.log(`✅ Success with ${providerName}`);
                    return NextResponse.json({ strategy });
                }
            } catch (error) {
                const providerName = providerKey === "google2" ? "Google AI (Account 2)" :
                    providerKey === "google3" ? "Google AI (Account 3)" :
                        PROVIDERS[providerKey as keyof typeof PROVIDERS]?.name || providerKey;
                console.log(`⚠️ ${providerName} failed, trying next...`);
                continue;
            }
        }

        // If all providers fail, return fallback
        throw new Error("All providers failed");

    } catch (error) {
        console.error("AI Advisor Error:", error);
        return NextResponse.json({
            strategy: "عذراً، حدث خطأ مؤقت. يرجى المحاولة مرة أخرى. إذا استمرت المشكلة، تواصل مع الدعم الفني."
        }, { status: 200 });
    }
}

async function callProvider(provider: keyof typeof PROVIDERS | "google2" | "google3", messages: Message[]): Promise<string | null> {
    // Handle second Google AI key
    if (provider === "google2") {
        const apiKey = process.env.GOOGLE_AI_STUDIO_KEY_2;
        if (!apiKey) return null;
        return await callGoogleAI(apiKey, messages, "gemini-2.0-flash-exp");
    }

    // Handle third Google AI key
    if (provider === "google3") {
        const apiKey = process.env.GOOGLE_AI_STUDIO_KEY_3;
        if (!apiKey) return null;
        return await callGoogleAI(apiKey, messages, "gemini-2.0-flash-exp");
    }

    const config = PROVIDERS[provider as keyof typeof PROVIDERS];

    // Get API key from environment
    const apiKey = getApiKey(provider as keyof typeof PROVIDERS);
    if (!apiKey) {
        console.log(`⚠️ ${config.name}: No API key found`);
        return null;
    }

    try {
        // Special handling for Google AI
        if (provider === "google") {
            return await callGoogleAI(apiKey, messages, config.model);
        }

        // Standard OpenAI-compatible providers (Groq, Cerebras, CometAPI)
        const response = await fetch(`${config.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: config.model,
                messages: messages,
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`${config.name} API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error(`${config.name} error:`, error);
        return null;
    }
}

async function callGoogleAI(apiKey: string, messages: Message[], model: string): Promise<string | null> {
    try {
        // Convert messages to Google's format
        const lastMessage = messages[messages.length - 1];

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: lastMessage.content }]
                    }]
                })
            }
        );

        if (!response.ok) throw new Error(`Google AI Error: ${response.status}`);

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Google AI error:", error);
        return null;
    }
}

function getApiKey(provider: keyof typeof PROVIDERS): string | undefined {
    const keyMap = {
        groq: process.env.GROQ_API_KEY,
        google: process.env.GOOGLE_AI_STUDIO_KEY,
        cerebras: process.env.CEREBRAS_API_KEY,
        cometapi: process.env.COMETAPI_API_KEY,
    };

    return keyMap[provider];
}

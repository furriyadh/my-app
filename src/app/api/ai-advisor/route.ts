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
    images?: string[]; // Base64 strings
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
                content: `You are the Senior AI Growth Consultant for a premier Google Ads platform (Official Google Premier Partner).
Your Core Mission: Demonstrate the massive power of Full Automation to the user.

🔥 THE "GOLDEN RULE" OF THIS PLATFORM:
THE USER DOES NOTHING. THE AI DOES EVERYTHING.
User's only job: Enter Link + Select Location + Budget.
Your job: Analyze, optimize, and launch.

🚫 ABSOLUTE PROHIBITIONS (NEVER DO THESE):
❌ NEVER ask the user to "choose keywords".
❌ NEVER ask the user to "write ad copy" or "headlines".
❌ NEVER suggest the user needs to do manual work.
❌ NEVER use the phrase "social media page". Use "Website, Store, Youtube Channel, or App".
❌ NEVER output Chinese, Japanese, or unrelated foreign characters.
❌ NEVER say "If you wish lower" regarding budget. The minimum is strict.
❌ NEVER mix English words in Arabic text (Zero Tolerance).

✅ WHAT TO SAY INSTEAD:
"Our AI analyzes your link to automatically find the most profitable keywords."
"We generate high-converting ad copy and professional images for you."
"Our system targets your exact ideal customers automatically."

💡 KEY SELLING POINTS:
1. **Google Partner Badge:** (نحن شركاء رسميون معتمدون من قوقل - بارتنر مع جوجل)
2. **3 Simple Steps:** (أدخل الرابط، اختر المنطقة، وافق على الميزانية)
3. **Complete Automation:** (الذكاء الاصطناعي يتولى كل شيء)

💰 PRICING PLANS (Only if asked):
• Plan 1 (Your Own Accounts): $30/mo (Single), $100/mo (Agency/Unlimited).
• Plan 2 (Verified Accounts - Recommended): 20% Commission only. NO monthly fees. Guaranteed no suspension.

🗣️ LANGUAGE & TONE:
- Professional, Authoritative, yet Enthusiastic.
- ARABIC: Use high-quality, professional Arabic. NO English characters allowed in Arabic response.
- ENGLISH: Professional business English.

🎨 PREMIUM LAYOUT RULES (CRITICAL):
- **PARTNER BADGE:** Always put the Google Partner status in a BLOCKQUOTE with a medal emoji.
  Example:
  > 🎖️ **شريك قوقل الرسمي (Partner with Google)**
- **SEPARATORS:** Use horizontal lines (---) to separate the "Steps" from the "AI Magic".
- **STEPS:** Use numbered emojis (1️⃣, 2️⃣, 3️⃣) with **BOLD** headers.
- **SPACING:** Double newlines between sections.

🛑 BUDGET REALITY CHECK:
- **STRICT MINIMUM / الحد الأدنى الصارم:** ~20 SAR ($5).
- NEVER suggest a lower budget is acceptable.
- If user asks for lower, say: "لضمان النتائج، الحد الأدنى للنظام هو 20 ريال/يوم."

🧠 EXAMPLES OF "PERFECT" RESPONSES:

Q: "How does it work?"
A (Arabic): "أهلاً بك في نظام الإعلانات الأذكى عالمياً! 🚀

> 🎖️ **نحن شركاء رسميون معتمدون من قوقل (Partner with Google)**

الأمر بسيط جداً، 3 خطوات فقط:

1️⃣ **أدخل الرابط:** (سواء كان موقعك، قناتك، متجرك، أو تطبيقك)

2️⃣ **اختر المنطقة المستهدفة**

3️⃣ **وافق على الميزانية المقترحة** (بحد أدنى 20 ريال)

---

✨ **بعد ذلك، الذكاء الاصطناعي يتولى كل شيء:**
🔹 تحليل النشاط والمنافسين
🔹 كتابة الإعلانات المقنعة
🔹 اختيار الكلمات المفتاحية الرابحة
🔹 توليد الصور الاحترافية

هل نبدأ الرحلة الآن؟ 🚀"

A (English): "Welcome to the world's smartest ad platform! 🚀

> 🎖️ **Official Google Premier Partner**

It's super simple, just 3 steps:

1️⃣ **Enter your Link** (Website, Channel, Store, or App)

2️⃣ **Select Target Location**

3️⃣ **Approve Budget** (Minimum $5/day)

---

✨ **Then, our AI handles the rest:**
🔹 Competitive Analysis
🔹 High-Converting Ad Copy
🔹 Profitable Keywords
🔹 Professional Image Generation

Ready to launch? 🚀"

Q: "Why use you?"
A (Arabic): "لأننا نمنحك قوة وكالات التسويق الكبرى بضغطة زر:

> 🎖️ **شريك قوقل الرسمي (Premier Partner)**

🔹 **أتمتة كاملة** (لا تحتاج لخبرة)
🔹 **توفير هائل** في التكاليف
🔹 **حسابات موثقة** (بدون خطر إيقاف)

هل نبدأ الآن؟ 🚀"

🔚 ALWAYS end with a confidence-boosting Call to Action.`
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
        // Combine messages into a single prompt to preserve context and system instructions
        // Handle multimodal content (text + images) correctly for Gemini
        const contents = messages.map(msg => {
            const parts: any[] = [{ text: `[${msg.role.toUpperCase()}]: ${msg.content}` }];

            // Add images if present
            if (msg.images && msg.images.length > 0) {
                msg.images.forEach(img => {
                    // Extract base64 data and mime type
                    // Expected format: "data:image/jpeg;base64,/9j/4AAQSw..."
                    const matches = img.match(/^data:(.+);base64,(.+)$/);
                    if (matches) {
                        parts.push({
                            inline_data: {
                                mime_type: matches[1],
                                data: matches[2]
                            }
                        });
                    }
                });
            }
            return { parts };
        });

        // For v1beta generateContent with history, we essentially strictly send 'contents'
        // But since we are concatenating history manually in the previous approach (due to statelessness assumption or single turn refactor),
        // let's stick to the "single big prompt" approach but enhanced with images.
        // HOWEVER, Gemini API `contents` field expects a list of turn-by-turn messages if we want chat mode,
        // OR we can squash everything. Squashing images is trickier. 
        // Best approach for "stateless" REST API with history is to pass the full `contents` array structure.

        // Let's refactor to send standard Gemini chat structure instead of squashing string
        // Mapped messages above `contents` is ALMOST correct but roles need to be 'user' or 'model'.
        // 'system' role is supported in Gemini 1.5/2.0 as a separate field or implicit.

        // Let's revert to a simpler "Append images to the LAST user message" strategy for now 
        // and keep the "Squashed Text" history for context, because rewriting full history mapping is risky without testing.

        // BETTER STRATEGY: 
        // 1. Construct text context from history.
        // 2. Attach images from the CURRENT prompt (last user message) to the request.

        const lastMsg = messages[messages.length - 1];
        const textContext = messages.map(msg => `[${msg.role.toUpperCase()}]: ${msg.content}`).join("\n\n");

        const requestParts: any[] = [{ text: textContext }];

        if (lastMsg.images && lastMsg.images.length > 0) {
            // Fetch images server-side to avoid CORS or direct URL issues with Gemini if it expects inline
            // Actually Gemini API supports fileData from Google File API, but for 'inline_data' it wants base64.
            // Since we upload to Supabase public URL, let's fetch it here and convert to base64.

            for (const imgUrl of lastMsg.images) {
                try {
                    // Check if it's already base64 (fallback) or URL
                    if (imgUrl.startsWith("data:")) {
                        const matches = imgUrl.match(/^data:(.+);base64,(.+)$/);
                        if (matches) {
                            requestParts.push({
                                inline_data: {
                                    mime_type: matches[1],
                                    data: matches[2]
                                }
                            });
                        }
                    } else if (imgUrl.startsWith("http")) {
                        // Fetch from URL
                        const imgRes = await fetch(imgUrl);
                        if (!imgRes.ok) throw new Error(`Failed to fetch image: ${imgUrl}`);
                        const arrayBuffer = await imgRes.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        const base64Data = buffer.toString('base64');
                        const mimeType = imgRes.headers.get("content-type") || "image/jpeg";

                        requestParts.push({
                            inline_data: {
                                mime_type: mimeType,
                                data: base64Data
                            }
                        });
                    }
                } catch (err) {
                    console.error("Error processing image for backend:", err);
                    // Skip image if failed
                }
            }
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: requestParts
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

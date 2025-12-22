import { NextRequest, NextResponse } from "next/server";

// Provider Configuration
const PROVIDERS = {
    groq: {
        name: "Groq",
        baseUrl: "https://api.groq.com/openai/v1",
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        apiKey: process.env.GROQ_API_KEY
    },
    google: {
        name: "Google AI",
        baseUrl: "https://generativelanguage.googleapis.com/v1beta",
        model: process.env.GOOGLE_MODEL || "gemini-2.5-flash",
        apiKey: process.env.GOOGLE_AI_STUDIO_KEY
    },
    cerebras: {
        name: "Cerebras",
        baseUrl: "https://api.cerebras.ai/v1",
        model: process.env.CEREBRAS_MODEL || "llama3.1-8b",
        apiKey: process.env.CEREBRAS_API_KEY
    },
    cometapi: {
        name: "CometAPI",
        baseUrl: "https://api.cometapi.com/v1",
        model: process.env.COMETAPI_MODEL || "gpt-4o-mini",
        apiKey: process.env.COMETAPI_API_KEY
    },
    openrouter: {
        name: "OpenRouter",
        baseUrl: "https://openrouter.ai/api/v1",
        model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
        apiKey: process.env.OPENROUTER_API_KEY
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
                content: `You are the Senior AI Growth Consultant for a premier Google Ads platform.
Your Core Mission: Identify the User's Goal -> Determine Campaign Type -> Guide them with 3 SIMPLE STEPS in their EXACT LANGUAGE.

🔥 **THE "MIRROR" RULE (LANGUAGE - CRITICAL):**
- **DETECT user's language.** (Arabic, English, etc.).
- **SILENT SPELL-CHECK:** The user may have typos (e.g., "بله" instead of "بالله"). mentally correct them before responding.
- **POLITENESS PROTOCOL:** If the user asks "How are you?" (كيف حالك), ALWAYS reply with "Alhamdulillah, I am ready to help you..." (الحمدلله، أنا مستعد لمساعدتك..).
- **RESPOND IN THE SAME LANGUAGE ONLY.**
- **STRICT ARABIC MODE:** If the user speaks Arabic, the response MUST contain **ONLY** Arabic letters, numbers, and Emojis.
- **⛔ ZERO TOLERANCE FOR LATIN/CYRILLIC:** 
  - DO NOT write "sUFFICIENT", "пояс", or any English/Russian words.
  - DO NOT use English words like "Search Campaign" → Write "حملة شبكة البحث" instead.
  - DO NOT use "Website" → Write "الموقع الإلكتروني".

🚫 **PROHIBITIONS:**
❌ NO "Partner with Google" badges.
❌ NO "Welcome to our platform" long intros.
❌ **NO LATIN CHARACTERS IN ARABIC TEXT (Except URLs).**
❌ NO "Social Media Page" phrasing.
❌ **NO INVENTED NAMES:** Never call the user by a name unless they explicitly stated it (e.g., "I am Ahmed"). If unknown, say "Hello" or "Welcome".

**✅ RESPONSE GUIDELINES (VISUAL & PROFESSIONAL):**
The response MUST be visually structured and easy to scan.
- Use Emojis to break up text, but keep it professional (e.g., ✅, 📍, 💰, 🚀, 📈).
- **NEVER** output a wall of text. Use bullet points.
- **Greeting:** Keep it simple and direct. Do NOT try to guess who the user is.

**🎨 VARIATION RULE:**
- Change the phrasing slightly each time so it doesn't feel robotic.
- Switch up the intro (e.g., "Great choice!", "This is a smart move.", "Let's get this started.").

**🪜 THE 3 CORE STEPS (REQUIRED FORMAT):**
You MUST list the steps with these specific emojis:

1. 🔗 **[Insert Asset Type]**: [Instruction]
2. 📍 **Select Location**: [Instruction]
3. 💰 **Approve Budget**: (Min 20 SAR)

**✨ THE VALUE ADD:**
Briefly explain *why* this campaign works (use 🎯 or 📈).

🚫 **AVOID ROBOTIC REPETITION:**
If the user asks 5 different questions, your answers should NOT look like 5 copies of the same form.
Keep it fresh, expert, and conversational.`
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

        // Try providers in order  
        const providers = ["groq", "cerebras", "google", "google2", "google3", "cometapi", "openrouter"];

        for (const providerKey of providers) {
            try {
                const strategy = await callProvider(providerKey as keyof typeof PROVIDERS | "google2" | "google3", messages);
                if (strategy) {
                    const providerName = providerKey === "google2" ? "Google AI (Account 2)" :
                        providerKey === "google3" ? "Google AI (Account 3)" :
                            PROVIDERS[providerKey as keyof typeof PROVIDERS]?.name || providerKey;

                    console.log(`✅ Success with ${providerName}`);
                    return NextResponse.json({ strategy });
                }
            } catch (error: any) {
                console.log(`⚠️ ${providerKey} failed: ${error.message}, trying next...`);
                continue;
            }
        }

        throw new Error("All providers failed");

    } catch (error) {
        console.error("AI Advisor Error:", error);
        return NextResponse.json({
            strategy: "عذراً، حدث خطأ مؤقت. يرجى المحاولة مرة أخرى."
        }, { status: 200 });
    }
}

async function callProvider(provider: keyof typeof PROVIDERS | "google2" | "google3", messages: Message[]): Promise<string | null> {

    let config: any = PROVIDERS[provider as keyof typeof PROVIDERS];

    // Handle Google Backup Keys
    if (provider === "google2") {
        config = { ...PROVIDERS.google, apiKey: process.env.GOOGLE_AI_STUDIO_KEY_2 };
    } else if (provider === "google3") {
        config = { ...PROVIDERS.google, apiKey: process.env.GOOGLE_AI_STUDIO_KEY_3 };
    }

    const apiKey = config.apiKey?.trim();
    if (!apiKey) return null;

    try {
        // Special handling for Google AI
        if (provider.startsWith("google")) {
            return await callGoogleAI(apiKey, messages, config.model);
        }

        // Standard OpenAI-compatible providers
        const baseUrl = config.baseUrl.endsWith('/') ? config.baseUrl.slice(0, -1) : config.baseUrl;

        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                ...(provider === "openrouter" && {
                    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://furriyadh.com",
                    "X-Title": "Furriyadh AI"
                })
            },
            body: JSON.stringify({
                model: config.model,
                messages: messages,
                max_tokens: 800
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`${config.name} API Error ${response.status}: ${errText.slice(0, 100)}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error(`${config.name} error: `, error);
        throw error;
    }
}

async function callGoogleAI(apiKey: string, messages: Message[], model: string): Promise<string | null> {
    try {
        const lastMsg = messages[messages.length - 1];
        const textContext = messages.map(msg => `[${msg.role.toUpperCase()}]: ${msg.content} `).join("\n\n");

        const requestParts: any[] = [{ text: textContext }];

        if (lastMsg.images && lastMsg.images.length > 0) {
            for (const imgUrl of lastMsg.images) {
                try {
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
                        const imgRes = await fetch(imgUrl);
                        if (!imgRes.ok) throw new Error(`Failed to fetch image: ${imgUrl} `);
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

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Google AI Error ${response.status}: ${errText.slice(0, 100)}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Google AI error:", error);
        throw error;
    }
}

function getApiKey(provider: keyof typeof PROVIDERS): string | undefined {
    const keyMap = {
        groq: process.env.GROQ_API_KEY,
        google: process.env.GOOGLE_AI_STUDIO_KEY,
        cerebras: process.env.CEREBRAS_API_KEY,
        cometapi: process.env.COMETAPI_API_KEY,
        openrouter: process.env.OPENROUTER_API_KEY,
    };

    return keyMap[provider];
}

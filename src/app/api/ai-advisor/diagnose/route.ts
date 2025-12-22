import { NextRequest, NextResponse } from "next/server";

const PROVIDERS = {
    groq: {
        name: "Groq",
        baseUrl: "https://api.groq.com/openai/v1",
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        apiKey: process.env.GROQ_API_KEY
    },
    google: {
        name: "Google AI (Primary)",
        baseUrl: "https://generativelanguage.googleapis.com/v1",
        model: process.env.GOOGLE_MODEL || "gemini-pro",
        apiKey: process.env.GOOGLE_AI_STUDIO_KEY
    },
    google2: {
        name: "Google AI (Backup 1)",
        baseUrl: "https://generativelanguage.googleapis.com/v1",
        model: process.env.GOOGLE_MODEL || "gemini-pro",
        apiKey: process.env.GOOGLE_AI_STUDIO_KEY_2
    },
    google3: {
        name: "Google AI (Backup 2)",
        baseUrl: "https://generativelanguage.googleapis.com/v1",
        model: process.env.GOOGLE_MODEL || "gemini-pro",
        apiKey: process.env.GOOGLE_AI_STUDIO_KEY_3
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
        model: process.env.COMETAPI_MODEL || "gemini-1.5-flash",
        apiKey: process.env.COMETAPI_API_KEY
    },
    openrouter: {
        name: "OpenRouter",
        baseUrl: "https://openrouter.ai/api/v1",
        model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
        apiKey: process.env.OPENROUTER_API_KEY
    }
};

export async function GET(req: NextRequest) {
    const results = [];

    // Test each provider
    for (const [key, config] of Object.entries(PROVIDERS)) {
        const start = Date.now();
        let status = "❌ Failed";
        let details = "";
        let latency = 0;

        try {
            const apiKey = config.apiKey?.trim();
            if (!apiKey) {
                status = "⚠️ Skipped";
                details = "Missing API Key";
            } else {
                // Simple "Hello" prompt
                const messages = [{ role: "user", content: "Say 'OK'." }];

                let responseText = "";

                if (key.startsWith("google")) {
                    // Google AI Test
                    const response = await fetch(
                        `https://generativelanguage.googleapis.com/v1/models/${config.model}:generateContent?key=${apiKey}`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ contents: [{ parts: [{ text: "Say OK" }] }] })
                        }
                    );

                    if (!response.ok) {
                        const errText = await response.text();
                        throw new Error(`HTTP ${response.status} - ${errText.slice(0, 300)}`);
                    }
                    const data = await response.json();
                    responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No text";

                } else {
                    // OpenAI Compatible Test (Groq, Cerebras, OpenRouter, Comet)
                    const baseUrl = config.baseUrl.endsWith('/') ? config.baseUrl.slice(0, -1) : config.baseUrl;

                    const response = await fetch(`${baseUrl}/chat/completions`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`,
                            ...(key === "openrouter" && {
                                "HTTP-Referer": "https://furriyadh.com",
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
                        throw new Error(`HTTP ${response.status} - ${errText.slice(0, 300)}`);
                    }
                    const data = await response.json();
                    responseText = data.choices?.[0]?.message?.content || "No content";
                }

                latency = Date.now() - start;
                status = "✅ Operational";
                details = responseText.slice(0, 50).replace(/\n/g, " ");
            }

        } catch (error: any) {
            latency = Date.now() - start;
            details = error.message;
        }

        results.push({
            provider: config.name,
            key: key,
            status,
            latency: `${latency}ms`,
            response: details
        });
    }

    return NextResponse.json({
        timestamp: new Date().toISOString(),
        summary: `Tested ${Object.keys(PROVIDERS).length} providers.`,
        details: results
    });
}

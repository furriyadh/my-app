import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        const apiKey = process.env.COMETAPI_API_KEY;
        const baseUrl = process.env.COMETAPI_BASE_URL;
        const model = process.env.TEXT_MODEL || "gpt-4o-mini";

        if (!apiKey || !baseUrl) {
            // Fallback for demo/dev if keys missing
            return NextResponse.json({
                strategy: "## Google Ads Strategy\n\n**Recommendation:** Use **Performance Max** for broad reach.\n\n- **Bidding:** Maximize Conversions.\n- **Keywords:** Focus on high-intent terms related to your offer.\n- **Ad Copy:** Highlight your unique value proposition."
            });
        }

        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: "system",
                        content: `You are a Senior Google Ads Strategist (Certified Professional).
                        Your goal is to briefly analyze the user's business intent and provide a high-level strategy using official Google Ads terminology.
                        
                        Output structure (Keep it concise, max 150 words):
                        ## 🚀 Strategy Plan
                        **Campaign Type:** (e.g., Search, Video, Performance Max)
                        **Goal:** (e.g., Leads, Sales, Brand Awareness)
                        **Key Recommendation:** (One powerful tip based on Google Ads best practices).
                        
                        Tone: Professional, encouraging, and expert.`
                    },
                    {
                        role: "user",
                        content: `User Business Goal/Prompt: "${prompt}"`
                    }
                ],
                max_tokens: 300
            })
        });

        if (!response.ok) {
            throw new Error(`AI API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const strategy = data.choices[0].message.content;

        return NextResponse.json({ strategy });

    } catch (error) {
        console.error("AI Advisor Error:", error);
        return NextResponse.json({ error: "Failed to generate strategy" }, { status: 500 });
    }
}

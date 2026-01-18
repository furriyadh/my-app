"use server";

import { NextRequest, NextResponse } from "next/server";

// CometAPI Configuration
const COMETAPI_API_KEY = process.env.COMETAPI_API_KEY;
const COMETAPI_BASE_URL = process.env.COMETAPI_BASE_URL || "https://api.cometapi.com/v1";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get("audio") as File;

        if (!audioFile) {
            return NextResponse.json({ error: "No audio" }, { status: 400 });
        }

        if (!COMETAPI_API_KEY) {
            return NextResponse.json({ error: "API key missing" }, { status: 500 });
        }

        // Prepare FormData for standard OpenAI Audio API (supported by CometAPI as per docs/screenshot)
        // Endpoint: /v1/audio/transcriptions
        // Model: whisper-1 (This is the standard model name for this endpoint)

        const apiFormData = new FormData();
        apiFormData.append("file", audioFile);
        apiFormData.append("model", "whisper-1");
        apiFormData.append("response_format", "json");

        // The previous error was because we sent audio to /chat/completions with a model that didn't support it or wrong format.
        // Standard STT should go to /audio/transcriptions.

        const response = await fetch(`${COMETAPI_BASE_URL}/audio/transcriptions`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${COMETAPI_API_KEY}`,
                // Content-Type header is NOT set manually when using FormData, fetch sets boundary automatically
            },
            body: apiFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("CometAPI STT error:", errorText);

            return NextResponse.json({ error: "Transcription failed: " + errorText }, { status: response.status });
        }

        const result = await response.json();
        return NextResponse.json({ success: true, text: result.text });

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

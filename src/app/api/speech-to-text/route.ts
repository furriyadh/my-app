import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";

// CometAPI Configuration (OpenAI-compatible)
const COMETAPI_API_KEY = process.env.COMETAPI_API_KEY;
const COMETAPI_BASE_URL = process.env.COMETAPI_BASE_URL || "https://api.cometapi.com/v1";

// Initialize OpenAI client with CometAPI endpoint
const openai = new OpenAI({
    apiKey: COMETAPI_API_KEY,
    baseURL: COMETAPI_BASE_URL,
});

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get("audio") as File;

        if (!audioFile) {
            return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
        }

        // Log file info for debugging
        console.log("📦 Received audio file:", {
            name: audioFile.name,
            size: audioFile.size,
            type: audioFile.type
        });

        if (audioFile.size < 100) {
            return NextResponse.json({ error: "Audio file too small" }, { status: 400 });
        }

        if (!COMETAPI_API_KEY) {
            return NextResponse.json({ error: "API key missing" }, { status: 500 });
        }

        // Convert File to Buffer
        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log("🚀 Sending to CometAPI with OpenAI SDK...");

        // Use OpenAI SDK's toFile helper for proper file handling
        const file = await toFile(buffer, audioFile.name || "audio.wav", {
            type: audioFile.type || "audio/wav",
        });

        const transcription = await openai.audio.transcriptions.create({
            file: file,
            model: "whisper-1",
            language: "ar",
            prompt: "النص باللغة العربية. يرجى كتابة النص بدقة إملائية عالية وتصحيح الكلمات.",
            response_format: "json",
        });

        console.log("✅ Transcription result:", transcription.text?.substring(0, 50) + "...");

        return NextResponse.json({ success: true, text: transcription.text });

    } catch (error: any) {
        console.error("Speech-to-text error:", error.message || error);
        const errorMessage = error.message || "Failed to process audio";
        return NextResponse.json({ error: "Transcription failed: " + errorMessage }, { status: 500 });
    }
}

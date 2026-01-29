"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseAISpeechToTextOptions {
    onTranscript?: (text: string) => void;
    onError?: (error: string) => void;
    silenceDelay?: number;
    language?: string;
}

interface UseAISpeechToTextResult {
    isRecording: boolean;
    isProcessing: boolean;
    error: string | null;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    toggleRecording: () => void;
    isSupported: boolean;
}

// Extend Window interface for SpeechRecognition
declare global {
    interface Window {
        SpeechRecognition: typeof SpeechRecognition;
        webkitSpeechRecognition: typeof SpeechRecognition;
    }
}

export function useAISpeechToText({
    onTranscript,
    onError,
    silenceDelay = 2000,
    language = "en-US",
}: UseAISpeechToTextOptions = {}): UseAISpeechToTextResult {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(true);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const transcriptRef = useRef<string>("");
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Check browser support
    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                setIsSupported(false);
                console.warn("Web Speech API not supported in this browser");
            }
        }
    }, []);

    const cleanup = useCallback(() => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
    }, []);

    const finishRecording = useCallback(() => {
        cleanup();
        setIsRecording(false);

        // Send the collected transcript
        if (transcriptRef.current.trim()) {
            console.log("🎤 Final transcript:", transcriptRef.current);
            onTranscript?.(transcriptRef.current.trim());
        }
        transcriptRef.current = "";
    }, [cleanup, onTranscript]);

    const startRecording = useCallback(async () => {
        if (isRecording || isProcessing) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setIsSupported(false);
            const msg = "Speech recognition not supported. Please use Chrome, Edge, or Safari.";
            setError(msg);
            onError?.(msg);
            return;
        }

        try {
            setError(null);
            transcriptRef.current = "";

            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;

            // Configure recognition
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = language;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                console.log("🎤 Speech recognition started with language:", language);
                setIsRecording(true);
            };

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let finalTranscript = "";
                let interimTranscript = "";

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + " ";
                    } else {
                        interimTranscript = transcript;
                    }
                }

                if (finalTranscript) {
                    transcriptRef.current += finalTranscript;
                    console.log("📝 Final:", finalTranscript);

                    // Reset silence timer on speech
                    if (silenceTimerRef.current) {
                        clearTimeout(silenceTimerRef.current);
                    }
                    silenceTimerRef.current = setTimeout(() => {
                        console.log("🔇 Silence detected - finishing");
                        finishRecording();
                    }, silenceDelay);
                }

                if (interimTranscript) {
                    console.log("💭 Interim:", interimTranscript);
                }
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error("Speech recognition error:", event.error);

                if (event.error === "not-allowed") {
                    setError("Microphone access denied. Please allow microphone access.");
                } else if (event.error === "no-speech") {
                    console.log("No speech detected");
                } else {
                    setError(`Speech error: ${event.error}`);
                }

                onError?.(event.error);
            };

            recognition.onend = () => {
                console.log("🎤 Speech recognition ended");
                if (isRecording && recognitionRef.current) {
                    finishRecording();
                }
            };

            recognition.start();

        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to start";
            setError(msg);
            onError?.(msg);
            cleanup();
        }
    }, [isRecording, isProcessing, language, silenceDelay, finishRecording, cleanup, onError]);

    const stopRecording = useCallback(() => {
        if (isRecording) {
            console.log("🛑 Manually stopping recording");
            finishRecording();
        }
    }, [isRecording, finishRecording]);

    const toggleRecording = useCallback(() => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }, [isRecording, startRecording, stopRecording]);

    useEffect(() => {
        return () => cleanup();
    }, [cleanup]);

    return {
        isRecording,
        isProcessing,
        error,
        startRecording,
        stopRecording,
        toggleRecording,
        isSupported,
    };
}

export default useAISpeechToText;

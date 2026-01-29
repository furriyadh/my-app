"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseSpeechRecognitionOptions {
    onResult?: (transcript: string) => void;
    onError?: (error: string) => void;
    continuous?: boolean;
    language?: string;
}

interface SpeechRecognitionResult {
    isListening: boolean;
    transcript: string;
    interimTranscript: string;
    error: string | null;
    startListening: () => void;
    stopListening: () => void;
    toggleListening: () => void;
    isSupported: boolean;
}

// Extend Window interface for speech recognition
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export function useSpeechRecognition({
    onResult,
    onError,
    continuous = true,
    language = "en-US",
}: UseSpeechRecognitionOptions = {}): SpeechRecognitionResult {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    const recognitionRef = useRef<any>(null);
    const onResultRef = useRef(onResult);
    const onErrorRef = useRef(onError);

    // Keep refs updated
    useEffect(() => {
        onResultRef.current = onResult;
        onErrorRef.current = onError;
    }, [onResult, onError]);
    useEffect(() => {
        if (typeof window === "undefined") return;

        const SpeechRecognitionAPI =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognitionAPI) {
            setIsSupported(false);
            setError("Speech recognition is not supported in this browser");
            return;
        }

        setIsSupported(true);

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = continuous;
        recognition.interimResults = true;
        // Use provided language, browser language, or leave empty for auto-detection
        recognition.lang = language || (typeof navigator !== 'undefined' ? navigator.language : "");

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
            console.log("🎤 Speech recognition started");
        };

        recognition.onend = () => {
            setIsListening(false);
            console.log("🎤 Speech recognition ended");
        };

        recognition.onerror = (event) => {
            // Ignore aborted errors (happens when recognition restarts)
            if (event.error === 'aborted') {
                console.log("🎤 Speech recognition aborted (normal)");
                return;
            }
            const errorMessage = getErrorMessage(event.error);
            setError(errorMessage);
            setIsListening(false);
            onErrorRef.current?.(errorMessage);
            console.error("🎤 Speech recognition error:", event.error);
        };

        recognition.onresult = (event) => {
            let finalTranscript = "";
            let interimText = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interimText += result[0].transcript;
                }
            }

            if (finalTranscript) {
                setTranscript((prev) => prev + finalTranscript);
                onResultRef.current?.(finalTranscript);
            }
            setInterimTranscript(interimText);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) { /* ignore */ }
            }
        };
    }, [continuous, language]); // Removed onResult, onError - using refs instead

    const startListening = useCallback(() => {
        if (!recognitionRef.current || isListening) return;

        // Don't clear transcript - keep previous text so user can continue recording
        setInterimTranscript("");
        setError(null);

        try {
            recognitionRef.current.start();
        } catch (err) {
            console.error("Failed to start speech recognition:", err);
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return;

        try {
            recognitionRef.current.abort(); // Force stop immediately
            recognitionRef.current.stop();
            setIsListening(false); // Update state immediately
            setInterimTranscript(""); // Clear interim
            console.log("🎤 Speech recognition stopped by user");
        } catch (err) {
            console.error("Failed to stop speech recognition:", err);
            setIsListening(false); // Still update state even if error
        }
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    return {
        isListening,
        transcript,
        interimTranscript,
        error,
        startListening,
        stopListening,
        toggleListening,
        isSupported,
    };
}

function getErrorMessage(error: string): string {
    switch (error) {
        case "no-speech":
            return "No speech detected. Please try again.";
        case "audio-capture":
            return "Microphone not found or not accessible.";
        case "not-allowed":
            return "Microphone access denied. Please allow microphone access.";
        case "network":
            return "Network error occurred. Please check your connection.";
        case "aborted":
            return "Speech recognition was aborted.";
        case "language-not-supported":
            return "Language is not supported.";
        default:
            return `Speech recognition error: ${error}`;
    }
}

export default useSpeechRecognition;

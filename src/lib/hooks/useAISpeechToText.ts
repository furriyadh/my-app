"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseAISpeechToTextOptions {
    onTranscript?: (text: string) => void;
    onError?: (error: string) => void;
    silenceDelay?: number;
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

// Helper to encode AudioBuffer to WAV
function audioBufferToWav(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels = [];
    let i, sample;
    let offset = 0;
    let pos = 0;

    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit (hardcoded in this simple encoder)

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // write interleaved data
    for (i = 0; i < buffer.numberOfChannels; i++)
        channels.push(buffer.getChannelData(i));

    while (pos < buffer.length) {
        for (i = 0; i < numOfChan; i++) {
            // interleave channels
            sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
            view.setInt16(44 + offset, sample, true); // write 16-bit sample
            offset += 2;
        }
        pos++;
    }

    // Helper functions
    function setUint16(data: number) {
        view.setUint16(pos, data, true);
        pos += 2;
    }
    function setUint32(data: number) {
        view.setUint32(pos, data, true);
        pos += 4;
    }

    return new Blob([arrayBuffer], { type: "audio/wav" });
}

export function useAISpeechToText({
    onTranscript,
    onError,
    silenceDelay = 2000,
}: UseAISpeechToTextOptions = {}): UseAISpeechToTextResult {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(true);

    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const hasSoundRef = useRef(false);
    const audioChunksRef = useRef<Float32Array[]>([]); // Store raw PCM chunks
    const startTimeRef = useRef<number>(0);

    const cleanup = useCallback(() => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    }, []);

    const processAudio = useCallback(async () => {
        setIsProcessing(true);
        try {
            if (audioChunksRef.current.length === 0) throw new Error("No audio recorded");

            // Flatten chunks into a single buffer
            const totalLength = audioChunksRef.current.reduce((acc, chunk) => acc + chunk.length, 0);
            const audioBuffer = new Float32Array(totalLength);
            let offset = 0;
            for (const chunk of audioChunksRef.current) {
                audioBuffer.set(chunk, offset);
                offset += chunk.length;
            }

            // Create AudioBuffer
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const finalBuffer = context.createBuffer(1, totalLength, context.sampleRate);
            finalBuffer.copyToChannel(audioBuffer, 0);

            // Convert to WAV Blob
            const wavBlob = audioBufferToWav(finalBuffer);
            console.log("📦 Audio WAV size:", wavBlob.size, "bytes");

            if (wavBlob.size < 1000) {
                throw new Error("Recording too short");
            }

            const formData = new FormData();
            formData.append("audio", wavBlob, "audio.wav");

            const response = await fetch("/api/speech-to-text", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Transcription failed");
            }

            const data = await response.json();
            if (data.text) onTranscript?.(data.text);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed";
            setError(msg);
            onError?.(msg);
        } finally {
            setIsProcessing(false);
        }
    }, [onTranscript, onError]);

    const stopNow = useCallback(() => {
        console.log("🛑 Stopping recording now!");
        cleanup();
        processAudio();
        setIsRecording(false);
    }, [cleanup, processAudio]);

    const startRecording = useCallback(async () => {
        if (isRecording || isProcessing) return;

        if (!navigator.mediaDevices?.getUserMedia) {
            setIsSupported(false);
            setError("Microphone not supported");
            return;
        }

        try {
            setError(null);
            hasSoundRef.current = false;
            audioChunksRef.current = [];

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            streamRef.current = stream;

            // Setup AudioContext for recording AND silence detection
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            // Buffer size 4096 = ~92ms at 44.1kHz
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            const THRESHOLD = 0.02; // Silence threshold
            let silenceStart: number | null = null;
            startTimeRef.current = Date.now();

            processor.onaudioprocess = (e) => {
                const input = e.inputBuffer.getChannelData(0);

                // 1. Save data for recording (clone the array)
                audioChunksRef.current.push(new Float32Array(input));

                // 2. Silence detection logic
                let sum = 0;
                for (let i = 0; i < input.length; i++) {
                    sum += input[i] * input[i];
                }
                const rms = Math.sqrt(sum / input.length);

                if (rms > THRESHOLD) {
                    // Sound detected
                    hasSoundRef.current = true;
                    silenceStart = null;
                    if (silenceTimerRef.current) {
                        clearTimeout(silenceTimerRef.current);
                        silenceTimerRef.current = null;
                    }
                } else if (hasSoundRef.current) {
                    // Silence after speech
                    if (!silenceStart) {
                        silenceStart = Date.now();
                        console.log("🔇 Silence started...");
                    }

                    const silenceDuration = Date.now() - silenceStart;
                    if (silenceDuration >= silenceDelay && !silenceTimerRef.current) {
                        console.log("⏱️ Silence limit reached - auto-stopping!");
                        // We must stop via setTimeout to avoid blocking the audio thread
                        silenceTimerRef.current = setTimeout(stopNow, 0);
                    }
                }

                // Force stop max limit (30s)
                if (Date.now() - startTimeRef.current > 30000) {
                    stopNow();
                }
            };

            source.connect(processor);
            processor.connect(audioContext.destination);

            setIsRecording(true);
            console.log("🎤 PCM Recording started...");

        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to start";
            setError(msg);
            onError?.(msg);
            cleanup();
        }
    }, [isRecording, isProcessing, silenceDelay, stopNow, cleanup]);

    const stopRecording = useCallback(() => {
        if (isRecording) stopNow();
    }, [isRecording, stopNow]);

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

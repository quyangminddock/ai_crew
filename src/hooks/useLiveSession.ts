'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { GeminiLiveSession, createGeminiLiveSession, type LiveStatus, type LiveMessage } from '@/lib/ai/gemini-live'

export interface UseLiveSessionOptions {
    apiKey: string
    agentSystemPrompt?: string
    onMessage?: (message: LiveMessage) => void
    onStatusChange?: (status: LiveStatus) => void
    autoConnect?: boolean
}

export interface LiveSessionState {
    status: LiveStatus
    messages: LiveMessage[]
    isConnected: boolean
    error: string | null
}

/**
 * React hook for managing Gemini Live sessions
 * Handles WebSocket connection, media streaming, and state management
 */
export function useLiveSession(options: UseLiveSessionOptions) {
    const {
        apiKey,
        agentSystemPrompt,
        onMessage,
        onStatusChange,
        autoConnect = false,
    } = options

    const [state, setState] = useState<LiveSessionState>({
        status: 'disconnected',
        messages: [],
        isConnected: false,
        error: null,
    })

    const sessionRef = useRef<GeminiLiveSession | null>(null)
    const mediaStreamRef = useRef<MediaStream | null>(null)
    const videoIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const audioProcessorRef = useRef<ScriptProcessorNode | null>(null)
    const inputAnalyserRef = useRef<AnalyserNode | null>(null)

    const onMessageRef = useRef(onMessage)
    const onStatusChangeRef = useRef(onStatusChange)

    // Keep refs up to date
    useEffect(() => {
        onMessageRef.current = onMessage
        onStatusChangeRef.current = onStatusChange
    })

    // Initialize session
    useEffect(() => {
        if (!apiKey) return

        const session = createGeminiLiveSession({
            apiKey,
            systemPrompt: agentSystemPrompt,
            responseModalities: ['AUDIO'], // Only AUDIO for native audio models
        })

        // Set up message handler
        session.onMessage((message) => {
            setState((prev) => ({
                ...prev,
                messages: [...prev.messages, message],
            }))
            onMessageRef.current?.(message)
        })

        // Set up status handler
        session.onStatus((status) => {
            setState((prev) => ({
                ...prev,
                status,
                isConnected: status === 'connected' || status === 'listening' || status === 'speaking',
                error: status === 'error' ? 'Connection error' : null,
            }))
            onStatusChangeRef.current?.(status)
        })

        sessionRef.current = session

        return () => {
            session.disconnect()
        }
    }, [apiKey, agentSystemPrompt])

    // Auto-connect if enabled
    useEffect(() => {
        if (autoConnect && sessionRef.current && state.status === 'disconnected') {
            connect()
        }
    }, [autoConnect])

    const connect = useCallback(async () => {
        if (!sessionRef.current) return

        try {
            await sessionRef.current.connect()
        } catch (error) {
            console.error('Failed to connect:', error)
            setState((prev) => ({
                ...prev,
                error: 'Failed to connect to live session',
            }))
        }
    }, [])

    const disconnect = useCallback(() => {
        // Stop video streaming
        if (videoIntervalRef.current) {
            clearInterval(videoIntervalRef.current)
            videoIntervalRef.current = null
        }

        // Stop media stream
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop())
            mediaStreamRef.current = null
        }

        // Disconnect session
        sessionRef.current?.disconnect()
    }, [])

    const sendText = useCallback((text: string) => {
        sessionRef.current?.sendText(text)
    }, [])

    const sendAudio = useCallback((audioData: ArrayBuffer) => {
        sessionRef.current?.sendAudio(audioData)
    }, [])

    const sendVideoFrame = useCallback((base64Jpeg: string) => {
        sessionRef.current?.sendVideoFrame(base64Jpeg)
    }, [])

    /**
     * Request camera and microphone access
     */
    const requestMediaAccess = useCallback(
        async (constraints: MediaStreamConstraints = { video: true, audio: true }) => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia(constraints)
                mediaStreamRef.current = stream
                return stream
            } catch (error) {
                console.error('Failed to get media access:', error)
                setState((prev) => ({
                    ...prev,
                    error: 'Failed to access camera/microphone. Please grant permissions.',
                }))
                throw error
            }
        },
        []
    )

    /**
     * Start capturing and streaming audio from microphone
     */
    const startAudioStreaming = useCallback(() => {
        if (!mediaStreamRef.current) {
            console.error('[useLiveSession] No media stream available for audio')
            return
        }

        // Stop any existing audio streaming first
        stopAudioStreaming()

        try {
            const audioContext = new AudioContext({ sampleRate: 16000 })
            const source = audioContext.createMediaStreamSource(mediaStreamRef.current)
            const analyser = audioContext.createAnalyser()
            analyser.fftSize = 2048
            const processor = audioContext.createScriptProcessor(4096, 1, 1)

            source.connect(analyser)
            analyser.connect(processor)
            processor.connect(audioContext.destination)

            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0)

                // Convert Float32Array to Int16Array (16-bit PCM)
                const pcmData = new Int16Array(inputData.length)
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]))
                    pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff
                }

                // Send audio chunk
                sendAudio(pcmData.buffer)
            }

            // Store refs for cleanup
            audioContextRef.current = audioContext
            audioProcessorRef.current = processor
            inputAnalyserRef.current = analyser

            console.log('[useLiveSession] Audio streaming started')
        } catch (error) {
            console.error('[useLiveSession] Failed to start audio streaming:', error)
        }
    }, [sendAudio])

    const stopAudioStreaming = useCallback(() => {
        console.log('[useLiveSession] Stopping audio streaming...')

        // Disconnect and close audio processor
        if (audioProcessorRef.current) {
            audioProcessorRef.current.disconnect()
            audioProcessorRef.current.onaudioprocess = null
            audioProcessorRef.current = null
        }

        // Close audio context
        if (audioContextRef.current) {
            audioContextRef.current.close().catch((err: any) => {
                console.error('[useLiveSession] Error closing audio context:', err)
            })
            audioContextRef.current = null
        }

        console.log('[useLiveSession] Audio streaming stopped')
    }, [])

    /**
     * Start streaming video frames to the AI
     * Captures frames at ~1fps (recommended for Gemini Live)
     */
    const startVideoStreaming = useCallback(
        (videoElement: HTMLVideoElement) => {
            if (videoIntervalRef.current) {
                clearInterval(videoIntervalRef.current)
            }

            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            if (!ctx) {
                console.error('Failed to get canvas context')
                return
            }

            // Capture and send frames at 1fps
            videoIntervalRef.current = setInterval(() => {
                if (!videoElement.videoWidth || !videoElement.videoHeight) return

                // Resize to 768x768 (recommended for Gemini)
                canvas.width = 768
                canvas.height = 768

                // Calculate aspect ratio to fit
                const scale = Math.min(768 / videoElement.videoWidth, 768 / videoElement.videoHeight)
                const w = videoElement.videoWidth * scale
                const h = videoElement.videoHeight * scale
                const x = (768 - w) / 2
                const y = (768 - h) / 2

                // Clear and draw
                ctx.fillStyle = '#000'
                ctx.fillRect(0, 0, 768, 768)
                ctx.drawImage(videoElement, x, y, w, h)

                // Convert to JPEG base64
                canvas.toBlob(
                    (blob) => {
                        if (!blob) return

                        const reader = new FileReader()
                        reader.onloadend = () => {
                            const base64 = (reader.result as string).split(',')[1]
                            sendVideoFrame(base64)
                        }
                        reader.readAsDataURL(blob)
                    },
                    'image/jpeg',
                    0.8
                )
            }, 1000) // 1fps
        },
        [sendVideoFrame]
    )

    const stopVideoStreaming = useCallback(() => {
        if (videoIntervalRef.current) {
            clearInterval(videoIntervalRef.current)
            videoIntervalRef.current = null
        }
    }, [])

    return {
        // State
        ...state,

        // Methods
        connect,
        disconnect,
        sendText,
        sendAudio,
        sendVideoFrame,
        requestMediaAccess,
        startAudioStreaming,
        stopAudioStreaming,
        startVideoStreaming,
        stopVideoStreaming,

        // Refs
        mediaStream: mediaStreamRef.current,
        inputAnalyser: inputAnalyserRef.current,
    }
}

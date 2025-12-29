/**
 * Gemini Live API Client using Official @google/genai SDK
 * 
 * This implementation uses the official Google GenAI SDK for browser environments
 * https://ai.google.dev/gemini-api/docs/live-guide
 */

import { GoogleGenAI, Modality } from '@google/genai'

export type LiveStatus = 'disconnected' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error'

export interface LiveMessage {
    type: 'text' | 'audio' | 'status' | 'error'
    content?: string
    audioData?: ArrayBuffer
    expression?: string
}

export interface GeminiLiveConfig {
    apiKey: string
    model?: string
    systemPrompt?: string
    voice?: string
    responseModalities?: ('TEXT' | 'AUDIO')[]
}

type MessageHandler = (message: LiveMessage) => void
type StatusHandler = (status: LiveStatus) => void

export class GeminiLiveSession {
    private session: any = null
    private ai: any
    private apiKey: string
    private model: string
    private systemPrompt: string
    private voice: string
    private responseModalities: ('TEXT' | 'AUDIO')[]
    private status: LiveStatus = 'disconnected'
    private messageHandlers: MessageHandler[] = []
    private statusHandlers: StatusHandler[] = []

    constructor(config: GeminiLiveConfig) {
        this.apiKey = config.apiKey
        this.model = config.model || 'gemini-2.5-flash-native-audio-preview-12-2025'
        this.systemPrompt = config.systemPrompt || 'You are a helpful and friendly AI assistant.'
        this.voice = config.voice || 'Puck'
        this.responseModalities = config.responseModalities || ['AUDIO']

        // Initialize GoogleGenAI with API key
        this.ai = new GoogleGenAI({ apiKey: this.apiKey })
    }

    // Event handlers
    onMessage(handler: MessageHandler) {
        this.messageHandlers.push(handler)
        return () => {
            this.messageHandlers = this.messageHandlers.filter(h => h !== handler)
        }
    }

    onStatus(handler: StatusHandler) {
        this.statusHandlers.push(handler)
        return () => {
            this.statusHandlers = this.statusHandlers.filter(h => h !== handler)
        }
    }

    private emit(message: LiveMessage) {
        this.messageHandlers.forEach(handler => handler(message))
    }

    private setStatus(status: LiveStatus) {
        this.status = status
        this.statusHandlers.forEach(handler => handler(status))
    }

    getStatus(): LiveStatus {
        return this.status
    }

    async connect(): Promise<void> {
        this.setStatus('connecting')
        console.log('[GeminiLive] Connecting using official SDK...')

        try {
            // Convert modalities to SDK format
            const modalities = this.responseModalities.map(m =>
                m === 'AUDIO' ? Modality.AUDIO : Modality.TEXT
            )

            const config = {
                responseModalities: modalities,
                systemInstruction: this.systemPrompt,
            }

            // Connect using official SDK
            this.session = await this.ai.live.connect({
                model: this.model,
                config: config,
                callbacks: {
                    onopen: () => {
                        console.log('[GeminiLive] Connected!')
                        this.setStatus('connected')
                    },
                    onmessage: (message: any) => {
                        this.handleMessage(message)
                    },
                    onerror: (e: any) => {
                        console.error('[GeminiLive] Error:', e)
                        console.error('[GeminiLive] Error details:', JSON.stringify(e, null, 2))
                        this.setStatus('error')
                        this.emit({ type: 'error', content: e?.message || 'Connection error' })
                    },
                    onclose: (e: any) => {
                        console.log('[GeminiLive] Closed:', e.reason)
                        this.setStatus('disconnected')
                    },
                },
            })

            console.log('[GeminiLive] Session established')
        } catch (error) {
            console.error('[GeminiLive] Connection failed:', error)
            this.setStatus('error')
            throw error
        }
    }

    private handleMessage(message: any) {
        try {
            // Handle interruption
            if (message.serverContent && message.serverContent.interrupted) {
                console.log('[GeminiLive] Model interrupted')
                return
            }

            // Handle server content (responses)
            if (message.serverContent && message.serverContent.modelTurn) {
                const parts = message.serverContent.modelTurn.parts || []

                for (const part of parts) {
                    // Handle text
                    if (part.text) {
                        this.emit({
                            type: 'text',
                            content: part.text,
                            expression: this.inferExpression(part.text)
                        })
                    }

                    // Handle audio
                    if (part.inlineData && part.inlineData.data) {
                        const audioBuffer = this.base64ToArrayBuffer(part.inlineData.data)
                        this.emit({
                            type: 'audio',
                            audioData: audioBuffer
                        })
                    }
                }

                // Check turn completion
                if (message.serverContent.turnComplete) {
                    this.setStatus('listening')
                }
            }
        } catch (err) {
            console.error('[GeminiLive] Failed to parse message:', err)
        }
    }

    disconnect() {
        console.log('[GeminiLive] Disconnecting...')
        this.setStatus('disconnected')
        if (this.session) {
            this.session.close()
            this.session = null
        }
    }

    /**
     * Send text message to the model
     */
    sendText(text: string): void {
        if (!this.session || this.status !== 'connected' && this.status !== 'listening' && this.status !== 'speaking') {
            console.warn('[GeminiLive] Cannot send text: not in valid state', this.status)
            return
        }

        console.log('[GeminiLive] Sending text:', text)
        try {
            // Use correct format for Gemini Live SDK
            this.session.sendClientContent({
                turns: [{
                    role: 'user',
                    parts: [{ text }]
                }],
                turnComplete: true
            })
        } catch (error) {
            console.error('[GeminiLive] Failed to send text:', error)
        }
    }

    /**
     * Send raw audio data (PCM format) for real-time audio input
     */
    sendAudio(audioData: ArrayBuffer): void {
        if (!this.session || this.status !== 'connected' && this.status !== 'listening' && this.status !== 'speaking') {
            // Silently ignore if not connected - prevents console spam
            return
        }
        try {
            // Convert ArrayBuffer to base64
            const base64Audio = this.arrayBufferToBase64(audioData)
            this.session.sendRealtimeInput({
                audio: {
                    data: base64Audio,
                    mimeType: 'audio/pcm;rate=16000'
                }
            })
        } catch (error) {
            // Silently handle - connection may have closed
        }
    }

    /**
     * Send video frame for real-time video input
     */
    sendVideoFrame(imageData: string): void {
        if (!this.session || this.status !== 'connected' && this.status !== 'listening' && this.status !== 'speaking') {
            // Silently ignore if not connected
            return
        }
        try {
            // imageData should be base64 encoded JPEG
            const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
            this.session.sendRealtimeInput({
                video: {
                    data: base64Data,
                    mimeType: 'image/jpeg'
                }
            })
        } catch (error) {
            // Silently handle - connection may have closed
        }
    }

    /**
     * Infer expression/emotion from text content
     */
    private inferExpression(text: string): string {
        const lowerText = text.toLowerCase()

        if (lowerText.includes('!') || lowerText.includes('great') || lowerText.includes('excellent')) {
            return '✨ Excited'
        }
        if (lowerText.includes('?') || lowerText.includes('think') || lowerText.includes('consider')) {
            return '🤔 Thinking'
        }
        if (lowerText.includes('sorry') || lowerText.includes('unfortunately')) {
            return '😔 Concerned'
        }
        if (lowerText.includes('let me') || lowerText.includes('working')) {
            return '💡 Processing'
        }

        return '👀 Engaged'
    }

    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binaryString = atob(base64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
        }
        return bytes.buffer
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = ''
        const bytes = new Uint8Array(buffer)
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i])
        }
        return btoa(binary)
    }
}

/**
 * Create a new Gemini Live session
 */
export function createGeminiLiveSession(config: GeminiLiveConfig): GeminiLiveSession {
    return new GeminiLiveSession(config)
}

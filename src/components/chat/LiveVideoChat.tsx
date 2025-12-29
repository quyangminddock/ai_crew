'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useLiveSession } from '@/hooks/useLiveSession'
import { useFaceMesh } from '@/hooks/useFaceMesh'
import { AudioWaveform } from './AudioWaveform'
import { TranscriptScroller } from './TranscriptScroller'
import type { LiveMessage } from '@/lib/ai/gemini-live'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, PhoneOff, Loader2 } from 'lucide-react'
import {
    drawPath,
    drawEyeGlow,
    fillRegion,
    FACE_MESH_INDICES,
    getExpressionEffect
} from '@/lib/ar/faceMeshUtils'

export interface LiveVideoChatProps {
    agentId: string
    agentName: string
    apiKey: string
    systemPrompt?: string
    initialContext?: string
    locale?: 'zh' | 'en'
    onClose?: () => void
    onSessionEnd?: (transcript: Array<{ role: 'user' | 'assistant'; content: string; timestamp: number }>) => void
}

export function LiveVideoChat({
    agentId,
    agentName,
    apiKey,
    systemPrompt,
    initialContext,
    locale = 'zh',
    onClose,
    onSessionEnd,
}: LiveVideoChatProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    const audioQueueRef = useRef<Blob[]>([])
    const isPlayingRef = useRef(false)
    const hasSentInitialContextRef = useRef(false)
    const playbackAudioContextRef = useRef<AudioContext | null>(null)
    const nextStartTimeRef = useRef(0)
    const [audioEnabled, setAudioEnabled] = useState(true)
    const [currentExpression, setCurrentExpression] = useState<string>('Engaged')
    const [transcriptMessages, setTranscriptMessages] = useState<Array<{ id: string; content: string; timestamp: number }>>([])

    const {
        status,
        messages,
        isConnected,
        error,
        connect,
        disconnect,
        sendText,
        requestMediaAccess,
        startAudioStreaming,
        stopAudioStreaming,
        startVideoStreaming,
        stopVideoStreaming,
        mediaStream,
        inputAnalyser,
    } = useLiveSession({
        apiKey,
        agentSystemPrompt: systemPrompt,
        onMessage: (message: LiveMessage) => {
            // Update expression
            if (message.expression) {
                setCurrentExpression(message.expression)
            }

            // Collect text messages for transcript
            if (message.type === 'text' && message.content) {
                const content = message.content // Type narrowing
                setTranscriptMessages(prev => [
                    ...prev,
                    {
                        id: `msg-${Date.now()}-${Math.random()}`,
                        content,
                        timestamp: Date.now()
                    }
                ])
            }

            // Queue audio for sequential playback
            if (message.type === 'audio' && message.audioData) {
                const blob = new Blob([message.audioData], { type: 'audio/pcm' })
                audioQueueRef.current.push(blob)
                playNextAudio()
            }
        },
        onStatusChange: (newStatus) => {
            console.log('Status:', newStatus)
        },
    })

    const playNextAudio = useCallback(() => {
        if (isPlayingRef.current || audioQueueRef.current.length === 0) {
            return
        }

        isPlayingRef.current = true
        const audioBlob = audioQueueRef.current.shift()!

        // Convert blob to ArrayBuffer for Web Audio API
        audioBlob.arrayBuffer().then(arrayBuffer => {
            // Reuse or create AudioContext with correct sample rate
            if (!playbackAudioContextRef.current) {
                playbackAudioContextRef.current = new AudioContext({
                    sampleRate: 24000,
                    latencyHint: 'interactive' // Lower latency for better responsiveness
                })
                nextStartTimeRef.current = playbackAudioContextRef.current.currentTime
            }

            const audioContext = playbackAudioContextRef.current

            // PCM data is 16-bit signed integers (Little Endian)
            const pcmData = new Int16Array(arrayBuffer)

            // Validate data length
            if (pcmData.length === 0) {
                console.warn('[LiveVideoChat] Empty audio chunk received')
                isPlayingRef.current = false
                playNextAudio()
                return
            }

            // Convert to Float32Array for AudioBuffer (-1.0 to 1.0)
            // Proper normalization for 16-bit signed PCM
            const floatData = new Float32Array(pcmData.length)
            for (let i = 0; i < pcmData.length; i++) {
                // More accurate conversion: divide by 32768 for negative, 32767 for positive
                floatData[i] = pcmData[i] < 0
                    ? pcmData[i] / 32768.0
                    : pcmData[i] / 32767.0
            }

            // Create AudioBuffer (mono, 24kHz to match Gemini output)
            const audioBuffer = audioContext.createBuffer(
                1,  // mono
                floatData.length,
                24000  // sample rate must match Gemini Live output
            )
            audioBuffer.copyToChannel(floatData, 0)

            // Create and schedule source
            const source = audioContext.createBufferSource()
            source.buffer = audioBuffer

            // Schedule to play immediately after previous audio
            const currentTime = audioContext.currentTime
            const startTime = Math.max(currentTime, nextStartTimeRef.current)

            source.onended = () => {
                isPlayingRef.current = false
                playNextAudio() // Play next in queue
            }

            source.connect(audioContext.destination)
            source.start(startTime)

            // Update next start time for seamless playback
            nextStartTimeRef.current = startTime + audioBuffer.duration

        }).catch(error => {
            console.error('[LiveVideoChat] Audio playback error:', error)
            isPlayingRef.current = false
            playNextAudio() // Try next audio
        })
    }, [])

    // Face mesh detection
    const { landmarks } = useFaceMesh(videoRef.current)

    // Initialize media and connection
    useEffect(() => {
        async function init() {
            try {
                const stream = await requestMediaAccess({
                    video: true,
                    audio: audioEnabled,
                })

                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                }

                await connect()

                // Start audio and video streaming
                startAudioStreaming()
                if (videoRef.current) {
                    startVideoStreaming(videoRef.current)
                }
            } catch (err) {
                console.error('Initialization error:', err)
            }
        }

        init()

        return () => {
            console.log('[LiveVideoChat] Cleanup: disconnecting session and stopping streams')

            // Stop audio and video streaming
            stopAudioStreaming()
            stopVideoStreaming()

            // Disconnect Gemini Live session
            disconnect()

            // Stop all media tracks
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => {
                    track.stop()
                    console.log('[LiveVideoChat] Stopped track:', track.kind)
                })
            }

            // Stop video element
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream
                stream.getTracks().forEach(track => track.stop())
                videoRef.current.srcObject = null
            }

            // Clear audio queue and close playback context
            audioQueueRef.current = []
            isPlayingRef.current = false
            if (playbackAudioContextRef.current) {
                playbackAudioContextRef.current.close()
                playbackAudioContextRef.current = null
            }

            // Reset sent flag
            hasSentInitialContextRef.current = false
        }
    }, []) // Empty deps - cleanup refs are stable

    // Auto-send initial context when connected
    useEffect(() => {
        if (isConnected && initialContext && status === 'connected' && !hasSentInitialContextRef.current) {
            console.log('[LiveVideoChat] Auto-sending initial context:', initialContext)
            hasSentInitialContextRef.current = true
            // Send after a short delay to ensure connection is fully ready
            setTimeout(() => {
                sendText(initialContext)
            }, 1000)
        }
    }, [isConnected, initialContext, status, sendText])

    // AR rendering loop
    useEffect(() => {
        if (!canvasRef.current || !videoRef.current || !landmarks) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Match canvas size to video
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Get expression effects
        const effects = getExpressionEffect(currentExpression)

        // Draw face oval outline
        drawPath(
            ctx,
            landmarks,
            FACE_MESH_INDICES.faceOval,
            '#00d9ff',
            3,
            true
        )

        // Draw and fill eyes with glow
        drawEyeGlow(ctx, landmarks, effects.eyeColor)
        fillRegion(ctx, landmarks, FACE_MESH_INDICES.leftEye, effects.eyeColor, 0.2)
        fillRegion(ctx, landmarks, FACE_MESH_INDICES.rightEye, effects.eyeColor, 0.2)

        // Draw mouth
        drawPath(ctx, landmarks, FACE_MESH_INDICES.lipsOuter, effects.mouthColor, 3, true)
        fillRegion(ctx, landmarks, FACE_MESH_INDICES.lipsOuter, effects.mouthColor, 0.15)
    }, [landmarks, currentExpression])

    const handleToggleAudio = () => {
        setAudioEnabled(!audioEnabled)
    }

    // Allow user to interrupt AI speech by clearing audio queue
    const handleInterrupt = () => {
        console.log('[LiveVideoChat] User interrupting AI...')
        // Clear pending audio queue
        audioQueueRef.current = []
        isPlayingRef.current = false

        // Reset playback context timing
        if (playbackAudioContextRef.current) {
            nextStartTimeRef.current = playbackAudioContextRef.current.currentTime
        }
    }

    const handleEndCall = () => {
        // Pass full conversation transcript for task breakdown
        if (onSessionEnd && transcriptMessages.length > 0) {
            const transcript = transcriptMessages.map(msg => ({
                role: 'assistant' as const, // AI messages from Gemini Live
                content: msg.content,
                timestamp: msg.timestamp
            }))
            onSessionEnd(transcript)
        }

        // Stop video streaming
        stopVideoStreaming()

        // Stop all media tracks
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop())
        }

        // Stop video element tracks
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream
            stream.getTracks().forEach(track => track.stop())
            videoRef.current.srcObject = null
        }

        // Disconnect session
        disconnect()

        // Call parent close handler
        onClose?.()
    }

    const getStatusText = () => {
        switch (status) {
            case 'connecting':
                return '连接中...'
            case 'connected':
                return '已连接'
            case 'listening':
                return '聆听中...'
            case 'speaking':
                return 'AI 回应中...'
            case 'error':
                return '连接错误'
            default:
                return '未连接'
        }
    }

    const getStatusColor = () => {
        switch (status) {
            case 'connected':
            case 'listening':
                return 'bg-green-500'
            case 'speaking':
                return 'bg-blue-500'
            case 'connecting':
                return 'bg-yellow-500'
            case 'error':
                return 'bg-red-500'
            default:
                return 'bg-gray-500'
        }
    }

    return (
        <div className="relative flex flex-col h-full w-full bg-black overflow-hidden">
            {/* Full-screen video */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* AR Canvas Overlay */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />

            {/* Top Header Overlay */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
                    <div>
                        <h2 className="text-lg font-semibold text-white">{agentName}</h2>
                        <p className="text-sm text-gray-300">{getStatusText()}</p>
                    </div>
                </div>
                <button
                    onClick={handleEndCall}
                    className="p-3 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                    title="结束通话"
                >
                    <PhoneOff className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Discussion Topic Card - Always visible */}
            {initialContext && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 w-[90%] max-w-2xl">
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-900/80 to-purple-900/80 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl flex-shrink-0 mt-0.5">💡</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-blue-200 font-medium mb-1">
                                    {locale === 'zh' ? '讨论主题' : 'Discussion Topic'}
                                </p>
                                <p className="text-sm text-white leading-relaxed line-clamp-2">
                                    {initialContext}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-4 px-6 py-8 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-sm">
                <button
                    onClick={handleToggleAudio}
                    className={`p-4 rounded-full transition-colors ${audioEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'
                        }`}
                    title={audioEnabled ? '静音麦克风' : '取消静音'}
                >
                    {audioEnabled ? (
                        <Mic className="w-6 h-6 text-white" />
                    ) : (
                        <MicOff className="w-6 h-6 text-white" />
                    )}
                </button>

                {/* Interrupt Button */}
                <button
                    onClick={handleInterrupt}
                    className="p-4 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors"
                    title={locale === 'zh' ? '打断AI说话' : 'Interrupt AI'}
                >
                    <span className="text-white text-lg font-bold">✋</span>
                </button>

                {status === 'connecting' && (
                    <div className="flex items-center gap-2 text-white">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">连接中...</span>
                    </div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10 px-6 py-4 bg-red-500/90 backdrop-blur-sm rounded-xl text-white text-sm max-w-md text-center">
                    {error}
                </div>
            )}

            {/* Audio Waveform Display */}
            {inputAnalyser && (
                <div className="absolute bottom-20 left-4 right-4 z-10">
                    <AudioWaveform
                        analyserNode={inputAnalyser}
                        color="#10B981"
                        label="🎤 You"
                        height={50}
                    />
                </div>
            )}

            {/* Transcript Scroller - Right Side */}
            {transcriptMessages.length > 0 && (
                <div className="absolute top-32 right-4 z-10 w-80">
                    <TranscriptScroller
                        messages={transcriptMessages}
                        fadeOutDelay={5000}
                    />
                </div>
            )}

            {/* Hidden audio element for AI responses */}
            <audio ref={audioRef} className="hidden" />
        </div>
    )
}

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mic, MicOff, Video, VideoOff, Send } from 'lucide-react'
import { GeminiLiveSession, createGeminiLiveSession, type LiveStatus, type LiveMessage } from '@/lib/ai/gemini-live'

interface LiveInterfaceProps {
    apiKey: string
    systemPrompt?: string
    agentName?: string
    onClose: () => void
    onTranscript?: (role: 'user' | 'assistant', text: string) => void
}

export function LiveInterface({
    apiKey,
    systemPrompt = 'You are a helpful AI engineer. Be concise and engaging in conversation.',
    agentName = 'AI Engineer',
    onClose,
    onTranscript
}: LiveInterfaceProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const sessionRef = useRef<GeminiLiveSession | null>(null)

    const [stream, setStream] = useState<MediaStream | null>(null)
    const [status, setStatus] = useState<LiveStatus>('disconnected')
    const [expression, setExpression] = useState<string>('👋 Ready to connect')
    const [streamingText, setStreamingText] = useState<string>('')
    const [keyHighlights, setKeyHighlights] = useState<string[]>([])
    const [inputText, setInputText] = useState('')
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOn, setIsVideoOn] = useState(true)

    // Initialize webcam and Gemini Live session
    useEffect(() => {
        async function init() {
            // Start webcam
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 768, height: 768, frameRate: 1 },
                    audio: false
                })
                setStream(mediaStream)
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream
                }
            } catch (err) {
                console.error('Failed to access webcam:', err)
            }

            // Create Gemini Live session
            const session = createGeminiLiveSession({
                apiKey,
                systemPrompt,
                responseModalities: ['TEXT']
            })

            // Set up handlers
            session.onStatus((newStatus) => {
                setStatus(newStatus)
                if (newStatus === 'connected') {
                    setExpression('👋 Connected! Ready to chat')
                } else if (newStatus === 'speaking') {
                    setExpression('🗣️ Listening to you...')
                } else if (newStatus === 'listening') {
                    setExpression('🤔 Thinking...')
                }
            })

            session.onMessage((msg: LiveMessage) => {
                if (msg.type === 'text' && msg.content) {
                    setStreamingText(prev => prev + msg.content)
                    if (msg.expression) {
                        setExpression(msg.expression)
                    }
                    // Extract key phrases for highlights
                    extractKeyHighlights(msg.content!)
                    // Report to parent for transcript
                    if (onTranscript) {
                        onTranscript('assistant', msg.content)
                    }
                }
                if (msg.type === 'error') {
                    setExpression('❌ Error: ' + msg.content)
                }
            })

            sessionRef.current = session

            // Attempt connection
            try {
                await session.connect()
            } catch (err) {
                console.error('Failed to connect to Gemini Live:', err)
                setExpression('❌ Connection failed')
            }
        }

        init()

        return () => {
            // Cleanup
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
            if (sessionRef.current) {
                sessionRef.current.disconnect()
            }
        }
    }, [apiKey, systemPrompt])

    // Send video frames periodically (1 FPS)
    useEffect(() => {
        if (!isVideoOn || !stream || status !== 'connected') return

        const interval = setInterval(() => {
            if (videoRef.current && canvasRef.current && sessionRef.current) {
                const video = videoRef.current
                const canvas = canvasRef.current
                const ctx = canvas.getContext('2d')
                if (ctx) {
                    canvas.width = 768
                    canvas.height = 768
                    ctx.drawImage(video, 0, 0, 768, 768)
                    const jpegData = canvas.toDataURL('image/jpeg', 0.8).split(',')[1]
                    sessionRef.current.sendVideoFrame(jpegData)
                }
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [isVideoOn, stream, status])

    // Extract key phrases from text for scrolling display
    const extractKeyHighlights = useCallback((text: string) => {
        const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10)
        if (sentences.length > 0) {
            const newHighlight = sentences[0].trim().slice(0, 60)
            setKeyHighlights(prev => [...prev.slice(-4), newHighlight])
        }
    }, [])

    // Send text message
    const handleSendText = () => {
        if (!inputText.trim() || !sessionRef.current) return

        sessionRef.current.sendText(inputText)
        if (onTranscript) {
            onTranscript('user', inputText)
        }
        setStreamingText('')
        setInputText('')
    }

    // Toggle mute (for future audio implementation)
    const toggleMute = () => setIsMuted(!isMuted)

    // Toggle video
    const toggleVideo = () => {
        setIsVideoOn(!isVideoOn)
        if (stream) {
            stream.getVideoTracks().forEach(track => {
                track.enabled = !isVideoOn
            })
        }
    }

    // Status color
    const statusColor = {
        disconnected: 'bg-gray-500',
        connecting: 'bg-yellow-500 animate-pulse',
        connected: 'bg-green-500',
        speaking: 'bg-blue-500 animate-pulse',
        listening: 'bg-purple-500 animate-pulse',
        error: 'bg-red-500'
    }[status]

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
            {/* Hidden canvas for frame capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Top Bar */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full z-10">
                <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${statusColor}`} />
                    <div>
                        <span className="font-mono text-sm uppercase tracking-wider">Live with {agentName}</span>
                        <p className="text-xs text-neutral-400 capitalize">{status}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors backdrop-blur-md"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Main Video Area */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                {/* Webcam Feed */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity ${isVideoOn ? 'opacity-100' : 'opacity-30'}`}
                />

                {/* AI Response Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-8 pb-40">
                    <AnimatePresence mode="wait">
                        {streamingText && (
                            <motion.div
                                key="response"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-3xl mx-auto w-full"
                            >
                                <div className="bg-black/70 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl">
                                    <p className="text-xl md:text-2xl font-medium leading-relaxed text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-300">
                                        {streamingText.slice(-500)}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Expression Badge */}
                <div className="absolute top-24 right-8">
                    <motion.div
                        key={expression}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-sm font-medium"
                    >
                        {expression}
                    </motion.div>
                </div>

                {/* Key Highlights Scroll */}
                {keyHighlights.length > 0 && (
                    <div className="absolute left-8 top-1/2 -translate-y-1/2 max-w-xs">
                        <div className="flex flex-col gap-2">
                            {keyHighlights.map((highlight, i) => (
                                <motion.div
                                    key={`${i}-${highlight.slice(0, 10)}`}
                                    initial={{ x: -50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 0.7 - i * 0.15 }}
                                    className="bg-black/40 backdrop-blur px-3 py-1.5 rounded-lg border-l-2 border-[#FF6B35] text-xs text-neutral-300"
                                >
                                    {highlight}...
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="bg-black/90 backdrop-blur-xl p-6 pb-8 border-t border-white/10">
                {/* Text Input */}
                <div className="max-w-2xl mx-auto mb-6">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                            placeholder={status === 'connected' ? "Type a message..." : "Connecting..."}
                            disabled={status !== 'connected' && status !== 'listening'}
                            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6B35] disabled:opacity-50"
                        />
                        <button
                            onClick={handleSendText}
                            disabled={!inputText.trim() || (status !== 'connected' && status !== 'listening')}
                            className="bg-[#FF6B35] hover:bg-[#E65A2C] disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-xl transition-colors"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-6">
                    <button
                        onClick={toggleMute}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-neutral-800 group-hover:bg-neutral-700'}`}>
                            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        </div>
                        <span className="text-xs text-neutral-400">{isMuted ? 'Unmute' : 'Mute'}</span>
                    </button>

                    {/* Status Indicator */}
                    <div className="flex flex-col items-center gap-2">
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center border-2 transition-colors ${status === 'connected' || status === 'listening' ? 'bg-green-500/10 border-green-500/50' : status === 'speaking' ? 'bg-blue-500/10 border-blue-500/50 animate-pulse' : 'bg-neutral-800 border-neutral-600'}`}>
                            <div className={`h-8 w-8 rounded-full ${statusColor}`} />
                        </div>
                        <span className="text-xs text-neutral-400 capitalize">{status}</span>
                    </div>

                    <button
                        onClick={toggleVideo}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${!isVideoOn ? 'bg-red-500/20 text-red-400' : 'bg-neutral-800 group-hover:bg-neutral-700'}`}>
                            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                        </div>
                        <span className="text-xs text-neutral-400">{isVideoOn ? 'Video On' : 'Video Off'}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}


'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TranscriptMessage {
    id: string
    content: string
    timestamp: number
}

interface TranscriptScrollerProps {
    messages: TranscriptMessage[]
    fadeOutDelay?: number // ms before message fades
}

export function TranscriptScroller({
    messages,
    fadeOutDelay = 5000,
}: TranscriptScrollerProps) {
    const [visibleMessages, setVisibleMessages] = useState<Set<string>>(new Set())

    useEffect(() => {
        // Show new messages
        const latestMessages = messages.slice(-3) // Show last 3
        const newVisible = new Set(latestMessages.map(m => m.id))
        setVisibleMessages(newVisible)

        // Auto-hide after delay
        const timers = latestMessages.map(msg => {
            return setTimeout(() => {
                setVisibleMessages(prev => {
                    const next = new Set(prev)
                    next.delete(msg.id)
                    return next
                })
            }, fadeOutDelay)
        })

        return () => timers.forEach(clearTimeout)
    }, [messages, fadeOutDelay])

    const displayMessages = messages.filter(m => visibleMessages.has(m.id))

    return (
        <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
            <AnimatePresence>
                {displayMessages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="px-3 py-2 bg-black/50 backdrop-blur-sm rounded-lg border border-white/10"
                    >
                        <p className="text-sm text-white/90 leading-relaxed">
                            {msg.content}
                        </p>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

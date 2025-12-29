'use client'

import { useEffect, useRef } from 'react'

interface AudioWaveformProps {
    analyserNode: AnalyserNode | null
    color?: string
    label?: string
    height?: number
}

export function AudioWaveform({
    analyserNode,
    color = '#10B981',
    label,
    height = 60,
}: AudioWaveformProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationRef = useRef<number | undefined>(undefined)

    useEffect(() => {
        if (!analyserNode || !canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d', { alpha: true })
        if (!ctx) return

        // Set canvas resolution
        canvas.width = canvas.offsetWidth * window.devicePixelRatio
        canvas.height = height * window.devicePixelRatio
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

        const bufferLength = analyserNode.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw)

            analyserNode.getByteTimeDomainData(dataArray)

            // Clear canvas
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
            ctx.fillRect(0, 0, canvas.offsetWidth, height)

            // Draw waveform
            ctx.lineWidth = 2
            ctx.strokeStyle = color
            ctx.beginPath()

            const sliceWidth = canvas.offsetWidth / bufferLength
            let x = 0

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0
                const y = (v * height) / 2

                if (i === 0) {
                    ctx.moveTo(x, y)
                } else {
                    ctx.lineTo(x, y)
                }

                x += sliceWidth
            }

            ctx.lineTo(canvas.offsetWidth, height / 2)
            ctx.stroke()
        }

        draw()

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [analyserNode, color, height])

    return (
        <div className="flex flex-col gap-1">
            {label && <span className="text-xs text-neutral-400">{label}</span>}
            <canvas
                ref={canvasRef}
                className="w-full rounded border border-neutral-200"
                style={{ height: `${height}px` }}
            />
        </div>
    )
}

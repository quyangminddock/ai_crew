/**
 * Custom hook for MediaPipe Face Mesh detection
 * Provides real-time face landmark tracking from video element
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import type { FaceLandmark } from '@/lib/ar/faceMeshUtils'

export interface FaceMeshResult {
    landmarks: FaceLandmark[][]
    timestamp: number
}

export function useFaceMesh(videoElement: HTMLVideoElement | null) {
    const [isReady, setIsReady] = useState(false)
    const [result, setResult] = useState<FaceMeshResult | null>(null)
    const faceLandmarkerRef = useRef<FaceLandmarker | null>(null)
    const animationFrameRef = useRef<number | null>(null)

    // Initialize MediaPipe Face Landmarker
    useEffect(() => {
        let mounted = true

        async function initializeFaceMesh() {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
                )

                const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                        delegate: 'GPU'
                    },
                    runningMode: 'VIDEO',
                    numFaces: 1,
                    minFaceDetectionConfidence: 0.5,
                    minFacePresenceConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                    outputFaceBlendshapes: false,
                    outputFacialTransformationMatrixes: false
                })

                if (mounted) {
                    faceLandmarkerRef.current = faceLandmarker
                    setIsReady(true)
                }
            } catch (error) {
                console.error('Failed to initialize Face Landmarker:', error)
            }
        }

        initializeFaceMesh()

        return () => {
            mounted = false
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [])

    // Process video frames
    useEffect(() => {
        if (!isReady || !videoElement || !faceLandmarkerRef.current) return

        let lastVideoTime = -1

        function detectFace() {
            if (!videoElement || !faceLandmarkerRef.current) return

            // Check if video is ready
            if (videoElement.readyState < 2 || videoElement.videoWidth === 0) {
                animationFrameRef.current = requestAnimationFrame(detectFace)
                return
            }

            const currentTime = videoElement.currentTime

            // Only process if video time has changed
            if (currentTime !== lastVideoTime) {
                lastVideoTime = currentTime

                try {
                    const detections = faceLandmarkerRef.current.detectForVideo(
                        videoElement,
                        Date.now()
                    )

                    if (detections.faceLandmarks && detections.faceLandmarks.length > 0) {
                        // Convert to our format
                        const landmarks: FaceLandmark[][] = detections.faceLandmarks.map(face =>
                            face.map((landmark: any) => ({
                                x: landmark.x * videoElement.videoWidth,
                                y: landmark.y * videoElement.videoHeight,
                                z: landmark.z
                            }))
                        )

                        setResult({
                            landmarks,
                            timestamp: Date.now()
                        })
                    }
                } catch (error) {
                    console.error('Face detection error:', error)
                }
            }

            // Continue loop
            animationFrameRef.current = requestAnimationFrame(detectFace)
        }

        // Start detection loop
        animationFrameRef.current = requestAnimationFrame(detectFace)

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [isReady, videoElement])

    return {
        isReady,
        landmarks: result?.landmarks[0] || null,
        faceMeshResult: result
    }
}

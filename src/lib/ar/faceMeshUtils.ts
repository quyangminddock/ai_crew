/**
 * MediaPipe Face Mesh Utilities for AR Effects
 * Provides functions to draw face landmarks and features
 */

// Face landmark indices for different features
export const FACE_MESH_INDICES = {
    // Face oval outline
    faceOval: [
        10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
        397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
        172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
    ],

    // Left eye
    leftEye: [
        33, 7, 163, 144, 145, 153, 154, 155, 133,
        173, 157, 158, 159, 160, 161, 246
    ],

    // Right eye
    rightEye: [
        362, 382, 381, 380, 374, 373, 390, 249, 263,
        466, 388, 387, 386, 385, 384, 398
    ],

    // Lips outer
    lipsOuter: [
        61, 146, 91, 181, 84, 17, 314, 405, 321, 375,
        291, 409, 270, 269, 267, 0, 37, 39, 40, 185
    ],

    // Lips inner
    lipsInner: [
        78, 191, 80, 81, 82, 13, 312, 311, 310, 415,
        308, 324, 318, 402, 317, 14, 87, 178, 88, 95
    ]
}

export interface FaceLandmark {
    x: number
    y: number
    z?: number
}

/**
 * Draw a connected path of landmarks
 */
export function drawPath(
    ctx: CanvasRenderingContext2D,
    landmarks: FaceLandmark[],
    indices: number[],
    color: string,
    lineWidth: number = 2,
    closed: boolean = true
) {
    if (landmarks.length === 0 || indices.length === 0) return

    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.beginPath()

    indices.forEach((idx, i) => {
        if (idx >= landmarks.length) return

        const point = landmarks[idx]
        if (i === 0) {
            ctx.moveTo(point.x, point.y)
        } else {
            ctx.lineTo(point.x, point.y)
        }
    })

    if (closed) {
        ctx.closePath()
    }
    ctx.stroke()
}

/**
 * Draw filled region for a feature
 */
export function fillRegion(
    ctx: CanvasRenderingContext2D,
    landmarks: FaceLandmark[],
    indices: number[],
    color: string,
    opacity: number = 0.3
) {
    if (landmarks.length === 0 || indices.length === 0) return

    ctx.fillStyle = color
    ctx.globalAlpha = opacity
    ctx.beginPath()

    indices.forEach((idx, i) => {
        if (idx >= landmarks.length) return

        const point = landmarks[idx]
        if (i === 0) {
            ctx.moveTo(point.x, point.y)
        } else {
            ctx.lineTo(point.x, point.y)
        }
    })

    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 1.0
}

/**
 * Draw glowing effect around eyes
 */
export function drawEyeGlow(
    ctx: CanvasRenderingContext2D,
    landmarks: FaceLandmark[],
    color: string = '#00ffff'
) {
    // Left eye
    const leftEyeCenter = getFeatureCenter(landmarks, FACE_MESH_INDICES.leftEye)
    if (leftEyeCenter) {
        drawGlowCircle(ctx, leftEyeCenter.x, leftEyeCenter.y, 20, color)
    }

    // Right eye
    const rightEyeCenter = getFeatureCenter(landmarks, FACE_MESH_INDICES.rightEye)
    if (rightEyeCenter) {
        drawGlowCircle(ctx, rightEyeCenter.x, rightEyeCenter.y, 20, color)
    }
}

/**
 * Draw a glowing circle
 */
function drawGlowCircle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string
) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, color)
    gradient.addColorStop(0.5, `${color}80`)
    gradient.addColorStop(1, `${color}00`)

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
}

/**
 * Get center point of a feature
 */
export function getFeatureCenter(
    landmarks: FaceLandmark[],
    indices: number[]
): FaceLandmark | null {
    if (landmarks.length === 0 || indices.length === 0) return null

    let sumX = 0, sumY = 0, count = 0

    indices.forEach(idx => {
        if (idx < landmarks.length) {
            sumX += landmarks[idx].x
            sumY += landmarks[idx].y
            count++
        }
    })

    return count > 0 ? { x: sumX / count, y: sumY / count } : null
}

/**
 * Map expression to visual effects
 */
export function getExpressionEffect(expression: string): {
    eyeColor: string
    mouthColor: string
    emoji: string
} {
    const lower = expression.toLowerCase()

    if (lower.includes('excited') || lower.includes('great')) {
        return {
            eyeColor: '#ffff00',
            mouthColor: '#ff6b35',
            emoji: '✨'
        }
    }

    if (lower.includes('thinking') || lower.includes('consider')) {
        return {
            eyeColor: '#00ffff',
            mouthColor: '#4ecdc4',
            emoji: '🤔'
        }
    }

    if (lower.includes('concerned') || lower.includes('sorry')) {
        return {
            eyeColor: '#a8dadc',
            mouthColor: '#457b9d',
            emoji: '😔'
        }
    }

    if (lower.includes('processing') || lower.includes('working')) {
        return {
            eyeColor: '#06ffa5',
            mouthColor: '#06ffa5',
            emoji: '💡'
        }
    }

    // Default - engaged
    return {
        eyeColor: '#00d9ff',
        mouthColor: '#ff006e',
        emoji: '👀'
    }
}

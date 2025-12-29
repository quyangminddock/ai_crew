import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'CREW - Your AI Startup Team',
        short_name: 'CREW',
        description: 'Build your startup with a team of 35+ AI agents across 8 departments.',
        start_url: '/',
        display: 'standalone',
        background_color: '#F8F9FA',
        theme_color: '#F97316', // Orange primary color
        icons: [
            {
                src: '/favicon.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/logo.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}

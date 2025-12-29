import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://crew.minddock.ai'),
  title: {
    default: 'CREW - Your AI Startup Team',
    template: '%s | CREW',
  },
  description: 'Build your startup with a team of 35+ AI agents across 8 departments. From idea to launch, no tech skills needed.',
  keywords: ['AI', 'startup', 'team', 'agents', 'product', 'design', 'engineering', 'marketing', 'crew'],
  authors: [{ name: 'CREW Team' }],
  creator: 'CREW',
  publisher: 'CREW',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://crew.minddock.ai',
    siteName: 'CREW',
    title: 'CREW - Your AI Startup Team',
    description: 'Build your startup with a team of 35+ AI agents across 8 departments.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'CREW - AI Startup Team',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CREW - Your AI Startup Team',
    description: 'Build your startup with 35+ AI agents. From idea to launch.',
    images: ['/logo.png'],
    creator: '@crew_ai',
  },
  verification: {
    google: 'Hxg2UDmaaJcuJJeVxwd-1AOLPBWztZB5MN7Hn2n_Fpw', // Uncomment and add your code
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}

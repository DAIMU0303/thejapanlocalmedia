import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans_JP, Noto_Serif_JP } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const notoSans = Noto_Sans_JP({ subsets: ['latin'], variable: '--font-noto-sans' })
const notoSerif = Noto_Serif_JP({ subsets: ['latin'], variable: '--font-noto-serif' })

export const metadata: Metadata = {
  title: 'TheJapanLocalMedia - 信頼の循環インフラ',
  description: '地方創生・観光をテーマにした完全招待制クローズドメディア',
}

export const viewport: Viewport = {
  themeColor: '#1B3022',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="ja">
        <body className={`${inter.variable} ${notoSans.variable} ${notoSerif.variable} font-sans antialiased text-foreground`}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}

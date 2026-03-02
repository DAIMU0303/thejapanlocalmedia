import React from "react"
import type { Metadata } from 'next'
import { Noto_Sans_JP, Noto_Serif_JP } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/toaster"

const notoSans = Noto_Sans_JP({ subsets: ['latin'], variable: '--font-noto-sans' })
const notoSerif = Noto_Serif_JP({ subsets: ['latin'], variable: '--font-noto-serif' })

export const metadata: Metadata = {
  title: 'TheJapanLocalMedia - 信頼の循環インフラ',
  description: '地方創生・観光をテーマにした完全招待制クローズドメディア',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="ja">
        <body className={`${notoSans.variable} ${notoSerif.variable} font-sans antialiased text-[#1B3022]`}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}

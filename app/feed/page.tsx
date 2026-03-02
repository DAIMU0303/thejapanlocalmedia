"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { UserProvider } from "@/components/user-provider"
import { useUserStore } from "@/lib/store/use-user-store"
import { getPublishedContents } from "@/app/actions/content"
import { getMyInviteCode } from "@/app/actions/profile"
import { Sparkles, FileText, Video, ExternalLink, Play, Link2, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DbContent } from "@/lib/types"

function FeedContent() {
  const { user } = useUserStore()
  const [mounted, setMounted] = useState(false)
  const [contents, setContents] = useState<DbContent[]>([])
  const [activeTab, setActiveTab] = useState<"article" | "video" | "external">("article")
  const [inviteUrl, setInviteUrl] = useState("")

  useEffect(() => {
    setMounted(true)
    getPublishedContents().then((result) => {
      if ("data" in result && result.data) setContents(result.data as DbContent[])
    })
    getMyInviteCode().then((result) => {
      if ("inviteUrl" in result && result.inviteUrl) setInviteUrl(result.inviteUrl)
    })
  }, [])

  if (!mounted) return null

  const articles = contents.filter((c) => c.type === "article")
  const videos = contents.filter((c) => c.type === "video")
  const externals = contents.filter((c) => c.type === "external")
  const recommended = contents.slice(0, 3)

  const tabs = [
    { key: "article" as const, label: "記事", icon: FileText, count: articles.length },
    { key: "video" as const, label: "動画", icon: Video, count: videos.length },
    { key: "external" as const, label: "外部リンク", icon: ExternalLink, count: externals.length },
  ]

  const currentItems = activeTab === "article" ? articles : activeTab === "video" ? videos : externals

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" })
  }

  const shareToX = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent("TheJapanLocalMediaに参加しませんか？")}&url=${encodeURIComponent(inviteUrl)}`, "_blank")
  }
  const shareToLine = () => {
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(inviteUrl)}`, "_blank")
  }
  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteUrl)}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recommended Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-medium text-[#1B3022]">Recommended</h2>
            <div className="flex-1 h-px bg-[#D4AF37]/20" />
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {/* Featured Card */}
            {recommended[0] && (
              <Link href={`/article/${recommended[0].id}`} className="md:col-span-3 group">
                <div className="relative aspect-video bg-[#1B3022] rounded-2xl overflow-hidden ring-0 group-hover:ring-2 ring-[#D4AF37] transition-all">
                  {recommended[0].thumbnail_url && (
                    <Image src={recommended[0].thumbnail_url as string} alt="" fill className="object-cover opacity-80 group-hover:opacity-90 transition-opacity" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B3022] via-[#1B3022]/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-xs text-[#D4AF37] tracking-wider uppercase mb-2">{(recommended[0].type as string) === "video" ? "VIDEO" : "ARTICLE"}</p>
                    <h3 className="font-serif text-xl text-[#F8F9FA] line-clamp-2">{recommended[0].title as string}</h3>
                    <p className="text-sm text-[#F8F9FA]/60 mt-2">{recommended[0].author_name as string}</p>
                  </div>
                </div>
              </Link>
            )}

            {/* Side Cards */}
            <div className="md:col-span-2 flex flex-col gap-4">
              {recommended.slice(1, 3).map((item) => (
                <Link key={item.id as string} href={`/article/${item.id}`} className="group flex-1">
                  <div className="relative h-full min-h-[140px] bg-[#1B3022] rounded-xl overflow-hidden ring-0 group-hover:ring-2 ring-[#D4AF37] transition-all">
                    {item.thumbnail_url && (
                      <Image src={item.thumbnail_url as string} alt="" fill className="object-cover opacity-70 group-hover:opacity-80 transition-opacity" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B3022] via-[#1B3022]/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-sm font-medium text-[#F8F9FA] line-clamp-2">{item.title as string}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mb-12">
          <div className="border-b border-[#1B3022]/10 flex gap-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-[#D4AF37] text-[#1B3022]"
                    : "border-transparent text-[#1B3022]/50 hover:text-[#1B3022]/70"
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "bg-[#1B3022]/5 text-[#1B3022]/40"
                }`}>{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="mt-6">
            {activeTab === "article" && (
              <div className="space-y-4">
                {articles.map((item) => (
                  <Link key={item.id as string} href={`/article/${item.id}`}
                    className="flex gap-4 p-4 rounded-xl hover:bg-white transition-colors group">
                    {item.thumbnail_url && (
                      <div className="relative w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-[#1B3022]/5">
                        <Image src={item.thumbnail_url as string} alt="" fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[#1B3022] line-clamp-2 group-hover:text-[#D4AF37] transition-colors">{item.title as string}</h3>
                      <p className="text-sm text-[#1B3022]/50 mt-1">{item.author_name as string}</p>
                      <p className="text-xs text-[#1B3022]/30 mt-1">{formatDate(item.publish_date as string)}</p>
                    </div>
                  </Link>
                ))}
                {articles.length === 0 && <p className="text-center text-sm text-[#1B3022]/40 py-12">記事はまだありません</p>}
              </div>
            )}

            {activeTab === "video" && (
              <div className="grid md:grid-cols-2 gap-4">
                {videos.map((item) => (
                  <Link key={item.id as string} href={`/article/${item.id}`}
                    className="group rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-video bg-[#1B3022]/5">
                      {item.thumbnail_url && <Image src={item.thumbnail_url as string} alt="" fill className="object-cover" />}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-[#1B3022]/70 flex items-center justify-center group-hover:bg-[#D4AF37] transition-colors">
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </div>
                      </div>
                      {item.duration && (
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-xs">{item.duration as string}</span>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-[#1B3022] line-clamp-2">{item.title as string}</h3>
                      <p className="text-xs text-[#1B3022]/50 mt-1">{item.author_name as string}</p>
                    </div>
                  </Link>
                ))}
                {videos.length === 0 && <p className="col-span-2 text-center text-sm text-[#1B3022]/40 py-12">動画はまだありません</p>}
              </div>
            )}

            {activeTab === "external" && (
              <div className="space-y-3">
                {externals.map((item) => (
                  <a key={item.id as string} href={item.url as string} target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-3 p-4 rounded-xl hover:bg-white transition-colors group">
                    <ExternalLink className="w-5 h-5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-[#1B3022] group-hover:text-[#D4AF37] transition-colors">{item.title as string}</h3>
                      <p className="text-sm text-[#1B3022]/50 mt-1 line-clamp-2">{item.description as string}</p>
                    </div>
                  </a>
                ))}
                {externals.length === 0 && <p className="text-center text-sm text-[#1B3022]/40 py-12">外部リンクはまだありません</p>}
              </div>
            )}
          </div>
        </div>

        {/* Share CTA */}
        <div className="bg-[#1B3022] rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Link2 className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-[#D4AF37] text-sm tracking-[0.2em] uppercase">Invite & Grow</h3>
          </div>
          <p className="text-[#F8F9FA]/70 text-sm mb-6">
            信頼できる仲間を招待して、コミュニティを育てましょう
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={shareToX} variant="outline" size="sm"
              className="border-[#F8F9FA]/20 text-[#F8F9FA]/80 hover:bg-[#F8F9FA]/10 hover:text-[#F8F9FA]">
              <Share2 className="w-4 h-4 mr-1" />X
            </Button>
            <Button onClick={shareToLine} variant="outline" size="sm"
              className="border-[#F8F9FA]/20 text-[#F8F9FA]/80 hover:bg-[#F8F9FA]/10 hover:text-[#F8F9FA]">
              LINE
            </Button>
            <Button onClick={shareToFacebook} variant="outline" size="sm"
              className="border-[#F8F9FA]/20 text-[#F8F9FA]/80 hover:bg-[#F8F9FA]/10 hover:text-[#F8F9FA]">
              Facebook
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function FeedPage() {
  return (
    <UserProvider>
      <FeedContent />
    </UserProvider>
  )
}

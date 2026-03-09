"use client"

import React, { useState, useEffect, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { UserProvider } from "@/components/user-provider"
import { useUserStore } from "@/lib/store/use-user-store"
import { getPublishedContents } from "@/app/actions/content"
import { getMyInviteCode } from "@/app/actions/profile"
import { Sparkles, FileText, Video, ExternalLink, Play, Link2, Share2, Building2, Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DbContent } from "@/lib/types"

// Skeleton loaders
function FeedSkeleton() {
  return (
    <div className="space-y-8">
      {/* Recommended skeleton */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="w-32 h-5" />
          <div className="flex-1 h-px bg-muted" />
        </div>
        <div className="grid md:grid-cols-5 gap-4">
          <Skeleton className="md:col-span-3 aspect-video rounded-2xl" />
          <div className="md:col-span-2 flex flex-col gap-4">
            <Skeleton className="flex-1 min-h-[140px] rounded-xl" />
            <Skeleton className="flex-1 min-h-[140px] rounded-xl" />
          </div>
        </div>
      </div>
      {/* Tabs skeleton */}
      <div>
        <Skeleton className="w-full h-12 rounded-lg mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 p-4">
              <Skeleton className="w-40 h-24 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ContentCard({ item, formatDate }: { item: DbContent; formatDate: (date: string) => string }) {
  return (
    <Link
      href={`/article/${item.id}`}
      className="flex gap-4 p-4 rounded-xl bg-card hover:bg-card/80 transition-lift border border-border/50 hover:border-border group"
    >
      {item.thumbnail_url && (
        <div className="relative w-40 h-24 shrink-0 rounded-lg overflow-hidden bg-muted">
          <Image src={item.thumbnail_url as string} alt="" fill className="object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-accent transition-colors">
          {item.title as string}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">{item.author_name as string}</p>
        <p className="text-xs text-muted-foreground/60 mt-1">{formatDate(item.publish_date as string)}</p>
      </div>
    </Link>
  )
}

function VideoCard({ item }: { item: DbContent }) {
  return (
    <Link
      href={`/article/${item.id}`}
      className="group rounded-xl overflow-hidden bg-card border border-border/50 hover:border-border transition-lift"
    >
      <div className="relative aspect-video bg-muted">
        {item.thumbnail_url && <Image src={item.thumbnail_url as string} alt="" fill className="object-cover" />}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-foreground/70 flex items-center justify-center group-hover:bg-accent transition-colors">
            <Play className="w-5 h-5 text-background ml-0.5" />
          </div>
        </div>
        {item.duration && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-foreground/80 text-background text-xs">
            {item.duration as string}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm text-foreground line-clamp-2">{item.title as string}</h3>
        <p className="text-xs text-muted-foreground mt-1">{item.author_name as string}</p>
      </div>
    </Link>
  )
}

function FeedContentInner() {
  const { user } = useUserStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [contents, setContents] = useState<DbContent[]>([])
  const [inviteUrl, setInviteUrl] = useState("")

  // Tab from URL or default
  const tabParam = searchParams.get("tab") || "all"
  const [activeTab, setActiveTab] = useState(tabParam)

  useEffect(() => {
    setMounted(true)
    Promise.all([
      getPublishedContents().then((result) => {
        if ("data" in result && result.data) setContents(result.data as DbContent[])
      }),
      getMyInviteCode().then((result) => {
        if ("inviteUrl" in result && result.inviteUrl) setInviteUrl(result.inviteUrl)
      }),
    ]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setActiveTab(tabParam)
  }, [tabParam])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "all") {
      router.push("/feed", { scroll: false })
    } else {
      router.push(`/feed?tab=${value}`, { scroll: false })
    }
  }

  if (!mounted) return null

  const articles = contents.filter((c) => c.type === "article")
  const videos = contents.filter((c) => c.type === "video")
  const externals = contents.filter((c) => c.type === "external")
  const recommended = contents.slice(0, 3)

  // Tabs configuration
  const tabs = [
    { key: "all", label: "すべて", icon: Star, count: contents.length },
    { key: "articles", label: "記事", icon: FileText, count: articles.length },
    { key: "videos", label: "動画", icon: Video, count: videos.length },
    { key: "projects", label: "案件", icon: Building2, count: externals.length },
    { key: "favorites", label: "お気に入り", icon: Heart, count: 0 },
  ]

  const getFilteredItems = () => {
    switch (activeTab) {
      case "articles":
        return articles
      case "videos":
        return videos
      case "projects":
        return externals
      case "favorites":
        return [] // TODO: implement favorites
      default:
        return contents
    }
  }

  const filteredItems = getFilteredItems()

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" })
  }

  const shareToX = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent("TheJapanLocalMediaに参加しませんか？")}&url=${encodeURIComponent(inviteUrl)}`,
      "_blank"
    )
  }
  const shareToLine = () => {
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(inviteUrl)}`, "_blank")
  }
  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteUrl)}`, "_blank")
  }

  // Mock invite progress
  const inviteProgress = { current: 2, target: 5 }
  // Mock points
  const userPoints = 1250

  return (
    <div className="min-h-screen bg-background">
      <AppHeader points={userPoints} />
      <div className="flex">
        <AppSidebar inviteProgress={inviteProgress} />
        <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
          {loading ? (
            <FeedSkeleton />
          ) : (
            <>
              {/* Recommended Section */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <h2 className="text-lg font-semibold text-foreground">Recommended</h2>
                  <div className="flex-1 h-px bg-accent/20" />
                </div>

                <div className="grid md:grid-cols-5 gap-4">
                  {/* Featured Card */}
                  {recommended[0] && (
                    <Link href={`/article/${recommended[0].id}`} className="md:col-span-3 group">
                      <div className="relative aspect-video bg-primary rounded-2xl overflow-hidden ring-0 group-hover:ring-2 ring-accent transition-all transition-lift">
                        {recommended[0].thumbnail_url && (
                          <Image
                            src={recommended[0].thumbnail_url as string}
                            alt=""
                            fill
                            className="object-cover opacity-80 group-hover:opacity-90 transition-opacity"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <p className="text-xs text-accent tracking-wider uppercase mb-2">
                            {(recommended[0].type as string) === "video" ? "VIDEO" : "ARTICLE"}
                          </p>
                          <h3 className="font-serif text-xl text-primary-foreground line-clamp-2">
                            {recommended[0].title as string}
                          </h3>
                          <p className="text-sm text-primary-foreground/60 mt-2">
                            {recommended[0].author_name as string}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* Side Cards */}
                  <div className="md:col-span-2 flex flex-col gap-4">
                    {recommended.slice(1, 3).map((item) => (
                      <Link key={item.id as string} href={`/article/${item.id}`} className="group flex-1">
                        <div className="relative h-full min-h-[140px] bg-primary rounded-xl overflow-hidden ring-0 group-hover:ring-2 ring-accent transition-all transition-lift">
                          {item.thumbnail_url && (
                            <Image
                              src={item.thumbnail_url as string}
                              alt=""
                              fill
                              className="object-cover opacity-70 group-hover:opacity-80 transition-opacity"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-sm font-medium text-primary-foreground line-clamp-2">
                              {item.title as string}
                            </h3>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>

              {/* Tabs Section */}
              <section className="mb-12">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-lg overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.key}
                        value={tab.key}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md whitespace-nowrap"
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full ${
                            activeTab === tab.key
                              ? "bg-accent/20 text-accent-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {tab.count}
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <div className="mt-6">
                    {activeTab === "videos" ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {videos.map((item) => (
                          <VideoCard key={item.id as string} item={item} />
                        ))}
                        {videos.length === 0 && (
                          <p className="col-span-2 text-center text-sm text-muted-foreground py-12">
                            動画はまだありません
                          </p>
                        )}
                      </div>
                    ) : activeTab === "projects" ? (
                      <div className="space-y-3">
                        {externals.map((item) => (
                          <a
                            key={item.id as string}
                            href={item.url as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-lift group"
                          >
                            <ExternalLink className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                            <div>
                              <h3 className="font-medium text-foreground group-hover:text-accent transition-colors">
                                {item.title as string}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {item.description as string}
                              </p>
                            </div>
                          </a>
                        ))}
                        {externals.length === 0 && (
                          <p className="text-center text-sm text-muted-foreground py-12">
                            案件はまだありません
                          </p>
                        )}
                      </div>
                    ) : activeTab === "favorites" ? (
                      <div className="text-center py-12">
                        <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">お気に入りに追加した記事がここに表示されます</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredItems.map((item) => (
                          <ContentCard key={item.id as string} item={item} formatDate={formatDate} />
                        ))}
                        {filteredItems.length === 0 && (
                          <p className="text-center text-sm text-muted-foreground py-12">コンテンツはまだありません</p>
                        )}
                      </div>
                    )}
                  </div>
                </Tabs>
              </section>

              {/* Share CTA */}
              <section className="bg-primary rounded-2xl p-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Link2 className="w-5 h-5 text-accent" />
                  <h3 className="text-accent text-sm tracking-[0.2em] uppercase">Invite & Grow</h3>
                </div>
                <p className="text-primary-foreground/70 text-sm mb-6">
                  信頼できる仲間を招待して、コミュニティを育てましょう
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Button
                    onClick={shareToX}
                    variant="outline"
                    size="sm"
                    className="border-primary-foreground/20 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    <Share2 className="w-4 h-4 mr-1" />X
                  </Button>
                  <Button
                    onClick={shareToLine}
                    variant="outline"
                    size="sm"
                    className="border-primary-foreground/20 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    LINE
                  </Button>
                  <Button
                    onClick={shareToFacebook}
                    variant="outline"
                    size="sm"
                    className="border-primary-foreground/20 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    Facebook
                  </Button>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}

function FeedContent() {
  return (
    <Suspense fallback={<FeedSkeleton />}>
      <FeedContentInner />
    </Suspense>
  )
}

export default function FeedPage() {
  return (
    <UserProvider>
      <FeedContent />
    </UserProvider>
  )
}

"use client"

import React, { useState, useEffect, useCallback, use } from "react"
import Image from "next/image"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { UserProvider } from "@/components/user-provider"
import { getContentById, getPublishedContents } from "@/app/actions/content"
import { toggleLike, toggleBookmark, getUserInteractions } from "@/app/actions/interactions"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Heart, Bookmark, Share2, ArrowLeft, Play, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DbContent {
  id: string
  type: string
  title: string
  description: string | null
  body: string | null
  status: string
  publish_date: string | null
  author_name: string | null
  author_bio: string | null
  thumbnail_url: string | null
  url: string | null
  duration: string | null
  views: number
  likes: number
  tags?: string[]
  [key: string]: unknown
}

function ArticleContent({ id }: { id: string }) {
  const [mounted, setMounted] = useState(false)
  const [content, setContent] = useState<DbContent | null>(null)
  const [related, setRelated] = useState<DbContent[]>([])
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    setMounted(true)
    getContentById(id).then((r) => { if ("data" in r && r.data) setContent(r.data as DbContent) })
    getUserInteractions(id).then((r) => { setLiked(r.liked); setBookmarked(r.bookmarked) })
    getPublishedContents().then((r) => {
      if ("data" in r && r.data) setRelated((r.data as DbContent[]).filter((c) => c.id !== id).slice(0, 5))
    })
  }, [id])

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  const handleLike = async () => {
    const r = await toggleLike(id)
    if ("liked" in r) setLiked(!!r.liked)
  }

  const handleBookmark = async () => {
    const r = await toggleBookmark(id)
    if ("bookmarked" in r) setBookmarked(!!r.bookmarked)
  }

  if (!mounted || !content) return null

  const isVideo = content.type === "video"
  const isYouTube = content.url && typeof content.url === "string" && (content.url.includes("youtube.com") || content.url.includes("youtu.be"))

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/)
    return match ? match[1] : null
  }

  if (isVideo) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <AppHeader />
        {/* Video Player Area */}
        <div className="bg-[#0f0f0f]">
          <div className="max-w-6xl mx-auto">
            <div className="relative aspect-video">
              {isYouTube ? (
                <iframe src={`https://www.youtube.com/embed/${getYouTubeId(content.url as string)}?rel=0`}
                  className="absolute inset-0 w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
              ) : content.url ? (
                <video src={content.url as string} controls className="absolute inset-0 w-full h-full" />
              ) : content.thumbnail_url ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image src={content.thumbnail_url as string} alt="" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Play className="w-10 h-10 text-white ml-1" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-[#1B3022] flex items-center justify-center">
                  <Play className="w-16 h-16 text-[#D4AF37]" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-xl font-bold text-[#1B3022] mb-3">{content.title as string}</h1>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-[#1B3022]/60">{content.author_name as string}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleLike}
                    className={liked ? "bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]" : ""}>
                    <ThumbsUp className="w-4 h-4 mr-1" />{liked ? "いいね済み" : "いいね"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleBookmark}
                    className={bookmarked ? "bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]" : ""}>
                    <Bookmark className="w-4 h-4 mr-1" />{bookmarked ? "保存済み" : "保存"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-1" />共有
                  </Button>
                </div>
              </div>
              {content.description && (
                <div className="bg-white rounded-xl p-4 text-sm text-[#1B3022]/70 whitespace-pre-wrap">
                  {content.description as string}
                </div>
              )}
            </div>

            {/* Related Videos */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[#1B3022]/60 uppercase tracking-wider">関連動画</h3>
              {related.filter(r => r.type === "video").slice(0, 5).map((item) => (
                <Link key={item.id as string} href={`/article/${item.id}`} className="flex gap-3 group">
                  <div className="relative w-40 aspect-video flex-shrink-0 rounded-lg overflow-hidden bg-[#1B3022]/5">
                    {item.thumbnail_url && <Image src={item.thumbnail_url as string} alt="" fill className="object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm text-[#1B3022] line-clamp-2 group-hover:text-[#D4AF37]">{item.title as string}</h4>
                    <p className="text-xs text-[#1B3022]/40 mt-1">{item.author_name as string}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Article view
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent">
        <div className="h-full bg-[#D4AF37] transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
      </div>

      <AppHeader />

      <main className="max-w-[680px] mx-auto px-4 sm:px-6 py-8">
        <Link href="/feed" className="inline-flex items-center gap-2 text-sm text-[#1B3022]/50 hover:text-[#1B3022] mb-6">
          <ArrowLeft className="w-4 h-4" />フィードに戻る
        </Link>

        {/* Cover Image */}
        {content.thumbnail_url && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-8">
            <Image src={content.thumbnail_url as string} alt="" fill className="object-cover" />
          </div>
        )}

        {/* Tags */}
        {content.tags && Array.isArray(content.tags) && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {content.tags.map((tag: string, i: number) => (
              <span key={i} className="text-xs px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">{tag}</span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="font-serif text-2xl md:text-[32px] leading-tight text-[#1B3022] mb-4">{content.title as string}</h1>

        {content.description && (
          <p className="text-[#1B3022]/60 text-base mb-6">{content.description as string}</p>
        )}

        {/* Author Card */}
        <div className="border-y border-[#1B3022]/10 py-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1B3022] flex items-center justify-center text-[#D4AF37] text-sm font-medium">
              {(content.author_name as string)?.charAt(0) || "A"}
            </div>
            <div>
              <p className="text-sm font-medium text-[#1B3022]">{content.author_name as string}</p>
              {content.author_bio && <p className="text-xs text-[#1B3022]/50">{content.author_bio as string}</p>}
            </div>
          </div>
        </div>

        {/* Article Body */}
        <article className="prose prose-neutral max-w-none
          prose-headings:text-[#1B3022] prose-headings:font-serif
          prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-l-4 prose-h2:border-[#D4AF37] prose-h2:pl-4
          prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-[#1B3022]/80 prose-p:leading-relaxed
          prose-a:text-[#D4AF37] prose-a:no-underline hover:prose-a:underline
          prose-strong:text-[#1B3022]
          prose-blockquote:border-l-[#D4AF37] prose-blockquote:bg-[#D4AF37]/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
          prose-code:text-[#D4AF37] prose-code:bg-[#1B3022]/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          prose-img:rounded-xl
          prose-li:text-[#1B3022]/80
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content.body as string || ""}</ReactMarkdown>
        </article>

        {/* Author Detail Card */}
        <div className="mt-12 p-6 bg-white rounded-xl border border-[#1B3022]/5 text-center">
          <div className="w-16 h-16 rounded-full bg-[#1B3022] flex items-center justify-center text-[#D4AF37] text-xl font-medium mx-auto mb-3">
            {(content.author_name as string)?.charAt(0) || "A"}
          </div>
          <p className="font-medium text-[#1B3022]">{content.author_name as string}</p>
          {content.author_bio && <p className="text-sm text-[#1B3022]/50 mt-1">{content.author_bio as string}</p>}
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="mt-12">
            <h3 className="text-sm font-medium text-[#1B3022]/60 uppercase tracking-wider mb-4">関連記事</h3>
            <div className="space-y-3">
              {related.map((item) => (
                <Link key={item.id as string} href={`/article/${item.id}`}
                  className="flex gap-3 p-3 rounded-lg hover:bg-white transition-colors group">
                  {item.thumbnail_url && (
                    <div className="relative w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-[#1B3022]/5">
                      <Image src={item.thumbnail_url as string} alt="" fill className="object-cover" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-sm text-[#1B3022] line-clamp-2 group-hover:text-[#D4AF37]">{item.title as string}</h4>
                    <p className="text-xs text-[#1B3022]/40 mt-1">{item.author_name as string}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-lg rounded-full shadow-lg border border-[#1B3022]/10 px-4 py-2">
          <button onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-colors ${
              liked ? "bg-red-50 text-red-500" : "text-[#1B3022]/60 hover:bg-[#1B3022]/5"
            }`}>
            <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
            <span>{liked ? "いいね済み" : "いいね"}</span>
          </button>
          <div className="w-px h-6 bg-[#1B3022]/10" />
          <button onClick={handleBookmark}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-colors ${
              bookmarked ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "text-[#1B3022]/60 hover:bg-[#1B3022]/5"
            }`}>
            <Bookmark className={`w-5 h-5 ${bookmarked ? "fill-current" : ""}`} />
            <span>{bookmarked ? "保存済み" : "保存"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <UserProvider>
      <ArticleContent id={id} />
    </UserProvider>
  )
}

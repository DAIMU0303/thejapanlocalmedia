"use client"

import React, { useState, useEffect } from "react"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { UserProvider } from "@/components/user-provider"
import { useUserStore } from "@/lib/store/use-user-store"
import { getMyInviteCode, getReferralStats, getRewardMilestones } from "@/app/actions/profile"
import { Link2, Copy, Check, Gift, Star, Crown, Share2, MousePointerClick, UserPlus, TrendingUp, Sparkles, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

// Skeleton component for loading state
function MyPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Greeting skeleton */}
      <div>
        <Skeleton className="w-16 h-3 mb-2" />
        <Skeleton className="w-48 h-8 mb-1" />
        <Skeleton className="w-24 h-4" />
      </div>
      {/* Invite link skeleton */}
      <Skeleton className="h-48 rounded-2xl" />
      {/* Roadmap skeleton */}
      <Skeleton className="h-80 rounded-2xl" />
      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    </div>
  )
}

function MyPageContent() {
  const { user } = useUserStore()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [inviteUrl, setInviteUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ referralCount: 0, clickCount: 0, conversionRate: "0" })
  const [milestones, setMilestones] = useState<{ target: number; label: string; reward: string; icon: string }[]>([])

  useEffect(() => {
    setMounted(true)
    Promise.all([
      getMyInviteCode(),
      getReferralStats(),
      getRewardMilestones(),
    ]).then(([codeResult, statsResult, milestonesResult]) => {
      if ("inviteUrl" in codeResult && codeResult.inviteUrl) setInviteUrl(codeResult.inviteUrl)
      if ("referralCount" in statsResult) setStats(statsResult as typeof stats)
      if ("milestones" in milestonesResult && milestonesResult.milestones) setMilestones(milestonesResult.milestones)
      setLoading(false)
    })
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    toast({
      title: "コピー完了!",
      description: "招待リンクがクリップボードにコピーされました",
    })
    setTimeout(() => setCopied(false), 2000)
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

  const iconMap: Record<string, React.ReactNode> = {
    Gift: <Gift className="w-5 h-5" />,
    Star: <Star className="w-5 h-5" />,
    Crown: <Crown className="w-5 h-5" />,
  }

  if (!mounted) return null

  const nextMilestone = milestones.find((m) => m.target > stats.referralCount)
  const progressValue = nextMilestone ? (stats.referralCount / nextMilestone.target) * 100 : 100
  const remainingCount = nextMilestone ? nextMilestone.target - stats.referralCount : 0
  const progressPercent = Math.round(progressValue)

  // Mock invite progress for sidebar
  const inviteProgress = { current: stats.referralCount, target: nextMilestone?.target || 5 }
  // Mock points
  const userPoints = 1250

  return (
    <div className="min-h-screen bg-background">
      <AppHeader points={userPoints} />
      <div className="flex">
        <AppSidebar inviteProgress={inviteProgress} />
        <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24 lg:pb-8">
          {loading ? (
            <MyPageSkeleton />
          ) : (
            <>
              {/* Greeting */}
              <div className="mb-8">
                <p className="text-xs text-muted-foreground tracking-[0.3em] uppercase">My Page</p>
                <h1 className="font-serif text-2xl text-foreground mt-1">{user?.name}</h1>
                {user?.memberId && <p className="text-sm text-accent mt-1">会員No. {user.memberId}</p>}
              </div>

              {/* Invite Link Card */}
              <div className="bg-primary rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Link2 className="w-5 h-5 text-accent" />
                  <h2 className="text-accent text-sm font-medium">あなたの招待リンク</h2>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 bg-primary-foreground/10 rounded-lg px-4 py-3">
                    <p className="text-sm text-primary-foreground/80 font-mono truncate">{inviteUrl}</p>
                  </div>
                  <Button
                    onClick={handleCopy}
                    size="sm"
                    className={`shrink-0 transition-all ${
                      copied
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-accent hover:bg-accent/90"
                    } text-accent-foreground`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={shareToX}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-primary-foreground/60 bg-primary-foreground/5 hover:bg-primary-foreground/10 transition-colors"
                  >
                    <Share2 className="w-3 h-3" />X
                  </button>
                  <button
                    onClick={shareToLine}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-primary-foreground/60 bg-primary-foreground/5 hover:bg-primary-foreground/10 transition-colors"
                  >
                    LINE
                  </button>
                  <button
                    onClick={shareToFacebook}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-primary-foreground/60 bg-primary-foreground/5 hover:bg-primary-foreground/10 transition-colors"
                  >
                    Facebook
                  </button>
                </div>
              </div>

              {/* Reward Roadmap */}
              <div className="bg-card rounded-2xl border border-border p-6 mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <Gift className="w-5 h-5 text-accent" />
                  <h2 className="text-foreground font-medium">報酬ロードマップ</h2>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">現在の紹介数</p>
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-accent">{stats.referralCount}</span>
                      <span className="text-muted-foreground">人</span>
                    </div>
                  </div>

                  {/* Progress bar with percentage */}
                  <div className="relative">
                    <Progress value={progressValue} className="h-3" />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 px-2 py-0.5 bg-accent text-accent-foreground text-xs font-semibold rounded-full transition-all"
                      style={{ left: `${Math.min(progressPercent, 90)}%` }}
                    >
                      {progressPercent}%
                    </div>
                  </div>

                  {nextMilestone && (
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-muted-foreground">
                        次の目標: {nextMilestone.label}
                      </p>
                      {/* Highlighted "あと〇人" badge */}
                      <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 animate-pulse">
                        <Sparkles className="w-3 h-3 mr-1" />
                        あと{remainingCount}人!
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {milestones.map((m, index) => {
                    const achieved = stats.referralCount >= m.target
                    return (
                      <div
                        key={m.target}
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                          achieved
                            ? "border-accent bg-accent/5 shadow-sm"
                            : "border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            achieved
                              ? "bg-accent text-accent-foreground shadow-md"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {iconMap[m.icon] || <Gift className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium ${achieved ? "text-foreground" : "text-muted-foreground"}`}>
                              {m.label}
                            </p>
                            {achieved && (
                              <Badge className="bg-accent text-accent-foreground text-xs animate-bounce">
                                達成!
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{m.reward}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-semibold ${achieved ? "text-accent" : "text-muted-foreground"}`}>
                            {m.target}人
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-card rounded-xl border border-border p-4 text-center transition-lift">
                  <MousePointerClick className="w-5 h-5 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stats.clickCount}</p>
                  <p className="text-xs text-muted-foreground">クリック数</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4 text-center transition-lift">
                  <UserPlus className="w-5 h-5 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stats.referralCount}</p>
                  <p className="text-xs text-muted-foreground">登録完了数</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4 text-center transition-lift">
                  <TrendingUp className="w-5 h-5 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stats.conversionRate}%</p>
                  <p className="text-xs text-muted-foreground">CVR</p>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}

export default function MyPage() {
  return (
    <UserProvider>
      <MyPageContent />
    </UserProvider>
  )
}

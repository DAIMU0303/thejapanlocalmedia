"use client"

import React, { useState, useEffect } from "react"
import { AppHeader } from "@/components/app-header"
import { UserProvider } from "@/components/user-provider"
import { useUserStore } from "@/lib/store/use-user-store"
import { getMyInviteCode, getReferralStats, getRewardMilestones } from "@/app/actions/profile"
import { Link2, Copy, Check, Gift, Star, Crown, Share2, MousePointerClick, UserPlus, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

function MyPageContent() {
  const { user } = useUserStore()
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

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <AppHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <p className="text-xs text-[#1B3022]/40 tracking-[0.3em] uppercase">My Page</p>
          <h1 className="font-serif text-2xl text-[#1B3022] mt-1">{user?.name}</h1>
          {user?.memberId && <p className="text-sm text-[#D4AF37] mt-1">会員No. {user.memberId}</p>}
        </div>

        {/* Invite Link Card */}
        <div className="bg-[#1B3022] rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-[#D4AF37] text-sm font-medium">あなたの招待リンク</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 bg-white/10 rounded-lg px-4 py-3">
                  <p className="text-sm text-[#F8F9FA]/80 font-mono truncate">{inviteUrl}</p>
                </div>
                <Button onClick={handleCopy} size="sm"
                  className={`flex-shrink-0 ${copied ? "bg-green-600 hover:bg-green-700" : "bg-[#D4AF37] hover:bg-[#D4AF37]/90"} text-[#1B3022]`}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={shareToX} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#F8F9FA]/60 bg-[#F8F9FA]/5 hover:bg-[#F8F9FA]/10 transition-colors">
                  <Share2 className="w-3 h-3" />X
                </button>
                <button onClick={shareToLine} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#F8F9FA]/60 bg-[#F8F9FA]/5 hover:bg-[#F8F9FA]/10 transition-colors">
                  LINE
                </button>
                <button onClick={shareToFacebook} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#F8F9FA]/60 bg-[#F8F9FA]/5 hover:bg-[#F8F9FA]/10 transition-colors">
                  Facebook
                </button>
              </div>
            </>
          )}
        </div>

        {/* Reward Roadmap */}
        <div className="bg-white rounded-2xl border border-[#1B3022]/5 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Gift className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-[#1B3022] font-medium">報酬ロードマップ</h2>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[#1B3022]/60">現在の紹介数</p>
              <p className="text-lg font-bold text-[#D4AF37]">{stats.referralCount}人</p>
            </div>
            <Progress value={progressValue} className="h-2" />
            {nextMilestone && (
              <p className="text-xs text-[#1B3022]/40 mt-1">次の目標: {nextMilestone.label}まであと{nextMilestone.target - stats.referralCount}人</p>
            )}
          </div>

          <div className="space-y-4">
            {milestones.map((m) => {
              const achieved = stats.referralCount >= m.target
              return (
                <div key={m.target}
                  className={`flex items-start gap-4 p-4 rounded-xl border ${
                    achieved ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-[#1B3022]/5"
                  }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    achieved ? "bg-[#D4AF37] text-[#1B3022]" : "bg-[#1B3022]/5 text-[#1B3022]/30"
                  }`}>
                    {iconMap[m.icon] || <Gift className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#1B3022]">{m.label}</p>
                      {achieved && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#1B3022]">達成!</span>
                      )}
                    </div>
                    <p className="text-xs text-[#1B3022]/50 mt-0.5">{m.reward}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[#1B3022]/5 p-4 text-center">
            <MousePointerClick className="w-5 h-5 text-[#D4AF37] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#1B3022]">{stats.clickCount}</p>
            <p className="text-xs text-[#1B3022]/40">クリック数</p>
          </div>
          <div className="bg-white rounded-xl border border-[#1B3022]/5 p-4 text-center">
            <UserPlus className="w-5 h-5 text-[#D4AF37] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#1B3022]">{stats.referralCount}</p>
            <p className="text-xs text-[#1B3022]/40">登録完了数</p>
          </div>
          <div className="bg-white rounded-xl border border-[#1B3022]/5 p-4 text-center">
            <TrendingUp className="w-5 h-5 text-[#D4AF37] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#1B3022]">{stats.conversionRate}%</p>
            <p className="text-xs text-[#1B3022]/40">コンバージョン率</p>
          </div>
        </div>
      </main>
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

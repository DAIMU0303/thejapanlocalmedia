"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { UserProvider } from "@/components/user-provider"
import { useUserStore } from "@/lib/store/use-user-store"
import { updateProfile } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Camera, Bell } from "lucide-react"
import { toast } from "sonner"

function SettingsContent() {
  const { user, updateProfile: updateStoreProfile } = useUserStore()
  const [mounted, setMounted] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (user) {
      setDisplayName(user.name || "")
      setBio(user.bio || "")
    }
  }, [user])

  const handleSave = async () => {
    setIsSaving(true)
    const result = await updateProfile({ displayName, bio })
    if ("success" in result) {
      updateStoreProfile({ name: displayName, bio })
      toast.success("プロフィールを更新しました")
    } else {
      toast.error("更新に失敗しました")
    }
    setIsSaving(false)
  }

  if (!mounted) return null

  const initial = user?.name?.charAt(0) || "U"

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <AppHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/mypage" className="inline-flex items-center gap-2 text-sm text-[#1B3022]/50 hover:text-[#1B3022] mb-6">
          <ArrowLeft className="w-4 h-4" />マイページに戻る
        </Link>

        {/* Profile Section */}
        <div className="bg-white rounded-2xl border border-[#1B3022]/5 p-6 mb-8">
          <h2 className="text-lg font-medium text-[#1B3022] mb-6">プロフィール</h2>

          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[#1B3022] flex items-center justify-center text-[#D4AF37] text-3xl font-serif">
                {initial}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#1B3022] shadow-md hover:bg-[#D4AF37]/90 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-[#1B3022]/60">表示名</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="border-[#1B3022]/10 focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/20" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-[#1B3022]/60">メールアドレス</Label>
              <Input value={user?.email || ""} disabled
                className="border-[#1B3022]/10 bg-[#1B3022]/3 text-[#1B3022]/50" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-[#1B3022]/60">自己紹介</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
                placeholder="自己紹介を入力..."
                className="border-[#1B3022]/10 focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/20" />
            </div>

            <Button onClick={handleSave} disabled={isSaving}
              className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#1B3022]">
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#1B3022]/30 border-t-[#1B3022] rounded-full animate-spin" />保存中...
                </span>
              ) : "変更を保存"}
            </Button>
          </div>
        </div>

        {/* Notification Settings (disabled/coming soon) */}
        <div className="bg-white rounded-2xl border border-[#1B3022]/5 p-6 opacity-50 pointer-events-none relative">
          <span className="absolute top-4 right-4 text-xs px-2 py-1 rounded-full bg-[#1B3022]/10 text-[#1B3022]/50">開発中</span>

          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-medium text-[#1B3022]">通知設定</h2>
          </div>

          <div className="space-y-4">
            {[
              { label: "新着コンテンツ通知", description: "新しい記事や動画が公開された時にメールで通知" },
              { label: "メールマガジン", description: "週刊ダイジェストやお知らせを受け取る" },
              { label: "招待ステータス通知", description: "招待した方の登録状況の更新を受け取る" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-[#1B3022]/5 last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#1B3022]">{item.label}</p>
                  <p className="text-xs text-[#1B3022]/40">{item.description}</p>
                </div>
                <Switch defaultChecked={i < 2} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <UserProvider>
      <SettingsContent />
    </UserProvider>
  )
}

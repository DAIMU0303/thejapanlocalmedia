"use client"

import React, { useState, useEffect } from "react"
import { getAdminRewards, updateAdminReward } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Gift, Star, Crown, Pencil } from "lucide-react"
import { toast } from "sonner"

export function AdminRewards() {
  const [rewards, setRewards] = useState<{
    id: string; title: string; description: string;
    required_referrals: number; icon: string; status: string
  }[]>([])
  const [loading, setLoading] = useState(true)
  const [editReward, setEditReward] = useState<typeof rewards[0] | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadRewards()
  }, [])

  const loadRewards = async () => {
    setLoading(true)
    const result = await getAdminRewards()
    if ("data" in result && result.data) setRewards(result.data as typeof rewards)
    setLoading(false)
  }

  const handleEdit = (reward: typeof rewards[0]) => {
    setEditReward(reward)
    setEditTitle(reward.title)
    setEditDescription(reward.description || "")
  }

  const handleSave = async () => {
    if (!editReward) return
    setSaving(true)
    const result = await updateAdminReward(editReward.id, editTitle, editDescription)
    if ("success" in result) {
      toast.success("報酬を更新しました")
      setEditReward(null)
      loadRewards()
    } else {
      toast.error("更新に失敗しました")
    }
    setSaving(false)
  }

  const iconMap: Record<string, React.ReactNode> = {
    Gift: <Gift className="w-6 h-6" />,
    Star: <Star className="w-6 h-6" />,
    Crown: <Crown className="w-6 h-6" />,
  }

  if (loading) {
    return <div className="text-center py-12 text-[#1B3022]/40">読み込み中...</div>
  }

  return (
    <div>
      <h2 className="text-lg font-medium text-[#1B3022] mb-6">報酬ティア設定</h2>

      <div className="space-y-4">
        {rewards.map((reward) => (
          <div key={reward.id} className="bg-white rounded-xl border border-[#1B3022]/5 p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
              {iconMap[reward.icon] || <Gift className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-[#1B3022]">{reward.title}</h3>
                  <p className="text-sm text-[#1B3022]/50 mt-1">{reward.description}</p>
                  <p className="text-xs text-[#D4AF37] mt-2">必要紹介数: {reward.required_referrals}人</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(reward)}>
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editReward} onOpenChange={() => setEditReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>報酬を編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>タイトル</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>説明</Label>
              <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#1B3022]">
              {saving ? "保存中..." : "保存"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

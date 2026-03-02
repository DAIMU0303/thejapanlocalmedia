"use client"

import React, { useState, useEffect } from "react"
import { getAdminUsers, updateUserStatus } from "@/app/actions/admin"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

export function AdminUsers() {
  const [users, setUsers] = useState<{
    id: string; name: string; email: string; memberId: string;
    referrals: number; clicks: number; status: string; joinDate: string
  }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const result = await getAdminUsers()
    if ("data" in result) setUsers(result.data)
    setLoading(false)
  }

  const handleStatusChange = async (userId: string, newStatus: "active" | "pending" | "suspended") => {
    const result = await updateUserStatus(userId, newStatus)
    if ("success" in result) {
      toast.success("ステータスを更新しました")
      loadUsers()
    } else {
      toast.error("更新に失敗しました")
    }
  }

  const statusBadge: Record<string, { label: string; className: string }> = {
    active: { label: "アクティブ", className: "bg-green-100 text-green-700" },
    pending: { label: "審査中", className: "bg-yellow-100 text-yellow-700" },
    suspended: { label: "停止中", className: "bg-red-100 text-red-700" },
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("ja-JP")
  }

  if (loading) {
    return <div className="text-center py-12 text-[#1B3022]/40">読み込み中...</div>
  }

  return (
    <div>
      <h2 className="text-lg font-medium text-[#1B3022] mb-6">ユーザー一覧（{users.length}名）</h2>

      <div className="bg-white rounded-xl border border-[#1B3022]/5 overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名前</TableHead>
              <TableHead>メール</TableHead>
              <TableHead>会員No.</TableHead>
              <TableHead className="text-center">紹介数</TableHead>
              <TableHead className="text-center">クリック数</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>登録日</TableHead>
              <TableHead className="w-32">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const badge = statusBadge[user.status] || statusBadge.pending
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-sm text-[#1B3022]/60">{user.email}</TableCell>
                  <TableCell className="text-sm text-[#D4AF37]">{user.memberId}</TableCell>
                  <TableCell className="text-center">{user.referrals}</TableCell>
                  <TableCell className="text-center">{user.clicks}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={badge.className}>{badge.label}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[#1B3022]/50">{formatDate(user.joinDate)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {user.status !== "active" && (
                        <Button variant="ghost" size="icon-xs"
                          onClick={() => handleStatusChange(user.id, "active")}
                          title="承認">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </Button>
                      )}
                      {user.status !== "suspended" && (
                        <Button variant="ghost" size="icon-xs"
                          onClick={() => handleStatusChange(user.id, "suspended")}
                          title="停止">
                          <XCircle className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-[#1B3022]/40">ユーザーがいません</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

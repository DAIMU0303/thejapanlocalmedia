"use client"

import React, { useState, useEffect } from "react"
import { AppHeader } from "@/components/app-header"
import { UserProvider } from "@/components/user-provider"
import { AdminOverview } from "@/components/admin/admin-overview"
import { AdminContent } from "@/components/admin/admin-content"
import { AdminUsers } from "@/components/admin/admin-users"
import { AdminRewards } from "@/components/admin/admin-rewards"
import { AdminBroadcast } from "@/components/admin/admin-broadcast"
import { BarChart3, FileText, Users, Gift, Send } from "lucide-react"

function AdminPageContent() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  const tabs = [
    { key: "overview", label: "全体統計", icon: BarChart3 },
    { key: "content", label: "コンテンツ管理", icon: FileText },
    { key: "users", label: "ユーザー管理", icon: Users },
    { key: "rewards", label: "特典管理", icon: Gift },
    { key: "broadcast", label: "配信管理", icon: Send, disabled: true },
  ]

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <AppHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-serif text-[#1B3022] mb-6">管理者ダッシュボード</h1>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {tabs.map((tab) => (
            <button key={tab.key}
              onClick={() => !tab.disabled && setActiveTab(tab.key)}
              disabled={tab.disabled}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "bg-[#1B3022] text-[#D4AF37]"
                  : tab.disabled
                  ? "bg-[#1B3022]/5 text-[#1B3022]/30 cursor-not-allowed"
                  : "bg-white text-[#1B3022]/60 hover:bg-[#1B3022]/5 border border-[#1B3022]/10"
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.disabled && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1B3022]/10">準備中</span>}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && <AdminOverview />}
        {activeTab === "content" && <AdminContent />}
        {activeTab === "users" && <AdminUsers />}
        {activeTab === "rewards" && <AdminRewards />}
        {activeTab === "broadcast" && <AdminBroadcast />}
      </main>
    </div>
  )
}

export default function AdminPage() {
  return (
    <UserProvider>
      <AdminPageContent />
    </UserProvider>
  )
}

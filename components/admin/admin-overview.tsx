"use client"

import React, { useState, useEffect } from "react"
import { getDashboardStats } from "@/app/actions/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Activity, UserPlus, TrendingUp } from "lucide-react"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const monthlyData = [
  { month: "7月", users: 12 }, { month: "8月", users: 28 }, { month: "9月", users: 45 },
  { month: "10月", users: 67 }, { month: "11月", users: 89 }, { month: "12月", users: 124 },
  { month: "1月", users: 156 }, { month: "2月", users: 198 },
]

const weeklyData = [
  { week: "W1", signups: 8 }, { week: "W2", signups: 12 }, { week: "W3", signups: 6 },
  { week: "W4", signups: 15 }, { week: "W5", signups: 9 }, { week: "W6", signups: 18 },
  { week: "W7", signups: 11 }, { week: "W8", signups: 14 },
]

export function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0, activeUsers: 0, monthlyNewUsers: 0, totalReferrals: 0, activeRate: "0"
  })

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => {})
  }, [])

  const kpis = [
    { label: "総会員数", value: stats.totalUsers, icon: Users, color: "text-[#1B3022]" },
    { label: "アクティブ率", value: `${stats.activeRate}%`, icon: Activity, color: "text-[#D4AF37]" },
    { label: "月間新規", value: stats.monthlyNewUsers, icon: UserPlus, color: "text-green-600" },
    { label: "紹介転換率", value: `${stats.totalReferrals}件`, icon: TrendingUp, color: "text-blue-600" },
  ]

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-[#1B3022]/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-bold text-[#1B3022]">{kpi.value}</p>
              <p className="text-xs text-[#1B3022]/40">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-[#1B3022]/5">
          <CardHeader>
            <CardTitle className="text-sm text-[#1B3022]/60">月別成長推移</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1B3022" strokeOpacity={0.05} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#1B3022", opacity: 0.4 }} />
                <YAxis tick={{ fontSize: 12, fill: "#1B3022", opacity: 0.4 }} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#1B3022]/5">
          <CardHeader>
            <CardTitle className="text-sm text-[#1B3022]/60">週別登録数</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1B3022" strokeOpacity={0.05} />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#1B3022", opacity: 0.4 }} />
                <YAxis tick={{ fontSize: 12, fill: "#1B3022", opacity: 0.4 }} />
                <Tooltip />
                <Bar dataKey="signups" fill="#1B3022" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use server"

import { currentUser } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"

async function requireAdmin() {
  const clerkUser = await currentUser()
  if (!clerkUser) throw new Error("Unauthorized")

  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", clerkUser.id)
    .single()

  if (profile?.role !== "admin") throw new Error("Forbidden")
  return clerkUser
}

export async function getAdminUsers() {
  await requireAdmin()
  const supabase = createAdminClient()

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*, referrals_as_referrer:referrals!referrals_referrer_id_fkey(id), invite_codes(click_count)")
    .order("created_at", { ascending: false })

  return {
    data: (profiles || []).map((p) => ({
      id: p.id,
      name: p.display_name,
      email: p.email,
      memberId: p.member_id,
      referrals: p.referrals_as_referrer?.length || 0,
      clicks: p.invite_codes?.reduce((acc: number, c: {click_count: number}) => acc + (c.click_count || 0), 0) || 0,
      status: p.status,
      joinDate: p.created_at,
    }))
  }
}

export async function getDashboardStats() {
  await requireAdmin()
  const supabase = createAdminClient()

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  const { count: activeUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { count: monthlyNewUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", thirtyDaysAgo.toISOString())

  const { count: totalReferrals } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })

  const conversionRate = totalUsers && totalUsers > 0
    ? ((activeUsers || 0) / totalUsers * 100).toFixed(1)
    : "0"

  return {
    totalUsers: totalUsers || 0,
    activeUsers: activeUsers || 0,
    monthlyNewUsers: monthlyNewUsers || 0,
    totalReferrals: totalReferrals || 0,
    activeRate: conversionRate,
  }
}

export async function updateUserStatus(userId: string, newStatus: "active" | "pending" | "suspended") {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("profiles")
    .update({ status: newStatus })
    .eq("id", userId)

  if (error) return { error: error.message }
  return { success: true }
}

export async function getAdminRewards() {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .order("required_referrals", { ascending: true })

  if (error) return { error: error.message }
  return { data: data || [] }
}

export async function updateAdminReward(rewardId: string, title: string, description: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("rewards")
    .update({ title, description })
    .eq("id", rewardId)

  if (error) return { error: error.message }
  return { success: true }
}

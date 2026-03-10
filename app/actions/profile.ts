"use server"

import { getCurrentUser } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function getProfile() {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", user.id)
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function updateProfile(input: { displayName: string; bio?: string }) {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: input.displayName, bio: input.bio })
    .eq("clerk_user_id", user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function getMyInviteCode() {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  const supabase = createAdminClient()
  const { data: code } = await supabase.rpc("get_or_create_invite_code", {
    p_clerk_user_id: user.id,
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return { inviteUrl: code ? `${appUrl}/signup?ref=${code}` : null }
}

export async function getReferralStats() {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  const supabase = createAdminClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", user.id)
    .single()

  if (!profile) return { referralCount: 0, clickCount: 0, conversionRate: "0" }

  const { count: referralCount } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_id", profile.id)

  const { data: codeData } = await supabase
    .from("invite_codes")
    .select("click_count")
    .eq("created_by", profile.id)

  const clickCount = codeData?.reduce((acc, c) => acc + (c.click_count || 0), 0) || 0
  const conversionRate = clickCount > 0
    ? ((referralCount || 0) / clickCount * 100).toFixed(1)
    : "0"

  return { referralCount: referralCount || 0, clickCount, conversionRate }
}

export async function getRewardMilestones() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .order("required_referrals", { ascending: true })

  if (error) return { error: error.message }
  return {
    milestones: (data || []).map((r) => ({
      target: r.required_referrals,
      label: `${r.required_referrals}人達成`,
      reward: r.description || r.title,
      icon: r.icon || "Gift",
    }))
  }
}

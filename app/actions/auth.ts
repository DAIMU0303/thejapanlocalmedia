"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function verifyInviteCode(code: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("verify_invite_code", { input_code: code })
  if (error) return { valid: false, error: error.message }
  return data as { valid: boolean; referrer_name?: string; error?: string }
}

export async function createProfileAfterSignup(params: {
  clerkUserId: string
  email: string
  displayName: string
  screeningAnswer: string
  inviteCode?: string
}) {
  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", params.clerkUserId)
    .single()

  if (existing) return { success: true }

  let invitedById: string | null = null
  let inviteCodeId: string | null = null

  if (params.inviteCode) {
    const { data: codeData } = await supabase
      .from("invite_codes")
      .select("id, created_by")
      .eq("code", params.inviteCode)
      .single()
    if (codeData) {
      inviteCodeId = codeData.id
      invitedById = codeData.created_by
    }
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .insert({
      clerk_user_id: params.clerkUserId,
      display_name: params.displayName,
      email: params.email,
      screening_answer: params.screeningAnswer,
      invited_by: invitedById,
      status: "pending",
      role: "member",
      rank: "standard",
    })
    .select()
    .single()

  if (error) return { error: error.message }

  await supabase.from("invite_slots").insert({ user_id: profile.id })
  await supabase.from("notification_preferences").insert({ user_id: profile.id })

  if (inviteCodeId && invitedById) {
    await supabase.from("referrals").insert({
      referrer_id: invitedById,
      referred_id: profile.id,
      invite_code_id: inviteCodeId,
    })
  }

  return { success: true }
}

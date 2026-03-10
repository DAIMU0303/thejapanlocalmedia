import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=no_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/?error=auth_failed`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(`${origin}/?error=no_user`)
  }

  // Create profile if this is first sign-in (via signup flow)
  const adminSupabase = createAdminClient()
  const { data: existing } = await adminSupabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", user.id)
    .single()

  if (!existing && user.user_metadata?.invite_code !== undefined) {
    const { display_name, screening_answer, invite_code } = user.user_metadata

    let invitedById: string | null = null
    let inviteCodeId: string | null = null

    if (invite_code) {
      const { data: codeData } = await adminSupabase
        .from("invite_codes")
        .select("id, created_by")
        .eq("code", invite_code)
        .single()
      if (codeData) {
        inviteCodeId = codeData.id
        invitedById = codeData.created_by
      }
    }

    const { data: profile } = await adminSupabase
      .from("profiles")
      .insert({
        clerk_user_id: user.id,
        display_name: display_name || user.email,
        email: user.email!,
        screening_answer: screening_answer,
        invited_by: invitedById,
        status: "pending",
        role: "member",
        rank: "standard",
      })
      .select()
      .single()

    if (profile) {
      await adminSupabase.from("invite_slots").insert({ user_id: profile.id })
      await adminSupabase.from("notification_preferences").insert({ user_id: profile.id })

      if (inviteCodeId && invitedById) {
        await adminSupabase.from("referrals").insert({
          referrer_id: invitedById,
          referred_id: profile.id,
          invite_code_id: inviteCodeId,
        })
      }
    }

    return NextResponse.redirect(`${origin}/?message=登録が完了しました。管理者の承認をお待ちください。`)
  }

  return NextResponse.redirect(`${origin}/feed`)
}

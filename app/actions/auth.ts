"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function verifyInviteCode(code: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("verify_invite_code", { input_code: code })
  if (error) return { valid: false, error: error.message }
  return data as { valid: boolean; referrer_name?: string; error?: string }
}

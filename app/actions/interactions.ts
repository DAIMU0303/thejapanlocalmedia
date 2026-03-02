"use server"

import { currentUser } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function toggleLike(contentId: string) {
  const clerkUser = await currentUser()
  if (!clerkUser) return { error: "Unauthorized" }

  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", clerkUser.id)
    .single()

  if (!profile) return { error: "Profile not found" }

  const { data: existing } = await supabase
    .from("content_interactions")
    .select("id")
    .eq("user_id", profile.id)
    .eq("content_id", contentId)
    .eq("type", "like")
    .single()

  if (existing) {
    await supabase.from("content_interactions").delete().eq("id", existing.id)
    return { liked: false }
  } else {
    await supabase.from("content_interactions").insert({
      user_id: profile.id, content_id: contentId, type: "like"
    })
    return { liked: true }
  }
}

export async function toggleBookmark(contentId: string) {
  const clerkUser = await currentUser()
  if (!clerkUser) return { error: "Unauthorized" }

  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", clerkUser.id)
    .single()

  if (!profile) return { error: "Profile not found" }

  const { data: existing } = await supabase
    .from("content_interactions")
    .select("id")
    .eq("user_id", profile.id)
    .eq("content_id", contentId)
    .eq("type", "bookmark")
    .single()

  if (existing) {
    await supabase.from("content_interactions").delete().eq("id", existing.id)
    return { bookmarked: false }
  } else {
    await supabase.from("content_interactions").insert({
      user_id: profile.id, content_id: contentId, type: "bookmark"
    })
    return { bookmarked: true }
  }
}

export async function getUserInteractions(contentId: string) {
  const clerkUser = await currentUser()
  if (!clerkUser) return { liked: false, bookmarked: false }

  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", clerkUser.id)
    .single()

  if (!profile) return { liked: false, bookmarked: false }

  const { data } = await supabase
    .from("content_interactions")
    .select("type")
    .eq("user_id", profile.id)
    .eq("content_id", contentId)
    .in("type", ["like", "bookmark"])

  return {
    liked: data?.some((i) => i.type === "like") || false,
    bookmarked: data?.some((i) => i.type === "bookmark") || false,
  }
}

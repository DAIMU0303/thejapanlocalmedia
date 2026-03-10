"use server"

import { getCurrentUser } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function getPublishedContents() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("contents")
    .select("*")
    .eq("status", "published")
    .order("publish_date", { ascending: false })

  if (error) return { error: error.message }
  return { data: data || [] }
}

export async function getAllContents() {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("contents")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return { error: error.message }
  return { data: data || [] }
}

export async function getContentById(id: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("contents")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function createContent(input: {
  type: string
  title: string
  description?: string
  body?: string
  status: string
  publishDate?: string
  authorName: string
  authorBio?: string
  thumbnailUrl?: string
  url?: string
  duration?: string
  premium?: boolean
  requiredRank?: string
}) {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", user.id)
    .single()

  const { data, error } = await supabase
    .from("contents")
    .insert({
      type: input.type,
      title: input.title,
      description: input.description,
      body: input.body,
      status: input.status,
      publish_date: input.status === "published" ? (input.publishDate || new Date().toISOString()) : input.publishDate,
      author_id: profile?.id,
      author_name: input.authorName,
      author_bio: input.authorBio,
      thumbnail_url: input.thumbnailUrl,
      url: input.url,
      duration: input.duration,
      premium: input.premium || false,
      required_rank: input.requiredRank || "standard",
    })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function deleteContent(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  const supabase = createAdminClient()
  const { error } = await supabase.from("contents").delete().eq("id", id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function uploadThumbnail(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  const file = formData.get("file") as File
  if (!file) return { error: "No file provided" }
  if (file.size > 5 * 1024 * 1024) return { error: "5MB以下のファイルを選択してください" }

  const supabase = createAdminClient()
  const ext = file.name.split(".").pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

  const { data, error } = await supabase.storage
    .from("thumbnails")
    .upload(fileName, file, { contentType: file.type, upsert: false })

  if (error) return { error: error.message }

  const { data: { publicUrl } } = supabase.storage.from("thumbnails").getPublicUrl(data.path)
  return { url: publicUrl }
}

export async function uploadVideo(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  const file = formData.get("file") as File
  if (!file) return { error: "No file provided" }
  if (file.size > 100 * 1024 * 1024) return { error: "100MB以下のファイルを選択してください" }

  const supabase = createAdminClient()
  const ext = file.name.split(".").pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

  const { data, error } = await supabase.storage
    .from("content-media")
    .upload(fileName, file, { contentType: file.type, upsert: false })

  if (error) return { error: error.message }

  const { data: { publicUrl } } = supabase.storage.from("content-media").getPublicUrl(data.path)
  return { url: publicUrl }
}

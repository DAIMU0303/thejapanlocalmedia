export type ContentType = "article" | "video" | "external"
export type ContentStatus = "draft" | "scheduled" | "published"
export type MemberRank = "all" | "standard" | "gold" | "platinum" | "diamond"

export interface Content {
  id: string
  type: ContentType
  title: string
  description: string
  body: string
  status: ContentStatus
  publishDate: string
  author: string
  authorBio?: string
  thumbnail?: string
  views: number
  likes?: number
  premium: boolean
  requiredRank: MemberRank
  url?: string
  duration?: string
  tags?: string[]
}

export interface UserProfile {
  id: string
  clerkUserId: string
  name: string
  email: string
  memberId: string
  rank: MemberRank
  role: "member" | "admin"
  status: "pending" | "active" | "suspended"
  avatarUrl?: string
  bio?: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  memberId: string
  referrals: number
  clicks: number
  status: "pending" | "active" | "suspended"
  joinDate: string
}

export interface Reward {
  id: string
  title: string
  description: string
  requiredReferrals: number
  icon: string
  status: string
}

// Database row type (snake_case from Supabase)
export interface DbContent {
  id: string
  type: string
  title: string
  description: string | null
  body: string | null
  status: string
  publish_date: string | null
  author_id: string | null
  author_name: string | null
  author_bio: string | null
  thumbnail_url: string | null
  url: string | null
  duration: string | null
  views: number
  likes: number
  premium: boolean
  required_rank: string
  tags?: string[]
  created_at: string
  updated_at: string
}

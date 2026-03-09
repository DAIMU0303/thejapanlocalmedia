"use client"

import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useUserStore } from "@/lib/store/use-user-store"
import { getProfile } from "@/app/actions/profile"

// TEMPORARY: Enable mock user for preview without auth
const PREVIEW_MODE = true

const MOCK_USER = {
  id: "preview-user-id",
  clerkUserId: "preview-clerk-id",
  name: "プレビューユーザー",
  email: "preview@example.com",
  memberId: "TJLM-0001",
  rank: "standard" as const,
  role: "member" as const,
  status: "active" as const,
  avatarUrl: undefined,
  bio: "プレビュー用のモックユーザーです",
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser()
  const { setUser, setLoading, logout } = useUserStore()

  useEffect(() => {
    // TEMPORARY: Use mock user for preview
    if (PREVIEW_MODE) {
      setUser(MOCK_USER)
      return
    }

    if (!isLoaded) return

    if (!clerkUser) {
      logout()
      return
    }

    setLoading(true)
    getProfile().then((result) => {
      if ("data" in result && result.data) {
        setUser({
          id: result.data.id,
          clerkUserId: clerkUser.id,
          name: result.data.display_name,
          email: result.data.email,
          memberId: result.data.member_id || "",
          rank: result.data.rank || "standard",
          role: result.data.role || "member",
          status: result.data.status || "pending",
          avatarUrl: result.data.avatar_url || undefined,
          bio: result.data.bio || undefined,
        })
      } else {
        setLoading(false)
      }
    })
  }, [clerkUser, isLoaded])

  return <>{children}</>
}

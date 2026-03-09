"use client"

import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import { useUserStore } from "@/lib/store/use-user-store"
import { getProfile } from "@/app/actions/profile"

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser()
  const { setUser, setLoading, logout } = useUserStore()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoaded) return

    if (!clerkUser) {
      logout()
      return
    }

    setLoading(true)
    getProfile().then((result) => {
      if ("data" in result && result.data) {
        const data = result.data

        if (data.status === "pending") {
          window.location.href = "/?error=pending"
          return
        }
        if (data.status === "suspended") {
          window.location.href = "/?error=suspended"
          return
        }
        if (pathname.startsWith("/admin") && data.role !== "admin") {
          window.location.href = "/feed"
          return
        }

        setUser({
          id: data.id,
          clerkUserId: clerkUser.id,
          name: data.display_name,
          email: data.email,
          memberId: data.member_id || "",
          rank: data.rank || "standard",
          role: data.role || "member",
          status: data.status || "pending",
          avatarUrl: data.avatar_url || undefined,
          bio: data.bio || undefined,
        })
      } else {
        setLoading(false)
      }
    })
  }, [clerkUser, isLoaded])

  return <>{children}</>
}

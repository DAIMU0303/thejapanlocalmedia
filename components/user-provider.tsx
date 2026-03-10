"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUserStore } from "@/lib/store/use-user-store"
import { getProfile } from "@/app/actions/profile"

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, logout } = useUserStore()

  useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        logout()
        return
      }

      setLoading(true)
      const result = await getProfile()
      if ("data" in result && result.data) {
        const profile = result.data
        if (profile.status === "pending") {
          window.location.href = "/?error=pending"
          return
        }
        if (profile.status === "suspended") {
          window.location.href = "/?error=suspended"
          return
        }
        setUser({
          id: profile.id,
          supabaseUserId: user.id,
          name: profile.display_name,
          email: profile.email,
          memberId: profile.member_id || "",
          rank: profile.rank || "standard",
          role: profile.role || "member",
          status: profile.status || "pending",
          avatarUrl: profile.avatar_url || undefined,
          bio: profile.bio || undefined,
        })
      } else {
        logout()
      }
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        logout()
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        loadUser()
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setLoading, logout])

  return <>{children}</>
}

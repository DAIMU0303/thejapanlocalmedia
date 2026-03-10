import { create } from "zustand"

interface UserProfile {
  id: string
  supabaseUserId: string
  name: string
  email: string
  memberId: string
  rank: string
  role: "member" | "admin"
  status: string
  avatarUrl?: string
  bio?: string
}

interface UserState {
  user: UserProfile | null
  isLoading: boolean
  setUser: (user: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  logout: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  updateProfile: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null,
  })),
  logout: () => set({ user: null, isLoading: false }),
}))

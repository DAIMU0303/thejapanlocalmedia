"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useClerk } from "@clerk/nextjs"
import { useUserStore } from "@/lib/store/use-user-store"
import { Home, User, Shield, Settings, LogOut, Heart, Menu, X, ChevronDown, Search, Coins } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface AppHeaderProps {
  points?: number
}

export function AppHeader({ points = 0 }: AppHeaderProps) {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const { user } = useUserStore()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => signOut({ redirectUrl: "/" })

  const navItems = [
    { href: "/feed", label: "ホーム", icon: Home },
    { href: "/mypage", label: "マイページ", icon: User },
    ...(user?.role === "admin" ? [{ href: "/admin", label: "管理者", icon: Shield }] : []),
  ]

  const initial = user?.name?.charAt(0) || "U"

  if (!mounted) return null

  return (
    <header className="sticky top-0 z-50 border-b border-[#1B3022]/10 bg-[#F8F9FA]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/feed" className="font-serif text-xl tracking-wider text-[#1B3022] shrink-0">
            TheJapanLocalMedia
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="記事・動画・案件を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 h-9 bg-muted/50 border-transparent focus:border-primary/30 focus:bg-background"
              />
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                    isActive ? "bg-[#1B3022] text-[#D4AF37]" : "text-[#1B3022]/60 hover:text-[#1B3022] hover:bg-[#1B3022]/5"
                  }`}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Points Badge - Quick link to MyPage */}
          <Link href="/mypage" className="hidden md:flex">
            <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-accent/20 hover:bg-accent/30 text-accent-foreground transition-colors cursor-pointer">
              <Coins className="w-3.5 h-3.5 text-accent" />
              <span className="font-semibold text-sm">{points.toLocaleString()} pts</span>
            </Badge>
          </Link>

          {/* Desktop User Menu */}
          <div className="hidden md:block relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#1B3022]/5 transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#1B3022] flex items-center justify-center text-[#D4AF37] text-sm font-medium">
                {initial}
              </div>
              <span className="text-sm text-[#1B3022]/80">{user?.name}</span>
              <ChevronDown className="w-4 h-4 text-[#1B3022]/40" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-[#1B3022]/10 py-2 z-50">
                <div className="px-4 py-3 border-b border-[#1B3022]/5">
                  <p className="text-sm font-medium text-[#1B3022]">{user?.name}</p>
                  <p className="text-xs text-[#1B3022]/50">{user?.email}</p>
                  {user?.memberId && (
                    <p className="text-xs text-[#D4AF37] mt-1">No. {user.memberId}</p>
                  )}
                </div>
                <div className="py-1">
                  <Link href="/mypage" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-[#1B3022]/70 hover:bg-[#1B3022]/5">
                    <Heart className="w-4 h-4" />いいね・保存済み
                  </Link>
                  <Link href="/settings" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-[#1B3022]/70 hover:bg-[#1B3022]/5">
                    <Settings className="w-4 h-4" />アカウント設定
                  </Link>
                  {user?.role === "admin" && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-[#1B3022]/70 hover:bg-[#1B3022]/5">
                      <Shield className="w-4 h-4" />管理者ダッシュボード
                    </Link>
                  )}
                </div>
                <div className="border-t border-[#1B3022]/5 pt-1">
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4" />ログアウト
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6 text-[#1B3022]" /> : <Menu className="w-6 h-6 text-[#1B3022]" />}
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 h-9 bg-muted/50 border-transparent"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[#1B3022]/10 py-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${
                    isActive ? "bg-[#1B3022] text-[#D4AF37]" : "text-[#1B3022]/70 hover:bg-[#1B3022]/5"
                  }`}>
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
            <div className="border-t border-[#1B3022]/10 pt-2 mt-2">
              <Link href="/settings" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[#1B3022]/70 hover:bg-[#1B3022]/5">
                <Settings className="w-5 h-5" />アカウント設定
              </Link>
              <button onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50">
                <LogOut className="w-5 h-5" />ログアウト
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Home,
  FileText,
  Building2,
  User,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react"

interface AppSidebarProps {
  inviteProgress?: {
    current: number
    target: number
  }
}

const navItems = [
  { href: "/feed", icon: Home, label: "ホーム" },
  { href: "/feed?tab=articles", icon: FileText, label: "記事" },
  { href: "/feed?tab=projects", icon: Building2, label: "案件" },
  { href: "/mypage", icon: User, label: "マイページ" },
]

export function AppSidebar({ inviteProgress }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const progressPercent = inviteProgress
    ? Math.min((inviteProgress.current / inviteProgress.target) * 100, 100)
    : 0

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Logo area */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <span className="font-bold text-lg truncate">TJLM</span>
        )}
        {collapsed && (
          <span className="font-bold text-lg mx-auto">T</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href.split("?")[0])
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Invite progress mini bar */}
      {inviteProgress && (
        <div className={cn("px-3 py-4 border-t border-sidebar-border", collapsed && "px-2")}>
          {!collapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-sidebar-foreground/70">
                  <Users className="w-3.5 h-3.5" />
                  招待進捗
                </span>
                <span className="font-medium text-sidebar-primary">
                  {inviteProgress.current}/{inviteProgress.target}
                </span>
              </div>
              <Progress value={progressPercent} className="h-1.5 bg-sidebar-accent" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Users className="w-4 h-4 text-sidebar-foreground/70" />
              <span className="text-[10px] font-medium text-sidebar-primary">
                {inviteProgress.current}/{inviteProgress.target}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Collapse toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>
    </aside>
  )
}

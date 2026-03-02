"use client"

import React from "react"
import { Send } from "lucide-react"

export function AdminBroadcast() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-[#1B3022]/5 flex items-center justify-center mb-4">
        <Send className="w-8 h-8 text-[#1B3022]/20" />
      </div>
      <h3 className="text-lg font-medium text-[#1B3022]/40">配信管理</h3>
      <p className="text-sm text-[#1B3022]/30 mt-2">この機能は現在開発中です</p>
    </div>
  )
}

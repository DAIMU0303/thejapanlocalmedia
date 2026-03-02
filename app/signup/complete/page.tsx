"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createProfileAfterSignup } from "@/app/actions/auth"

export default function SignupCompletePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [question, setQuestion] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError("")
    setIsSubmitting(true)

    try {
      await createProfileAfterSignup({
        clerkUserId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        displayName: user.fullName || user.firstName || "名前未設定",
        screeningAnswer: question,
      })
      router.push("/?message=ご登録ありがとうございます。審査完了後にログインできます。")
    } catch {
      setError("登録に失敗しました。もう一度お試しください。")
    }
    setIsSubmitting(false)
  }

  if (!mounted || !isLoaded) return null

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image src="/images/hero-gateway.jpg" alt="" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-[#1B3022]/80" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl tracking-wider text-[#F8F9FA]">TheJapanLocalMedia</h1>
          <div className="w-12 h-px bg-[#D4AF37] mx-auto mt-4 mb-3" />
          <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase">Screening Question</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase text-[#F8F9FA]/50">
              あなたが今、一番知りたいことを教えてください
            </Label>
            <Textarea placeholder="地方創生・観光・まちづくりなどに関心のあること..." value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[120px] bg-[#F8F9FA]/5 border-[#F8F9FA]/10 text-[#F8F9FA] placeholder:text-[#F8F9FA]/25" required />
          </div>

          <Button type="submit" disabled={isSubmitting || !question}
            className="w-full h-12 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#1B3022] font-medium tracking-wider">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#1B3022]/30 border-t-[#1B3022] rounded-full animate-spin" />送信中...
              </span>
            ) : "送信する"}
          </Button>
        </form>
      </div>
    </div>
  )
}

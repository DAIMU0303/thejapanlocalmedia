"use client"

import React, { Suspense, useState, useEffect } from "react"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Eye, EyeOff, CheckCircle, UserPlus } from "lucide-react"
import { verifyInviteCode } from "@/app/actions/auth"

export default function SignupPage() {
  return <Suspense><SignupContent /></Suspense>
}

function SignupContent() {
  const searchParams = useSearchParams()
  const ref = searchParams.get("ref") || ""
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [referrerName, setReferrerName] = useState("")
  const [codeValid, setCodeValid] = useState(false)
  const [codeChecking, setCodeChecking] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    email: "",
    password: "",
    question: "",
  })

  useEffect(() => {
    setMounted(true)
    if (!ref) {
      router.push("/")
      return
    }
    verifyInviteCode(ref).then((result) => {
      if (result.valid && result.referrer_name) {
        setReferrerName(result.referrer_name)
        setCodeValid(true)
      } else {
        router.push("/")
      }
      setCodeChecking(false)
    })
  }, [ref, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            display_name: `${formData.lastName} ${formData.firstName}`,
            screening_answer: formData.question,
            invite_code: ref,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        setError(signUpError.message || "登録に失敗しました")
        setIsSubmitting(false)
        return
      }

      setIsComplete(true)
    } catch {
      setError("登録に失敗しました")
    }
    setIsSubmitting(false)
  }

  if (!mounted || codeChecking) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Image src="/images/hero-gateway.jpg" alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-[#1B3022]/80" />
        </div>
        <div className="relative z-10">
          <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!codeValid) return null

  if (isComplete) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Image src="/images/hero-gateway.jpg" alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-[#1B3022]/80" />
        </div>
        <div className="relative z-10 w-full max-w-md mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-[#D4AF37]/30 bg-[#D4AF37]/10">
            <CheckCircle className="w-10 h-10 text-[#D4AF37]" />
          </div>
          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-[#F8F9FA]">確認メールを送信しました</h2>
            <p className="text-sm text-[#F8F9FA]/70">メールに記載のリンクをクリックして登録を完了してください。</p>
            <p className="text-xs text-[#F8F9FA]/50">メール確認後、管理者による審査（1〜3営業日）が行われます。</p>
          </div>
          <Button onClick={() => router.push("/")} className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#1B3022]">
            トップに戻る
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-12">
      <div className="absolute inset-0">
        <Image src="/images/hero-gateway.jpg" alt="" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-[#1B3022]/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B3022] via-transparent to-[#1B3022]/40" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl tracking-wider text-[#F8F9FA]">TheJapanLocalMedia</h1>
          <div className="w-12 h-px bg-[#D4AF37] mx-auto mt-4 mb-3" />
          <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase">Member Registration</p>
        </div>

        {referrerName && (
          <div className="mb-6 p-3 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-center">
            <div className="flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm text-[#F8F9FA]/80">{referrerName} さんからの招待</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs tracking-widest uppercase text-[#F8F9FA]/50">姓</Label>
              <Input placeholder="山田" value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="h-12 bg-[#F8F9FA]/5 border-[#F8F9FA]/10 text-[#F8F9FA] placeholder:text-[#F8F9FA]/25" required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs tracking-widest uppercase text-[#F8F9FA]/50">名</Label>
              <Input placeholder="太郎" value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="h-12 bg-[#F8F9FA]/5 border-[#F8F9FA]/10 text-[#F8F9FA] placeholder:text-[#F8F9FA]/25" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase text-[#F8F9FA]/50">Email</Label>
            <Input type="email" placeholder="your@email.com" value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12 bg-[#F8F9FA]/5 border-[#F8F9FA]/10 text-[#F8F9FA] placeholder:text-[#F8F9FA]/25" required />
          </div>

          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase text-[#F8F9FA]/50">Password</Label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} placeholder="8文字以上" value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12 bg-[#F8F9FA]/5 border-[#F8F9FA]/10 text-[#F8F9FA] placeholder:text-[#F8F9FA]/25 pr-12" required minLength={8} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F8F9FA]/30 hover:text-[#F8F9FA]/60">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase text-[#F8F9FA]/50">
              あなたが今、一番知りたいことを教えてください
            </Label>
            <Textarea placeholder="地方創生・観光・まちづくりなどに関心のあること..." value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="min-h-[100px] bg-[#F8F9FA]/5 border-[#F8F9FA]/10 text-[#F8F9FA] placeholder:text-[#F8F9FA]/25" required />
          </div>

          <Button type="submit" disabled={isSubmitting}
            className="w-full h-12 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#1B3022] font-medium tracking-wider">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#1B3022]/30 border-t-[#1B3022] rounded-full animate-spin" />登録中...
              </span>
            ) : "登録する"}
          </Button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-[#F8F9FA]/20 tracking-wider">TheJapanLocalMedia 2026 All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

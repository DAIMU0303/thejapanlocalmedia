"use client"

import React, { Suspense } from "react"
import { useState } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowLeft, Info, Mail } from "lucide-react"

export default function GatewayPage() {
  return <Suspense><GatewayContent /></Suspense>
}

function GatewayContent() {
  const searchParams = useSearchParams()
  const callbackMessage = searchParams.get("message")
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "reset">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [error, setError] = useState("")

  const errorCode = searchParams.get("error")

  // Handle errors from middleware
  React.useEffect(() => {
    if (errorCode === "pending") {
      setError("アカウントは現在承認待ちです。管理者からの連絡をお待ちください。")
      setIsLoggingIn(false)
    } else if (errorCode === "suspended") {
      setError("アカウントが停止されています。管理者にお問い合わせください。")
      setIsLoggingIn(false)
    }
  }, [errorCode])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return
    setError("")
    setIsLoggingIn(true)
    try {
      const result = await signIn.create({ identifier: email, password })
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/feed")
        // Note: we don't set setIsLoggingIn(false) here because we are navigating
      } else {
        // Handle cases like MFA
        setIsLoggingIn(false)
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] }
      setError(clerkErr.errors?.[0]?.message || "ログインに失敗しました")
      setIsLoggingIn(false)
    }
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return
    setError("")
    setIsResetting(true)
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier: resetEmail })
      setResetSent(true)
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] }
      setError(clerkErr.errors?.[0]?.message || "送信に失敗しました")
    }
    setIsResetting(false)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image src="/images/hero-gateway.jpg" alt="" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-[#1B3022]/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B3022] via-transparent to-[#1B3022]/40" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="text-center mb-12 -mx-6">
          <h1 className="font-serif text-4xl md:text-5xl tracking-wider text-[#F8F9FA] whitespace-nowrap">
            TheJapanLocalMedia
          </h1>
        </div>

        {callbackMessage && !error && (
          <div className="mb-6 p-4 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Info className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <p className="text-sm text-[#F8F9FA]/80">{callbackMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {mode === "login" ? (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase">Welcome Back</p>
              <p className="text-[#F8F9FA]/70 text-sm font-light">アカウントにログインしてください</p>
            </div>
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs tracking-widest uppercase text-[#F8F9FA]/50">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-[#F8F9FA]/5 border-[#F8F9FA]/10 text-[#F8F9FA] placeholder:text-[#F8F9FA]/25 focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/20" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs tracking-widest uppercase text-[#F8F9FA]/50">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-[#F8F9FA]/5 border-[#F8F9FA]/10 text-[#F8F9FA] placeholder:text-[#F8F9FA]/25 focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/20 pr-12" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F8F9FA]/30 hover:text-[#F8F9FA]/60 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={isLoggingIn}
                className="w-full h-12 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#1B3022] font-medium tracking-wider">
                {isLoggingIn ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#1B3022]/30 border-t-[#1B3022] rounded-full animate-spin" />
                    ログイン中...
                  </span>
                ) : "ログイン"}
              </Button>
            </form>
            <div className="text-center">
              <button type="button" onClick={() => { setMode("reset"); setError(""); setResetSent(false); setResetEmail(email) }}
                className="text-xs text-[#F8F9FA]/40 hover:text-[#D4AF37] transition-colors">
                パスワードをお忘れの方
              </button>
            </div>
            <p className="text-center text-xs text-[#F8F9FA]/30">新規登録は招待リンクからのみ可能です</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5">
                <Mail className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase">Password Reset</p>
              <p className="text-[#F8F9FA]/70 text-sm font-light">パスワード再設定用のメールをお送りします</p>
            </div>
            {resetSent ? (
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-center space-y-2">
                  <p className="text-sm text-[#F8F9FA]/90">パスワード再設定用のメールを送信しました</p>
                  <p className="text-xs text-[#F8F9FA]/60">メールが届かない場合は迷惑メールフォルダをご確認ください</p>
                </div>
                <button type="button" onClick={() => { setMode("login"); setError(""); setResetSent(false) }}
                  className="flex items-center justify-center gap-2 w-full text-xs text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors tracking-wider">
                  <ArrowLeft className="w-3 h-3" />ログインに戻る
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-xs tracking-widest uppercase text-[#F8F9FA]/50">Email</Label>
                  <Input id="reset-email" type="email" placeholder="your@email.com" value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="h-12 bg-[#F8F9FA]/5 border-[#F8F9FA]/10 text-[#F8F9FA] placeholder:text-[#F8F9FA]/25 focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/20" required />
                </div>
                <Button type="submit" disabled={isResetting || !resetEmail}
                  className="w-full h-12 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#1B3022] font-medium tracking-wider">
                  {isResetting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#1B3022]/30 border-t-[#1B3022] rounded-full animate-spin" />送信中...
                    </span>
                  ) : "リセットメールを送信"}
                </Button>
              </form>
            )}
            {!resetSent && (
              <div className="text-center">
                <button type="button" onClick={() => { setMode("login"); setError("") }}
                  className="flex items-center justify-center gap-2 w-full text-xs text-[#F8F9FA]/40 hover:text-[#D4AF37] transition-colors">
                  <ArrowLeft className="w-3 h-3" />ログインに戻る
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="text-[10px] text-[#F8F9FA]/20 tracking-wider">TheJapanLocalMedia 2026 All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

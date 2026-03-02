"use client"

import React, { useState, useEffect } from "react"
import { getAllContents, createContent, deleteContent, uploadThumbnail, uploadVideo } from "@/app/actions/content"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, FileText, Video, ExternalLink, Upload } from "lucide-react"
import { toast } from "sonner"
import type { DbContent } from "@/lib/types"

export function AdminContent() {
  const [contents, setContents] = useState<DbContent[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    type: "article",
    title: "",
    description: "",
    body: "",
    status: "draft",
    authorName: "",
    authorBio: "",
    thumbnailUrl: "",
    url: "",
    duration: "",
    premium: false,
    requiredRank: "standard",
  })

  useEffect(() => {
    loadContents()
  }, [])

  const loadContents = async () => {
    setLoading(true)
    const result = await getAllContents()
    if ("data" in result && result.data) setContents(result.data as DbContent[])
    setLoading(false)
  }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    const result = await uploadThumbnail(formData)
    if ("url" in result && result.url) {
      setForm({ ...form, thumbnailUrl: result.url })
      toast.success("サムネイルをアップロードしました")
    } else {
      toast.error("アップロードに失敗しました")
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    const result = await uploadVideo(formData)
    if ("url" in result && result.url) {
      setForm({ ...form, url: result.url })
      toast.success("動画をアップロードしました")
    } else {
      toast.error("アップロードに失敗しました")
    }
  }

  const handleCreate = async () => {
    if (!form.title || !form.authorName) {
      toast.error("タイトルと著者名は必須です")
      return
    }
    setSubmitting(true)
    const result = await createContent(form)
    if ("data" in result) {
      toast.success("コンテンツを作成しました")
      setOpen(false)
      setForm({ type: "article", title: "", description: "", body: "", status: "draft", authorName: "", authorBio: "", thumbnailUrl: "", url: "", duration: "", premium: false, requiredRank: "standard" })
      loadContents()
    } else {
      toast.error("作成に失敗しました")
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("本当に削除しますか？")) return
    const result = await deleteContent(id)
    if ("success" in result) {
      toast.success("削除しました")
      loadContents()
    }
  }

  const typeIcon: Record<string, React.ReactNode> = {
    article: <FileText className="w-4 h-4" />,
    video: <Video className="w-4 h-4" />,
    external: <ExternalLink className="w-4 h-4" />,
  }

  const statusColor: Record<string, string> = {
    draft: "bg-[#1B3022]/10 text-[#1B3022]/60",
    scheduled: "bg-blue-100 text-blue-700",
    published: "bg-green-100 text-green-700",
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("ja-JP")
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-[#1B3022]">コンテンツ一覧</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#1B3022]">
              <Plus className="w-4 h-4 mr-2" />新規作成
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>コンテンツ作成</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>タイプ</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">記事</SelectItem>
                      <SelectItem value="video">動画</SelectItem>
                      <SelectItem value="external">外部リンク</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ステータス</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">下書き</SelectItem>
                      <SelectItem value="published">公開</SelectItem>
                      <SelectItem value="scheduled">予約公開</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>タイトル</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>説明</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>

              {form.type === "article" && (
                <div className="space-y-2">
                  <Label>本文（Markdown）</Label>
                  <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={10} className="font-mono text-sm" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>著者名</Label>
                  <Input value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>著者肩書</Label>
                  <Input value={form.authorBio} onChange={(e) => setForm({ ...form, authorBio: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>サムネイル</Label>
                <div className="flex items-center gap-2">
                  <Input value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} placeholder="URLまたはアップロード" className="flex-1" />
                  <label className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span><Upload className="w-4 h-4" /></span>
                    </Button>
                    <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {(form.type === "video" || form.type === "external") && (
                <div className="space-y-2">
                  <Label>{form.type === "video" ? "動画URL" : "外部URL"}</Label>
                  <div className="flex items-center gap-2">
                    <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="URL" className="flex-1" />
                    {form.type === "video" && (
                      <label className="cursor-pointer">
                        <Button type="button" variant="outline" size="sm" asChild>
                          <span><Upload className="w-4 h-4" /></span>
                        </Button>
                        <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {form.type === "video" && (
                <div className="space-y-2">
                  <Label>再生時間</Label>
                  <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="例: 15:30" />
                </div>
              )}

              <Button onClick={handleCreate} disabled={submitting} className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#1B3022]">
                {submitting ? "作成中..." : "作成"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#1B3022]/40">読み込み中...</div>
      ) : (
        <div className="bg-white rounded-xl border border-[#1B3022]/5 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">タイプ</TableHead>
                <TableHead>タイトル</TableHead>
                <TableHead className="w-24">状態</TableHead>
                <TableHead className="w-28">公開日</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contents.map((c) => (
                <TableRow key={c.id as string}>
                  <TableCell>{typeIcon[c.type as string] || null}</TableCell>
                  <TableCell className="font-medium">{c.title as string}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColor[c.status as string] || ""}>
                      {c.status === "draft" ? "下書き" : c.status === "published" ? "公開" : "予約"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[#1B3022]/50">{formatDate(c.publish_date as string)}</TableCell>
                  <TableCell>
                    <button onClick={() => handleDelete(c.id as string)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {contents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-[#1B3022]/40">コンテンツがありません</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

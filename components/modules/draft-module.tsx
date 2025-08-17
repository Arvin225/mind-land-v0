"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Search, FileText, Trash2, MoreVertical, Save, Clock, Eye, EyeOff, Copy, Download } from "lucide-react"

interface Draft {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  wordCount: number
}

export function DraftModule() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newDraftTitle, setNewDraftTitle] = useState("")
  const [editingContent, setEditingContent] = useState("")
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved")
  const [showPreview, setShowPreview] = useState(false)

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const savedDrafts = localStorage.getItem("drafts")
    if (savedDrafts) {
      const parsedDrafts = JSON.parse(savedDrafts).map((draft: any) => ({
        ...draft,
        createdAt: new Date(draft.createdAt),
        updatedAt: new Date(draft.updatedAt),
      }))
      setDrafts(parsedDrafts)
    } else {
      // 初始化示例数据
      const sampleDrafts: Draft[] = [
        {
          id: "1",
          title: "产品设计思考",
          content: `# 产品设计的核心原则

## 用户体验优先
在设计任何产品时，我们都应该将用户体验放在首位。这意味着：

1. 深入了解用户需求
2. 简化操作流程
3. 提供清晰的反馈

## 简约而不简单
好的设计应该是简约的，但不能过于简单而失去功能性。我们需要在简洁和功能之间找到平衡。

## 一致性原则
保持设计的一致性能够：
- 降低用户的学习成本
- 提高产品的专业感
- 增强用户信任

这些原则将指导我们创造出更好的产品。`,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000),
          wordCount: 156,
        },
        {
          id: "2",
          title: "会议记录 - 项目讨论",
          content: `会议时间：2024年1月15日 14:00-15:30
参与人员：张三、李四、王五

## 讨论要点

### 项目进度
- 前端开发已完成80%
- 后端API开发进度70%
- 测试用例编写50%

### 遇到的问题
1. 第三方API集成遇到技术难题
2. 移动端适配需要更多时间
3. 性能优化还需要进一步调整

### 下一步计划
- 本周完成API集成
- 下周开始全面测试
- 预计月底可以发布测试版本

## 行动项
- [ ] 张三：解决API集成问题
- [ ] 李四：完成移动端适配
- [ ] 王五：准备测试环境`,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          wordCount: 203,
        },
      ]
      setDrafts(sampleDrafts)
      localStorage.setItem("drafts", JSON.stringify(sampleDrafts))
    }
  }, [])

  const saveDrafts = (updatedDrafts: Draft[]) => {
    setDrafts(updatedDrafts)
    localStorage.setItem("drafts", JSON.stringify(updatedDrafts))
  }

  const createDraft = () => {
    if (!newDraftTitle.trim()) return

    const newDraft: Draft = {
      id: Date.now().toString(),
      title: newDraftTitle.trim(),
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      wordCount: 0,
    }

    const updatedDrafts = [newDraft, ...drafts]
    saveDrafts(updatedDrafts)
    setNewDraftTitle("")
    setIsCreateDialogOpen(false)
    setSelectedDraft(newDraft)
    setIsEditing(true)
    setEditingContent("")
  }

  const deleteDraft = (draftId: string) => {
    const updatedDrafts = drafts.filter((draft) => draft.id !== draftId)
    saveDrafts(updatedDrafts)
    if (selectedDraft?.id === draftId) {
      setSelectedDraft(null)
      setIsEditing(false)
    }
  }

  const autoSave = (content: string) => {
    if (!selectedDraft) return

    setAutoSaveStatus("saving")

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      const wordCount = content
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length
      const updatedDrafts = drafts.map((draft) =>
        draft.id === selectedDraft.id
          ? {
              ...draft,
              content,
              updatedAt: new Date(),
              wordCount,
            }
          : draft,
      )
      saveDrafts(updatedDrafts)
      setSelectedDraft((prev) => (prev ? { ...prev, content, wordCount, updatedAt: new Date() } : null))
      setAutoSaveStatus("saved")
    }, 1000)
  }

  const handleContentChange = (content: string) => {
    setEditingContent(content)
    setAutoSaveStatus("unsaved")
    autoSave(content)
  }

  const startEditing = (draft: Draft) => {
    setSelectedDraft(draft)
    setEditingContent(draft.content)
    setIsEditing(true)
    setShowPreview(false)
  }

  const stopEditing = () => {
    setIsEditing(false)
    setShowPreview(false)
  }

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      // 这里可以添加一个toast通知
    } catch (err) {
      console.error("复制失败:", err)
    }
  }

  const downloadDraft = (draft: Draft) => {
    const element = document.createElement("a")
    const file = new Blob([draft.content], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${draft.title}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const filteredDrafts = drafts.filter(
    (draft) =>
      draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString("zh-CN")
  }

  const renderPreview = (content: string) => {
    return content.split("\n").map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <h1 key={index} className="text-2xl font-bold mt-6 mb-4 first:mt-0">
            {line.slice(2)}
          </h1>
        )
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="text-xl font-semibold mt-5 mb-3 first:mt-0">
            {line.slice(3)}
          </h2>
        )
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={index} className="text-lg font-medium mt-4 mb-2 first:mt-0">
            {line.slice(4)}
          </h3>
        )
      }
      if (line.startsWith("- ")) {
        return (
          <li key={index} className="ml-4 list-disc">
            {line.slice(2)}
          </li>
        )
      }
      if (/^\d+\. /.test(line)) {
        return (
          <li key={index} className="ml-4 list-decimal">
            {line.replace(/^\d+\. /, "")}
          </li>
        )
      }
      if (line.trim() === "") {
        return <br key={index} />
      }
      return (
        <p key={index} className="mb-2 leading-relaxed">
          {line}
        </p>
      )
    })
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col space-y-6">
      {/* 头部区域 */}
      <div className="flex flex-col space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">草稿纸</h2>
          <p className="text-muted-foreground">自由创作的空间</p>
        </div>

        {/* 操作栏 */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 搜索框 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索草稿..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 创建按钮 */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>新建草稿</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>创建新草稿</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="草稿标题"
                  value={newDraftTitle}
                  onChange={(e) => setNewDraftTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createDraft()}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={createDraft} disabled={!newDraftTitle.trim()}>
                    创建
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* 草稿列表 */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto">
          {filteredDrafts.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <div className="space-y-4">
                  <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {searchQuery ? "没有找到匹配的草稿" : "还没有草稿"}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {searchQuery ? "尝试调整搜索条件" : "点击上方按钮创建你的第一个草稿"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredDrafts.map((draft) => (
                <Card
                  key={draft.id}
                  className={`cursor-pointer hover:shadow-md transition-all ${
                    selectedDraft?.id === draft.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => startEditing(draft)}
                >
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-foreground truncate flex-1">{draft.title}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => copyToClipboard(draft.content)}>
                              <Copy className="w-4 h-4 mr-2" />
                              复制内容
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => downloadDraft(draft)}>
                              <Download className="w-4 h-4 mr-2" />
                              下载
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  删除
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    确定要删除草稿 "{draft.title}" 吗？此操作无法撤销。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteDraft(draft.id)}>删除</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">{draft.content.slice(0, 100)}...</p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-3">
                          <span>{draft.wordCount} 字</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(draft.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 编辑器区域 */}
        <div className="lg:col-span-2">
          {selectedDraft ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{selectedDraft.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    {/* 自动保存状态 */}
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Save className="w-3 h-3" />
                      <span>
                        {autoSaveStatus === "saved" && "已保存"}
                        {autoSaveStatus === "saving" && "保存中..."}
                        {autoSaveStatus === "unsaved" && "未保存"}
                      </span>
                    </div>

                    {/* 预览切换 */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center space-x-1"
                    >
                      {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span>{showPreview ? "编辑" : "预览"}</span>
                    </Button>

                    {/* 关闭按钮 */}
                    <Button variant="outline" size="sm" onClick={stopEditing}>
                      关闭
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{selectedDraft.wordCount} 字</span>
                  <span>创建于 {formatTime(selectedDraft.createdAt)}</span>
                  {selectedDraft.updatedAt.getTime() !== selectedDraft.createdAt.getTime() && (
                    <span>更新于 {formatTime(selectedDraft.updatedAt)}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                {showPreview ? (
                  <div className="flex-1 overflow-y-auto prose prose-sm max-w-none">
                    {renderPreview(editingContent || selectedDraft.content)}
                  </div>
                ) : (
                  <Textarea
                    ref={textareaRef}
                    value={editingContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="开始你的创作..."
                    className="flex-1 resize-none border-none focus:ring-0 text-sm leading-relaxed"
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">选择一个草稿开始编辑</h3>
                    <p className="text-muted-foreground">从左侧列表中选择一个草稿，或创建一个新的草稿开始创作</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 统计信息 */}
      {drafts.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          共 {drafts.length} 个草稿
          {filteredDrafts.length !== drafts.length && ` · 显示 ${filteredDrafts.length} 个`}
        </div>
      )}
    </div>
  )
}

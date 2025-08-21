"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Search, Trash2, Eye, EyeOff, X, Plus, XCircle } from "lucide-react"

interface Draft {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export function DraftModule() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentDraft, setCurrentDraft] = useState<Draft | null>(null)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [showRecycleBin, setShowRecycleBin] = useState(false)
  const [recycleBinDrafts, setRecycleBinDrafts] = useState<Draft[]>([])
  const [recycleBinSearch, setRecycleBinSearch] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [editingContent, setEditingContent] = useState("")
  const [previewDraft, setPreviewDraft] = useState<Draft | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 初始化数据
  useEffect(() => {
    const savedDrafts = localStorage.getItem("drafts")
    const savedRecycleBin = localStorage.getItem("recycleBinDrafts")
    
    if (savedDrafts) {
      const parsedDrafts = JSON.parse(savedDrafts).map((draft: any) => ({
        ...draft,
        createdAt: new Date(draft.createdAt),
        updatedAt: new Date(draft.updatedAt),
      }))
      setDrafts(parsedDrafts)
      
      // 如果有草稿，自动选择第一个
      if (parsedDrafts.length > 0) {
        setCurrentDraft(parsedDrafts[0])
        setEditingContent(parsedDrafts[0].content)
      }
    } else {
      // 创建默认草稿
      const defaultDraft: Draft = {
        id: Date.now().toString(),
        title: "新稿纸",
        content: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setDrafts([defaultDraft])
      setCurrentDraft(defaultDraft)
      setEditingContent("")
      localStorage.setItem("drafts", JSON.stringify([defaultDraft]))
    }
    
    // 确保有可编辑的稿纸
    if (drafts.length > 0) {
      ensureEditableDraft()
    }

    if (savedRecycleBin) {
      const parsedRecycleBin = JSON.parse(savedRecycleBin).map((draft: any) => ({
        ...draft,
        createdAt: new Date(draft.createdAt),
        updatedAt: new Date(draft.updatedAt),
      }))
      setRecycleBinDrafts(parsedRecycleBin)
    }
  }, [])

  // 保存草稿到localStorage
  const saveDrafts = (updatedDrafts: Draft[]) => {
    setDrafts(updatedDrafts)
    localStorage.setItem("drafts", JSON.stringify(updatedDrafts))
  }

  // 保存回收站到localStorage
  const saveRecycleBin = (updatedRecycleBin: Draft[]) => {
    setRecycleBinDrafts(updatedRecycleBin)
    localStorage.setItem("recycleBinDrafts", JSON.stringify(updatedRecycleBin))
  }

  // 创建新稿纸
  const createNewDraft = () => {
    const newDraft: Draft = {
      id: Date.now().toString(),
      title: `新稿纸 ${drafts.length + 1}`,
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const updatedDrafts = [newDraft, ...drafts]
    saveDrafts(updatedDrafts)
    setCurrentDraft(newDraft)
    setEditingContent("")
    
    // 聚焦到编辑器并清空内容
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.value = ""
        textareaRef.current.focus()
      }
    }, 100)
  }

  // 删除稿纸
  const deleteDraft = () => {
    if (!currentDraft) return
    
    if (currentDraft.content.trim()) {
      // 有内容的稿纸移到回收站
      const updatedDrafts = drafts.filter(draft => draft.id !== currentDraft.id)
      const updatedRecycleBin = [currentDraft, ...recycleBinDrafts]
      
      saveDrafts(updatedDrafts)
      saveRecycleBin(updatedRecycleBin)
    } else {
      // 空白稿纸直接永久删除
      const updatedDrafts = drafts.filter(draft => draft.id !== currentDraft.id)
      saveDrafts(updatedDrafts)
    }
    
    // 确保有可编辑的稿纸
    ensureEditableDraft()
  }

  // 从列表删除稿纸（边栏右键菜单使用）
  const deleteDraftFromList = (draft: Draft) => {
    if (draft.content.trim()) {
      // 有内容的稿纸移到回收站
      const updatedDrafts = drafts.filter(d => d.id !== draft.id)
      const updatedRecycleBin = [draft, ...recycleBinDrafts]
      
      saveDrafts(updatedDrafts)
      saveRecycleBin(updatedRecycleBin)
    } else {
      // 空白稿纸直接永久删除
      const updatedDrafts = drafts.filter(d => d.id !== draft.id)
      saveDrafts(updatedDrafts)
    }
    
    // 如果删除的是当前编辑的稿纸，确保有可编辑的稿纸
    if (currentDraft?.id === draft.id) {
      ensureEditableDraft()
    }
  }

  // 预览回收站中的稿纸
  const previewRecycleBinDraft = (draft: Draft) => {
    setPreviewDraft(draft)
  }

  // 确保有可编辑的稿纸
  const ensureEditableDraft = () => {
    const remainingDrafts = drafts.filter(draft => draft.id !== currentDraft?.id)
    
    // 查找空白稿纸
    const blankDraft = remainingDrafts.find(draft => !draft.content.trim())
    
    if (blankDraft) {
      // 复用空白稿纸
      setCurrentDraft(blankDraft)
      setEditingContent("")
      
      // 设置textarea的内容
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.value = ""
        }
      }, 0)
    } else {
      // 没有空白稿纸，创建新的
      createNewDraft()
    }
  }

  // 从回收站恢复稿纸
  const restoreDraft = (draft: Draft) => {
    const updatedRecycleBin = recycleBinDrafts.filter(d => d.id !== draft.id)
    const updatedDrafts = [draft, ...drafts]
    
    saveRecycleBin(updatedRecycleBin)
    saveDrafts(updatedDrafts)
    setCurrentDraft(draft)
    setEditingContent(draft.content)
  }

  // 永久删除回收站中的稿纸
  const permanentlyDeleteDraft = (draft: Draft) => {
    const updatedRecycleBin = recycleBinDrafts.filter(d => d.id !== draft.id)
    saveRecycleBin(updatedRecycleBin)
  }

  // 自动保存
  const autoSave = (content: string) => {
    if (!currentDraft) return
    
    const updatedDraft = { ...currentDraft, content, updatedAt: new Date() }
    const updatedDrafts = drafts.map(draft => 
      draft.id === currentDraft.id ? updatedDraft : draft
    )
    
    saveDrafts(updatedDrafts)
    setCurrentDraft(updatedDraft)
  }

  // 处理内容变化
  const handleContentChange = (content: string) => {
    setEditingContent(content)
    autoSave(content)
  }

  // 选择稿纸
  const selectDraft = (draft: Draft) => {
    setCurrentDraft(draft)
    setEditingContent(draft.content)
    setShowPreview(false)
    
    // 设置textarea的内容
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.value = draft.content
      }
    }, 0)
  }

  // 过滤稿纸列表
  const filteredDrafts = drafts.filter(draft =>
    draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    draft.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 过滤回收站稿纸
  const filteredRecycleBinDrafts = recycleBinDrafts.filter(draft =>
    draft.title.toLowerCase().includes(recycleBinSearch.toLowerCase()) ||
    draft.content.toLowerCase().includes(recycleBinSearch.toLowerCase())
  )

  // 格式化时间
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

  // 渲染Markdown预览
  const renderMarkdown = (content: string) => {
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
    <div className="h-[calc(100vh-12rem)] flex gap-6 p-6">
      {/* 左侧边栏卡片 */}
      {sidebarVisible && (
        <div className="w-80 bg-card rounded-lg shadow-sm border border-border flex flex-col">
          {/* 搜索框 */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索稿纸..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-8"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* 稿纸列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredDrafts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {searchQuery ? "没有找到匹配的稿纸" : "还没有稿纸"}
              </div>
            ) : (
              filteredDrafts.map((draft) => (
                <ContextMenu key={draft.id}>
                  <ContextMenuTrigger>
                    <div
                      className={`p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                        currentDraft?.id === draft.id ? "bg-accent" : ""
                      }`}
                      onClick={() => selectDraft(draft)}
                    >
                      <div className="text-sm text-foreground line-clamp-3 leading-relaxed">
                        {draft.content || "空白稿纸"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {formatTime(draft.updatedAt)}
                      </div>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem 
                      onClick={() => deleteDraftFromList(draft)}
                      disabled={!draft.content.trim() && drafts.filter(d => !d.content.trim()).length === 1}
                      className="text-destructive focus:text-destructive cursor-pointer hover:bg-accent hover:text-accent-foreground"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      删除
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))
            )}
          </div>
        </div>
      )}

      {/* 主编辑区域卡片 */}
      <div className="flex-1 bg-card rounded-lg shadow-sm border border-border flex flex-col">
        {/* 编辑器内容 */}
        <div className="flex-1 p-6">
          {currentDraft ? (
            <ContextMenu>
              <ContextMenuTrigger>
                <div className="h-full">
                  {showPreview ? (
                    <div className="h-full overflow-y-auto">
                      <div className="prose-content">
                        {renderMarkdown(editingContent || currentDraft.content)}
                      </div>
                    </div>
                  ) : (
                    <textarea
                      ref={textareaRef}
                      value={editingContent}
                      onChange={(e) => handleContentChange(e.target.value)}
                      placeholder=""
                      className="h-full w-full text-sm leading-relaxed borderless-editor overflow-y-auto"
                      style={{
                        padding: 0,
                        margin: 0,
                        fontFamily: 'inherit',
                        lineHeight: 'inherit',
                        fontSize: 'inherit'
                      }}
                    />
                  )}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem 
                  onClick={createNewDraft}
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新稿纸
                </ContextMenuItem>
                <ContextMenuItem 
                  onClick={deleteDraft}
                  disabled={!currentDraft.content.trim() && drafts.filter(draft => !draft.content.trim()).length === 1}
                  className="text-destructive focus:text-destructive cursor-pointer hover:bg-accent hover:text-accent-foreground"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              选择一个稿纸开始编辑
            </div>
          )}
        </div>
      </div>

      {/* 回收站按钮 */}
      <Button
        onClick={() => setShowRecycleBin(true)}
        className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200"
        size="icon"
      >
        <Trash2 className="w-5 h-5" />
      </Button>

      {/* 回收站对话框 */}
      <Dialog open={showRecycleBin} onOpenChange={setShowRecycleBin}>
        <DialogContent className="max-w-5xl w-[85vw] h-[75vh] flex flex-col p-0" showCloseButton={false}>
          <DialogHeader className="px-6 pt-4 pb-3 border-b border-border relative">
            <DialogTitle className="text-lg">回收站</DialogTitle>
            <DialogClose className="absolute top-4 right-6 p-1 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-all duration-200">
              <X className="w-4 h-4" />
            </DialogClose>
          </DialogHeader>
          
          <div className="flex flex-col flex-1 min-h-0 px-6">
            {/* 搜索框 */}
            <div className="relative py-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索回收站中的稿纸..."
                value={recycleBinSearch}
                onChange={(e) => setRecycleBinSearch(e.target.value)}
                className="pl-10 pr-8"
              />
              {recycleBinSearch && (
                <button
                  onClick={() => setRecycleBinSearch("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 稿纸网格 */}
            <div className="flex-1 overflow-y-auto pb-4">
              {filteredRecycleBinDrafts.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-center text-muted-foreground">
                  {recycleBinSearch ? "没有找到匹配的稿纸" : "回收站是空的"}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredRecycleBinDrafts.map((draft) => (
                    <ContextMenu key={draft.id}>
                      <ContextMenuTrigger>
                        <div
                          className="flex flex-col h-36 p-3 border border-border rounded-lg bg-card hover:bg-accent hover:shadow-sm transition-all duration-200 cursor-pointer"
                          onClick={() => previewRecycleBinDraft(draft)}
                        >
                          {/* 内容区域 */}
                          <div className="flex-1 overflow-hidden min-h-0">
                            <div className="text-sm text-foreground leading-relaxed mb-2" 
                                 style={{ 
                                   display: '-webkit-box',
                                   WebkitLineClamp: 4,
                                   WebkitBoxOrient: 'vertical',
                                   overflow: 'hidden'
                                 }}>
                              {draft.content.slice(0, 100) || "空白稿纸"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatTime(draft.updatedAt)}
                            </div>
                          </div>
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem 
                          onClick={() => restoreDraft(draft)}
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          恢复
                        </ContextMenuItem>
                        <ContextMenuItem 
                          onClick={() => permanentlyDeleteDraft(draft)}
                          className="text-destructive focus:text-destructive cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          永久删除
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 稿纸预览弹窗 */}
      <Dialog open={!!previewDraft} onOpenChange={(open) => !open && setPreviewDraft(null)}>
        <DialogContent className="max-w-4xl w-[80vw] h-[70vh] flex flex-col p-0" showCloseButton={false}>
          <DialogHeader className="px-6 pt-4 pb-3 border-b border-border relative">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (previewDraft) {
                      restoreDraft(previewDraft)
                      setPreviewDraft(null)
                    }
                  }}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  恢复
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (previewDraft) {
                      permanentlyDeleteDraft(previewDraft)
                      setPreviewDraft(null)
                    }
                  }}
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
                >
                  永久删除
                </Button>
              </div>
              <DialogClose className="p-1 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-all duration-200">
                <X className="w-4 h-4" />
              </DialogClose>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6">
            {previewDraft ? (
              <div className="prose-content">
                {renderMarkdown(previewDraft.content)}
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

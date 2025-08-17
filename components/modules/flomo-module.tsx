"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, Tag, Clock, Edit, Trash2, MoreVertical, Hash, Filter, X } from "lucide-react"

interface FlomoCard {
  id: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export function FlomoModule() {
  const [cards, setCards] = useState<FlomoCard[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<FlomoCard | null>(null)
  const [newCardContent, setNewCardContent] = useState("")
  const [newCardTags, setNewCardTags] = useState("")

  useEffect(() => {
    const savedCards = localStorage.getItem("flomo-cards")
    if (savedCards) {
      const parsedCards = JSON.parse(savedCards).map((card: any) => ({
        ...card,
        createdAt: new Date(card.createdAt),
        updatedAt: new Date(card.updatedAt),
      }))
      setCards(parsedCards)
    } else {
      // 初始化示例数据
      const sampleCards: FlomoCard[] = [
        {
          id: "1",
          content: "今天学到了一个新的设计原则：简约不是减少，而是去除不必要的元素。",
          tags: ["设计", "原则"],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: "2",
          content: "关于产品设计的思考：用户体验的核心是理解用户真正的需求。",
          tags: ["产品", "UX"],
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
          id: "3",
          content: "读书笔记：《设计心理学》- 好的设计应该是直观的，不需要说明书。",
          tags: ["读书", "心理学"],
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ]
      setCards(sampleCards)
      localStorage.setItem("flomo-cards", JSON.stringify(sampleCards))
    }
  }, [])

  const saveCards = (updatedCards: FlomoCard[]) => {
    setCards(updatedCards)
    localStorage.setItem("flomo-cards", JSON.stringify(updatedCards))
  }

  const createCard = () => {
    if (!newCardContent.trim()) return

    const tags = newCardTags
      .split(/[,，\s]+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    const newCard: FlomoCard = {
      id: Date.now().toString(),
      content: newCardContent.trim(),
      tags,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const updatedCards = [newCard, ...cards]
    saveCards(updatedCards)
    setNewCardContent("")
    setNewCardTags("")
    setIsCreateDialogOpen(false)
  }

  const updateCard = () => {
    if (!editingCard || !newCardContent.trim()) return

    const tags = newCardTags
      .split(/[,，\s]+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    const updatedCards = cards.map((card) =>
      card.id === editingCard.id
        ? {
            ...card,
            content: newCardContent.trim(),
            tags,
            updatedAt: new Date(),
          }
        : card,
    )

    saveCards(updatedCards)
    setEditingCard(null)
    setNewCardContent("")
    setNewCardTags("")
  }

  const deleteCard = (cardId: string) => {
    const updatedCards = cards.filter((card) => card.id !== cardId)
    saveCards(updatedCards)
  }

  const allTags = Array.from(new Set(cards.flatMap((card) => card.tags))).sort()

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => card.tags.includes(tag))

    return matchesSearch && matchesTags
  })

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

  const startEditing = (card: FlomoCard) => {
    setEditingCard(card)
    setNewCardContent(card.content)
    setNewCardTags(card.tags.join(", "))
  }

  const toggleTagFilter = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <div className="space-y-6">
      {/* 头部区域 */}
      <div className="flex flex-col space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Flomo卡片</h2>
          <p className="text-muted-foreground">快速记录你的想法和灵感</p>
        </div>

        {/* 操作栏 */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 搜索框 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索卡片内容或标签..."
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
                <span>新建卡片</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>创建新卡片</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="记录你的想法..."
                  value={newCardContent}
                  onChange={(e) => setNewCardContent(e.target.value)}
                  className="min-h-32 resize-none"
                />
                <Input
                  placeholder="添加标签，用逗号分隔"
                  value={newCardTags}
                  onChange={(e) => setNewCardTags(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={createCard} disabled={!newCardContent.trim()}>
                    创建
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 标签筛选 */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span>标签筛选:</span>
            </div>
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => toggleTagFilter(tag)}
              >
                <Hash className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {selectedTags.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedTags([])} className="h-6 px-2 text-xs">
                <X className="w-3 h-3 mr-1" />
                清除筛选
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 卡片列表 */}
      <div className="space-y-4">
        {filteredCards.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Tag className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {searchQuery || selectedTags.length > 0 ? "没有找到匹配的卡片" : "还没有卡片"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery || selectedTags.length > 0
                      ? "尝试调整搜索条件或清除筛选"
                      : "点击上方按钮创建你的第一张卡片"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredCards.map((card) => (
              <Card key={card.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* 卡片内容 */}
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{card.content}</p>

                    {/* 标签 */}
                    {card.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {card.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Hash className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* 底部信息和操作 */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(card.createdAt)}</span>
                        </div>
                        {card.updatedAt.getTime() !== card.createdAt.getTime() && (
                          <div className="flex items-center space-x-1">
                            <Edit className="w-3 h-3" />
                            <span>已编辑</span>
                          </div>
                        )}
                      </div>

                      {/* 操作菜单 */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startEditing(card)}>
                            <Edit className="w-4 h-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteCard(card.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 编辑对话框 */}
      <Dialog open={!!editingCard} onOpenChange={() => setEditingCard(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑卡片</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="记录你的想法..."
              value={newCardContent}
              onChange={(e) => setNewCardContent(e.target.value)}
              className="min-h-32 resize-none"
            />
            <Input
              placeholder="添加标签，用逗号分隔"
              value={newCardTags}
              onChange={(e) => setNewCardTags(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingCard(null)}>
                取消
              </Button>
              <Button onClick={updateCard} disabled={!newCardContent.trim()}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 统计信息 */}
      {cards.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          共 {cards.length} 张卡片
          {filteredCards.length !== cards.length && ` · 显示 ${filteredCards.length} 张`}
        </div>
      )}
    </div>
  )
}

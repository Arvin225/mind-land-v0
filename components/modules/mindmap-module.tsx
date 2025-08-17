"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Plus, Search, GitBranch, Trash2, MoreVertical, Edit, Download } from "lucide-react"

interface MindMapNode {
  id: string
  text: string
  x: number
  y: number
  children: string[]
  parent?: string
  color: string
}

interface MindMap {
  id: string
  title: string
  nodes: Record<string, MindMapNode>
  rootNodeId: string
  createdAt: Date
  updatedAt: Date
}

export function MindmapModule() {
  const [mindMaps, setMindMaps] = useState<MindMap[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMindMap, setSelectedMindMap] = useState<MindMap | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newMindMapTitle, setNewMindMapTitle] = useState("")
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const [draggedNode, setDraggedNode] = useState<string | null>(null)

  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedMindMaps = localStorage.getItem("mindmaps")
    if (savedMindMaps) {
      const parsedMindMaps = JSON.parse(savedMindMaps).map((mindMap: any) => ({
        ...mindMap,
        createdAt: new Date(mindMap.createdAt),
        updatedAt: new Date(mindMap.updatedAt),
      }))
      setMindMaps(parsedMindMaps)
    } else {
      // 初始化示例数据
      const sampleMindMap: MindMap = {
        id: "1",
        title: "产品设计思维导图",
        rootNodeId: "root",
        nodes: {
          root: {
            id: "root",
            text: "产品设计",
            x: 400,
            y: 200,
            children: ["user", "design", "tech"],
            color: "#0891b2",
          },
          user: {
            id: "user",
            text: "用户研究",
            x: 200,
            y: 100,
            children: ["persona", "journey"],
            parent: "root",
            color: "#f59e0b",
          },
          design: {
            id: "design",
            text: "设计原则",
            x: 400,
            y: 50,
            children: ["simple", "consistent"],
            parent: "root",
            color: "#10b981",
          },
          tech: {
            id: "tech",
            text: "技术实现",
            x: 600,
            y: 100,
            children: ["frontend", "backend"],
            parent: "root",
            color: "#8b5cf6",
          },
          persona: {
            id: "persona",
            text: "用户画像",
            x: 100,
            y: 50,
            children: [],
            parent: "user",
            color: "#f59e0b",
          },
          journey: {
            id: "journey",
            text: "用户旅程",
            x: 100,
            y: 150,
            children: [],
            parent: "user",
            color: "#f59e0b",
          },
          simple: {
            id: "simple",
            text: "简约设计",
            x: 300,
            y: 20,
            children: [],
            parent: "design",
            color: "#10b981",
          },
          consistent: {
            id: "consistent",
            text: "一致性",
            x: 500,
            y: 20,
            children: [],
            parent: "design",
            color: "#10b981",
          },
          frontend: {
            id: "frontend",
            text: "前端开发",
            x: 700,
            y: 50,
            children: [],
            parent: "tech",
            color: "#8b5cf6",
          },
          backend: {
            id: "backend",
            text: "后端开发",
            x: 700,
            y: 150,
            children: [],
            parent: "tech",
            color: "#8b5cf6",
          },
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000),
      }
      setMindMaps([sampleMindMap])
      localStorage.setItem("mindmaps", JSON.stringify([sampleMindMap]))
    }
  }, [])

  const saveMindMaps = (updatedMindMaps: MindMap[]) => {
    setMindMaps(updatedMindMaps)
    localStorage.setItem("mindmaps", JSON.stringify(updatedMindMaps))
  }

  const createMindMap = () => {
    if (!newMindMapTitle.trim()) return

    const rootNodeId = "root"
    const newMindMap: MindMap = {
      id: Date.now().toString(),
      title: newMindMapTitle.trim(),
      rootNodeId,
      nodes: {
        [rootNodeId]: {
          id: rootNodeId,
          text: newMindMapTitle.trim(),
          x: 400,
          y: 200,
          children: [],
          color: "#0891b2",
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const updatedMindMaps = [newMindMap, ...mindMaps]
    saveMindMaps(updatedMindMaps)
    setNewMindMapTitle("")
    setIsCreateDialogOpen(false)
    setSelectedMindMap(newMindMap)
  }

  const deleteMindMap = (mindMapId: string) => {
    const updatedMindMaps = mindMaps.filter((mindMap) => mindMap.id !== mindMapId)
    saveMindMaps(updatedMindMaps)
    if (selectedMindMap?.id === mindMapId) {
      setSelectedMindMap(null)
    }
  }

  const addChildNode = (parentId: string) => {
    if (!selectedMindMap) return

    const newNodeId = Date.now().toString()
    const parentNode = selectedMindMap.nodes[parentId]
    const colors = ["#0891b2", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"]
    const color = colors[Math.floor(Math.random() * colors.length)]

    const newNode: MindMapNode = {
      id: newNodeId,
      text: "新节点",
      x: parentNode.x + (Math.random() - 0.5) * 200,
      y: parentNode.y + 100 + (Math.random() - 0.5) * 50,
      children: [],
      parent: parentId,
      color,
    }

    const updatedMindMap = {
      ...selectedMindMap,
      nodes: {
        ...selectedMindMap.nodes,
        [newNodeId]: newNode,
        [parentId]: {
          ...parentNode,
          children: [...parentNode.children, newNodeId],
        },
      },
      updatedAt: new Date(),
    }

    const updatedMindMaps = mindMaps.map((mindMap) => (mindMap.id === selectedMindMap.id ? updatedMindMap : mindMap))
    saveMindMaps(updatedMindMaps)
    setSelectedMindMap(updatedMindMap)
  }

  const deleteNode = (nodeId: string) => {
    if (!selectedMindMap || nodeId === selectedMindMap.rootNodeId) return

    const nodeToDelete = selectedMindMap.nodes[nodeId]
    const updatedNodes = { ...selectedMindMap.nodes }

    // 递归删除子节点
    const deleteNodeRecursive = (id: string) => {
      const node = updatedNodes[id]
      if (node) {
        node.children.forEach(deleteNodeRecursive)
        delete updatedNodes[id]
      }
    }

    deleteNodeRecursive(nodeId)

    // 从父节点的children中移除
    if (nodeToDelete.parent) {
      const parentNode = updatedNodes[nodeToDelete.parent]
      if (parentNode) {
        updatedNodes[nodeToDelete.parent] = {
          ...parentNode,
          children: parentNode.children.filter((childId) => childId !== nodeId),
        }
      }
    }

    const updatedMindMap = {
      ...selectedMindMap,
      nodes: updatedNodes,
      updatedAt: new Date(),
    }

    const updatedMindMaps = mindMaps.map((mindMap) => (mindMap.id === selectedMindMap.id ? updatedMindMap : mindMap))
    saveMindMaps(updatedMindMaps)
    setSelectedMindMap(updatedMindMap)
  }

  const updateNodeText = (nodeId: string, text: string) => {
    if (!selectedMindMap) return

    const updatedMindMap = {
      ...selectedMindMap,
      nodes: {
        ...selectedMindMap.nodes,
        [nodeId]: {
          ...selectedMindMap.nodes[nodeId],
          text,
        },
      },
      updatedAt: new Date(),
    }

    const updatedMindMaps = mindMaps.map((mindMap) => (mindMap.id === selectedMindMap.id ? updatedMindMap : mindMap))
    saveMindMaps(updatedMindMaps)
    setSelectedMindMap(updatedMindMap)
  }

  const startEditing = (nodeId: string) => {
    setEditingNode(nodeId)
    setEditingText(selectedMindMap?.nodes[nodeId]?.text || "")
  }

  const finishEditing = () => {
    if (editingNode && editingText.trim()) {
      updateNodeText(editingNode, editingText.trim())
    }
    setEditingNode(null)
    setEditingText("")
  }

  const exportMindMap = (mindMap: MindMap) => {
    const data = JSON.stringify(mindMap, null, 2)
    const element = document.createElement("a")
    const file = new Blob([data], { type: "application/json" })
    element.href = URL.createObjectURL(file)
    element.download = `${mindMap.title}.json`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const filteredMindMaps = mindMaps.filter((mindMap) => mindMap.title.toLowerCase().includes(searchQuery.toLowerCase()))

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

  const renderConnections = () => {
    if (!selectedMindMap) return null

    return Object.values(selectedMindMap.nodes).map((node) => {
      if (!node.parent) return null
      const parentNode = selectedMindMap.nodes[node.parent]
      if (!parentNode) return null

      return (
        <line
          key={`${node.parent}-${node.id}`}
          x1={parentNode.x}
          y1={parentNode.y}
          x2={node.x}
          y2={node.y}
          stroke="#e5e7eb"
          strokeWidth="2"
        />
      )
    })
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col space-y-6">
      {/* 头部区域 */}
      <div className="flex flex-col space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">思维导图</h2>
          <p className="text-muted-foreground">可视化你的思维过程</p>
        </div>

        {/* 操作栏 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索思维导图..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>新建思维导图</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>创建新思维导图</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="思维导图标题"
                  value={newMindMapTitle}
                  onChange={(e) => setNewMindMapTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createMindMap()}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={createMindMap} disabled={!newMindMapTitle.trim()}>
                    创建
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* 思维导图列表 */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto">
          {filteredMindMaps.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <div className="space-y-4">
                  <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <GitBranch className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {searchQuery ? "没有找到匹配的思维导图" : "还没有思维导图"}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {searchQuery ? "尝试调整搜索条件" : "点击上方按钮创建你的第一个思维导图"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredMindMaps.map((mindMap) => (
                <Card
                  key={mindMap.id}
                  className={`cursor-pointer hover:shadow-md transition-all ${
                    selectedMindMap?.id === mindMap.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedMindMap(mindMap)}
                >
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-foreground truncate flex-1">{mindMap.title}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => exportMindMap(mindMap)}>
                              <Download className="w-4 h-4 mr-2" />
                              导出
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
                                    确定要删除思维导图 "{mindMap.title}" 吗？此操作无法撤销。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteMindMap(mindMap.id)}>删除</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <div>{Object.keys(mindMap.nodes).length} 个节点</div>
                        <div>更新于 {formatTime(mindMap.updatedAt)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 思维导图画布 */}
        <div className="lg:col-span-3">
          {selectedMindMap ? (
            <Card className="h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{selectedMindMap.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <div className="relative w-full h-full overflow-auto bg-muted/20" ref={canvasRef}>
                  <svg className="absolute inset-0 w-full h-full" style={{ minWidth: "800px", minHeight: "600px" }}>
                    {renderConnections()}
                  </svg>
                  {Object.values(selectedMindMap.nodes).map((node) => (
                    <div
                      key={node.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                      style={{
                        left: node.x,
                        top: node.y,
                      }}
                    >
                      <div
                        className="relative px-4 py-2 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all"
                        style={{ backgroundColor: node.color }}
                        onDoubleClick={() => startEditing(node.id)}
                      >
                        {editingNode === node.id ? (
                          <Input
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onBlur={finishEditing}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") finishEditing()
                              if (e.key === "Escape") {
                                setEditingNode(null)
                                setEditingText("")
                              }
                            }}
                            className="w-32 h-8 text-sm text-white bg-transparent border-white/50 focus:border-white"
                            autoFocus
                          />
                        ) : (
                          <span className="text-white font-medium text-sm whitespace-nowrap">{node.text}</span>
                        )}

                        {/* 节点操作按钮 */}
                        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="secondary" size="sm" className="h-6 w-6 p-0 rounded-full">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => addChildNode(node.id)}>
                                <Plus className="w-4 h-4 mr-2" />
                                添加子节点
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => startEditing(node.id)}>
                                <Edit className="w-4 h-4 mr-2" />
                                编辑文本
                              </DropdownMenuItem>
                              {node.id !== selectedMindMap.rootNodeId && (
                                <DropdownMenuItem
                                  onClick={() => deleteNode(node.id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  删除节点
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <GitBranch className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">选择一个思维导图开始编辑</h3>
                    <p className="text-muted-foreground">从左侧列表中选择一个思维导图，或创建一个新的思维导图</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 统计信息 */}
      {mindMaps.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          共 {mindMaps.length} 个思维导图
          {filteredMindMaps.length !== mindMaps.length && ` · 显示 ${filteredMindMaps.length} 个`}
        </div>
      )}
    </div>
  )
}

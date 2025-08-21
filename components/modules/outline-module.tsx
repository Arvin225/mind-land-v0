"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ChevronRight,
  ChevronLeft,
  Menu,
  Plus,
  Search,
  Trash2,
  Edit,
  FolderPlus,
  FileText,
  Folder,
  File,
  Loader2,
  Home,
  FilePlus,
  MoreVertical,
  MoreHorizontal,
  AlertCircle,
} from "lucide-react"
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
import { RotateCcw } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface FileSystemItem {
  id: string
  name: string
  type: "folder" | "file"
  parentId: string | null
  content?: string
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
}

interface Breadcrumb {
  id: string
  name: string
}

interface OutlineItem {
  id: string
  text: string
  level: number
  children: OutlineItem[]
}

interface OutlineItemProps {
  item: OutlineItem
  index: number
  isVisible: boolean
  hasChildren: boolean
  onUpdate: (text: string) => void
  onDelete: () => void
  onIndent: () => void
  onOutdent: () => void
  onAddAfter: () => void
  onToggleExpand: () => void
  onNavigateUp: () => void
  onNavigateDown: () => void
  isExpanded: boolean
}

const OutlineItemComponent: React.FC<OutlineItemProps> = ({
  item,
  index,
  isVisible,
  hasChildren,
  onUpdate,
  onDelete,
  onIndent,
  onOutdent,
  onAddAfter,
  onToggleExpand,
  onNavigateUp,
  onNavigateDown,
  isExpanded,
}) => {
  if (!isVisible) return null
  return (
    <div key={item.id} className="group border-0 border-none outline-item" style={{ borderBottom: "none", borderTop: "none" }}>
      <div
        className="flex items-center border-0"
        style={{ paddingLeft: `${item.level * 24 + 24}px`, borderBottom: "none", borderTop: "none" }}
      >
        <div className="flex items-center space-x-1 mr-3 w-12 justify-start">
          {hasChildren ? (
            <>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0 cursor-pointer">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={onAddAfter} className="cursor-pointer">
                      <Plus className="w-4 h-4 mr-2" />
                      在下方添加
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onIndent} disabled={item.level >= 5} className="cursor-pointer">
                      增加缩进
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onOutdent} disabled={item.level === 0} className="cursor-pointer">
                      减少缩进
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive cursor-pointer">
                      <Trash2 className="w-4 h-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0 cursor-pointer" onClick={onToggleExpand}>
                  <ChevronRight
                    className={`w-3 h-3 text-muted-foreground chevron-rotate ${isExpanded ? "expanded" : ""}`}
                  />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-5 h-5"></div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0 cursor-pointer">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={onAddAfter} className="cursor-pointer">
                      <Plus className="w-4 h-4 mr-2" />
                      在下方添加
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onIndent} disabled={item.level >= 5} className="cursor-pointer">
                      增加缩进
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onOutdent} disabled={item.level === 0} className="cursor-pointer">
                      减少缩进
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive cursor-pointer">
                      <Trash2 className="w-4 h-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>

        <span className="text-muted-foreground mr-3 select-none" style={{ fontSize: "8px", lineHeight: "1rem" }}>
          ●
        </span>

        <Input
          data-outline-index={index}
          value={item.text}
          onChange={(e) => onUpdate(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              onAddAfter()
            } else if (e.key === "Backspace" && item.text === "") {
              e.preventDefault()
              onDelete()
              // 焦点移动到上一个项目
              if (index > 0) {
                setTimeout(() => {
                  const input = document.querySelector(`input[data-outline-index="${index - 1}"]`) as HTMLInputElement
                  if (input) input.focus()
                }, 0)
              }
            } else if (e.key === "Tab") {
              e.preventDefault()
              if (e.shiftKey) {
                onOutdent()
              } else {
                onIndent()
              }
            } else if (e.key === "ArrowUp") {
              e.preventDefault()
              onNavigateUp()
            } else if (e.key === "ArrowDown") {
              e.preventDefault()
              onNavigateDown()
            }
          }}
          className="border-0 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto py-1 shadow-none outline-none text-base transition-all duration-200"
          style={{ border: "none", boxShadow: "none", outline: "none", fontSize: "16px" }}
        />
      </div>
    </div>
  )
}

export function OutlineModule() {
  // 添加样式到组件
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .folder-item {
        position: relative;
      }
      
      .folder-children {
        position: relative;
        overflow: hidden;
      }
      
      .outline-item-wrapper {
        position: relative;
        overflow: hidden;
      }
      
      .chevron-rotate {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform;
      }
      
      .chevron-rotate.expanded {
        transform: rotate(90deg);
      }
      
      /* 添加悬停效果 */
      .folder-item:hover .chevron-rotate {
        transform: scale(1.1);
      }
      
      .folder-item:hover .chevron-rotate.expanded {
        transform: rotate(90deg) scale(1.1);
      }
      
      /* 自定义滚动条样式 */
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: transparent transparent;
        transition: scrollbar-color 0.3s ease;
      }
      
      .custom-scrollbar:hover {
        scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
      }
      
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: transparent;
        border-radius: 4px;
        transition: background-color 0.3s ease;
      }
      
      .custom-scrollbar:hover::-webkit-scrollbar-thumb {
        background-color: rgba(156, 163, 175, 0.5);
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: rgba(156, 163, 175, 0.7);
      }
      
      /* 滚动时显示滚动条 */
      .custom-scrollbar.scrolling::-webkit-scrollbar-thumb {
        background-color: rgba(156, 163, 175, 0.5);
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const [items, setItems] = useState<FileSystemItem[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createType, setCreateType] = useState<"folder" | "file">("folder")
  const [newItemName, setNewItemName] = useState("")
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [selectedItem, setSelectedItem] = useState<FileSystemItem | null>(null)
  const [showTrash, setShowTrash] = useState(false)
  const [editingFile, setEditingFile] = useState<FileSystemItem | null>(null)
  const [outlineItems, setOutlineItems] = useState<OutlineItem[]>([])
  const [expandedOutlineItems, setExpandedOutlineItems] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle")
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false)
  const [isCreateTooltipOpen, setIsCreateTooltipOpen] = useState(false)
  const suppressCreateTooltipRef = useRef<boolean>(false)
  const createButtonRef = useRef<HTMLButtonElement | null>(null)
  const [contextMenuOpen, setContextMenuOpen] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const savedItems = localStorage.getItem("outline-items")
    if (savedItems) {
      const parsedItems = JSON.parse(savedItems).map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }))
      setItems(parsedItems)
    } else {
      const sampleItems: FileSystemItem[] = [
        {
          id: "folder-1",
          name: "我的文档",
          type: "folder",
          parentId: null,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isDeleted: false,
        },
        {
          id: "folder-2",
          name: "工作项目",
          type: "folder",
          parentId: "folder-1",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          isDeleted: false,
        },
        {
          id: "file-1",
          name: "项目计划",
          type: "file",
          parentId: "folder-2",
          content:
            "# 项目计划\n\n## 目标\n- 完成产品开发\n- 提升用户体验\n\n## 时间安排\n- 第一阶段：需求分析\n- 第二阶段：设计开发\n- 第三阶段：测试上线",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000),
          isDeleted: false,
        },
        {
          id: "file-2",
          name: "会议记录",
          type: "file",
          parentId: "folder-2",
          content:
            "# 周例会记录\n\n## 参会人员\n- 张三\n- 李四\n- 王五\n\n## 讨论内容\n1. 项目进度汇报\n2. 问题讨论\n3. 下周计划",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          isDeleted: false,
        },
        {
          id: "folder-3",
          name: "个人笔记",
          type: "folder",
          parentId: null,
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          isDeleted: false,
        },
      ]
      setItems(sampleItems)
      localStorage.setItem("outline-items", JSON.stringify(sampleItems))
    }
  }, [])

  const saveItems = (updatedItems: FileSystemItem[]) => {
    setItems(updatedItems)
    localStorage.setItem("outline-items", JSON.stringify(updatedItems))
  }

  const getBreadcrumbs = (): Breadcrumb[] => {
    // 如果当前显示的是回收站
    if (showTrash) {
      const breadcrumbs: Breadcrumb[] = [{ id: "trash", name: "回收站" }];

      if (currentFolderId) {
        // 构建回收站内文件夹的路径
        const buildTrashPath = (folderId: string) => {
          const folder = items.find((item) => item.id === folderId && item.isDeleted)
          if (folder && folder.parentId) {
            buildTrashPath(folder.parentId)
          }
          if (folder) {
            breadcrumbs.push({ id: folder.id, name: folder.name })
          }
        }

        buildTrashPath(currentFolderId)
      }

      return breadcrumbs;
    }

    const breadcrumbs: Breadcrumb[] = [{ id: "root", name: "我的文档" }]

    if (editingFile && !showTrash) {
      const buildFilePath = (fileId: string) => {
        const file = items.find((item) => item.id === fileId && !item.isDeleted)
        if (file && file.parentId) {
          buildFolderPath(file.parentId)
        }
        if (file) {
          breadcrumbs.push({ id: file.id, name: file.name })
        }
      }

      const buildFolderPath = (folderId: string) => {
        const folder = items.find((item) => item.id === folderId && !item.isDeleted)
        if (folder && folder.parentId) {
          buildFolderPath(folder.parentId)
        }
        if (folder) {
          breadcrumbs.push({ id: folder.id, name: folder.name })
        }
      }

      buildFilePath(editingFile.id)
      return breadcrumbs
    }

    if (!currentFolderId) return breadcrumbs

    const buildPath = (folderId: string) => {
      const folder = items.find((item) => item.id === folderId && !item.isDeleted)
      if (folder && folder.parentId) {
        buildPath(folder.parentId)
      }
      if (folder) {
        breadcrumbs.push({ id: folder.id, name: folder.name })
      }
    }

    buildPath(currentFolderId)
    return breadcrumbs
  }

  const getCurrentItems = () => {
    if (showTrash) {
      // 如果在回收站中浏览某个文件夹
      if (currentFolderId) {
        return items.filter((item) => item.parentId === currentFolderId && item.isDeleted)
      }
      // 根回收站视图
      return items.filter((item) => item.isDeleted)
    }
    return items.filter((item) => item.parentId === currentFolderId && !item.isDeleted)
  }

  const getFolderTree = (parentId: string | null = null): FileSystemItem[] => {
    return items
      .filter((item) => item.type === "folder" && item.parentId === parentId && !item.isDeleted)
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  const createItem = () => {
    if (!newItemName.trim()) return

    const newItem: FileSystemItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      type: createType,
      parentId: currentFolderId,
      content: createType === "file" ? "" : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    }

    const updatedItems = [...items, newItem]
    saveItems(updatedItems)
    setNewItemName("")
    setIsCreateDialogOpen(false)
  }

  const deleteItem = (itemId: string, permanent = false) => {
    if (permanent) {
      const updatedItems = items.filter((item) => item.id !== itemId)
      saveItems(updatedItems)
    } else {
      const updatedItems = items.map((item) =>
        item.id === itemId ? { ...item, isDeleted: true, updatedAt: new Date() } : item,
      )
      saveItems(updatedItems)
    }

    if (selectedItem?.id === itemId) {
      setSelectedItem(null)
    }
  }

  const restoreItem = (itemId: string) => {
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, isDeleted: false, updatedAt: new Date() } : item,
    )
    saveItems(updatedItems)
  }

  const renameItem = (itemId: string, newName: string) => {
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, name: newName, updatedAt: new Date() } : item,
    )
    saveItems(updatedItems)
    setEditingItem(null)
    setEditingName("")
  }

  const updateFileContent = (content: string) => {
    if (!selectedItem || selectedItem.type !== "file") return

    const updatedItems = items.map((item) =>
      item.id === selectedItem.id ? { ...item, content, updatedAt: new Date() } : item,
    )
    saveItems(updatedItems)
    setSelectedItem({ ...selectedItem, content, updatedAt: new Date() })
  }

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

  const toggleFolderExpanded = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const toggleOutlineItemExpanded = (itemId: string) => {
    setExpandedOutlineItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  // 展开从根目录到指定项目的所有父级目录，并展开项目本身（如果是文件夹）
  const expandToItem = (item: FileSystemItem) => {
    const parentsToExpand = new Set<string>();

    // 如果是文件夹，也要展开它自己
    if (item.type === "folder") {
      parentsToExpand.add(item.id);
    }

    // 递归查找所有父级目录
    let currentParentId = item.parentId;
    while (currentParentId) {
      const parentItem = items.find(i => i.id === currentParentId);
      if (parentItem) {
        parentsToExpand.add(parentItem.id);
        currentParentId = parentItem.parentId;
      } else {
        break;
      }
    }

    // 更新展开状态
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      parentsToExpand.forEach(id => newSet.add(id));
      return newSet;
    });
  }

  const hasOutlineChildren = (index: number): boolean => {
    const currentLevel = outlineItems[index].level
    for (let i = index + 1; i < outlineItems.length; i++) {
      if (outlineItems[i].level <= currentLevel) {
        break
      }
      if (outlineItems[i].level === currentLevel + 1) {
        return true
      }
    }
    return false
  }

  const getOutlineChildren = (index: number): number[] => {
    const children: number[] = []
    const currentLevel = outlineItems[index].level
    for (let i = index + 1; i < outlineItems.length; i++) {
      if (outlineItems[i].level <= currentLevel) {
        break
      }
      if (outlineItems[i].level === currentLevel + 1) {
        children.push(i)
      }
    }
    return children
  }

  const shouldShowOutlineItem = (item: OutlineItem, index: number): boolean => {
    if (item.level === 0) return true

    // 查找父项目
    for (let i = index - 1; i >= 0; i--) {
      if (outlineItems[i].level < item.level) {
        // 找到父项目，检查是否展开
        return expandedOutlineItems.has(outlineItems[i].id) && shouldShowOutlineItem(outlineItems[i], i)
      }
    }
    return true
  }



  const renderFolderTree = (parentId: string | null = null, level = 0) => {
    // 获取当前parentId下的所有项目（包括文件夹和文件）
    const itemsInFolder = items
      .filter((item) => item.parentId === parentId && !item.isDeleted)
      .sort((a, b) => {
        // 文件夹优先，然后按名称排序
        if (a.type !== b.type) {
          return a.type === "folder" ? -1 : 1
        }
        return a.name.localeCompare(b.name)
      })

    return itemsInFolder.map((item) => {
      if (item.type === "folder") {
        const isExpanded = expandedFolders.has(item.id)
        // 获取子文件夹用于判断是否有子项
        const childFolders = getFolderTree(item.id)
        const hasChildren = childFolders.length > 0 || items.some(i => i.parentId === item.id && i.type === "file" && !i.isDeleted)

        return (
          <div key={item.id} className="folder-item">
            <div
              className={`flex items-center space-x-2 px-2 py-1 rounded hover:bg-muted/50 transition-colors duration-200 ${(selectedItem?.id === item.id && selectedItem?.type === "folder") ? "bg-muted" : ""
                }`}
              style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (hasChildren) {
                    toggleFolderExpanded(item.id)
                  }
                }}
                className={`p-0.5 rounded hover:bg-muted transition-all duration-200 cursor-pointer ${!hasChildren ? "invisible" : ""}`}
              >
                <ChevronRight
                  className={`w-3 h-3 text-muted-foreground transition-transform duration-300 ease-in-out ${isExpanded ? "rotate-90" : ""}`}
                />
              </button>
              <div
                className="flex items-center space-x-2 flex-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  // 切换展开状态（如果有子项）
                  if (hasChildren) {
                    toggleFolderExpanded(item.id);
                  }
                  // 然后执行选择和导航操作
                  setSelectedItem(item);
                  setCurrentFolderId(item.id);
                  // 如果打开了回收站，关闭它
                  if (showTrash) {
                    setShowTrash(false);
                  }
                  // 如果有子项，expandToItem会确保文件夹展开，但我们希望保持用户的手动切换
                  // 所以只在当前是收起状态时才强制展开
                  if (!isExpanded && hasChildren) {
                    expandToItem(item);
                  }
                }}
              >
                <Folder className="w-4 h-4 text-blue-500" />
                <span className="text-sm truncate">{item.name}</span>
              </div>
            </div>
            {hasChildren && (
              <div 
                className="folder-children"
                style={{
                  display: isExpanded ? 'block' : 'none'
                }}
              >
                <div className="folder-children">
                  {renderFolderTree(item.id, level + 1)}
                </div>
              </div>
            )}
          </div>
        )
      } else {
        // 渲染文件
        return (
          <div
            key={item.id}
            className={`flex items-center space-x-2 px-2 py-1 rounded hover:bg-muted/50 transition-colors duration-200 ${(selectedItem?.id === item.id && selectedItem?.type === "file") ? "bg-muted" : ""
              }`}
            style={{ paddingLeft: `${level * 16 + 8 + 20}px` }} // 增加额外缩进以区别于文件夹
          >
            <div
              className="flex items-center space-x-2 flex-1 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItem(item);
                handleFileClick(item);
                expandToItem(item);
                // 如果打开了回收站，关闭它
                if (showTrash) {
                  setShowTrash(false);
                }
              }}
            >
              <FileText className="w-4 h-4 text-green-500" />
              <span className="text-sm truncate">{item.name}</span>
            </div>
          </div>
        )
      }
    })
  }

  const parseOutlineContent = (content: string): OutlineItem[] => {
    const lines = content.split("\n").filter((line) => line.trim())
    const items: OutlineItem[] = []

    lines.forEach((line, index) => {
      const match = line.match(/^(\s*)[-•*]\s*(.+)$/)
      if (match) {
        const level = Math.floor(match[1].length / 2)
        const text = match[2]
        items.push({
          id: `outline-${index}`,
          text,
          level,
          children: [],
        })
      }
    })

    return items
  }

  const serializeOutlineContent = (items: OutlineItem[]): string => {
    return items
      .map((item) => {
        const indent = "  ".repeat(item.level)
        return `${indent}• ${item.text}`
      })
      .join("\n")
  }

  const addOutlineItem = (afterIndex?: number) => {
    // 结构性操作：先记录历史
    pushHistory()
    const newItem: OutlineItem = {
      id: `outline-${Date.now()}`,
      text: "",
      level: afterIndex !== undefined ? outlineItems[afterIndex]?.level || 0 : 0,
      children: [],
    }

    const newItems = [...outlineItems]
    if (afterIndex !== undefined) {
      newItems.splice(afterIndex + 1, 0, newItem)
    } else {
      newItems.push(newItem)
    }

    setOutlineItems(newItems)
    autoSave()

    // 设置焦点到新创建的项目
    setTimeout(() => {
      const newIndex = afterIndex !== undefined ? afterIndex + 1 : newItems.length - 1
      const input = document.querySelector(`input[data-outline-index="${newIndex}"]`) as HTMLInputElement
      if (input) {
        input.focus()
      }
    }, 0)
  }

  const indentOutlineItem = (index: number) => {
    // 结构性操作：先记录历史
    pushHistory()
    const newItems = [...outlineItems]
    if (newItems[index] && newItems[index].level < 5) {
      newItems[index] = { ...newItems[index], level: newItems[index].level + 1 }

      const newLevel = newItems[index].level
      for (let i = index - 1; i >= 0; i--) {
        if (newItems[i].level < newLevel) {
          // 找到父项目，确保其处于展开状态
          setExpandedOutlineItems((prev) => {
            const newSet = new Set(prev)
            newSet.add(newItems[i].id)
            return newSet
          })
          break
        }
      }
    }
    setOutlineItems(newItems)
    autoSave()
    setTimeout(() => {
      const input = document.querySelector(`input[data-outline-index="${index}"]`) as HTMLInputElement
      if (input) {
        input.focus()
      }
    }, 0)
  }

  const outdentOutlineItem = (index: number) => {
    // 结构性操作：先记录历史
    pushHistory()
    const newItems = [...outlineItems]
    if (newItems[index] && newItems[index].level > 0) {
      newItems[index] = { ...newItems[index], level: newItems[index].level - 1 }
    }
    setOutlineItems(newItems)
    autoSave()
    setTimeout(() => {
      const input = document.querySelector(`input[data-outline-index="${index}"]`) as HTMLInputElement
      if (input) {
        input.focus()
      }
    }, 0)
  }

  const handleArrowNavigation = (currentIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (targetIndex >= 0 && targetIndex < outlineItems.length) {
      const input = document.querySelector(`input[data-outline-index="${targetIndex}"]`) as HTMLInputElement
      if (input) {
        input.focus()
      }
    }
  }

  const saveOutlineFile = async () => {
    if (!editingFile) return

    setIsSaving(true)
    setSaveStatus("saving")

    try {
      const content = serializeOutlineContent(outlineItems)
      const updatedItems = items.map((item) =>
        item.id === editingFile.id ? { ...item, content, updatedAt: new Date() } : item,
      )
      saveItems(updatedItems)
      setEditingFile({ ...editingFile, content, updatedAt: new Date() })

      return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          // 模拟可能的保存失败（可以根据实际情况调整）
          const shouldFail = Math.random() < 0.1 // 10%的概率失败，仅用于测试

          if (shouldFail) {
            setIsSaving(false)
            setSaveStatus("failed")
            reject(new Error("保存失败"))
          } else {
            setIsSaving(false)
            setSaveStatus("saved")
            // 更新最后保存的内容引用
            lastContentRef.current = serializeOutlineContent(outlineItems)
            resolve()
          }
        }, 500)
      })
    } catch (error) {
      setIsSaving(false)
      setSaveStatus("failed")
      throw error
    }
  }

  // 上次内容的引用，用于比较是否有实际变化
  const lastContentRef = useRef<string>("");
  // 上次输入时间戳
  const lastInputTimeRef = useRef<number>(0);
  // 输入频率计数器
  const inputFrequencyCounterRef = useRef<number>(0);
  // 基础保存延迟时间
  const baseSaveDelayRef = useRef<number>(1000);

  // 撤销/重做历史堆栈（仅针对结构性操作：新增/删除/缩进/反缩进）
  const undoStackRef = useRef<OutlineItem[][]>([])
  const redoStackRef = useRef<OutlineItem[][]>([])

  const cloneOutlineItems = (items: OutlineItem[]): OutlineItem[] => {
    return JSON.parse(JSON.stringify(items)) as OutlineItem[]
  }

  const pushHistory = () => {
    undoStackRef.current.push(cloneOutlineItems(outlineItems))
    // 结构性变更后清空重做栈
    redoStackRef.current = []
  }

  const performUndo = () => {
    if (!editingFile) return
    if (undoStackRef.current.length === 0) return
    const previous = undoStackRef.current.pop() as OutlineItem[]
    // 将当前状态压入重做栈
    redoStackRef.current.push(cloneOutlineItems(outlineItems))
    setOutlineItems(previous)
    // 同步保存引用与状态
    lastContentRef.current = serializeOutlineContent(previous)
    if (saveStatus === "saved") {
      setSaveStatus("idle")
    }
    autoSave()
  }

  const performRedo = () => {
    if (!editingFile) return
    if (redoStackRef.current.length === 0) return
    const next = redoStackRef.current.pop() as OutlineItem[]
    // 将当前状态压回撤销栈
    undoStackRef.current.push(cloneOutlineItems(outlineItems))
    setOutlineItems(next)
    lastContentRef.current = serializeOutlineContent(next)
    if (saveStatus === "saved") {
      setSaveStatus("idle")
    }
    autoSave()
  }

  // 绑定键盘快捷键：当处于编辑文件模式且不在输入框内时，Ctrl+Z 撤销结构，Ctrl+Y 或 Ctrl+Shift+Z 重做结构
  useEffect(() => {
    // 文件切换或进入编辑时，重置历史栈，避免跨文件污染
    undoStackRef.current = []
    redoStackRef.current = []

    const handler = (e: KeyboardEvent) => {
      if (!editingFile) return
      const target = e.target as HTMLElement | null
      const isInTextInput = !!target && (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        // @ts-ignore
        target.isContentEditable === true
      )
      const isCtrlOrMeta = e.ctrlKey || e.metaKey
      const key = e.key.toLowerCase()

      // 在文本输入中不拦截，保持原生输入撤销/重做行为
      if (isCtrlOrMeta && key === "z" && !isInTextInput) {
        e.preventDefault()
        performUndo()
      } else if (isCtrlOrMeta && (key === "y" || (key === "z" && e.shiftKey)) && !isInTextInput) {
        e.preventDefault()
        performRedo()
      }
    }

    window.addEventListener("keydown", handler, true)
    return () => window.removeEventListener("keydown", handler, true)
  }, [editingFile])

  // 添加全局点击事件监听器来关闭右键菜单
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenuOpen(false)
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // 添加右键菜单事件监听器
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const container = document.getElementById('file-list-container')
      
      if (container && container.contains(target)) {
        console.log('右键事件被触发')
        e.preventDefault()
        e.stopPropagation()
        
        // 计算菜单位置，确保不超出屏幕边界
        const menuWidth = 180 // 菜单宽度
        const menuHeight = 120 // 预估菜单高度
        const screenWidth = window.innerWidth
        const screenHeight = window.innerHeight
        
        let x = e.clientX
        let y = e.clientY
        
        // 如果菜单会超出右边界，向左偏移
        if (x + menuWidth > screenWidth) {
          x = screenWidth - menuWidth - 10
        }
        
        // 如果菜单会超出下边界，向上偏移
        if (y + menuHeight > screenHeight) {
          y = screenHeight - menuHeight - 10
        }
        
        setContextMenuPosition({ x, y })
        setContextMenuOpen(true)
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    return () => document.removeEventListener('contextmenu', handleContextMenu)
  }, [])

  // 添加滚动条显示逻辑
  useEffect(() => {
    const scrollContainer = document.querySelector('.custom-scrollbar')
    if (!scrollContainer) return

    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      scrollContainer.classList.add('scrolling')
      
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        scrollContainer.classList.remove('scrolling')
      }, 1000) // 滚动停止1秒后隐藏滚动条
    }

    scrollContainer.addEventListener('scroll', handleScroll)
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  const autoSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }

    // 获取当前内容
    const currentContent = serializeOutlineContent(outlineItems);

    // 只有当内容真正发生变化时才触发保存
    if (currentContent !== lastContentRef.current) {
      // 更新上次内容引用
      lastContentRef.current = currentContent;

      // 设置保存状态为未保存
      if (saveStatus === "saved") {
        setSaveStatus("idle");
      }

      // 计算输入频率
      const now = Date.now();
      const timeSinceLastInput = now - lastInputTimeRef.current;
      lastInputTimeRef.current = now;

      // 如果输入间隔小于500ms，认为是快速输入
      if (timeSinceLastInput < 500) {
        inputFrequencyCounterRef.current += 1;
      } else {
        // 重置计数器
        inputFrequencyCounterRef.current = 0;
      }

      // 根据输入频率动态调整保存延迟
      // 快速输入时延长保存时间，避免频繁保存
      let saveDelay = baseSaveDelayRef.current;
      if (inputFrequencyCounterRef.current > 5) {
        // 快速输入模式，延长保存时间
        saveDelay = 2000;
      } else if (inputFrequencyCounterRef.current > 10) {
        // 非常快速的输入，进一步延长
        saveDelay = 3000;
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveOutlineFile();
        // 保存后重置输入频率计数器
        inputFrequencyCounterRef.current = 0;
      }, saveDelay);
    }
  }

  const updateOutlineItem = (index: number, text: string) => {
    const newItems = [...outlineItems]
    newItems[index] = { ...newItems[index], text }
    setOutlineItems(newItems)
    autoSave() // 触发自动保存
  }

  const handleFileClick = (item: FileSystemItem) => {
    if (item.type === "file" && !showTrash) {
      setEditingFile(item)
      const parsed = parseOutlineContent(item.content || "")
      const outlineContent = parsed.length > 0 ? parsed : [{ id: "outline-0", text: "", level: 0, children: [] }];
      setOutlineItems(outlineContent)

      // 设置初始内容引用
      lastContentRef.current = serializeOutlineContent(outlineContent);
      setSaveStatus("saved");
    }
  }

  const exitFileEditing = () => {
    setEditingFile(null)
    setOutlineItems([])
    setExpandedOutlineItems(new Set())
  }

  const currentItems = getCurrentItems()
  const breadcrumbs = getBreadcrumbs()

  const deleteOutlineItem = (index: number) => {
    // 结构性操作：先记录历史
    pushHistory()
    const newItems = [...outlineItems]
    newItems.splice(index, 1)
    setOutlineItems(newItems)
    autoSave() // 触发自动保存
  }

  const renderBreadcrumbs = () => {
    const handleBreadcrumbClick = async (crumb: Breadcrumb, isLast: boolean) => {
      if (isLast) return

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
      }

      if (editingFile) {
        // 只有当saveStatus不是'saved'时才触发保存
        if (saveStatus !== "saved") {
          await saveOutlineFile()
        }

        setEditingFile(null)

        const isRoot = crumb.id === "root"
        const isTrash = crumb.id === "trash"
        if (isTrash) {
          // 导航到回收站
          setShowTrash(true)
        } else if (isRoot) {
          setCurrentFolderId(null)
          // 如果打开了回收站，关闭它
          if (showTrash) {
            setShowTrash(false)
          }
        } else {
          setCurrentFolderId(crumb.id)
          // 如果打开了回收站，关闭它
          if (showTrash) {
            setShowTrash(false)
          }
        }
      } else {
        const isRoot = crumb.id === "root"
        const isTrash = crumb.id === "trash"
        if (isTrash) {
          // 导航到回收站
          setShowTrash(true)
        } else if (isRoot) {
          setCurrentFolderId(null)
          // 如果打开了回收站，关闭它
          if (showTrash) {
            setShowTrash(false)
          }
        } else {
          setCurrentFolderId(crumb.id)
          // 如果打开了回收站，关闭它
          if (showTrash) {
            setShowTrash(false)
          }
        }
      }
    }

    return (
      <div className="flex items-center space-x-1 text-sm">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1
          const isRoot = crumb.id === "root"
          const isTrash = crumb.id === "trash"
          const item = items.find((i) => i.id === crumb.id)
          const isFolder = item?.type === "folder" || isRoot

          return (
            <div key={crumb.id} className="flex items-center space-x-1">
              {index > 0 && <span className="text-muted-foreground/50">/</span>}
              <button
                onClick={() => handleBreadcrumbClick(crumb, isLast)}
                className={`flex items-center space-x-1 px-2 py-1 rounded transition-all duration-200 ${isLast
                  ? "text-foreground font-medium cursor-default"
                  : "text-muted-foreground/70 hover:text-muted-foreground hover:bg-muted/50 cursor-pointer"
                  }`}
                disabled={isLast}
              >
                {isFolder ? <Folder className="w-3 h-3" /> : isTrash ? <Trash2 className="w-3 h-3" /> : <File className="w-3 h-3" />}
                <span>{crumb.name}</span>
              </button>
            </div>
          )
        })}
      </div>
    )
  }

  if (editingFile && showTrash) {
    // 回收站中的文件查看模式
    return (
      <div className="h-full flex flex-col">
        <div className="bg-background">
          <div className="flex items-center justify-between px-3 py-3">
            <div className="flex items-center space-x-4">{renderBreadcrumbs()}</div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingFile(null);
                }}
                className="cursor-pointer"
              >
                返回
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto w-full px-4 py-6">
            <div className="flex items-center mb-6" style={{ paddingLeft: "24px" }}>
              <div className="w-12 flex-shrink-0"></div>
              <h1 className="text-4xl font-bold border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto py-0 shadow-none outline-none focus:outline-none focus:border-0 focus:ring-0 focus:shadow-none hover:outline-none">
                {editingFile.name}
              </h1>
            </div>

            <div className="space-y-0">
              {(editingFile.content || "").split('\n').map((line, index) => (
                <div
                  key={index}
                  className="flex items-center border-0"
                  style={{ paddingLeft: "24px", borderBottom: "none", borderTop: "none" }}
                >
                  <div className="w-12 flex-shrink-0"></div>
                  <div className="border-0 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto py-1 shadow-none outline-none text-base w-full">
                    {line}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 移除直接返回编辑视图的逻辑，改为在主界面中渲染
  // if (editingFile) {
  //   return (
  //     <div className="h-full flex flex-col">
  //       ... 编辑视图内容 ...
  //     </div>
  //   )
  // }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col md:flex-row">
      <div
        className={`${isLeftPanelCollapsed ? "w-0" : "w-full md:w-64"} transition-all duration-300 border-r bg-muted/20 ${isLeftPanelCollapsed ? "hidden" : "block md:block"} ${!isLeftPanelCollapsed && "absolute md:relative z-10 md:z-auto h-full md:h-auto bg-background md:bg-muted/20"}`}
      >
        {!isLeftPanelCollapsed && (
          <div className="h-full flex flex-col group/sidebar">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">文件夹</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsLeftPanelCollapsed(true)}
                  className="h-7 w-7 p-0 opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100 md:opacity-0 md:group-hover/sidebar:opacity-100 cursor-pointer"
                  aria-label="收起目录树"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>

              <div className="mb-3 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <Input
                    placeholder="搜索..."
                    className="pl-7 h-8 text-xs w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu
                  open={isCreateMenuOpen}
                  onOpenChange={(open) => {
                    setIsCreateMenuOpen(open)
                    setIsCreateTooltipOpen(false)
                    // 抑制 tooltip，避免菜单关闭时闪现
                    suppressCreateTooltipRef.current = true
                    // 菜单关闭后，如果仍悬停在按钮上，允许 tooltip 重新显示
                    if (!open) {
                      setTimeout(() => {
                        const btn = createButtonRef.current
                        const isHovering = !!btn && (btn as any).matches && (btn as any).matches(':hover')
                        if (isHovering) {
                          suppressCreateTooltipRef.current = false
                          setIsCreateTooltipOpen(true)
                        } else {
                          suppressCreateTooltipRef.current = false
                        }
                      }, 0)
                    }
                  }}
                >
                  <Tooltip open={isCreateMenuOpen ? false : isCreateTooltipOpen}>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          ref={createButtonRef}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 cursor-pointer"
                          aria-label="新建文档或文件夹"
                          onMouseEnter={() => {
                            if (!isCreateMenuOpen && !suppressCreateTooltipRef.current) {
                              setIsCreateTooltipOpen(true)
                            }
                          }}
                          onMouseLeave={() => {
                            setIsCreateTooltipOpen(false)
                            suppressCreateTooltipRef.current = false
                          }}
                          onFocus={() => {
                            if (!isCreateMenuOpen && !suppressCreateTooltipRef.current) {
                              setIsCreateTooltipOpen(true)
                            }
                          }}
                          onBlur={() => {
                            setIsCreateTooltipOpen(false)
                            // 保持 suppress 状态，直到鼠标离开，避免关闭后立即触发 tooltip
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={6}>新建文档或文件夹</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault()
                        setCreateType("file")
                        setIsCreateDialogOpen(true)
                        setIsCreateMenuOpen(false)
                      }}
                      className="cursor-pointer"
                    >
                      <FilePlus className="w-4 h-4 mr-2" />
                      新建文档
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault()
                        setCreateType("folder")
                        setIsCreateDialogOpen(true)
                        setIsCreateMenuOpen(false)
                      }}
                      className="cursor-pointer"
                    >
                      <FolderPlus className="w-4 h-4 mr-2" />
                      新建文件夹
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                <div
                  className={`flex items-center space-x-2 px-2 py-1 rounded cursor-pointer hover:bg-muted/50 ${currentFolderId === null ? "bg-muted" : ""
                    }`}
                  onClick={() => {
                    setCurrentFolderId(null)
                    setSelectedItem(null) // 清除文件选中状态
                    // 如果打开了回收站，关闭它
                    if (showTrash) {
                      setShowTrash(false);
                    }
                    if (window.innerWidth < 768) setIsLeftPanelCollapsed(true)
                  }}
                >
                  <Home className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">我的文档</span>
                </div>

                {renderFolderTree()}

                <div
                  className={`flex items-center space-x-2 px-2 py-1 rounded cursor-pointer hover:bg-muted/50 mt-4 ${showTrash ? "bg-muted" : ""
                    }`}
                  onClick={() => {
                    setShowTrash(!showTrash)
                    if (window.innerWidth < 768) setIsLeftPanelCollapsed(true)
                  }}
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">回收站</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* 如果正在编辑文件，显示编辑视图 */}
        {editingFile ? (
          <div className={`h-full flex flex-col ${isLeftPanelCollapsed ? 'w-full' : ''}`}>
            <div className="bg-background">
              <div className="flex items-center justify-between px-3 py-3">
                <div className="flex items-center space-x-4">
                  {/* 当左侧目录树收起时，显示展开按钮 */}
                  {isLeftPanelCollapsed && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsLeftPanelCollapsed(false)}
                      className="mr-2 h-8 w-8 p-0 cursor-pointer"
                      aria-label="展开目录树"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}

                  {renderBreadcrumbs()}
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-3">
                    {saveStatus === "saving" ? (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>保存中...</span>
                      </div>
                    ) : saveStatus === "failed" ? (
                      <div className="flex items-center space-x-2 text-sm text-red-500">
                        <AlertCircle className="w-3 h-3" />
                        <span>保存失败</span>
                      </div>
                    ) : saveStatus === "idle" ? (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground/60">
                        <span>未保存</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground/60">
                        <span>已保存</span>
                      </div>
                    )}

                    {/* 手动保存按钮 */}
                    {saveStatus !== "saved" && saveStatus !== "saving" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs cursor-pointer"
                        onClick={() => saveOutlineFile()}
                      >
                        保存
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={`flex-1 overflow-auto`}>
              <div className={`max-w-3xl mx-auto w-full ${isLeftPanelCollapsed ? 'px-6 py-8' : 'px-5 py-6'}`}>
                <div className="flex items-center mb-6" style={{ paddingLeft: isLeftPanelCollapsed ? "24px" : "24px" }}>
                  <div className={`flex-shrink-0 ${isLeftPanelCollapsed ? 'w-12' : 'w-12'}`}></div>
                  <Input
                    value={editingFile.name}
                    onChange={(e) => {
                      const newName = e.target.value
                      setEditingFile({ ...editingFile, name: newName })
                      const updatedItems = items.map((item) =>
                        item.id === editingFile.id ? { ...item, name: newName, updatedAt: new Date() } : item,
                      )
                      saveItems(updatedItems)
                      autoSave()
                    }}
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto py-0 shadow-none outline-none focus:outline-none focus:border-0 focus:ring-0 focus:shadow-none hover:outline-none text-4xl font-bold"
                    style={{
                      fontSize: "36px",
                      fontWeight: "bold",
                      lineHeight: "1.2",
                      border: "none",
                      outline: "none",
                      boxShadow: "none",
                      background: "transparent",
                      paddingLeft: "0px",
                    }}
                    onFocus={(e) => {
                      e.target.style.fontSize = "36px"
                      e.target.style.fontWeight = "bold"
                      e.target.style.outline = "none"
                      e.target.style.border = "none"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                </div>

                <div className="space-y-0">
                  {outlineItems.map((item, index) => {
                    const isVisible = shouldShowOutlineItem(item, index)
                    return (
                      <div
                        key={item.id}
                        className={`outline-item-wrapper transition-all duration-300 ease-out ${
                          isVisible ? 'opacity-100 max-h-[200px] translate-y-0' : 'opacity-0 max-h-0 -translate-y-2'
                        }`}
                        style={{
                          pointerEvents: isVisible ? 'auto' : 'none'
                        }}
                      >
                        <OutlineItemComponent
                          key={item.id}
                          item={item}
                          index={index}
                          isVisible={true}
                          hasChildren={hasOutlineChildren(index)}
                          onUpdate={(text) => updateOutlineItem(index, text)}
                          onDelete={() => deleteOutlineItem(index)}
                          onIndent={() => indentOutlineItem(index)}
                          onOutdent={() => outdentOutlineItem(index)}
                          onAddAfter={() => addOutlineItem(index)}
                          onToggleExpand={() => toggleOutlineItemExpanded(item.id)}
                          onNavigateUp={() => handleArrowNavigation(index, "up")}
                          onNavigateDown={() => handleArrowNavigation(index, "down")}
                          isExpanded={expandedOutlineItems.has(item.id)}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 如果不在编辑文件，显示正常的文件列表 */
          <>
            <div className="bg-background">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 py-3 space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="icon" onClick={() => setIsLeftPanelCollapsed(false)} className="md:hidden h-8 w-8 p-0 cursor-pointer" aria-label="展开目录树">
                    <Menu className="w-4 h-4" />
                  </Button>
                  {isLeftPanelCollapsed && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsLeftPanelCollapsed(false)}
                      className="hidden md:flex h-8 w-8 p-0 cursor-pointer"
                      aria-label="展开目录树"
                    >
                      <Menu className="w-4 h-4" />
                    </Button>
                  )}

                  <div className="flex items-center space-x-1 text-sm">
                    {breadcrumbs.map((crumb, index) => {
                      const isLast = index === breadcrumbs.length - 1
                      const isRoot = crumb.id === "root"
                      const isTrash = crumb.id === "trash"
                      const item = items.find((i) => i.id === crumb.id)
                      const isFolder = item?.type === "folder" || isRoot

                      return (
                        <div key={crumb.id} className="flex items-center space-x-1">
                          {index > 0 && <span className="text-muted-foreground/50">/</span>}
                          <button
                            onClick={() => {
                              if (isTrash) {
                                // 导航到回收站
                                setShowTrash(true)
                              } else if (isRoot) {
                                setCurrentFolderId(null)
                                setSelectedItem(null)
                                // 如果打开了回收站，关闭它
                                if (showTrash) {
                                  setShowTrash(false)
                                }
                              } else {
                                setCurrentFolderId(crumb.id === "root" ? null : crumb.id)
                                setSelectedItem(items.find((i) => i.id === (crumb.id === "root" ? null : crumb.id)) || null) // 更新选中状态
                                const item = items.find((i) => i.id === (crumb.id === "root" ? null : crumb.id));
                                if (item) {
                                  expandToItem(item);
                                }
                                // 如果打开了回收站，关闭它
                                if (showTrash) {
                                  setShowTrash(false)
                                }
                              }
                            }}
                            className={`flex items-center space-x-1 px-2 py-1 rounded transition-all duration-200 ${isLast
                              ? "text-foreground font-medium cursor-default"
                              : "text-muted-foreground/70 hover:text-muted-foreground hover:bg-muted/50 cursor-pointer"
                              }`}
                            disabled={isLast}
                          >
                            {isFolder ? <Folder className="w-3 h-3" /> : isTrash ? <Trash2 className="w-3 h-3" /> : <File className="w-3 h-3" />}
                            <span>{crumb.name}</span>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>


              </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row min-h-0" id="file-list-container">
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div 
                  className={`max-w-4xl mx-auto w-full ${isLeftPanelCollapsed ? 'px-4' : 'pl-16 pr-4'} py-4`}
                >
                  {currentItems.length === 0 ? (
                    <div className="flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                          {showTrash ? (
                            <Trash2 className="w-8 h-8 text-muted-foreground" />
                          ) : (
                            <Folder className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-foreground mb-2">
                            {showTrash ? "回收站为空" : "此文件夹为空"}
                          </h3>
                          <p className="text-muted-foreground">
                            {showTrash ? "没有已删除的文件" : "右键点击任意区域创建新的文件或文件夹"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="hidden md:grid grid-cols-12 gap-4 pb-2 mb-4 text-xs font-normal text-muted-foreground/60">
                        <div className="col-span-6">文件名</div>
                        <div className="col-span-2">类型</div>
                        <div className="col-span-2">修改时间</div>
                        <div className="col-span-2">创建时间</div>
                      </div>

                      <div className="space-y-1">
                        {currentItems.map((item) => (
                          <div
                            key={item.id}
                            className={`md:grid md:grid-cols-12 md:gap-4 p-3 md:p-2 rounded hover:bg-muted/50 cursor-pointer group ${selectedItem?.id === item.id ? "bg-muted" : ""
                              }`}
                            onClick={() => {
                              if (showTrash) {
                                // 在回收站中点击项目的行为
                                if (item.type === "folder") {
                                  // 点击回收站中的文件夹，进入该文件夹的浏览模式
                                  setSelectedItem(item);
                                  setCurrentFolderId(item.id);
                                } else if (item.type === "file") {
                                  // 点击回收站中的文件，查看文件内容但不能编辑
                                  setSelectedItem(item);
                                  // 设置一个特殊状态表示在回收站中查看文件
                                  setEditingFile({ ...item, content: item.content || "" });
                                }
                              } else if (item.type === "folder") {
                                setCurrentFolderId(item.id)
                                setSelectedItem(item)
                                expandToItem(item)
                              } else if (item.type === "file") {
                                handleFileClick(item)
                                setSelectedItem(item)
                                expandToItem(item)
                              } else {
                                setSelectedItem(item)
                              }
                              // 如果打开了回收站，关闭它
                              if (showTrash) {
                                setShowTrash(false);
                              }
                            }}
                          >
                            <div className="md:hidden space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                  {item.type === "folder" ? (
                                    <Folder className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                  ) : (
                                    <FileText className="w-5 h-5 text-green-500 flex-shrink-0" />
                                  )}
                                  {editingItem === item.id ? (
                                    <Input
                                      value={editingName}
                                      onChange={(e) => setEditingName(e.target.value)}
                                      onBlur={() => renameItem(item.id, editingName)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          renameItem(item.id, editingName)
                                        } else if (e.key === "Escape") {
                                          setEditingItem(null)
                                          setEditingName("")
                                        }
                                      }}
                                      className="h-8 text-base"
                                      autoFocus
                                    />
                                  ) : (
                                    <span className="text-base font-medium truncate">{item.name}</span>
                                  )}
                                </div>
                                <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 cursor-pointer">
                                        <MoreVertical className="w-3 h-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                                      {showTrash ? (
                                        <>
                                          <DropdownMenuItem onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            restoreItem(item.id);
                                          }} className="cursor-pointer">
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            恢复
                                          </DropdownMenuItem>
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <DropdownMenuItem
                                                onSelect={(e) => {
                                                  e.preventDefault();
                                                }}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  e.preventDefault();
                                                }}
                                                className="text-destructive focus:text-destructive cursor-pointer"
                                              >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                永久删除
                                              </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>确认永久删除</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  确定要永久删除 "{item.name}" 吗？此操作无法撤销。
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>取消</AlertDialogCancel>
                                                <AlertDialogAction onClick={(e) => {
                                                  e.stopPropagation();
                                                  deleteItem(item.id, true);
                                                }}>
                                                  永久删除
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </>
                                      ) : (
                                        <>
                                          <DropdownMenuItem
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              e.preventDefault();
                                              setEditingItem(item.id);
                                              setEditingName(item.name);
                                            }}
                                            className="cursor-pointer"
                                          >
                                            <Edit className="w-4 h-4 mr-2" />
                                            重命名
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              e.preventDefault();
                                              deleteItem(item.id);
                                            }}
                                            className="text-destructive focus:text-destructive cursor-pointer"
                                          >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            删除
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground pl-8">
                                <span>{item.type === "folder" ? "文件夹" : "文件"}</span>
                                <span>{formatTime(item.updatedAt)}</span>
                              </div>
                            </div>

                            <div className="hidden md:contents">
                              <div className="col-span-6 flex items-center space-x-3">
                                {item.type === "folder" ? (
                                  <Folder className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                ) : (
                                  <FileText className="w-5 h-5 text-green-500 flex-shrink-0" />
                                )}
                                {editingItem === item.id ? (
                                  <Input
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onBlur={() => renameItem(item.id, editingName)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        renameItem(item.id, editingName)
                                      } else if (e.key === "Escape") {
                                        setEditingItem(null)
                                        setEditingName("")
                                      }
                                    }}
                                    className="h-6 text-base"
                                    autoFocus
                                  />
                                ) : (
                                  <span className="text-base truncate">{item.name}</span>
                                )}
                              </div>
                              <div className="col-span-2 flex items-center">
                                <span className="text-xs text-muted-foreground/70">
                                  {item.type === "folder" ? "文件夹" : "文件"}
                                </span>
                              </div>
                              <div className="col-span-2 flex items-center">
                                <span className="text-xs text-muted-foreground/70">{formatTime(item.updatedAt)}</span>
                              </div>
                              <div className="col-span-2 flex items-center justify-between">
                                <span className="text-xs text-muted-foreground/70">{formatTime(item.createdAt)}</span>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 cursor-pointer">
                                        <MoreVertical className="w-3 h-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {showTrash ? (
                                        <>
                                          <DropdownMenuItem onClick={(e) => {
                                            e.stopPropagation();
                                            restoreItem(item.id);
                                          }} className="cursor-pointer">
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            恢复
                                          </DropdownMenuItem>
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <DropdownMenuItem
                                                onSelect={(e) => {
                                                  e.preventDefault();
                                                }}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                }}
                                                className="text-destructive focus:text-destructive cursor-pointer"
                                              >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                永久删除
                                              </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>确认永久删除</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  确定要永久删除 "{item.name}" 吗？此操作无法撤销。
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>取消</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => deleteItem(item.id, true)}>
                                                  永久删除
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </>
                                      ) : (
                                        <>
                                          <DropdownMenuItem
                                            onClick={() => {
                                              setEditingItem(item.id)
                                              setEditingName(item.name)
                                            }}
                                            className="cursor-pointer"
                                          >
                                            <Edit className="w-4 h-4 mr-2" />
                                            重命名
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => deleteItem(item.id)}
                                            className="text-destructive focus:text-destructive cursor-pointer"
                                          >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            删除
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 右键菜单 */}
      {contextMenuOpen && (
        <div
          className="fixed z-50 bg-popover text-popover-foreground min-w-[8rem] rounded-md border p-1 shadow-md"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
          }}
          onMouseLeave={() => setContextMenuOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setContextMenuOpen(false)
            }
          }}
          tabIndex={-1}
        >

          <button
            className="w-full px-2 py-1.5 text-left text-sm text-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex items-center gap-2 rounded-sm transition-colors duration-150 cursor-pointer select-none [&_svg]:shrink-0 [&_svg]:size-4"
            onClick={() => {
              setCreateType("file")
              setIsCreateDialogOpen(true)
              setContextMenuOpen(false)
            }}
          >
            <FilePlus className="w-4 h-4 text-muted-foreground" />
            <span>新建文档</span>
          </button>
          <button
            className="w-full px-2 py-1.5 text-left text-sm text-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex items-center gap-2 rounded-sm transition-colors duration-150 cursor-pointer select-none [&_svg]:shrink-0 [&_svg]:size-4"
            onClick={() => {
              setCreateType("folder")
              setIsCreateDialogOpen(true)
              setContextMenuOpen(false)
            }}
          >
            <FolderPlus className="w-4 h-4 text-muted-foreground" />
            <span>新建文件夹</span>
          </button>
        </div>
      )}

      <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{createType === "folder" ? "新建文件夹" : "新建文档"}</AlertDialogTitle>
            <AlertDialogDescription>请输入{createType === "folder" ? "文件夹" : "文档"}名称</AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={`输入${createType === "folder" ? "文件夹" : "文档"}名称`}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                createItem()
              }
            }}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNewItemName("")}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={createItem}>创建</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}










































































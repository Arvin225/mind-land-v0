"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  Plus,
  Search,
  CalendarIcon,
  Clock,
  Edit,
  Trash2,
  MoreVertical,
  Target,
  CheckCircle2,
  Circle,
  AlertCircle,
  Flag,
  SortAsc,
  SortDesc,
} from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

interface TodoItem {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: "low" | "medium" | "high"
  dueDate?: Date
  category: string
  createdAt: Date
  updatedAt: Date
}

type SortBy = "createdAt" | "dueDate" | "priority" | "title"
type SortOrder = "asc" | "desc"
type FilterBy = "all" | "pending" | "completed" | "overdue"

export function TodoModule() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBy, setFilterBy] = useState<FilterBy>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortBy>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null)

  // 表单状态
  const [newTodoTitle, setNewTodoTitle] = useState("")
  const [newTodoDescription, setNewTodoDescription] = useState("")
  const [newTodoPriority, setNewTodoPriority] = useState<"low" | "medium" | "high">("medium")
  const [newTodoCategory, setNewTodoCategory] = useState("")
  const [newTodoDueDate, setNewTodoDueDate] = useState<Date>()

  useEffect(() => {
    const savedTodos = localStorage.getItem("todos")
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
      }))
      setTodos(parsedTodos)
    } else {
      // 初始化示例数据
      const sampleTodos: TodoItem[] = [
        {
          id: "1",
          title: "完成项目原型设计",
          description: "设计用户界面和交互流程",
          completed: false,
          priority: "high",
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          category: "工作",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: "2",
          title: "准备明天的会议材料",
          description: "整理PPT和相关文档",
          completed: false,
          priority: "medium",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          category: "工作",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
          id: "3",
          title: "回复客户邮件",
          completed: true,
          priority: "medium",
          category: "工作",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 60 * 60 * 1000),
        },
        {
          id: "4",
          title: "整理设计资源库",
          description: "分类整理收集的设计素材",
          completed: false,
          priority: "low",
          category: "个人",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      ]
      setTodos(sampleTodos)
      localStorage.setItem("todos", JSON.stringify(sampleTodos))
    }
  }, [])

  const saveTodos = (updatedTodos: TodoItem[]) => {
    setTodos(updatedTodos)
    localStorage.setItem("todos", JSON.stringify(updatedTodos))
  }

  const createTodo = () => {
    if (!newTodoTitle.trim()) return

    const newTodo: TodoItem = {
      id: Date.now().toString(),
      title: newTodoTitle.trim(),
      description: newTodoDescription.trim() || undefined,
      completed: false,
      priority: newTodoPriority,
      dueDate: newTodoDueDate,
      category: newTodoCategory.trim() || "未分类",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const updatedTodos = [newTodo, ...todos]
    saveTodos(updatedTodos)
    resetForm()
    setIsCreateDialogOpen(false)
  }

  const updateTodo = () => {
    if (!editingTodo || !newTodoTitle.trim()) return

    const updatedTodos = todos.map((todo) =>
      todo.id === editingTodo.id
        ? {
            ...todo,
            title: newTodoTitle.trim(),
            description: newTodoDescription.trim() || undefined,
            priority: newTodoPriority,
            dueDate: newTodoDueDate,
            category: newTodoCategory.trim() || "未分类",
            updatedAt: new Date(),
          }
        : todo,
    )

    saveTodos(updatedTodos)
    setEditingTodo(null)
    resetForm()
  }

  const toggleTodo = (todoId: string) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === todoId
        ? {
            ...todo,
            completed: !todo.completed,
            updatedAt: new Date(),
          }
        : todo,
    )
    saveTodos(updatedTodos)
  }

  const deleteTodo = (todoId: string) => {
    const updatedTodos = todos.filter((todo) => todo.id !== todoId)
    saveTodos(updatedTodos)
  }

  const resetForm = () => {
    setNewTodoTitle("")
    setNewTodoDescription("")
    setNewTodoPriority("medium")
    setNewTodoCategory("")
    setNewTodoDueDate(undefined)
  }

  const startEditing = (todo: TodoItem) => {
    setEditingTodo(todo)
    setNewTodoTitle(todo.title)
    setNewTodoDescription(todo.description || "")
    setNewTodoPriority(todo.priority)
    setNewTodoCategory(todo.category)
    setNewTodoDueDate(todo.dueDate)
  }

  // 获取所有分类
  const allCategories = Array.from(new Set(todos.map((todo) => todo.category))).sort()

  // 筛选和排序
  const filteredAndSortedTodos = todos
    .filter((todo) => {
      // 搜索筛选
      const matchesSearch =
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        todo.category.toLowerCase().includes(searchQuery.toLowerCase())

      // 状态筛选
      const matchesFilter = (() => {
        switch (filterBy) {
          case "pending":
            return !todo.completed
          case "completed":
            return todo.completed
          case "overdue":
            return !todo.completed && todo.dueDate && todo.dueDate < new Date()
          default:
            return true
        }
      })()

      // 分类筛选
      const matchesCategory = selectedCategory === "all" || todo.category === selectedCategory

      return matchesSearch && matchesFilter && matchesCategory
    })
    .sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority]
          break
        case "dueDate":
          if (!a.dueDate && !b.dueDate) comparison = 0
          else if (!a.dueDate) comparison = 1
          else if (!b.dueDate) comparison = -1
          else comparison = a.dueDate.getTime() - b.dueDate.getTime()
          break
        case "createdAt":
        default:
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

  // 统计信息
  const stats = {
    total: todos.length,
    completed: todos.filter((todo) => todo.completed).length,
    pending: todos.filter((todo) => !todo.completed).length,
    overdue: todos.filter((todo) => !todo.completed && todo.dueDate && todo.dueDate < new Date()).length,
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-yellow-500"
      case "low":
        return "text-green-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "高"
      case "medium":
        return "中"
      case "low":
        return "低"
      default:
        return ""
    }
  }

  const isOverdue = (todo: TodoItem) => {
    return !todo.completed && todo.dueDate && todo.dueDate < new Date()
  }

  const formatDueDate = (date: Date) => {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    if (date.toDateString() === now.toDateString()) return "今天"
    if (date.toDateString() === tomorrow.toDateString()) return "明天"
    if (date.toDateString() === yesterday.toDateString()) return "昨天"

    return format(date, "MM月dd日", { locale: zhCN })
  }

  return (
    <div className="space-y-6">
      {/* 头部区域 */}
      <div className="flex flex-col space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Todo待办</h2>
          <p className="text-muted-foreground">管理你的任务和待办事项</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">总任务</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <p className="text-xs text-muted-foreground">已完成</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Circle className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <p className="text-xs text-muted-foreground">待完成</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.overdue}</div>
                  <p className="text-xs text-muted-foreground">已逾期</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 进度条 */}
        {stats.total > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>完成进度</span>
                  <span className="font-medium">{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* 操作栏 */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 搜索框 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索任务..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 筛选和排序 */}
          <div className="flex gap-2">
            <Select value={filterBy} onValueChange={(value: FilterBy) => setFilterBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="pending">待完成</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="overdue">已逾期</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {allCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("createdAt")}>按创建时间</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("dueDate")}>按截止时间</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("priority")}>按优先级</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("title")}>按标题</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                  {sortOrder === "asc" ? "降序" : "升序"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 创建按钮 */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>新建任务</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>创建新任务</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="任务标题" value={newTodoTitle} onChange={(e) => setNewTodoTitle(e.target.value)} />
                <Textarea
                  placeholder="任务描述（可选）"
                  value={newTodoDescription}
                  onChange={(e) => setNewTodoDescription(e.target.value)}
                  className="min-h-20 resize-none"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select value={newTodoPriority} onValueChange={(value: any) => setNewTodoPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">低优先级</SelectItem>
                      <SelectItem value="medium">中优先级</SelectItem>
                      <SelectItem value="high">高优先级</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="分类"
                    value={newTodoCategory}
                    onChange={(e) => setNewTodoCategory(e.target.value)}
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newTodoDueDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTodoDueDate ? format(newTodoDueDate, "PPP", { locale: zhCN }) : "选择截止日期"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={newTodoDueDate} onSelect={setNewTodoDueDate} initialFocus />
                  </PopoverContent>
                </Popover>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={createTodo} disabled={!newTodoTitle.trim()}>
                    创建
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="space-y-4">
        {filteredAndSortedTodos.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {searchQuery || filterBy !== "all" || selectedCategory !== "all"
                      ? "没有找到匹配的任务"
                      : "还没有任务"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery || filterBy !== "all" || selectedCategory !== "all"
                      ? "尝试调整搜索条件或筛选器"
                      : "点击上方按钮创建你的第一个任务"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedTodos.map((todo) => (
              <Card key={todo.id} className={cn("hover:shadow-md transition-shadow", todo.completed && "opacity-75")}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    {/* 复选框 */}
                    <Checkbox checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} className="mt-1" />

                    {/* 任务内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3
                            className={cn(
                              "font-medium text-foreground",
                              todo.completed && "line-through text-muted-foreground",
                            )}
                          >
                            {todo.title}
                          </h3>
                          {todo.description && (
                            <p className={cn("text-sm text-muted-foreground mt-1", todo.completed && "line-through")}>
                              {todo.description}
                            </p>
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
                            <DropdownMenuItem onClick={() => startEditing(todo)}>
                              <Edit className="w-4 h-4 mr-2" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteTodo(todo.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* 标签和信息 */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {todo.category}
                          </Badge>
                          <Badge variant="outline" className={cn("text-xs", getPriorityColor(todo.priority))}>
                            <Flag className="w-3 h-3 mr-1" />
                            {getPriorityLabel(todo.priority)}
                          </Badge>
                          {todo.dueDate && (
                            <Badge variant={isOverdue(todo) ? "destructive" : "outline"} className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDueDate(todo.dueDate)}
                            </Badge>
                          )}
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

      {/* 编辑对话框 */}
      <Dialog open={!!editingTodo} onOpenChange={() => setEditingTodo(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑任务</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="任务标题" value={newTodoTitle} onChange={(e) => setNewTodoTitle(e.target.value)} />
            <Textarea
              placeholder="任务描述（可选）"
              value={newTodoDescription}
              onChange={(e) => setNewTodoDescription(e.target.value)}
              className="min-h-20 resize-none"
            />
            <div className="grid grid-cols-2 gap-4">
              <Select value={newTodoPriority} onValueChange={(value: any) => setNewTodoPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">低优先级</SelectItem>
                  <SelectItem value="medium">中优先级</SelectItem>
                  <SelectItem value="high">高优先级</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="分类" value={newTodoCategory} onChange={(e) => setNewTodoCategory(e.target.value)} />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !newTodoDueDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newTodoDueDate ? format(newTodoDueDate, "PPP", { locale: zhCN }) : "选择截止日期"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={newTodoDueDate} onSelect={setNewTodoDueDate} initialFocus />
              </PopoverContent>
            </Popover>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingTodo(null)}>
                取消
              </Button>
              <Button onClick={updateTodo} disabled={!newTodoTitle.trim()}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 统计信息 */}
      {todos.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          共 {todos.length} 个任务
          {filteredAndSortedTodos.length !== todos.length && ` · 显示 ${filteredAndSortedTodos.length} 个`}
        </div>
      )}
    </div>
  )
}

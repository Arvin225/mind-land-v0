"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  StickyNote,
  CheckSquare,
  Clock,
  Plus,
  TrendingUp,
  Calendar,
  Target,
  Lightbulb,
  FileText,
  GitBranch,
} from "lucide-react"

interface HomePageProps {
  onModuleChange: (moduleId: string) => void
}

export function HomePage({ onModuleChange }: HomePageProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const stats = {
    totalNotes: 127,
    completedTodos: 23,
    totalTodos: 31,
    drafts: 8,
    mindmaps: 5,
  }

  const recentFlomoCards = [
    {
      id: 1,
      content: "今天学到了一个新的设计原则：简约不是减少，而是去除不必要的元素。",
      timestamp: "2小时前",
      tags: ["设计", "原则"],
    },
    {
      id: 2,
      content: "关于产品设计的思考：用户体验的核心是理解用户真正的需求。",
      timestamp: "昨天",
      tags: ["产品", "UX"],
    },
    {
      id: 3,
      content: "读书笔记：《设计心理学》- 好的设计应该是直观的，不需要说明书。",
      timestamp: "2天前",
      tags: ["读书", "心理学"],
    },
  ]

  const upcomingTodos = [
    { id: 1, title: "完成项目原型设计", priority: "high", dueDate: "今天" },
    { id: 2, title: "准备明天的会议材料", priority: "medium", dueDate: "明天" },
    { id: 3, title: "整理设计资源库", priority: "low", dueDate: "本周" },
  ]

  const completionRate = Math.round((stats.completedTodos / stats.totalTodos) * 100)

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0">
      {/* 欢迎区域 */}
      <div className="text-center space-y-3 md:space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl font-black text-foreground">工具箱</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4 md:px-0">
            简约现代的多功能工具应用，帮助你更好地管理想法、任务和创意
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>
              {currentTime.toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>
              {currentTime.toLocaleTimeString("zh-CN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-2">
              <StickyNote className="w-8 h-8 text-primary" />
              <div className="text-2xl font-bold">{stats.totalNotes}</div>
              <p className="text-xs text-muted-foreground">总卡片数</p>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-2">
              <Target className="w-8 h-8 text-secondary" />
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">完成率</p>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-2">
              <FileText className="w-8 h-8 text-accent" />
              <div className="text-2xl font-bold">{stats.drafts}</div>
              <p className="text-xs text-muted-foreground">草稿</p>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-2">
              <GitBranch className="w-8 h-8 text-primary" />
              <div className="text-2xl font-bold">{stats.mindmaps}</div>
              <p className="text-xs text-muted-foreground">思维导图</p>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-2">
              <TrendingUp className="w-8 h-8 text-secondary" />
              <div className="text-2xl font-bold">+12</div>
              <p className="text-xs text-muted-foreground">本周新增</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg group-hover:text-primary transition-colors">
              <Plus className="w-5 h-5" />
              <span>快速记录</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">快速创建一个新的flomo卡片，记录你的灵感</p>
            <Button size="sm" className="w-full" onClick={() => onModuleChange("flomo")}>
              新建卡片
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg group-hover:text-secondary transition-colors">
              <CheckSquare className="w-5 h-5" />
              <span>添加待办</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">快速添加一个新的待办事项，保持高效</p>
            <Button size="sm" variant="secondary" className="w-full" onClick={() => onModuleChange("todo")}>
              新建待办
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg group-hover:text-accent transition-colors">
              <Lightbulb className="w-5 h-5" />
              <span>自由创作</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">打开草稿纸，开始你的自由创作之旅</p>
            <Button
              size="sm"
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => onModuleChange("draft")}
            >
              开始创作
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        {/* 最近的Flomo卡片 */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <StickyNote className="w-5 h-5 text-primary" />
                  <span>最近的卡片</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onModuleChange("flomo")}>
                  查看全部
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              {recentFlomoCards.map((card) => (
                <div
                  key={card.id}
                  className="p-3 md:p-4 bg-muted/50 dark:bg-muted/30 rounded-lg hover:bg-muted/70 dark:hover:bg-muted/50 transition-colors"
                >
                  <p className="text-sm text-foreground mb-3 leading-relaxed">{card.content}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                      {card.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {card.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 待办事项和进度 */}
        <div className="space-y-4 md:space-y-6">
          {/* 待办进度 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Target className="w-5 h-5 text-secondary" />
                <span>今日进度</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>完成进度</span>
                  <span className="font-medium">
                    {stats.completedTodos}/{stats.totalTodos}
                  </span>
                </div>
                <Progress value={completionRate} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  还有 {stats.totalTodos - stats.completedTodos} 个待办事项
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 即将到期的待办 */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="w-5 h-5 text-secondary" />
                  <span>即将到期</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onModuleChange("todo")}>
                  查看全部
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-start sm:items-center space-x-3 p-3 bg-muted/50 dark:bg-muted/30 rounded-lg"
                >
                  <div className="w-4 h-4 border-2 border-secondary rounded mt-0.5 sm:mt-0 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">{todo.title}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mt-2">
                      <Badge
                        variant={
                          todo.priority === "high"
                            ? "destructive"
                            : todo.priority === "medium"
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs w-fit"
                      >
                        {todo.priority === "high" ? "高" : todo.priority === "medium" ? "中" : "低"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{todo.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Home, StickyNote, CheckSquare, GitBranch, FileText, BookOpen, Menu, X } from "lucide-react"

const navigationItems = [
  { id: "home", label: "主页", icon: Home },
  { id: "flomo", label: "Flomo卡片", icon: StickyNote },
  { id: "todo", label: "Todo待办", icon: CheckSquare },
  { id: "mindmap", label: "思维导图", icon: GitBranch },
  { id: "draft", label: "草稿纸", icon: FileText },
  { id: "outline", label: "大纲笔记", icon: BookOpen },
]

interface NavigationProps {
  activeModule: string
  onModuleChange: (moduleId: string) => void
}

export function Navigation({ activeModule, onModuleChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-between p-4 bg-card border-b border-border">
        <div className="flex items-center space-x-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeModule === item.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onModuleChange(item.id)}
                className="flex items-center space-x-2 px-3 py-2"
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Button>
            )
          })}
        </div>
        <ThemeToggle />
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-bold text-foreground">工具箱</h1>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="px-4 pb-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeModule === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    onModuleChange(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-start space-x-2 px-3 py-2"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Button>
              )
            })}
          </div>
        )}
      </nav>
    </>
  )
}

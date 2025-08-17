"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { HomePage } from "@/components/modules/home-page"
import { FlomoModule } from "@/components/modules/flomo-module"
import { TodoModule } from "@/components/modules/todo-module"
import { MindmapModule } from "@/components/modules/mindmap-module"
import { DraftModule } from "@/components/modules/draft-module"
import { OutlineModule } from "@/components/modules/outline-module"

export default function App() {
  const [activeModule, setActiveModule] = useState("home")

  const renderModule = () => {
    switch (activeModule) {
      case "home":
        return <HomePage onModuleChange={setActiveModule} />
      case "flomo":
        return <FlomoModule />
      case "todo":
        return <TodoModule />
      case "mindmap":
        return <MindmapModule />
      case "draft":
        return <DraftModule />
      case "outline":
        return <OutlineModule />
      default:
        return <HomePage onModuleChange={setActiveModule} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeModule={activeModule} onModuleChange={setActiveModule} />
      <main className="container mx-auto px-4 py-6 max-w-6xl">{renderModule()}</main>
    </div>
  )
}

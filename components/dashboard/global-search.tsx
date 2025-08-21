"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SearchResult {
  id: string
  type: "device" | "asset" | "user" | "maintenance"
  title: string
  subtitle: string
  data: any
}

export default function GlobalSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const searchData = () => {
      const searchResults: SearchResult[] = []
      const searchTerm = query.toLowerCase()

      // Search devices
      const devices = JSON.parse(localStorage.getItem("devices") || "[]")
      devices.forEach((device) => {
        if (
          device.name?.toLowerCase().includes(searchTerm) ||
          device.model?.toLowerCase().includes(searchTerm) ||
          device.ipAddress?.toLowerCase().includes(searchTerm) ||
          device.macAddress?.toLowerCase().includes(searchTerm)
        ) {
          searchResults.push({
            id: device.id,
            type: "device",
            title: device.name,
            subtitle: `${device.model} - ${device.ipAddress}`,
            data: device,
          })
        }
      })

      // Search assets
      const assets = JSON.parse(localStorage.getItem("assets") || "[]")
      assets.forEach((asset) => {
        if (
          asset.name?.toLowerCase().includes(searchTerm) ||
          asset.vendor?.toLowerCase().includes(searchTerm) ||
          asset.category?.toLowerCase().includes(searchTerm)
        ) {
          searchResults.push({
            id: asset.id,
            type: "asset",
            title: asset.name,
            subtitle: `${asset.vendor} - ${asset.category}`,
            data: asset,
          })
        }
      })

      // Search users
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      users.forEach((user) => {
        if (
          user.username?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm) ||
          user.fullName?.toLowerCase().includes(searchTerm)
        ) {
          searchResults.push({
            id: user.id,
            type: "user",
            title: user.fullName || user.username,
            subtitle: `${user.email} - ${user.role}`,
            data: user,
          })
        }
      })

      // Search maintenance tasks
      const maintenanceTasks = JSON.parse(localStorage.getItem("maintenanceTasks") || "[]")
      maintenanceTasks.forEach((task) => {
        if (
          task.title?.toLowerCase().includes(searchTerm) ||
          task.description?.toLowerCase().includes(searchTerm) ||
          task.deviceName?.toLowerCase().includes(searchTerm)
        ) {
          searchResults.push({
            id: task.id,
            type: "maintenance",
            title: task.title,
            subtitle: `${task.deviceName} - ${task.status}`,
            data: task,
          })
        }
      })

      setResults(searchResults.slice(0, 10)) // Limit to 10 results
    }

    const debounceTimer = setTimeout(searchData, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const getTypeColor = (type: string) => {
    switch (type) {
      case "device":
        return "bg-blue-100 text-blue-800"
      case "asset":
        return "bg-green-100 text-green-800"
      case "user":
        return "bg-purple-100 text-purple-800"
      case "maintenance":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search devices, assets, users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("")
              setResults([])
              setIsOpen(false)
            }}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <Card className="absolute top-full mt-1 w-full z-50 shadow-lg">
          <CardContent className="p-0">
            <ScrollArea className="max-h-80">
              <div className="space-y-1 p-2">
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="p-2 hover:bg-muted rounded-md cursor-pointer"
                    onClick={() => {
                      // Handle result selection
                      console.log("Selected:", result)
                      setIsOpen(false)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                      </div>
                      <Badge className={`ml-2 text-xs ${getTypeColor(result.type)}`}>{result.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

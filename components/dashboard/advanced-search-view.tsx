"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  Save,
  History,
  X,
  Server,
  HardDrive,
  Users,
  Package,
  FolderOpen,
  Calendar,
  CheckSquare,
  Bell,
  FileText,
  Settings,
  Clock,
  Star,
  Trash2,
  Eye,
  Download,
  Share2,
} from "lucide-react"

interface SearchResult {
  id: string
  title: string
  description: string
  type: string
  category: string
  data: any
  relevance: number
  lastModified?: Date
}

interface SavedSearch {
  id: string
  name: string
  query: string
  filters: SearchFilters
  createdAt: Date
  lastUsed: Date
}

interface SearchFilters {
  categories: string[]
  dateRange: { start?: Date; end?: Date }
  status?: string[]
  priority?: string[]
  tags?: string[]
}

const SEARCH_CATEGORIES = [
  { id: "devices", name: "Devices", icon: Server, color: "blue" },
  { id: "assets", name: "Digital Assets", icon: HardDrive, color: "green" },
  { id: "inventory", name: "Inventory", icon: Package, color: "purple" },
  { id: "users", name: "Users", icon: Users, color: "orange" },
  { id: "projects", name: "Projects", icon: FolderOpen, color: "indigo" },
  { id: "contacts", name: "Contacts", icon: Users, color: "pink" },
  { id: "tasks", name: "Tasks", icon: CheckSquare, color: "yellow" },
  { id: "events", name: "Events", icon: Calendar, color: "red" },
  { id: "notifications", name: "Notifications", icon: Bell, color: "gray" },
  { id: "files", name: "Files", icon: FileText, color: "cyan" },
]

export default function AdvancedSearchView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({
    categories: [],
    dateRange: {},
    status: [],
    priority: [],
    tags: [],
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    // Load search history and saved searches
    const history = localStorage.getItem("infonit_search_history")
    if (history) {
      setSearchHistory(JSON.parse(history))
    }

    const saved = localStorage.getItem("infonit_saved_searches")
    if (saved) {
      setSavedSearches(
        JSON.parse(saved).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          lastUsed: new Date(s.lastUsed),
        })),
      )
    }
  }, [])

  useEffect(() => {
    if (searchQuery.length > 2) {
      generateSearchSuggestions(searchQuery)
    } else {
      setSearchSuggestions([])
    }
  }, [searchQuery])

  const generateSearchSuggestions = (query: string) => {
    // Generate suggestions based on search history and common terms
    const suggestions = [
      `${query} status:active`,
      `${query} type:hardware`,
      `${query} priority:high`,
      `${query} created:today`,
      `${query} assigned:me`,
    ].filter((suggestion) => suggestion.toLowerCase().includes(query.toLowerCase()))

    setSearchSuggestions(suggestions.slice(0, 5))
    setShowSuggestions(true)
  }

  const performSearch = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setShowSuggestions(false)

    // Add to search history
    const newHistory = [searchQuery, ...searchHistory.filter((h) => h !== searchQuery)].slice(0, 10)
    setSearchHistory(newHistory)
    localStorage.setItem("infonit_search_history", JSON.stringify(newHistory))

    // Simulate search across all data sources
    const results = await searchAllSources(searchQuery, activeFilters)
    setSearchResults(results)
    setIsLoading(false)
  }

  const searchAllSources = async (query: string, filters: SearchFilters): Promise<SearchResult[]> => {
    const results: SearchResult[] = []

    // Search devices
    const devices = JSON.parse(localStorage.getItem("devices") || "[]")
    devices.forEach((device: any) => {
      if (
        device.name?.toLowerCase().includes(query.toLowerCase()) ||
        device.type?.toLowerCase().includes(query.toLowerCase()) ||
        device.location?.toLowerCase().includes(query.toLowerCase())
      ) {
        results.push({
          id: `device-${device.id}`,
          title: device.name,
          description: `${device.type} - ${device.location}`,
          type: "device",
          category: "devices",
          data: device,
          relevance: calculateRelevance(query, device.name + " " + device.type),
          lastModified: new Date(device.lastUpdated || device.createdAt),
        })
      }
    })

    // Search assets
    const assets = JSON.parse(localStorage.getItem("assets") || "[]")
    assets.forEach((asset: any) => {
      if (
        asset.name?.toLowerCase().includes(query.toLowerCase()) ||
        asset.type?.toLowerCase().includes(query.toLowerCase()) ||
        asset.description?.toLowerCase().includes(query.toLowerCase())
      ) {
        results.push({
          id: `asset-${asset.id}`,
          title: asset.name,
          description: `${asset.type} - ${asset.description}`,
          type: "asset",
          category: "assets",
          data: asset,
          relevance: calculateRelevance(query, asset.name + " " + asset.description),
          lastModified: new Date(asset.lastUpdated || asset.createdAt),
        })
      }
    })

    // Search inventory
    const inventory = JSON.parse(localStorage.getItem("infonit_inventory") || "[]")
    inventory.forEach((item: any) => {
      if (
        item.name?.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase()) ||
        item.sku?.toLowerCase().includes(query.toLowerCase())
      ) {
        results.push({
          id: `inventory-${item.id}`,
          title: item.name,
          description: `${item.description} - SKU: ${item.sku}`,
          type: "inventory",
          category: "inventory",
          data: item,
          relevance: calculateRelevance(query, item.name + " " + item.description),
          lastModified: new Date(item.lastUpdated),
        })
      }
    })

    // Search users
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    users.forEach((user: any) => {
      if (
        user.username?.toLowerCase().includes(query.toLowerCase()) ||
        user.profile?.firstName?.toLowerCase().includes(query.toLowerCase()) ||
        user.profile?.lastName?.toLowerCase().includes(query.toLowerCase()) ||
        user.profile?.email?.toLowerCase().includes(query.toLowerCase())
      ) {
        results.push({
          id: `user-${user.id}`,
          title: `${user.profile?.firstName || ""} ${user.profile?.lastName || ""} (${user.username})`,
          description: `${user.role} - ${user.profile?.email || ""}`,
          type: "user",
          category: "users",
          data: user,
          relevance: calculateRelevance(query, user.username + " " + (user.profile?.firstName || "")),
          lastModified: new Date(user.profile?.updatedAt || user.createdAt),
        })
      }
    })

    // Search projects
    const projects = JSON.parse(localStorage.getItem("infonit_projects") || "[]")
    projects.forEach((project: any) => {
      if (
        project.name?.toLowerCase().includes(query.toLowerCase()) ||
        project.description?.toLowerCase().includes(query.toLowerCase())
      ) {
        results.push({
          id: `project-${project.id}`,
          title: project.name,
          description: project.description,
          type: "project",
          category: "projects",
          data: project,
          relevance: calculateRelevance(query, project.name + " " + project.description),
          lastModified: new Date(project.updatedAt),
        })
      }
    })

    // Search contacts
    const contacts = JSON.parse(localStorage.getItem("infonit_contacts") || "[]")
    contacts.forEach((contact: any) => {
      if (
        contact.firstName?.toLowerCase().includes(query.toLowerCase()) ||
        contact.lastName?.toLowerCase().includes(query.toLowerCase()) ||
        contact.company?.toLowerCase().includes(query.toLowerCase()) ||
        contact.email?.toLowerCase().includes(query.toLowerCase())
      ) {
        results.push({
          id: `contact-${contact.id}`,
          title: `${contact.firstName} ${contact.lastName}`,
          description: `${contact.company} - ${contact.email}`,
          type: "contact",
          category: "contacts",
          data: contact,
          relevance: calculateRelevance(query, contact.firstName + " " + contact.lastName + " " + contact.company),
          lastModified: new Date(contact.updatedAt),
        })
      }
    })

    // Search tasks
    const tasks = JSON.parse(localStorage.getItem("infonit_tasks") || "[]")
    tasks.forEach((task: any) => {
      if (
        task.title?.toLowerCase().includes(query.toLowerCase()) ||
        task.description?.toLowerCase().includes(query.toLowerCase())
      ) {
        results.push({
          id: `task-${task.id}`,
          title: task.title,
          description: task.description,
          type: "task",
          category: "tasks",
          data: task,
          relevance: calculateRelevance(query, task.title + " " + task.description),
          lastModified: new Date(task.updatedAt),
        })
      }
    })

    // Search notifications
    const notifications = JSON.parse(localStorage.getItem("infonit_notifications") || "[]")
    notifications.forEach((notification: any) => {
      if (
        notification.title?.toLowerCase().includes(query.toLowerCase()) ||
        notification.message?.toLowerCase().includes(query.toLowerCase())
      ) {
        results.push({
          id: `notification-${notification.id}`,
          title: notification.title,
          description: notification.message,
          type: "notification",
          category: "notifications",
          data: notification,
          relevance: calculateRelevance(query, notification.title + " " + notification.message),
          lastModified: new Date(notification.createdAt),
        })
      }
    })

    // Apply filters
    let filteredResults = results

    if (filters.categories.length > 0) {
      filteredResults = filteredResults.filter((result) => filters.categories.includes(result.category))
    }

    if (selectedCategory !== "all") {
      filteredResults = filteredResults.filter((result) => result.category === selectedCategory)
    }

    // Sort by relevance
    return filteredResults.sort((a, b) => b.relevance - a.relevance)
  }

  const calculateRelevance = (query: string, text: string): number => {
    const queryLower = query.toLowerCase()
    const textLower = text.toLowerCase()

    if (textLower === queryLower) return 100
    if (textLower.startsWith(queryLower)) return 90
    if (textLower.includes(queryLower)) return 70

    // Calculate word matches
    const queryWords = queryLower.split(" ")
    const textWords = textLower.split(" ")
    const matches = queryWords.filter((word) => textWords.some((textWord) => textWord.includes(word)))

    return (matches.length / queryWords.length) * 50
  }

  const saveSearch = () => {
    const searchName = prompt("Enter a name for this search:")
    if (!searchName) return

    const newSavedSearch: SavedSearch = {
      id: `search-${Date.now()}`,
      name: searchName,
      query: searchQuery,
      filters: activeFilters,
      createdAt: new Date(),
      lastUsed: new Date(),
    }

    const updatedSaved = [...savedSearches, newSavedSearch]
    setSavedSearches(updatedSaved)
    localStorage.setItem("infonit_saved_searches", JSON.stringify(updatedSaved))
  }

  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setSearchQuery(savedSearch.query)
    setActiveFilters(savedSearch.filters)

    // Update last used
    const updatedSaved = savedSearches.map((s) => (s.id === savedSearch.id ? { ...s, lastUsed: new Date() } : s))
    setSavedSearches(updatedSaved)
    localStorage.setItem("infonit_saved_searches", JSON.stringify(updatedSaved))

    performSearch()
  }

  const deleteSavedSearch = (searchId: string) => {
    const updatedSaved = savedSearches.filter((s) => s.id !== searchId)
    setSavedSearches(updatedSaved)
    localStorage.setItem("infonit_saved_searches", JSON.stringify(updatedSaved))
  }

  const getCategoryIcon = (category: string) => {
    const categoryConfig = SEARCH_CATEGORIES.find((c) => c.id === category)
    if (!categoryConfig) return FileText
    return categoryConfig.icon
  }

  const getCategoryColor = (category: string) => {
    const categoryConfig = SEARCH_CATEGORIES.find((c) => c.id === category)
    return categoryConfig?.color || "gray"
  }

  const filteredResults = useMemo(() => {
    if (selectedCategory === "all") return searchResults
    return searchResults.filter((result) => result.category === selectedCategory)
  }, [searchResults, selectedCategory])

  const resultsByCategory = useMemo(() => {
    const grouped = searchResults.reduce(
      (acc, result) => {
        if (!acc[result.category]) {
          acc[result.category] = []
        }
        acc[result.category].push(result)
        return acc
      },
      {} as Record<string, SearchResult[]>,
    )

    return grouped
  }, [searchResults])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Search</h1>
          <p className="text-gray-600">Search across all your data with powerful filters</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          {searchQuery && (
            <Button variant="outline" onClick={saveSearch}>
              <Save className="h-4 w-4 mr-2" />
              Save Search
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search devices, assets, users, projects, and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && performSearch()}
                  className="pl-10 pr-4 py-3 text-lg"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => {
                      setSearchQuery("")
                      setSearchResults([])
                      setShowSuggestions(false)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button onClick={performSearch} disabled={!searchQuery.trim() || isLoading}>
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>

            {/* Search Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border rounded-md shadow-lg">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                    onClick={() => {
                      setSearchQuery(suggestion)
                      setShowSuggestions(false)
                    }}
                  >
                    <Search className="h-4 w-4 inline mr-2 text-gray-400" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center space-x-2 mt-4">
            <span className="text-sm text-gray-600">Quick filters:</span>
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All ({searchResults.length})
            </Button>
            {SEARCH_CATEGORIES.map((category) => {
              const count = resultsByCategory[category.id]?.length || 0
              if (count === 0) return null
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <category.icon className="h-3 w-3 mr-1" />
                  {category.name} ({count})
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Advanced Filters</CardTitle>
            <CardDescription>Refine your search with specific criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Categories</label>
                <div className="space-y-2">
                  {SEARCH_CATEGORIES.map((category) => (
                    <label key={category.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={activeFilters.categories.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActiveFilters({
                              ...activeFilters,
                              categories: [...activeFilters.categories, category.id],
                            })
                          } else {
                            setActiveFilters({
                              ...activeFilters,
                              categories: activeFilters.categories.filter((c) => c !== category.id),
                            })
                          }
                        }}
                      />
                      <category.icon className="h-4 w-4" />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <div className="space-y-2">
                  {["Active", "Inactive", "Pending", "Completed", "In Progress"].map((status) => (
                    <label key={status} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={activeFilters.status?.includes(status) || false}
                        onChange={(e) => {
                          const currentStatus = activeFilters.status || []
                          if (e.target.checked) {
                            setActiveFilters({
                              ...activeFilters,
                              status: [...currentStatus, status],
                            })
                          } else {
                            setActiveFilters({
                              ...activeFilters,
                              status: currentStatus.filter((s) => s !== status),
                            })
                          }
                        }}
                      />
                      <span className="text-sm">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <div className="space-y-2">
                  {["Low", "Medium", "High", "Critical"].map((priority) => (
                    <label key={priority} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={activeFilters.priority?.includes(priority) || false}
                        onChange={(e) => {
                          const currentPriority = activeFilters.priority || []
                          if (e.target.checked) {
                            setActiveFilters({
                              ...activeFilters,
                              priority: [...currentPriority, priority],
                            })
                          } else {
                            setActiveFilters({
                              ...activeFilters,
                              priority: currentPriority.filter((p) => p !== priority),
                            })
                          }
                        }}
                      />
                      <span className="text-sm">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Search History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <History className="h-4 w-4 mr-2" />
                Recent Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {searchHistory.slice(0, 5).map((query, index) => (
                  <button
                    key={index}
                    className="w-full text-left text-sm p-2 hover:bg-gray-50 rounded"
                    onClick={() => {
                      setSearchQuery(query)
                      performSearch()
                    }}
                  >
                    <Clock className="h-3 w-3 inline mr-2 text-gray-400" />
                    {query}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Saved Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Star className="h-4 w-4 mr-2" />
                Saved Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {savedSearches.slice(0, 5).map((savedSearch) => (
                  <div key={savedSearch.id} className="flex items-center justify-between">
                    <button
                      className="flex-1 text-left text-sm p-2 hover:bg-gray-50 rounded"
                      onClick={() => loadSavedSearch(savedSearch)}
                    >
                      <Star className="h-3 w-3 inline mr-2 text-yellow-500" />
                      {savedSearch.name}
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => deleteSavedSearch(savedSearch.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        <div className="lg:col-span-3">
          {searchResults.length > 0 && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Found {filteredResults.length} results for "{searchQuery}"
              </p>
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Sort by Relevance
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Relevance</DropdownMenuItem>
                    <DropdownMenuItem>Date Modified</DropdownMenuItem>
                    <DropdownMenuItem>Name</DropdownMenuItem>
                    <DropdownMenuItem>Type</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {filteredResults.map((result) => {
              const IconComponent = getCategoryIcon(result.category)
              const color = getCategoryColor(result.category)

              return (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`p-2 rounded-lg bg-${color}-100`}>
                          <IconComponent className={`h-5 w-5 text-${color}-600`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 mb-1">{result.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {result.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {result.relevance}% match
                            </Badge>
                            {result.lastModified && (
                              <span className="text-xs text-gray-500">
                                Modified {result.lastModified.toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {searchQuery && filteredResults.length === 0 && !isLoading && (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No results found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
                <Button variant="outline" onClick={() => setShowAdvancedFilters(true)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Adjust Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {!searchQuery && (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Start your search</h3>
                <p className="text-gray-500">
                  Enter keywords to search across devices, assets, users, projects, and more.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

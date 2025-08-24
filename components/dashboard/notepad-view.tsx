"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Star, Archive, Trash2, Edit, Calendar, Tag } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  priority: "low" | "medium" | "high"
  createdAt: Date
  updatedAt: Date
  isStarred: boolean
  isArchived: boolean
}

export default function NotepadView() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [viewMode, setViewMode] = useState<"all" | "starred" | "archived">("all")

  // Form states
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("personal")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [tags, setTags] = useState("")

  const categories = ["personal", "work", "project", "meeting", "idea", "todo", "reference"]

  useEffect(() => {
    // Load notes from localStorage
    const savedNotes = localStorage.getItem("userNotes")
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }))
      setNotes(parsedNotes)
    } else {
      // Sample notes
      const sampleNotes: Note[] = [
        {
          id: "1",
          title: "Project Meeting Notes",
          content:
            "Discussed new features for Q1 2024:\n- AI integration improvements\n- User interface enhancements\n- Performance optimizations",
          category: "meeting",
          tags: ["project", "planning", "q1"],
          priority: "high",
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-01-15"),
          isStarred: true,
          isArchived: false,
        },
        {
          id: "2",
          title: "Personal Goals",
          content:
            "Goals for this month:\n- Complete certification course\n- Improve work-life balance\n- Learn new programming language",
          category: "personal",
          tags: ["goals", "self-improvement"],
          priority: "medium",
          createdAt: new Date("2024-01-10"),
          updatedAt: new Date("2024-01-12"),
          isStarred: false,
          isArchived: false,
        },
      ]
      setNotes(sampleNotes)
      localStorage.setItem("userNotes", JSON.stringify(sampleNotes))
    }
  }, [])

  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes)
    localStorage.setItem("userNotes", JSON.stringify(updatedNotes))
  }

  const handleCreateNote = () => {
    if (!title.trim()) return

    const newNote: Note = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      priority,
      createdAt: new Date(),
      updatedAt: new Date(),
      isStarred: false,
      isArchived: false,
    }

    const updatedNotes = [newNote, ...notes]
    saveNotes(updatedNotes)
    resetForm()
    setIsCreateModalOpen(false)
  }

  const handleUpdateNote = () => {
    if (!editingNote || !title.trim()) return

    const updatedNotes = notes.map((note) =>
      note.id === editingNote.id
        ? {
            ...note,
            title: title.trim(),
            content: content.trim(),
            category,
            tags: tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag),
            priority,
            updatedAt: new Date(),
          }
        : note,
    )

    saveNotes(updatedNotes)
    resetForm()
    setEditingNote(null)
  }

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId)
    saveNotes(updatedNotes)
  }

  const handleToggleStar = (noteId: string) => {
    const updatedNotes = notes.map((note) => (note.id === noteId ? { ...note, isStarred: !note.isStarred } : note))
    saveNotes(updatedNotes)
  }

  const handleToggleArchive = (noteId: string) => {
    const updatedNotes = notes.map((note) => (note.id === noteId ? { ...note, isArchived: !note.isArchived } : note))
    saveNotes(updatedNotes)
  }

  const resetForm = () => {
    setTitle("")
    setContent("")
    setCategory("personal")
    setPriority("medium")
    setTags("")
  }

  const startEdit = (note: Note) => {
    setEditingNote(note)
    setTitle(note.title)
    setContent(note.content)
    setCategory(note.category)
    setPriority(note.priority)
    setTags(note.tags.join(", "))
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || note.category === selectedCategory
    const matchesPriority = selectedPriority === "all" || note.priority === selectedPriority

    const matchesView =
      viewMode === "all"
        ? !note.isArchived
        : viewMode === "starred"
          ? note.isStarred && !note.isArchived
          : viewMode === "archived"
            ? note.isArchived
            : true

    return matchesSearch && matchesCategory && matchesPriority && matchesView
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      personal: "bg-blue-100 text-blue-800",
      work: "bg-purple-100 text-purple-800",
      project: "bg-indigo-100 text-indigo-800",
      meeting: "bg-orange-100 text-orange-800",
      idea: "bg-pink-100 text-pink-800",
      todo: "bg-green-100 text-green-800",
      reference: "bg-gray-100 text-gray-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Personal Notepad</h1>
          <p className="text-gray-600">Organize your thoughts, ideas, and important notes</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Note title..." value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea
                placeholder="Write your note here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
              />
              <div className="grid grid-cols-3 gap-4">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateNote}>Create Note</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* View Tabs */}
      <Tabs value={viewMode} onValueChange={(value: "all" | "starred" | "archived") => setViewMode(value)}>
        <TabsList>
          <TabsTrigger value="all">All Notes ({notes.filter((n) => !n.isArchived).length})</TabsTrigger>
          <TabsTrigger value="starred">
            Starred ({notes.filter((n) => n.isStarred && !n.isArchived).length})
          </TabsTrigger>
          <TabsTrigger value="archived">Archived ({notes.filter((n) => n.isArchived).length})</TabsTrigger>
        </TabsList>

        <TabsContent value={viewMode} className="mt-6">
          {filteredNotes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
                <p className="text-gray-600 text-center">
                  {searchTerm ? "Try adjusting your search terms" : "Create your first note to get started"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map((note) => (
                <Card key={note.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStar(note.id)}
                          className={note.isStarred ? "text-yellow-500" : "text-gray-400"}
                        >
                          <Star className="w-4 h-4" fill={note.isStarred ? "currentColor" : "none"} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => startEdit(note)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleToggleArchive(note.id)}>
                          <Archive className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getCategoryColor(note.category)}>{note.category}</Badge>
                      <Badge className={getPriorityColor(note.priority)}>{note.priority}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm line-clamp-4 mb-3">{note.content}</p>
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {note.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {note.updatedAt.toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Note title..." value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea
              placeholder="Write your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />
            <div className="grid grid-cols-3 gap-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingNote(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateNote}>Update Note</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

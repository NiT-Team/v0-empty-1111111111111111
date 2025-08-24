"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload,
  FolderPlus,
  Search,
  Grid3X3,
  List,
  Download,
  Share2,
  Trash2,
  Edit,
  Eye,
  File,
  Folder,
  ImageIcon,
  FileText,
  Video,
  Music,
  Archive,
  MoreHorizontal,
  ChevronRight,
  Home,
  Star,
  Clock,
} from "lucide-react"

interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  size?: number
  mimeType?: string
  createdAt: Date
  modifiedAt: Date
  starred: boolean
  shared: boolean
  path: string
  parentId?: string
}

export default function FileManagerView() {
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "1",
      name: "Documents",
      type: "folder",
      createdAt: new Date("2024-01-15"),
      modifiedAt: new Date("2024-01-20"),
      starred: false,
      shared: false,
      path: "/Documents",
    },
    {
      id: "2",
      name: "Images",
      type: "folder",
      createdAt: new Date("2024-01-10"),
      modifiedAt: new Date("2024-01-25"),
      starred: true,
      shared: true,
      path: "/Images",
    },
    {
      id: "3",
      name: "Project Report.pdf",
      type: "file",
      size: 2048576,
      mimeType: "application/pdf",
      createdAt: new Date("2024-01-18"),
      modifiedAt: new Date("2024-01-18"),
      starred: false,
      shared: false,
      path: "/Project Report.pdf",
    },
    {
      id: "4",
      name: "Budget Analysis.xlsx",
      type: "file",
      size: 1024000,
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      createdAt: new Date("2024-01-16"),
      modifiedAt: new Date("2024-01-22"),
      starred: true,
      shared: true,
      path: "/Budget Analysis.xlsx",
    },
  ])

  const [currentPath, setCurrentPath] = useState("/")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredFiles = files.filter(
    (file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (currentPath === "/" ? !file.parentId : file.path.startsWith(currentPath)),
  )

  const starredFiles = files.filter((file) => file.starred)
  const recentFiles = files.sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime()).slice(0, 10)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (file: FileItem) => {
    if (file.type === "folder") return <Folder className="h-8 w-8 text-blue-500" />

    if (file.mimeType?.startsWith("image/")) return <ImageIcon className="h-8 w-8 text-green-500" />
    if (file.mimeType?.startsWith("video/")) return <Video className="h-8 w-8 text-purple-500" />
    if (file.mimeType?.startsWith("audio/")) return <Music className="h-8 w-8 text-orange-500" />
    if (file.mimeType?.includes("pdf")) return <FileText className="h-8 w-8 text-red-500" />
    if (file.mimeType?.includes("zip") || file.mimeType?.includes("rar"))
      return <Archive className="h-8 w-8 text-yellow-500" />

    return <File className="h-8 w-8 text-gray-500" />
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file, index) => {
      const fileId = `upload-${Date.now()}-${index}`

      // Simulate upload progress
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 30
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)

          // Add file to list after upload completes
          const newFile: FileItem = {
            id: fileId,
            name: file.name,
            type: "file",
            size: file.size,
            mimeType: file.type,
            createdAt: new Date(),
            modifiedAt: new Date(),
            starred: false,
            shared: false,
            path: currentPath === "/" ? `/${file.name}` : `${currentPath}/${file.name}`,
          }

          setFiles((prev) => [...prev, newFile])
          setUploadProgress((prev) => {
            const updated = { ...prev }
            delete updated[fileId]
            return updated
          })
        } else {
          setUploadProgress((prev) => ({ ...prev, [fileId]: progress }))
        }
      }, 200)
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = e.dataTransfer.files
    if (fileInputRef.current) {
      fileInputRef.current.files = droppedFiles
      handleFileUpload({ target: { files: droppedFiles } } as any)
    }
  }

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  const toggleStarred = (fileId: string) => {
    setFiles((prev) => prev.map((file) => (file.id === fileId ? { ...file, starred: !file.starred } : file)))
  }

  const deleteFiles = (fileIds: string[]) => {
    setFiles((prev) => prev.filter((file) => !fileIds.includes(file.id)))
    setSelectedFiles([])
  }

  const PathBreadcrumb = () => {
    const pathParts = currentPath.split("/").filter(Boolean)

    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Button variant="ghost" size="sm" onClick={() => setCurrentPath("/")} className="p-1 h-auto">
          <Home className="h-4 w-4" />
        </Button>
        {pathParts.map((part, index) => (
          <React.Fragment key={index}>
            <ChevronRight className="h-4 w-4" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPath("/" + pathParts.slice(0, index + 1).join("/"))}
              className="p-1 h-auto"
            >
              {part}
            </Button>
          </React.Fragment>
        ))}
      </div>
    )
  }

  const FileCard = ({ file }: { file: FileItem }) => (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedFiles.includes(file.id) ? "ring-2 ring-blue-500" : ""
      }`}
      onClick={() => toggleFileSelection(file.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          {getFileIcon(file)}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleStarred(file.id)}>
                <Star className={`h-4 w-4 mr-2 ${file.starred ? "fill-yellow-400 text-yellow-400" : ""}`} />
                {file.starred ? "Unstar" : "Star"}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h3 className="font-medium text-sm truncate mb-1">{file.name}</h3>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{file.size ? formatFileSize(file.size) : "Folder"}</span>
          <div className="flex items-center space-x-1">
            {file.starred && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
            {file.shared && <Share2 className="h-3 w-3 text-blue-500" />}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const FileRow = ({ file }: { file: FileItem }) => (
    <div
      className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer ${
        selectedFiles.includes(file.id) ? "bg-blue-50" : ""
      }`}
      onClick={() => toggleFileSelection(file.id)}
    >
      <div className="flex items-center space-x-3 flex-1">
        {getFileIcon(file)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
          <p className="text-xs text-gray-500">Modified {file.modifiedAt.toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4 text-sm text-gray-500">
        <span>{file.size ? formatFileSize(file.size) : "--"}</span>
        <div className="flex items-center space-x-1">
          {file.starred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
          {file.shared && <Share2 className="h-4 w-4 text-blue-500" />}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleStarred(file.id)}>
              <Star className={`h-4 w-4 mr-2 ${file.starred ? "fill-yellow-400 text-yellow-400" : ""}`} />
              {file.starred ? "Unstar" : "Star"}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">File Manager</h1>
          <p className="text-gray-600">Upload, organize, and manage your files</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Folder name" />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Create</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Uploading Files</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(uploadProgress).map(([fileId, progress]) => (
              <div key={fileId} className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Uploading...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Files</TabsTrigger>
            <TabsTrigger value="starred">Starred</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <PathBreadcrumb />

          {selectedFiles.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">{selectedFiles.length} file(s) selected</span>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button size="sm" variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteFiles(selectedFiles)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          <div
            className="min-h-64 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {filteredFiles.length === 0 ? (
              <div className="space-y-2">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="text-gray-500">No files found</p>
                <p className="text-sm text-gray-400">Drag and drop files here or click upload</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredFiles.map((file) => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredFiles.map((file) => (
                  <FileRow key={file.id} file={file} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="starred">
          <div className="space-y-4">
            {starredFiles.length === 0 ? (
              <div className="text-center py-12">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No starred files</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {starredFiles.map((file) => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {starredFiles.map((file) => (
                  <FileRow key={file.id} file={file} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <div className="space-y-4">
            {recentFiles.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent files</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {recentFiles.map((file) => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {recentFiles.map((file) => (
                  <FileRow key={file.id} file={file} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

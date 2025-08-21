"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, File, ImageIcon, FileText } from "lucide-react"
import type { Attachment } from "@/types"

interface FileUploadProps {
  attachments: Attachment[]
  onAttachmentsChange: (attachments: Attachment[]) => void
  maxFiles?: number
  maxSize?: number // in MB
}

export default function FileUpload({ attachments, onAttachmentsChange, maxFiles = 5, maxSize = 10 }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const newAttachments: Attachment[] = []

    Array.from(files).forEach((file) => {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`)
        return
      }

      if (attachments.length + newAttachments.length >= maxFiles) {
        alert(`Maximum ${maxFiles} files allowed.`)
        return
      }

      // Create a blob URL for the file
      const url = URL.createObjectURL(file)

      const attachment: Attachment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        url: url,
        uploadedAt: new Date().toISOString(),
        uploadedBy: "current-user", // In real app, get from auth context
      }

      newAttachments.push(attachment)
    })

    onAttachmentsChange([...attachments, ...newAttachments])
  }

  const removeAttachment = (attachmentId: string) => {
    const attachment = attachments.find((a) => a.id === attachmentId)
    if (attachment) {
      URL.revokeObjectURL(attachment.url) // Clean up blob URL
    }
    onAttachmentsChange(attachments.filter((a) => a.id !== attachmentId))
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />
    if (type.includes("pdf") || type.includes("document")) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          handleFileSelect(e.dataTransfer.files)
        }}
      >
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-2">Drag and drop files here, or click to select</p>
        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
          Choose Files
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Maximum {maxFiles} files, {maxSize}MB each
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Attached Files ({attachments.length})</h4>
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getFileIcon(attachment.type)}
                <div>
                  <p className="text-sm font-medium">{attachment.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.size)} • {new Date(attachment.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeAttachment(attachment.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

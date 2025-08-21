"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { User } from "@/types"

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (user: User) => void
  user?: User
}

export default function UserFormModal({ isOpen, onClose, onSave, user }: UserFormModalProps) {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    password: user ? "" : "",
    role: user?.role || "user",
  })
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const users = JSON.parse(localStorage.getItem("users") || "[]")

    if (!user && users.find((u: User) => u.username === formData.username)) {
      setError("Username already exists")
      return
    }

    const userData: User = {
      id: user?.id || Math.max(0, ...users.map((u: User) => u.id)) + 1,
      username: formData.username,
      password: formData.password || user?.password || "",
      role: formData.role as "superuser" | "admin" | "portal" | "user",
      uniqueCode: user?.uniqueCode || `USR-${String(users.length + 1).padStart(3, "0")}`,
      devices: user?.devices || [],
      assets: user?.assets || [],
    }

    onSave(userData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User - Basic Access</option>
              <option value="portal">Portal User - Self-Service Access</option>
              <option value="admin">Admin - Administrative Access</option>
              <option value="superuser">Superuser - Full System Access</option>
            </select>
          </div>

          {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">{error}</div>}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {user ? "Update User" : "Add User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

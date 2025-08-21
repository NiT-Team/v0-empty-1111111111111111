"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { TodoList, Task } from "@/types"

interface TodoListFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (todoList: TodoList) => void
  todoList?: TodoList
  tasks: Task[]
}

export default function TodoListFormModal({ isOpen, onClose, onSave, todoList, tasks }: TodoListFormModalProps) {
  const [formData, setFormData] = useState<Partial<TodoList>>({
    name: "",
    description: "",
    color: "#3B82F6",
    isDefault: false,
    tasks: [],
    sharedWith: [],
  })

  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [shareInput, setShareInput] = useState("")

  useEffect(() => {
    if (todoList) {
      setFormData(todoList)
      setSelectedTasks(todoList.tasks || [])
    } else {
      setFormData({
        name: "",
        description: "",
        color: "#3B82F6",
        isDefault: false,
        tasks: [],
        sharedWith: [],
      })
      setSelectedTasks([])
    }
  }, [todoList, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleTaskToggle = (taskId: string) => {
    setSelectedTasks((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]))
  }

  const handleAddShare = () => {
    if (shareInput.trim() && !formData.sharedWith?.includes(shareInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        sharedWith: [...(prev.sharedWith || []), shareInput.trim()],
      }))
      setShareInput("")
    }
  }

  const handleRemoveShare = (userToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      sharedWith: prev.sharedWith?.filter((user) => user !== userToRemove) || [],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const todoListData: TodoList = {
      id: todoList?.id || `list_${Date.now()}`,
      name: formData.name || "",
      description: formData.description,
      color: formData.color || "#3B82F6",
      isDefault: formData.isDefault || false,
      tasks: selectedTasks,
      createdBy: todoList?.createdBy || "current-user",
      sharedWith: formData.sharedWith || [],
      createdAt: todoList?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onSave(todoListData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {todoList ? "Edit Todo List" : "Create New Todo List"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[70vh]">
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Todo list name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="List description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <div className="flex gap-2">
                {["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#6B7280"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? "border-gray-800" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault || false}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Set as Default List
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tasks</label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                {tasks.length === 0 ? (
                  <p className="text-gray-500 text-sm">No tasks available</p>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <label key={task.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={() => handleTaskToggle(task.id)}
                          className="mr-2"
                        />
                        <span className="text-sm">{task.title}</span>
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            task.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : task.status === "in-progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {task.status}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Share With</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={shareInput}
                  onChange={(e) => setShareInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddShare())}
                  placeholder="Add user email..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddShare}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.sharedWith?.map((user, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {user}
                    <button
                      type="button"
                      onClick={() => handleRemoveShare(user)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {todoList ? "Update List" : "Create List"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

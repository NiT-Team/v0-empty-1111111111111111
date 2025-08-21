"use client"

import { useState } from "react"
import type { MaintenanceTask, Device } from "@/types"
import MaintenanceFormModal from "@/components/forms/maintenance-form-modal"

interface MaintenanceViewProps {
  tasks: MaintenanceTask[]
  setTasks: (tasks: MaintenanceTask[]) => void
  devices: Device[]
}

export default function MaintenanceView({ tasks, setTasks, devices }: MaintenanceViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<MaintenanceTask | undefined>(undefined)

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.deviceName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddTask = () => {
    setEditingTask(undefined)
    setIsModalOpen(true)
  }

  const handleEditTask = (task: MaintenanceTask) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleCompleteTask = (taskId: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: "Completed" as const, updatedAt: new Date().toISOString() } : task,
    )
    setTasks(updatedTasks)
    localStorage.setItem("infonit_maintenance_tasks", JSON.stringify(updatedTasks))
  }

  const handleSaveTask = (taskData: MaintenanceTask) => {
    let updatedTasks: MaintenanceTask[]

    if (editingTask) {
      updatedTasks = tasks.map((task) => (task.id === taskData.id ? taskData : task))
    } else {
      updatedTasks = [...tasks, taskData]
    }

    setTasks(updatedTasks)
    localStorage.setItem("infonit_maintenance_tasks", JSON.stringify(updatedTasks))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in progress":
        return "bg-blue-100 text-blue-800"
      case "scheduled":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-6">
        <div className="flex items-center mb-4 lg:mb-0">
          <h2 className="text-2xl font-bold text-gray-800">Maintenance Tasks</h2>
          <span className="ml-3 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {filteredTasks.length} tasks
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks..."
              className="pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>

          <button
            onClick={handleAddTask}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md flex items-center"
          >
            <i className="fas fa-plus mr-2"></i> Add Task
          </button>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <i className="fas fa-tools text-gray-400 text-3xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No maintenance tasks found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first maintenance task"}
          </p>
          {!searchTerm && (
            <button
              onClick={handleAddTask}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md"
            >
              <i className="fas fa-plus mr-2"></i> Add Your First Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-2">{task.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{task.deviceName}</p>
                  <p className="text-sm text-gray-500">{task.description}</p>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Due: {task.dueDate}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditTask(task)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit Task"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  {task.status !== "Completed" && (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="text-green-600 hover:text-green-800"
                      title="Mark Complete"
                    >
                      <i className="fas fa-check"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MaintenanceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        devices={devices}
      />
    </div>
  )
}

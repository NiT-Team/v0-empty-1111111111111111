"use client"

import { useState } from "react"
import type { Task, TodoList, User } from "@/types"
import TaskFormModal from "@/components/forms/task-form-modal"
import TodoListFormModal from "@/components/forms/todo-list-form-modal"

interface TasksViewProps {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  todoLists: TodoList[]
  setTodoLists: (todoLists: TodoList[]) => void
  user: User
}

export default function TasksView({ tasks, setTasks, todoLists, setTodoLists, user }: TasksViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [selectedList, setSelectedList] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"tasks" | "lists">("tasks")
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isListModalOpen, setIsListModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [editingList, setEditingList] = useState<TodoList | undefined>(undefined)

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || task.status === filterStatus
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority
    const matchesCategory = filterCategory === "all" || task.category === filterCategory
    const matchesList =
      selectedList === "all" || todoLists.find((list) => list.id === selectedList)?.tasks.includes(task.id)

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesList
  })

  const handleAddTask = () => {
    setEditingTask(undefined)
    setIsTaskModalOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsTaskModalOpen(true)
  }

  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      // Update existing task
      const updatedTasks = tasks.map((t) => (t.id === task.id ? task : t))
      setTasks(updatedTasks)
      localStorage.setItem("infonit_tasks", JSON.stringify(updatedTasks))
    } else {
      // Add new task
      const newTasks = [...tasks, task]
      setTasks(newTasks)
      localStorage.setItem("infonit_tasks", JSON.stringify(newTasks))
    }
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      const updatedTasks = tasks.filter((t) => t.id !== taskId)
      setTasks(updatedTasks)
      localStorage.setItem("infonit_tasks", JSON.stringify(updatedTasks))

      // Remove task from todo lists
      const updatedLists = todoLists.map((list) => ({
        ...list,
        tasks: list.tasks.filter((id) => id !== taskId),
      }))
      setTodoLists(updatedLists)
      localStorage.setItem("infonit_todo_lists", JSON.stringify(updatedLists))
    }
  }

  const handleAddList = () => {
    setEditingList(undefined)
    setIsListModalOpen(true)
  }

  const handleEditList = (list: TodoList) => {
    setEditingList(list)
    setIsListModalOpen(true)
  }

  const handleSaveList = (list: TodoList) => {
    if (editingList) {
      // Update existing list
      const updatedLists = todoLists.map((l) => (l.id === list.id ? list : l))
      setTodoLists(updatedLists)
      localStorage.setItem("infonit_todo_lists", JSON.stringify(updatedLists))
    } else {
      // Add new list
      const newLists = [...todoLists, list]
      setTodoLists(newLists)
      localStorage.setItem("infonit_todo_lists", JSON.stringify(newLists))
    }
  }

  const handleDeleteList = (listId: string) => {
    if (confirm("Are you sure you want to delete this todo list?")) {
      const updatedLists = todoLists.filter((l) => l.id !== listId)
      setTodoLists(updatedLists)
      localStorage.setItem("infonit_todo_lists", JSON.stringify(updatedLists))
    }
  }

  const handleToggleTaskStatus = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      const newStatus = task.status === "completed" ? "todo" : "completed"
      const updatedTask = {
        ...task,
        status: newStatus as Task["status"],
        completedDate: newStatus === "completed" ? new Date().toISOString() : undefined,
        progress: newStatus === "completed" ? 100 : task.progress,
      }
      handleSaveTask(updatedTask)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "on-hold":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "maintenance":
        return "bg-orange-100 text-orange-800"
      case "project":
        return "bg-purple-100 text-purple-800"
      case "support":
        return "bg-blue-100 text-blue-800"
      case "administrative":
        return "bg-indigo-100 text-indigo-800"
      case "personal":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-6">
        <div className="flex items-center mb-4 lg:mb-0">
          <h2 className="text-2xl font-bold text-gray-800">Task Management</h2>
          <span className="ml-3 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {viewMode === "tasks" ? `${filteredTasks.length} tasks` : `${todoLists.length} lists`}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("tasks")}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                viewMode === "tasks" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setViewMode("lists")}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                viewMode === "lists" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Todo Lists
            </button>
          </div>

          <button
            onClick={viewMode === "tasks" ? handleAddTask : handleAddList}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md flex items-center"
          >
            <i className="fas fa-plus mr-2"></i>
            {viewMode === "tasks" ? "Add Task" : "Add List"}
          </button>
        </div>
      </div>

      {viewMode === "tasks" && (
        <>
          {/* Task Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                className="pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="maintenance">Maintenance</option>
              <option value="project">Project</option>
              <option value="support">Support</option>
              <option value="administrative">Administrative</option>
              <option value="personal">Personal</option>
            </select>

            <select
              value={selectedList}
              onChange={(e) => setSelectedList(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Lists</option>
              {todoLists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tasks Grid */}
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-tasks text-gray-400 text-3xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first task"}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <div key={task.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleTaskStatus(task.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          task.status === "completed"
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 hover:border-green-500"
                        }`}
                      >
                        {task.status === "completed" && <i className="fas fa-check text-xs"></i>}
                      </button>
                      <div className="bg-blue-100 rounded-lg p-2">
                        <i className="fas fa-task text-blue-600"></i>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>

                  <h3
                    className={`font-semibold text-gray-800 mb-2 ${task.status === "completed" ? "line-through" : ""}`}
                  >
                    {task.title}
                  </h3>
                  {task.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>}

                  <div className="space-y-2 mb-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}
                    >
                      {task.category}
                    </span>

                    {task.dueDate && (
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="fas fa-calendar w-4 mr-2"></i>
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}

                    {task.assignedTo && (
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="fas fa-user w-4 mr-2"></i>
                        <span>{task.assignedTo}</span>
                      </div>
                    )}

                    {task.progress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${task.progress}%` }}></div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Created {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit Task"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Task"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {viewMode === "lists" && (
        <>
          {/* Todo Lists Grid */}
          {todoLists.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-list text-gray-400 text-3xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No todo lists found</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first todo list</p>
              <button
                onClick={handleAddList}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md"
              >
                <i className="fas fa-plus mr-2"></i> Create Your First List
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todoLists.map((list) => {
                const listTasks = tasks.filter((task) => list.tasks.includes(task.id))
                const completedTasks = listTasks.filter((task) => task.status === "completed").length
                const progress = listTasks.length > 0 ? (completedTasks / listTasks.length) * 100 : 0

                return (
                  <div key={list.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-purple-100 rounded-lg p-2">
                        <i className="fas fa-list text-purple-600"></i>
                      </div>
                      {list.isDefault && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Default
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-gray-800 mb-2">{list.name}</h3>
                    {list.description && <p className="text-sm text-gray-600 mb-3">{list.description}</p>}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          {completedTasks}/{listTasks.length} tasks
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Created {new Date(list.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditList(list)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit List"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        {!list.isDefault && (
                          <button
                            onClick={() => handleDeleteList(list.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete List"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        todoLists={todoLists}
      />

      <TodoListFormModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        onSave={handleSaveList}
        todoList={editingList}
        tasks={tasks}
      />
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  FolderOpen,
  Users,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import ProjectFormModal from "@/components/forms/project-form-modal"
import type { Project, User, ProjectMaterial } from "@/types"

interface ProjectsViewProps {
  user: User
}

export default function ProjectsView({ user }: ProjectsViewProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [materials, setMaterials] = useState<ProjectMaterial[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  useEffect(() => {
    loadProjects()
    loadMaterials()
  }, [])

  const loadProjects = () => {
    const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]")
    setProjects(storedProjects)
  }

  const loadMaterials = () => {
    const storedMaterials = JSON.parse(localStorage.getItem("infonit_project_materials") || "[]")
    setMaterials(storedMaterials)
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleAddProject = () => {
    setEditingProject(undefined)
    setIsModalOpen(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setIsModalOpen(true)
  }

  const handleSaveProject = (project: Project) => {
    if (editingProject) {
      const updatedProjects = projects.map((p) => (p.id === project.id ? project : p))
      setProjects(updatedProjects)
      localStorage.setItem("projects", JSON.stringify(updatedProjects))
    } else {
      const newProjects = [...projects, project]
      setProjects(newProjects)
      localStorage.setItem("projects", JSON.stringify(newProjects))
    }
  }

  const handleDeleteProject = (projectId: string) => {
    if (confirm("Are you sure you want to delete this project? This will also remove all associated materials.")) {
      const updatedProjects = projects.filter((p) => p.id !== projectId)
      setProjects(updatedProjects)
      localStorage.setItem("projects", JSON.stringify(updatedProjects))

      // Remove associated materials
      const updatedMaterials = materials.filter((m) => m.projectId !== projectId)
      setMaterials(updatedMaterials)
      localStorage.setItem("infonit_project_materials", JSON.stringify(updatedMaterials))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "on-hold":
        return "bg-yellow-100 text-yellow-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <TrendingUp className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "on-hold":
        return <Clock className="h-4 w-4" />
      case "inactive":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <FolderOpen className="h-4 w-4" />
    }
  }

  const getProjectMaterialsCount = (projectId: string) => {
    return materials.filter((m) => m.projectId === projectId).length
  }

  const getProjectMaterialsCost = (projectId: string) => {
    return materials.filter((m) => m.projectId === projectId).reduce((sum, m) => sum + (m.totalCost || 0), 0)
  }

  const calculateStats = () => {
    const totalProjects = projects.length
    const activeProjects = projects.filter((p) => p.status === "active").length
    const completedProjects = projects.filter((p) => p.status === "completed").length
    const onHoldProjects = projects.filter((p) => p.status === "on-hold").length
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
    const totalActualCost = projects.reduce((sum, p) => sum + (p.actualCost || 0), 0)

    return { totalProjects, activeProjects, completedProjects, onHoldProjects, totalBudget, totalActualCost }
  }

  const stats = calculateStats()

  const statuses = ["active", "completed", "on-hold", "inactive"]
  const priorities = ["critical", "high", "medium", "low"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-6">
        <div className="flex items-center mb-4 lg:mb-0">
          <FolderOpen className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
            <p className="text-gray-600">Manage your projects and assign materials</p>
          </div>
          <Badge variant="secondary" className="ml-3">
            {filteredProjects.length} projects
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className="pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>

          <Button onClick={handleAddProject}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold">{stats.totalProjects}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{stats.activeProjects}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{stats.completedProjects}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Hold</p>
                <p className="text-2xl font-bold">{stats.onHoldProjects}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold">${stats.totalBudget.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actual Cost</p>
                <p className="text-2xl font-bold">${stats.totalActualCost.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Priorities</option>
          {priorities.map((priority) => (
            <option key={priority} value={priority}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </option>
          ))}
        </select>

        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")}>
            <i className="fas fa-th"></i>
          </Button>
          <Button variant={viewMode === "table" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("table")}>
            <i className="fas fa-list"></i>
          </Button>
        </div>
      </div>

      {/* Content */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating your first project"}
            </p>
            {!searchTerm && statusFilter === "all" && priorityFilter === "all" && (
              <Button onClick={handleAddProject}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <FolderOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusIcon(project.status)}
                      <span className="ml-1">{project.status}</span>
                    </Badge>
                    <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-800 mb-2">{project.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{project.description}</p>

                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Materials:</span>
                      <span className="font-medium ml-1">{getProjectMaterialsCount(project.id)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Cost:</span>
                      <span className="font-medium ml-1">${getProjectMaterialsCost(project.id).toLocaleString()}</span>
                    </div>
                  </div>

                  {project.budget && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Budget:</span>
                      <span className="font-medium">${project.budget.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Start Date:</span>
                    <span className="font-medium">{new Date(project.startDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <Users className="h-3 w-3 mr-1" />
                    {project.assignedUsers.length} members
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditProject(project)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(project.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Materials</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="bg-blue-100 rounded-lg p-2 mr-3">
                            <FolderOpen className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                            <div className="text-sm text-gray-500">{project.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusIcon(project.status)}
                          <span className="ml-1">{project.status}</span>
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Progress value={project.progress} className="h-2 w-16 mr-2" />
                          <span className="text-sm text-gray-600">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {getProjectMaterialsCount(project.id)} items
                        <div className="text-xs text-gray-500">
                          ${getProjectMaterialsCost(project.id).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditProject(project)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(project.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
        project={editingProject}
        user={user}
      />
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react"
import ProjectMaterialFormModal from "@/components/forms/project-material-form-modal"
import type { Project, ProjectMaterial, User } from "@/types"

interface ProjectMaterialsViewProps {
  projects: Project[]
  user: User
}

export default function ProjectMaterialsView({ projects, user }: ProjectMaterialsViewProps) {
  const [materials, setMaterials] = useState<ProjectMaterial[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<ProjectMaterial | undefined>(undefined)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  useEffect(() => {
    loadMaterials()
  }, [])

  const loadMaterials = () => {
    const storedMaterials = JSON.parse(localStorage.getItem("infonit_project_materials") || "[]")
    setMaterials(storedMaterials)
  }

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.supplier?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesProject = selectedProject === "all" || material.projectId === selectedProject
    const matchesStatus = statusFilter === "all" || material.status === statusFilter
    const matchesCategory = categoryFilter === "all" || material.category === categoryFilter

    return matchesSearch && matchesProject && matchesStatus && matchesCategory
  })

  const handleAddMaterial = () => {
    setEditingMaterial(undefined)
    setIsModalOpen(true)
  }

  const handleEditMaterial = (material: ProjectMaterial) => {
    setEditingMaterial(material)
    setIsModalOpen(true)
  }

  const handleSaveMaterial = (material: ProjectMaterial) => {
    if (editingMaterial) {
      const updatedMaterials = materials.map((m) => (m.id === material.id ? material : m))
      setMaterials(updatedMaterials)
      localStorage.setItem("infonit_project_materials", JSON.stringify(updatedMaterials))
    } else {
      const newMaterials = [...materials, material]
      setMaterials(newMaterials)
      localStorage.setItem("infonit_project_materials", JSON.stringify(newMaterials))
    }
  }

  const handleDeleteMaterial = (materialId: string) => {
    if (confirm("Are you sure you want to delete this material?")) {
      const updatedMaterials = materials.filter((m) => m.id !== materialId)
      setMaterials(updatedMaterials)
      localStorage.setItem("infonit_project_materials", JSON.stringify(updatedMaterials))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "ordered":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-purple-100 text-purple-800"
      case "in-use":
        return "bg-yellow-100 text-yellow-800"
      case "consumed":
        return "bg-gray-100 text-gray-800"
      case "returned":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-4 w-4" />
      case "ordered":
        return <Clock className="h-4 w-4" />
      case "delivered":
        return <Package className="h-4 w-4" />
      case "in-use":
        return <TrendingUp className="h-4 w-4" />
      case "consumed":
        return <AlertTriangle className="h-4 w-4" />
      case "returned":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "hardware":
        return "fas fa-microchip"
      case "software":
        return "fas fa-code"
      case "consumables":
        return "fas fa-shopping-cart"
      case "tools":
        return "fas fa-tools"
      case "equipment":
        return "fas fa-desktop"
      case "materials":
        return "fas fa-boxes"
      default:
        return "fas fa-cube"
    }
  }

  const calculateStats = () => {
    const totalMaterials = materials.length
    const totalValue = materials.reduce((sum, m) => sum + (m.totalCost || 0), 0)
    const availableMaterials = materials.filter((m) => m.status === "available").length
    const inUseMaterials = materials.filter((m) => m.status === "in-use").length
    const lowStockMaterials = materials.filter(
      (m) => m.quantity <= (m.minQuantity || 0) && m.status !== "consumed",
    ).length

    return { totalMaterials, totalValue, availableMaterials, inUseMaterials, lowStockMaterials }
  }

  const stats = calculateStats()

  const exportMaterials = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      materials: filteredMaterials,
      summary: stats,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `project-materials-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const categories = ["hardware", "software", "consumables", "tools", "equipment", "materials"]
  const statuses = ["available", "ordered", "delivered", "in-use", "consumed", "returned"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-6">
        <div className="flex items-center mb-4 lg:mb-0">
          <Package className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Project Materials</h2>
            <p className="text-gray-600">Manage materials and resources for your projects</p>
          </div>
          <Badge variant="secondary" className="ml-3">
            {filteredMaterials.length} items
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search materials..."
              className="pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>

          <Button onClick={exportMaterials} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button onClick={handleAddMaterial}>
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Materials</p>
                <p className="text-2xl font-bold">{stats.totalMaterials}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold">{stats.availableMaterials}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Use</p>
                <p className="text-2xl font-bold">{stats.inUseMaterials}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold">{stats.lowStockMaterials}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>

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
      {filteredMaterials.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No materials found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedProject !== "all" || statusFilter !== "all" || categoryFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first project material"}
            </p>
            {!searchTerm && selectedProject === "all" && statusFilter === "all" && categoryFilter === "all" && (
              <Button onClick={handleAddMaterial}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Material
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <i className={`${getCategoryIcon(material.category)} text-blue-600`}></i>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(material.status)}>
                      {getStatusIcon(material.status)}
                      <span className="ml-1">{material.status}</span>
                    </Badge>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-800 mb-2">{material.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{material.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Quantity:</span>
                    <span className="font-medium">
                      {material.quantity} {material.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Unit Cost:</span>
                    <span className="font-medium">${material.unitCost}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Cost:</span>
                    <span className="font-medium">${material.totalCost}</span>
                  </div>
                  {material.supplier && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Supplier:</span>
                      <span className="font-medium">{material.supplier}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {projects.find((p) => p.id === material.projectId)?.name || "No Project"}
                  </span>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditMaterial(material)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteMaterial(material.id)}>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMaterials.map((material) => (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="bg-blue-100 rounded-lg p-2 mr-3">
                            <i className={`${getCategoryIcon(material.category)} text-blue-600`}></i>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{material.name}</div>
                            <div className="text-sm text-gray-500">{material.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {projects.find((p) => p.id === material.projectId)?.name || "No Project"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {material.quantity} {material.unit}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(material.status)}>
                          {getStatusIcon(material.status)}
                          <span className="ml-1">{material.status}</span>
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">${material.totalCost}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditMaterial(material)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteMaterial(material.id)}>
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

      <ProjectMaterialFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMaterial}
        material={editingMaterial}
        projects={projects}
      />
    </div>
  )
}

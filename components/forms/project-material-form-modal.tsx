"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ProjectMaterial, Project } from "@/types"

interface ProjectMaterialFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (material: ProjectMaterial) => void
  material?: ProjectMaterial
  projects: Project[]
}

export default function ProjectMaterialFormModal({
  isOpen,
  onClose,
  onSave,
  material,
  projects,
}: ProjectMaterialFormModalProps) {
  const [formData, setFormData] = useState<Partial<ProjectMaterial>>({
    name: "",
    description: "",
    category: "materials",
    projectId: "",
    quantity: 1,
    unit: "pcs",
    unitCost: 0,
    totalCost: 0,
    supplier: "",
    status: "available",
    minQuantity: 0,
    location: "",
    notes: "",
  })

  useEffect(() => {
    if (material) {
      setFormData(material)
    } else {
      setFormData({
        name: "",
        description: "",
        category: "materials",
        projectId: "",
        quantity: 1,
        unit: "pcs",
        unitCost: 0,
        totalCost: 0,
        supplier: "",
        status: "available",
        minQuantity: 0,
        location: "",
        notes: "",
      })
    }
  }, [material, isOpen])

  useEffect(() => {
    // Calculate total cost when quantity or unit cost changes
    const quantity = formData.quantity || 0
    const unitCost = formData.unitCost || 0
    setFormData((prev) => ({
      ...prev,
      totalCost: quantity * unitCost,
    }))
  }, [formData.quantity, formData.unitCost])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.projectId) {
      alert("Please fill in all required fields")
      return
    }

    const materialData: ProjectMaterial = {
      id: material?.id || Date.now().toString(),
      name: formData.name!,
      description: formData.description,
      category: formData.category!,
      projectId: formData.projectId!,
      quantity: formData.quantity!,
      unit: formData.unit!,
      unitCost: formData.unitCost!,
      totalCost: formData.totalCost!,
      supplier: formData.supplier,
      status: formData.status!,
      minQuantity: formData.minQuantity,
      location: formData.location,
      notes: formData.notes,
      createdAt: material?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: material?.createdBy || "current-user",
    }

    onSave(materialData)
    onClose()
  }

  const categories = [
    { value: "hardware", label: "Hardware" },
    { value: "software", label: "Software" },
    { value: "consumables", label: "Consumables" },
    { value: "tools", label: "Tools" },
    { value: "equipment", label: "Equipment" },
    { value: "materials", label: "Materials" },
  ]

  const statuses = [
    { value: "available", label: "Available" },
    { value: "ordered", label: "Ordered" },
    { value: "delivered", label: "Delivered" },
    { value: "in-use", label: "In Use" },
    { value: "consumed", label: "Consumed" },
    { value: "returned", label: "Returned" },
  ]

  const units = [
    { value: "pcs", label: "Pieces" },
    { value: "kg", label: "Kilograms" },
    { value: "m", label: "Meters" },
    { value: "l", label: "Liters" },
    { value: "box", label: "Boxes" },
    { value: "set", label: "Sets" },
    { value: "roll", label: "Rolls" },
    { value: "pack", label: "Packs" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{material ? "Edit Material" : "Add New Material"}</DialogTitle>
          <DialogDescription>
            {material ? "Update material information" : "Add a new material to your project"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Material Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter material name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter material description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            <Select
              value={formData.projectId}
              onValueChange={(value) => setFormData({ ...formData, projectId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number.parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minQuantity">Min Quantity</Label>
              <Input
                id="minQuantity"
                type="number"
                min="0"
                step="0.01"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitCost">Unit Cost ($)</Label>
              <Input
                id="unitCost"
                type="number"
                min="0"
                step="0.01"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalCost">Total Cost ($)</Label>
              <Input id="totalCost" type="number" value={formData.totalCost} readOnly className="bg-gray-50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Enter supplier name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter storage location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes or comments"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{material ? "Update Material" : "Add Material"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

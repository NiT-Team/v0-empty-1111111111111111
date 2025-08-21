"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { InventoryItem } from "@/types"

interface InventoryFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: InventoryItem) => void
  item?: InventoryItem
}

export default function InventoryFormModal({ isOpen, onClose, onSave, item }: InventoryFormModalProps) {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: item?.name || "",
    description: item?.description || "",
    category: item?.category || "spare-parts",
    sku: item?.sku || "",
    partNumber: item?.partNumber || "",
    barcode: item?.barcode || "",
    quantity: item?.quantity || 0,
    minQuantity: item?.minQuantity || 0,
    maxQuantity: item?.maxQuantity || 0,
    unitCost: item?.unitCost || 0,
    supplier: item?.supplier || "",
    vendor: item?.vendor || "",
    location: item?.location || "",
    status: item?.status || "in-stock",
    purchaseDate: item?.purchaseDate || "",
    expiryDate: item?.expiryDate || "",
    warrantyExpiry: item?.warrantyExpiry || "",
    notes: item?.notes || "",
    reorderLevel: item?.reorderLevel || 0,
    reorderQuantity: item?.reorderQuantity || 0,
    model: item?.model || "",
  })

  const [activeTab, setActiveTab] = useState("basic")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const totalValue = (formData.quantity || 0) * (formData.unitCost || 0)

    const newItem: InventoryItem = {
      id: item?.id || Date.now(),
      name: formData.name || "",
      description: formData.description || "",
      category: formData.category || "spare-parts",
      sku: formData.sku || "",
      partNumber: formData.partNumber || "",
      barcode: formData.barcode || "",
      quantity: formData.quantity || 0,
      minQuantity: formData.minQuantity || 0,
      maxQuantity: formData.maxQuantity || 0,
      unitCost: formData.unitCost || 0,
      totalValue: totalValue,
      supplier: formData.supplier || "",
      vendor: formData.vendor || "",
      location: formData.location || "",
      status: formData.status || "in-stock",
      purchaseDate: formData.purchaseDate || "",
      expiryDate: formData.expiryDate || "",
      warrantyExpiry: formData.warrantyExpiry || "",
      notes: formData.notes || "",
      reorderLevel: formData.reorderLevel || 0,
      reorderQuantity: formData.reorderQuantity || 0,
      model: formData.model || "",
      createdAt: item?.createdAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      updatedBy: "current-user", // This would come from auth context in real app
    }

    onSave(newItem)
    onClose()
  }

  const handleInputChange = (field: keyof InventoryItem, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {item ? "Edit Inventory Item" : "Add New Inventory Item"}
          </DialogTitle>
        </DialogHeader>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "basic", label: "Basic Info", icon: "fas fa-info-circle" },
              { id: "inventory", label: "Inventory Details", icon: "fas fa-boxes" },
              { id: "financial", label: "Financial", icon: "fas fa-dollar-sign" },
              { id: "additional", label: "Additional", icon: "fas fa-cog" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === "basic" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="spare-parts">Spare Parts</option>
                  <option value="consumables">Consumables</option>
                  <option value="tools">Tools</option>
                  <option value="equipment">Equipment</option>
                  <option value="software">Software</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Part Number</label>
                <input
                  type="text"
                  value={formData.partNumber}
                  onChange={(e) => handleInputChange("partNumber", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => handleInputChange("barcode", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                  <option value="on-order">On Order</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", Number.parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Quantity</label>
                <input
                  type="number"
                  value={formData.minQuantity}
                  onChange={(e) => handleInputChange("minQuantity", Number.parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Quantity</label>
                <input
                  type="number"
                  value={formData.maxQuantity}
                  onChange={(e) => handleInputChange("maxQuantity", Number.parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                <input
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => handleInputChange("reorderLevel", Number.parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Quantity</label>
                <input
                  type="number"
                  value={formData.reorderQuantity}
                  onChange={(e) => handleInputChange("reorderQuantity", Number.parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="e.g., Warehouse A, Shelf B2"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {activeTab === "financial" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unitCost}
                  onChange={(e) => handleInputChange("unitCost", Number.parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Value</label>
                <input
                  type="text"
                  value={`$${((formData.quantity || 0) * (formData.unitCost || 0)).toFixed(2)}`}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange("supplier", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => handleInputChange("vendor", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {activeTab === "additional" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expiry</label>
                <input
                  type="date"
                  value={formData.warrantyExpiry}
                  onChange={(e) => handleInputChange("warrantyExpiry", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes, maintenance instructions, etc."
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {item ? "Update Item" : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import type { InventoryItem, User } from "@/types"
import InventoryFormModal from "@/components/forms/inventory-form-modal"

interface InventoryViewProps {
  inventoryItems: InventoryItem[]
  setInventoryItems: (items: InventoryItem[]) => void
  user: User
}

export default function InventoryView({ inventoryItems, setInventoryItems, user }: InventoryViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>(undefined)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partNumber?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    const matchesStatus = statusFilter === "all" || item.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleAddItem = () => {
    setEditingItem(undefined)
    setIsModalOpen(true)
  }

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleSaveItem = (item: InventoryItem) => {
    if (editingItem) {
      // Update existing item
      const updatedItems = inventoryItems.map((i) => (i.id === item.id ? item : i))
      setInventoryItems(updatedItems)
      localStorage.setItem("infonit_inventory", JSON.stringify(updatedItems))
    } else {
      // Add new item
      const newItems = [...inventoryItems, item]
      setInventoryItems(newItems)
      localStorage.setItem("infonit_inventory", JSON.stringify(newItems))
    }
  }

  const handleDeleteItem = (itemId: number) => {
    if (confirm("Are you sure you want to delete this inventory item?")) {
      const updatedItems = inventoryItems.filter((i) => i.id !== itemId)
      setInventoryItems(updatedItems)
      localStorage.setItem("infonit_inventory", JSON.stringify(updatedItems))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-stock":
        return "bg-green-100 text-green-800"
      case "low-stock":
        return "bg-yellow-100 text-yellow-800"
      case "out-of-stock":
        return "bg-red-100 text-red-800"
      case "discontinued":
        return "bg-gray-100 text-gray-800"
      case "on-order":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "spare-parts":
        return "fas fa-cog"
      case "consumables":
        return "fas fa-shopping-cart"
      case "tools":
        return "fas fa-tools"
      case "equipment":
        return "fas fa-desktop"
      case "software":
        return "fas fa-code"
      default:
        return "fas fa-box"
    }
  }

  const lowStockItems = inventoryItems.filter(
    (item) => item.status === "low-stock" || item.status === "out-of-stock",
  ).length

  const totalValue = inventoryItems.reduce((sum, item) => sum + (item.totalValue || 0), 0)

  return (
    <div>
      {/* Header Section */}
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-6">
        <div className="flex items-center mb-4 lg:mb-0">
          <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
          <span className="ml-3 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {filteredItems.length} items
          </span>
          {lowStockItems > 0 && (
            <span className="ml-2 bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {lowStockItems} low stock
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search inventory..."
              className="pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>

          <button
            onClick={handleAddItem}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md flex items-center"
          >
            <i className="fas fa-plus mr-2"></i> Add Item
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-2 mr-3">
              <i className="fas fa-boxes text-blue-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-xl font-semibold">{inventoryItems.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-2 mr-3">
              <i className="fas fa-check-circle text-green-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">In Stock</p>
              <p className="text-xl font-semibold">
                {inventoryItems.filter((item) => item.status === "in-stock").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-lg p-2 mr-3">
              <i className="fas fa-exclamation-triangle text-yellow-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-xl font-semibold">{lowStockItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-lg p-2 mr-3">
              <i className="fas fa-dollar-sign text-purple-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-xl font-semibold">${totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="spare-parts">Spare Parts</option>
          <option value="consumables">Consumables</option>
          <option value="tools">Tools</option>
          <option value="equipment">Equipment</option>
          <option value="software">Software</option>
          <option value="other">Other</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
          <option value="on-order">On Order</option>
          <option value="discontinued">Discontinued</option>
        </select>

        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-2 ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
          >
            <i className="fas fa-th"></i>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-2 ${viewMode === "table" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
          >
            <i className="fas fa-list"></i>
          </button>
        </div>
      </div>

      {/* Content */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <i className="fas fa-boxes text-gray-400 text-3xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No inventory items found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by adding your first inventory item"}
          </p>
          {!searchTerm && categoryFilter === "all" && statusFilter === "all" && (
            <button
              onClick={handleAddItem}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md"
            >
              <i className="fas fa-plus mr-2"></i> Add Your First Item
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-100 rounded-lg p-2">
                  <i className={`${getCategoryIcon(item.category)} text-blue-600`}></i>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status.replace("-", " ")}
                </span>
              </div>

              <h3 className="font-semibold text-gray-800 mb-2">{item.name}</h3>
              <p className="text-sm text-gray-600 mb-1">{item.description}</p>
              <p className="text-sm text-gray-500 mb-3">{item.category.replace("-", " ")}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Quantity:</span>
                  <span className="font-medium">{item.quantity}</span>
                </div>
                {item.unitCost && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Unit Cost:</span>
                    <span className="font-medium">${item.unitCost}</span>
                  </div>
                )}
                {item.location && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Location:</span>
                    <span className="font-medium">{item.location}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{item.supplier || "No supplier"}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit Item"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete Item"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-lg p-2 mr-3">
                        <i className={`${getCategoryIcon(item.category)} text-blue-600`}></i>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.sku || item.partNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.category.replace("-", " ")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.replace("-", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.location || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit Item"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Item"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <InventoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        item={editingItem}
      />
    </div>
  )
}

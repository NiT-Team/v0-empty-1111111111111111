"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Asset } from "@/types"

interface AssetFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (asset: Asset) => void
  asset?: Asset
}

export default function AssetFormModal({ isOpen, onClose, onSave, asset }: AssetFormModalProps) {
  const [formData, setFormData] = useState<Partial<Asset>>({
    name: asset?.name || "",
    type: asset?.type || "",
    vendor: asset?.vendor || "",
    category: asset?.category || "",
    version: asset?.version || "",
    licenseKey: asset?.licenseKey || "",
    purchaseDate: asset?.purchaseDate || "",
    expiryDate: asset?.expiryDate || "",
    cost: asset?.cost || "",
    status: asset?.status || "Active",
    assignedTo: asset?.assignedTo || "",
    description: asset?.description || "",
    supportContact: asset?.supportContact || "",
    renewalDate: asset?.renewalDate || "",
    maxUsers: asset?.maxUsers || "",
  })

  const [activeTab, setActiveTab] = useState("basic")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newAsset: Asset = {
      id: asset?.id || Date.now().toString(),
      name: formData.name || "",
      type: formData.type || "",
      vendor: formData.vendor || "",
      category: formData.category || "",
      version: formData.version || "",
      licenseKey: formData.licenseKey || "",
      purchaseDate: formData.purchaseDate || "",
      expiryDate: formData.expiryDate || "",
      cost: formData.cost || "",
      status: formData.status || "Active",
      assignedTo: formData.assignedTo || "",
      description: formData.description || "",
      supportContact: formData.supportContact || "",
      renewalDate: formData.renewalDate || "",
      maxUsers: formData.maxUsers || "",
      createdAt: asset?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onSave(newAsset)
    onClose()
  }

  const handleInputChange = (field: keyof Asset, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{asset ? "Edit Asset" : "Add New Asset"}</DialogTitle>
        </DialogHeader>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "basic", label: "Basic Info", icon: "fas fa-info-circle" },
              { id: "license", label: "License Details", icon: "fas fa-key" },
              { id: "financial", label: "Financial", icon: "fas fa-dollar-sign" },
              { id: "support", label: "Support", icon: "fas fa-headset" },
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Software">Software</option>
                  <option value="License">License</option>
                  <option value="Subscription">Subscription</option>
                  <option value="Cloud Service">Cloud Service</option>
                  <option value="Digital Certificate">Digital Certificate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor *</label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => handleInputChange("vendor", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Security">Security</option>
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Communication">Communication</option>
                  <option value="Analytics">Analytics</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => handleInputChange("version", e.target.value)}
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
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Expiring Soon">Expiring Soon</option>
                  <option value="Inactive">Inactive</option>
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

          {activeTab === "license" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Key</label>
                <input
                  type="text"
                  value={formData.licenseKey}
                  onChange={(e) => handleInputChange("licenseKey", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Users</label>
                <input
                  type="number"
                  value={formData.maxUsers}
                  onChange={(e) => handleInputChange("maxUsers", e.target.value)}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Renewal Date</label>
                <input
                  type="date"
                  value={formData.renewalDate}
                  onChange={(e) => handleInputChange("renewalDate", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => handleInputChange("assignedTo", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {activeTab === "financial" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                <input
                  type="text"
                  value={formData.cost}
                  onChange={(e) => handleInputChange("cost", e.target.value)}
                  placeholder="$0.00"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {activeTab === "support" && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Support Contact</label>
                <input
                  type="text"
                  value={formData.supportContact}
                  onChange={(e) => handleInputChange("supportContact", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {asset ? "Update Asset" : "Add Asset"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

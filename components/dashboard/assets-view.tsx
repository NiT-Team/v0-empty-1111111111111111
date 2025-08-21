"use client"

import { useState } from "react"
import type { Asset, User } from "@/types"
import AssetFormModal from "@/components/forms/asset-form-modal"

interface AssetsViewProps {
  assets: Asset[]
  setAssets: (assets: Asset[]) => void
  user: User
}

export default function AssetsView({ assets, setAssets, user }: AssetsViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>(undefined)

  const filteredAssets = assets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.vendor.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddAsset = () => {
    setEditingAsset(undefined)
    setIsModalOpen(true)
  }

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset)
    setIsModalOpen(true)
  }

  const handleSaveAsset = (asset: Asset) => {
    if (editingAsset) {
      // Update existing asset
      const updatedAssets = assets.map((a) => (a.id === asset.id ? asset : a))
      setAssets(updatedAssets)
      localStorage.setItem("infonit_assets", JSON.stringify(updatedAssets))
    } else {
      // Add new asset
      const newAssets = [...assets, asset]
      setAssets(newAssets)
      localStorage.setItem("infonit_assets", JSON.stringify(newAssets))
    }
  }

  const handleDeleteAsset = (assetId: string) => {
    if (confirm("Are you sure you want to delete this asset?")) {
      const updatedAssets = assets.filter((a) => a.id !== assetId)
      setAssets(updatedAssets)
      localStorage.setItem("infonit_assets", JSON.stringify(updatedAssets))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "expiring soon":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-6">
        <div className="flex items-center mb-4 lg:mb-0">
          <h2 className="text-2xl font-bold text-gray-800">Digital Assets</h2>
          <span className="ml-3 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {filteredAssets.length} items
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search assets..."
              className="pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>

          <button
            onClick={handleAddAsset}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md flex items-center"
          >
            <i className="fas fa-plus mr-2"></i> Add Asset
          </button>
        </div>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <i className="fas fa-cube text-gray-400 text-3xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No digital assets found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first digital asset"}
          </p>
          {!searchTerm && (
            <button
              onClick={handleAddAsset}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md"
            >
              <i className="fas fa-plus mr-2"></i> Add Your First Asset
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-purple-100 rounded-lg p-2">
                  <i className="fas fa-cube text-purple-600"></i>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                  {asset.status}
                </span>
              </div>

              <h3 className="font-semibold text-gray-800 mb-2">{asset.name}</h3>
              <p className="text-sm text-gray-600 mb-1">{asset.vendor}</p>
              <p className="text-sm text-gray-500 mb-3">{asset.type}</p>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{asset.category}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditAsset(asset)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit Asset"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDeleteAsset(asset.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete Asset"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AssetFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAsset}
        asset={editingAsset}
      />
    </div>
  )
}

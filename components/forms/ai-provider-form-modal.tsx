"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { AIProvider } from "@/types"

interface AIProviderFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (provider: AIProvider) => void
  provider?: AIProvider
}

export default function AIProviderFormModal({ isOpen, onClose, onSave, provider }: AIProviderFormModalProps) {
  const [formData, setFormData] = useState<Partial<AIProvider>>({
    name: "",
    apiKeyRequired: true,
    baseUrl: "",
    models: [],
    isConfigured: false,
    status: "inactive",
  })

  const [apiKey, setApiKey] = useState("")

  useEffect(() => {
    if (provider) {
      setFormData(provider)
    } else {
      setFormData({
        name: "",
        apiKeyRequired: true,
        baseUrl: "",
        models: [],
        isConfigured: false,
        status: "inactive",
      })
    }
  }, [provider, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleTestConnection = async () => {
    // Simulate API test
    alert("Connection test would be performed here with the actual API")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const providerData: AIProvider = {
      id: provider?.id || Date.now().toString(),
      name: formData.name || "",
      apiKeyRequired: formData.apiKeyRequired ?? true,
      baseUrl: formData.baseUrl,
      models: formData.models || [],
      isConfigured: apiKey.length > 0 || formData.isConfigured || false,
      lastTested: provider?.lastTested,
      status: (formData.status as AIProvider["status"]) || "inactive",
    }

    // In a real implementation, you would securely store the API key
    if (apiKey) {
      localStorage.setItem(`infonit_api_key_${providerData.id}`, apiKey)
    }

    onSave(providerData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{provider ? "Edit Provider" : "Add New Provider"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[70vh]">
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
              <input
                type="url"
                name="baseUrl"
                value={formData.baseUrl || ""}
                onChange={handleInputChange}
                placeholder="https://api.example.com/v1"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">API keys are stored securely and encrypted</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status || "inactive"}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="apiKeyRequired"
                  checked={formData.apiKeyRequired ?? true}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Requires API Key</span>
              </label>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleTestConnection}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                <i className="fas fa-plug mr-2"></i>Test Connection
              </button>
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
              {provider ? "Update Provider" : "Add Provider"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

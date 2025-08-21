"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { AIModel, AIProvider } from "@/types"

interface AIModelFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (model: AIModel) => void
  model?: AIModel
  providers: AIProvider[]
}

export default function AIModelFormModal({ isOpen, onClose, onSave, model, providers }: AIModelFormModalProps) {
  const [formData, setFormData] = useState<Partial<AIModel>>({
    name: "",
    provider: "openai",
    modelId: "",
    description: "",
    maxTokens: 4000,
    costPer1kTokens: 0.002,
    capabilities: [],
    isActive: true,
    requiresApiKey: true,
    parameters: {
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    },
  })

  const [capabilityInput, setCapabilityInput] = useState("")

  useEffect(() => {
    if (model) {
      setFormData(model)
    } else {
      setFormData({
        name: "",
        provider: "openai",
        modelId: "",
        description: "",
        maxTokens: 4000,
        costPer1kTokens: 0.002,
        capabilities: [],
        isActive: true,
        requiresApiKey: true,
        parameters: {
          temperature: 0.7,
          maxTokens: 2000,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0,
        },
      })
    }
  }, [model, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof AIModel],
          [child]: type === "number" ? Number.parseFloat(value) : value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "number"
            ? Number.parseFloat(value)
            : type === "checkbox"
              ? (e.target as HTMLInputElement).checked
              : value,
      }))
    }
  }

  const handleAddCapability = () => {
    if (capabilityInput.trim() && !formData.capabilities?.includes(capabilityInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        capabilities: [...(prev.capabilities || []), capabilityInput.trim()],
      }))
      setCapabilityInput("")
    }
  }

  const handleRemoveCapability = (capability: string) => {
    setFormData((prev) => ({
      ...prev,
      capabilities: prev.capabilities?.filter((cap) => cap !== capability) || [],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const modelData: AIModel = {
      id: model?.id || Date.now().toString(),
      name: formData.name || "",
      provider: (formData.provider as AIModel["provider"]) || "openai",
      modelId: formData.modelId || "",
      description: formData.description,
      maxTokens: formData.maxTokens || 4000,
      costPer1kTokens: formData.costPer1kTokens,
      capabilities: formData.capabilities || [],
      isActive: formData.isActive ?? true,
      apiEndpoint: formData.apiEndpoint,
      requiresApiKey: formData.requiresApiKey ?? true,
      parameters: formData.parameters,
    }

    onSave(modelData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{model ? "Edit AI Model" : "Add New AI Model"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[70vh]">
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Name *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
                <select
                  name="provider"
                  value={formData.provider || "openai"}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model ID *</label>
                <input
                  type="text"
                  name="modelId"
                  value={formData.modelId || ""}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., gpt-4, claude-3-opus"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                <input
                  type="number"
                  name="maxTokens"
                  value={formData.maxTokens || 4000}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost per 1K Tokens ($)</label>
                <input
                  type="number"
                  name="costPer1kTokens"
                  value={formData.costPer1kTokens || 0}
                  onChange={handleInputChange}
                  step="0.001"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Endpoint</label>
                <input
                  type="url"
                  name="apiEndpoint"
                  value={formData.apiEndpoint || ""}
                  onChange={handleInputChange}
                  placeholder="Custom API endpoint (optional)"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the model..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capabilities</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={capabilityInput}
                  onChange={(e) => setCapabilityInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCapability())}
                  placeholder="Add a capability..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddCapability}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.capabilities?.map((capability, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {capability}
                    <button
                      type="button"
                      onClick={() => handleRemoveCapability(capability)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive ?? true}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="requiresApiKey"
                  checked={formData.requiresApiKey ?? true}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Requires API Key</span>
              </label>
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
              {model ? "Update Model" : "Add Model"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

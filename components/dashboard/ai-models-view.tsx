"use client"

import { useState } from "react"
import type { AIModel, AIProvider, User } from "@/types"
import AIModelFormModal from "@/components/forms/ai-model-form-modal"
import AIProviderFormModal from "@/components/forms/ai-provider-form-modal"

interface AIModelsViewProps {
  aiModels: AIModel[]
  setAIModels: (models: AIModel[]) => void
  aiProviders: AIProvider[]
  setAIProviders: (providers: AIProvider[]) => void
  user: User
}

export default function AIModelsView({ aiModels, setAIModels, aiProviders, setAIProviders, user }: AIModelsViewProps) {
  const [activeTab, setActiveTab] = useState("models")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterProvider, setFilterProvider] = useState<string>("all")
  const [isModelModalOpen, setIsModelModalOpen] = useState(false)
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<AIModel | undefined>(undefined)
  const [editingProvider, setEditingProvider] = useState<AIProvider | undefined>(undefined)
  const [testingModel, setTestingModel] = useState<string | null>(null)

  const filteredModels = aiModels.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProvider = filterProvider === "all" || model.provider === filterProvider
    return matchesSearch && matchesProvider
  })

  const handleAddModel = () => {
    setEditingModel(undefined)
    setIsModelModalOpen(true)
  }

  const handleEditModel = (model: AIModel) => {
    setEditingModel(model)
    setIsModelModalOpen(true)
  }

  const handleSaveModel = (model: AIModel) => {
    if (editingModel) {
      const updatedModels = aiModels.map((m) => (m.id === model.id ? model : m))
      setAIModels(updatedModels)
      localStorage.setItem("infonit_ai_models", JSON.stringify(updatedModels))
    } else {
      const newModels = [...aiModels, model]
      setAIModels(newModels)
      localStorage.setItem("infonit_ai_models", JSON.stringify(newModels))
    }
  }

  const handleDeleteModel = (modelId: string) => {
    if (confirm("Are you sure you want to delete this AI model?")) {
      const updatedModels = aiModels.filter((m) => m.id !== modelId)
      setAIModels(updatedModels)
      localStorage.setItem("infonit_ai_models", JSON.stringify(updatedModels))
    }
  }

  const handleAddProvider = () => {
    setEditingProvider(undefined)
    setIsProviderModalOpen(true)
  }

  const handleEditProvider = (provider: AIProvider) => {
    setEditingProvider(provider)
    setIsProviderModalOpen(true)
  }

  const handleSaveProvider = (provider: AIProvider) => {
    if (editingProvider) {
      const updatedProviders = aiProviders.map((p) => (p.id === provider.id ? provider : p))
      setAIProviders(updatedProviders)
      localStorage.setItem("infonit_ai_providers", JSON.stringify(updatedProviders))
    } else {
      const newProviders = [...aiProviders, provider]
      setAIProviders(newProviders)
      localStorage.setItem("infonit_ai_providers", JSON.stringify(newProviders))
    }
  }

  const handleTestModel = async (modelId: string) => {
    setTestingModel(modelId)
    // Simulate API test
    setTimeout(() => {
      setTestingModel(null)
      alert("Model test completed successfully!")
    }, 2000)
  }

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "openai":
        return "bg-green-100 text-green-800"
      case "anthropic":
        return "bg-purple-100 text-purple-800"
      case "google":
        return "bg-blue-100 text-blue-800"
      case "custom":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-6">
        <div className="flex items-center mb-4 lg:mb-0">
          <h2 className="text-2xl font-bold text-gray-800">AI Configuration</h2>
          <span className="ml-3 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {activeTab === "models" ? `${filteredModels.length} models` : `${aiProviders.length} providers`}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {activeTab === "models" && (
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Providers</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google</option>
              <option value="custom">Custom</option>
            </select>
          )}

          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>

          <button
            onClick={activeTab === "models" ? handleAddModel : handleAddProvider}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md flex items-center"
          >
            <i className="fas fa-plus mr-2"></i>
            Add {activeTab === "models" ? "Model" : "Provider"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("models")}
          className={`px-6 py-3 font-medium ${
            activeTab === "models" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <i className="fas fa-robot mr-2"></i>AI Models
        </button>
        <button
          onClick={() => setActiveTab("providers")}
          className={`px-6 py-3 font-medium ${
            activeTab === "providers" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <i className="fas fa-cloud mr-2"></i>Providers
        </button>
      </div>

      {activeTab === "models" ? (
        filteredModels.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <i className="fas fa-robot text-gray-400 text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No AI models found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first AI model"}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddModel}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md"
              >
                <i className="fas fa-plus mr-2"></i> Add Your First Model
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredModels.map((model) => (
              <div key={model.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <i className="fas fa-robot text-blue-600"></i>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProviderColor(model.provider)}`}>
                      {model.provider}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${model.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {model.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-800 mb-1">{model.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{model.modelId}</p>
                {model.description && <p className="text-sm text-gray-500 mb-3">{model.description}</p>}

                <div className="space-y-1 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Max Tokens:</span>
                    <span className="font-medium">{model.maxTokens.toLocaleString()}</span>
                  </div>
                  {model.costPer1kTokens && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Cost/1K tokens:</span>
                      <span className="font-medium">${model.costPer1kTokens}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleTestModel(model.id)}
                      disabled={testingModel === model.id}
                      className="text-green-600 hover:text-green-800 disabled:text-gray-400"
                      title="Test Model"
                    >
                      {testingModel === model.id ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-play"></i>
                      )}
                    </button>
                    <button
                      onClick={() => handleEditModel(model)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit Model"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteModel(model.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete Model"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {aiProviders.map((provider) => (
            <div key={provider.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-purple-100 rounded-lg p-2">
                  <i className="fas fa-cloud text-purple-600"></i>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(provider.status)}`}>
                  {provider.status}
                </span>
              </div>

              <h3 className="font-semibold text-gray-800 mb-2">{provider.name}</h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Models:</span>
                  <span className="font-medium">{provider.models.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">API Key:</span>
                  <span className={`font-medium ${provider.isConfigured ? "text-green-600" : "text-red-600"}`}>
                    {provider.isConfigured ? "Configured" : "Missing"}
                  </span>
                </div>
                {provider.lastTested && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Tested:</span>
                    <span className="font-medium">{new Date(provider.lastTested).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditProvider(provider)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit Provider"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AIModelFormModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        onSave={handleSaveModel}
        model={editingModel}
        providers={aiProviders}
      />

      <AIProviderFormModal
        isOpen={isProviderModalOpen}
        onClose={() => setIsProviderModalOpen(false)}
        onSave={handleSaveProvider}
        provider={editingProvider}
      />
    </div>
  )
}

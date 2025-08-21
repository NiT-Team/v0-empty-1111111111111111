"use client"

import { useState, useRef, useEffect } from "react"
import type { AIChatSession, AIChatMessage, AIModel, User } from "@/types"

interface AIChatViewProps {
  chatSessions: AIChatSession[]
  setChatSessions: (sessions: AIChatSession[]) => void
  aiModels: AIModel[]
  user: User
}

export default function AIChatView({ chatSessions, setChatSessions, aiModels, user }: AIChatViewProps) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModelId, setSelectedModelId] = useState<string>(aiModels[0]?.id || "")
  const [showSettings, setShowSettings] = useState(false)
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(2000)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const activeChat = chatSessions.find((session) => session.id === activeChatId)
  const selectedModel = aiModels.find((model) => model.id === selectedModelId)

  const filteredSessions = chatSessions.filter(
    (session) =>
      searchQuery === "" ||
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.messages.some((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  useEffect(() => {
    if (chatSessions.length > 0 && !activeChatId) {
      setActiveChatId(chatSessions[0].id)
    }
  }, [chatSessions, activeChatId])

  useEffect(() => {
    scrollToBottom()
  }, [activeChat?.messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px"
    }
  }, [message])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleCreateNewChat = () => {
    const chatCount = chatSessions.length + 1
    const newChat: AIChatSession = {
      id: Date.now().toString(),
      title: `Chat ${chatCount}`,
      modelId: selectedModelId,
      userId: user.username,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      settings: {
        temperature,
        maxTokens,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        autoSave: true,
        showTokenCount: true,
        showCost: true,
      },
      totalTokens: 0,
      totalCost: 0,
    }

    const updatedSessions = [...chatSessions, newChat]
    setChatSessions(updatedSessions)
    localStorage.setItem("infonit_ai_chats", JSON.stringify(updatedSessions))
    setActiveChatId(newChat.id)
  }

  const handleSendMessage = async (messageContent?: string) => {
    const contentToSend = messageContent || message.trim()
    if (!contentToSend || !activeChat || isLoading || !selectedModel) return

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      sessionId: activeChat.id,
      role: "user",
      content: contentToSend,
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...activeChat.messages, userMessage]
    let updatedChat = { ...activeChat, messages: updatedMessages, updatedAt: new Date().toISOString() }

    if (activeChat.messages.length === 0 && contentToSend.length > 0) {
      const title = contentToSend.length > 50 ? contentToSend.substring(0, 47) + "..." : contentToSend
      updatedChat = { ...updatedChat, title }
    }

    const updatedSessions = chatSessions.map((session) => (session.id === activeChat.id ? updatedChat : session))
    setChatSessions(updatedSessions)
    localStorage.setItem("infonit_ai_chats", JSON.stringify(updatedSessions))

    setMessage("")
    setIsLoading(true)
    setIsTyping(true)
    setError(null)

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: updatedMessages,
          settings: {
            temperature,
            maxTokens,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0,
            systemPrompt: activeChat.settings?.systemPrompt,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get AI response")
      }

      const data = await response.json()

      const aiMessage: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        sessionId: activeChat.id,
        role: "assistant",
        content: data.content,
        timestamp: data.timestamp,
        tokens: data.tokens,
        cost: data.cost,
      }

      const finalMessages = [...updatedMessages, aiMessage]
      const finalChat = {
        ...updatedChat,
        messages: finalMessages,
        updatedAt: new Date().toISOString(),
        totalTokens: (updatedChat.totalTokens || 0) + data.tokens,
        totalCost: (updatedChat.totalCost || 0) + data.cost,
      }
      const finalSessions = chatSessions.map((session) => (session.id === activeChat.id ? finalChat : session))
      setChatSessions(finalSessions)
      localStorage.setItem("infonit_ai_chats", JSON.stringify(finalSessions))
    } catch (error) {
      console.error("AI Chat error:", error)
      setError(error instanceof Error ? error.message : "An error occurred while sending the message")
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId)
    setEditingContent(content)
  }

  const handleSaveEdit = () => {
    if (!activeChat || !editingMessageId) return

    const updatedMessages = activeChat.messages.map((msg) =>
      msg.id === editingMessageId ? { ...msg, content: editingContent } : msg,
    )

    const updatedChat = { ...activeChat, messages: updatedMessages, updatedAt: new Date().toISOString() }
    const updatedSessions = chatSessions.map((session) => (session.id === activeChat.id ? updatedChat : session))

    setChatSessions(updatedSessions)
    localStorage.setItem("infonit_ai_chats", JSON.stringify(updatedSessions))
    setEditingMessageId(null)
    setEditingContent("")
  }

  const handleRegenerateResponse = async (messageIndex: number) => {
    if (!activeChat || messageIndex === 0) return

    const messagesUpToPoint = activeChat.messages.slice(0, messageIndex)
    const lastUserMessage = messagesUpToPoint[messagesUpToPoint.length - 1]

    if (lastUserMessage?.role === "user") {
      const updatedChat = { ...activeChat, messages: messagesUpToPoint }
      const updatedSessions = chatSessions.map((session) => (session.id === activeChat.id ? updatedChat : session))
      setChatSessions(updatedSessions)

      await handleSendMessage(lastUserMessage.content)
    }
  }

  const handleExportChat = () => {
    if (!activeChat) return

    const exportData = {
      title: activeChat.title,
      model: selectedModel?.name,
      createdAt: activeChat.createdAt,
      messages: activeChat.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
      totalTokens: activeChat.totalTokens,
      totalCost: activeChat.totalCost,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${activeChat.title.replace(/[^a-z0-9]/gi, "_")}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDeleteChat = (chatId: string) => {
    if (confirm("Are you sure you want to delete this chat?")) {
      const updatedSessions = chatSessions.filter((session) => session.id !== chatId)
      setChatSessions(updatedSessions)
      localStorage.setItem("infonit_ai_chats", JSON.stringify(updatedSessions))

      if (activeChatId === chatId) {
        setActiveChatId(updatedSessions.length > 0 ? updatedSessions[0].id : null)
      }
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatMessageContent = (content: string) => {
    return content.split("\n").map((line, index) => (
      <div key={index} className={line.trim() === "" ? "h-2" : ""}>
        {line.startsWith("```") ? (
          <code className="block bg-gray-800 text-green-400 p-2 rounded text-sm font-mono overflow-x-auto">
            {line.replace(/```\w*/, "")}
          </code>
        ) : line.startsWith("`") && line.endsWith("`") ? (
          <code className="bg-gray-200 px-1 rounded text-sm font-mono">{line.slice(1, -1)}</code>
        ) : (
          <span>{line}</span>
        )}
      </div>
    ))
  }

  return (
    <div className="flex h-[calc(100vh-200px)]">
      {/* Chat Sessions Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">AI Chat</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="text-gray-500 hover:text-gray-700 p-1"
                title="Search chats"
              >
                <i className="fas fa-search"></i>
              </button>
              <button
                onClick={handleCreateNewChat}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium"
              >
                <i className="fas fa-plus mr-1"></i> New Chat
              </button>
            </div>
          </div>

          {showSearch && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          )}

          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {aiModels
              .filter((model) => model.isActive)
              .map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </option>
              ))}
          </select>

          {selectedModel && (
            <div className="mt-2 text-xs text-gray-500">
              Max tokens: {selectedModel.maxTokens.toLocaleString()}
              {selectedModel.costPer1kTokens && (
                <span className="ml-2">• ${selectedModel.costPer1kTokens}/1K tokens</span>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <i className="fas fa-comments text-3xl mb-2"></i>
              <p>{searchQuery ? "No matching chats" : "No chats yet"}</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setActiveChatId(session.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    activeChatId === session.id ? "bg-blue-100 border-l-4 border-blue-500" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm truncate">{session.title}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteChat(session.id)
                      }}
                      className="text-gray-400 hover:text-red-500 text-xs"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{session.messages.length} messages</p>
                  <p className="text-xs text-gray-400">{new Date(session.updatedAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{activeChat.title}</h3>
                  <p className="text-sm text-gray-500">
                    Model: {selectedModel?.name} • {activeChat.messages.length} messages
                    {activeChat.totalTokens && (
                      <span className="ml-2">• {activeChat.totalTokens.toLocaleString()} tokens</span>
                    )}
                    {activeChat.totalCost && <span className="ml-2">• ${activeChat.totalCost.toFixed(4)} cost</span>}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleExportChat}
                    className="text-gray-500 hover:text-gray-700 p-2"
                    title="Export chat"
                  >
                    <i className="fas fa-download"></i>
                  </button>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-gray-500 hover:text-gray-700 p-2"
                  >
                    <i className="fas fa-cog"></i>
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm flex items-center justify-between">
                  <div>
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    {error}
                  </div>
                  <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 ml-2">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeChat.messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-blue-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <i className="fas fa-robot text-blue-600 text-3xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Start a conversation</h3>
                  <p className="text-gray-600">Ask me anything and I'll help you out!</p>
                  {selectedModel && !selectedModel.isActive && (
                    <p className="text-red-600 text-sm mt-2">
                      <i className="fas fa-exclamation-triangle mr-1"></i>
                      Selected model is inactive
                    </p>
                  )}
                </div>
              ) : (
                activeChat.messages.map((msg, index) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} group`}>
                    <div
                      className={`max-w-[70%] rounded-lg p-3 relative ${
                        msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {editingMessageId === msg.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="w-full p-2 border rounded text-gray-800 resize-none"
                            rows={3}
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveEdit}
                              className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingMessageId(null)}
                              className="bg-gray-600 text-white px-2 py-1 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{formatMessageContent(msg.content)}</div>
                      )}

                      <div
                        className={`text-xs mt-2 flex items-center justify-between ${msg.role === "user" ? "text-blue-100" : "text-gray-500"}`}
                      >
                        <div>
                          {formatTimestamp(msg.timestamp)}
                          {msg.tokens && <span className="ml-2">• {msg.tokens} tokens</span>}
                          {msg.cost && <span className="ml-2">• ${msg.cost.toFixed(4)}</span>}
                        </div>
                      </div>

                      <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-lg border p-1 flex space-x-1">
                        <button
                          onClick={() => handleCopyMessage(msg.content)}
                          className="text-gray-500 hover:text-gray-700 p-1 text-xs"
                          title="Copy message"
                        >
                          <i className="fas fa-copy"></i>
                        </button>
                        {msg.role === "user" && (
                          <button
                            onClick={() => handleEditMessage(msg.id, msg.content)}
                            className="text-gray-500 hover:text-gray-700 p-1 text-xs"
                            title="Edit message"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        )}
                        {msg.role === "assistant" && index > 0 && (
                          <button
                            onClick={() => handleRegenerateResponse(index)}
                            className="text-gray-500 hover:text-gray-700 p-1 text-xs"
                            title="Regenerate response"
                          >
                            <i className="fas fa-redo"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[70%]">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-2">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type your message... (Shift+Enter for new line)"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[48px] max-h-[120px]"
                  disabled={isLoading || !selectedModel?.isActive}
                  rows={1}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!message.trim() || isLoading || !selectedModel?.isActive}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium self-end"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
              {selectedModel && !selectedModel.isActive && (
                <p className="text-red-600 text-xs mt-2">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  Selected model is inactive. Please choose an active model.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                <i className="fas fa-robot text-gray-400 text-4xl"></i>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to AI Chat</h3>
              <p className="text-gray-600 mb-6">Create a new chat to start conversing with AI models</p>
              <button
                onClick={handleCreateNewChat}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                <i className="fas fa-plus mr-2"></i> Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Chat Settings</h3>
            <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-700">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Temperature: {temperature}</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(Number.parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Controls randomness. Lower = more focused, Higher = more creative
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Tokens: {maxTokens}</label>
              <input
                type="range"
                min="100"
                max="4000"
                step="100"
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number.parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum length of the AI response</p>
            </div>

            {selectedModel && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Current Model</h4>
                <p className="text-sm text-gray-600">{selectedModel.name}</p>
                <p className="text-xs text-gray-500">{selectedModel.description}</p>
                <p className="text-xs text-gray-500 mt-1">Max tokens: {selectedModel.maxTokens.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  API Key:{" "}
                  {selectedModel.requiresApiKey
                    ? typeof window !== "undefined" && localStorage.getItem(`infonit_api_key_${selectedModel.provider}`)
                      ? "✓ Configured"
                      : "⚠ Missing"
                    : "Not required"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

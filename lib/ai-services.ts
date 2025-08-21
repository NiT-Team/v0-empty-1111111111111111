import type { AIModel, AIChatMessage } from "@/types"

export interface ChatCompletionRequest {
  model: string
  messages: Array<{
    role: "system" | "user" | "assistant"
    content: string
  }>
  temperature?: number
  max_tokens?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
}

export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: "assistant"
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class AIService {
  private static getApiKey(provider: string): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`infonit_api_key_${provider}`)
    }
    return process.env[`${provider.toUpperCase()}_API_KEY`] || null
  }

  static async sendChatMessage(
    model: AIModel,
    messages: AIChatMessage[],
    settings: {
      temperature: number
      maxTokens: number
      topP: number
      frequencyPenalty: number
      presencePenalty: number
      systemPrompt?: string
    },
  ): Promise<{
    content: string
    tokens: number
    cost: number
  }> {
    const apiKey = this.getApiKey(model.provider)
    if (!apiKey) {
      throw new Error(`API key not configured for ${model.provider}`)
    }

    // Convert messages to API format
    const apiMessages = messages.map((msg) => ({
      role: msg.role as "system" | "user" | "assistant",
      content: msg.content,
    }))

    // Add system prompt if provided
    if (settings.systemPrompt) {
      apiMessages.unshift({
        role: "system" as const,
        content: settings.systemPrompt,
      })
    }

    switch (model.provider) {
      case "openai":
        return this.callOpenAI(model, apiMessages, settings, apiKey)
      case "anthropic":
        return this.callAnthropic(model, apiMessages, settings, apiKey)
      case "google":
        return this.callGoogle(model, apiMessages, settings, apiKey)
      case "cohere":
        return this.callCohere(model, apiMessages, settings, apiKey)
      case "mistral":
        return this.callMistral(model, apiMessages, settings, apiKey)
      case "perplexity":
        return this.callPerplexity(model, apiMessages, settings, apiKey)
      case "together":
        return this.callTogether(model, apiMessages, settings, apiKey)
      case "groq":
        return this.callGroq(model, apiMessages, settings, apiKey)
      case "replicate":
        return this.callReplicate(model, apiMessages, settings, apiKey)
      case "huggingface":
        return this.callHuggingFace(model, apiMessages, settings, apiKey)
      case "custom":
        return this.callCustomAPI(model, apiMessages, settings, apiKey)
      default:
        throw new Error(`Unsupported provider: ${model.provider}`)
    }
  }

  private static async callOpenAI(
    model: AIModel,
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    settings: any,
    apiKey: string,
  ) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model.modelId,
        messages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        top_p: settings.topP,
        frequency_penalty: settings.frequencyPenalty,
        presence_penalty: settings.presencePenalty,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`)
    }

    const data: ChatCompletionResponse = await response.json()
    const content = data.choices[0]?.message?.content || ""
    const tokens = data.usage?.total_tokens || 0
    const cost = model.costPer1kTokens ? (tokens / 1000) * model.costPer1kTokens : 0

    return { content, tokens, cost }
  }

  private static async callAnthropic(
    model: AIModel,
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    settings: any,
    apiKey: string,
  ) {
    // Anthropic has a different API format
    const systemMessage = messages.find((m) => m.role === "system")
    const conversationMessages = messages.filter((m) => m.role !== "system")

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model.modelId,
        max_tokens: settings.maxTokens,
        temperature: settings.temperature,
        system: systemMessage?.content,
        messages: conversationMessages,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const content = data.content?.[0]?.text || ""
    const tokens = data.usage?.input_tokens + data.usage?.output_tokens || 0
    const cost = model.costPer1kTokens ? (tokens / 1000) * model.costPer1kTokens : 0

    return { content, tokens, cost }
  }

  private static async callGoogle(
    model: AIModel,
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    settings: any,
    apiKey: string,
  ) {
    // Google AI API implementation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model.modelId}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: messages.map((msg) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
          })),
          generationConfig: {
            temperature: settings.temperature,
            maxOutputTokens: settings.maxTokens,
            topP: settings.topP,
          },
        }),
      },
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Google AI API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    const tokens = data.usageMetadata?.totalTokenCount || 0
    const cost = model.costPer1kTokens ? (tokens / 1000) * model.costPer1kTokens : 0

    return { content, tokens, cost }
  }

  private static async callCustomAPI(
    model: AIModel,
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    settings: any,
    apiKey: string,
  ) {
    if (!model.apiEndpoint) {
      throw new Error("Custom API endpoint not configured")
    }

    const response = await fetch(model.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model.modelId,
        messages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        top_p: settings.topP,
        frequency_penalty: settings.frequencyPenalty,
        presence_penalty: settings.presencePenalty,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Custom API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || data.content || ""
    const tokens = data.usage?.total_tokens || 0
    const cost = model.costPer1kTokens ? (tokens / 1000) * model.costPer1kTokens : 0

    return { content, tokens, cost }
  }

  private static async callCohere(
    model: AIModel,
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    settings: any,
    apiKey: string,
  ) {
    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model.modelId,
        message: messages[messages.length - 1]?.content || "",
        chat_history: messages.slice(0, -1).map((msg) => ({
          role: msg.role === "assistant" ? "CHATBOT" : "USER",
          message: msg.content,
        })),
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        p: settings.topP,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Cohere API error: ${error.message || response.statusText}`)
    }

    const data = await response.json()
    const content = data.text || ""
    const tokens = data.meta?.tokens?.input_tokens + data.meta?.tokens?.output_tokens || 0
    const cost = model.costPer1kTokens ? (tokens / 1000) * model.costPer1kTokens : 0

    return { content, tokens, cost }
  }

  private static async callMistral(
    model: AIModel,
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    settings: any,
    apiKey: string,
  ) {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model.modelId,
        messages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        top_p: settings.topP,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Mistral API error: ${error.message || response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ""
    const tokens = data.usage?.total_tokens || 0
    const cost = model.costPer1kTokens ? (tokens / 1000) * model.costPer1kTokens : 0

    return { content, tokens, cost }
  }

  private static async callPerplexity(
    model: AIModel,
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    settings: any,
    apiKey: string,
  ) {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model.modelId,
        messages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        top_p: settings.topP,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Perplexity API error: ${error.message || response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ""
    const tokens = data.usage?.total_tokens || 0
    const cost = model.costPer1kTokens ? (tokens / 1000) * model.costPer1kTokens : 0

    return { content, tokens, cost }
  }

  private static async callTogether(
    model: AIModel,
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    settings: any,
    apiKey: string,
  ) {
    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model.modelId,
        messages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        top_p: settings.topP,
        frequency_penalty: settings.frequencyPenalty,
        presence_penalty: settings.presencePenalty,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Together API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ""
    const tokens = data.usage?.total_tokens || 0
    const cost = model.costPer1kTokens ? (tokens / 1000) * model.costPer1kTokens : 0

    return { content, tokens, cost }
  }

  private static async callGroq(
    model: AIModel,
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    settings: any,
    apiKey: string,
  ) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model.modelId,
        messages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        top_p: settings.topP,
        frequency_penalty: settings.frequencyPenalty,
        presence_penalty: settings.presencePenalty,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Groq API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ""
    const tokens = data.usage?.total_tokens || 0
    const cost = model.costPer1kTokens ? (tokens / 1000) * model.costPer1kTokens : 0

    return { content, tokens, cost }
  }

  private static async callReplicate(
    model: AIModel,
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    settings: any,
    apiKey: string,
  ) {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${apiKey}`,
      },
      body: JSON.stringify({
        version: model.modelId,
        input: {
          prompt: messages.map((m) => `${m.role}: ${m.content}`).join("\n"),
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
          top_p: settings.topP,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Replicate API error: ${error.detail || response.statusText}`)
    }

    const data = await response.json()
    // Note: Replicate is async, this is a simplified implementation
    const content = data.output?.join("") || ""
    const tokens = content.length / 4 // Rough estimation
    const cost = model.costPer1kTokens ? (tokens / 1000) * model.costPer1kTokens : 0

    return { content, tokens, cost }
  }

  private static async callHuggingFace(
    model: AIModel,
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    settings: any,
    apiKey: string,
  ) {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model.modelId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: messages.map((m) => m.content).join("\n"),
        parameters: {
          temperature: settings.temperature,
          max_new_tokens: settings.maxTokens,
          top_p: settings.topP,
          repetition_penalty: 1 + settings.frequencyPenalty,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Hugging Face API error: ${error.error || response.statusText}`)
    }

    const data = await response.json()
    const content = Array.isArray(data) ? data[0]?.generated_text || "" : data.generated_text || ""
    const tokens = content.length / 4 // Rough estimation
    const cost = model.costPer1kTokens ? (tokens / 1000) * model.costPer1kTokens : 0

    return { content, tokens, cost }
  }

  static async testModelConnection(model: AIModel): Promise<boolean> {
    try {
      const testMessages: AIChatMessage[] = [
        {
          id: "test",
          sessionId: "test",
          role: "user",
          content: "Hello, this is a test message.",
          timestamp: new Date().toISOString(),
        },
      ]

      const result = await this.sendChatMessage(model, testMessages, {
        temperature: 0.7,
        maxTokens: 50,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
      })

      return result.content.length > 0
    } catch (error) {
      console.error("Model test failed:", error)
      return false
    }
  }
}

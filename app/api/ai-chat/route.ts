import { type NextRequest, NextResponse } from "next/server"
import { AIService } from "@/lib/ai-services"
import type { AIModel } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { model, messages, settings } = body

    if (!model || !messages || !settings) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate model
    const aiModel: AIModel = model
    if (!aiModel.isActive) {
      return NextResponse.json({ error: "Model is not active" }, { status: 400 })
    }

    // Send chat message
    const result = await AIService.sendChatMessage(aiModel, messages, settings)

    return NextResponse.json({
      content: result.content,
      tokens: result.tokens,
      cost: result.cost,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("AI Chat API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

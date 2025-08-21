import { type NextRequest, NextResponse } from "next/server"
import { AIService } from "@/lib/ai-services"
import type { AIModel } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { model } = body

    if (!model) {
      return NextResponse.json({ error: "Model is required" }, { status: 400 })
    }

    const aiModel: AIModel = model
    const isConnected = await AIService.testModelConnection(aiModel)

    return NextResponse.json({
      success: isConnected,
      message: isConnected ? "Model connection successful" : "Model connection failed",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("AI Test API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { HuggingFaceAI, HUGGINGFACE_MODELS } from "@/lib/huggingface-ai"

interface CodeSuggestionRequest {
  fileContent: string
  cursorLine: number
  cursorColumn: number
  suggestionType: string
  fileName?: string
}

interface CodeContext {
  language: string
  framework: string
  beforeContext: string
  currentLine: string
  afterContext: string
  cursorPosition: { line: number; column: number }
  isInFunction: boolean
  isInClass: boolean
  isAfterComment: boolean
  incompletePatterns: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: CodeSuggestionRequest = await request.json()
    const { fileContent, cursorLine, cursorColumn, suggestionType, fileName } = body

    // Validate input
    if (!fileContent || cursorLine < 0 || cursorColumn < 0 || !suggestionType) {
      return NextResponse.json({ error: "Invalid input parameters" }, { status: 400 })
    }

    // Analyze code context
    const context = analyzeCodeContext(fileContent, cursorLine, cursorColumn, fileName)

    // Build AI prompt
    const prompt = buildPrompt(context, suggestionType)

    // Call AI service (replace with your AI service)
    let suggestion: string
    try {
      suggestion = await generateSuggestion(prompt)
    } catch (aiError) {
       console.error("AI service error:", aiError)
       // Always provide a fallback suggestion instead of throwing error
       suggestion = await generateHuggingFaceSuggestion(prompt)
     }

    return NextResponse.json({
      suggestion,
      context,
      metadata: {
        language: context.language,
        framework: context.framework,
        position: context.cursorPosition,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error: unknown) {
    console.error("Context analysis error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    
    // Always return a valid response with fallback suggestion
    return NextResponse.json({
      suggestion: "// Unable to generate suggestion at this time",
      context: {
        language: "unknown",
        framework: "unknown",
        beforeContext: "",
        currentLine: "",
        afterContext: "",
        cursorPosition: { line: 0, column: 0 },
        isInFunction: false,
        isInClass: false,
        isAfterComment: false,
        incompletePatterns: []
      },
      metadata: {
        language: "unknown",
        framework: "unknown",
        position: { line: 0, column: 0 },
        generatedAt: new Date().toISOString(),
        error: errorMessage
      },
    })
  }
}

/**
 * Analyze the code context around the cursor position
 */
function analyzeCodeContext(content: string, line: number, column: number, fileName?: string): CodeContext {
  const lines = content.split("\n")
  const currentLine = lines[line] || ""

  // Get surrounding context (10 lines before and after)
  const contextRadius = 10
  const startLine = Math.max(0, line - contextRadius)
  const endLine = Math.min(lines.length, line + contextRadius)

  const beforeContext = lines.slice(startLine, line).join("\n")
  const afterContext = lines.slice(line + 1, endLine).join("\n")

  // Detect language and framework
  const language = detectLanguage(content, fileName)
  const framework = detectFramework(content)

  // Analyze code patterns
  const isInFunction = detectInFunction(lines, line)
  const isInClass = detectInClass(lines, line)
  const isAfterComment = detectAfterComment(currentLine, column)
  const incompletePatterns = detectIncompletePatterns(currentLine, column)

  return {
    language,
    framework,
    beforeContext,
    currentLine,
    afterContext,
    cursorPosition: { line, column },
    isInFunction,
    isInClass,
    isAfterComment,
    incompletePatterns,
  }
}

/**
 * Build AI prompt based on context
 */
function buildPrompt(context: CodeContext, suggestionType: string): string {
  return `You are an expert code completion assistant. Generate a ${suggestionType} suggestion.

Language: ${context.language}
Framework: ${context.framework}

Context:
${context.beforeContext}
${context.currentLine.substring(0, context.cursorPosition.column)}|CURSOR|${context.currentLine.substring(context.cursorPosition.column)}
${context.afterContext}

Analysis:
- In Function: ${context.isInFunction}
- In Class: ${context.isInClass}
- After Comment: ${context.isAfterComment}
- Incomplete Patterns: ${context.incompletePatterns.join(", ") || "None"}

Instructions:
1. Provide only the code that should be inserted at the cursor
2. Maintain proper indentation and style
3. Follow ${context.language} best practices
4. Make the suggestion contextually appropriate

Generate suggestion:`
}

/**
 * Generate suggestion using AI service
 */
async function generateSuggestion(prompt: string): Promise<string> {
  try {
    console.log("Generating AI suggestion...")
    
    // Check if Ollama service is available first
    try {
      const healthCheck = await fetch("http://localhost:11434/api/tags", {
        method: "GET",
        signal: AbortSignal.timeout(3000) // 3 second timeout for health check
      })
      
      if (!healthCheck.ok) {
        console.log("Ollama service not responding, using Hugging Face fallback")
        return generateHuggingFaceSuggestion(prompt)
      }
    } catch (healthError) {
      console.log("Ollama service not available, using Hugging Face fallback:", healthError)
      return generateHuggingFaceSuggestion(prompt)
    }
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // Reduced to 30 seconds
    
    const requestBody = {
      model: "mistral:latest",
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        max_tokens: 1024, // Reduced for faster response
        num_predict: 1024,
        context_length: 4096,
        num_gpu: 1,
        num_thread: 4, // Reduced threads
        use_mlock: true,
        use_mmap: true,
        num_batch: 512 // Reduced batch size
      }
    }
    
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`AI service error: ${response.status} ${response.statusText}`)
      return generateHuggingFaceSuggestion(prompt)
    }

    const data = await response.json()
    let suggestion = data.response

    // Clean up the suggestion
    if (suggestion && suggestion.includes("```")) {
      const codeMatch = suggestion.match(/```[\w]*\n?([\s\S]*?)```/)
      suggestion = codeMatch ? codeMatch[1].trim() : suggestion
    }

    // Remove cursor markers if present
    suggestion = suggestion ? suggestion.replace(/\|CURSOR\|/g, "").trim() : ""

    return suggestion || "// No suggestion generated"
  } catch (error) {
    console.error("AI generation error:", error)
    return generateHuggingFaceSuggestion(prompt)
  }
}

/**
 * Generate a suggestion using Hugging Face when Ollama is unavailable
 */
async function generateHuggingFaceSuggestion(prompt: string): Promise<string> {
  try {
    console.log("Generating suggestion with Hugging Face...")
    
    // Initialize Hugging Face AI with Kimi K2 model
    const hfAI = new HuggingFaceAI(HUGGINGFACE_MODELS.KIMIK2)
    
    // Create a code generation prompt
    const codePrompt = `You are a helpful coding assistant. Generate a code suggestion based on the following context:\n\n${prompt}\n\nProvide only the code suggestion without explanations.`
    
    // Try to generate code using Hugging Face
    const suggestion = await hfAI.generateCode(codePrompt, 'typescript')
    
    if (suggestion && suggestion.trim()) {
      return suggestion.trim()
    } else {
      console.log("Hugging Face returned empty suggestion, using text fallback")
      return generateFallbackSuggestion(prompt)
    }
  } catch (error) {
    console.error("Hugging Face generation error:", error)
    return generateFallbackSuggestion(prompt)
  }
}

/**
 * Generate a fallback suggestion when AI is unavailable
 */
function generateFallbackSuggestion(prompt: string): string {
  // Simple pattern-based suggestions
  if (prompt.includes("function") && prompt.includes("{")) {
    return "  // TODO: Implement function body\n  return;"
  }
  if (prompt.includes("console.log")) {
    return "console.log('Debug message');"
  }
  if (prompt.includes("if") || prompt.includes("condition")) {
    return "if (condition) {\n  // TODO: Add logic\n}"
  }
  if (prompt.includes("for") || prompt.includes("loop")) {
    return "for (let i = 0; i < length; i++) {\n  // TODO: Add loop body\n}"
  }
  
  return "// AI suggestion temporarily unavailable - basic completion"
}

// Helper functions for code analysis
function detectLanguage(content: string, fileName?: string): string {
  if (fileName) {
    const ext = fileName.split(".").pop()?.toLowerCase()
    const extMap: Record<string, string> = {
      ts: "TypeScript",
      tsx: "TypeScript",
      js: "JavaScript",
      jsx: "JavaScript",
      py: "Python",
      java: "Java",
      go: "Go",
      rs: "Rust",
      php: "PHP",
    }
    if (ext && extMap[ext]) return extMap[ext]
  }

  // Content-based detection
  if (content.includes("interface ") || content.includes(": string")) return "TypeScript"
  if (content.includes("def ") || content.includes("import ")) return "Python"
  if (content.includes("func ") || content.includes("package ")) return "Go"

  return "JavaScript"
}

function detectFramework(content: string): string {
  if (content.includes("import React") || content.includes("useState")) return "React"
  if (content.includes("import Vue") || content.includes("<template>")) return "Vue"
  if (content.includes("@angular/") || content.includes("@Component")) return "Angular"
  if (content.includes("next/") || content.includes("getServerSideProps")) return "Next.js"

  return "None"
}

function detectInFunction(lines: string[], currentLine: number): boolean {
  for (let i = currentLine - 1; i >= 0; i--) {
    const line = lines[i]
    if (line?.match(/^\s*(function|def|const\s+\w+\s*=|let\s+\w+\s*=)/)) return true
    if (line?.match(/^\s*}/)) break
  }
  return false
}

function detectInClass(lines: string[], currentLine: number): boolean {
  for (let i = currentLine - 1; i >= 0; i--) {
    const line = lines[i]
    if (line?.match(/^\s*(class|interface)\s+/)) return true
  }
  return false
}

function detectAfterComment(line: string, column: number): boolean {
  const beforeCursor = line.substring(0, column)
  return /\/\/.*$/.test(beforeCursor) || /#.*$/.test(beforeCursor)
}

function detectIncompletePatterns(line: string, column: number): string[] {
  const beforeCursor = line.substring(0, column)
  const patterns: string[] = []

  if (/^\s*(if|while|for)\s*\($/.test(beforeCursor.trim())) patterns.push("conditional")
  if (/^\s*(function|def)\s*$/.test(beforeCursor.trim())) patterns.push("function")
  if (/\{\s*$/.test(beforeCursor)) patterns.push("object")
  if (/\[\s*$/.test(beforeCursor)) patterns.push("array")
  if (/=\s*$/.test(beforeCursor)) patterns.push("assignment")
  if (/\.\s*$/.test(beforeCursor)) patterns.push("method-call")

  return patterns
}
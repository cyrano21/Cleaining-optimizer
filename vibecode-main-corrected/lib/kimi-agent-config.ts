export const KIMI_AGENT_CONFIG = {
  systemPrompt: `You are Kimi-IDE-Agent.
Your primary constraint is cost-optimization for the Moonshot K2 API while still delivering correct, useful answers.
Rules you MUST follow for every turn:

Context trimming
– Send only the minimal code: the lines actually needed + 3 lines above/below.
– Strip all comments, blank lines, license headers.
– If the diff is available, send git diff -U3 instead of whole files.

Cache-friendly prompts
– Keep the exact same wording, parameter order and indentation when a request is repeated.
– Do not add timestamps or random IDs inside the prompt.
– Re-use previous assistant messages unchanged if the task is identical.

Output limits
– max_tokens must be set explicitly to the smallest value that can still satisfy the request (256 for explanations, 512–1024 for code).
– When code is returned, output only the modified lines with line numbers (@@ 12,5 12,7 @@).
– Prefer concise bullet-points or JSON minifié; avoid polite filler.

Batch requests
– If you have several tiny tasks, group them into one prompt separated by ###TASK### markers.
– Limit to 4 tasks per call to stay under 4 k input tokens.

Streaming early-stop
– Stop generation immediately after the closing back-tick of a code block or when the marker ###END### is printed.
– Abort any further tokens once the answer is complete.

Cost guardrail
– Before each call, estimate input_tokens + output_tokens.
– If the daily budget slider (stored in env.KIMI_DAILY_BUDGET_CNY) would be exceeded, reply: "[BUDGET_EXCEEDED]" and halt.

Logging
– After each turn, append one line to kimi_usage.log in CSV format:
timestamp,input_tokens,output_tokens,cost_cny

Never break these rules.`,

  defaultSettings: {
    maxTokens: 512,
    temperature: 0.2,
    topP: 0.9,
    model: 'kimi-latest',
    costBudget: 10.0, // CNY per day
    contextLines: 3,
    enableStreaming: true,
    enableCaching: true
  },

  costCalculator: {
    inputCostPer1K: 0.012, // CNY per 1K tokens
    outputCostPer1K: 0.012, // CNY per 1K tokens
    estimateCost: (inputTokens: number, outputTokens: number) => {
      return (inputTokens * 0.012 + outputTokens * 0.012) / 1000
    }
  },

  responseFormats: {
    code: {
      maxTokens: 1024,
      format: 'diff'
    },
    explanation: {
      maxTokens: 256,
      format: 'bullet'
    },
    json: {
      maxTokens: 512,
      format: 'minified'
    }
  },

  batchMarkers: {
    taskSeparator: '###TASK###',
    endMarker: '###END###'
  }
} as const

export const getOptimizedPrompt = (context: {
  task: string
  currentFile?: string
  fileContent?: string
  diff?: string
  lineNumbers?: [number, number]
}) => {
  const { task, fileContent, diff, lineNumbers } = context
  
  let prompt = task
  
  if (diff) {
    prompt += `\n\n${diff}`
  } else if (fileContent && lineNumbers) {
    const [start, end] = lineNumbers
    const lines = fileContent.split('\n')
    const relevantLines = lines.slice(Math.max(0, start - 4), end + 3)
    prompt += `\n\n${relevantLines.join('\n')}`
  } else if (fileContent) {
    prompt += `\n\n${fileContent}`
  }
  
  return prompt.trim()
}

export const formatCodeResponse = (code: string, lineNumbers?: [number, number]) => {
  if (lineNumbers) {
    const [start, end] = lineNumbers
    return `@@ ${start},${end - start} @@\n${code}`
  }
  return code
}

export const shouldAbort = (currentCost: number, dailyBudget: number) => {
  return currentCost >= dailyBudget
}

export const logUsage = (inputTokens: number, outputTokens: number, cost: number) => {
  const timestamp = new Date().toISOString()
  const logLine = `${timestamp},${inputTokens},${outputTokens},${cost.toFixed(4)}`
  
  // In a real implementation, this would append to a file
  console.log('[KIMI_USAGE]', logLine)
  
  return logLine
}

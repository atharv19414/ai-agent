
import type { AIMessage } from '../types'
import { openai } from './ai'
import { zodFunction } from "openai/helpers/zod"
import { z } from "zod";
import { systemPrompt } from './systemPrompt';

export const runLLM = async ({
  model = "gemini-2.5-flash-preview-05-20",
  messages,
  temperature = 0.1,
  tools
}: {
  messages: AIMessage[]
  temperature?: number
  model?: string,
  tools?: {name: string; parameters: z.AnyZodObject}[]
}) => {
  const formattedTools = tools?.map(zodFunction)

  const response = await openai.chat.completions.create({
    model,
    messages: [{role: 'system', content: systemPrompt}, ...messages],
    temperature,
    tools: formattedTools,
    tool_choice: 'auto',
    parallel_tool_calls: false,
  });

  return response.choices[0].message;
}

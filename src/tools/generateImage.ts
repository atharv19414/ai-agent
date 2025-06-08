import type { ToolFn } from '../../types'
import { z } from 'zod'
import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "node:fs";
import { uuidv4 } from 'zod/v4';

export const generateImageToolDefinition = {
  name: 'generate_image',
  parameters: z
    .object({
      prompt: z
        .string()
        .describe(
          'The prompt to use to generate the image with a diffusion model image generator like Dall-E, gemini-2.0-flash'
        ),
    })
    .describe('Generates an image and returns the name of the image.'),
}

type Args = z.infer<typeof generateImageToolDefinition.parameters>

export const generateImage: ToolFn<Args, string> = async ({
  toolArgs,
  userMessage,
}) => {
    const imageGenAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response =  await imageGenAi.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: toolArgs.prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });
  
    let idx = 1;
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        console.log(part.text);
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, "base64");
        fs.writeFileSync(`imagen-${idx}.png`, buffer);
      }
    }

  return `imagen-${idx}.png`;
}

import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import type { ZodType } from 'zod';

/**
 * Call the OpenAI Responses API to parse a prompt into a structured JSON object.
 * @param apiKey - OpenAI API key
 * @param prompt - The system prompt content to send to the LLM
 * @param schema - Zod schema describing the expected output shape
 * @param schemaName - Name identifier for the schema (used by zodTextFormat)
 * @param model - Optional model name (defaults to 'gpt-4o-2024-08-06')
 * @returns Parsed object matching the Zod schema
 */
export async function callLLM<T>(
  apiKey: string,
  prompt: string,
  schema: ZodType<T>,
  schemaName: string,
  model = 'gpt-4o-2024-08-06',
): Promise<T> {
  const openai = new OpenAI({ apiKey });
  const response = await openai.responses.parse({
    model,
    input: [{ role: 'system', content: prompt }],
    text: {
      format: zodTextFormat(schema, schemaName),
    },
  });
  // The parsed JSON is available under `output_parsed`
  const parsed = response.output_parsed;
  if (!parsed) {
    throw new Error(
      `No parsed JSON returned by Responses API (schema: ${schemaName})`,
    );
  }
  // Validate against schema and return
  return schema.parse(parsed);
}
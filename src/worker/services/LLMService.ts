import { callLLM } from '../utils/llm';
import { MissingItemsArraySchema } from '../schemas/ShoppingListSchema';
import { LLMError } from '../errors/CustomErrors';

/**
 * Service to interact with the LLM for missing item computation.
 */
export class LLMService {
  constructor(private apiKey: string) {}

  /**
   * Compute missing items from a given prompt.
   */
  async computeMissingItems(
    prompt: string
  ): Promise<Awaited<ReturnType<typeof MissingItemsArraySchema.parse>>> {
    try {
      const items = await callLLM(
        this.apiKey,
        prompt,
        MissingItemsArraySchema,
        'MissingItemsArray',
        'o4-mini'
      );
      return items;
    } catch (err: any) {
      throw new LLMError(
        `LLM failed to compute missing items: ${err.message || err}`
      );
    }
  }
}
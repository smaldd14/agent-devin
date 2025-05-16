import { z } from 'zod';

// Environment variable schema validation
const EnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

/**
 * Parse and validate environment bindings.
 * @param env - Worker environment bindings
 * @returns validated environment config
 */
export function parseEnv(env: Record<string, any>): EnvConfig {
  return EnvSchema.parse({
    OPENAI_API_KEY: env.OPENAI_API_KEY,
  });
}
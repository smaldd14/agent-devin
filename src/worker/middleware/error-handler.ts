import { MiddlewareHandler } from 'hono';

export const errorHandler = (): MiddlewareHandler => {
  return async (c, next) => {
    try {
      await next();
    } catch (error) {
      console.error('Uncaught error:', error);
      
      return c.json({
        success: false,
        error: 'An unexpected error occurred'
      }, 500);
    }
  };
};
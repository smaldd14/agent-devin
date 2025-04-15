import { Context } from 'hono';
import { ApiResponse } from '@/types/api';

export function success<T>(c: Context, data: T, status = 200): Response {
  const response: ApiResponse<T> = {
    success: true,
    data
  };
  
  return c.json(response, status as any);
}

export function error(c: Context, message: string, status = 500): Response {
  const response: ApiResponse<never> = {
    success: false,
    error: message
  };
  
  return c.json(response, status as any);
}
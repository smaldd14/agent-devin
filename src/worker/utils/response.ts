import { Context } from 'hono';
import { ApiResponse } from '@/types/api';

export function success<T>(c: Context, data: T, status = 200, additionalData?: Record<string, any>): Response {
  const response: ApiResponse<T> & Record<string, any> = {
    success: true,
    data,
    ...(additionalData || {})
  };
  
  return c.json(response, status as any);
}

export function error(c: Context, message: string, status = 500, additionalData?: Record<string, any>): Response {
  const response: ApiResponse<never> & Record<string, any> = {
    success: false,
    error: message,
    ...(additionalData || {})
  };
  
  return c.json(response, status as any);
}
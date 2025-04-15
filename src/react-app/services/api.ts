// src/react-app/services/api.ts
import { ApiResponse } from '@/types/api';

const API_BASE_URL = '/api';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { params, ...fetchOptions } = options;
  
  let url = `${API_BASE_URL}${endpoint}`;
  
  // Add query parameters if provided
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });
    url += `?${searchParams.toString()}`;
  }
  
  // Set default headers
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });
    
    const data = await response.json() as ApiResponse<T>;
    
    if (!response.ok) {
      throw new Error(data.error || 'An unknown error occurred');
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'An unknown error occurred',
    };
  }
}
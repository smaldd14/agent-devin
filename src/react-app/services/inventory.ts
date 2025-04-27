// src/react-app/services/inventory.ts
import { 
  ApiResponse,
  InventoryItem, 
  InventoryItemResponse, 
  InventoryItemsResponse,
} from '@/types/api';
import { fetchApi } from './api';

const INVENTORY_ENDPOINT = '/inventory';

/**
 * Fetch all inventory items
 */
export async function getInventoryItems(): Promise<InventoryItemsResponse> {
  return fetchApi<InventoryItem[]>(INVENTORY_ENDPOINT);
}

/**
 * Fetch an inventory item by ID
 */
export async function getInventoryItemById(id: number): Promise<InventoryItemResponse> {
  return fetchApi<InventoryItem>(`${INVENTORY_ENDPOINT}/${id}`);
}

/**
 * Create a new inventory item
 */
export async function createInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItemResponse> {
  return fetchApi<InventoryItem>(INVENTORY_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

/**
 * Create multiple inventory items in a batch
 */
export interface BatchCreateResponse {
  items: InventoryItem[];
  errors?: Record<number, string>;
  message?: string;
}

export async function batchCreateInventoryItems(items: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>[]): Promise<{
  success: boolean;
  data?: BatchCreateResponse;
  error?: string;
}> {
  return fetchApi<BatchCreateResponse>(`${INVENTORY_ENDPOINT}/batch`, {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}
/**
 * Delete a single inventory item by ID
 */
export async function deleteInventoryItem(id: number): Promise<ApiResponse<{ id: number }>> {
  return fetchApi<{ id: number }>(`${INVENTORY_ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
}
/**
 * Delete multiple inventory items by IDs
 */
export async function batchDeleteInventoryItems(ids: number[]): Promise<ApiResponse<{ deleted: number[] }>> {
  return fetchApi<{ deleted: number[] }>(`${INVENTORY_ENDPOINT}/batch-delete`, {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}
/**
 * Update an existing inventory item by ID
 */
export async function updateInventoryItem(
  id: number,
  item: Partial<Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>>
): Promise<InventoryItemResponse> {
  return fetchApi<InventoryItem>(`${INVENTORY_ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  });
}
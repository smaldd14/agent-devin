// src/react-app/context/inventory/inventoryState.ts
import { useState, useCallback } from 'react';
import { InventoryItem, InventoryItemResponse, InventoryItemsResponse } from '@/types/api';
import {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  batchCreateInventoryItems as apiBatchCreateItems,
  updateInventoryItem as apiUpdateInventoryItem,
  deleteInventoryItem as apiDeleteInventoryItem,
  batchDeleteInventoryItems as apiBatchDeleteInventoryItems
} from '@/react-app/services/inventory';

// Define the state shape for inventory
export interface InventoryState {
  items: InventoryItem[];
  current: InventoryItem | null;
  isLoading: boolean;
  error: string | null;
}

// Define the actions for inventory
export interface InventoryActions {
  fetchInventoryItems: () => Promise<void>;
  fetchInventoryItem: (id: number) => Promise<void>;
  clearCurrentInventoryItem: () => void;
  createInventoryItem: (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => Promise<InventoryItem | null>;
  batchCreateInventoryItems: (items: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>[]) => Promise<{
    success: boolean;
    items: InventoryItem[];
    errors?: Record<number, string>;
    message?: string;
  }>;
  /**
   * Update an existing inventory item by ID
   */
  updateInventoryItem: (
    id: number,
    item: Partial<Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>>
  ) => Promise<InventoryItem | null>;
  /**
   * Delete a single inventory item by ID
   */
  deleteInventoryItem: (id: number) => Promise<number | null>;
  /**
   * Delete multiple inventory items by IDs
   */
  batchDeleteInventoryItems: (ids: number[]) => Promise<number[] | null>;
}

// Custom hook that manages inventory state and provides actions
export function useInventoryState(): [InventoryState, InventoryActions] {
  // Inventory state
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [current, setCurrent] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all inventory items
  const fetchInventoryItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: InventoryItemsResponse = await getInventoryItems();
      
      if (response.success && response.data) {
        setItems(response.data);
      } else {
        setError(response.error || 'Failed to fetch inventory items');
      }
    } catch (err) {
      setError('An error occurred while fetching inventory items');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch a single inventory item by ID
  const fetchInventoryItem = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: InventoryItemResponse = await getInventoryItemById(id);
      
      if (response.success && response.data) {
        setCurrent(response.data);
      } else {
        setError(response.error || 'Failed to fetch inventory item');
      }
    } catch (err) {
      setError('An error occurred while fetching the inventory item');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear the current inventory item
  const clearCurrentInventoryItem = useCallback(() => {
    setCurrent(null);
  }, []);

  // Bundle state
  const state: InventoryState = {
    items,
    current,
    isLoading,
    error
  };

  // Create a single inventory item
  const createSingleItem = useCallback(async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await createInventoryItem(item);
      
      if (response.success && response.data) {
        // Add the new item to the list and refresh
        await fetchInventoryItems();
        return response.data;
      } else {
        setError(response.error || 'Failed to create inventory item');
        return null;
      }
    } catch (err) {
      setError('An error occurred while creating the inventory item');
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchInventoryItems]);

  // Update a single inventory item
  const updateSingleItem = useCallback(
    async (
      id: number,
      data: Partial<Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>>
    ): Promise<InventoryItem | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiUpdateInventoryItem(id, data);
        if (response.success && response.data) {
          // Update current item and refresh list
          setCurrent(response.data);
          await fetchInventoryItems();
          return response.data;
        } else {
          setError(response.error || 'Failed to update inventory item');
          return null;
        }
      } catch (err) {
        setError('An error occurred while updating the inventory item');
        console.error(err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchInventoryItems]
  );
  // Delete a single inventory item
  const deleteSingleItem = useCallback(
    async (id: number): Promise<number | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiDeleteInventoryItem(id);
        if (response.success && response.data) {
          // Refresh the inventory list
          await fetchInventoryItems();
          return response.data.id;
        } else {
          setError(response.error || 'Failed to delete inventory item');
          return null;
        }
      } catch (err) {
        setError('An error occurred while deleting the inventory item');
        console.error(err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchInventoryItems]
  );
  // Delete multiple inventory items
  const batchDeleteItems = useCallback(
    async (ids: number[]): Promise<number[] | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiBatchDeleteInventoryItems(ids);
        if (response.success && response.data) {
          await fetchInventoryItems();
          return response.data.deleted;
        } else {
          setError(response.error || 'Failed to delete inventory items');
          return null;
        }
      } catch (err) {
        setError('An error occurred while batch deleting inventory items');
        console.error(err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchInventoryItems]
  );

  // Create multiple inventory items in a batch
  const batchCreateItems = useCallback(async (newItems: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>[]): Promise<{
    success: boolean;
    items: InventoryItem[];
    errors?: Record<number, string>;
    message?: string;
  }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiBatchCreateItems(newItems);
      
      if (response.success && response.data) {
        // Refresh the inventory list
        await fetchInventoryItems();
        
        return {
          success: true,
          items: response.data.items,
          errors: response.data.errors,
          message: response.data.message
        };
      } else {
        setError(response.error || 'Failed to create inventory items');
        return {
          success: false,
          items: [],
          message: response.error || 'Failed to create inventory items',
          errors: response.data?.errors
        };
      }
    } catch (err) {
      const errorMessage = 'An error occurred during batch creation';
      setError(errorMessage);
      console.error(err);
      return {
        success: false,
        items: [],
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [fetchInventoryItems]);

  // Bundle actions
  const actions: InventoryActions = {
    fetchInventoryItems,
    fetchInventoryItem,
    clearCurrentInventoryItem,
    createInventoryItem: createSingleItem,
    batchCreateInventoryItems: batchCreateItems,
    updateInventoryItem: updateSingleItem,
    deleteInventoryItem: deleteSingleItem,
    batchDeleteInventoryItems: batchDeleteItems
  };

  return [state, actions];
}
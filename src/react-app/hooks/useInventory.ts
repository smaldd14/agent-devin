// src/react-app/hooks/useInventory.ts
import { useEffect } from 'react';
import { useAppData } from '@/react-app/context/AppDataContext';
import { InventoryItem } from '@/types/api';

// Hook for fetching all inventory items
export function useInventory() {
  const { inventory } = useAppData();

  useEffect(() => {
    inventory.fetchInventoryItems();
  }, [inventory.fetchInventoryItems]);

  return {
    items: inventory.items,
    isLoading: inventory.isLoading,
    error: inventory.error,
    refetch: inventory.fetchInventoryItems,
    createItem: inventory.createInventoryItem,
    batchCreateItems: inventory.batchCreateInventoryItems,
  };
}

// Hook for fetching a single inventory item by ID
export function useInventoryItem(id: number | null) {
  const { inventory } = useAppData();

  useEffect(() => {
    if (id) {
      inventory.fetchInventoryItem(id);
    } else {
      inventory.clearCurrentInventoryItem();
    }
    
    return () => {
      inventory.clearCurrentInventoryItem();
    };
  }, [id, inventory.fetchInventoryItem, inventory.clearCurrentInventoryItem]);

  return {
    item: inventory.current,
    isLoading: inventory.isLoading,
    error: inventory.error,
    refetch: id ? () => inventory.fetchInventoryItem(id) : () => {},
  };
}

// Type for creating a new inventory item
export type NewInventoryItem = Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>;

// Hook for inventory operations (create, batch create)
export function useInventoryOperations() {
  const { inventory } = useAppData();

  return {
    createItem: inventory.createInventoryItem,
    batchCreateItems: inventory.batchCreateInventoryItems,
    isLoading: inventory.isLoading,
    error: inventory.error
  };
}
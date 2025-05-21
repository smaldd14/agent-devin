// src/react-app/pages/Inventory/index.tsx
import { useState } from 'react';
import { Search, AlertTriangle, PlusCircle } from 'lucide-react';
import { useInventory } from '@/react-app/hooks/useInventory';
import { InventoryTable } from '@/react-app/components/inventory/InventoryTable';
import { PageHeader } from '@/react-app/components/layout/PageHeader';
import { Button } from '@/react-app/components/ui/button';
import { Input } from '@/react-app/components/ui/input';
import { Badge } from '@/react-app/components/ui/badge';
import { Skeleton } from '@/react-app/components/ui/skeleton';
import { InventoryItem } from '@/types/api';

export default function InventoryPage() {
  const { items, isLoading, error, refetch, createItem } = useInventory();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'low-stock'>('all');
  
  // Filter items based on search query and filter type
  const filteredItems = items.filter(item => {
    // Text search (case insensitive)
    const matchesSearch = searchQuery === '' || 
      item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.storage_location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by stock status
    const matchesFilter = filter === 'all' || (filter === 'low-stock' && item.restock_flag);
    
    return matchesSearch && matchesFilter;
  });
  
  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="h-8 w-full">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <Skeleton className="h-[400px] w-full rounded-md" />
    </div>
  );
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <PageHeader
        title="Inventory"
        description="View and manage your inventory items"
      >
        <Button size="sm" onClick={() => setShowForm(true)}>
          <PlusCircle className="h-4 w-4 mr-1" />
          New Item
        </Button>
      </PageHeader>
      {showForm && (
        <div className="mb-6 p-4 border rounded-md">
          <h2 className="text-lg font-medium mb-4">Add New Inventory Item</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const data = new FormData(form);
              // Build payload
              const payload: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'> = {
                item_name: data.get('item_name') as string,
                category: data.get('category') as string,
                storage_location: data.get('storage_location') as string,
                quantity: parseFloat(data.get('quantity') as string) || 0,
                unit: data.get('unit') as string,
                purchase_date: data.get('purchase_date') as string,
                restock_flag: false,
                brand: data.get('brand') as string || '',
                notes: data.get('notes') as string || '',
                expiry_date: data.get('expiry_date') as string || ''
              };
              await createItem(payload);
              setShowForm(false);
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input name="item_name" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Input name="category" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input name="storage_location" required />
              </div>
              {/* 
                Optional fields: quantity, unit, and purchase_date.
                These are not marked as `required` in the form because the backend
                is configured to apply sensible default values if they are left blank.
                - Quantity defaults to 1.
                - Unit defaults to 'unit'.
                - Purchase Date defaults to the current date.
              */}
              <div>
                <label className="block text-sm font-medium mb-1">Unit (optional, defaults to 'unit')</label>
                <Input name="unit" placeholder="e.g., kg, pcs, liter" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity (optional, defaults to 1)</label>
                <Input name="quantity" type="number" step="any" placeholder="Enter quantity" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Purchase Date (optional, defaults to today)</label>
                <Input name="purchase_date" type="date" />
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <Button type="submit" size="sm">Save</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
      
      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search inventory..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All Items
          </Button>
          <Button
            variant={filter === 'low-stock' ? 'default' : 'outline'}
            onClick={() => setFilter('low-stock')}
            size="sm"
            className="flex items-center"
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            Low Stock
          </Button>
        </div>
      </div>
      
      {/* Summary stats */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Badge variant="secondary">
          Total Items: {items.length}
        </Badge>
        <Badge variant="secondary">
          Low Stock: {items.filter(item => item.restock_flag).length}
        </Badge>
        <Badge variant="secondary">
          Filtered Results: {filteredItems.length}
        </Badge>
      </div>
      
      {/* Error state */}
      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && <LoadingSkeleton />}
      
      {/* Empty state */}
      {!isLoading && !error && items.length === 0 && (
        <div className="text-center py-12 border rounded-md">
          <p className="text-muted-foreground">No inventory items found.</p>
        </div>
      )}
      
      {/* No results after filtering */}
      {!isLoading && !error && items.length > 0 && filteredItems.length === 0 && (
        <div className="text-center py-12 border rounded-md">
          <p className="text-muted-foreground">No items match your search criteria.</p>
          <Button variant="outline" onClick={() => {setSearchQuery(''); setFilter('all');}} className="mt-4">
            Clear Filters
          </Button>
        </div>
      )}
      
      {/* Results table */}
      {!isLoading && !error && filteredItems.length > 0 && (
        <InventoryTable items={filteredItems} />
      )}
    </div>
  );
}
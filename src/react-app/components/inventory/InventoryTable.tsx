// src/react-app/components/inventory/InventoryTable.tsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { InventoryItem } from '@/types/api';
import { Badge } from '@/react-app/components/ui/badge';
import { Button } from '@/react-app/components/ui/button';
import { Eye, ArrowUpDown } from 'lucide-react';

interface InventoryTableProps {
  items: InventoryItem[];
}

type SortField = 'item_name' | 'category' | 'quantity' | 'storage_location' | 'expiry_date';
type SortDirection = 'asc' | 'desc';

export function InventoryTable({ items }: InventoryTableProps) {
  const [sortField, setSortField] = useState<SortField>('item_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Handle sorting when a column header is clicked
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Sort the items based on current sort settings
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      // Handle special cases
      if (sortField === 'expiry_date') {
        // Convert to dates or use max date for items without expiry
        aValue = a.expiry_date ? new Date(a.expiry_date) : new Date(8640000000000000);
        bValue = b.expiry_date ? new Date(b.expiry_date) : new Date(8640000000000000);
      }
      
      // Compare values
      if (aValue === bValue) return 0;
      
      // Handle null/undefined
      if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
      if (bValue == null) return sortDirection === 'asc' ? 1 : -1;
      
      // Standard comparison
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, sortField, sortDirection]);

  // Render sorting indicator
  const SortIndicator = ({ field }: { field: SortField }) => (
    <ArrowUpDown className={`ml-1 h-3 w-3 inline-block ${sortField === field ? 'opacity-100' : 'opacity-30'}`} />
  );

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="text-left font-medium text-sm">
              <th 
                className="p-3 cursor-pointer hover:bg-muted" 
                onClick={() => handleSort('item_name')}
              >
                Name <SortIndicator field="item_name" />
              </th>
              <th 
                className="p-3 cursor-pointer hover:bg-muted" 
                onClick={() => handleSort('category')}
              >
                Category <SortIndicator field="category" />
              </th>
              <th 
                className="p-3 cursor-pointer hover:bg-muted" 
                onClick={() => handleSort('quantity')}
              >
                Quantity <SortIndicator field="quantity" />
              </th>
              <th 
                className="p-3 cursor-pointer hover:bg-muted" 
                onClick={() => handleSort('storage_location')}
              >
                Location <SortIndicator field="storage_location" />
              </th>
              <th 
                className="p-3 cursor-pointer hover:bg-muted" 
                onClick={() => handleSort('expiry_date')}
              >
                Expiry <SortIndicator field="expiry_date" />
              </th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item) => (
              <tr key={item.id} className="border-t hover:bg-muted/50">
                <td className="p-3">
                  <div className="font-medium">{item.item_name}</div>
                  {item.brand && <div className="text-xs text-muted-foreground">{item.brand}</div>}
                </td>
                <td className="p-3">
                  <Badge variant="outline">{item.category}</Badge>
                  {item.subcategory && (
                    <div className="text-xs text-muted-foreground mt-1">{item.subcategory}</div>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex gap-1 items-center">
                    <span className={`${item.restock_flag ? 'text-destructive font-medium' : ''}`}>
                      {item.quantity} {item.unit}
                    </span>
                    {item.restock_flag && <Badge variant="destructive" className="text-xs">Low</Badge>}
                  </div>
                </td>
                <td className="p-3">{item.storage_location}</td>
                <td className="p-3">
                  {item.expiry_date ? (
                    <span>
                      {new Date(item.expiry_date).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </td>
                <td className="p-3">
                  <Button size="sm" variant="ghost" asChild>
                    <Link to={`/inventory/${item.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  No inventory items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
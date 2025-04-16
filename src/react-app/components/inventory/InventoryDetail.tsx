// src/react-app/components/inventory/InventoryDetail.tsx
import { Clock, DollarSign, Calendar, Info, MapPin, AlertTriangle } from 'lucide-react';
import { InventoryItem } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/react-app/components/ui/card';
import { Badge } from '@/react-app/components/ui/badge';

interface InventoryDetailProps {
  item: InventoryItem;
}

export function InventoryDetail({ item }: InventoryDetailProps) {
  // Format dates
  const purchaseDate = new Date(item.purchase_date).toLocaleDateString();
  const expiryDate = item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : null;
  const createdAt = new Date(item.created_at).toLocaleDateString();
  const updatedAt = item.updated_at ? new Date(item.updated_at).toLocaleDateString() : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{item.item_name}</CardTitle>
              {item.brand && <p className="text-muted-foreground">Brand: {item.brand}</p>}
            </div>
            <div>
              <Badge variant={item.restock_flag ? "destructive" : "secondary"}>
                {item.restock_flag ? "Low Stock" : "In Stock"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Item Details</h3>
              <dl className="space-y-2">
                <div className="flex items-center text-sm">
                  <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                  <dt className="font-medium w-24">Category:</dt>
                  <dd>{item.category}</dd>
                </div>
                
                {item.subcategory && (
                  <div className="flex items-center text-sm">
                    <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                    <dt className="font-medium w-24">Subcategory:</dt>
                    <dd>{item.subcategory}</dd>
                  </div>
                )}
                
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <dt className="font-medium w-24">Location:</dt>
                  <dd>{item.storage_location}</dd>
                </div>
                
                <div className="flex items-center text-sm">
                  <AlertTriangle className="h-4 w-4 mr-2 text-muted-foreground" />
                  <dt className="font-medium w-24">Quantity:</dt>
                  <dd className={item.restock_flag ? "text-destructive font-medium" : ""}>
                    {item.quantity} {item.unit}
                    {item.minimum_quantity !== null && ` (Min: ${item.minimum_quantity} ${item.unit})`}
                  </dd>
                </div>
                
                {item.unit_price !== null && (
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                    <dt className="font-medium w-24">Unit Price:</dt>
                    <dd>${item.unit_price.toFixed(2)}</dd>
                  </div>
                )}
              </dl>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Dates</h3>
              <dl className="space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <dt className="font-medium w-24">Purchased:</dt>
                  <dd>{purchaseDate}</dd>
                </div>
                
                {expiryDate && (
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <dt className="font-medium w-24">Expires:</dt>
                    <dd className={new Date(item.expiry_date!) < new Date() ? "text-destructive font-medium" : ""}>
                      {expiryDate}
                    </dd>
                  </div>
                )}
                
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <dt className="font-medium w-24">Created:</dt>
                  <dd>{createdAt}</dd>
                </div>
                
                {updatedAt && (
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <dt className="font-medium w-24">Updated:</dt>
                    <dd>{updatedAt}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
          
          {item.item_description && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-sm">{item.item_description}</p>
            </div>
          )}
          
          {item.notes && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Notes</h3>
              <p className="text-sm italic">{item.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
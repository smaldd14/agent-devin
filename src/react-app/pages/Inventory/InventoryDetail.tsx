// src/react-app/pages/Inventory/InventoryDetail.tsx
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useInventoryItem } from '@/react-app/hooks/useInventory';
import { InventoryDetail } from '@/react-app/components/inventory/InventoryDetail';
import { PageHeader } from '@/react-app/components/layout/PageHeader';
import { Button } from '@/react-app/components/ui/button';
import { Skeleton } from '@/react-app/components/ui/skeleton';
import { Badge } from '@/react-app/components/ui/badge';

export default function InventoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const itemId = id ? parseInt(id, 10) : null;
  const { item, isLoading, error, refetch } = useInventoryItem(itemId);

  // Loading skeleton for inventory detail
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link to="/inventory">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inventory
          </Link>
        </Button>
      </div>

      {isLoading && <LoadingSkeleton />}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      )}

      {!isLoading && !error && !item && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Inventory item not found.</p>
          <Button asChild className="mt-4">
            <Link to="/inventory">View All Items</Link>
          </Button>
        </div>
      )}

      {!isLoading && !error && item && (
        <>
          <PageHeader 
            title={item.item_name}
            description={
              <>
                {item.category}
                {item.subcategory && (
                  <Badge variant="outline" className="ml-2">
                    {item.subcategory}
                  </Badge>
                )}
              </>
            }
          />
          <InventoryDetail item={item} />
        </>
      )}
    </div>
  );
}
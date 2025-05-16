// SwipeCardSkeleton.tsx
import { Card } from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton';

export default function SwipeCardSkeleton() {
  return (
    <Card className="w-full h-full overflow-hidden shadow-lg flex flex-col">
      {/* Image skeleton */}
      <div className="relative w-full flex-grow min-h-[300px]">
        <Skeleton className="w-full h-full absolute" />
      </div>
      
      {/* Recipe title skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        
        {/* Tags skeleton */}
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
      
      {/* Description skeleton */}
      <div className="p-4">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      
      {/* Button skeleton */}
      <div className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  );
}
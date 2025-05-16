import { useEffect, useState } from 'react';
import { useGenerateShoppingList } from '@hooks/useGenerateShoppingList';
import { ShoppingListItem } from '@/types/shopping-list';
import { AmazonFreshLinkGenerator } from '@lib/AmazonFreshLink';
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@components/ui/drawer';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';

interface GenerateShoppingListDrawerProps {
  /** Controls drawer visibility */
  isOpen: boolean;
  /** Callback when drawer should close */
  onClose: () => void;
  /** Recipe identifier to generate list for */
  recipeId: number;
}

/**
 * Drawer component to generate and edit a shopping list from a recipe.
 */
export function GenerateShoppingListDrawer({
  isOpen,
  onClose,
  recipeId,
}: GenerateShoppingListDrawerProps) {
  const { generate, data, loading, error } = useGenerateShoppingList();
  const [items, setItems] = useState<ShoppingListItem[]>([]);

  // Invoke generation when drawer opens
  useEffect(() => {
    if (isOpen) {
      generate(recipeId);
    }
  }, [isOpen, generate, recipeId]);

  // Sync fetched data into local editable state
  useEffect(() => {
    if (data) {
      setItems(data);
    }
  }, [data]);

  // Handle field changes
  const updateItem = (index: number, field: keyof ShoppingListItem, value: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Generate Amazon Fresh link and open in new tab
  const handleGenerateLink = () => {
    const generator = new AmazonFreshLinkGenerator();
    const url = generator.generateLink({ items });
    window.open(url, '_blank');
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerOverlay />
      <DrawerContent className="max-h-[80vh] flex flex-col">
        <DrawerHeader>
          <DrawerTitle>Generate Shopping List</DrawerTitle>
          <DrawerDescription>
            Review and edit your shopping items
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 flex-1 overflow-y-auto">
          {loading && (
            <div className="py-8 text-center">
              <p>Generating shopping list...</p>
            </div>
          )}
          {error && (
            <div className="py-4 text-center text-destructive">
              <p>{error}</p>
              <Button onClick={() => generate(recipeId)} className="mt-2">
                Retry
              </Button>
            </div>
          )}
          {!loading && !error && items.length > 0 && (
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={item.brand}
                      onChange={(e) => updateItem(idx, 'brand', e.target.value)}
                      placeholder="Brand"
                    />
                    <Input
                      value={item.itemName}
                      onChange={(e) => updateItem(idx, 'itemName', e.target.value)}
                      placeholder="Item name"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                      placeholder="Qty"
                    />
                    <Input
                      value={item.unit}
                      onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                      placeholder="Unit"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <DrawerFooter>
          {!loading && !error && items.length > 0 && (
            <Button onClick={handleGenerateLink} className="w-full">
              Generate Amazon Fresh Link
            </Button>
          )}
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
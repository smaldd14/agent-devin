import { Fragment } from 'react';
import type { ComponentProps } from 'react';
import type { ShoppingListItem } from '@/types/shopping-list';
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

export type ShoppingListAction = {
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ComponentProps<typeof Button>['variant'];
};

export interface ShoppingListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Title shown in the drawer header */
  title?: string;
  /** Description shown in the drawer header */
  description?: string;
  /** Items to display and edit */
  items: ShoppingListItem[];
  /** Callback when items change */
  onItemsChange: (items: ShoppingListItem[]) => void;
  /** Primary actions (e.g., generate link, save list) */
  actions: ShoppingListAction[];
  /** If provided, shows a loading state */
  loading?: boolean;
  /** Text to display when loading */
  loadingText?: string;
  /** Error message to display */
  error?: string;
  /** Retry callback when error occurs */
  onRetry?: () => void;
}

export function ShoppingListDrawer({
  isOpen,
  onClose,
  title = 'Shopping List',
  description = 'Review and edit your shopping items',
  items,
  onItemsChange,
  actions,
  loading = false,
  loadingText = 'Loading...',
  error,
  onRetry,
}: ShoppingListDrawerProps) {
  const updateItem = (
    index: number,
    field: keyof ShoppingListItem,
    value: string | number
  ) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    onItemsChange(next);
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerOverlay />
      <DrawerContent className="max-h-[80vh] flex flex-col">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 flex-1 overflow-y-auto space-y-4">
          {loading && (
            <div className="py-8 text-center">
              <p>{loadingText}</p>
            </div>
          )}
          {error && (
            <div className="py-4 text-center text-destructive">
              <p>{error}</p>
              {onRetry && (
                <Button onClick={onRetry} className="mt-2">
                  Retry
                </Button>
              )}
            </div>
          )}
          {!loading && !error && items.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No shopping items.
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
          {actions.map((action, i) => (
            <Button
              key={action.label}
              onClick={action.onClick}
              disabled={action.disabled}
              variant={action.variant}
              className={`w-full${i > 0 ? ' mt-2' : ''}`}
            >
              {action.loading ? action.label : action.label}
            </Button>
          ))}
          <DrawerClose asChild>
            <Button variant="outline" className="w-full mt-2">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
import { useEffect, useState } from 'react';
import type { ShoppingListItem } from '@/types/shopping-list';
import { AmazonFreshLinkGenerator } from '@lib/AmazonFreshLink';
import { ShoppingListDrawer } from '@components/ShoppingListDrawer';
import { toast } from 'sonner';
import { createShoppingListWithItems } from '@services/shopping-lists';

interface AggregatedShoppingListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialItems: ShoppingListItem[];
}

/**
 * Drawer to review & edit an aggregated shopping list.
 */
export function AggregatedShoppingListDrawer({
  isOpen,
  onClose,
  initialItems,
}: AggregatedShoppingListDrawerProps) {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);

  // Initialize items when opening
  useEffect(() => {
    if (isOpen) {
      setItems(initialItems);
    }
  }, [isOpen, initialItems]);

  const handleGenerateLink = () => {
    const generator = new AmazonFreshLinkGenerator();
    const url = generator.generateLink({ items });
    window.open(url, '_blank');
  };

  const handleSaveList = async () => {
    setSaveLoading(true);
    try {
      const payload = items.map((item) => ({
        item_name: item.itemName,
        quantity: item.quantity,
        unit: item.unit,
        brand: item.brand,
      }));
      await createShoppingListWithItems(payload);
      toast.success('Shopping list saved');
      onClose();
    } catch (err: any) {
      console.error('Error saving shopping list:', err);
      toast.error(err.message || 'Failed to save shopping list');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <ShoppingListDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Shopping List"
      description="Review and edit your shopping items"
      items={items}
      onItemsChange={setItems}
      actions={[
        {
          label: 'Generate Amazon Fresh Link',
          onClick: handleGenerateLink,
          disabled: items.length === 0,
        },
        {
          label: saveLoading ? 'Saving...' : 'Save Shopping List',
          onClick: handleSaveList,
          loading: saveLoading,
          disabled: saveLoading,
        },
      ]}
    />
  );
}
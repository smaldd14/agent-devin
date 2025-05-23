import { useEffect, useState } from 'react';
import { useGenerateShoppingList } from '@hooks/useGenerateShoppingList';
import type { ShoppingListItem } from '@/types/shopping-list';
import { AmazonFreshLinkGenerator } from '@lib/AmazonFreshLink';
import { ShoppingListDrawer } from '@components/ShoppingListDrawer';
import { toast } from 'sonner';
import { createShoppingListWithItems } from '@services/shopping-lists';

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
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generate([recipeId]);
    }
  }, [isOpen, generate, recipeId]);

  useEffect(() => {
    if (data) {
      setItems(data);
    }
  }, [data]);

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
      title="Generate Shopping List"
      description="Review and edit your shopping items"
      items={items}
      onItemsChange={setItems}
      loading={loading}
      loadingText="Generating shopping list..."
      error={error || undefined}
      onRetry={() => generate([recipeId])}
      actions={[
        {
          label: 'Generate Amazon Fresh Link',
          onClick: handleGenerateLink,
          disabled: loading || !!error,
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
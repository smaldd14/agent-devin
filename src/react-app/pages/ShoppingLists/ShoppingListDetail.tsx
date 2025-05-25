// src/react-app/pages/ShoppingLists/ShoppingListDetail.tsx
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  getShoppingList,
  addShoppingListItem,
  deleteShoppingListItem,
  deleteShoppingList,
} from '@services/shopping-lists';
import type { ShoppingList, ShoppingListItem } from '@/types/api';
import type { NewShoppingListItem } from '@services/shopping-lists';
import { AmazonFreshLinkGenerator } from '@lib/AmazonFreshLink';
import { Button } from '@components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerClose,
} from '@components/ui/drawer';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Trash2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@components/ui/table';
import { Checkbox } from '@/react-app/components/ui/checkbox';
import { cn } from '@lib/utils';

/**
 * Page to display details of a single shopping list.
 */
export default function ShoppingListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const listId = Number(id);
  const [list, setList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<number, boolean>>({});
  const [newItem, setNewItem] = useState<NewShoppingListItem>({
    item_name: '',
    quantity: undefined,
    unit: '',
    category: '',
    brand: '',
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  // Refs for focusing the item name input (inline and drawer)
  const inlineNameRef = useRef<HTMLInputElement>(null);
  const drawerNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getShoppingList(listId)
      .then((data) => setList(data))
      .catch((err: any) => setError(err.message || 'Failed to fetch list'))
      .finally(() => setLoading(false));
  }, [id]);
  // When drawer opens, focus the item name input inside it
  useEffect(() => {
    if (drawerOpen) {
      drawerNameRef.current?.focus();
    }
  }, [drawerOpen]);

  const handleGenerateLink = () => {
    if (!list) return;
    const generator = new AmazonFreshLinkGenerator();
    // Map API items to generator format
    const formattedItems = (list.items ?? []).map((item: ShoppingListItem) => ({
      itemName: item.item_name,
      quantity: item.quantity ?? 0,
      unit: item.unit ?? '',
      brand: item.brand ?? '',
    }));
    const url = generator.generateLink({ items: formattedItems });
    window.open(url, '_blank');
  };

  // Optimistic add item: immediately update UI, call API in background, and toast result
  const handleAddItem = () => {
    if (!newItem.item_name) {
      toast.error('Item name is required');
      return;
    }
    const itemData = { ...newItem };
    // Reset input fields
    setNewItem({ item_name: '', quantity: undefined, unit: '', category: '', brand: '' });
    // Create a temporary item for optimistic UI
    const tempId = -Date.now();
    const tempItem: ShoppingListItem = {
      id: tempId,
      shopping_list_id: listId,
      item_name: itemData.item_name,
      quantity: itemData.quantity,
      unit: itemData.unit,
      category: itemData.category,
      brand: itemData.brand,
      created_at: new Date().toISOString(),
    };
    // Optimistically add to list
    setList((prev) =>
      prev
        ? { ...prev, items: [...(prev.items ?? []), tempItem] }
        : prev
    );
    // Refocus input for quick entry
    inlineNameRef.current?.focus();
    drawerNameRef.current?.focus();
    // Call API in background
    addShoppingListItem(listId, itemData)
      .then((added) => {
        // Replace temp item with server item
        setList((prev) => {
          if (!prev) return prev;
          const items = (prev.items ?? []).map((it) =>
            it.id === tempId ? added : it
          );
          return { ...prev, items };
        });
        toast.success('Item added');
      })
      .catch((err: any) => {
        // Rollback on error
        setList((prev) => {
          if (!prev) return prev;
          const items = (prev.items ?? []).filter((it) => it.id !== tempId);
          return { ...prev, items };
        });
        toast.error(err.message || 'Failed to add item');
      });
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    setLoading(true);
    setError(null);
    try {
      await deleteShoppingListItem(listId, itemId);
      const updated = await getShoppingList(listId);
      setList(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };
  // Delete the entire shopping list
  const handleDeleteList = async () => {
    if (!window.confirm('Are you sure you want to delete this shopping list?')) return;
    try {
      await deleteShoppingList(listId);
      toast.success('Shopping list deleted');
      navigate('/shopping-lists');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete shopping list');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!list) return <p className="text-muted-foreground">List not found.</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shopping List #{list.id}</h1>
      <div className="mb-4 flex justify-between items-center">
        <Button onClick={handleGenerateLink}>Generate Amazon Fresh Link</Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={handleDeleteList}
          title="Delete shopping list"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {/* Mobile Add Item Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="bottom">
        <DrawerTrigger asChild>
          <Button variant="secondary" className="fixed bottom-4 right-4 rounded-full p-3 sm:hidden">
            <Plus className="h-6 w-6" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add Item</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" className="ml-auto">
                <X className="h-6 w-6" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddItem();
            }}
            className="px-4 flex flex-col flex-1"
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="drawer_item_name">Item</Label>
                <Input
                  id="drawer_item_name"
                  ref={drawerNameRef}
                  value={newItem.item_name}
                  onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="drawer_quantity">Qty</Label>
                <Input
                  id="drawer_quantity"
                  type="number"
                  value={newItem.quantity ?? ''}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      quantity: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="drawer_unit">Unit</Label>
                <Input
                  id="drawer_unit"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="drawer_brand">Brand</Label>
                <Input
                  id="drawer_brand"
                  value={newItem.brand}
                  onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                />
              </div>
            </div>
            <DrawerFooter>
              <Button type="submit" className="w-full">
                Add Item
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddItem();
        }}
        className="mb-6 hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div>
          <Label htmlFor="item_name">Item</Label>
          <Input
            id="item_name"
            ref={inlineNameRef}
            value={newItem.item_name}
            onChange={(e) =>
              setNewItem({ ...newItem, item_name: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="quantity">Qty</Label>
          <Input
            id="quantity"
            type="number"
            value={newItem.quantity ?? ''}
            onChange={(e) =>
              setNewItem({
                ...newItem,
                quantity: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            value={newItem.unit}
            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            value={newItem.brand}
            onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
          />
        </div>
        <Button type="submit" className="sm:col-span-2 lg:col-span-4">
          <Plus className="mr-1 h-4 w-4" /> Add Item
        </Button>
      </form>
      <div className="overflow-y-auto max-h-[60vh]">
        <Table>
        <TableHeader>
        <TableRow>
            <TableHead className="hidden sm:table-cell"></TableHead>
            <TableHead>Item</TableHead>
            <TableHead className='hidden sm:table-cell text-start'>Brand</TableHead>
            <TableHead className="hidden sm:table-cell">Qty</TableHead>
            <TableHead className="hidden sm:table-cell">Unit</TableHead>
            <TableHead>Actions</TableHead>
        </TableRow>
        </TableHeader>
        <TableBody>
          {list.items?.map((item) => (
            <TableRow
              key={item.id}
              className={cn(
                completed[item.id] ? 'opacity-50' : '',
                'hover:cursor-pointer'
              )}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                // Skip toggling when clicking on buttons or the checkbox itself
                if (target.closest('button') || target.closest('[data-slot="checkbox"]')) {
                  return;
                }
                setCompleted((prev) => ({
                  ...prev,
                  [item.id]: !prev[item.id],
                }));
              }}
            >
              <TableCell className="hidden sm:table-cell p-3">
                <Checkbox
                  checked={!!completed[item.id]}
                  onCheckedChange={(checked) =>
                    setCompleted((prev) => ({
                      ...prev,
                      [item.id]: Boolean(checked),
                    }))
                  }
                />
              </TableCell>
              <TableCell className="p-3 align-top">
                <div className="flex flex-col">
                  <span className="text-base font-medium">{item.item_name}</span>
                  {item.brand && (
                    <span className="mt-1 text-sm text-muted-foreground sm:hidden">
                      {item.brand}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className='hidden sm:table-cell p-3 text-start'>
                {item.brand}
              </TableCell>
              <TableCell className="hidden sm:table-cell p-3">{item.quantity}</TableCell>
              <TableCell className="hidden sm:table-cell p-3">{item.unit}</TableCell>
              <TableCell className="p-3">
                <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </div>
    </div>
  );
}
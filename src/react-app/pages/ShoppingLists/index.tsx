// src/react-app/pages/ShoppingLists/index.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getShoppingLists, createShoppingListWithItems } from '@services/shopping-lists';
import type { ShoppingList } from '@/types/api';
import { Button } from '@components/ui/button';

/**
 * Page to display paginated shopping lists.
 */
export default function ShoppingListsPage() {
  const navigate = useNavigate();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLists = async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getShoppingLists(pageNum, perPage);
      setLists(data.lists);
      setTotal(data.total);
      setPage(data.page);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch shopping lists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    setLoading(true);
    setError(null);
    try {
      const newList = await createShoppingListWithItems([]);
      navigate(`/shopping-lists/${newList.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create shopping list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists(page);
  }, [page]);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page * perPage < total) setPage(page + 1);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Shopping Lists</h1>
        <Button onClick={handleCreateNew}>New List</Button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-destructive">{error}</p>}
      {!loading && !error && lists.length === 0 && (
        <p>No shopping lists found.</p>
      )}
      {!loading && !error && lists.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {lists.map((list) => (
            <div
              key={list.id}
              className="relative p-4 border rounded cursor-pointer hover:shadow"
              onClick={() => navigate(`/shopping-lists/${list.id}`)}
            >
              
              <p className="font-medium">List #{list.id}</p>
              <p className="text-sm text-muted-foreground">
                Created: {new Date(list.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
      {/* Pagination controls */}
      <div className="flex justify-between items-center mt-4">
        <Button variant="outline" onClick={handlePrev} disabled={page <= 1}>
          Previous
        </Button>
        <span>Page {page}</span>
        <Button variant="outline" onClick={handleNext} disabled={page * perPage >= total}>
          Next
        </Button>
      </div>
    </div>
  );
}
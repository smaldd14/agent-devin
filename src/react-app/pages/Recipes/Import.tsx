import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateRecipeRequest } from '@/types/api';
import { scrapeRecipe, createRecipe } from '../../services/recipes';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';

const ImportRecipePage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [draft, setDraft] = useState<CreateRecipeRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const navigate = useNavigate();

  const handleScrape = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    setDraft(null);
    try {
      const res = await scrapeRecipe(url);
      if (res.success && res.data) {
        setDraft(res.data);
      } else {
        setError(res.error || 'Failed to scrape recipe');
      }
    } catch {
      setError('Failed to scrape recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    setSaveError('');
    try {
      const createRes = await createRecipe(draft);
      if (createRes.success && createRes.data) {
        navigate(`/recipes/${createRes.data.id}`);
      } else {
        setSaveError(createRes.error || 'Failed to save recipe');
      }
    } catch {
      setSaveError('Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Import Recipe</h1>
      <div className="mb-4">
        <Input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter recipe URL"
        />
        <Button onClick={handleScrape} disabled={loading} className="mt-2">
          {loading ? 'Scraping...' : 'Scrape'}
        </Button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
      {draft && (
        <div className="p-4 border rounded space-y-4">
          <h2 className="text-xl font-semibold">Preview</h2>
          <div>
            <label className="font-medium">Name</label>
            <Input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>
          <div>
            <label className="font-medium">Ingredients</label>
            {draft.ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-2 my-1">
                <Input
                  type="text"
                  value={ing.ingredient_name}
                  onChange={(e) => {
                    const list = [...draft.ingredients];
                    list[idx] = { ...ing, ingredient_name: e.target.value };
                    setDraft({ ...draft, ingredients: list });
                  }}
                  placeholder="Name"
                />
                <Input
                  type="number"
                  value={ing.quantity?.toString() || ''}
                  onChange={(e) => {
                    const list = [...draft.ingredients];
                    list[idx] = { ...ing, quantity: Number(e.target.value) };
                    setDraft({ ...draft, ingredients: list });
                  }}
                  placeholder="Qty"
                />
                <Input
                  type="text"
                  value={ing.unit}
                  onChange={(e) => {
                    const list = [...draft.ingredients];
                    list[idx] = { ...ing, unit: e.target.value };
                    setDraft({ ...draft, ingredients: list });
                  }}
                  placeholder="Unit"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="font-medium">Instructions</label>
            <textarea
              rows={6}
              className="w-full border rounded p-2"
              value={draft.instructions}
              onChange={(e) =>
                setDraft({ ...draft, instructions: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium">Cooking Time</label>
              <Input
                type="number"
                value={draft.cooking_time?.toString() || ''}
                onChange={(e) =>
                  setDraft({ ...draft, cooking_time: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="font-medium">Difficulty</label>
              <Input
                type="text"
                value={draft.difficulty || ''}
                onChange={(e) =>
                  setDraft({ ...draft, difficulty: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => navigate('/recipes')}
              disabled={saving}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Recipe'}
            </Button>
          </div>
          {saveError && <p className="text-red-500">{saveError}</p>}
        </div>
      )}
    </div>
  );
};

export default ImportRecipePage;
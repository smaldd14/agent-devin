import React, { useState } from 'react';
import { Button } from '@components/ui/button';

// Define available filter options
const dietaryOptions = [
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Gluten-Free', value: 'glutenFree' },
];
const cuisineOptions = [
  { label: 'Italian', value: 'italian' },
  { label: 'Mexican', value: 'mexican' },
  { label: 'Chinese', value: 'chinese' },
  { label: 'Indian', value: 'indian' },
];
const siteOptions = [
  { label: 'AllRecipes', value: 'allrecipes.com' },
  { label: 'Food Network', value: 'foodnetwork.com' },
  { label: 'Brocc Your Body', value: 'broccyourbody.com' },
];

/**
 * Values shape for preferences form
 */
export interface PreferencesFormValues {
  dietary: string[];
  cuisine: string[];
  sites: string[];
}

interface PreferencesFormProps {
  initialValues: PreferencesFormValues;
  onSubmit: (values: PreferencesFormValues) => Promise<void> | void;
  onClose?: () => void;
}

/**
 * Reusable preferences form for swipe filters
 */
export default function PreferencesForm({ initialValues, onSubmit, onClose }: PreferencesFormProps) {
  const [dietary, setDietary] = useState<string[]>(initialValues.dietary);
  const [cuisines, setCuisines] = useState<string[]>(initialValues.cuisine);
  const [sites, setSites] = useState<string[]>(initialValues.sites);
  const [loading, setLoading] = useState(false);

  const toggleOption = (
    value: string,
    list: string[],
    setList: (vals: string[]) => void
  ) => {
    if (list.includes(value)) {
      setList(list.filter((v) => v !== value));
    } else {
      setList([...list, value]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({ dietary, cuisine: cuisines, sites:  sites });
    setLoading(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <div className='flex flex-col space-y-4'>
        <h3 className="font-medium mb-2">Dietary</h3>
        <div className="space-y-1">
          {dietaryOptions.map((opt) => (
            <label key={opt.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={opt.value}
                checked={dietary.includes(opt.value)}
                onChange={() => toggleOption(opt.value, dietary, setDietary)}
                className="form-checkbox h-4 w-4"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className='flex flex-col space-y-4'>
        <h3 className="font-medium mb-2">Cuisine</h3>
        <div className="space-y-1">
          {cuisineOptions.map((opt) => (
            <label key={opt.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={opt.value}
                checked={cuisines.includes(opt.value)}
                onChange={() => toggleOption(opt.value, cuisines, setCuisines)}
                className="form-checkbox h-4 w-4"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className='flex flex-col space-y-4'>
        <h3 className="font-medium mb-2">Websites</h3>
        <div className="space-y-1">
          {siteOptions.map((opt) => (
            <label key={opt.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={opt.value}
                checked={sites.includes(opt.value)}
                onChange={() => toggleOption(opt.value, sites, setSites)}
                className="form-checkbox h-4 w-4"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Applying...' : 'Apply Filters'}
        </Button>
      </div>
    </form>
  );
}
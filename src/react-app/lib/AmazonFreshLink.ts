import { gzip } from 'pako';
import { Buffer } from 'buffer';

// Define the interfaces equivalent to the Python types
interface ShoppingListItem {
  itemName: string;  // Changed from item_name to match your input format
  quantity: number;
  unit: string;
  brand: string;
}

interface GeneratedShoppingList {
  items: ShoppingListItem[];
}

export class AmazonFreshLinkGenerator {
  private readonly UNITS: Set<string> = new Set([
    "count",
    "cups",
    "fl_oz",
    "gallons",
    "grams",
    "kilograms",
    "liters",
    "milliliters",
    "ounces",
    "pints",
    "pounds",
    "quarts",
    "tbsp",
    "tsp"
  ]);

  private readonly base_url: string = "https://www.amazon.com/afx/ingredients/landingencoded";

  /**
   * Convert units to Amazon Fresh format.
   */
  private _convertUnitToAmazonFormat(unit: string): string {
    const unitMapping: Record<string, string> = {
      "g": "grams",
      "kg": "kilograms",
      "oz": "ounces",
      "lb": "pounds",
      "ml": "milliliters",
      "l": "liters",
      "cup": "cups",
      "tbsp": "tbsp",
      "tsp": "tsp",
      "count": "count",
      "piece": "count",
      "pieces": "count",
      "tablespoon": "tbsp",
      "teaspoon": "tsp",
      "clove": "count"
    };
    
    const convertedUnit = unitMapping[unit.toLowerCase()] || "count";
    return this.UNITS.has(convertedUnit) ? convertedUnit : "count";
  }

  /**
   * Convert shopping list items to Amazon Fresh ingredients format.
   */
  private _convertToIngredientsFormat(shoppingList: GeneratedShoppingList): { ingredients: Array<{ name: string; brand?: string; quantityList?: Array<{ unit: string; amount: number }> }> } {
    const ingredients = shoppingList.items.map(item => {
      const ingredient: {
        name: string;
        brand?: string;
        quantityList?: Array<{ unit: string; amount: number }>;
      } = {
        name: item.itemName  // Changed from item_name to itemName
      };

      // Add brand information if available
      if (item.brand) {
        ingredient.brand = item.brand;
      }

      if (item.quantity !== undefined && item.unit !== undefined) {
        const unit = this._convertUnitToAmazonFormat(item.unit);
        ingredient.quantityList = [{
          unit,
          amount: item.quantity
        }];
      }

      return ingredient;
    });

    return { ingredients };
  }

  /**
   * Encode JSON data into a URL-safe base64 gzip-compressed format.
   */
  private _encodeCustomFormat(jsonData: Record<string, any>): string {
    // Convert JSON to string then to Uint8Array
    const jsonString = JSON.stringify(jsonData);
    const jsonBytes = new TextEncoder().encode(jsonString);
    
    // Compress with gzip
    const compressedData = gzip(jsonBytes, { level: 9 });
    
    // Convert to base64 and make URL safe
    const base64Encoded = Buffer.from(compressedData).toString('base64');
    const urlSafeBase64 = base64Encoded
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    return urlSafeBase64;
  }

  /**
   * Generate Amazon Fresh shopping link from shopping list.
   */
  public generateLink(shoppingList: GeneratedShoppingList): string {
    // Convert shopping list to Amazon Fresh format
    const ingredientsData = this._convertToIngredientsFormat(shoppingList);
    
    // Encode the data
    const encodedIngredients = this._encodeCustomFormat(ingredientsData);
    
    // Generate the full URL
    return `${this.base_url}?encodedIngredients=${encodedIngredients}`;
  }
}
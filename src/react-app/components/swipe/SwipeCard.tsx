// FixedSwipeCard.tsx - with correct type handling
import { useState } from 'react';
import { SwipeRecipeCard } from '@/types/api';
import { Card, CardContent, CardFooter } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Clock, ChefHat, Info, UtensilsCrossed } from 'lucide-react';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  DrawerTrigger 
} from '@components/ui/drawer';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
  SheetTrigger
} from '@components/ui/sheet';

// Update the SwipeRecipeCard interface to allow string or string[] for ingredients
interface ExtendedSwipeCardProps {
  recipe: Omit<SwipeRecipeCard, 'ingredients'> & {
    ingredients?: string[] | string | undefined;
  };
}

export default function SwipeCard({ recipe }: ExtendedSwipeCardProps) {
  // Use media query to determine if we're on mobile or desktop
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  // State to track if description is expanded
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Toggle description expansion
  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };
  
  // Function to render ingredient list
  const renderIngredients = () => {
    if (!recipe.ingredients) {
      return <p className="text-gray-500 italic">No ingredients information available</p>;
    }
    
    // Parse ingredients if it's a string
    const ingredientList = Array.isArray(recipe.ingredients) 
      ? recipe.ingredients 
      : typeof recipe.ingredients === 'string'
        ? recipe.ingredients.split(',').map(item => item.trim())
        : [];
    
    if (ingredientList.length === 0) {
      return <p className="text-gray-500 italic">No ingredients information available</p>;
    }
    
    return (
      <ul className="space-y-3">
        {ingredientList.map((ingredient, index) => (
          <li key={index} className="flex items-start">
            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-primary mt-1.5 mr-3 flex-shrink-0"></span>
            <span className="text-sm">{ingredient}</span>
          </li>
        ))}
      </ul>
    );
  };

  // Component to render the ingredients content (used in both Drawer and Sheet)
  const IngredientsContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Ingredients</h3>
        {renderIngredients()}
      </div>
      
      {recipe.servingSize && (
        <div className="text-sm text-gray-500 flex items-center pb-2">
          <span className="font-medium mr-2">Serves:</span> 
          <span>{recipe.servingSize}</span>
        </div>
      )}
    </div>
  );
  
  // Render different component based on screen size
  const IngredientsButton = () => {
    // Only render the button if there are ingredients
    if (!recipe.ingredients) {
      return null;
    }
    
    // On desktop we use Sheet (side panel)
    if (isDesktop) {
      return (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 w-full">
              <UtensilsCrossed className="h-4 w-4" />
              Ingredients
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <div className="h-full flex flex-col">
              <SheetHeader className="pb-4">
                <SheetTitle>{recipe.name}</SheetTitle>
                <SheetDescription>
                  Ingredients for this recipe
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto py-4 pr-2">
                <IngredientsContent />
              </div>
              <SheetFooter className="pt-4 mt-auto">
                <SheetClose asChild>
                  <Button variant="outline">Close</Button>
                </SheetClose>
              </SheetFooter>
            </div>
          </SheetContent>
        </Sheet>
      );
    }
    
    // On mobile we use Drawer (bottom panel)
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 w-full">
            <UtensilsCrossed className="h-4 w-4" />
            Ingredients
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[66vh]"> {/* Limit height to 2/3 of viewport */}
          <div className="max-h-[calc(66vh-10rem)] overflow-y-auto px-4 py-4"> {/* Make content scrollable */}
            <DrawerHeader className="p-0 mb-4"> {/* Remove default padding */}
              <DrawerTitle>{recipe.name}</DrawerTitle>
              <DrawerDescription>
                Ingredients for this recipe
              </DrawerDescription>
            </DrawerHeader>
            <div className="py-2">
              <IngredientsContent />
            </div>
          </div>
          <DrawerFooter className="pt-2 px-4 pb-5"> {/* Adjusted padding */}
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  };

  return (
    <Card className="w-full h-full overflow-hidden shadow-lg flex flex-col">
      {/* Image Section - Takes most of the available space */}
      <div className="relative w-full flex-grow min-h-[200px] bg-gray-100">
        {recipe.image ? (
          <img 
            src={recipe.image} 
            alt={recipe.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback image handling
              e.currentTarget.src = 'https://placehold.co/400x300/e2e8f0/64748b?text=Recipe+Image';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
        
        {/* Recipe info overlay at the bottom of the image */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
          <h2 className="text-xl font-bold line-clamp-2 mb-1">{recipe.name}</h2>
          
          {/* Tags for additional info */}
          <div className="flex flex-wrap gap-2 mt-2">
            {recipe.cookTime && (
              <span className="inline-flex items-center rounded-full bg-black/30 px-2 py-1 text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {recipe.cookTime}
              </span>
            )}
            {recipe.difficulty && (
              <span className="inline-flex items-center rounded-full bg-black/30 px-2 py-1 text-xs">
                <ChefHat className="w-3 h-3 mr-1" />
                {recipe.difficulty}
              </span>
            )}
            {recipe.cuisine && (
              <span className="inline-flex items-center rounded-full bg-black/30 px-2 py-1 text-xs">
                {recipe.cuisine}
              </span>
            )}
          </div>
        </div>

        {/* Source badge at top right */}
        {recipe.domain && (
          <div className="absolute top-2 right-2 bg-black/50 text-white rounded-full px-2 py-1 text-xs flex items-center z-10">
            {recipe.favicon && (
              <img src={recipe.favicon} alt="" className="w-3 h-3 mr-1" loading="lazy" />
            )}
            <span>{recipe.domain}</span>
          </div>
        )}
      </div>

      {/* Description section with show more/less functionality */}
      {recipe.description && (
        <CardContent className="p-4 pt-4">
          <div className="relative">
            <div className={`text-gray-600 text-sm overflow-hidden ${isDescriptionExpanded ? '' : 'line-clamp-2'}`}>
              {/* Handle HTML in description safely */}
              <div dangerouslySetInnerHTML={{ __html: recipe.description }} />
            </div>
            {recipe.description.length > 120 && (
              <button 
                onClick={toggleDescription}
                className="text-primary text-xs font-medium mt-1 focus:outline-none"
              >
                {isDescriptionExpanded ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>
        </CardContent>
      )}

      {/* Action buttons */}
      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        {/* Ingredients button */}
        <div className='w-full'>
          <IngredientsButton />
        </div>
        
        {/* View Recipe button */}
        <Button 
          asChild 
          variant="default"
          className='w-full'
        >
          <a 
            href={recipe.externalUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
          >
            <span>View Full Recipe</span>
            <Info className="h-4 w-4 ml-1" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
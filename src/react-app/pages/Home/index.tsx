// src/pages/Home/index.tsx
import { Link } from "react-router-dom";
import { BookOpen, Package, ShoppingCart } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/react-app/components/ui/card";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  linkTo: string;
  buttonText: string;
}

function FeatureCard({ title, description, icon, linkTo, buttonText }: FeatureCardProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* Additional content can go here */}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={linkTo}>{buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

const HomePage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-2">Kitchen Manager</h1>
      <p className="text-muted-foreground text-center mb-8">Organize your recipes, inventory, and shopping lists in one place</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <FeatureCard
          title="Recipes"
          description="Browse your collection of recipes or add new ones"
          icon={<BookOpen className="h-5 w-5" />}
          linkTo="/recipes"
          buttonText="View Recipes"
        />
        
        <FeatureCard
          title="Inventory"
          description="Manage your kitchen inventory and track items"
          icon={<Package className="h-5 w-5" />}
          linkTo="/inventory"
          buttonText="View Inventory"
        />
        
        <FeatureCard
          title="Shopping Lists"
          description="Create and manage shopping lists for your next grocery trip"
          icon={<ShoppingCart className="h-5 w-5" />}
          linkTo="/shopping-lists"
          buttonText="View Shopping Lists"
        />
      </div>
    </div>
  );
};

export default HomePage;
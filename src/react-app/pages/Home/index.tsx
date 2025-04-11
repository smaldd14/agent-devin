// src/pages/Home/index.tsx

import { Button } from "@/react-app/components/ui/button";

const HomePage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Welcome Home</h1>
      <Button>
        Click Me
      </Button>
    </div>
  );
};

export default HomePage;

import React from 'react';
import { Camera } from 'lucide-react';
import { categories } from '@/data/categories';
import CategoryCard from './CategoryCard';

interface CategoryLandingProps {
  onCategorySelect: (categoryId: string) => void;
}

const CategoryLanding: React.FC<CategoryLandingProps> = ({ onCategorySelect }) => {
  return (
    <div className="min-h-screen p-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Camera className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold gradient-text">
            Taswira AI
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Transform your photos with AI-powered professional styles
        </p>
      </div>

      {/* Categories Grid */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold text-center mb-8">
          Choose Your Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              {...category}
              onClick={() => onCategorySelect(category.id)}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 mt-16 border-t border-border/20">
        <p className="text-muted-foreground">
          Powered by <span className="font-semibold text-primary">Vision.AI</span>
        </p>
      </footer>
    </div>
  );
};

export default CategoryLanding;

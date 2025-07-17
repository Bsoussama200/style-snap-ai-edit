
import React from 'react';
import { Camera } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import CategoryCard from './CategoryCard';
import { RefreshCw } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CategoryLandingProps {
  onCategorySelect: (categoryId: string) => void;
}

const CategoryLanding: React.FC<CategoryLandingProps> = ({ onCategorySelect }) => {
  const { data: categories, isLoading, error } = useCategories();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading categories: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 relative">
        {/* Admin button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin')}
          className="absolute top-0 right-0 text-xs text-muted-foreground hover:text-foreground"
        >
          Admin ?
        </Button>
        
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
        {categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              // Get the icon component from lucide-react
              const IconComponent = (LucideIcons as any)[category.icon_name || 'Package'] || LucideIcons.Package;
              
              return (
                <CategoryCard
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  description={category.description || ''}
                  icon={IconComponent}
                  imageUrl={category.image_url || '/placeholder.svg'}
                  onClick={() => onCategorySelect(category.id)}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No categories available.</p>
          </div>
        )}
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


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  imageUrl: string;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  description,
  icon: Icon,
  imageUrl,
  onClick,
}) => {
  return (
    <Card
      className="glass-card cursor-pointer hover-lift transition-all hover:bg-card/70 overflow-hidden"
      onClick={onClick}
    >
      <div className="aspect-[4/3] w-full overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <Icon className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-semibold">{name}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;

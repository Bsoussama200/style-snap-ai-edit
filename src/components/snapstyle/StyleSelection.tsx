
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StyleOption } from '@/types/snapstyle';
import { styleOptions } from '@/constants/styleOptions';

interface StyleSelectionProps {
  selectedStyle: string;
  onStyleSelect: (styleId: string) => void;
}

const StyleSelection: React.FC<StyleSelectionProps> = ({
  selectedStyle,
  onStyleSelect
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-6">
        Choose Your Style
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {styleOptions.map((style) => (
          <Card
            key={style.id}
            className={`glass-card cursor-pointer hover-lift transition-all ${
              selectedStyle === style.id 
                ? 'ring-2 ring-primary bg-primary/10' 
                : 'hover:bg-card/70'
            }`}
            onClick={() => onStyleSelect(style.id)}
          >
            <CardContent className="p-4 space-y-3">
              <img 
                src={style.sampleImage} 
                alt={`${style.name} example`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <div className="text-center space-y-2">
                <div className="text-primary">
                  {style.icon}
                </div>
                <h3 className="font-semibold">{style.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {style.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StyleSelection;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { categories } from '@/data/categories';
import StyleForm from './StyleForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const StyleManagement = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

  const handleDeleteStyle = (styleId: string) => {
    if (confirm('Are you sure you want to delete this style?')) {
      // TODO: Implement delete functionality
      console.log('Delete style:', styleId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">Styles</h2>
          <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Style
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Style</DialogTitle>
            </DialogHeader>
            <StyleForm 
              categoryId={selectedCategoryId} 
              onClose={() => setIsAddDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {selectedCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedCategory.styles.map((style) => (
            <Card key={style.id} className="overflow-hidden">
              <div className="aspect-square w-full overflow-hidden">
                <img 
                  src={style.placeholder} 
                  alt={style.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>{style.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {style.description}
                </p>
                <p className="text-xs text-muted-foreground mb-4 truncate">
                  Prompt: {style.prompt}
                </p>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="w-3 h-3" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Style</DialogTitle>
                      </DialogHeader>
                      <StyleForm 
                        categoryId={selectedCategoryId}
                        style={style}
                        onClose={() => {}}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => handleDeleteStyle(style.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StyleManagement;

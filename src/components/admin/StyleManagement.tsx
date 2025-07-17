
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import StyleForm from './StyleForm';
import { useCategories } from '@/hooks/useCategories';
import { useStyles, useDeleteStyle, DatabaseStyle } from '@/hooks/useStyles';

const StyleManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<DatabaseStyle | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  
  const { data: categories } = useCategories();
  const { data: styles, isLoading, error } = useStyles(selectedCategoryId === 'all' ? undefined : selectedCategoryId);
  const deleteStyle = useDeleteStyle();

  console.log('StyleManagement Debug:', {
    selectedCategoryId,
    stylesCount: styles?.length || 0,
    styles,
    categories,
    isLoading,
    error
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this style?')) {
      deleteStyle.mutate(id);
    }
  };

  const handleEdit = (style: DatabaseStyle) => {
    setEditingStyle(style);
  };

  const closeEditDialog = () => {
    setEditingStyle(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading styles: {error.message}
      </div>
    );
  }

  const selectedCategory = categories?.find(cat => cat.id === selectedCategoryId);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Style Management</CardTitle>
            <CardDescription>Manage styles for each category</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" disabled={selectedCategoryId === 'all'}>
                  <Plus className="w-4 h-4" />
                  Add Style
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Style for {selectedCategory?.name}</DialogTitle>
                </DialogHeader>
                <StyleForm 
                  categoryId={selectedCategoryId} 
                  onClose={() => setIsCreateDialogOpen(false)} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!styles || styles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              {selectedCategoryId === 'all' 
                ? 'No styles found. Create your first style by selecting a category and clicking "Add Style".'
                : `No styles found for ${selectedCategory?.name || 'this category'}. Click "Add Style" to create one.`
              }
            </p>
            {selectedCategoryId !== 'all' && (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create First Style
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {styles.map((style) => {
                const category = categories?.find(cat => cat.id === style.category_id);
                return (
                  <TableRow key={style.id}>
                    <TableCell>
                      {style.placeholder && (
                        <img 
                          src={style.placeholder} 
                          alt={style.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{style.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{style.description}</TableCell>
                    <TableCell>{category?.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(style)}
                          className="gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(style.id)}
                          disabled={deleteStyle.isPending}
                          className="gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {editingStyle && (
          <Dialog open={!!editingStyle} onOpenChange={closeEditDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Style</DialogTitle>
              </DialogHeader>
              <StyleForm 
                categoryId={editingStyle.category_id}
                style={editingStyle} 
                onClose={closeEditDialog} 
              />
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default StyleManagement;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { useCreateCategory, useUpdateCategory, DatabaseCategory } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CategoryFormProps {
  category?: DatabaseCategory;
  onClose: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onClose }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    image_url: category?.image_url || '',
    icon_name: category?.icon_name || 'Package',
  });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const { toast } = useToast();

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('style-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('style-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalImageUrl = formData.image_url;

    // Upload new image if one was selected
    if (selectedFile) {
      const uploadedUrl = await uploadImage(selectedFile);
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      } else {
        // Don't submit if image upload failed
        return;
      }
    }

    const submitData = {
      ...formData,
      image_url: finalImageUrl,
    };
    
    if (category) {
      updateCategory.mutate({ id: category.id, ...submitData }, {
        onSuccess: () => onClose()
      });
    } else {
      createCategory.mutate(submitData, {
        onSuccess: () => onClose()
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image_url: previewUrl }));
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
    // Reset file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const isLoading = createCategory.isPending || updateCategory.isPending || uploading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter category name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter category description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon_name">Icon Name</Label>
        <Input
          id="icon_name"
          value={formData.icon_name}
          onChange={(e) => setFormData(prev => ({ ...prev, icon_name: e.target.value }))}
          placeholder="Enter Lucide icon name (e.g., Package, ShoppingBag)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Category Image</Label>
        <div className="flex items-center gap-4">
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('image')?.click()}
            className="gap-2"
            disabled={uploading}
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Image'}
          </Button>
          {formData.image_url && (
            <div className="relative">
              <img 
                src={formData.image_url} 
                alt="Preview" 
                className="w-16 h-16 object-cover rounded"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                onClick={removeImage}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
        {selectedFile && (
          <p className="text-sm text-muted-foreground">
            New image selected: {selectedFile.name}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {uploading ? 'Uploading...' : isLoading ? 'Saving...' : (category ? 'Update' : 'Create')} Category
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { useCreateStyle, useUpdateStyle, DatabaseStyle } from '@/hooks/useStyles';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StyleFormProps {
  categoryId: string;
  style?: DatabaseStyle;
  onClose: () => void;
}

const StyleForm: React.FC<StyleFormProps> = ({ categoryId, style, onClose }) => {
  const [formData, setFormData] = useState({
    name: style?.name || '',
    description: style?.description || '',
    prompt: style?.prompt || '',
    placeholder: style?.placeholder || '',
  });
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(style?.placeholder || '');

  const createStyle = useCreateStyle();
  const updateStyle = useUpdateStyle();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (style) {
      updateStyle.mutate({ id: style.id, ...formData }, {
        onSuccess: () => onClose()
      });
    } else {
      createStyle.mutate({ ...formData, category_id: categoryId }, {
        onSuccess: () => onClose()
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `styles/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('style-images')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('style-images')
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      // Update form data and preview
      setFormData(prev => ({ ...prev, placeholder: imageUrl }));
      setPreviewUrl(imageUrl);

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const isLoading = createStyle.isPending || updateStyle.isPending || uploading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Style Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter style name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter style description"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompt">AI Prompt</Label>
        <Textarea
          id="prompt"
          value={formData.prompt}
          onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
          placeholder="Enter the AI prompt for this style"
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Style Image</Label>
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
          {previewUrl && (
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-16 h-16 object-cover rounded"
            />
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (style ? 'Update' : 'Create')} Style
        </Button>
      </div>
    </form>
  );
};

export default StyleForm;

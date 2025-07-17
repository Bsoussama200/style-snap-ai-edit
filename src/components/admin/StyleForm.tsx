
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { StyleOption } from '@/data/categories';

interface StyleFormProps {
  categoryId: string;
  style?: StyleOption;
  onClose: () => void;
}

const StyleForm: React.FC<StyleFormProps> = ({ categoryId, style, onClose }) => {
  const [formData, setFormData] = useState({
    name: style?.name || '',
    description: style?.description || '',
    prompt: style?.prompt || '',
    placeholder: style?.placeholder || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement save functionality
    console.log('Save style:', { categoryId, ...formData });
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement image upload
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, placeholder: imageUrl }));
    }
  };

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
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('image')?.click()}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Image
          </Button>
          {formData.placeholder && (
            <img 
              src={formData.placeholder} 
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
        <Button type="submit">
          {style ? 'Update' : 'Create'} Style
        </Button>
      </div>
    </form>
  );
};

export default StyleForm;

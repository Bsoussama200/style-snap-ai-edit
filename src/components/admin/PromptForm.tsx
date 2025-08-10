
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DatabasePrompt, useCreatePrompt, useUpdatePrompt } from '@/hooks/usePrompts';

interface PromptFormProps {
  prompt?: DatabasePrompt | null;
  onClose: () => void;
}

const PromptForm: React.FC<PromptFormProps> = ({ prompt, onClose }) => {
  const [formData, setFormData] = useState({
    key: prompt?.key || '',
    label: prompt?.label || '',
    content: prompt?.content || '',
    description: prompt?.description || '',
  });

  const createPrompt = useCreatePrompt();
  const updatePrompt = useUpdatePrompt();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt) {
      updatePrompt.mutate({ id: prompt.id, ...formData }, { onSuccess: onClose });
    } else {
      createPrompt.mutate(formData, { onSuccess: onClose });
    }
  };

  const isLoading = createPrompt.isPending || updatePrompt.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="key">Key</Label>
        <Input
          id="key"
          value={formData.key}
          onChange={(e) => setFormData((p) => ({ ...p, key: e.target.value }))}
          placeholder="e.g., video_focus_suffix"
          required
          disabled={!!prompt}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) => setFormData((p) => ({ ...p, label: e.target.value }))}
          placeholder="Human readable label"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
          placeholder="Enter the prompt text..."
          className="min-h-[120px]"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          placeholder="Optional description"
          rows={2}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : prompt ? 'Update' : 'Create'} Prompt</Button>
      </div>
    </form>
  );
};

export default PromptForm;

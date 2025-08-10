
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import PromptForm from './PromptForm';
import { usePrompts, useDeletePrompt, DatabasePrompt } from '@/hooks/usePrompts';

const PromptsManagement: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<DatabasePrompt | null>(null);

  const { data: prompts, isLoading, error } = usePrompts();
  const deletePrompt = useDeletePrompt();

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this prompt?')) {
      deletePrompt.mutate(id);
    }
  };

  const handleEdit = (prompt: DatabasePrompt) => setEditingPrompt(prompt);
  const closeEditDialog = () => setEditingPrompt(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error loading prompts: {error.message}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Prompt Management</CardTitle>
            <CardDescription>Manage reusable prompts used across the app</CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Prompt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Prompt</DialogTitle>
              </DialogHeader>
              <PromptForm onClose={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Content</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prompts?.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.key}</TableCell>
                <TableCell className="font-medium">{p.label}</TableCell>
                <TableCell className="max-w-xs truncate">{p.description}</TableCell>
                <TableCell className="max-w-sm truncate">{p.content}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(p)} className="gap-1">
                      <Edit className="w-3 h-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(p.id)}
                      disabled={deletePrompt.isPending}
                      className="gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {editingPrompt && (
          <Dialog open={!!editingPrompt} onOpenChange={closeEditDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Prompt</DialogTitle>
              </DialogHeader>
              <PromptForm prompt={editingPrompt} onClose={closeEditDialog} />
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default PromptsManagement;

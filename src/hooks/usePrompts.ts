
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DatabasePrompt {
  id: string;
  key: string;
  label: string;
  content: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Fetch all prompts
export const usePrompts = () => {
  return useQuery({
    queryKey: ['prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('label');
      if (error) throw error;
      return data as DatabasePrompt[];
    },
  });
};

// Fetch a single prompt by key (for runtime usage in the app)
export const usePrompt = (key: string) => {
  return useQuery({
    queryKey: ['prompt', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('key', key)
        .maybeSingle();
      if (error) throw error;
      return data as DatabasePrompt | null;
    },
  });
};

export const useCreatePrompt = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (prompt: Omit<DatabasePrompt, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('prompts')
        .insert([prompt])
        .select()
        .single();
      if (error) throw error;
      return data as DatabasePrompt;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prompts'] });
      toast({ title: 'Success', description: 'Prompt created.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to create prompt: ${error.message}` , variant: 'destructive' });
    },
  });
};

export const useUpdatePrompt = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DatabasePrompt> & { id: string }) => {
      const { data, error } = await supabase
        .from('prompts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as DatabasePrompt;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['prompts'] });
      if (data?.key) qc.invalidateQueries({ queryKey: ['prompt', data.key] });
      toast({ title: 'Success', description: 'Prompt updated.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to update prompt: ${error.message}` , variant: 'destructive' });
    },
  });
};

export const useDeletePrompt = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prompts'] });
      toast({ title: 'Success', description: 'Prompt deleted.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to delete prompt: ${error.message}` , variant: 'destructive' });
    },
  });
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DatabaseStyle {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  prompt: string;
  placeholder?: string;
  created_at: string;
  updated_at: string;
}

export const useStyles = (categoryId?: string) => {
  return useQuery({
    queryKey: ['styles', categoryId],
    queryFn: async () => {
      let query = supabase.from('styles').select('*');
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      return data as DatabaseStyle[];
    },
  });
};

export const useCreateStyle = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (style: Omit<DatabaseStyle, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('styles')
        .insert([style])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['styles'] });
      toast({
        title: "Success",
        description: "Style created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create style: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateStyle = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DatabaseStyle> & { id: string }) => {
      const { data, error } = await supabase
        .from('styles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['styles'] });
      toast({
        title: "Success",
        description: "Style updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update style: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteStyle = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('styles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['styles'] });
      toast({
        title: "Success",
        description: "Style deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete style: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};


import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn } from 'lucide-react';

export const LoginButton = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <Button onClick={signInWithGoogle} className="flex items-center gap-2">
      <LogIn className="w-4 h-4" />
      Sign in with Google
    </Button>
  );
};

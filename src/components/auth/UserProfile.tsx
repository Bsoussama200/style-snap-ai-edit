
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, Coins, CreditCard, History } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserTokens {
  balance: number;
  total_purchased: number;
  total_consumed: number;
}

export const UserProfile = () => {
  const { user, signOut } = useAuth();
  const [tokens, setTokens] = useState<UserTokens | null>(null);
  const [showTokenPurchase, setShowTokenPurchase] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTokenBalance();
    }
  }, [user]);

  const fetchTokenBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('user_tokens')
        .select('balance, total_purchased, total_consumed')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setTokens(data);
    } catch (error) {
      console.error('Error fetching token balance:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account."
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out.",
        variant: "destructive"
      });
    }
  };

  if (!user) return null;

  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {user.user_metadata?.avatar_url && (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Profile" 
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <h3 className="font-semibold">{user.user_metadata?.full_name || user.email}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {tokens && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Coins className="w-6 h-6 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold">{tokens.balance}</p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CreditCard className="w-6 h-6 mx-auto mb-1 text-green-500" />
                <p className="text-2xl font-bold">{tokens.total_purchased}</p>
                <p className="text-sm text-muted-foreground">Purchased</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <History className="w-6 h-6 mx-auto mb-1 text-orange-500" />
                <p className="text-2xl font-bold">{tokens.total_consumed}</p>
                <p className="text-sm text-muted-foreground">Used</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => setShowTokenPurchase(!showTokenPurchase)}
                className="flex-1"
              >
                Buy Tokens
              </Button>
              <Button variant="outline" className="flex-1">
                View History
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

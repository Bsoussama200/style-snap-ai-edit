
import React, { useState } from 'react';
import { UserProfile } from '@/components/auth/UserProfile';
import { TokenPurchase } from '@/components/payments/TokenPurchase';
import SnapStyleAI from '@/components/SnapStyleAI';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, User, CreditCard } from 'lucide-react';

export const AuthenticatedApp = () => {
  const [activeTab, setActiveTab] = useState('generate');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="purchase" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Buy Tokens
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <SnapStyleAI />
          </TabsContent>

          <TabsContent value="profile">
            <div className="max-w-2xl mx-auto">
              <UserProfile />
            </div>
          </TabsContent>

          <TabsContent value="purchase">
            <div className="max-w-2xl mx-auto">
              <TokenPurchase />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

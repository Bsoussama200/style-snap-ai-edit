
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoryManagement from '@/components/admin/CategoryManagement';
import StyleManagement from '@/components/admin/StyleManagement';

const Admin = () => {
  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="styles">Styles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories">
            <CategoryManagement />
          </TabsContent>
          
          <TabsContent value="styles">
            <StyleManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

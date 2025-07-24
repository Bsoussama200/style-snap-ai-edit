
import React, { useState } from 'react';
import CategoryLanding from './CategoryLanding';
import StyleSelector from './StyleSelector';
import PaymentGate from './PaymentGate';

const SnapStyleAI = () => {
  const [currentView, setCurrentView] = useState<'categories' | 'styles'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [hasAccess, setHasAccess] = useState(false);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentView('styles');
  };

  const handleBackToCategories = () => {
    setCurrentView('categories');
    setSelectedCategory('');
  };

  const handlePaymentSuccess = () => {
    setHasAccess(true);
  };

  // Show payment gate if user doesn't have access
  if (!hasAccess) {
    return <PaymentGate onPaymentSuccess={handlePaymentSuccess} />;
  }

  if (currentView === 'styles' && selectedCategory) {
    return (
      <StyleSelector 
        categoryId={selectedCategory} 
        onBack={handleBackToCategories}
      />
    );
  }

  return (
    <CategoryLanding onCategorySelect={handleCategorySelect} />
  );
};

export default SnapStyleAI;

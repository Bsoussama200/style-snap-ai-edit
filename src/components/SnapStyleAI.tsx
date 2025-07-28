
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryLanding from './CategoryLanding';
import StyleSelector from './StyleSelector';

const SnapStyleAI = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    // Check if user has already paid
    const checkPaymentStatus = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentSuccess = urlParams.get('payment');
      
      if (paymentSuccess === 'success') {
        localStorage.setItem('taswira_paid', 'true');
        setHasAccess(true);
        return;
      }

      const hasPaid = localStorage.getItem('taswira_paid') === 'true';
      if (hasPaid) {
        setHasAccess(true);
      } else {
        navigate('/pay');
      }
    };

    checkPaymentStatus();
  }, [navigate]);

  // Show loading while checking payment status
  if (!hasAccess) {
    return null;
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

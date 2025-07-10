
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LandingPage } from '@/components/LandingPage';
import { AuthenticatedApp } from '@/components/AuthenticatedApp';
import { useLocation } from 'react-router-dom';

const Index = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show the app directly if user is authenticated OR if coming from skip auth
  const showApp = user || location.state?.skipAuth;

  return showApp ? <AuthenticatedApp /> : <LandingPage />;
};

export default Index;

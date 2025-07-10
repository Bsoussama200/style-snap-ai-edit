
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle OAuth callback on page load
    const handleOAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      } else if (data.session) {
        console.log('OAuth session found:', data.session);
        setSession(data.session);
        setUser(data.session.user);
        
        // Clean up the URL by removing the hash fragments
        if (window.location.hash) {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      }
      setLoading(false);
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // If user just signed in, clean up URL
        if (event === 'SIGNED_IN' && window.location.hash) {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      }
    );

    // Handle initial session
    handleOAuthCallback();

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

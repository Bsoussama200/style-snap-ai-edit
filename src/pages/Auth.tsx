
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Mail, Lock, User, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
      } else {
        // Sign up
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: "Google Sign-In Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Pre-fill test account - using a more realistic email format
  const fillTestAccount = () => {
    setEmail('testuser@example.com');
    setPassword('password123');
    setIsLogin(true);
  };

  // Create test account
  const createTestAccount = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: 'testuser@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User',
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Account exists!",
            description: "Test account already exists. You can now log in with it.",
          });
          fillTestAccount();
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Test account created!",
          description: "Test account has been created. You can now log in.",
        });
        fillTestAccount();
      }
    } catch (error: any) {
      toast({
        title: "Error creating test account",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Camera className="w-8 h-8 text-primary" />
            <CardTitle className="text-2xl font-bold">ProShot AI</CardTitle>
          </div>
          <p className="text-muted-foreground">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button 
            onClick={handleGoogleSignIn} 
            variant="outline" 
            className="w-full"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign in with Google
          </Button>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </Button>
          </div>

          {/* Test Account Helper */}
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                For testing purposes:
              </p>
            </div>
            <div className="space-y-2">
              <Button
                variant="ghost"
                onClick={createTestAccount}
                className="w-full text-xs"
                disabled={loading}
              >
                Create Test Account (testuser@example.com)
              </Button>
              <Button
                variant="ghost"
                onClick={fillTestAccount}
                className="w-full text-xs"
              >
                Fill Test Login Details
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Email: testuser@example.com | Password: password123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

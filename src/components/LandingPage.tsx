
import React from 'react';
import { LoginButton } from '@/components/auth/LoginButton';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Zap, Shield, Coins } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Camera className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold gradient-text">ProShot AI</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your product photos with AI-powered professional styles. 
            Get studio-quality images in seconds with our advanced AI technology.
          </p>
          <LoginButton />
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="glass-card text-center">
            <CardContent className="p-6">
              <Camera className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-muted-foreground">
                Advanced AI technology transforms your photos with professional quality
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card text-center">
            <CardContent className="p-6">
              <Zap className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Get professional results in seconds, not hours
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card text-center">
            <CardContent className="p-6">
              <Coins className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Token-Based</h3>
              <p className="text-muted-foreground">
                Pay only for what you use with our flexible token system
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card text-center">
            <CardContent className="p-6">
              <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Secure</h3>
              <p className="text-muted-foreground">
                Your photos and data are protected with enterprise-grade security
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Simple Token Pricing</h2>
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Basic</h3>
                <p className="text-3xl font-bold mb-2">10 <span className="text-sm font-normal">tokens</span></p>
                <p className="text-muted-foreground">5 TND</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-primary">
              <CardContent className="p-6 text-center">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  Popular
                </div>
                <h3 className="text-lg font-semibold mb-2">Standard</h3>
                <p className="text-3xl font-bold mb-2">25 <span className="text-sm font-normal">tokens</span></p>
                <p className="text-muted-foreground">10 TND</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Premium</h3>
                <p className="text-3xl font-bold mb-2">50 <span className="text-sm font-normal">tokens</span></p>
                <p className="text-muted-foreground">18 TND</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Enterprise</h3>
                <p className="text-3xl font-bold mb-2">100 <span className="text-sm font-normal">tokens</span></p>
                <p className="text-muted-foreground">30 TND</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

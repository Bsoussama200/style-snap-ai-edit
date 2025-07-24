import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CreditCard, Shield, Zap } from 'lucide-react';

interface PaymentGateProps {
  onPaymentSuccess: () => void;
}

const PaymentGate: React.FC<PaymentGateProps> = ({ onPaymentSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(true);

  useEffect(() => {
    // Check if user has already paid
    const checkPaymentStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentSuccess = urlParams.get('payment');
      
      if (paymentSuccess === 'success') {
        // Store payment success in localStorage
        localStorage.setItem('taswira_paid', 'true');
        onPaymentSuccess();
        return;
      }

      // Check localStorage for existing payment
      const hasPaid = localStorage.getItem('taswira_paid') === 'true';
      if (hasPaid) {
        onPaymentSuccess();
        return;
      }

      setIsCheckingPayment(false);
    };

    checkPaymentStatus();
  }, [onPaymentSuccess]);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('lemonsqueezy-payment', {
        body: { action: 'create-checkout' }
      });

      if (error) throw error;

      if (data.checkout_url) {
        // Open payment in new tab
        window.open(data.checkout_url, '_blank');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to create payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Checking payment status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Taswira AI</CardTitle>
          <CardDescription>
            Unlock professional AI-powered photo transformations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">€30</div>
            <div className="text-muted-foreground">One-time payment</div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-primary" />
              <span>Transform photos with AI-powered professional styles</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <span>Secure payment processing via LemonSqueezy</span>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <span>Instant access after payment</span>
            </div>
          </div>

          <Button 
            onClick={handlePayment} 
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Payment...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay €30 & Get Access
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By proceeding, you agree to our terms of service. 
            Payment is processed securely by LemonSqueezy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentGate;
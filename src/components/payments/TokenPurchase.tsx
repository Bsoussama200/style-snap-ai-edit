
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CreditCard, Smartphone, Building } from 'lucide-react';

interface TokenPackage {
  id: string;
  tokens: number;
  price: number;
  popular?: boolean;
}

const tokenPackages: TokenPackage[] = [
  { id: 'basic', tokens: 10, price: 5.00 },
  { id: 'standard', tokens: 25, price: 10.00, popular: true },
  { id: 'premium', tokens: 50, price: 18.00 },
  { id: 'enterprise', tokens: 100, price: 30.00 }
];

const paymentMethods = [
  { id: 'flouci', name: 'Flouci', icon: Smartphone, description: 'Mobile payment' },
  { id: 'd17', name: 'D17', icon: Building, description: 'Bank transfer' },
  { id: 'credit_card', name: 'Credit Card', icon: CreditCard, description: 'Visa/Mastercard' }
];

export const TokenPurchase = () => {
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    if (!selectedPackage || !selectedPayment || !user) {
      toast({
        title: "Please select a package and payment method",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const packageData = tokenPackages.find(pkg => pkg.id === selectedPackage);
      if (!packageData) throw new Error('Invalid package selected');

      // Create purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          amount: packageData.price,
          tokens_purchased: packageData.tokens,
          payment_method: selectedPayment,
          payment_status: 'pending'
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Simulate payment processing (in real app, integrate with actual payment providers)
      setTimeout(async () => {
        try {
          // Update purchase status to completed
          await supabase
            .from('purchases')
            .update({ payment_status: 'completed' })
            .eq('id', purchase.id);

          // Add token transaction
          await supabase
            .from('token_transactions')
            .insert({
              user_id: user.id,
              transaction_type: 'purchase',
              amount: packageData.tokens,
              description: `Purchased ${packageData.tokens} tokens`,
              reference_id: purchase.id
            });

          toast({
            title: "Purchase successful!",
            description: `${packageData.tokens} tokens have been added to your account.`
          });

          setSelectedPackage('');
          setSelectedPayment('');
        } catch (error) {
          console.error('Error completing purchase:', error);
          toast({
            title: "Purchase failed",
            description: "There was an error processing your payment.",
            variant: "destructive"
          });
        }
        setIsProcessing(false);
      }, 2000);

    } catch (error) {
      console.error('Error creating purchase:', error);
      toast({
        title: "Purchase failed",
        description: "There was an error creating your purchase.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Buy Tokens</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Token Packages */}
        <div>
          <h3 className="font-semibold mb-3">Select Token Package</h3>
          <RadioGroup value={selectedPackage} onValueChange={setSelectedPackage}>
            <div className="grid grid-cols-2 gap-3">
              {tokenPackages.map((pkg) => (
                <div key={pkg.id} className="relative">
                  <RadioGroupItem value={pkg.id} id={pkg.id} className="sr-only" />
                  <Label
                    htmlFor={pkg.id}
                    className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPackage === pkg.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                    <span className="text-2xl font-bold">{pkg.tokens}</span>
                    <span className="text-sm text-muted-foreground">tokens</span>
                    <span className="text-lg font-semibold">{pkg.price} TND</span>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Payment Methods */}
        <div>
          <h3 className="font-semibold mb-3">Payment Method</h3>
          <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <div key={method.id}>
                  <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                  <Label
                    htmlFor={method.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPayment === method.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    <method.icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-muted-foreground">{method.description}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <Button 
          onClick={handlePurchase} 
          disabled={!selectedPackage || !selectedPayment || isProcessing}
          className="w-full"
        >
          {isProcessing ? 'Processing...' : 'Purchase Tokens'}
        </Button>
      </CardContent>
    </Card>
  );
};

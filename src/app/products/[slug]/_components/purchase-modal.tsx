
'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/data';
import usePaystack from '@/hooks/use-paystack';
import { initializePaymentFlow } from '@/ai/flows/initialize-payment-flow';
import { Loader } from 'lucide-react';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export function PurchaseModal({ isOpen, onClose, product }: PurchaseModalProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0].size);
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const initializePaystackPayment = usePaystack();

  const handlePayment = async () => {
    if (!email || quantity < 1) {
      toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please enter a valid email and quantity.' });
      return;
    }
    setIsSubmitting(true);
    
    const sizeDetails = product.sizes.find(s => s.size === selectedSize);
    if (!sizeDetails) {
        toast({ variant: 'destructive', title: 'Error', description: 'Selected size not found.'});
        setIsSubmitting(false);
        return;
    }

    try {
      const amountInKobo = sizeDetails.price * quantity * 100;
      
      const txData = await initializePaymentFlow({
          email,
          amount: amountInKobo,
          productId: product.id,
          size: selectedSize,
          quantity,
      });

      initializePaystackPayment({
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email,
        amount: amountInKobo,
        reference: txData.reference,
        metadata: {
            product_id: product.id,
            product_name: product.name,
            size: selectedSize,
            quantity,
        },
        onClose: () => {
          setIsSubmitting(false);
          toast({ variant: 'default', title: 'Payment Cancelled', description: 'Your payment process was cancelled.' });
        },
        callback: () => {
          // Paystack will redirect to the callback_url set in the service
          // The verification will happen on that page.
          // We can close the modal here.
          onClose();
        },
      });

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Payment Error', description: error.message || 'Could not initiate payment.' });
      setIsSubmitting(false);
    }
  };
  
  const selectedPrice = product.sizes.find(s => s.size === selectedSize)?.price || 0;
  const totalPrice = selectedPrice * quantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Purchase {product.name}</DialogTitle>
          <DialogDescription>Complete the details below to make your purchase.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Select Size</Label>
            <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
              {product.sizes.map(size => (
                <div key={size.size} className="flex items-center space-x-2">
                  <RadioGroupItem value={size.size} id={size.size} />
                  <Label htmlFor={size.size}>
                    {size.size} - <span className="font-semibold">Ksh {size.price.toFixed(2)}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input 
                    id="quantity" 
                    type="number" 
                    value={quantity} 
                    onChange={e => setQuantity(Math.max(1, parseInt(e.target.value, 10)))}
                    min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Your Email</Label>
                <Input 
                    id="email" 
                    type="email" 
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
              </div>
          </div>
          
          <div className="text-right">
            <p className="text-muted-foreground">Total Price</p>
            <p className="text-2xl font-bold">Ksh {totalPrice.toFixed(2)}</p>
          </div>

        </div>
        <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handlePayment} disabled={isSubmitting}>
                {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                Proceed to Payment
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

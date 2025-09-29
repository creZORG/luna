
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Truck } from 'lucide-react';

interface WholesaleRedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WholesaleRedirectModal({ isOpen, onClose }: WholesaleRedirectModalProps) {
  
  const handleRedirect = () => {
    // In a real app, you would pass cart data to Tradinta
    window.open('https://tradinta.co.ke', '_blank');
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <Truck className="w-12 h-12 text-primary" />
          </div>
          <AlertDialogTitle className="text-center text-2xl">Wholesale Order Detected</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Your order quantity qualifies for wholesale pricing. You will be redirected to our partner platform, Tradinta.co.ke, to complete your purchase and benefit from bulk discounts.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleRedirect}>Proceed to Tradinta</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

    
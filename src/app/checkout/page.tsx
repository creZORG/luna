
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import CheckoutClient from './_components/checkout-client';

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline font-bold">Checkout</h1>
        <p className="text-muted-foreground mt-2">
          Almost there! Please confirm your order and enter your delivery details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
        <CheckoutClient />
      </div>
    </div>
  );
}

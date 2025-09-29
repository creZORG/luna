
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader, Percent, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { productService } from '@/services/product.service';
import { Product } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import PricingClient from './_components/pricing-client';

export default function ProductsAdminPage() {
  const [discount, setDiscount] = useState(0);
  const [moq, setMoq] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const fetchedProducts = await productService.getProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch products.'});
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [toast]);


  const handleSaveGlobalSettings = async () => {
    setIsSubmitting(true);
    try {
      // In a real app, you'd save these to a global settings document.
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      toast({
        title: 'Settings Updated',
        description: `Wholesale discount set to ${discount}% and MOQ set to ${moq} units. This will be applied to all newly calculated wholesale prices.`,
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Error Saving Settings',
        description: 'Could not save the global wholesale settings.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold">Product Pricing & Wholesale</h1>
        <p className="text-muted-foreground">
          Set the Recommended Retail Price (RRP) for each product and manage global wholesale terms.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Wholesale Settings</CardTitle>
          <CardDescription>
            These settings apply to all products for wholesale purchases. The wholesale price is calculated from the RRP and this discount.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <Label htmlFor="wholesale-discount">Wholesale Discount (%)</Label>
            <div className="relative">
              <Input
                id="wholesale-discount"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                placeholder="e.g., 20"
                className="pl-8"
              />
              <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="wholesale-moq">Wholesale MOQ (Units)</Label>
            <Input
              id="wholesale-moq"
              type="number"
              value={moq}
              onChange={(e) => setMoq(Number(e.target.value))}
              placeholder="e.g., 100"
            />
          </div>
          <Button onClick={handleSaveGlobalSettings} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Wholesale Terms
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
            <CardHeader><Skeleton className='w-1/2 h-8' /></CardHeader>
            <CardContent className='space-y-4'>
                <Skeleton className='w-full h-12' />
                <Skeleton className='w-full h-12' />
                <Skeleton className='w-full h-12' />
            </CardContent>
        </Card>
      ) : (
        <PricingClient initialProducts={products} wholesaleDiscount={discount} />
      )}
    </div>
  );
}

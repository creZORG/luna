
'use client';

import { useState, useMemo } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/lib/data';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { productService } from '@/services/product.service';
import { Loader, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PricingClientProps {
  initialProducts: Product[];
  wholesaleDiscount: number;
}

type DirtyPrices = {
    [productId: string]: {
        [size: string]: {
            price: number;
            wholesalePrice: number;
        };
    };
};

export default function PricingClient({ initialProducts, wholesaleDiscount }: PricingClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [dirtyPrices, setDirtyPrices] = useState<DirtyPrices>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


  const handlePriceChange = (productId: string, size: string, newPriceStr: string) => {
    const newPrice = Number(newPriceStr);
    if (isNaN(newPrice)) return;

    const wholesalePrice = newPrice * (1 - (wholesaleDiscount / 100));

    // Update local component state for instant UI feedback
    setProducts(currentProducts =>
      currentProducts.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            sizes: p.sizes.map(s => (s.size === size ? { ...s, price: newPrice, wholesalePrice } : s)),
          };
        }
        return p;
      })
    );

    // Mark this price as "dirty" so we know to save it
    setDirtyPrices(prev => ({
        ...prev,
        [productId]: {
            ...prev[productId],
            [size]: { price: newPrice, wholesalePrice },
        }
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
        const updatePromises: Promise<void>[] = [];
        
        for (const productId in dirtyPrices) {
            const product = products.find(p => p.id === productId);
            if (product) {
                // We create a new sizes array with the updated prices
                const newSizes = product.sizes.map(sizeInfo => {
                    const dirtySize = dirtyPrices[productId]?.[sizeInfo.size];
                    if (dirtySize) {
                        return { ...sizeInfo, price: dirtySize.price, wholesalePrice: dirtySize.wholesalePrice };
                    }
                    return sizeInfo;
                });
                updatePromises.push(productService.updateProduct(productId, { sizes: newSizes }));
            }
        }
        
        await Promise.all(updatePromises);

        toast({
            title: 'Prices Updated!',
            description: 'All price changes have been saved successfully.',
        });
        setDirtyPrices({});
        router.refresh();

    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error Saving Prices',
            description: 'Could not update prices. Please try again.',
        });
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <Card>
        <CardHeader>
            <div className='flex justify-between items-start'>
                <div>
                    <CardTitle>Product List</CardTitle>
                    <CardDescription>
                        Click on a product to expand and edit the Recommended Retail Price (RRP) for each size.
                    </CardDescription>
                </div>
                <Button onClick={handleSaveChanges} disabled={isSaving || Object.keys(dirtyPrices).length === 0}>
                    {isSaving ? <Loader className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
                    Save Changes
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            {products.length > 0 ? (
                <Accordion type="multiple" className="w-full space-y-4">
                    {products.map(product => (
                        <AccordionItem key={product.id} value={product.id} className="border bg-card rounded-lg overflow-hidden">
                            <AccordionTrigger className="p-4 hover:no-underline">
                                <div className="flex items-center gap-4">
                                {product.imageUrl && (
                                    <Image
                                        src={product.imageUrl}
                                        alt={product.name}
                                        width={48}
                                        height={48}
                                        className="rounded-md object-cover aspect-square"
                                    />
                                )}
                                <span className="font-semibold text-lg">{product.name}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 border-t">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className='w-1/3'>Size</TableHead>
                                            <TableHead className='w-1/3'>RRP (Ksh)</TableHead>
                                            <TableHead className='w-1/3'>Wholesale Price (Ksh)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {product.sizes.map(size => {
                                            const currentPrice = size.price || 0;
                                            const wholesalePrice = currentPrice * (1 - (wholesaleDiscount / 100));

                                            return (
                                                <TableRow key={size.size}>
                                                    <TableCell className='font-medium'>{size.size}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            value={currentPrice}
                                                            onChange={(e) => handlePriceChange(product.id, size.size, e.target.value)}
                                                            placeholder="Set Price"
                                                        />
                                                    </TableCell>
                                                     <TableCell>
                                                        <Input
                                                            type="text"
                                                            readOnly
                                                            disabled
                                                            value={wholesalePrice.toFixed(2)}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No products have been created yet.</p>
                    <p className="text-sm text-muted-foreground mt-2">Ask the Operations Manager to add products first.</p>
                </div>
            )}
        </CardContent>
    </Card>
  );
}

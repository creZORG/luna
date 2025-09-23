'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const productImage = PlaceHolderImages.find(img => img.id === product.imageId);
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-[rgba(20,160,120,0.2)] backdrop-blur-lg border border-[rgba(80,220,180,0.3)] text-foreground">
      <Link href={`/products/${product.slug}`} className="flex flex-col h-full">
        <CardHeader className="p-0">
          <div className="aspect-square w-full relative">
            {productImage ? (
              <Image
                src={productImage.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                data-ai-hint={productImage.imageHint}
              />
            ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">No Image</span>
                </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="font-headline text-xl leading-tight">{product.name}</CardTitle>
          <CardDescription className="mt-2 text-sm text-foreground/80">{product.shortDescription}</CardDescription>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-col items-start gap-4">
            <div className='w-full'>
                <p className="font-semibold text-lg">
                    From KShs {product.sizes[0].price.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">{product.sizes.map(s => s.size).join(' / ')}</p>
            </div>
            <Button onClick={handleAddToCart} className="w-full transition-all bg-primary/80 hover:bg-primary">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
            </Button>
        </CardFooter>
      </Link>
    </Card>
  );
}

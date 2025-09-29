
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card text-foreground">
      <Link href={`/products/${product.slug}`} className="flex flex-col h-full">
        <CardHeader className="p-0">
          <div className="aspect-square w-full relative">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
        <CardFooter className="p-4 pt-0">
            <Button asChild variant="secondary" className="w-full">
                <Link href={`/products/${product.slug}`}>Learn More</Link>
            </Button>
        </CardFooter>
      </Link>
    </Card>
  );
}

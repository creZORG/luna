
'use client';

import type { Product } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.imageUrl || `https://placehold.co/400x600/EEE/31343C`;
  
  return (
    <div className="group relative border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full bg-card">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="bg-muted flex justify-center items-center">
          <Image
            src={imageUrl}
            alt={product.name || "Product Image"}
            width={250}
            height={250}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-headline font-semibold text-foreground leading-tight">
          <Link href={`/products/${product.slug}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-muted-foreground flex-grow">{product.shortDescription}</p>
        
        <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-4 w-4',
                    i < Math.floor(product.rating ?? 0) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'
                  )}
                />
              ))}
               {product.reviewCount > 0 && <span className="text-xs text-muted-foreground ml-1">({product.reviewCount})</span>}
            </div>
        </div>

        {product.sizes && product.sizes.length > 0 && (
          <p className="mt-2 text-xl font-bold text-primary">
            From Ksh {product.sizes.sort((a,b) => a.price - b.price)[0].price.toFixed(2)}
          </p>
        )}
      </div>
       <div className="p-4 border-t mt-auto">
         <Button asChild className="w-full">
            <Link href={`/products/${product.slug}`}>View Details</Link>
         </Button>
       </div>
    </div>
  );
}


'use client';

import type { Product } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  // Use the provided fallback URL if imageUrl is missing.
  const imageUrl = product.imageUrl || `https://placehold.co/400x600/EEE/31343C`;

  return (
    <div className="group relative">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square w-full bg-muted rounded-lg overflow-hidden border transition-all group-hover:shadow-xl">
          <Image
            src={imageUrl}
            alt={product.name || "Product Image"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <Badge variant="secondary" className={cn(
            "absolute top-3 right-3 capitalize transition-opacity duration-300",
            "group-hover:bg-primary group-hover:text-primary-foreground"
          )}>
            {product.category.replace(/-/g, ' ')}
          </Badge>
        </div>
      </Link>
      <div className="mt-4 text-center">
        <h3 className="text-lg font-headline font-semibold text-foreground">
          <Link href={`/products/${product.slug}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{product.shortDescription}</p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-4 w-4',
                  i < Math.floor(product.rating ?? 0) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'
                )}
              />
            ))}
          </div>
          {product.reviewCount > 0 && <span className="text-xs text-muted-foreground">({product.reviewCount})</span>}
        </div>
        {product.sizes && product.sizes.length > 0 && (
          <p className="mt-2 text-base font-bold text-primary">
            From Ksh {product.sizes.sort((a,b) => a.price - b.price)[0].price.toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
}

'use client';

import type { Product } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.imageUrl || `https://placehold.co/600x600/EEE/31343C`;
  
  return (
    <div className="group relative">
      <div className="relative w-full overflow-hidden rounded-lg border bg-muted aspect-square transition-all group-hover:shadow-xl">
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          <Image
            src={imageUrl}
            alt={product.name || "Product Image"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-lg font-headline font-semibold text-foreground">
          <Link href={`/products/${product.slug}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
          </Link>
        </h3>
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


'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Star, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type ProductCardProps = {
  product: Product;
};

const StarRating = ({ rating, reviewCount }: { rating: number, reviewCount: number }) => {
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={cn(
                            'h-4 w-4',
                            i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'
                        )}
                    />
                ))}
            </div>
            <span className="text-xs text-muted-foreground">({reviewCount})</span>
        </div>
    );
};

export default function ProductCard({ product }: ProductCardProps) {
  const basePrice = Math.min(...product.sizes.map(s => s.price));
  const placeholderImageUrl = `https://placehold.co/600x600/e2e8f0/64748b?text=${encodeURIComponent(product.name.split(' ').join('\\n'))}`;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl group bg-card text-foreground">
      <Link href={`/products/${product.slug}`} className="flex flex-col h-full">
        <CardHeader className="p-0 border-b">
          <div className="aspect-square w-full relative">
            <Image
                src={product.imageUrl || placeholderImageUrl}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
             <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm text-foreground text-xs font-semibold px-2 py-1 rounded-full capitalize flex items-center gap-1">
                <Tag className="w-3 h-3"/>
                {product.category.replace(/-/g, ' ')}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col">
            <div className='flex-grow'>
                <CardTitle className="font-headline text-lg leading-tight mb-2">{product.name}</CardTitle>
                <StarRating rating={product.rating} reviewCount={product.reviewCount} />
                <CardDescription className="mt-2 text-sm text-foreground/80 line-clamp-2">{product.shortDescription}</CardDescription>
            </div>
             <div className="mt-4">
                <p className="text-sm text-muted-foreground">Starting at</p>
                <p className="text-xl font-bold text-primary">Ksh {basePrice.toFixed(2)}</p>
            </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <Button variant="secondary" className="w-full">
                View Options
            </Button>
        </CardFooter>
      </Link>
    </Card>
  );
}

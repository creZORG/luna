
'use client';

import type { Product } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const placeholderImageUrl = `https://placehold.co/600x600/e2e8f0/64748b?text=Image`;

  return (
    <Link href={`/products/${product.slug}`} className="block">
      <div className="aspect-square w-full relative bg-muted rounded-lg overflow-hidden border">
        <Image
          src={product.imageUrl || placeholderImageUrl}
          alt={product.name || "Product Image"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </Link>
  );
}

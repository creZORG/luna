'use client';

import type { Product } from '@/lib/data';
import ProductCard from './product-card';
import { Frown } from 'lucide-react';

type ProductListProps = {
  products: Product[];
};

export default function ProductList({ products }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No Products Found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

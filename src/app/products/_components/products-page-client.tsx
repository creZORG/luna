
'use client';

import type { Product } from '@/lib/data';
import React, { useState, useMemo, Suspense } from 'react';
import ProductFilters from './product-filters';
import ProductList from './product-list';
import { useSearchParams } from 'next/navigation';

function ProductsPageClientContent({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    return filtered;
  }, [products, selectedCategory]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Our Product Catalog</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore the full range of high-quality products we manufacture. Contact us for wholesale and partnership opportunities.
        </p>
      </div>

      <div className="mb-8">
        <ProductFilters
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
        />
      </div>

      <div>
        <ProductList products={filteredProducts} />
      </div>
    </div>
  );
}


export default function ProductsPageClientWrapper({ products }: { products: Product[] }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProductsPageClientContent products={products} />
        </Suspense>
    )
}

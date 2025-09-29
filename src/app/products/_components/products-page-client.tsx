
'use client';

import type { Product } from '@/lib/data';
import React, { useState, useMemo, Suspense } from 'react';
import ProductFilters from './product-filters';
import ProductList from './product-list';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function ProductsPageClientContent({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  
  const heroImage = PlaceHolderImages.find((img) => img.id === 'products-hero');

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    return filtered;
  }, [products, selectedCategory]);

  return (
    <>
        <section className="relative h-[40vh] w-full flex items-center justify-center text-center text-white">
            {heroImage && (
            <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                priority
                data-ai-hint={heroImage.imageHint}
            />
            )}
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 px-4">
                <h1 className="text-4xl md:text-5xl font-headline font-bold">Our Product Catalog</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-white/90">
                    Explore the full range of high-quality products we manufacture. Contact us for wholesale and partnership opportunities.
                </p>
            </div>
        </section>

        <div className="container mx-auto px-4 py-8">
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
    </>
  );
}


export default function ProductsPageClientWrapper({ products }: { products: Product[] }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProductsPageClientContent products={products} />
        </Suspense>
    )
}

'use client';

import type { Product } from '@/lib/data';
import React, { useState, useMemo, Suspense } from 'react';
import ProductFilters from './product-filters';
import ProductList from './product-list';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SortOption = 'featured' | 'price:asc' | 'price:desc' | 'newest';

function ProductsPageClientContent({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortOption, setSortOption] = useState<SortOption>('featured');

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchQuery) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    switch (sortOption) {
        case 'price:asc':
            filtered.sort((a, b) => a.sizes[0].price - b.sizes[0].price);
            break;
        case 'price:desc':
            filtered.sort((a, b) => b.sizes[0].price - a.sizes[0].price);
            break;
        case 'newest':
            // Assuming higher ID is newer
            filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id));
            break;
        case 'featured':
        default:
            // Default sort, could be manual order or by name
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, sortOption]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Our Complete Collection</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover the full range of Luna products, crafted for your daily needs.
        </p>
      </div>

      <div className="mb-8">
        <ProductFilters
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
        />
      </div>

      <div>
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className='flex items-center gap-2 w-full sm:w-auto'>
              <span className='text-sm font-medium text-muted-foreground flex-shrink-0'>Sort by:</span>
              <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price:asc">Price: Low to High</SelectItem>
                      <SelectItem value="price:desc">Price: High to Low</SelectItem>
                  </SelectContent>
              </Select>
            </div>
        </div>
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

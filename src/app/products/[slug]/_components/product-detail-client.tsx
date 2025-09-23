'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import type { Product } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Check, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Label } from '@/components/ui/label';

export default function ProductDetailClient({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const productImage = PlaceHolderImages.find(img => img.id === product.imageId);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-sm mb-4 text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            {' / '}
            <Link href="/products" className="hover:text-primary">Products</Link>
            {' / '}
            <Link href={`/products?category=${product.category}`} className="hover:text-primary capitalize">{product.category.replace(/-/g, ' ')}</Link>
            {' / '}
            <span className='text-foreground'>{product.name}</span>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        <div className="aspect-square w-full bg-card rounded-lg overflow-hidden shadow-lg">
          {productImage && (
            <Image
              src={productImage.imageUrl}
              alt={product.name}
              width={800}
              height={800}
              className="object-cover w-full h-full"
              data-ai-hint={productImage.imageHint}
            />
          )}
        </div>

        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold">{product.name}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{product.description}</p>
          
          <div className="mt-6">
            <p className="text-3xl font-bold font-headline">KShs {selectedSize.price.toFixed(2)}</p>
          </div>

          {product.sizes.length > 1 && (
            <div className="mt-6">
              <Label className="text-base font-medium">Size</Label>
              <RadioGroup 
                defaultValue={selectedSize.size} 
                onValueChange={(value) => {
                    const newSize = product.sizes.find(s => s.size === value);
                    if (newSize) setSelectedSize(newSize);
                }}
                className="flex items-center gap-4 mt-2"
              >
                {product.sizes.map(sizeInfo => (
                    <div key={sizeInfo.size}>
                        <RadioGroupItem value={sizeInfo.size} id={sizeInfo.size} className="sr-only" />
                        <Label htmlFor={sizeInfo.size} className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                            {sizeInfo.size}
                        </Label>
                    </div>
                ))}
              </RadioGroup>
            </div>
          )}

          <div className="mt-8">
            <Button size="lg" className="w-full">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>

          <Separator className="my-8" />
          
          <div>
            <h3 className="font-headline text-xl font-semibold mb-4">Key Benefits</h3>
            <ul className="space-y-2">
              {product.keyBenefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <h3 className="font-headline text-xl font-semibold mb-2">Key Features</h3>
            <div className="flex flex-wrap gap-2">
                {product.features.map(feature => (
                    <Badge key={feature} variant="secondary" className="text-sm">
                        {feature.charAt(0).toUpperCase() + feature.slice(1).replace(/-/g, ' ')}
                    </Badge>
                ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-16">
        <Separator/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 mt-8">
            <div>
                <h3 className="font-headline text-xl font-semibold mb-4">Ingredients</h3>
                <p className="text-sm text-muted-foreground">{product.ingredients.join(', ')}.</p>
            </div>
            <div>
                <h3 className="font-headline text-xl font-semibold mb-4">Directions for Use</h3>
                <p className="text-sm text-muted-foreground">{product.directions}</p>
                <h3 className="font-headline text-xl font-semibold mt-4 mb-2">Cautions</h3>
                <p className="text-sm text-muted-foreground">{product.cautions}</p>
            </div>
        </div>
      </div>
    </div>
  );
}

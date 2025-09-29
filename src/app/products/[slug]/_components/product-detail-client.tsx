
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Product } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Check, Send, ShoppingCart, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChatModal } from './chat-modal';


export default function ProductDetailClient({ product }: { product: Product }) {
  const primaryImage = product.imageUrl;
  const galleryImages = useMemo(() => {
    return (product.galleryImageUrls || []).filter((url): url is string => !!url);
  }, [product.galleryImageUrls]);
  
  const allImages = primaryImage ? [primaryImage, ...galleryImages] : galleryImages;

  const [selectedImage, setSelectedImage] = useState<string | undefined>(allImages[0]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  return (
    <>
      <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-sm mb-4 text-muted-foreground">
              <Link href="/" className="hover:text-primary">Home</Link>
              {' / '}
              <Link href="/products" className="hover:text-primary">Products</Link>
              {' / '}
              <Link href={`/products?category=${product.category}`} className="hovertext-primary capitalize">{product.category.replace(/-/g, ' ')}</Link>
              {' / '}
              <span className='text-foreground'>{product.name}</span>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          
          <div className="flex flex-col gap-4">
              <div className="aspect-square w-full bg-card rounded-lg overflow-hidden shadow-lg border">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    width={800}
                    height={800}
                    className="object-cover w-full h-full"
                    priority
                  />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                        No Image Available
                    </div>
                )}
              </div>
              
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {allImages.map((image, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setSelectedImage(image)}
                            className={cn(
                                "aspect-square rounded-md overflow-hidden border-2 transition",
                                selectedImage === image ? "border-primary ring-2 ring-primary" : "border-transparent hover:border-primary/50"
                            )}
                        >
                            <Image 
                                src={image}
                                alt={`${product.name} gallery image ${idx + 1}`}
                                width={150}
                                height={150}
                                className="object-cover w-full h-full"
                            />
                        </button>
                    ))}
                </div>
              )}
          </div>

          <div>
            <h1 className="font-headline text-3xl md:text-4xl font-bold">{product.name}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{product.shortDescription}</p>
            
            <div className="mt-6">
              <p className="text-muted-foreground">Available in: {product.sizes.map(s => `${s.size} (Ksh ${s.price})`).join(', ')}</p>
            </div>

             <Card className="mt-6 bg-accent/50 border-accent">
                <CardContent className="pt-6">
                    <p className="font-bold text-accent-foreground">Wholesale Available!</p>
                    <p className="text-sm text-accent-foreground/80">
                        Get a discount on orders of <span className="font-semibold">{product.wholesaleMoq} units</span> or more. Perfect for retailers and distributors.
                    </p>
                </CardContent>
            </Card>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button size="lg" disabled>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Buy Now (Coming Soon)
              </Button>
              <Button size="lg" variant="outline" onClick={() => setIsChatOpen(true)}>
                <MessageSquare className="mr-2 h-5 w-5" />
                Discuss Bulk Pricing
              </Button>
            </div>
            
            <Separator className="my-8" />
            
            <div>
                 <h3 className="font-headline text-xl font-semibold mb-4">Product Details</h3>
                <div className="space-y-6 text-sm text-muted-foreground">
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Key Benefits</h4>
                        <ul className="space-y-2 list-disc pl-5">
                            {product.keyBenefits.map((benefit, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                                <span>{benefit}</span>
                            </li>
                            ))}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-foreground mb-2">Ingredients</h4>
                        <p>{product.ingredients.join(', ')}.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Directions for Use</h4>
                        <p>{product.directions}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-foreground mb-2">Cautions</h4>
                        <p>{product.cautions}</p>
                    </div>
                </div>
            </div>

          </div>
        </div>
      </div>
      <ChatModal 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        productName={product.name}
      />
    </>
  );
}

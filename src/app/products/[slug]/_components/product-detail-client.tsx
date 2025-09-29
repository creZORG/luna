
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Product } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Check, Send, ShoppingCart, MessageSquare, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatModal } from './chat-modal';
import { useAuth } from '@/hooks/use-auth';
import { cartService } from '@/services/cart.service';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { WholesaleRedirectModal } from './wholesale-redirect-modal';


export default function ProductDetailClient({ product }: { product: Product }) {
  const primaryImage = product.imageUrl;
  const galleryImages = useMemo(() => {
    return (product.galleryImageUrls || []).filter((url): url is string => !!url);
  }, [product.galleryImageUrls]);
  
  const allImages = primaryImage ? [primaryImage, ...galleryImages] : galleryImages;

  const [selectedImage, setSelectedImage] = useState<string | undefined>(allImages[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const router = useRouter();
  const { addItem, setIsCartOpen } = useCart();

  const handleAddToCart = () => {
     if (quantity >= (product.wholesaleMoq || Infinity)) {
        setIsRedirectModalOpen(true);
        return;
    }
    addItem({
        productId: product.id,
        productName: product.name,
        imageUrl: product.imageUrl,
        size: selectedSize.size,
        quantity,
        price: selectedSize.price,
    });
    toast({
        title: "Added to Cart!",
        description: `${quantity} x ${product.name} (${selectedSize.size}) has been added.`,
        action: <Button variant="outline" size="sm" onClick={() => setIsCartOpen(true)}>View Cart</Button>
    });
  }

  const handleBuyNow = () => {
    if (quantity >= (product.wholesaleMoq || Infinity)) {
        setIsRedirectModalOpen(true);
        return;
    }
    addItem({
        productId: product.id,
        productName: product.name,
        imageUrl: product.imageUrl,
        size: selectedSize.size,
        quantity,
        price: selectedSize.price,
    });
    router.push('/checkout');
  };
  
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
            <Badge variant="secondary" className='capitalize'>{product.category.replace(/-/g, ' ')}</Badge>
            <h1 className="font-headline text-3xl md:text-4xl font-bold mt-2">{product.name}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{product.shortDescription}</p>
            
             <Separator className="my-8" />

            <div className="space-y-6">
                <div>
                    <h3 className='text-sm font-semibold text-muted-foreground'>Recommended Retail Price (RRP)</h3>
                     <p className="text-4xl font-bold text-primary">Ksh {selectedSize.price.toFixed(2)}</p>
                </div>

                {product.sizes.length > 1 && (
                    <div>
                        <h3 className='text-sm font-semibold text-muted-foreground mb-2'>Size</h3>
                        <div className="flex flex-wrap gap-2">
                            {product.sizes.map((size) => (
                            <Button
                                key={size.size}
                                variant={selectedSize.size === size.size ? 'default' : 'outline'}
                                onClick={() => setSelectedSize(size)}
                            >
                                {size.size}
                            </Button>
                            ))}
                        </div>
                    </div>
                )}
                
                <div>
                    <h3 className='text-sm font-semibold text-muted-foreground mb-2'>Quantity</h3>
                    <div className="flex items-center gap-2 border rounded-md w-fit">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center text-lg font-bold">{quantity}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10"
                             onClick={() => setQuantity(q => q + 1)}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                         <Button size="lg" className="flex-1" onClick={handleBuyNow}>
                            Buy Now
                        </Button>
                        <Button size="lg" variant="outline" className="flex-1" onClick={handleAddToCart}>
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Add to Cart
                        </Button>
                    </div>
                </div>


                <Card className="bg-accent/50 border-accent">
                    <CardHeader className='pb-4'>
                        <CardTitle className='text-accent-foreground text-lg'>Wholesale Available</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-accent-foreground/90 mb-4">
                            Get a significant discount on orders of <span className="font-bold">{product.wholesaleMoq} units</span> or more. Perfect for retailers and distributors.
                        </p>
                         <Button size="default" variant="secondary" onClick={() => setIsChatOpen(true)} className='bg-primary/20 text-primary hover:bg-primary/30'>
                            <MessageSquare className="mr-2 h-5 w-5" />
                            Discuss Bulk Pricing
                        </Button>
                    </CardContent>
                </Card>
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
      <WholesaleRedirectModal 
        isOpen={isRedirectModalOpen} 
        onClose={() => setIsRedirectModalOpen(false)} 
      />
    </>
  );
}

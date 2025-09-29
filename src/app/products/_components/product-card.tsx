
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

function AddToCartButton({ product }: { product: Product }) {
    'use client';
    const { addItem, isCartOpen, setIsCartOpen } = useCart();

    const handleAddToCart = () => {
        if (product.sizes.length > 0) {
            const defaultSize = product.sizes[0];
            addItem({
                productId: product.id,
                productName: product.name,
                size: defaultSize.size,
                price: defaultSize.price,
                imageUrl: product.imageUrl,
                quantity: 1,
            });
            setIsCartOpen(true);
        }
    };

    return <Button onClick={handleAddToCart} className="w-full">Add to Cart</Button>;
}


export function ProductCard({ product }: { product: Product }) {
  const price = product.sizes.length > 0 ? product.sizes[0].price : 0;
  const size = product.sizes.length > 0 ? product.sizes[0].size : '';

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
        <Link href={`/products/${product.slug}`}>
            <CardHeader className="p-0">
                <div className="relative aspect-square w-full">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                <CardTitle className="text-lg font-headline truncate">{product.name}</CardTitle>
                <CardDescription className="mt-1 text-sm h-10 overflow-hidden text-ellipsis">
                    {product.shortDescription}
                </CardDescription>

                <div className="flex items-center mt-3">
                    <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                        <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
                        />
                    ))}
                    </div>
                    <span className="ml-2 text-xs text-muted-foreground">({product.reviewCount} reviews)</span>
                </div>

            </CardContent>
        </Link>
        <CardFooter className="flex justify-between items-center p-4 pt-0">
            <div className="text-lg font-bold text-primary">
                Ksh {price.toFixed(2)}
                <span className="text-xs text-muted-foreground ml-1">/ {size}</span>
            </div>
            <div className="w-1/2">
              <AddToCartButton product={product} />
            </div>
        </CardFooter>
    </Card>
  );
}

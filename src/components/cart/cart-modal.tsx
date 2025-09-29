
'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Frown, Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Separator } from '../ui/separator';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

export function CartModal() {
  const { cartItems, isCartOpen, setIsCartOpen, updateItemQuantity, removeItem } = useCart();
  const router = useRouter();

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>Review your items before proceeding to checkout.</SheetDescription>
        </SheetHeader>
        
        <Separator />

        {cartItems.length > 0 ? (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-6 px-6 py-4">
                {cartItems.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex items-center gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                      <Image
                        src={item.imageUrl || '/placeholder.svg'}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.productName}</h4>
                      <p className="text-sm text-muted-foreground">{item.size}</p>
                       <p className="text-sm font-medium">Ksh {item.price.toFixed(2)}</p>
                       <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2 border rounded-md">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateItemQuantity(item.productId, item.size, item.quantity - 1)}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateItemQuantity(item.productId, item.size, item.quantity + 1)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon"
                                className='text-muted-foreground hover:text-destructive'
                                onClick={() => removeItem(item.productId, item.size)}
                            >
                                <Trash2 className='h-4 w-4' />
                            </Button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <SheetFooter className="gap-2 border-t bg-background px-6 py-4 sm:flex-col">
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal</span>
                <span>Ksh {subtotal.toFixed(2)}</span>
              </div>
              <Button onClick={handleCheckout} className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </SheetFooter>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
             <Frown className="h-20 w-20 text-muted-foreground" />
            <div className="space-y-1">
                <h3 className="text-xl font-semibold">Your cart is empty</h3>
                <p className="text-sm text-muted-foreground">Add some products to get started!</p>
            </div>
            <Button onClick={() => setIsCartOpen(false)} variant="outline">
              Continue Shopping
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

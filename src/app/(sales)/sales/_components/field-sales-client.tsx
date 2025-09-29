
'use client';

import { useState } from 'react';
import FieldSalesForm from './field-sales-form';
import type { StockInfo } from './sales-dashboard-client';
import type { CartItem } from '@/services/cart.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { processFieldSale } from '@/ai/flows/process-field-sale-flow';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FieldSalesClientProps {
    initialStock: StockInfo[];
}

export default function FieldSalesClient({ initialStock }: FieldSalesClientProps) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const { user, userProfile } = useAuth();
    const { toast } = useToast();
    const router = useRouter();


    const handleAddToCart = (item: StockInfo) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(ci => ci.productId === item.productId && ci.size === item.size);
            if (existingItem) {
                return prevCart.map(ci => 
                    ci.productId === item.productId && ci.size === item.size
                    ? { ...ci, quantity: ci.quantity + 1 }
                    : ci
                );
            }
            return [...prevCart, { ...item, productId: item.productId, quantity: 1 }];
        });
    };

    const handleProcessSale = async (customerName: string, customerPhone: string) => {
        if (!user || !userProfile) {
            toast({ variant: 'destructive', title: 'Authentication Error' });
            return;
        }

        setIsProcessing(true);
        toast({
            title: 'Processing Sale...',
            description: 'STK push sent to customer. Please ask them to confirm payment on their phone.'
        });

        try {
            const orderId = await processFieldSale({
                items: cart,
                customerName,
                customerPhone,
                salespersonId: user.uid,
                salespersonName: userProfile.displayName,
            });

            toast({
                title: 'Sale Successful!',
                description: `Order #${orderId.substring(0,6).toUpperCase()} has been created and confirmed.`
            });
            setCart([]); // Clear cart on success
            router.refresh();

        } catch (error: any) {
            console.error("Field sale failed:", error);
            toast({
                variant: 'destructive',
                title: 'Sale Failed',
                description: error.message || 'The transaction could not be completed.'
            });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="grid md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Select Products</CardTitle>
                        <CardDescription>Click on a product to add it to the current sale.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {initialStock.map(item => (
                            <Card 
                                key={`${item.productId}-${item.size}`} 
                                className="overflow-hidden cursor-pointer hover:shadow-md hover:border-primary transition-all"
                                onClick={() => handleAddToCart(item)}
                            >
                                <div className="relative aspect-square">
                                    <Image src={item.imageUrl || ''} alt={item.productName} fill className="object-cover" />
                                </div>
                                <div className="p-3 text-center">
                                    <p className="text-sm font-medium truncate">{item.productName}</p>
                                    <p className="text-xs text-muted-foreground">{item.size}</p>
                                    <p className="text-sm font-bold text-primary">Ksh {item.price.toFixed(2)}</p>
                                </div>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </div>
            
            <div>
                 <Card className="sticky top-24">
                    <CardHeader>
                        <CardTitle>Current Sale</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {cart.length > 0 ? (
                            <div className="space-y-4">
                                {cart.map(item => (
                                    <div key={`${item.productId}-${item.size}`} className="flex justify-between items-center text-sm">
                                        <div>
                                            <p className="font-medium">{item.productName} ({item.size})</p>
                                            <p className="text-muted-foreground">
                                                {item.quantity} x Ksh {item.price.toFixed(2)}
                                            </p>
                                        </div>
                                        <p className="font-semibold">Ksh {(item.quantity * item.price).toFixed(2)}</p>
                                    </div>
                                ))}
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <p>Total</p>
                                    <p>Ksh {subtotal.toFixed(2)}</p>
                                </div>
                                <Separator />
                                <FieldSalesForm onProcessSale={handleProcessSale} isProcessing={isProcessing} />
                            </div>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground">
                                <p>No items added to the sale yet.</p>
                            </div>
                        )}
                    </CardContent>
                 </Card>
            </div>
        </div>
    );
}

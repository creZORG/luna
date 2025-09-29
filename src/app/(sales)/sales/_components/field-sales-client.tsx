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
import { Loader, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { verifyPaymentAndProcessOrder } from '@/ai/flows/verify-payment-and-process-order-flow';
import { fieldSaleLogService } from '@/services/field-sale-log.service';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FieldSalesClientProps {
    initialStock: StockInfo[];
}

interface Location {
    latitude: number;
    longitude: number;
}

export default function FieldSalesClient({ initialStock }: FieldSalesClientProps) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [location, setLocation] = useState<Location | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
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
    
    const getLocation = () => {
        setLocationError(null);
        setIsProcessing(true); // Show loading state
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setIsProcessing(false);
            },
            (error) => {
                setLocationError('Could not get location. Please enable location services and try again.');
                setIsProcessing(false);
            }
        );
    }


    const handleProcessSale = async (customerName: string, customerPhone: string, customerEmail: string) => {
        if (!user || !userProfile) {
            toast({ variant: 'destructive', title: 'Authentication Error' });
            return;
        }
        if (!location) {
            toast({ variant: 'destructive', title: 'Location Required', description: 'Please capture your location before proceeding.' });
            return;
        }

        setIsProcessing(true);

        const PaystackPop = (await import('@paystack/inline-js')).default;
        const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const paystack = new PaystackPop();
        paystack.newTransaction({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
            email: customerEmail,
            amount: totalAmount * 100, // Amount in kobo
            metadata: {
                custom_fields: [
                    { display_name: "Salesperson", variable_name: "salesperson_name", value: userProfile.displayName },
                    { display_name: "Customer", variable_name: "customer_name", value: customerName },
                ],
                "send_receipt": false, // Disable Paystack receipt
            },
            onSuccess: async (transaction) => {
                try {
                    const orderId = await verifyPaymentAndProcessOrder({
                        reference: transaction.reference,
                        cartItems: cart,
                        customer: {
                           fullName: customerName,
                           phone: customerPhone,
                           email: customerEmail,
                           address: `In-person sale by ${userProfile.displayName}`,
                           county: 'Field Sale',
                           deliveryMethod: 'door-to-door',
                        },
                        userId: user.uid,
                    });
                    
                    // Log the field sale location
                    await fieldSaleLogService.logSale({
                        salespersonId: user.uid,
                        salespersonName: userProfile.displayName,
                        orderId,
                        customerName,
                        customerPhone,
                        latitude: location.latitude,
                        longitude: location.longitude,
                    });

                    toast({
                        title: 'Sale Successful!',
                        description: `Order #${orderId.substring(0,6).toUpperCase()} has been created.`
                    });
                    setCart([]); // Clear cart
                    setLocation(null); // Reset location
                    router.refresh();

                } catch (error: any) {
                    toast({
                        variant: 'destructive',
                        title: 'Order Processing Failed',
                        description: error.message || 'Payment was successful but we failed to create the order. Contact support.'
                    });
                } finally {
                     setIsProcessing(false);
                }
            },
            onCancel: () => {
                toast({
                    variant: 'destructive',
                    title: 'Payment Cancelled',
                    description: 'The payment process was cancelled.'
                });
                setIsProcessing(false);
            },
        });
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
                                {locationError && <Alert variant="destructive"><AlertTitle>Location Error</AlertTitle><AlertDescription>{locationError}</AlertDescription></Alert>}

                                {!location ? (
                                     <Button onClick={getLocation} disabled={isProcessing} className="w-full">
                                        {isProcessing ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                                        Capture Current Location
                                    </Button>
                                ) : (
                                    <>
                                        <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                            <MapPin className="h-4 w-4 !text-green-600" />
                                            <AlertTitle className="text-green-800 dark:text-green-300">Location Captured</AlertTitle>
                                            <AlertDescription className="text-green-700 dark:text-green-400">
                                               You can now enter customer details to proceed.
                                            </AlertDescription>
                                        </Alert>
                                        <FieldSalesForm onProcessSale={handleProcessSale} isProcessing={isProcessing} />
                                    </>
                                )}
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

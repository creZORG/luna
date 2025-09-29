
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    return (
         <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-background">
            <Card className="mx-auto max-w-lg text-center">
                <CardHeader>
                <div className='flex justify-center mb-4'>
                    <PartyPopper className="w-16 h-16 text-primary" />
                </div>
                <CardTitle className="text-3xl font-headline">Order Confirmed!</CardTitle>
                <CardDescription>
                    Thank you for your purchase! Your order has been successfully placed.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {orderId && (
                        <div className="bg-muted p-4 rounded-md">
                            <p className="text-sm text-muted-foreground">Your Order ID is:</p>
                            <p className="text-lg font-mono font-bold text-foreground tracking-wider">{orderId.substring(0, 8).toUpperCase()}</p>
                        </div>
                    )}
                    <p className='text-sm text-muted-foreground'>
                        You will receive an email confirmation shortly with your order details. You can track your order status from your profile.
                    </p>
                    <div className='flex gap-4'>
                        <Button asChild className="w-full">
                            <Link href="/products">Continue Shopping</Link>
                        </Button>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/profile">View My Orders</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    )
}

    
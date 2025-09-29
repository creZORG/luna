
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { processPayment, ProcessPaymentOutput } from '@/ai/flows/process-payment-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function VerifyPaymentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [result, setResult] = useState<ProcessPaymentOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const reference = searchParams.get('reference');
        
        if (!reference) {
            // If there's no reference, it might be a direct navigation. Send them home.
            router.push('/');
            return;
        }

        async function verify() {
            try {
                const paymentResult = await processPayment(reference);
                setResult(paymentResult);
            } catch (error: any) {
                setResult({
                    success: false,
                    message: error.message || 'An unexpected error occurred.',
                });
            } finally {
                setIsLoading(false);
            }
        }

        verify();
    }, [searchParams, router]);

    return (
         <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-background">
            <Card className="mx-auto max-w-lg text-center">
                {isLoading && (
                    <>
                        <CardHeader>
                            <div className='flex justify-center mb-4'>
                                <Loader className="w-16 h-16 text-primary animate-spin" />
                            </div>
                            <CardTitle className="text-2xl">Verifying Your Payment...</CardTitle>
                            <CardDescription>
                                Please wait while we securely confirm your transaction. Do not close this page.
                            </CardDescription>
                        </CardHeader>
                    </>
                )}

                {!isLoading && result?.success && (
                    <>
                        <CardHeader>
                            <div className='flex justify-center mb-4'>
                                <CheckCircle className="w-16 h-16 text-green-500" />
                            </div>
                            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
                            <CardDescription>
                                Thank you for your purchase. Your order has been confirmed. Your order ID is <strong>{result.orderId}</strong>. A confirmation email has been sent to you.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href="/products">Continue Shopping</Link>
                            </Button>
                        </CardContent>
                    </>
                )}

                 {!isLoading && !result?.success && (
                    <>
                        <CardHeader>
                            <div className='flex justify-center mb-4'>
                                <AlertTriangle className="w-16 h-16 text-destructive" />
                            </div>
                            <CardTitle className="text-2xl">Payment Failed</CardTitle>
                            <CardDescription>
                               There was an issue processing your payment. {result?.message} Please try again or contact support.
                            </CardDescription>
                        </CardHeader>
                         <CardContent>
                            <Button asChild variant="destructive">
                                <Link href="/products">Try Again</Link>
                            </Button>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}

export default function VerifyPaymentPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader className="w-16 h-16 animate-spin"/></div>}>
            <VerifyPaymentContent />
        </Suspense>
    )
}

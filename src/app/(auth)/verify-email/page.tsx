
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MailCheck } from 'lucide-react';
import VerifyEmailForm from './_components/verify-email-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { authService } from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';

export default function VerifyEmailPage() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const codeSentRef = useRef(false);

    useEffect(() => {
        // If user is loaded and their email is already verified, redirect them away
        if (!loading && userProfile && userProfile.emailVerified) {
            router.push('/admin/dashboard');
            return;
        }

        // Send the code automatically when an unverified user lands on the page.
        // The ref ensures this only runs once per component mount, not on every re-render.
        if (!loading && user && userProfile && !userProfile.emailVerified && !codeSentRef.current) {
            codeSentRef.current = true; // Mark as sent to prevent re-sends on re-renders.
            authService.sendVerificationCode(user.uid, user.email!, userProfile.displayName)
                .then(() => {
                    toast({
                        title: 'Verification Code Sent',
                        description: 'A new code has been sent to your email address.',
                    });
                })
                .catch((err) => {
                    toast({
                        variant: 'destructive',
                        title: 'Failed to Send Code',
                        description: 'There was a problem sending your verification code. Please try resending it manually.',
                    });
                    console.error(err);
                });
        }
    }, [user, userProfile, loading, router, toast]);


    return (
         <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-background">
            <Card className="mx-auto max-w-sm text-center">
                <CardHeader>
                    <div className='flex justify-center mb-4'>
                        <MailCheck className="w-16 h-16 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Check Your Email</CardTitle>
                    <CardDescription>
                        We've sent a 6-digit verification code to <span className="font-semibold">{user?.email || 'your email'}</span>. Please enter it below to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <VerifyEmailForm />
                </CardContent>
            </Card>
        </div>
    )
}


'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MailCheck } from 'lucide-react';
import VerifyEmailForm from './_components/verify-email-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function VerifyEmailPage() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If user is loaded and their email is already verified, redirect them away
        if (!loading && userProfile && userProfile.emailVerified) {
            router.push('/admin/dashboard');
        }
    }, [userProfile, loading, router]);


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

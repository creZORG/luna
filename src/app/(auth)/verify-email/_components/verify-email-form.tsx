
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { authService } from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

export default function VerifyEmailForm() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || code.length !== 6) return;

    setIsLoading(true);
    try {
      const isSuccess = await authService.checkVerificationCode(user.uid, code);
      if (isSuccess) {
        toast({
          title: 'Email Verified!',
          description: 'Your account is now verified. Redirecting...',
        });
        // The AuthProvider will automatically redirect on the next state change
        // but we can give it a nudge.
        router.push('/admin/dashboard');
        router.refresh(); // This will re-trigger the AuthProvider check
      } else {
         toast({
            variant: 'destructive',
            title: 'Invalid Code',
            description: 'The code you entered is incorrect. Please try again.',
          });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!user || !user.email || !userProfile) return;

    setIsResending(true);
    try {
        await authService.sendVerificationCode(user.uid, user.email, userProfile.displayName);
        toast({
            title: 'Code Sent!',
            description: 'A new verification code has been sent to your email.'
        });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Failed to Resend',
            description: 'Could not send a new code. Please try again in a moment.'
        });
    } finally {
        setIsResending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        maxLength={6}
        placeholder="123456"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
        className="text-center text-2xl tracking-[0.5em] h-14"
        disabled={isLoading}
      />
      <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
        {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : 'Verify Account'}
      </Button>
      <Button type='button' variant="link" onClick={handleResendCode} disabled={isResending}>
         {isResending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : 'Resend Code'}
      </Button>
    </form>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';
import { Loader } from 'lucide-react';
import { userService } from '@/services/user.service';

function VerifyForm() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const verificationId = searchParams.get('verificationId');

  useEffect(() => {
    if (!verificationId) {
      toast({
        variant: 'destructive',
        title: 'Missing Verification ID',
        description: 'No verification process was started. Please sign up again.',
      });
      router.push('/signup');
    }
  }, [verificationId, router, toast]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationId) return;

    if (code.length !== 6) {
        toast({ variant: 'destructive', title: 'Invalid Code', description: 'The code must be 6 digits long.' });
        return;
    }

    setIsLoading(true);
    try {
      await authService.completeSignUp(verificationId, code);
      
      toast({
        title: 'Account Created Successfully!',
        description: 'You have been logged in. Redirecting to your dashboard...',
      });

      // After sign up, user is logged in. We can fetch their profile and redirect.
      const user = authService.getCurrentUser();
      if (user) {
        const profile = await userService.getUserProfile(user.uid);
        // Default redirect for new users, can be changed later
        router.push(profile?.roles?.includes('admin') ? '/admin/dashboard' : '/'); 
      } else {
        router.push('/login');
      }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-background">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to your email address to complete your sign-up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={isLoading}
                maxLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
              {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : 'Verify & Sign Up'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default VerifyForm;

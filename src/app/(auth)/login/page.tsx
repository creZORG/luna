
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';
import { Loader } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { userService } from '@/services/user.service';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading, userProfile } = useAuth();

  const getRedirectPath = (roles: string[] = []) => {
    if (roles.includes('admin')) return '/admin/dashboard';
    if (roles.includes('sales')) return '/sales';
    if (roles.includes('operations')) return '/operations';
    if (roles.includes('finance')) return '/finance';
    if (roles.includes('manufacturing')) return '/manufacturing';
    if (roles.includes('digital-marketing')) return '/digital-marketing';
    return '/admin/dashboard'; // Default fallback
  }

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user && userProfile) {
    router.push(getRedirectPath(userProfile.roles));
    return null;
  }
   if (user && !userProfile && !loading) {
    // User is authenticated but profile is not loaded, maybe they don't have one.
    // Or maybe it's still loading. The loading state in useAuth should handle this.
    // For now, let's just show a loading state. A better approach might be to show an error or guide user.
     router.push('/access-denied');
     return null;
  }


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await authService.login(email, password);
      const profile = await userService.getUserProfile(user.uid);
      
      toast({
        title: 'Login Successful',
        description: "Welcome back! Redirecting...",
      });

      const redirectPath = getRedirectPath(profile?.roles);
      router.push(redirectPath);

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-background">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Portal Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your designated portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

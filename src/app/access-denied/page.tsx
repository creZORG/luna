
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AccessDeniedPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-background">
      <Card className="mx-auto max-w-sm text-center">
        <CardHeader>
          <div className='flex justify-center mb-4'>
            <ShieldAlert className="w-16 h-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You do not have the necessary permissions to access this page. This may be because you are trying to access a staff portal from the main website.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className='mb-6'>Please use the correct portal subdomain (e.g., staff.luna.co.ke) or contact an administrator.</p>
            <div className='flex gap-4'>
                 <Button asChild className="w-full" variant="outline">
                    <Link href="/">Go to Homepage</Link>
                </Button>
                <Button asChild className="w-full">
                    <Link href="/login">Login</Link>
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

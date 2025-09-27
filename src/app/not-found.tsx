
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchX } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-background">
      <Card className="mx-auto max-w-sm text-center">
        <CardHeader>
          <div className='flex justify-center mb-4'>
            <SearchX className="w-16 h-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline">404 - Page Not Found</CardTitle>
          <CardDescription>
            Oops! The page you're looking for doesn't seem to exist.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className='mb-6'>It might have been moved, deleted, or maybe you just mistyped the URL.</p>
            <Button asChild className="w-full">
              <Link href="/">Go Back to Homepage</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}

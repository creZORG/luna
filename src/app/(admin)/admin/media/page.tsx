'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function MediaPage() {
  return (
    <div>
        <div className='mb-6'>
            <h1 className="text-3xl font-bold">Media Library</h1>
            <p className="text-muted-foreground">Manage your product images via the Cloudinary dashboard.</p>
        </div>

        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Image Management has Moved</AlertTitle>
            <AlertDescription>
                All image assets for this application are now managed directly in your Cloudinary account. 
                This provides a more robust and secure environment for your media. Please use the Cloudinary
                dashboard to upload, organize, and transform your images.
            </AlertDescription>
        </Alert>
        
         <Card className="mt-6">
            <CardHeader>
                <CardTitle>Using Images in Your App</CardTitle>
                <CardDescription>
                    To use an image from Cloudinary in a product or elsewhere, follow these steps:
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Log in to your Cloudinary dashboard.</li>
                    <li>Upload the desired image to your media library.</li>
                    <li>Copy the public URL of the uploaded image.</li>
                    <li>
                        Update the `imageUrl` for the corresponding entry in the{' '}
                        <code className="bg-muted px-1 py-0.5 rounded">src/lib/placeholder-images.json</code> file.
                    </li>
                    <li>The application will automatically pick up the new image.</li>
                </ol>
            </CardContent>
        </Card>
    </div>
  );
}

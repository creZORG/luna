'use client';
import { useState, useEffect, useRef } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { app } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { Copy, Trash2, UploadCloud } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const storage = getStorage(app);

export default function MediaPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<{url: string, name: string}[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    setIsLoadingImages(true);
    const listRef = ref(storage, 'product-images');
    try {
      const res = await listAll(listRef);
      const urlPromises = res.items.map(itemRef => 
        getDownloadURL(itemRef).then(url => ({ url, name: itemRef.name }))
      );
      const imageList = await Promise.all(urlPromises);
      setImages(imageList);
    } catch (error) {
      console.error("Error fetching images: ", error);
      toast({
        variant: 'destructive',
        title: 'Error fetching images',
        description: 'Could not load images from storage.',
      });
    } finally {
        setIsLoadingImages(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    const storageRef = ref(storage, `product-images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setIsUploading(true);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        toast({
            variant: 'destructive',
            title: 'Upload failed',
            description: 'There was an error uploading your file.',
        });
        setIsUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(() => {
          toast({
            title: 'Upload successful!',
            description: `${file.name} has been uploaded.`,
          });
          setIsUploading(false);
          setFile(null);
          setUploadProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          fetchImages(); // Refresh the gallery
        });
      }
    );
  };
  
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'URL Copied!', description: 'The image URL has been copied to your clipboard.' });
  }

  const handleDeleteImage = async (imageName: string) => {
    const imageRef = ref(storage, `product-images/${imageName}`);
    try {
        await deleteObject(imageRef);
        toast({ title: 'Image Deleted', description: `${imageName} has been successfully deleted.` });
        fetchImages(); // Refresh gallery
    } catch (error) {
        console.error("Error deleting image: ", error);
        toast({
            variant: 'destructive',
            title: 'Deletion failed',
            description: 'There was an error deleting the image.',
        });
    }
  }


  return (
    <Tabs defaultValue="gallery">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold">Media Library</h1>
                <p className="text-muted-foreground">Manage your product images.</p>
            </div>
            <TabsList>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>
      </div>

      <TabsContent value="upload" className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload New Image</CardTitle>
            <CardDescription>Select a file to upload to your product image storage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
                className="border-2 border-dashed border-muted-foreground rounded-lg p-8 text-center cursor-pointer hover:bg-muted"
                onClick={() => fileInputRef.current?.click()}
            >
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                    {file ? `Selected: ${file.name}` : 'Click or drag file to this area to upload'}
                </p>
                <Input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
            </div>

            {isUploading && <Progress value={uploadProgress} className="w-full" />}
            
            <Button onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="gallery" className="mt-8">
         <Card>
            <CardHeader>
                <CardTitle>Image Gallery</CardTitle>
                <CardDescription>Images available in your Firebase Storage.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoadingImages ? (
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {[...Array(5)].map((_, i) => (
                           <div key={i} className="aspect-square bg-muted rounded-md animate-pulse"></div>
                        ))}
                    </div>
                ) : images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {images.map((image) => (
                        <div key={image.url} className="relative group border rounded-md overflow-hidden">
                            <Image
                                src={image.url}
                                alt={image.name}
                                width={300}
                                height={300}
                                className="aspect-square object-cover w-full h-full"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button size="icon" variant="secondary" onClick={() => handleCopyUrl(image.url)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="icon" variant="destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the image "{image.name}".
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteImage(image.name)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-8">No images found in storage.</p>
                )}
            </CardContent>
         </Card>
      </TabsContent>
    </Tabs>
  );
}

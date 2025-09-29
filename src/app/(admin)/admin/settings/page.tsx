
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { settingsService, CompanySettings } from '@/services/settings.service';
import { Loader, Save, Truck, UploadCloud } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '@/components/ui/separator';
import { websiteImageService, WebsiteImage } from '@/services/website-images.service';
import Image from 'next/image';
import { uploadImageFlow } from '@/ai/flows/upload-image-flow';
import { useRouter } from 'next/navigation';

const settingsFormSchema = z.object({
  latitude: z.coerce.number().min(-90, 'Invalid latitude').max(90, 'Invalid latitude'),
  longitude: z.coerce.number().min(-180, 'Invalid longitude').max(180, 'Invalid longitude'),
  maxCheckInDistance: z.coerce.number().int().min(10, 'Must be at least 10 meters'),
  deliveryFees: z.object({
      nairobi: z.coerce.number().min(0, "Fee cannot be negative"),
      majorTowns: z.coerce.number().min(0, "Fee cannot be negative"),
      remote: z.coerce.number().min(0, "Fee cannot be negative"),
  })
});

type SettingsFormData = z.infer<typeof settingsFormSchema>;

function WebsiteImageUploader() {
    const [images, setImages] = useState<WebsiteImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [previews, setPreviews] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        websiteImageService.getWebsiteImages()
            .then(setImages)
            .finally(() => setLoading(false));
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, imageId: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => ({...prev, [imageId]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveImage = async (imageId: string, imageHint: string) => {
        const dataUri = previews[imageId];
        if (!dataUri) return;

        setIsSaving(prev => ({ ...prev, [imageId]: true }));
        try {
            const newUrl = await uploadImageFlow({ imageDataUri: dataUri, folder: 'website-assets' });
            await websiteImageService.updateWebsiteImage(imageId, newUrl);
            toast({ title: 'Image Updated!', description: `${imageHint} has been successfully updated.` });
            setPreviews(prev => {
                const newPreviews = { ...prev };
                delete newPreviews[imageId];
                return newPreviews;
            });
            // Refresh data on page to show new image from server
            const updatedImages = await websiteImageService.getWebsiteImages();
            setImages(updatedImages);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not update the image.' });
        } finally {
            setIsSaving(prev => ({ ...prev, [imageId]: false }));
        }
    };

    if (loading) {
        return (
             <Card>
                <CardHeader><CardTitle>Website Images</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Website Images</CardTitle>
                <CardDescription>
                    Manage the main marketing images shown on your homepage and other public pages.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                {images.map((image) => (
                    <div key={image.id} className="space-y-2">
                        <Label>{image.description}</Label>
                        <div className="relative w-full h-48 border-2 border-dashed rounded-lg flex justify-center items-center text-muted-foreground overflow-hidden">
                             <Image 
                                src={previews[image.id] || image.imageUrl} 
                                alt={image.description}
                                layout="fill"
                                objectFit="cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center opacity-0 hover:opacity-100 transition-opacity">
                                <UploadCloud className="h-10 w-10 text-white" />
                                <span className="text-white text-sm mt-2">Change Image</span>
                                <Input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, image.id)}
                                />
                            </div>
                        </div>
                        {previews[image.id] && (
                            <Button
                                className="w-full"
                                onClick={() => handleSaveImage(image.id, image.description)}
                                disabled={isSaving[image.id]}
                            >
                                {isSaving[image.id] ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
        deliveryFees: {
            nairobi: 0,
            majorTowns: 0,
            remote: 0,
        }
    }
  });
  
  const { isSubmitting } = form.formState;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await settingsService.getCompanySettings();
        if (settings) {
          form.reset(settings);
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Failed to load settings',
          description: 'Could not fetch current company settings.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [form, toast]);


  const onSubmit = async (data: SettingsFormData) => {
    if (!user || !userProfile) {
        toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to save settings.'});
        return;
    }
    try {
      await settingsService.updateCompanySettings(data, user.uid, userProfile.displayName);
      toast({
        title: 'Settings Saved!',
        description: 'Company settings have been updated successfully.',
      });
      form.reset(data); // Resets the dirty state
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'There was an error saving the settings.',
      });
    }
  };

  if (loading) {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Company Settings</h1>
                <p className="text-muted-foreground">Manage company-wide configurations.</p>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                   <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                   <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-10 w-full" /></div>
                   <Separator />
                   <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                   <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                   <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-10 w-full" /></div>
                   <div className="flex justify-end"><Skeleton className="h-10 w-24" /></div>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className='space-y-6'>
        <div className="mb-6">
            <h1 className="text-3xl font-bold">Company Settings</h1>
            <p className="text-muted-foreground">Manage company-wide configurations for attendance, logistics and website content.</p>
        </div>
        
        <WebsiteImageUploader />
        
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Location & Attendance</CardTitle>
                    <CardDescription>
                    Define the official office coordinates and the allowed radius for staff check-ins. You can get coordinates from Google Maps.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="latitude">Office Latitude</Label>
                            <Input id="latitude" type="number" step="any" {...form.register('latitude')} />
                            {form.formState.errors.latitude && <p className="text-sm text-destructive">{form.formState.errors.latitude.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="longitude">Office Longitude</Label>
                            <Input id="longitude" type="number" step="any" {...form.register('longitude')} />
                             {form.formState.errors.longitude && <p className="text-sm text-destructive">{form.formState.errors.longitude.message}</p>}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="maxCheckInDistance">Max Check-in Distance (meters)</Label>
                        <Input id="maxCheckInDistance" type="number" {...form.register('maxCheckInDistance')} />
                         {form.formState.errors.maxCheckInDistance && <p className="text-sm text-destructive">{form.formState.errors.maxCheckInDistance.message}</p>}
                        <p className="text-xs text-muted-foreground">
                            The maximum distance (in meters) a staff member can be from the office to check in.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Delivery & Logistics</CardTitle>
                    <CardDescription>
                        Set the delivery fees for different geographical zones. These fees are applied to the entire order.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                         <div className="space-y-2">
                            <Label htmlFor="deliveryFees.nairobi">Nairobi Area Fee (Ksh)</Label>
                            <Input id="deliveryFees.nairobi" type="number" step="any" {...form.register('deliveryFees.nairobi')} />
                            {form.formState.errors.deliveryFees?.nairobi && <p className="text-sm text-destructive">{form.formState.errors.deliveryFees.nairobi.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="deliveryFees.majorTowns">Major Towns Fee (Ksh)</Label>
                            <Input id="deliveryFees.majorTowns" type="number" step="any" {...form.register('deliveryFees.majorTowns')} />
                             {form.formState.errors.deliveryFees?.majorTowns && <p className="text-sm text-destructive">{form.formState.errors.deliveryFees.majorTowns.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="deliveryFees.remote">Remote Areas Fee (Ksh)</Label>
                            <Input id="deliveryFees.remote" type="number" step="any" {...form.register('deliveryFees.remote')} />
                             {form.formState.errors.deliveryFees?.remote && <p className="text-sm text-destructive">{form.formState.errors.deliveryFees.remote.message}</p>}
                        </div>
                    </div>
                     <p className="text-xs text-muted-foreground">
                        Counties are automatically categorized as "Major Towns" or "Remote Areas". Pickup orders have no delivery fee.
                    </p>
                </CardContent>
            </Card>

            <div className="flex justify-end mt-6">
                <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
                    {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save All Settings
                </Button>
            </div>
        </form>
    </div>
  );
}

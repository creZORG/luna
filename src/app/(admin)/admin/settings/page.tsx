
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { settingsService, CompanySettings } from '@/services/settings.service';
import { Loader, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

const settingsFormSchema = z.object({
  latitude: z.coerce.number().min(-90, 'Invalid latitude').max(90, 'Invalid latitude'),
  longitude: z.coerce.number().min(-180, 'Invalid longitude').max(180, 'Invalid longitude'),
  maxCheckInDistance: z.coerce.number().int().min(10, 'Must be at least 10 meters'),
});

type SettingsFormData = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
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
                    <CardTitle>Location & Check-in</CardTitle>
                    <CardDescription>
                    Define the official office coordinates and the allowed radius for staff check-ins.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
    <div>
        <div className="mb-6">
            <h1 className="text-3xl font-bold">Company Settings</h1>
            <p className="text-muted-foreground">Manage company-wide configurations.</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Location & Check-in</CardTitle>
                <CardDescription>
                Define the official office coordinates and the allowed radius for staff check-ins. You can get coordinates from Google Maps.
                </CardDescription>
            </CardHeader>
             <form onSubmit={form.handleSubmit(onSubmit)}>
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
                     <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Settings
                        </Button>
                    </div>
                </CardContent>
             </form>
        </Card>
    </div>
  );
}

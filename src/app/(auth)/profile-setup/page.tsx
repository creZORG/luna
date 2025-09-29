
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader, UserCheck, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { userService, UserProfileUpdateData } from '@/services/user.service';
import Image from 'next/image';

const setupFormSchema = z.object({
  displayName: z.string().min(3, 'Full name must be at least 3 characters.'),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms of service.' }),
  }),
  agreeToPolicy: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the privacy policy.' }),
  }),
});

type SetupFormData = z.infer<typeof setupFormSchema>;

export default function ProfileSetupPage() {
  const { user, userProfile, loading, refetchUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<SetupFormData>({
    resolver: zodResolver(setupFormSchema),
    defaultValues: {
      displayName: userProfile?.displayName || '',
      agreeToTerms: false,
      agreeToPolicy: false,
    },
  });
  
  const { isSubmitting } = form.formState;

  // Redirect user if they are not supposed to be here
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (userProfile?.profileSetupComplete) {
        router.push('/admin/dashboard'); // Or their primary dashboard
      }
    }
  }, [user, userProfile, loading, router]);


  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const onSubmit = async (data: SetupFormData) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in.'});
        return;
    }
     if (!photoPreview) {
      toast({ variant: 'destructive', title: 'Photo Required', description: 'Please upload a profile photo to continue.' });
      return;
    }

    try {
        const updateData: UserProfileUpdateData = {
            displayName: data.displayName,
            profileSetupComplete: true,
            photoDataUrl: photoPreview
        };

        await userService.updateUserProfile(user.uid, updateData);

        if (refetchUserProfile) {
           await refetchUserProfile();
        }

        toast({
            title: 'Profile Setup Complete!',
            description: 'Welcome! Redirecting you to the dashboard...',
        });

        router.push('/admin/dashboard'); // The useAuth hook will handle correct redirect on next load
        router.refresh();

    } catch (error) {
         toast({ variant: 'destructive', title: 'Error', description: 'Could not save your profile. Please try again.'});
    }
  };
  
  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-background">
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <UserCheck className="w-16 h-16 text-primary" />
          </div>
          <CardTitle className="text-2xl">One Last Step</CardTitle>
          <CardDescription>
            Please complete your profile to continue to the staff portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                      <Image
                          src={photoPreview || `https://i.pravatar.cc/128?u=${user.uid}`}
                          alt="Profile Picture"
                          width={128}
                          height={128}
                          className="rounded-full aspect-square object-cover border-4 border-muted"
                      />
                      <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="absolute bottom-0 right-0 rounded-full"
                          onClick={() => fileInputRef.current?.click()}
                      >
                          <ImageIcon className="h-4 w-4" />
                      </Button>
                      <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*"
                          onChange={handlePhotoChange}
                      />
                  </div>
              </div>

              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                     <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                         I agree to the{' '}
                        <Link href="/terms" target="_blank" className="underline hover:text-primary">Staff Terms of Service</Link>.
                      </FormLabel>
                       <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="agreeToPolicy"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                     <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I agree to the{' '}
                        <Link href="/privacy" target="_blank" className="underline hover:text-primary">Staff Privacy Policy</Link>.
                      </FormLabel>
                       <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Complete Setup
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

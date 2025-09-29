
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, User, Mail, Shield, Save, Image as ImageIcon, Link2, Plus, Trash2, Linkedin, Twitter, Globe, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { UserProfileUpdateData, userService } from '@/services/user.service';
import { useRef, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const profileFormSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters.'),
  qualifications: z.string().optional(),
  socialLinks: z.array(
    z.object({
      platform: z.string().min(1, 'Platform is required.'),
      url: z.string().url('Please enter a valid URL.'),
    })
  ).optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

const platformIcons = {
    linkedin: Linkedin,
    twitter: Twitter,
    portfolio: Globe,
    other: LinkIcon,
};

export default function ProfilePage() {
    const { user, userProfile, loading } = useAuth();
    const { toast } = useToast();
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(userProfile?.photoURL || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<ProfileFormData>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            displayName: userProfile?.displayName || '',
            qualifications: userProfile?.qualifications || '',
            socialLinks: userProfile?.socialLinks || [],
        },
    });
    
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'socialLinks',
    });
    
    const { isSubmitting, isDirty } = form.formState;

    if (loading || !userProfile) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
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

    const onSubmit = async (data: ProfileFormData) => {
        const updateData: UserProfileUpdateData = { ...data };

        if (photoPreview && photoPreview !== userProfile.photoURL) {
            updateData.photoDataUrl = photoPreview;
        }
        
        try {
            await userService.updateUserProfile(userProfile.uid, updateData);
            toast({
                title: 'Profile Updated!',
                description: 'Your profile information has been saved.',
            });
            // Reset form dirty state after successful submission
            form.reset(data);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'There was an error updating your profile.',
            });
        }
    };


    return (
        <div className="grid gap-6">
            <div>
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground">View and edit your personal information and links.</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-3 gap-6 items-start">
                    <div className="md:col-span-1 flex flex-col gap-6">
                        <Card>
                             <CardHeader>
                                <CardTitle>Profile Picture</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <Image
                                        src={photoPreview || `https://i.pravatar.cc/128?u=${userProfile.uid}`}
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
                                <div className="text-center w-full">
                                    <Controller
                                        name="displayName"
                                        control={form.control}
                                        render={({ field }) => <Input {...field} className="text-2xl font-bold text-center border-none focus-visible:ring-1" />}
                                    />
                                    <FormMessage>{form.formState.errors.displayName?.message}</FormMessage>

                                    <div className="flex items-center justify-center gap-2 mt-2 text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span>{userProfile.email}</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 mt-1 text-muted-foreground capitalize">
                                        <Shield className="h-4 w-4" />
                                        <span>{userProfile.roles.join(', ')}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Qualifications</CardTitle>
                                <CardDescription>Briefly describe your skills and professional background.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    {...form.register('qualifications')}
                                    placeholder="e.g., Certified Digital Marketer, Full-Stack Developer with 5 years of experience..."
                                    rows={5}
                                />
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader>
                                <CardTitle>Social & Professional Links</CardTitle>
                                <CardDescription>Add links to your portfolio, LinkedIn, or other sites.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {fields.map((field, index) => {
                                    const selectedPlatform = form.watch(`socialLinks.${index}.platform`);
                                    const Icon = platformIcons[selectedPlatform as keyof typeof platformIcons] || LinkIcon;

                                    return (
                                        <div key={field.id} className="flex gap-2 items-start">
                                            <div className="flex gap-2 flex-grow">
                                                <div className="w-1/3">
                                                    <Controller
                                                        control={form.control}
                                                        name={`socialLinks.${index}.platform`}
                                                        render={({ field }) => (
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <SelectTrigger>
                                                                    <div className="flex items-center gap-2">
                                                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                                                        <SelectValue placeholder="Platform" />
                                                                    </div>
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                                                                    <SelectItem value="twitter">Twitter / X</SelectItem>
                                                                    <SelectItem value="portfolio">Portfolio</SelectItem>
                                                                    <SelectItem value="other">Other</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                </div>
                                                <div className="w-2/3">
                                                    <Controller
                                                        name={`socialLinks.${index}.url`}
                                                        control={form.control}
                                                        render={({ field }) => <Input {...field} placeholder="https://..." />}
                                                    />
                                                    <FormMessage>{form.formState.errors.socialLinks?.[index]?.url?.message}</FormMessage>
                                                </div>
                                            </div>
                                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })}

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => append({ platform: 'other', url: '' })}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Link
                                </Button>
                            </CardContent>
                        </Card>
                         <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting || (!isDirty && !photo)}>
                                {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}

// Dummy Form and FormMessage components for type-checking, since they are not exported from form.tsx
const Form = ({ children, ...props }: { children: React.ReactNode, [key: string]: any }) => <div {...props}>{children}</div>;
const FormMessage = ({ children }: { children: React.ReactNode }) => <p className="text-sm font-medium text-destructive mt-1">{children}</p>;

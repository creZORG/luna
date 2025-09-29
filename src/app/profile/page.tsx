
'use client';
import { useAuth } from '@/hooks/use-auth';
import { redirect } from 'next/navigation';
import ProfileClient from "./_components/profile-client";
import AdminLayout from '../(admin)/admin/layout';
import { Loader } from 'lucide-react';

export default function ProfilePage() {
    const { user, userProfile, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center">
                <Loader className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (!user) {
        redirect('/login');
    }

    const isStaff = userProfile && (userProfile.roles.includes('admin') || userProfile.roles.includes('sales') || userProfile.roles.includes('operations') || userProfile.roles.includes('finance') || userProfile.roles.includes('manufacturing'));
    
    // If user has internal staff roles, wrap with AdminLayout
    if (isStaff) {
        return (
            <AdminLayout>
                <ProfileClient />
            </AdminLayout>
        );
    }

    // For customers, influencers, etc. show a simpler layout
    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
             <div className="text-center mb-12">
                <h1 className="text-4xl font-headline font-bold">My Account</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome back! Here you can manage your orders and personal information.
                </p>
            </div>
            <ProfileClient />
        </div>
    )
}

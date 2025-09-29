
'use client';

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import AdminLayout from "@/app/(admin)/admin/layout";

export default function ManufacturingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();

    if (loading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center">
                <Loader className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    const hasAccess = userProfile?.roles?.includes('manufacturing') || userProfile?.roles?.includes('admin');
    
    if (!hasAccess) {
        router.push('/access-denied');
        return null;
    }

    return <AdminLayout>{children}</AdminLayout>;
}

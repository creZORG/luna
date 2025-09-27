
'use client';

import AdminLayout from "@/app/(admin)/admin/layout";
import { useAuth } from "@/hooks/use-auth";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DigitalMarketingLayout({
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

    if (!userProfile?.roles?.includes('digital-marketing') && !userProfile?.roles?.includes('admin')) {
        router.push('/access-denied');
        return null;
    }

    return <AdminLayout>{children}</AdminLayout>;
}

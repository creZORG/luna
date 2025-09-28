
'use client';

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import AdminLayout from "@/app/(admin)/admin/layout";

export default function FinanceLayout({
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

    if (!userProfile?.roles?.includes('finance') && !userProfile?.roles?.includes('admin')) {
        router.push('/access-denied');
        return null;
    }

    return <AdminLayout>{children}</AdminLayout>;
}

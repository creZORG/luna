
'use client';

import AdminLayout from "@/app/(admin)/admin/layout";
import { useAuth } from "@/hooks/use-auth";
import { Loader, Package, Truck, Warehouse, MapPin, CheckCheck, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const operationsNavLinks = [
    { href: '/operations', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/operations/products', label: 'Products', icon: Package },
    { href: '/operations/raw-materials/intake', label: 'Material Intake', icon: Truck },
    { href: '/operations/raw-materials/inventory', label: 'Inventory', icon: Warehouse },
    { href: '/operations/pickup-locations', label: 'Pickup Locations', icon: MapPin },
    { href: '/operations/stock-reconciliation', label: 'Stock Reconciliation', icon: CheckCheck }
];

function OperationsNav() {
    const pathname = usePathname();

    return (
        <nav className="flex items-center space-x-1 bg-muted p-1 rounded-lg mb-6 w-fit">
            {operationsNavLinks.map(link => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                        pathname === link.href 
                            ? "bg-background text-foreground shadow-sm" 
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                </Link>
            ))}
        </nav>
    );
}


export default function OperationsLayout({
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

    if (!userProfile?.roles?.includes('operations') && !userProfile?.roles?.includes('admin')) {
        router.push('/access-denied');
        return null;
    }

    return (
        <AdminLayout>
            <div className="grid gap-6">
                <div>
                    <h1 className="text-3xl font-bold">Operations Portal</h1>
                    <p className="text-muted-foreground">Manage inventory, logistics, and production quality control.</p>
                </div>
                <OperationsNav />
                <div>
                    {children}
                </div>
            </div>
        </AdminLayout>
    );
}

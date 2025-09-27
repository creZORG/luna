
'use client';

import Link from 'next/link';
import { Home, PanelLeft, LogOut, Loader, Activity, Package, Truck, Warehouse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Separator } from '@/components/ui/separator';

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

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  const navLinks = [
    { href: "/operations", icon: Activity, label: "Dashboard" },
    { href: "/operations/products", icon: Package, label: "Finished Goods" },
    { separator: true, id: 'sep1' },
    { href: "/operations/raw-materials/intake", icon: Truck, label: "Material Intake" },
    { href: "/operations/raw-materials/inventory", icon: Warehouse, label: "Material Inventory" },
    { separator: true, id: 'sep2' },
    { href: "/admin/dashboard", icon: Home, label: "Main Admin" },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/operations"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Activity className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Operations</span>
          </Link>
          {navLinks.map((link, index) => 
            link.separator ? <Separator key={link.id} className="my-2" /> : (
            <Link key={link.href} href={link.href!} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                <link.icon className="h-5 w-5" />
                <span className="sr-only">{link.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/operations"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              >
                <Activity className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">Operations</span>
              </Link>
              {navLinks.map((link, index) => 
                link.separator ? <Separator key={link.id} /> : (
                <Link key={link.href} href={link.href!} className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="relative ml-auto flex-1 md:grow-0"></div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Image
                  src={`https://i.pravatar.cc/36?u=${user.uid}`}
                  width={36}
                  height={36}
                  alt="Avatar"
                  className="overflow-hidden rounded-full"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{userProfile?.displayName || user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Settings</DropdownMenuItem>
              <DropdownMenuItem disabled>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}

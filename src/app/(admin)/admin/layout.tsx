
'use client';

import Link from 'next/link';
import { Home, BarChart2, PanelLeft, LogOut, Loader, Image as ImageIcon, Briefcase, Factory, Target, Activity, Settings, Store, ShieldAlert, ClipboardCheck, ChevronDown, UserCog, PanelRight, PanelLeftClose, User as UserIcon, ShoppingCart, Package2, Users, FileText, Moon, Warehouse, PieChart, Menu, LocateFixed, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useState, useEffect, useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { UserProfile } from '@/services/user.service';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';


function PendingProfileModal({ isOpen }: { isOpen: boolean }) {
  return (
    <Dialog open={isOpen}>
      <DialogContent showCloseButton={false} onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <UserCog className="w-12 h-12 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">Account Setup Pending</DialogTitle>
          <DialogDescription className="text-center">
            Your profile has been created, but an administrator has not assigned any roles to you yet. Please contact your administrator to gain access to the dashboard.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

const getNavLinks = (userProfile: UserProfile | null) => {
    if (!userProfile) return [];

    const hasRole = (role: UserProfile['roles'][number]) => userProfile.roles.includes(role);
    const hasAnyRole = (roles: UserProfile['roles']) => roles.some(role => hasRole(role));

    const allLinks = [
        { href: '/admin/dashboard', icon: BarChart2, label: 'Dashboard', roles: ['admin', 'sales', 'operations', 'finance', 'manufacturing', 'digital-marketing'] },
        { href: '/admin/analytics', icon: PieChart, label: 'Analytics', roles: ['admin'] },
        { href: '/admin/orders', icon: Package2, label: 'Orders', roles: ['admin', 'sales', 'operations'] },
        { href: '/admin/media', icon: ImageIcon, label: 'Media Library', roles: ['admin'] },
        { separator: true, id: 'sep-store', roles: ['admin'] },
        {
          label: 'Store Management',
          icon: Store,
          type: 'collapsible',
          id: 'store-management',
          roles: ['admin'],
          subLinks: [
            { href: '/operations/products', icon: Briefcase, label: 'Product Catalog', roles:['admin'] },
            { href: '/admin/products', icon: Factory, label: 'Product Pricing', roles:['admin'] },
            { href: '/admin/store-items', icon: Warehouse, label: 'Inventory', roles:['admin'] },
          ],
        },
        {
          label: 'Procurement',
          icon: ShoppingCart,
          type: 'collapsible',
          id: 'procurement',
          roles: ['admin', 'operations'],
          subLinks: [
            { href: '/admin/raw-materials/orders', icon: FileText, label: 'Purchase Orders', roles: ['admin'] },
            { href: '/operations/raw-materials/manage', icon: Factory, label: 'Manage Materials', roles: ['admin', 'operations'] },
          ]
        },
        {
          label: 'Staff Portals',
          icon: ShieldAlert,
          type: 'collapsible',
          id: 'staff-portals',
          roles: ['admin'],
          subLinks: [
            { href: '/sales', icon: Target, label: 'Sales', roles:['admin'] },
            { href: '/operations', icon: Activity, label: 'Operations', roles:['admin'] },
            { href: '/manufacturing', icon: Factory, label: 'Manufacturing', roles:['admin'] },
            { href: '/finance', icon: Briefcase, label: 'Finance', roles:['admin'] },
            { href: '/digital-marketing', icon: Target, label: 'Digital Marketing', roles:['admin'] },
          ],
        },
         {
          label: 'Human Resources',
          icon: UserCog,
          type: 'collapsible',
          id: 'hr',
          roles: ['admin', 'sales', 'operations', 'finance', 'manufacturing', 'digital-marketing'],
          subLinks: [
            { href: '/admin/attendance/check-in', icon: ClipboardCheck, label: 'My Attendance', roles: ['admin', 'sales', 'operations', 'finance', 'manufacturing', 'digital-marketing'] },
            { href: '/admin/attendance/overview', icon: BarChart2, label: 'Attendance Overview', roles: ['admin'] },
            { href: '/operations/stock-reconciliation', icon: CheckCheck, label: 'Stock Reconciliation', roles: ['admin', 'operations'] },
            { href: '/admin/users', icon: Users, label: 'Staff Management', roles: ['admin'] },
            { href: '/admin/activities', icon: Activity, label: 'Recent Activities', roles: ['admin'] },
            { href: '/admin/field-sale-logs', icon: LocateFixed, label: 'Field Sale Logs', roles: ['admin'] },
          ],
        },
    ];

    // Filter links based on user roles
    return allLinks.map(link => {
        if (!link) return null;

        // Admins see everything
        if (hasRole('admin')) {
             if (link.type === 'collapsible') {
                const subLinksWithAccess = (link.subLinks || []).filter(sublink => hasAnyRole(sublink.roles as any));
                if (subLinksWithAccess.length > 0) {
                  return { ...link, subLinks: subLinksWithAccess };
                }
                return null;
            }
            return link;
        }

        // Non-admins see a filtered list
        if (link.type === 'collapsible') {
            const visibleSubLinks = (link.subLinks || []).filter(sublink => hasAnyRole(sublink.roles as any));
            if (visibleSubLinks.length > 0) {
              return { ...link, subLinks: visibleSubLinks };
            }
            return null;
        }

        if (hasAnyRole(link.roles as any)) {
            return link;
        }
        
        return null;
    }).filter(Boolean);
}


function NavContent({ isCollapsed, userProfile }: { isCollapsed: boolean, userProfile: UserProfile | null }) {
    const pathname = usePathname();
    const navLinks = useMemo(() => getNavLinks(userProfile), [userProfile]);

    return (
         <div className={cn("flex flex-col justify-center flex-grow", isCollapsed ? "items-center" : "")}>
            <TooltipProvider>
                 <nav className="grid gap-1 px-2">
                    {navLinks.map((link, index) => {
                         if (!link) return null;
                         if (link.separator) {
                            return <Separator key={index} className="my-2" />;
                         }
                         if (link.type === 'collapsible') {
                            if (link.subLinks.length === 0) return null;

                            return (
                                <Collapsible key={link.id} defaultOpen={(link.subLinks || []).some(sub => pathname.startsWith(sub.href))}>
                                     <Tooltip delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" className={cn("w-full justify-start", isCollapsed && "justify-center w-10 h-10 p-0")}>
                                                    <link.icon className="h-5 w-5" />
                                                    {!isCollapsed && <span className="ml-4">{link.label}</span>}
                                                    {!isCollapsed && <ChevronDown className="ml-auto h-4 w-4" />}
                                                </Button>
                                            </CollapsibleTrigger>
                                        </TooltipTrigger>
                                        {isCollapsed && <TooltipContent side="right"><p>{link.label}</p></TooltipContent>}
                                    </Tooltip>

                                     <CollapsibleContent className={cn("space-y-1", !isCollapsed && "pl-6")}>
                                        {(link.subLinks || []).map(subLink => {
                                             return (
                                             <Tooltip key={subLink.href} delayDuration={0}>
                                                <TooltipTrigger asChild>
                                                     <Link
                                                        href={subLink.href}
                                                        className={cn(
                                                            'flex items-center gap-4 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                                                            pathname.startsWith(subLink.href) && 'bg-muted text-primary',
                                                            isCollapsed && 'w-10 h-10 justify-center p-0 ml-2'
                                                        )}
                                                        >
                                                        <subLink.icon className="h-5 w-5" />
                                                         {!isCollapsed && <span className="ml-2">{subLink.label}</span>}
                                                    </Link>
                                                </TooltipTrigger>
                                                 {isCollapsed && <TooltipContent side="right"><p>{subLink.label}</p></TooltipContent>}
                                            </Tooltip>
                                        )})}
                                    </CollapsibleContent>
                                </Collapsible>
                            );
                         }
                        return (
                             <Tooltip key={link.href} delayDuration={0}>
                                <TooltipTrigger asChild>
                                     <Link
                                        href={link.href!}
                                        className={cn(
                                            'flex items-center gap-4 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                                            pathname.startsWith(link.href!) && 'bg-muted text-primary',
                                            isCollapsed && 'w-10 h-10 justify-center p-0'
                                        )}
                                        >
                                        <link.icon className="h-5 w-5" />
                                         {!isCollapsed && link.label}
                                    </Link>
                                </TooltipTrigger>
                                 {isCollapsed && <TooltipContent side="right"><p>{link.label}</p></TooltipContent>}
                            </Tooltip>
                        );
                    })}
                </nav>
            </TooltipProvider>
        </div>
    );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading, isProfilePending } = useAuth();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    if (loading) return; // Wait until auth state is confirmed

    if (!user) {
        router.push('/login');
        return;
    }
  }, [user, userProfile, loading, router]);


  if (loading || !user || !userProfile) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };
  
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
      <aside className={cn(
            "hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:flex-col border-r bg-background/80 backdrop-blur-sm transition-all duration-300 ease-in-out shadow-lg",
            "md:top-4 md:bottom-4 md:ml-4 md:rounded-xl",
            isCollapsed ? "md:w-20" : "md:w-64"
        )}>
           <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center justify-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Moon className="h-6 w-6 text-primary" />
                        <span className={cn(isCollapsed && "hidden")}>Home</span>
                    </Link>
                </div>
                <div className={cn("flex-1 overflow-auto py-2", isCollapsed && "flex flex-col items-center")}>
                     <Button variant="ghost" size="icon" onClick={toggleSidebar} className="absolute -right-4 top-1/2 -translate-y-1/2 bg-background hover:bg-muted border rounded-full h-8 w-8 z-50 hidden md:flex">
                        {isCollapsed ? <PanelRight /> : <PanelLeftClose />}
                    </Button>
                    <NavContent isCollapsed={isCollapsed} userProfile={userProfile} />
                </div>
                 <div className={cn("mt-auto flex flex-col items-center gap-2 border-t p-4", isCollapsed && 'p-2')}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className={cn("w-full justify-center", isCollapsed ? 'h-12 w-12 rounded-full p-0' : 'h-12 rounded-lg')}
                            >
                               <Image
                                    src={userProfile?.photoURL || `https://i.pravatar.cc/36?u=${user.uid}`}
                                    width={36}
                                    height={36}
                                    alt="Avatar"
                                    className="overflow-hidden rounded-full object-cover"
                                />
                                <div className={cn("text-left ml-3", isCollapsed && "hidden")}>
                                    <p className="text-sm font-medium leading-none">{userProfile?.displayName || user.email}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{userProfile.roles.join(', ').replace(/-/g, ' ')}</p>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={cn(isCollapsed && 'ml-4 mb-2')}>
                             <DropdownMenuLabel>{userProfile?.displayName || user.email}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/admin/profile">
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>My Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/admin/settings">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
      </aside>

      <div className={cn("flex flex-col transition-all duration-300 ease-in-out", isCollapsed ? "md:pl-28" : "md:pl-72")}>
        <header className="flex h-14 items-center gap-4 bg-background/80 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30 border-b">
           <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
               <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                           <Moon className="h-6 w-6 text-primary" />
                           <span className="">Home</span>
                        </Link>
                    </div>
                    <div className="flex-1 overflow-auto py-2">
                        <NavContent isCollapsed={false} userProfile={userProfile} />
                    </div>
                </div>
            </SheetContent>
          </Sheet>
          <div className="flex-1">
             <p className="text-sm font-medium text-muted-foreground">
                <span className="capitalize">{userProfile.roles.join(', ').replace(/-/g, ' ')} Portal</span>
             </p>
          </div>
          <p className="text-sm font-medium text-muted-foreground hidden sm:block">
            Welcome, <span className="font-semibold text-foreground">{userProfile.displayName}</span>
          </p>
        </header>

        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 mt-4">
            <PendingProfileModal isOpen={isProfilePending} />
            {isProfilePending ? null : children}
        </main>
      </div>
    </div>
  );
}

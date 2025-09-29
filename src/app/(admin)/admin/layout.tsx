
'use client';

import Link from 'next/link';
import { Home, BarChart2, PanelLeft, LogOut, Loader, Image as ImageIcon, Briefcase, Factory, Target, Activity, Settings, Store, ShieldAlert, ClipboardCheck, ChevronDown, UserCog, PanelRight, PanelLeftClose, User as UserIcon, ShoppingCart } from 'lucide-react';
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
        { href: '/admin/media', icon: ImageIcon, label: 'Media', roles: ['admin'] },
        { separator: true, id: 'sep1', roles: ['admin'] },
        {
          label: 'Store Management',
          icon: Store,
          type: 'collapsible',
          id: 'store-management',
          roles: ['admin'],
          subLinks: [
            { href: '/operations/products', icon: Briefcase, label: 'Products', roles:['admin'] },
            { href: '/admin/products', icon: Briefcase, label: 'Pricing', roles:['admin'] },
            { href: '/admin/store-items', icon: Factory, label: 'Store Items', roles:['admin'] },
          ],
        },
        {
          label: 'Procurement',
          icon: ShoppingCart,
          type: 'collapsible',
          id: 'procurement',
          roles: ['admin'],
          subLinks: [
            { href: '/admin/raw-materials/orders', icon: ShoppingCart, label: 'Raw Material Orders', roles: ['admin'] },
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
            { href: '/admin/users', icon: UserCog, label: 'Staff Management', roles: ['admin'] },
            { href: '/admin/activities', icon: Activity, label: 'Recent Activities', roles: ['admin'] },
          ],
        },
    ];

    // Filter links based on user roles
    return allLinks.map(link => {
        if (!link) return null;
        if (!hasAnyRole(link.roles as any)) return null;

        if (link.type === 'collapsible') {
            const visibleSubLinks = (link.subLinks || []).filter(sublink => hasAnyRole(sublink.roles as any));
            if (visibleSubLinks.length > 0) {
              return { ...link, subLinks: visibleSubLinks };
            }
            // If admin, but no visible sublinks for other roles, still might need to show for admin
            if (hasRole('admin')) return { ...link, subLinks: link.subLinks.filter(sl => hasAnyRole(sl.roles as any))};
            return null;
        }
        return link;
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
                            const subLinksWithAccess = link.subLinks.filter(sub => userProfile?.roles.some(r => sub.roles.includes(r)));
                            if(subLinksWithAccess.length === 0) return null;

                            return (
                                <Collapsible key={link.id} defaultOpen={(link.subLinks || []).some(sub => pathname.startsWith(sub.href))}>
                                     <CollapsibleTrigger asChild>
                                        <Button variant="ghost" className={cn("w-full justify-start", isCollapsed && "justify-center w-10 h-10 p-0")}>
                                            <link.icon className="h-5 w-5" />
                                            {!isCollapsed && <span className="ml-4">{link.label}</span>}
                                            {!isCollapsed && <ChevronDown className="ml-auto h-4 w-4" />}
                                        </Button>
                                    </CollapsibleTrigger>
                                     <CollapsibleContent className="space-y-1">
                                        {(link.subLinks || []).map(subLink => {
                                             if (!userProfile?.roles.some(r => subLink.roles.includes(r))) return null;
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

    // This is the crucial check. If the profile is loaded and the user is not an admin, deny access.
    if (userProfile && !userProfile.roles.includes('admin')) {
      router.push('/access-denied');
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
  
  // An extra layer of protection in case the useEffect hook is slow to fire.
  if (!userProfile.roles.includes('admin')) {
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
    <div className="flex min-h-screen w-full flex-col">
       <aside className={cn(
            "fixed inset-y-0 left-0 z-40 flex-col border-r bg-background/80 backdrop-blur-sm transition-all duration-300 ease-in-out shadow-lg",
            "top-4 bottom-4 ml-4 rounded-xl",
            isCollapsed ? "w-20" : "w-64"
        )}>
           <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center justify-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Home className="h-6 w-6" />
                        <span className={cn(isCollapsed && "hidden")}>Home</span>
                    </Link>
                </div>
                <div className={cn("flex-1 overflow-auto py-2", isCollapsed && "flex flex-col items-center")}>
                     <Button variant="ghost" size="icon" onClick={toggleSidebar} className="absolute -right-4 top-1/2 -translate-y-1/2 bg-background hover:bg-muted border rounded-full h-8 w-8 z-50">
                        {isCollapsed ? <PanelRight /> : <PanelLeftClose />}
                    </Button>
                    <NavContent isCollapsed={isCollapsed} userProfile={userProfile} />
                </div>
            </div>
      </aside>

      <div className={cn("flex flex-col transition-all duration-300 ease-in-out", isCollapsed ? "sm:pl-28" : "sm:pl-72")}>
        <header className="flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
          <div className="flex-1">
             {/* Can add breadcrumbs or page title here */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full"
              >
                <Image
                  src={userProfile?.photoURL || `https://i.pravatar.cc/36?u=${user.uid}`}
                  width={36}
                  height={36}
                  alt="Avatar"
                  className="overflow-hidden rounded-full object-cover"
                />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
        </header>
        {userProfile && (
            <div className="bg-muted/60 border-b border-muted">
                <div className="px-4 sm:px-6 py-2">
                    <p className="text-sm font-medium text-muted-foreground">
                        Welcome, <span className="font-semibold text-foreground">{userProfile.displayName}</span>
                        <span className="mx-2">|</span>
                        <span className="capitalize">{userProfile.roles.join(', ').replace(/-/g, ' ')}</span>
                    </p>
                </div>
            </div>
        )}
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 mt-4">
            <PendingProfileModal isOpen={isProfilePending} />
            {isProfilePending ? null : children}
        </main>
      </div>
    </div>
  );
}

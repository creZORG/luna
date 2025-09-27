
'use client';

import Link from 'next/link';
import { Home, ShoppingCart, BarChart2, PanelLeft, LogOut, Loader, Image as ImageIcon, Briefcase, Factory, Target, Activity, Settings, Store, ShieldAlert, ClipboardCheck, ChevronDown, UserCog, PanelRight, PanelLeftClose, PanelRightClose } from 'lucide-react';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';


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
            Your profile has been created, but an administrator has not assigned any roles to you yet. Please contact your administrator to gain access.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

const navLinks = [
    { href: "/admin/dashboard", icon: BarChart2, label: "Dashboard", tooltip: "Dashboard" },
    { href: "/admin/products", icon: ShoppingCart, label: "Product Pricing", tooltip: "Product Pricing" },
    { href: "/admin/media", icon: ImageIcon, label: "Media", tooltip: "Media" },
    { href: "/admin/store-items", icon: Store, label: "Store Items", tooltip: "Store Items" },
    { type: 'collapsible', 
      trigger: { icon: ClipboardCheck, label: "Attendance", tooltip: "Attendance" },
      content: [
        { href: "/admin/attendance/check-in", label: "Check-in" },
        { href: "/admin/attendance/overview", label: "Daily Overview" },
      ]
    },
    { separator: true },
    { href: "/finance", icon: Briefcase, label: "Finance", tooltip: "Finance" },
    { href: "/manufacturing", icon: Factory, label: "Manufacturing", tooltip: "Manufacturing" },
    { href: "/sales", icon: Target, label: "Sales", tooltip: "Sales" },
    { href: "/operations", icon: Activity, label: "Operations", tooltip: "Operations" },
    { href: "/digital-marketing", icon: Briefcase, label: "Marketing", tooltip: "Marketing" },
];


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading, isProfilePending } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(pathname.includes('/admin/attendance'));
  const [isCollapsed, setIsCollapsed] = useState(true);

   useEffect(() => {
    const isAttendancePath = pathname.includes('/admin/attendance');
    if (isAttendancePath) {
      setIsAttendanceOpen(true);
    }
  }, [pathname]);

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

  if (isProfilePending) {
    return <PendingProfileModal isOpen={true} />
  }
  
  if (!userProfile?.roles?.includes('admin')) {
    router.push('/access-denied');
    return null;
  }

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  const NavContent = ({ isCollapsed }: { isCollapsed: boolean }) => (
     <TooltipProvider>
        <nav className="flex flex-col gap-2 px-2 py-4">
            {navLinks.map((link, index) => {
                 if (link.separator) {
                    return <Separator key={index} className="my-2" />;
                 }
                 if (link.type === 'collapsible') {
                    return (
                        <Collapsible key={index} open={isAttendanceOpen} onOpenChange={setIsAttendanceOpen} className="flex flex-col items-center gap-1">
                          <CollapsibleTrigger asChild>
                              <Tooltip>
                                  <TooltipTrigger asChild>
                                        <div className={cn("w-full", !isCollapsed && "px-3")}>
                                            <Button variant={pathname.includes('/admin/attendance') ? 'secondary' : 'ghost'} size={isCollapsed ? "icon" : "default"} className={cn("w-full flex gap-3", isCollapsed ? "justify-center" : "justify-start")}>
                                                <link.trigger.icon className="h-5 w-5" />
                                                {!isCollapsed && <span>{link.trigger.label}</span>}
                                                <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", isAttendanceOpen && "rotate-180", isCollapsed && "hidden")}/>
                                            </Button>
                                        </div>
                                  </TooltipTrigger>
                                  {isCollapsed && <TooltipContent side="right">{link.trigger.tooltip}</TooltipContent>}
                              </Tooltip>
                          </CollapsibleTrigger>
                          <CollapsibleContent asChild className={cn(isCollapsed && "hidden")}>
                              <div className="flex flex-col gap-2 mt-1 w-full px-8">
                                  {link.content.map(subLink => (
                                    <Link key={subLink.href} href={subLink.href} className={cn("rounded-md px-3 py-2 text-sm hover:bg-muted", pathname === subLink.href ? "bg-muted font-semibold text-primary" : "text-muted-foreground")}>
                                        {subLink.label}
                                    </Link>
                                  ))}
                              </div>
                          </CollapsibleContent>
                        </Collapsible>
                    )
                 }
                return (
                    <Tooltip key={link.href}>
                        <TooltipTrigger asChild>
                             <Link href={link.href!} 
                                 className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                    pathname === link.href && "text-primary bg-muted",
                                    isCollapsed && "justify-center"
                                )}>
                                <link.icon className="h-5 w-5" />
                                {!isCollapsed && <span>{link.label}</span>}
                            </Link>
                        </TooltipTrigger>
                         {isCollapsed && <TooltipContent side="right">{link.tooltip}</TooltipContent>}
                    </Tooltip>
                )
            })}
        </nav>
    </TooltipProvider>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <aside className={cn(
                "fixed top-4 left-4 z-10 hidden flex-col sm:flex transition-all duration-300 backdrop-blur-sm bg-background/80 rounded-xl shadow-lg border",
                "h-[calc(100vh-2rem)]",
                isCollapsed ? "w-16" : "w-60"
            )}>
            <div className="flex flex-col items-center gap-4 px-2 py-4 border-b">
                 <Link
                    href="/"
                    className={cn(
                        "flex items-center gap-3 rounded-lg text-muted-foreground transition-all hover:text-primary justify-center h-8 w-8"
                    )}
                >
                    <Home className="h-5 w-5" />
                    <span className="sr-only">Home</span>
                </Link>
                 <Button variant="ghost" size="icon" className='h-8 w-8' onClick={() => setIsCollapsed(!isCollapsed)}>
                    {isCollapsed ? <PanelRightClose /> : <PanelLeftClose />}
                </Button>
            </div>
            <div className='flex-grow overflow-y-auto'>
                <NavContent isCollapsed={isCollapsed} />
            </div>
        </aside>

      <div className={cn("flex flex-col sm:gap-4 sm:py-4 transition-all", isCollapsed ? "sm:pl-24" : "sm:pl-[17rem]")}>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs" >
              <NavContent isCollapsed={false} />
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

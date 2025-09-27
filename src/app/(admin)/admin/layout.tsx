
'use client';

import Link from 'next/link';
import { Home, ShoppingCart, BarChart2, PanelLeft, LogOut, Loader, Image as ImageIcon, Briefcase, Factory, Target, Activity, Settings, Store, ShieldAlert, ClipboardCheck, ChevronDown } from 'lucide-react';
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
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(pathname.includes('/admin/attendance'));


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
  
  if (!userProfile?.roles?.includes('admin')) {
    router.push('/access-denied');
    return null;
  }

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  const navLinks = [
    { href: "/admin/dashboard", icon: BarChart2, label: "Dashboard" },
    { href: "/admin/products", icon: ShoppingCart, label: "Product Pricing" },
    { href: "/admin/media", icon: ImageIcon, label: "Media" },
    { href: "/admin/store-items", icon: Store, label: "Store Items" },
    { type: 'collapsible', 
      trigger: { icon: ClipboardCheck, label: "Attendance" },
      content: [
        { href: "/admin/attendance/check-in", label: "Check-in" },
        { href: "/admin/attendance/overview", label: "Daily Overview" },
      ]
    },
    { separator: true },
    { href: "/finance", icon: Briefcase, label: "Finance" },
    { href: "/manufacturing", icon: Factory, label: "Manufacturing" },
    { href: "/sales", icon: Target, label: "Sales" },
    { href: "/operations", icon: Activity, label: "Operations" },
    { href: "/digital-marketing", icon: Briefcase, label: "Marketing" },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Home className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Home</span>
          </Link>
          {navLinks.map((link, index) => {
            if (link.separator) {
              return <DropdownMenuSeparator key={index} className="my-2" />;
            }
            if (link.type === 'collapsible') {
               return (
                <Collapsible key={index} open={isAttendanceOpen} onOpenChange={setIsAttendanceOpen} className="flex flex-col items-center gap-1">
                  <CollapsibleTrigger asChild>
                     <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9">
                        <link.trigger.icon className="h-5 w-5" />
                        <span className="sr-only">{link.trigger.label}</span>
                     </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                      <div className="flex flex-col items-center gap-2 mt-1">
                          {link.content.map(subLink => (
                            <Link key={subLink.href} href={subLink.href} className="text-muted-foreground text-xs hover:text-foreground">
                                {subLink.label}
                            </Link>
                          ))}
                      </div>
                  </CollapsibleContent>
                </Collapsible>
               )
            }
            return (
              <Link key={link.href} href={link.href!} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                  <link.icon className="h-5 w-5" />
                  <span className="sr-only">{link.label}</span>
              </Link>
            )
          })}
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
                href="/"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              >
                <Home className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">Home</span>
              </Link>
              {navLinks.map((link, index) => {
                 if (link.separator) {
                    return <DropdownMenuSeparator key={index} />;
                 }
                 if (link.type === 'collapsible') {
                    return (
                        <Collapsible key={index} className="grid gap-2">
                            <CollapsibleTrigger className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                                <link.trigger.icon className="h-5 w-5" />
                                {link.trigger.label}
                                <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", isAttendanceOpen && "rotate-180")}/>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="grid gap-4 pl-11">
                                {link.content.map(subLink => (
                                    <Link key={subLink.href} href={subLink.href} className={cn("text-muted-foreground hover:text-foreground", pathname === subLink.href && "text-foreground font-semibold")}>
                                        {subLink.label}
                                    </Link>
                                ))}
                            </CollapsibleContent>
                        </Collapsible>
                    )
                 }
                 return (
                    <Link key={link.href} href={link.href!} className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                    <link.icon className="h-5 w-5" />
                    {link.label}
                    </Link>
                 )
                })}
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

"use client";

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Menu, Moon, ShoppingCart, Sun, Home, Mail, Package } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { ThemeToggle } from '../theme-toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/products', label: 'Products', icon: Package },
  { href: '#contact', label: 'Contact', icon: Mail },
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled ? 'bg-background/80 backdrop-blur-sm shadow-md' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Moon className="h-7 w-7 text-primary" />
          <span className="font-headline text-2xl font-bold text-foreground">
            LUNA
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
           <TooltipProvider>
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <Button asChild variant="ghost" size="icon" className={cn(pathname === href ? 'text-primary' : 'text-foreground/80', "hover:text-primary")}>
                    <Link href={href}>
                      <Icon className="h-5 w-5" />
                      <span className="sr-only">{label}</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>

        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Shopping Cart</span>
            </Button>
            <ThemeToggle />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-background/90 backdrop-blur-lg">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 p-4 border-b">
                   <Moon className="h-7 w-7 text-primary" />
                    <span className="font-headline text-2xl font-bold text-foreground">
                        LUNA
                    </span>
                </div>
                <nav className="flex flex-col gap-4 p-4">
                  {navLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'text-lg font-medium transition-colors hover:text-primary flex items-center gap-4',
                        pathname === href ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

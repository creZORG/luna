

"use client";

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Menu, Moon, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { ThemeToggle } from '../theme-toggle';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Catalog' },
  { href: '/#wholesale', label: 'Wholesale' },
  { href: '/partners', label: 'Partners' },
  { href: '#contact', label: 'Contact' },
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { cartItems, setIsCartOpen } = useCart();
  const { user, userProfile } = useAuth();

  const totalQuantity = React.useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);


  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isPortalPage = userProfile && userProfile.roles.length > 0;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled ? 'py-2' : 'py-4'
      )}
    >
      <div className="container mx-auto px-4">
        <div className={cn(
            'flex h-16 items-center justify-between transition-all duration-300 long-pill',
            isScrolled ? 'bg-background/80 backdrop-blur-sm shadow-md' : 'bg-background/50'
          )}>

          <Link href="/" className="flex items-center gap-2">
            <Moon className="h-7 w-7 text-primary" />
            <span className="font-headline text-2xl font-bold text-foreground">
              LUNA
            </span>
          </Link>

          <div className="flex items-center gap-1">
              { !isPortalPage && <nav className="hidden md:flex items-center gap-1">
                  {navLinks.map(({ href, label }) => (
                      <Button asChild variant="ghost" key={href} className={cn(
                          'text-sm font-medium rounded-full',
                          pathname === href ? 'text-primary' : 'text-foreground/80',
                          'hover:text-primary'
                      )}>
                          <Link href={href}>{label}</Link>
                      </Button>
                  ))}
              </nav>}
              
              <ThemeToggle />
              
               <Button variant="ghost" size="icon" className="relative rounded-full" onClick={() => setIsCartOpen(true)}>
                <ShoppingCart className="h-5 w-5" />
                {totalQuantity > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {totalQuantity}
                  </span>
                )}
                <span className="sr-only">Open Cart</span>
              </Button>
              
              {user ? (
                 <Button variant="outline" className="hidden md:flex rounded-full" asChild>
                    <Link href="/profile">
                    <User className="mr-2 h-4 w-4"/> My Account
                    </Link>
                </Button>
              ) : (
                <Button variant="outline" className="hidden md:flex rounded-full" asChild>
                    <Link href="/login">
                    <User className="mr-2 h-4 w-4"/> Login
                    </Link>
                </Button>
              )}


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
                    {navLinks.map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'text-lg font-medium transition-colors hover:text-primary flex items-center gap-4',
                          pathname === href ? 'text-primary' : 'text-foreground'
                        )}
                      >
                        {label}
                      </Link>
                    ))}
                  </nav>
                   <div className="mt-auto p-4 border-t">
                     <Button className="w-full" asChild>
                       <Link href="/login">
                          <User className="mr-2 h-4 w-4"/> Customer Login
                        </Link>
                     </Button>
                   </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

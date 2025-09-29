
'use client';

import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { useMemo, useState, useEffect } from 'react';
import {
  AlertCircle,
  Home,
  Loader,
  LogIn,
  MapPin,
  Truck,
  Warehouse,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from "@/components/ui/label";
import { productService } from '@/services/product.service';
import { Product } from '@/lib/data';
import { reverseGeocode } from '@/ai/flows/reverse-geocode-flow';

const deliveryFormSchema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^(\+254|0)?\d{9}$/, 'Invalid Kenyan phone number format'),
  constituency: z.string().min(1, 'Please select a constituency'),
  address: z.string().min(10, 'Please provide a detailed address, including building and house number.'),
  deliveryNotes: z.string().optional(),
});

type DeliveryFormData = z.infer<typeof deliveryFormSchema>;

const NAIROBI_CONSTITUENCIES = [
  'Westlands',
  'Dagoretti North',
  'Dagoretti South',
  'Langata',
  'Kibra',
  'Roysambu',
  'Kasarani',
  'Ruaraka',
  'Embakasi South',
  'Embakasi North',
  'Embakasi Central',
  'Embakasi East',
  'Embakasi West',
  'Makadara',
  'Kamukunji',
  'Starehe',
  'Mathare',
];

const NAIROBI_BOUNDS = {
  minLat: -1.38,
  maxLat: -1.18,
  minLng: 36.7,
  maxLng: 37.0,
};

function isWithinNairobi(coords: GeolocationCoordinates) {
  return (
    coords.latitude >= NAIROBI_BOUNDS.minLat &&
    coords.latitude <= NAIROBI_BOUNDS.maxLat &&
    coords.longitude >= NAIROBI_BOUNDS.minLng &&
    coords.longitude <= NAIROBI_BOUNDS.maxLng
  );
}

function OrderSummary() {
  const { cartItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
        if (cartItems.length > 0) {
            const fetchedProducts = await Promise.all(
                cartItems.map(item => productService.getProductById(item.productId))
            );
            setProducts(fetchedProducts.filter(p => p !== null) as Product[]);
        }
    }
    fetchProducts();
  }, [cartItems]);
  

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  const totalDeliveryFee = useMemo(() => {
      // Use a Set to only count delivery fee once per unique product
      const uniqueProductIds = new Set(cartItems.map(item => item.productId));
      return Array.from(uniqueProductIds).reduce((acc, productId) => {
          const product = products.find(p => p.id === productId);
          return acc + (product?.deliveryFee || 0);
      }, 0);
  }, [cartItems, products]);

  const totalPlatformFee = useMemo(() => {
       // Use a Set to only count platform fee once per unique product
      const uniqueProductIds = new Set(cartItems.map(item => item.productId));
      return Array.from(uniqueProductIds).reduce((acc, productId) => {
          const product = products.find(p => p.id === productId);
          return acc + (product?.platformFee || 0);
      }, 0);
  }, [cartItems, products]);

  const total = subtotal + totalDeliveryFee + totalPlatformFee;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={`${item.productId}-${item.size}`}
              className="flex items-center gap-4"
            >
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                <Image
                  src={item.imageUrl || '/placeholder.svg'}
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
                 <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {item.quantity}
                  </span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{item.productName}</h4>
                <p className="text-xs text-muted-foreground">{item.size}</p>
              </div>
              <p className="font-semibold text-sm">
                Ksh {(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>Ksh {subtotal.toFixed(2)}</span>
            </div>
             <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>Ksh {totalDeliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee</span>
              <span>Ksh {totalPlatformFee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>Ksh {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CheckoutClient() {
  const { user, userProfile } = useAuth();
  const [locationState, setLocationState] = useState<
    'idle' | 'loading' | 'in_nairobi' | 'outside_nairobi' | 'error'
  >('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [identifiedLocation, setIdentifiedLocation] = useState<string | null>(null);

  const form = useForm<DeliveryFormData>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      fullName: userProfile?.displayName || '',
      email: userProfile?.email || '',
      phone: '',
      address: '',
      deliveryNotes: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        fullName: userProfile.displayName,
        email: userProfile.email,
        phone: '', // Phone is not in profile
        address: '', // Address is not in profile
        deliveryNotes: '',
      });
    }
  }, [userProfile, form]);

 const handleCheckLocation = () => {
    setLocationState('loading');
    setIdentifiedLocation(null);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (isWithinNairobi(position.coords)) {
          setLocationState('in_nairobi');
        } else {
          try {
            const geocodeResult = await reverseGeocode({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setIdentifiedLocation(geocodeResult.city);
            setLocationState('outside_nairobi');
          } catch (e) {
            console.error("Reverse geocode failed:", e);
            // Fallback to generic message if AI call fails
            setLocationState('outside_nairobi');
          }
        }
      },
      (err) => {
        setLocationState('error');
        let message = 'Could not get your location. Please enable location services in your browser.';
        if (err.code === err.PERMISSION_DENIED) {
          message = "Location access was denied. You can still enter your address manually.";
        }
        setLocationError(message);
      }
    );
  };
  
  const onSubmit = (data: DeliveryFormData) => {
      console.log('Submitting delivery data:', data);
      // TODO: Integrate with payment flow
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
            <CardDescription>
              Where should we send your order?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!user && (
              <Alert>
                <LogIn className="h-4 w-4" />
                <AlertTitle>You are checking out as a guest</AlertTitle>
                <AlertDescription>
                  <Link href="/login" className="font-bold underline">
                    Log in
                  </Link>{' '}
                  or create an account to save your details for faster checkout
                  next time and to track your order.
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <RadioGroup defaultValue="door-to-door" className="grid grid-cols-2 gap-4">
                    <div>
                        <RadioGroupItem value="door-to-door" id="door-to-door" className="peer sr-only" />
                        <Label
                        htmlFor="door-to-door"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                        <Truck className="mb-3 h-6 w-6" />
                        Door Delivery
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="pickup" id="pickup" className="peer sr-only" disabled />
                         <Label
                            htmlFor="pickup"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-data-[state=disabled]:cursor-not-allowed peer-data-[state=disabled]:opacity-50"
                            >
                            <Warehouse className="mb-3 h-6 w-6" />
                            Pickup Station
                        </Label>
                    </div>
                 </RadioGroup>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="0712345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                <Separator className="my-6" />
                 <h3 className="text-lg font-medium">Delivery Address</h3>
                 <p className="text-sm text-muted-foreground">We currently only deliver within Nairobi.</p>
                 
                <div className="space-y-4 animate-in fade-in-0 duration-500">
                    <Alert className='flex items-center justify-between'>
                      <div>
                          <AlertTitle>Confirm Nairobi Delivery</AlertTitle>
                          <AlertDescription>
                              Use your location to quickly confirm you're in our delivery zone.
                          </AlertDescription>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCheckLocation}
                        disabled={locationState === 'loading'}
                      >
                        {locationState === 'loading' ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />} 
                        Check Location
                      </Button>
                    </Alert>

                     {locationState === 'outside_nairobi' && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Outside Nairobi Delivery Area</AlertTitle>
                            <AlertDescription>
                                {identifiedLocation 
                                    ? `It looks like you're in ${identifiedLocation}, which is outside our standard delivery zone.`
                                    : "It looks like you're outside our standard delivery zone."
                                }
                                {' '}For special arrangements, please contact our support team.
                            </AlertDescription>
                        </Alert>
                     )}
                     {locationState === 'error' && (
                         <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Location Error</AlertTitle>
                            <AlertDescription>{locationError}</AlertDescription>
                        </Alert>
                     )}
                     {locationState === 'in_nairobi' && <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <Home className="h-4 w-4 !text-green-600" />
                        <AlertTitle className="text-green-800 dark:text-green-300">You're in Nairobi!</AlertTitle>
                         <AlertDescription className="text-green-700 dark:text-green-400">
                            Great! We deliver to your area. Please fill out the address details below.
                        </AlertDescription>
                    </Alert>}
                    
                     <FormField
                        control={form.control}
                        name="constituency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Constituency</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your constituency" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {NAIROBI_CONSTITUENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Street Address, Building & House No.</FormLabel>
                            <FormControl>
                                <Textarea placeholder="e.g., Maple Street, Crystal Apartments, Apt B4" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="deliveryNotes"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Delivery Notes (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="e.g., Leave at the reception with the security guard" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>


                <Button type="submit" size="lg" className="w-full" disabled={!form.formState.isValid || form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    Proceed to Payment
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:sticky lg:top-24">
        <OrderSummary />
      </div>
    </>
  );
}

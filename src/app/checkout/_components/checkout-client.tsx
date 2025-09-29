
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
import { Label } from "@/components/ui/label";
import { productService } from '@/services/product.service';
import { Product } from '@/lib/data';
import { reverseGeocode } from '@/ai/flows/reverse-geocode-flow';
import { getCompanySettings } from '@/lib/config';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { verifyPaymentAndProcessOrder } from '@/ai/flows/verify-payment-and-process-order-flow';
import PaystackPop from '@paystack/inline-js';
import { orderService } from '@/services/order.service';


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

// Haversine formula to calculate distance between two lat/lon points
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
}

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
            const productIds = Array.from(new Set(cartItems.map(item => item.productId)));
            const fetchedProducts = await Promise.all(
                productIds.map(id => productService.getProductById(id))
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
      const uniqueProductIds = new Set(cartItems.map(item => item.productId));
      return Array.from(uniqueProductIds).reduce((acc, productId) => {
          const product = products.find(p => p.id === productId);
          return acc + (product?.deliveryFee || 0);
      }, 0);
  }, [cartItems, products]);

  const totalPlatformFee = useMemo(() => {
      const uniqueProductIds = new Set(cartItems.map(item => item.productId));
      return Array.from(uniqueProductIds).reduce((acc, productId) => {
          const product = products.find(p => p.id === productId);
          return acc + (product?.platformFee || 0);
      }, 0);
  }, [cartItems, products]);

  const total = subtotal + totalDeliveryFee + totalPlatformFee;

  if (cartItems.length === 0) return null;

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
  const { cartItems, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const [locationState, setLocationState] = useState<
    'idle' | 'loading' | 'in_nairobi' | 'outside_nairobi' | 'error'
  >('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [identifiedLocation, setIdentifiedLocation] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);


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
  
  // Effect to pre-fill form with last order details
  useEffect(() => {
    async function prefillForm() {
        if (user) {
            const lastOrder = await orderService.getLastOrderByUserId(user.uid);
            if (lastOrder) {
                const [address, constituency] = lastOrder.shippingAddress.split(',').map(s => s.trim());
                form.reset({
                    fullName: lastOrder.customerName,
                    email: lastOrder.customerEmail,
                    phone: lastOrder.customerPhone,
                    address: address || '',
                    constituency: NAIROBI_CONSTITUENCIES.includes(constituency) ? constituency : '',
                    deliveryNotes: '', // Don't pre-fill notes
                });
            } else if (userProfile) {
                 // If no last order, use profile info
                 form.reset({
                    fullName: userProfile.displayName,
                    email: userProfile.email || '',
                    phone: '',
                    address: '',
                    constituency: '',
                    deliveryNotes: '',
                });
            }
        }
    }
    prefillForm();
  }, [user, userProfile, form]);


 const handleCheckLocation = () => {
    setLocationState('loading');
    setIdentifiedLocation(null);
    setLocationError(null);
    setDistance(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const settings = await getCompanySettings();
        const dist = getDistance(
            position.coords.latitude, 
            position.coords.longitude,
            settings.COMPANY_LOCATION.latitude,
            settings.COMPANY_LOCATION.longitude
        );
        setDistance(dist);

        if (isWithinNairobi(position.coords)) {
          setLocationState('in_nairobi');
        } else {
          try {
            const geocodeResult = await reverseGeocode({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            if (geocodeResult && geocodeResult.city) {
              setIdentifiedLocation(geocodeResult.city);
            } else {
              setIdentifiedLocation(null);
            }
            setLocationState('outside_nairobi');
          } catch (e) {
            console.error("Reverse geocode failed:", e);
            setLocationError("Could not determine your city from your coordinates. Please enter your address manually.");
            setLocationState('error');
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
  
  const handlePaymentAndOrderProcessing = async (data: DeliveryFormData) => {
    setIsProcessingOrder(true);
    const products = await Promise.all(
        Array.from(new Set(cartItems.map(item => item.productId))).map(id => productService.getProductById(id))
    );
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalDeliveryFee = Array.from(new Set(cartItems.map(item => item.productId))).reduce((acc, productId) => {
        const product = products.find(p => p && p.id === productId);
        return acc + (product?.deliveryFee || 0);
    }, 0);
    const totalPlatformFee = Array.from(new Set(cartItems.map(item => item.productId))).reduce((acc, productId) => {
        const product = products.find(p => p && p.id === productId);
        return acc + (product?.platformFee || 0);
    }, 0);
    
    const totalAmount = subtotal + totalDeliveryFee + totalPlatformFee;

    const paystack = new PaystackPop();
    paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: data.email,
        amount: totalAmount * 100, // Amount in kobo
        onSuccess: async (transaction) => {
            try {
                const orderId = await verifyPaymentAndProcessOrder({
                    reference: transaction.reference,
                    cartItems: cartItems,
                    customer: data,
                    userId: user?.uid, // Pass user ID if they are logged in
                });

                toast({
                    title: "Payment Successful & Order Placed!",
                    description: `Your order #${orderId.substring(0,6).toUpperCase()} is being processed.`,
                });
                
                clearCart();
                router.push(`/order/success?orderId=${orderId}`);

            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: "Order Processing Failed",
                    description: error.message || "There was an error verifying your payment and creating the order. Please contact support.",
                });
                setIsProcessingOrder(false);
            }
        },
        onCancel: () => {
            toast({
                variant: 'destructive',
                title: "Payment Cancelled",
                description: "You have cancelled the payment process.",
            });
            setIsProcessingOrder(false);
        },
    });
  }
  
  const distanceInKm = distance ? (distance / 1000).toFixed(0) : 0;
  const isSubmitting = form.formState.isSubmitting || isProcessingOrder;

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
              <form onSubmit={form.handleSubmit(handlePaymentAndOrderProcessing)} className="space-y-4">
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
                                    ? `It looks like you're in ${identifiedLocation} (approx. ${distanceInKm}km away), which is outside our standard delivery zone.`
                                    : `It looks like you're outside our standard delivery zone (approx. ${distanceInKm}km away).`
                                }
                                {' '}For special arrangements, please contact our support team.
                            </AlertDescription>
                        </Alert>
                     )}
                     {locationState === 'error' && (
                         <Alert variant="destructive">
                            <AlertTitle>Location Error</AlertTitle>
                            <AlertDescription>{locationError}</AlertDescription>
                        </Alert>
                     )}
                     {locationState === 'in_nairobi' && <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <Home className="h-4 w-4 !text-green-600" />
                        <AlertTitle className="text-green-800 dark:text-green-300">You're in Nairobi!</AlertTitle>
                         <AlertDescription className="text-green-700 dark:text-green-400">
                            Great! We deliver to your area (approx. {distanceInKm}km from our office). Please fill out the address details below.
                        </AlertDescription>
                    </Alert>}
                    
                     <FormField
                        control={form.control}
                        name="constituency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Constituency</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
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

                <Button type="submit" size="lg" className="w-full" disabled={!form.formState.isValid || isSubmitting || cartItems.length === 0}>
                    {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
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



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
  FormDescription,
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
import { getProductById } from '@/services/product.service';
import { Product } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { verifyPaymentAndProcessOrder } from '@/ai/flows/verify-payment-and-process-order-flow';
import { getLastOrderByUserId } from '@/services/order.service';
import { pickupLocationService, PickupLocation } from '@/services/pickup-location.service';
import { KENYAN_COUNTIES, getDeliveryZone } from '@/lib/locations';
import { settingsService, DeliveryZoneFees } from '@/services/settings.service';
import { campaignService } from '@/services/campaign.service';


const deliveryFormSchema = z.object({
  deliveryMethod: z.enum(['door-to-door', 'pickup']),
  fullName: z.string().min(3, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^(\+254|0)?\d{9}$/, 'Invalid Kenyan phone number format'),
  county: z.string().optional(),
  address: z.string().optional(),
  pickupLocationId: z.string().optional(),
  deliveryNotes: z.string().optional(),
  promoCode: z.string().optional(),
}).refine(data => {
    if (data.deliveryMethod === 'door-to-door') {
        return !!data.county && !!data.address && data.address.length >= 10;
    }
    return true;
}, {
    message: 'County and a detailed address are required for door delivery.',
    path: ['address'],
}).refine(data => {
    if (data.deliveryMethod === 'pickup') {
        return !!data.pickupLocationId;
    }
    return true;
}, {
    message: 'Please select a pickup location.',
    path: ['pickupLocationId'],
});


type DeliveryFormData = z.infer<typeof deliveryFormSchema>;


function OrderSummary({ deliveryMethod, county } : { deliveryMethod: 'door-to-door' | 'pickup', county?: string }) {
  const { cartItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryFees, setDeliveryFees] = useState<DeliveryZoneFees | null>(null);

  useEffect(() => {
    async function fetchProductsAndFees() {
        if (cartItems.length > 0) {
            const productIds = Array.from(new Set(cartItems.map(item => item.productId)));
            const fetchedProducts = await Promise.all(
                productIds.map(id => getProductById(id))
            );
            setProducts(fetchedProducts.filter(p => p !== null) as Product[]);
        }
        const settings = await settingsService.getCompanySettings();
        if (settings) {
            setDeliveryFees(settings.deliveryFees);
        }
    }
    fetchProductsAndFees();
  }, [cartItems]);
  

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);
  
  const totalPlatformFee = useMemo(() => {
      const uniqueProductIds = new Set(cartItems.map(item => item.productId));
      return Array.from(uniqueProductIds).reduce((acc, productId) => {
          const product = products.find(p => p.id === productId);
          return acc + (product?.platformFee || 0);
      }, 0);
  }, [cartItems, products]);

  const deliveryFee = useMemo(() => {
    if (deliveryMethod === 'pickup' || !county || !deliveryFees) {
        return 0;
    }
    const zone = getDeliveryZone(county);
    return deliveryFees[zone];
  }, [deliveryMethod, county, deliveryFees]);


  const total = subtotal + deliveryFee + totalPlatformFee;

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
              <span>Ksh {deliveryFee.toFixed(2)}</span>
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

  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [deliveryFees, setDeliveryFees] = useState<DeliveryZoneFees | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);


  const form = useForm<DeliveryFormData>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      deliveryMethod: 'door-to-door',
      fullName: userProfile?.displayName || '',
      email: userProfile?.email || '',
      phone: '',
      address: '',
      deliveryNotes: '',
      promoCode: '',
    },
  });
  
  const deliveryMethod = form.watch('deliveryMethod');
  const selectedCounty = form.watch('county');
  const appliedPromoCode = form.watch('promoCode');

  // Effect to pre-fill form with last order details & fetch pickup locations
  useEffect(() => {
    async function prefillForm() {
        if (user) {
            const lastOrder = await getLastOrderByUserId(user.uid);
            if (lastOrder) {
                form.reset({
                    deliveryMethod: lastOrder.deliveryMethod || 'door-to-door',
                    fullName: lastOrder.customerName,
                    email: lastOrder.customerEmail,
                    phone: lastOrder.customerPhone,
                    address: lastOrder.shippingAddress || '',
                    county: lastOrder.county || (KENYAN_COUNTIES.includes(lastOrder.shippingAddress.split(',').pop()?.trim() || '') ? lastOrder.shippingAddress.split(',').pop()?.trim() : ''),
                    deliveryNotes: '', // Don't pre-fill notes
                    promoCode: '',
                });
            } else if (userProfile) {
                 // If no last order, use profile info
                 form.reset({
                    deliveryMethod: 'door-to-door',
                    fullName: userProfile.displayName,
                    email: userProfile.email || '',
                    phone: '',
                    address: '',
                    county: '',
                    deliveryNotes: '',
                    promoCode: '',
                });
            }
        }
    }
    
    async function fetchStaticData() {
        const locations = await pickupLocationService.getPickupLocations();
        setPickupLocations(locations);
        const settings = await settingsService.getCompanySettings();
        if (settings) {
            setDeliveryFees(settings.deliveryFees);
        }
    }

    prefillForm();
    fetchStaticData();
  }, [user, userProfile, form]);
  
    const handleApplyPromoCode = async () => {
        if (!promoCodeInput) return;
        setIsVerifyingCode(true);
        try {
            const isValid = await campaignService.validatePromoCode(promoCodeInput);
            if (isValid) {
                form.setValue('promoCode', promoCodeInput);
                toast({ title: "Promo Code Applied!", description: "Your promo code has been successfully applied." });
            } else {
                toast({ variant: 'destructive', title: "Invalid Promo Code", description: "The code you entered is not valid." });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "Could not verify the promo code." });
        } finally {
            setIsVerifyingCode(false);
        }
    };

  const handlePaymentAndOrderProcessing = async (data: DeliveryFormData) => {
    if (!deliveryFees) {
        toast({ variant: 'destructive', title: 'Error', description: 'Delivery fees are not configured. Please contact support.'});
        return;
    }
    setIsProcessingOrder(true);

    const PaystackPop = (await import('@paystack/inline-js')).default;

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const products = await Promise.all(
        Array.from(new Set(cartItems.map(item => item.productId))).map(id => getProductById(id))
    );
     const totalPlatformFee = Array.from(new Set(cartItems.map(item => item.productId))).reduce((acc, productId) => {
        const product = products.find(p => p && p.id === productId);
        return acc + (product?.platformFee || 0);
    }, 0);
    
    let finalTotal = subtotal + totalPlatformFee;
    if (data.deliveryMethod === 'door-to-door' && data.county) {
        const zone = getDeliveryZone(data.county);
        finalTotal += deliveryFees[zone];
    }
    
    const paystack = new PaystackPop();
    paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: data.email,
        amount: finalTotal * 100, // Amount in kobo
        metadata: {
            "send_receipt": false,
        },
        onSuccess: async (transaction) => {
            try {
                // Determine shipping address string
                let shippingAddress = '';
                if(data.deliveryMethod === 'pickup') {
                    const location = pickupLocations.find(l => l.id === data.pickupLocationId);
                    shippingAddress = `Pickup at: ${location?.name}, ${location?.address}`;
                } else {
                    shippingAddress = `${data.address}, ${data.county}`;
                }

                const orderId = await verifyPaymentAndProcessOrder({
                    reference: transaction.reference,
                    cartItems: cartItems,
                    customer: {
                        ...data,
                        address: shippingAddress // We send the combined address string
                    },
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
                 <FormField
                    control={form.control}
                    name="deliveryMethod"
                    render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel>Choose Delivery Method</FormLabel>
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-2 gap-4"
                            >
                                <FormItem>
                                    <FormControl>
                                        <RadioGroupItem value="door-to-door" id="door-to-door" className="peer sr-only" />
                                    </FormControl>
                                    <Label
                                        htmlFor="door-to-door"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                        <Truck className="mb-3 h-6 w-6" />
                                        Door Delivery
                                    </Label>
                                </FormItem>
                                <FormItem>
                                     <FormControl>
                                        <RadioGroupItem value="pickup" id="pickup" className="peer sr-only" />
                                    </FormControl>
                                    <Label
                                        htmlFor="pickup"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                        >
                                        <Warehouse className="mb-3 h-6 w-6" />
                                        Pickup Station
                                    </Label>
                                </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

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

                {deliveryMethod === 'door-to-door' && (
                    <div className="space-y-4 animate-in fade-in-0 duration-500">
                        <h3 className="text-lg font-medium">Delivery Address</h3>
                        <FormField
                            control={form.control}
                            name="county"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>County</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your county" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {KENYAN_COUNTIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
                    </div>
                )}
                
                {deliveryMethod === 'pickup' && (
                    <div className="space-y-4 animate-in fade-in-0 duration-500">
                        <h3 className="text-lg font-medium">Pickup Station</h3>
                        <FormField
                            control={form.control}
                            name="pickupLocationId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Choose a pickup location</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a station" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {pickupLocations.map(loc => <SelectItem key={loc.id} value={loc.id}>{loc.name} - {loc.address}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                     <FormDescription>Delivery fees are waived for pickup orders.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}
                 
                 <FormField
                    control={form.control}
                    name="deliveryNotes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Order Notes (Optional)</FormLabel>
                        <FormControl>
                            <Textarea placeholder="e.g., Gift wrap the items" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                
                <Separator className="my-6" />

                <div className="space-y-2">
                    <Label>Have a Promo Code?</Label>
                     {appliedPromoCode ? (
                         <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                            <AlertTitle className="text-green-800 dark:text-green-300">Code Applied: <span className="font-bold">{appliedPromoCode}</span></AlertTitle>
                        </Alert>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Enter code"
                                value={promoCodeInput}
                                onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                                disabled={isVerifyingCode}
                            />
                            <Button type="button" onClick={handleApplyPromoCode} disabled={isVerifyingCode || !promoCodeInput}>
                                {isVerifyingCode ? <Loader className="animate-spin" /> : 'Apply'}
                            </Button>
                        </div>
                    )}
                </div>


                <Button type="submit" size="lg" className="w-full !mt-8" disabled={!form.formState.isValid || isSubmitting || cartItems.length === 0}>
                    {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    Proceed to Payment
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:sticky lg:top-24">
        <OrderSummary deliveryMethod={deliveryMethod} county={selectedCounty} />
      </div>
    </>
  );
}


'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Handshake,
  Bike,
  Warehouse,
  Award,
  Loader,
  Send,
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { submitPartnerApplication } from '@/ai/flows/submit-partner-application-flow';

const partnerFormSchema = z.object({
  name: z.string().min(2, { message: 'Please enter your full name.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z
    .string()
    .min(10, { message: 'Please enter a valid phone number.' }),
  partnerType: z.enum(['influencer', 'delivery-partner', 'pickup-location'], {
    required_error: 'You need to select a partnership type.',
  }),
  message: z
    .string()
    .min(10, { message: 'Please tell us a bit about yourself.' })
    .max(500, { message: 'Your message is too long.' }),
});

type PartnerFormData = z.infer<typeof partnerFormSchema>;

export default function PartnersPage() {
  const { toast } = useToast();
  const form = useForm<PartnerFormData>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: PartnerFormData) {
    try {
        await submitPartnerApplication(data);
        toast({
            title: 'Application Submitted!',
            description: "Thank you for your interest. We've received your application and will be in touch shortly.",
        });
        form.reset();
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: 'There was an error submitting your application. Please try again.',
        });
    }
  }

  const partnerOpportunities = [
    {
      icon: Award,
      value: 'influencer',
      title: 'Brand Influencers',
      description:
        'Passionate about natural products? Join our influencer program to get exclusive promo codes, earn commissions, and share the products you love with your audience.',
    },
    {
      icon: Bike,
      value: 'delivery-partner',
      title: 'Delivery Partners',
      description:
        "Become a crucial part of our logistics network. We're looking for reliable and efficient delivery partners to help us get our products into the hands of customers across the region.",
    },
    {
      icon: Warehouse,
      value: 'pickup-location',
      title: 'Pickup Locations',
      description:
        'Have a convenient and accessible business location? Partner with us by becoming an official Luna Essentials pickup station and drive more foot traffic to your store.',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="relative h-[50vh] w-full flex items-center justify-center text-center text-white bg-primary">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 px-4">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Partner with Us
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto">
            Join the Luna Essentials family and grow with us. We're looking for
            passionate partners to help us expand our reach.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">
              Opportunities to Collaborate
            </h2>
            <p className="max-w-3xl mx-auto text-muted-foreground mt-4">
              Choose the partnership that best fits you and fill out the
              application form below. We're excited to hear from you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {partnerOpportunities.map((opp, index) => (
              <Card
                key={index}
                className="flex flex-col text-center items-center p-6"
              >
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <opp.icon className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl">
                  {opp.title}
                </CardTitle>
                <CardDescription className="mt-2 flex-grow">
                  {opp.description}
                </CardDescription>
              </Card>
            ))}
          </div>

          <Card id="application-form" className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Partnership Application Form</CardTitle>
              <CardDescription>
                Let's start this journey together. Fill out your details below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Jane Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" {...field} />
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
                            <Input placeholder="0712 345 678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="partnerType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Partnership Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a partnership type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {partnerOpportunities.map((opp) => (
                                <SelectItem key={opp.value} value={opp.value}>
                                  {opp.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tell Us About Yourself</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Why are you interested in partnering with us? Tell us about your business, audience, or experience."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Submit Application
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

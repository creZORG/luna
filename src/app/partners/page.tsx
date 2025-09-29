
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake, Bike, Warehouse, Award } from 'lucide-react';
import Link from 'next/link';

export default function PartnersPage() {
    const partnerOpportunities = [
        {
            icon: Award,
            title: "Brand Influencers",
            description: "Passionate about natural products? Join our influencer program to get exclusive promo codes, earn commissions, and share the products you love with your audience.",
            cta: "Become an Influencer",
            href: "/login"
        },
        {
            icon: Bike,
            title: "Delivery Partners",
            description: "Become a crucial part of our logistics network. We're looking for reliable and efficient delivery partners to help us get our products into the hands of customers across the region.",
            cta: "Join Our Fleet",
            href: "/login"
        },
        {
            icon: Warehouse,
            title: "Pickup Locations",
            description: "Have a convenient and accessible business location? Partner with us by becoming an official Luna Essentials pickup station and drive more foot traffic to your store.",
            cta: "Become a Host",
            href: "/login"
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
            Join the Luna Essentials family and grow with us. We're looking for passionate partners to help us expand our reach.
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
                    Whether you're an influencer, a logistics expert, or a local business owner, there's a place for you at Luna Essentials.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {partnerOpportunities.map((opp, index) => (
                    <Card key={index} className="flex flex-col text-center items-center">
                        <CardHeader className="items-center">
                            <div className="bg-primary/10 p-4 rounded-full mb-4">
                                <opp.icon className="w-10 h-10 text-primary" />
                            </div>
                            <CardTitle className="font-headline text-2xl">{opp.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-muted-foreground">{opp.description}</p>
                        </CardContent>
                        <CardContent className="w-full">
                            <Button asChild variant="secondary" className="w-full">
                                <Link href={opp.href}>{opp.cta}</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
}

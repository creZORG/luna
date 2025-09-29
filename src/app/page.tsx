
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Leaf, Recycle, Handshake, Bike, Warehouse } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { websiteImageService, WebsiteImage } from '@/services/website-images.service';

export const metadata: Metadata = {
  title: 'Luna Essentials | High-Quality, Sustainable Manufacturing',
  description: 'Your trusted partner in wholesale and retail for natural, vegan, and eco-friendly personal care products. Explore our catalog for opportunities.',
};

export default async function Home() {
  const websiteImages: WebsiteImage[] = await websiteImageService.getWebsiteImages();
  
  const getImage = (id: string) => websiteImages.find((img) => img.id === id);

  const heroImage = getImage('hero-background');
  const showerGelImage = getImage('category-shower-gel');
  const fabricSoftenerImage = getImage('category-fabric-softener');
  const dishWashImage = getImage('category-dish-wash');

  const pillars = [
    {
      icon: Leaf,
      title: '100% Natural Fragrances',
      description: "Infused with pure essential oils and nature's finest scents for an authentic and delightful experience.",
    },
    {
      icon: CheckCircle,
      title: 'Vegan & Free From',
      description: 'Our products are lovingly crafted to be vegan, paraben-free, and microplastic-free, ensuring gentle care for you and the planet.',
    },
    {
      icon: Recycle,
      title: 'Eco-Friendly Packaging',
      description: 'Committed to sustainability, many of our bottles are made from 30% recycled plastic.',
    },
  ];

  const categories = [
    {
      title: 'Shower Gels',
      description: 'Indulge in luxurious cleansing and captivating aromas.',
      image: showerGelImage,
      link: '/products?category=shower-gel',
    },
    {
      title: 'Fabric Softeners',
      description: 'Experience irresistible softness and lasting freshness for your clothes.',
      image: fabricSoftenerImage,
      link: '/products?category=fabric-softener',
    },
    {
      title: 'Dish Wash',
      description: 'Powerful cleaning that leaves dishes spotless and delightfully scented.',
      image: dishWashImage,
      link: '/products?category=dish-wash',
    },
  ];

  const partnerOpportunities = [
    {
        icon: Handshake,
        title: "Brand Influencers",
        description: "Join our program to get exclusive promo codes, earn commissions, and share products you love.",
    },
    {
        icon: Bike,
        title: "Delivery Partners",
        description: "Become a crucial part of our logistics network, helping us deliver products to customers efficiently.",
    },
    {
        icon: Warehouse,
        title: "Pickup Locations",
        description: "Become an official pickup station and drive more foot traffic to your existing business.",
    },
];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[90vh] w-full flex items-center justify-center text-center text-white">
        {heroImage?.imageUrl && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 px-4">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            The Essence of Nature, Bottled.
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto">
            Discover beautifully crafted, sustainable, and natural personal care products, available for your brand through our wholesale program.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
             <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-black">
                <Link href="/products">Explore Our Products</Link>
            </Button>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              <Link href="/#wholesale">Wholesale Inquiries</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Product Categories Section */}
      <section id="wholesale" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">
                Wholesale & Retail Opportunities
            </h2>
            <p className="max-w-3xl mx-auto text-muted-foreground mb-12">
                Stock your shelves with high-quality, sustainable products that your customers will love. We offer massive quantity discounts and reliable supply for our entire range. All our products are available for sale on our partner platform, <a href="https://tradinta.co.ke" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">Tradinta.co.ke</a>.
            </p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {categories.map((category) => (
                <Card key={category.title} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-card">
                    <CardHeader className="p-0">
                    {category.image?.imageUrl && (
                        <div className="aspect-w-3 aspect-h-2">
                        <Image
                            src={category.image.imageUrl}
                            alt={category.image.description}
                            width={600}
                            height={400}
                            className="object-cover w-full h-full"
                            data-ai-hint={category.image.imageHint}
                        />
                        </div>
                    )}
                    </CardHeader>
                    <CardContent className="p-6">
                    <CardTitle className="font-headline text-2xl">{category.title}</CardTitle>
                    <CardDescription className="mt-2 text-foreground/80">{category.description}</CardDescription>
                    </CardContent>
                    <CardFooter>
                    <Button asChild variant="secondary" className="w-full">
                        <Link href={category.link}>View Collection</Link>
                    </Button>
                    </CardFooter>
                </Card>
                ))}
            </div>
        </div>
      </section>

       {/* Why Choose Luna? Section */}
      <section className="py-16 md:py-24 bg-muted/40">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
            Our Commitment to Quality
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="text-center flex flex-col items-center">
                <div className="bg-primary/20 rounded-full p-4 mb-4">
                  <pillar.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-headline text-xl font-semibold mb-2">{pillar.title}</h3>
                <p className="text-muted-foreground max-w-xs">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner with us section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
           <div className="text-center mb-12">
                <h2 className="font-headline text-3xl md:text-4xl font-bold">
                    Join Our Growth
                </h2>
                <p className="max-w-3xl mx-auto text-muted-foreground mt-4">
                    We believe in the power of partnership. Whether you're an influencer, a logistics expert, or a local business, there's a place for you at Luna Essentials.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {partnerOpportunities.map((opp, index) => (
                    <Card key={index} className="flex flex-col text-center items-center p-6 bg-card">
                        <div className="bg-primary/10 p-4 rounded-full mb-4">
                            <opp.icon className="w-10 h-10 text-primary" />
                        </div>
                        <CardTitle className="font-headline text-xl mb-2">{opp.title}</CardTitle>
                        <CardDescription className="flex-grow text-foreground/80">{opp.description}</CardDescription>
                    </Card>
                ))}
            </div>
             <div className="text-center mt-12">
                <Button asChild size="lg">
                    <Link href="/partners">Learn More About Partnerships</Link>
                </Button>
            </div>
        </div>
      </section>

    </div>
  );
}

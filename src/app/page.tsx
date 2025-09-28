
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CheckCircle, Leaf, Recycle, Aperture, Briefcase, Boxes } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-background');
  const showerGelImage = PlaceHolderImages.find((img) => img.id === 'category-shower-gel');
  const fabricSoftenerImage = PlaceHolderImages.find((img) => img.id === 'category-fabric-softener');
  const dishWashImage = PlaceHolderImages.find((img) => img.id === 'category-dish-wash');

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

  const partnerFeatures = [
    {
      icon: Aperture,
      title: 'Seamless API Integration',
      description: 'Easily connect your systems to ours. When you update products on your end, they automatically update on our sales platform, Tradinta.co.ke.'
    },
    {
      icon: Briefcase,
      title: 'Expand Your Reach',
      description: 'Leverage our growing sales network to bring your products to a wider audience without the overhead of building your own distribution channels.'
    },
    {
      icon: Boxes,
      title: 'Focus on What You Do Best',
      description: 'Let us handle the logistics of online sales and distribution. You focus on creating amazing products, and we\'ll help you sell them.'
    }
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[90vh] w-full flex items-center justify-center text-center text-white">
        {heroImage && (
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
            Your Partner in Quality Manufacturing
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto">
            From wholesale opportunities to seamless API integration for fellow manufacturers, Luna is building the future of retail distribution.
          </p>
          <Button asChild size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Link href="#partners">Become a Partner</Link>
          </Button>
        </div>
      </section>
      
      {/* Wholesale & Retail Section */}
      <section id="wholesale" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">
                Wholesale & Retail Opportunities
            </h2>
            <p className="max-w-3xl mx-auto text-muted-foreground mb-12">
                Stock your shelves with high-quality, sustainable products that your customers will love. We offer massive quantity discounts and reliable supply for our entire range.
            </p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {categories.map((category) => (
                <Card key={category.title} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-card">
                    <CardHeader className="p-0">
                    {category.image && (
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
             <Button asChild size="lg" className="mt-12">
                <Link href="#contact">Enquire About Wholesale</Link>
            </Button>
        </div>
      </section>

      {/* For Manufacturers Section */}
      <section id="partners" className="py-16 md:py-24 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">
              Attention, Manufacturers!
            </h2>
            <p className="mt-4 text-lg max-w-3xl mx-auto text-muted-foreground">
              Ready to scale your business? Partner with Luna to list your products on <a href="https://tradinta.co.ke" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">Tradinta.co.ke</a>, our dedicated sales platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-12">
            {partnerFeatures.map((pillar) => (
              <div key={pillar.title} className="text-center flex flex-col items-center">
                <div className="bg-primary/20 rounded-full p-4 mb-4">
                  <pillar.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-headline text-xl font-semibold mb-2">{pillar.title}</h3>
                <p className="text-muted-foreground max-w-xs">{pillar.description}</p>
              </div>
            ))}
          </div>
           <div className="text-center mt-12">
             <Button asChild size="lg">
                <Link href="#contact">Get Your API Key</Link>
            </Button>
           </div>
        </div>
      </section>

       {/* Why Choose Luna? Section */}
      <section className="py-16 md:py-24 bg-background">
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

    </div>
  );
}

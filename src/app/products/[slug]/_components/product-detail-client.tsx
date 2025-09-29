
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Product } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Check, Send, ShoppingCart, MessageSquare, Plus, Minus, Star, User, Loader } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatModal } from './chat-modal';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { WholesaleRedirectModal } from './wholesale-redirect-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Review, reviewService } from '@/services/review.service';
import { formatDistanceToNow } from 'date-fns';

const StarRatingDisplay = ({ rating, reviewCount }: { rating: number, reviewCount: number }) => {
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={cn(
                            'h-5 w-5',
                            i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'
                        )}
                    />
                ))}
            </div>
            {reviewCount > 0 && <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>}
        </div>
    );
};


export default function ProductDetailClient({ product }: { product: Product }) {
  const primaryImage = product.imageUrl;
  const galleryImages = useMemo(() => {
    return (product.galleryImageUrls || []).filter((url): url is string => !!url);
  }, [product.galleryImageUrls]);
  
  const allImages = primaryImage ? [primaryImage, ...galleryImages] : galleryImages;

  const [selectedImage, setSelectedImage] = useState<string | undefined>(allImages[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { addItem, setIsCartOpen } = useCart();
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const fetchedReviews = await reviewService.getReviews(product.id);
        setReviews(fetchedReviews);
      } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: "Could not load product reviews." });
      } finally {
        setIsLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [product.id, toast]);


  const handleAddToCart = () => {
     if (quantity >= (product.wholesaleMoq || Infinity)) {
        setIsRedirectModalOpen(true);
        return;
    }
    addItem({
        productId: product.id,
        productName: product.name,
        imageUrl: product.imageUrl,
        size: selectedSize.size,
        quantity,
        price: selectedSize.price,
    });
    toast({
        title: "Added to Cart!",
        description: `${quantity} x ${product.name} (${selectedSize.size}) has been added.`,
        action: <Button variant="outline" size="sm" onClick={() => setIsCartOpen(true)}>View Cart</Button>
    });
  }

  const handleBuyNow = () => {
    if (quantity >= (product.wholesaleMoq || Infinity)) {
        setIsRedirectModalOpen(true);
        return;
    }
    addItem({
        productId: product.id,
        productName: product.name,
        imageUrl: product.imageUrl,
        size: selectedSize.size,
        quantity,
        price: selectedSize.price,
    });
    router.push('/checkout');
  };
  
  const handleReviewSubmit = async () => {
    if (!user || !userProfile) {
        toast({ variant: 'destructive', title: "Not Logged In", description: "You must be logged in to leave a review." });
        return;
    }
    if (reviewRating === 0 || reviewComment.trim() === '') {
        toast({ variant: 'destructive', title: "Missing Information", description: "Please provide a rating and a comment." });
        return;
    }
    setIsSubmittingReview(true);
    try {
        const newReview = await reviewService.addReview({
            productId: product.id,
            userId: user.uid,
            userName: userProfile.displayName,
            userPhotoUrl: userProfile.photoURL || '',
            rating: reviewRating,
            comment: reviewComment,
        });
        setReviews(prev => [newReview, ...prev]);
        setReviewRating(0);
        setReviewComment('');
        toast({ title: "Review Submitted!", description: "Thank you for your feedback." });
    } catch (error) {
        toast({ variant: 'destructive', title: "Submission Failed", description: "Could not submit your review." });
    } finally {
        setIsSubmittingReview(false);
    }
  };


  return (
    <>
      <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-sm mb-4 text-muted-foreground">
              <Link href="/" className="hover:text-primary">Home</Link>
              {' / '}
              <Link href="/products" className="hover:text-primary">Products</Link>
              {' / '}
              <Link href={`/products?category=${product.category}`} className="hovertext-primary capitalize">{product.category.replace(/-/g, ' ')}</Link>
              {' / '}
              <span className='text-foreground'>{product.name}</span>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          
          <div className="flex flex-col gap-4">
              <div className="aspect-square w-full bg-card rounded-lg overflow-hidden shadow-lg border">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    width={800}
                    height={800}
                    className="object-cover w-full h-full"
                    priority
                  />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                        No Image Available
                    </div>
                )}
              </div>
              
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {allImages.map((image, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setSelectedImage(image)}
                            className={cn(
                                "aspect-square rounded-md overflow-hidden border-2 transition",
                                selectedImage === image ? "border-primary ring-2 ring-primary" : "border-transparent hover:border-primary/50"
                            )}
                        >
                            <Image 
                                src={image}
                                alt={`${product.name} gallery image ${idx + 1}`}
                                width={150}
                                height={150}
                                className="object-cover w-full h-full"
                            />
                        </button>
                    ))}
                </div>
              )}
          </div>

          <div>
            <Badge variant="secondary" className='capitalize'>{product.category.replace(/-/g, ' ')}</Badge>
            <h1 className="font-headline text-3xl md:text-4xl font-bold mt-2">{product.name}</h1>
            <div className="mt-4">
              <StarRatingDisplay rating={product.rating} reviewCount={product.reviewCount} />
            </div>
            <p className="mt-4 text-lg text-muted-foreground">{product.shortDescription}</p>
            
             <Separator className="my-8" />

            <div className="space-y-6">
                <div>
                    <h3 className='text-sm font-semibold text-muted-foreground'>Recommended Retail Price (RRP)</h3>
                     <p className="text-4xl font-bold text-primary">Ksh {selectedSize.price.toFixed(2)}</p>
                </div>

                {product.sizes.length > 1 && (
                    <div>
                        <h3 className='text-sm font-semibold text-muted-foreground mb-2'>Size</h3>
                        <div className="flex flex-wrap gap-2">
                            {product.sizes.map((size) => (
                            <Button
                                key={size.size}
                                variant={selectedSize.size === size.size ? 'default' : 'outline'}
                                onClick={() => setSelectedSize(size)}
                            >
                                {size.size}
                            </Button>
                            ))}
                        </div>
                    </div>
                )}
                
                <div>
                    <h3 className='text-sm font-semibold text-muted-foreground mb-2'>Quantity</h3>
                    <div className="flex items-center gap-2 border rounded-md w-fit">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center text-lg font-bold">{quantity}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10"
                             onClick={() => setQuantity(q => q + 1)}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                         <Button size="lg" className="flex-1" onClick={handleBuyNow}>
                            Buy Now
                        </Button>
                        <Button size="lg" variant="outline" className="flex-1" onClick={handleAddToCart}>
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Add to Cart
                        </Button>
                    </div>
                </div>


                <Card className="bg-accent/50 border-accent">
                    <CardHeader className='pb-4'>
                        <CardTitle className='text-accent-foreground text-lg'>Wholesale Available</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-accent-foreground/90 mb-4">
                            Get a significant discount on orders of <span className="font-bold">{product.wholesaleMoq} units</span> or more. Perfect for retailers and distributors.
                        </p>
                         <Button size="default" variant="secondary" onClick={() => setIsChatOpen(true)} className='bg-primary/20 text-primary hover:bg-primary/30'>
                            <MessageSquare className="mr-2 h-5 w-5" />
                            Discuss Bulk Pricing
                        </Button>
                    </CardContent>
                </Card>
            </div>
          </div>
        </div>
         <Separator className="my-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16">
            <div className="md:col-span-2">
                <h3 className="font-headline text-2xl font-semibold mb-6">Product Details</h3>
                <div className="space-y-8 text-sm text-muted-foreground">
                    <div>
                        <h4 className="font-semibold text-foreground mb-2 text-base">Key Benefits</h4>
                        <ul className="space-y-2 list-disc pl-5">
                            {product.keyBenefits.map((benefit, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                                <span>{benefit}</span>
                            </li>
                            ))}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-foreground mb-2 text-base">Ingredients</h4>
                        <p>{product.ingredients.join(', ')}.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2 text-base">Directions for Use</h4>
                        <p>{product.directions}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-foreground mb-2 text-base">Cautions</h4>
                        <p>{product.cautions}</p>
                    </div>
                </div>
            </div>
            <div className="md:col-span-1">
                 <h3 className="font-headline text-2xl font-semibold mb-6">Ratings & Reviews</h3>
                 <Card>
                     <CardHeader className="flex-row items-center gap-4">
                        <p className="text-5xl font-bold">{product.rating.toFixed(1)}</p>
                        <div>
                             <StarRatingDisplay rating={product.rating} reviewCount={product.reviewCount} />
                            <p className="text-sm text-muted-foreground">Based on {product.reviewCount} reviews</p>
                        </div>
                     </CardHeader>
                     <CardContent className="space-y-6">
                        <div className="space-y-6">
                          {isLoadingReviews ? (
                            <div className="flex justify-center"><Loader className="animate-spin" /></div>
                          ) : reviews.length > 0 ? (
                            reviews.map(review => (
                              <div key={review.id} className="flex gap-3">
                                  <Avatar>
                                      <AvatarImage src={review.userPhotoUrl || `https://i.pravatar.cc/40?u=${review.userId}`} alt={review.userName} />
                                      <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                      <div className="flex items-center gap-2">
                                          <h5 className="font-semibold text-sm">{review.userName}</h5>
                                           <div className="flex">
                                             {[...Array(5)].map((_,i) => <Star key={i} className={cn("h-4 w-4", i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30')}/>)}
                                          </div>
                                      </div>
                                      <p className="text-xs text-muted-foreground mb-1">{formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true })}</p>
                                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                                  </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No reviews yet. Be the first to share your thoughts!</p>
                          )}
                        </div>

                        <Separator />
                        
                        {/* Review Submission Form */}
                        <div className="space-y-4">
                            <h4 className="font-semibold">Leave a Review</h4>
                            {user ? (
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Your Rating:</span>
                                    <div className="flex">
                                        {[...Array(5)].map((_,i) => 
                                          <Star 
                                            key={i} 
                                            className={cn("h-5 w-5 cursor-pointer", i < reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50 hover:text-yellow-400')}
                                            onClick={() => setReviewRating(i + 1)}
                                          />
                                        )}
                                    </div>
                                </div>
                                <Textarea 
                                  placeholder="Share your thoughts..." 
                                  value={reviewComment}
                                  onChange={(e) => setReviewComment(e.target.value)}
                                />
                                <Button onClick={handleReviewSubmit} disabled={isSubmittingReview}>
                                  {isSubmittingReview && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                  Submit Review
                                </Button>
                              </div>
                            ) : (
                              <div className="text-sm text-center text-muted-foreground p-4 border rounded-md">
                                <p><Link href="/login" className="underline font-semibold text-primary">Log in</Link> to leave a review.</p>
                              </div>
                            )}
                        </div>

                     </CardContent>
                 </Card>
            </div>
        </div>
      </div>
      <ChatModal 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        productName={product.name}
      />
      <WholesaleRedirectModal 
        isOpen={isRedirectModalOpen} 
        onClose={() => setIsRedirectModalOpen(false)} 
      />
    </>
  );
}

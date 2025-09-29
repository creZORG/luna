
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader, Link2 } from 'lucide-react';
import { createReferralLink } from '@/ai/flows/create-referral-link-flow';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Campaign } from '@/lib/campaigns.data';

interface CreateReferralLinkClientProps {
    campaign: Campaign;
    onLinkCreated: () => void;
}

export default function CreateReferralLinkClient({ campaign, onLinkCreated }: CreateReferralLinkClientProps) {
    const [destinationUrl, setDestinationUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { user, userProfile } = useAuth();

    const handleSubmit = async () => {
        if (!destinationUrl) {
            toast({
                variant: 'destructive',
                title: 'Destination URL Required',
                description: 'Please enter the URL you want to link to.',
            });
            return;
        }

        if (!user || !userProfile) {
             toast({
                variant: 'destructive',
                title: 'Authentication Error',
                description: 'You must be logged in to create a link.',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await createReferralLink({
                destinationUrl,
                campaignId: campaign.id,
                campaignName: campaign.name,
                marketerId: user.uid,
                marketerName: userProfile.displayName
            });
            toast({
                title: 'Referral Link Created!',
                description: 'Your new shortlink is now active and tracking.',
            });
            setDestinationUrl('');
            onLinkCreated(); // Notify parent to refresh
        } catch (error: any) {
            console.error("Error creating referral link:", error);
            toast({
                variant: 'destructive',
                title: 'Creation Failed',
                description: error.message || 'Could not create the referral link. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Generate Link for "{campaign.name}"</CardTitle>
                <CardDescription>Generate a new trackable shortlink for this campaign. The promo code <span className="font-bold text-primary">{campaign.promoCode}</span> will be associated.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-3 gap-6 items-end">
                    <div className="md:col-span-2">
                        <div className="space-y-2">
                            <Label htmlFor="destination-url">Destination URL</Label>
                            <Input
                                id="destination-url"
                                type="url"
                                placeholder="https://tradinta.co.ke/products/product-slug"
                                value={destinationUrl}
                                onChange={(e) => setDestinationUrl(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !destinationUrl}>
                        {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                        Generate Link
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}


'use client';

import { useState, useMemo } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader, PlusCircle, Link as LinkIcon, Copy, TrendingUp, Megaphone, Star } from 'lucide-react';
import { Campaign } from '@/lib/campaigns.data';
import { ReferralLink } from '@/lib/referrals.data';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { campaignService } from '@/services/campaign.service';
import { referralService } from '@/services/referral.service';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CreateReferralLinkClient from './create-referral-link-client';
import { Separator } from '@/components/ui/separator';

interface CampaignWithLinks extends Campaign {
    links: ReferralLink[];
}

interface CampaignsClientProps {
    initialCampaigns: CampaignWithLinks[];
    topLinks: ReferralLink[];
}

export default function CampaignsClient({ initialCampaigns, topLinks }: CampaignsClientProps) {
    const [campaigns, setCampaigns] = useState<CampaignWithLinks[]>(initialCampaigns);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newCampaignName, setNewCampaignName] = useState('');
    const [newPromoCode, setNewPromoCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { user, userProfile } = useAuth();
    const router = useRouter();

    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url);
        toast({ title: 'Link Copied!', description: 'The shortlink has been copied to your clipboard.' });
    };

    const handleCreateCampaign = async () => {
        if (!newCampaignName || !newPromoCode) {
            toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please enter a name and a promo code.' });
            return;
        }
         if (!user || !userProfile) {
             toast({ variant: 'destructive', title: 'Authentication Error' });
             return;
         }
        
        setIsSubmitting(true);
        try {
            const newCampaign = await campaignService.createCampaign(newCampaignName, newPromoCode.toUpperCase(), user.uid, userProfile.displayName);
            setCampaigns(prev => [{...newCampaign, links: []}, ...prev]);
            toast({ title: 'Campaign Created!', description: `The campaign "${newCampaign.name}" is now active.` });
            setNewCampaignName('');
            setNewPromoCode('');
            setIsAddDialogOpen(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Creation Failed', description: error.message || "Could not create campaign." });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const refreshCampaigns = async () => {
        // In a real app, you might only refetch the specific campaign that was updated.
        // For simplicity, we'll refetch all of them.
        if (!user) return;
        const updatedCampaigns = userProfile?.roles.includes('admin')
            ? await campaignService.getCampaigns()
            : await campaignService.getCampaignsByMarketer(user.uid);

         const campaignsWithLinks = await Promise.all(updatedCampaigns.map(async (campaign) => {
            const links = await referralService.getReferralLinksByCampaign(campaign.id);
            return { ...campaign, links };
        }));
        setCampaigns(campaignsWithLinks);
    }
    
    const visibleCampaigns = useMemo(() => {
        if (!user || !userProfile) return [];
        if (userProfile.roles.includes('admin')) {
            return campaigns;
        }
        return campaigns.filter(c => c.marketerId === user.uid);
    }, [campaigns, user, userProfile]);

    return (
        <div className="grid md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Your Campaigns</CardTitle>
                                <CardDescription>Manage your marketing campaigns and generate referral links.</CardDescription>
                            </div>
                            {userProfile?.roles.includes('admin') &&
                                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" />New Campaign</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create New Campaign</DialogTitle>
                                            <DialogDescription>
                                                A campaign groups your marketing links under a single promo code for sales attribution.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="campaign-name">Campaign Name</Label>
                                                <Input id="campaign-name" placeholder="e.g., Easter Sale 2024" value={newCampaignName} onChange={e => setNewCampaignName(e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="promo-code">Promo Code</Label>
                                                <Input id="promo-code" placeholder="e.g., EASTER20" value={newPromoCode} onChange={e => setNewPromoCode(e.target.value.toUpperCase())} />
                                                <p className="text-xs text-muted-foreground">Short, memorable, and unique. This is what customers will use at checkout.</p>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                            <Button onClick={handleCreateCampaign} disabled={isSubmitting}>
                                                {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                                Create Campaign
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            }
                        </div>
                    </CardHeader>
                    <CardContent>
                         <Accordion type="multiple" className="w-full space-y-4">
                             {visibleCampaigns.map(campaign => (
                                 <AccordionItem key={campaign.id} value={campaign.id} className="border bg-card rounded-lg overflow-hidden">
                                     <AccordionTrigger className="p-4 hover:no-underline data-[state=open]:border-b">
                                        <div className="flex items-center gap-4">
                                            <Megaphone className="h-6 w-6 text-primary" />
                                            <div>
                                                <h4 className="font-semibold">{campaign.name}</h4>
                                                <p className="text-sm text-muted-foreground">Promo Code: <span className="font-mono bg-muted px-2 py-1 rounded-md">{campaign.promoCode}</span></p>
                                            </div>
                                        </div>
                                     </AccordionTrigger>
                                     <AccordionContent className="p-4 bg-muted/50 space-y-4">
                                         <CreateReferralLinkClient campaign={campaign} onLinkCreated={refreshCampaigns} />
                                         
                                         <Separator />
                                         <h5 className="font-semibold">Generated Links</h5>
                                         {campaign.links.length > 0 ? (
                                             <Table>
                                                 <TableHeader>
                                                     <TableRow>
                                                        <TableHead>Shortlink</TableHead>
                                                        <TableHead className="text-right">Clicks</TableHead>
                                                     </TableRow>
                                                 </TableHeader>
                                                 <TableBody>
                                                     {campaign.links.map(link => (
                                                         <TableRow key={link.id}>
                                                             <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">{link.shortUrl}</a>
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(link.shortUrl)}>
                                                                        <Copy className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </div>
                                                                <div className="text-xs text-muted-foreground truncate max-w-xs">{link.destinationUrl}</div>
                                                             </TableCell>
                                                             <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                                                    <span className="font-bold">{link.clickCount}</span>
                                                                </div>
                                                             </TableCell>
                                                         </TableRow>
                                                     ))}
                                                 </TableBody>
                                             </Table>
                                         ) : (
                                            <p className="text-sm text-muted-foreground text-center py-4">No links generated for this campaign yet.</p>
                                         )}
                                     </AccordionContent>
                                 </AccordionItem>
                             ))}
                         </Accordion>
                         {visibleCampaigns.length === 0 && <p className="text-center text-muted-foreground py-8">You haven't been assigned any campaigns yet. Contact an administrator.</p>}
                    </CardContent>
                </Card>
            </div>
            
            <div className="md:col-span-1">
                <Card className="sticky top-24">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Star className="text-yellow-400 fill-yellow-400" /> Top Performing Links</CardTitle>
                        <CardDescription>Your most clicked links across all campaigns.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {topLinks.length > 0 ? (
                             <div className="space-y-4">
                                {topLinks.map(link => (
                                    <div key={link.id} className="flex justify-between items-center text-sm">
                                        <div>
                                            <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">{link.shortUrl}</a>
                                            <p className="text-xs text-muted-foreground">{link.campaignName || 'No Campaign'}</p>
                                        </div>
                                         <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-green-500" />
                                            <span className="font-bold">{link.clickCount}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         ) : (
                             <p className="text-sm text-muted-foreground text-center py-4">No link data available yet.</p>
                         )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

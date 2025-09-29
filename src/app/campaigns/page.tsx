
import { storeItemService } from "@/services/store-item.service";
import EquipmentRequestClient from "./_components/equipment-request-client";
import { campaignService } from "@/services/campaign.service";
import CampaignsClient from "./_components/campaigns-client";
import { referralService } from "@/services/referral.service";
import { auth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { UserProfile, userService } from "@/services/user.service";

// Helper function to get the current logged-in user profile on the server
async function getUser(): Promise<UserProfile | null> {
    const sessionCookie = cookies().get("session")?.value;
    if (!sessionCookie) {
        return null;
    }
    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        return await userService.getUserProfile(decodedClaims.uid);
    } catch (error) {
        return null;
    }
}


export default async function CampaignsPage() {
    const user = await getUser();

    // Fetch equipment items available for request
    const equipmentItems = await storeItemService.getStoreItems().then(items => items.filter(item => item.category !== 'Finished Goods'));
    
    // Fetch campaigns. If user is an admin, fetch all. Otherwise, fetch only their own.
    const campaigns = user?.roles.includes('admin') 
        ? await campaignService.getCampaigns()
        : user 
        ? await campaignService.getCampaignsByMarketer(user.uid)
        : [];

    // Fetch links for each campaign
    const campaignsWithLinks = await Promise.all(campaigns.map(async (campaign) => {
        const links = await referralService.getReferralLinksByCampaign(campaign.id);
        return { ...campaign, links };
    }));

    // Find top 5 links overall for admins, or just for the user
    const allLinks = campaignsWithLinks.flatMap(c => c.links);
    const topLinks = allLinks.sort((a,b) => b.clickCount - a.clickCount).slice(0, 5);


    return (
        <div className="grid gap-8">
            <div className="mb-2">
                 <h1 className="text-3xl font-bold">Campaigns Portal</h1>
                 <p className="text-muted-foreground">Manage campaigns, create trackable links, and request equipment.</p>
            </div>
            
            <CampaignsClient initialCampaigns={campaignsWithLinks} topLinks={topLinks} />

            <EquipmentRequestClient items={equipmentItems} />
        </div>
    );
}


import { storeItemService } from "@/services/store-item.service";
import EquipmentRequestClient from "./_components/equipment-request-client";
import { campaignService } from "@/services/campaign.service";
import CampaignsClient from "./_components/campaigns-client";
import { referralService } from "@/services/referral.service";
import { UserProfile, userService } from "@/services/user.service";

export default async function CampaignsPage() {
    // Fetch equipment items available for request
    const equipmentItems = await storeItemService.getStoreItems().then(items => items.filter(item => item.category !== 'Finished Goods'));
    
    // Fetch all campaigns. The client component will filter based on the logged-in user's role.
    const campaigns = await campaignService.getCampaigns();

    // Fetch all users with the 'influencer' role
    const influencers = await userService.getUsersByRole('influencer');

    // Fetch links for each campaign
    const campaignsWithLinks = await Promise.all(campaigns.map(async (campaign) => {
        const links = await referralService.getReferralLinksByCampaign(campaign.id);
        return { ...campaign, links };
    }));

    // Find top 5 links overall
    const allLinks = campaignsWithLinks.flatMap(c => c.links);
    const topLinks = allLinks.sort((a,b) => b.clickCount - a.clickCount).slice(0, 5);


    return (
        <div className="grid gap-8">
            <div className="mb-2">
                 <h1 className="text-3xl font-bold">Campaigns Portal</h1>
                 <p className="text-muted-foreground">Manage campaigns, create trackable links, and request equipment.</p>
            </div>
            
            <CampaignsClient 
                initialCampaigns={campaignsWithLinks} 
                topLinks={topLinks} 
                influencers={influencers} 
            />

            <EquipmentRequestClient items={equipmentItems} />
        </div>
    );
}

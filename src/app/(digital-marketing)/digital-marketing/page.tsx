
import { storeItemService } from "@/services/store-item.service";
import EquipmentRequestClient from "./_components/equipment-request-client";
import { campaignService, Campaign } from "@/services/campaign.service";
import CampaignsClient from "./_components/campaigns-client";
import { referralService } from "@/services/referral.service";

export default async function DigitalMarketingDashboard() {
    const [equipmentItems, campaigns] = await Promise.all([
        storeItemService.getStoreItems().then(items => items.filter(item => item.category !== 'Finished Goods')),
        campaignService.getCampaigns()
    ]);
    
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
                 <h1 className="text-3xl font-bold">Digital Marketing Portal</h1>
                 <p className="text-muted-foreground">Manage campaigns, create trackable links, and request equipment.</p>
            </div>
            
            <CampaignsClient initialCampaigns={campaignsWithLinks} topLinks={topLinks} />

            <EquipmentRequestClient items={equipmentItems} />
        </div>
    );
}

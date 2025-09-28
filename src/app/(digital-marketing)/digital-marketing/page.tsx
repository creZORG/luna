
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StoreItem } from "@/lib/store-items.data";
import { storeItemService } from "@/services/store-item.service";
import { referralService } from "@/services/referral.service";
import EquipmentRequestClient from "./_components/equipment-request-client";
import CreateReferralLinkClient from "./_components/create-referral-link-client";
import ReferralLinksClient from "./_components/referral-links-client";
import { authService } from "@/services/auth.service";

export default async function DigitalMarketingDashboard() {
    const storeItems: StoreItem[] = await storeItemService.getStoreItems();
    // In a real app, you'd get the ID from the authenticated user session
    const currentUser = authService.getCurrentUser();
    const marketerId = currentUser?.uid || 'temp-digital-markerter-id';
    const referralLinks = await referralService.getReferralLinksByMarketer(marketerId);

    // Filter for non-"Finished Goods" items for the request form
    const equipmentItems = storeItems.filter(item => item.category !== 'Finished Goods');


    return (
        <div className="grid gap-6">
            <h1 className="text-3xl font-bold">Digital Marketing Portal</h1>
            
            <CreateReferralLinkClient />

            <ReferralLinksClient initialLinks={referralLinks} />

            <EquipmentRequestClient items={equipmentItems} />
        </div>
    );
}

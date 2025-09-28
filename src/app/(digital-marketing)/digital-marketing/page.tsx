
import { StoreItem } from "@/lib/store-items.data";
import { storeItemService } from "@/services/store-item.service";
import EquipmentRequestClient from "./_components/equipment-request-client";
import CreateReferralLinkClient from "./_components/create-referral-link-client";
import ReferralLinksClient from "./_components/referral-links-client";

export default async function DigitalMarketingDashboard() {
    const storeItems: StoreItem[] = await storeItemService.getStoreItems();
    
    // Filter for non-"Finished Goods" items for the request form
    const equipmentItems = storeItems.filter(item => item.category !== 'Finished Goods');


    return (
        <div className="grid gap-6">
            <h1 className="text-3xl font-bold">Digital Marketing Portal</h1>
            
            <CreateReferralLinkClient />

            <ReferralLinksClient />

            <EquipmentRequestClient items={equipmentItems} />
        </div>
    );
}

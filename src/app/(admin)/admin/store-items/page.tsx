
import { storeItemService } from "@/services/store-item.service";
import ManageStoreItemsClient from "./_components/manage-store-items-client";


export default async function StoreItemsPage() {
  const items = await storeItemService.getStoreItems();

  // This page should only manage non-product items like equipment and supplies.
  const equipmentAndSupplies = items.filter(item => item.category !== 'Finished Goods');


  return (
    <div className="grid gap-6">
        <div>
            <h1 className="text-3xl font-bold">Equipment & Supplies</h1>
            <p className="text-muted-foreground">Manage internal equipment and supplies that can be requested by staff.</p>
        </div>
        <ManageStoreItemsClient 
            initialItems={equipmentAndSupplies} 
            title="Equipment & Supplies Inventory" 
            description="Add, edit, or remove equipment available for internal requests by staff." 
            canAddItem={true} 
        />
    </div>
  );
}


import { storeItemService } from "@/services/store-item.service";
import ManageStoreItemsClient from "./_components/manage-store-items-client";


export default async function StoreItemsPage() {
  const items = await storeItemService.getStoreItems();

  // This page now manages both finished goods and other internal store items.
  const finishedGoods = items.filter(item => item.category === 'Finished Goods');
  const equipmentAndSupplies = items.filter(item => item.category !== 'Finished Goods');

  return (
    <div className="grid gap-8">
        <div>
            <h1 className="text-3xl font-bold">Store Inventory Management</h1>
            <p className="text-muted-foreground">Manage stock levels for both finished goods ready for sale and internal equipment &amp; supplies.</p>
        </div>

        <ManageStoreItemsClient
            initialItems={finishedGoods} 
            title="Finished Goods Inventory" 
            description="Set and adjust stock levels for products ready for sale (e.g., shower gels, dish wash)." 
            canAddItem={false} // Finished goods are added via the Products page, not here.
        />
        
        <ManageStoreItemsClient 
            initialItems={equipmentAndSupplies} 
            title="Equipment & Supplies Inventory" 
            description="Add, edit, or remove equipment available for internal requests by staff." 
            canAddItem={true} 
        />
    </div>
  );
}

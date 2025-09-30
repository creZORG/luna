
import { storeItemService } from "@/services/store-item.service";
import ManageStoreItemsClient from "./_components/manage-store-items-client";


export default async function StoreItemsPage() {
  const [equipmentAndSupplies, finishedGoods] = await Promise.all([
    storeItemService.getStoreItems().then(items => items.filter(item => item.category !== 'Finished Goods')),
    storeItemService.getStoreItemsByCategory('Finished Goods'),
  ]);


  return (
    <div className="grid gap-8">
        <div>
            <h1 className="text-3xl font-bold">Store Inventory Management</h1>
            <p className="text-muted-foreground">Manage stock levels for both finished goods ready for sale and internal equipment &amp; supplies.</p>
        </div>

        <ManageStoreItemsClient
            initialItems={finishedGoods} 
            title="Finished Goods Inventory" 
            description="View current stock levels for products ready for sale. Inventory is adjusted via production runs and sales." 
            canAddItem={false}
            isReadOnly={true}
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

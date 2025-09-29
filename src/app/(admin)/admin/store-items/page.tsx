
import { storeItemService } from "@/services/store-item.service";
import ManageStoreItemsClient from "./_components/manage-store-items-client";


export default async function StoreItemsPage() {
  const items = await storeItemService.getStoreItems();

  const finishedGoods = items.filter(item => item.category === 'Finished Goods');
  const equipment = items.filter(item => item.category !== 'Finished Goods');


  return (
    <div className="grid gap-6">
        <div>
            <h1 className="text-3xl font-bold">Store Inventory Management</h1>
            <p className="text-muted-foreground">Adjust stock levels for finished goods and internal equipment.</p>
        </div>
        <ManageStoreItemsClient initialItems={finishedGoods} title="Finished Goods Inventory" description="Set and adjust stock levels for products ready for sale." />
        <ManageStoreItemsClient initialItems={equipment} title="Equipment & Supplies Inventory" description="Add, edit, or remove equipment available for internal requests." />
    </div>
  );
}

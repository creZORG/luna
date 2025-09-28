
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StoreItemRequest } from "@/lib/store-items.data";
import { storeItemService } from "@/services/store-item.service";
import StoreItemsClient from "./_components/store-items-client";
import ManageStoreItemsClient from "./_components/manage-store-items-client";


export default async function StoreItemsPage() {
  const items = await storeItemService.getStoreItems();
  const requests = await storeItemService.getItemRequests();

  const finishedGoods = items.filter(item => item.category === 'Finished Goods');
  const equipment = items.filter(item => item.category !== 'Finished Goods');


  return (
    <div className="grid gap-6">
        <ManageStoreItemsClient initialItems={finishedGoods} title="Finished Goods Inventory" description="Set and adjust stock levels for products ready for sale." />
        <ManageStoreItemsClient initialItems={equipment} title="Equipment Inventory" description="Add, edit, or remove equipment available for internal requests." />
        <StoreItemsClient items={items} initialRequests={requests} />
    </div>
  );
}

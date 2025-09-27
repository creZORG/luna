
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StoreItem, StoreItemRequest } from "@/lib/store-items.data";
import { storeItemService } from "@/services/store-item.service";
import StoreItemsClient from "./_components/store-items-client";


export default async function StoreItemsPage() {
  const items = await storeItemService.getStoreItems();
  const requests = await storeItemService.getItemRequests();

  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Manage Store Items</CardTitle>
                <CardDescription>
                    Add, edit, or remove items available for request from the company store.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>Item management interface will be here.</p>
                {/* Future: Add a form here to add/edit StoreItem */}
            </CardContent>
        </Card>
        <StoreItemsClient items={items} initialRequests={requests} />
    </div>
  );
}

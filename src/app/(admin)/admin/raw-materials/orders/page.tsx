
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NewOrderClient from './_components/new-order-client';
import { rawMaterialService } from '@/services/raw-material.service';
import OrderHistoryClient from './_components/order-history-client';
import { purchaseOrderService } from '@/services/purchase-order.service';

export default async function RawMaterialOrdersPage() {
  const materials = await rawMaterialService.getRawMaterials();
  const orders = await purchaseOrderService.getPurchaseOrders();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold">Raw Material Procurement</h1>
        <p className="text-muted-foreground">
          Create and send new purchase orders to suppliers and track order
          history.
        </p>
      </div>

      <Tabs defaultValue="new-order">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new-order">New Purchase Order</TabsTrigger>
          <TabsTrigger value="order-history">Order History</TabsTrigger>
        </TabsList>
        <TabsContent value="new-order">
          <NewOrderClient rawMaterials={materials} />
        </TabsContent>
        <TabsContent value="order-history">
          <OrderHistoryClient initialOrders={orders} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

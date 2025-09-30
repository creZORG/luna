
import { storeItemService } from "@/services/store-item.service";
import ManageStoreItemsClient from "./_components/manage-store-items-client";
import { productService } from "@/services/product.service";
import { StoreItem } from "@/lib/store-items.data";


export default async function StoreItemsPage() {
  const [equipmentAndSupplies, products] = await Promise.all([
    storeItemService.getStoreItems().then(items => items.filter(item => item.category !== 'Finished Goods')),
    productService.getProducts()
  ]);

  // Adapt the Product data to fit the expected StoreItem shape for the client component
  const finishedGoodsAsStoreItems: StoreItem[] = products.map(p => ({
    id: p.id,
    name: p.name,
    category: "Finished Goods", // The component uses this for display
    inventory: p.sizes.reduce((acc, size) => acc + (size.inventory || 0), 0)
  }));


  return (
    <div className="grid gap-8">
        <div>
            <h1 className="text-3xl font-bold">Store Inventory Management</h1>
            <p className="text-muted-foreground">Manage stock levels for both finished goods ready for sale and internal equipment &amp; supplies.</p>
        </div>

        <ManageStoreItemsClient
            initialItems={finishedGoodsAsStoreItems} 
            title="Finished Goods Inventory" 
            description="View current stock levels for products ready for sale. Inventory is adjusted via production runs and sales." 
            canAddItem={false}
            isReadOnly={true} // This will be a new prop
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

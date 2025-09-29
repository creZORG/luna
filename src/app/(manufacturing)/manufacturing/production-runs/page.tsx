
import { storeItemService } from "@/services/store-item.service";
import ProductionRunClient from "./_components/production-run-client";

export default async function ProductionRunsPage() {
    const allStoreItems = await storeItemService.getStoreItems();
    const finishedGoods = allStoreItems.filter(item => item.category === 'Finished Goods');

    return (
        <div className="grid gap-6">
            <div>
                <h1 className="text-3xl font-bold">Log Production Run</h1>
                <p className="text-muted-foreground">
                    Record the output of a manufacturing run. This will consume raw materials and add to the finished goods inventory.
                </p>
            </div>
            <ProductionRunClient finishedGoods={finishedGoods} />
        </div>
    )
}

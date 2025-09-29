
import { storeItemService } from "@/services/store-item.service";
import ProductionRunClient from "./_components/production-run-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductionHistoryClient from "./_components/history-client";
import { manufacturingService } from "@/services/manufacturing.service";


export default async function ProductionRunsPage() {
    const allStoreItems = await storeItemService.getStoreItems();
    const finishedGoods = allStoreItems.filter(item => item.category === 'Finished Goods');

    const productionHistory = await manufacturingService.getProductionRuns();

    return (
        <div className="grid gap-6">
            <div>
                <h1 className="text-3xl font-bold">Log Production Run</h1>
                <p className="text-muted-foreground">
                    Record the output of a manufacturing run or view past production history.
                </p>
            </div>
             <Tabs defaultValue="new-run">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="new-run">New Production Run</TabsTrigger>
                    <TabsTrigger value="history">Production History</TabsTrigger>
                </TabsList>
                <TabsContent value="new-run">
                    <ProductionRunClient finishedGoods={finishedGoods} />
                </TabsContent>
                <TabsContent value="history">
                   <ProductionHistoryClient initialRuns={productionHistory} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

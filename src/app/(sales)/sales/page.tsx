
import SalesDashboardClient from './_components/sales-dashboard-client';
import type { Product } from '@/lib/data';
import type { StockInfo } from './_components/sales-dashboard-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storeItemService } from '@/services/store-item.service';

async function getInitialStockData(): Promise<StockInfo[]> {
    const allStoreItems = await storeItemService.getStoreItems();
    const finishedGoods = allStoreItems.filter(item => item.category === 'Finished Goods');
    
    return finishedGoods.map(item => ({
        // The composite ID is what we'll use to track inventory
        productId: item.id,
        productName: item.name,
        size: (item as any).size, // This property is added in the service
        openingStock: item.inventory,
        price: (item as any).price, // This property is added in the service
        productImageId: (item as any).productImageId, // This property is added in the service
    }));
}

export default async function SalesDashboard() {
    const stockData = await getInitialStockData();

    if (!stockData || stockData.length === 0) {
        return (
            <div>
                <h1 className="text-3xl font-bold mb-6">Sales Portal</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>No Products Found or Assigned</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>There are no finished goods in the inventory system. Please have an administrator add products and set their initial stock levels.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6">
                 <h1 className="text-3xl font-bold">Sales Portal</h1>
                 <p className="text-muted-foreground">Log your daily sales and track your stock.</p>
            </div>
            <SalesDashboardClient initialStock={stockData} />
        </div>
    );
}

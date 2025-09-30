

import type { StockInfo } from './_components/sales-dashboard-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { storeItemService } from '@/services/store-item.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FieldSalesClient from './_components/field-sales-client';
import { getOrders } from '@/services/order.service';
import OnlineOrdersClient from './_components/online-orders-client';
import SalesDashboardClient from './_components/sales-dashboard-client';
import { Product, getProducts } from '@/services/product.service';

async function getInitialStockData(): Promise<StockInfo[]> {
    const products: Product[] = await getProducts();
    const stockInfo: StockInfo[] = [];

    products.forEach(product => {
        product.sizes.forEach(size => {
            stockInfo.push({
                productId: product.id,
                productName: product.name,
                size: size.size,
                openingStock: size.inventory || 0,
                price: size.price,
                imageUrl: product.imageUrl,
            });
        });
    });
    
    // In a real app, this would be filtered by stock assigned to the specific salesperson
    return stockInfo;
}

export default async function SalesDashboard() {
    const stockData = await getInitialStockData();
    const orders = await getOrders();

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
        <div className="grid gap-6">
             <div className="mb-2">
                 <h1 className="text-3xl font-bold">Sales Portal</h1>
                 <p className="text-muted-foreground">Log your daily sales, process in-person transactions, and monitor online orders.</p>
            </div>
            
            <Tabs defaultValue="daily-log">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="daily-log">Daily Log</TabsTrigger>
                    <TabsTrigger value="field-sale">Field Sale (POS)</TabsTrigger>
                    <TabsTrigger value="online-orders">Online Orders</TabsTrigger>
                </TabsList>
                <TabsContent value="daily-log">
                    <SalesDashboardClient initialStock={stockData} />
                </TabsContent>
                <TabsContent value="field-sale">
                    <FieldSalesClient initialStock={stockData} />
                </TabsContent>
                 <TabsContent value="online-orders">
                    <OnlineOrdersClient initialOrders={orders} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

    

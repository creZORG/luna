import SalesDashboardClient from './_components/sales-dashboard-client';
import { productService } from '@/services/product.service';
import type { Product } from '@/lib/data';
import type { StockInfo } from './_components/sales-dashboard-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// This function simulates fetching initial stock data.
// In a real application, this would come from an inventory management system.
function getInitialStockData(products: Product[]): StockInfo[] {
    return products.flatMap(product => 
        product.sizes.map(size => ({
            productId: product.id,
            productName: product.name,
            size: size.size,
            openingStock: Math.floor(Math.random() * 100) + 20, // Random stock between 20 and 120
            price: size.price,
            productImageId: product.imageId,
        }))
    );
}

export default async function SalesDashboard() {
    const products = await productService.getProducts();

    if (!products || products.length === 0) {
        return (
            <div>
                <h1 className="text-3xl font-bold mb-6">Sales Portal</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>No Products Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>There are no products in the system. Please add products in the admin panel before using the sales portal.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    const stockData = getInitialStockData(products);

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

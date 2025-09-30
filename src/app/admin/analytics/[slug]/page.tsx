
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { analyticsService, ProductAnalyticsData } from '@/services/analytics.service';
import { DollarSign, Package, BarChart, Eye } from 'lucide-react';
import ProductAnalyticsClient from './_components/product-analytics-client';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function StatCard({ title, value, icon: Icon, description }: { title: string; value: string; icon: React.ElementType; description: string; }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

export default async function ProductAnalyticsPage({ params }: { params: { slug: string } }) {
    const data: ProductAnalyticsData | null = await analyticsService.getProductAnalytics(params.slug);

    if (!data) {
        return notFound();
    }
    
    const { product } = data;

    return (
        <div className="grid gap-6">
            <div className='flex items-center gap-4'>
                 <Button asChild variant="outline" size="icon">
                    <Link href="/operations/products"><ArrowLeft /></Link>
                </Button>
                <div className="flex items-center gap-4">
                    <Image src={product.imageUrl} alt={product.name} width={64} height={64} className="rounded-lg object-cover aspect-square" />
                    <div>
                        <h1 className="text-3xl font-bold">{product.name} Analytics</h1>
                        <p className="text-muted-foreground">A detailed performance review of this product.</p>
                    </div>
                </div>
            </div>
            
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                    title="Total Revenue"
                    value={`Ksh ${data.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    description="From all completed orders"
                />
                <StatCard 
                    title="Total Orders"
                    value={data.totalOrders.toLocaleString()}
                    icon={Package}
                    description="Total number of orders containing this product"
                />
                 <StatCard 
                    title="Total Units Sold"
                    value={data.totalUnitsSold.toLocaleString()}
                    icon={BarChart}
                    description="Total number of individual units sold"
                />
                 <StatCard 
                    title="Product Page Views"
                    value={(product.viewCount || 0).toLocaleString()}
                    icon={Eye}
                    description="Number of visits to the product page"
                />
            </div>
            
            <ProductAnalyticsClient salesOverTime={data.salesOverTime} productName={product.name} />
        </div>
    );
}

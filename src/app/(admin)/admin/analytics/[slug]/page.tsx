

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { analyticsService } from '@/services/analytics.service';
import { notFound } from 'next/navigation';
import { DollarSign, Package, BarChart, Users, Star } from 'lucide-react';
import ProductAnalyticsClient from './_components/product-analytics-client';
import Image from 'next/image';

export default async function ProductAnalyticsPage({ params }: { params: { slug: string }}) {
    const data = await analyticsService.getProductAnalytics(params.slug);

    if (!data) {
        return notFound();
    }

    return (
        <div className="grid gap-6">
            <div className="flex items-center gap-4">
                <Image src={data.product.imageUrl} alt={data.product.name} width={64} height={64} className="rounded-lg border" />
                <div>
                    <p className="text-sm text-muted-foreground capitalize">{data.product.category.replace('-', ' ')}</p>
                    <h1 className="text-3xl font-bold">{data.product.name}</h1>
                </div>
            </div>
            
             <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Ksh {data.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">From all completed orders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalOrders.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Number of orders including this product</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Units Sold</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalUnitsSold.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total units sold across all sizes</p>
                    </CardContent>
                </Card>
            </div>
            
            <ProductAnalyticsClient salesOverTime={data.salesOverTime} />
        </div>
    );
}


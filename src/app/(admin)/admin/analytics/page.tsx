
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { analyticsService, AnalyticsData } from '@/services/analytics.service';
import { DollarSign, Package, BarChart, Eye } from 'lucide-react';
import AnalyticsClient from './_components/analytics-client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';

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

export default async function AnalyticsPage() {
    const data: AnalyticsData = await analyticsService.getDashboardAnalytics();

    return (
        <div className="grid gap-6">
            <div>
                <h1 className="text-3xl font-bold">Business Analytics</h1>
                <p className="text-muted-foreground">A high-level overview of your sales and product performance.</p>
            </div>
            
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                    description="Total number of orders placed"
                />
                <StatCard 
                    title="Average Order Value"
                    value={`Ksh ${data.averageOrderValue.toFixed(2)}`}
                    icon={BarChart}
                    description="Average revenue per order"
                />
            </div>
            
            <AnalyticsClient salesOverTime={data.salesOverTime} salesByCategory={data.salesByCategory} />
            
            <Card>
                <CardHeader>
                    <CardTitle>Top Performing Products</CardTitle>
                    <CardDescription>Your best-selling products ranked by total revenue generated.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Revenue</TableHead>
                                <TableHead className="text-right hidden sm:table-cell">Orders</TableHead>
                                <TableHead className="text-right hidden sm:table-cell">Views</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.topProducts.map(product => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                                            <div>
                                                <div className="font-medium">{product.name}</div>
                                                <div className="text-xs text-muted-foreground capitalize">{product.category.replace(/-/g, ' ')}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">Ksh {product.totalRevenue?.toLocaleString() ?? 0}</TableCell>
                                    <TableCell className="text-right hidden sm:table-cell">{product.orderCount?.toLocaleString() ?? 0}</TableCell>
                                    <TableCell className="text-right hidden sm:table-cell">{product.viewCount?.toLocaleString() ?? 0}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

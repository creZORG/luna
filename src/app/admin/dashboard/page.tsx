'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Package, Shapes } from 'lucide-react';
import { useEffect, useState } from 'react';
import { dashboardService, DashboardData } from '@/services/dashboard.service';
import { Skeleton } from '@/components/ui/skeleton';


const chartConfig = {
    count: {
      label: 'Products',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dashboardData = await dashboardService.getDashboardData();
                setData(dashboardData);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading || !data) {
        return (
            <div className="flex flex-col gap-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
                </div>
                 <Card className='h-[400px]'>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-full w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    const chartData = data.productsPerCategory;

    return (
        <div className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Products
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{data.totalProducts}</div>
                    <p className="text-xs text-muted-foreground">
                        The total number of products in your store.
                    </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Categories
                    </CardTitle>
                    <Shapes className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{data.totalCategories}</div>
                    <p className="text-xs text-muted-foreground">
                        The number of unique product categories.
                    </p>
                    </CardContent>
                </Card>
            </div>
        <Card>
        <CardHeader>
          <CardTitle>Products by Category</CardTitle>
          <CardDescription>A breakdown of products in each category.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="category"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                className='capitalize'
              />
              <XAxis dataKey="count" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      </div>
    )
}

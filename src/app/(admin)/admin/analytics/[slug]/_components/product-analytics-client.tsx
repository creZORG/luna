
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { SalesOverTimeData } from '@/services/analytics.service';

const chartConfig = {
    sales: { label: "Sales", color: "hsl(var(--primary))" },
};

export default function ProductAnalyticsClient({ salesOverTime }: { salesOverTime: SalesOverTimeData[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Sales Trend - Last 7 Days</CardTitle>
                <CardDescription>A look at the total revenue this product has generated each day.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                    <BarChart accessibilityLayer data={salesOverTime}>
                         <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis
                            tickFormatter={(value) => `Ksh ${Number(value) / 1000}k`}
                        />
                        <ChartTooltip 
                            content={<ChartTooltipContent 
                                formatter={(value) => `Ksh ${Number(value).toLocaleString()}`}
                            />} 
                        />
                        <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

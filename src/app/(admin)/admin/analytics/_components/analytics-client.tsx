
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { SalesByCategoryData, SalesOverTimeData } from '@/services/analytics.service';
import { useTheme } from 'next-themes';

const chartConfig = {
    sales: { label: "Sales", color: "hsl(var(--primary))" },
    showerGel: { label: "Shower Gel", color: "#60a5fa" },
    fabricSoftener: { label: "Fabric Softener", color: "#fb923c" },
    dishWash: { label: "Dish Wash", color: "#4ade80" },
};

const COLORS = ["#60a5fa", "#fb923c", "#4ade80", "#f87171", "#818cf8"];

export default function AnalyticsClient({ salesOverTime, salesByCategory }: { salesOverTime: SalesOverTimeData[], salesByCategory: SalesByCategoryData[] }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Sales - Last 7 Days</CardTitle>
                    <CardDescription>A look at the total revenue generated each day.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
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
            
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Sales by Category</CardTitle>
                    <CardDescription>Revenue distribution across product categories.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <PieChart>
                            <Tooltip
                                content={<ChartTooltipContent
                                    nameKey="category"
                                    formatter={(value) => `Ksh ${Number(value).toLocaleString()}`}
                                />}
                            />
                            <Pie 
                                data={salesByCategory} 
                                dataKey="sales" 
                                nameKey="category" 
                                cx="50%" 
                                cy="50%" 
                                outerRadius={80}
                                labelLine={false}
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                    const RADIAN = Math.PI / 180;
                                    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                    return (
                                        <text x={x} y={y} fill={isDark ? "#fff" : "#000"} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs">
                                        {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                    );
                                }}
                            >
                                {salesByCategory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}

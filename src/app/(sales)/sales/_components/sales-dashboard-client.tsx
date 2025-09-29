
'use client';

import { useState, useMemo } from 'react';
import DailySalesForm from './daily-sales-form';
import SalesSummaryCard from './sales-summary-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SalesLog, salesService } from '@/services/sales.service';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader, Send } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';


export interface StockInfo {
    productId: string;
    productName: string;
    size: string;
    openingStock: number;
    price: number;
    imageUrl?: string;
}

export default function SalesDashboardClient({ initialStock }: { initialStock: StockInfo[] }) {
    const [dailyLogs, setDailyLogs] = useState<Map<string, Omit<SalesLog, 'date' | 'salespersonId' | 'salespersonName'>>>(new Map());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { user, userProfile } = useAuth();

    const handleLogChange = (productId: string, size: string, logData: Partial<Omit<SalesLog, 'date' | 'salespersonId' | 'productId' | 'size' >>) => {
        const key = `${productId}-${size}`;
        setDailyLogs(prev => {
            const newLogs = new Map(prev);
            const existingLog = newLogs.get(key) || { productId, size, openingStock: 0, qtyIssued: 0, qtySold: 0, qtyReturned: 0, defects: 0 };
            newLogs.set(key, { ...existingLog, ...logData });
            return newLogs;
        });
    };

    const closingStockData = useMemo(() => {
        const closingStockMap = new Map<string, number>();
        initialStock.forEach(item => {
            const key = `${item.productId}-${item.size}`;
            const log = dailyLogs.get(key);
            const opening = item.openingStock;
            const issued = log?.qtyIssued ?? 0;
            const sold = log?.qtySold ?? 0;
            const returned = log?.qtyReturned ?? 0;
            const defects = log?.defects ?? 0;
            const closing = opening + issued - sold - returned - defects;
            closingStockMap.set(key, closing);
        });
        return closingStockMap;
    }, [initialStock, dailyLogs]);

    const handleSubmitAll = async () => {
        if (!user || !userProfile) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to submit.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const logsToSubmit = Array.from(dailyLogs.values());
            if (logsToSubmit.length === 0) {
                toast({ variant: 'destructive', title: 'Nothing to submit', description: 'Please enter some sales data first.' });
                return;
            }
            await salesService.createSalesLogs(logsToSubmit, user.uid, userProfile.displayName);
            toast({ title: 'Success!', description: 'Your daily sales logs have been submitted.' });
            // Optionally reset state after submission
            setDailyLogs(new Map());
        } catch (error) {
            console.error("Error submitting logs:", error);
            toast({ variant: 'destructive', title: 'Submission Error', description: 'Could not submit your sales logs. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };


    const totalStock = useMemo(() => initialStock.reduce((sum, item) => sum + item.openingStock, 0), [initialStock]);
    const lowStockThreshold = 10;
    const lowStockItems = useMemo(() => {
       return Array.from(closingStockData.entries())
            .filter(([, closingStock]) => closingStock < lowStockThreshold)
            .map(([key]) => {
                const [productId, size] = key.split(/-(.+)/);
                const stockInfo = initialStock.find(item => item.productId === productId && item.size === size);
                return stockInfo ? `${stockInfo.productName} (${stockInfo.size})` : 'Unknown item';
            });
    }, [closingStockData, initialStock]);

    const dailySummary = useMemo(() => {
       return Array.from(dailyLogs.values()).map(log => {
           const stockInfo = initialStock.find(item => item.productId === log.productId && item.size === log.size);
           const closingStock = closingStockData.get(`${log.productId}-${log.size}`) ?? stockInfo?.openingStock ?? 0;
            return {
                productName: stockInfo?.productName ?? 'Unknown',
                size: log.size,
                qtyIssued: log.qtyIssued,
                qtySold: log.qtySold,
                defects: log.defects,
                closingStock: closingStock
            }
       })
    }, [dailyLogs, initialStock, closingStockData]);

    return (
        <div className="grid gap-6">
            <div className="grid md:grid-cols-3 gap-6">
                <SalesSummaryCard title="Total Current Stock" value={totalStock.toString()} description="Sum of all available product units." />
                <SalesSummaryCard title="Products Assigned" value={initialStock.length.toString()} description="Number of product variants you are tracking." />
                <SalesSummaryCard 
                    title="Low Stock Alerts" 
                    value={lowStockItems.length.toString()} 
                    description={lowStockItems.length > 0 ? `Alert for: ${lowStockItems.slice(0, 2).join(', ')}` : 'All stock levels are healthy.'}
                    variant={lowStockItems.length > 0 ? 'destructive' : 'default'}
                 />
            </div>
            
            <DailySalesForm 
                stockItems={initialStock} 
                onLogChange={handleLogChange}
                logs={dailyLogs}
            />

            {dailySummary.length > 0 && (
                 <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>End of Day Summary</CardTitle>
                            <Button onClick={handleSubmitAll} disabled={isSubmitting}>
                                {isSubmitting ? <Loader className="mr-2 animate-spin" /> : <Send className="mr-2" />}
                                Submit All Logs
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead className="text-right">Issued</TableHead>
                                    <TableHead className="text-right">Sold</TableHead>
                                    <TableHead className="text-right">Defects</TableHead>
                                    <TableHead className="text-right font-bold">Closing Stock</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dailySummary.map((item, index) => (
                                     <TableRow key={index}>
                                        <TableCell className='font-medium'>{item.productName}</TableCell>
                                        <TableCell>{item.size}</TableCell>
                                        <TableCell className="text-right">{item.qtyIssued}</TableCell>
                                        <TableCell className="text-right">{item.qtySold}</TableCell>
                                        <TableCell className="text-right">{item.defects}</TableCell>
                                        <TableCell className="text-right font-bold">{item.closingStock}</TableCell>
                                     </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                 </Card>
            )}
        </div>
    );
}

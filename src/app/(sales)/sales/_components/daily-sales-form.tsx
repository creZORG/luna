'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { StockInfo } from './sales-dashboard-client';
import type { SalesLog } from '@/services/sales.service';

interface DailySalesFormProps {
    stockItems: StockInfo[];
    logs: Map<string, Omit<SalesLog, 'date' | 'salespersonId'>>;
    onLogChange: (productId: string, size: string, data: Partial<Omit<SalesLog, 'date' | 'salespersonId' | 'productId' | 'size'>>) => void;
}

export default function DailySalesForm({ stockItems, onLogChange, logs }: DailySalesFormProps) {
    
    const handleInputChange = (productId: string, size: string, openingStock: number, field: keyof Omit<SalesLog, 'date' | 'salespersonId' | 'productId' | 'size' | 'openingStock'>, value: string) => {
        const numericValue = parseInt(value, 10);
        if (!isNaN(numericValue)) {
            onLogChange(productId, size, { [field]: numericValue, openingStock });
        } else if (value === '') {
             onLogChange(productId, size, { [field]: 0, openingStock });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Daily Sales Log</CardTitle>
                <CardDescription>Enter the quantities for products taken, sold, returned, or found defective today.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full space-y-4">
                    {stockItems.map((item) => {
                        const productImage = PlaceHolderImages.find(img => img.id === item.productImageId);
                        const logKey = `${item.productId}-${item.size}`;
                        const currentLog = logs.get(logKey);

                        return (
                            <AccordionItem key={logKey} value={logKey} className="border bg-card rounded-lg overflow-hidden">
                                <AccordionTrigger className="p-4 hover:no-underline">
                                    <div className="flex items-center gap-4">
                                        {productImage && (
                                            <Image 
                                                src={productImage.imageUrl} 
                                                alt={item.productName} 
                                                width={64} 
                                                height={64} 
                                                className="rounded-md object-cover aspect-square"
                                            />
                                        )}
                                        <div>
                                            <h4 className="font-semibold text-lg">{item.productName}</h4>
                                            <p className="text-sm text-muted-foreground">Size: {item.size} | Opening Stock: {item.openingStock}</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 border-t">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`issued-${logKey}`}>Qty Issued</Label>
                                            <Input
                                                id={`issued-${logKey}`}
                                                type="number"
                                                placeholder="0"
                                                value={currentLog?.qtyIssued || ''}
                                                onChange={(e) => handleInputChange(item.productId, item.size, item.openingStock, 'qtyIssued', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`sold-${logKey}`}>Qty Sold</Label>
                                            <Input
                                                id={`sold-${logKey}`}
                                                type="number"
                                                placeholder="0"
                                                value={currentLog?.qtySold || ''}
                                                onChange={(e) => handleInputChange(item.productId, item.size, item.openingStock, 'qtySold', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`returned-${logKey}`}>Qty Returned</Label>
                                            <Input
                                                id={`returned-${logKey}`}
                                                type="number"
                                                placeholder="0"
                                                value={currentLog?.qtyReturned || ''}
                                                onChange={(e) => handleInputChange(item.productId, item.size, item.openingStock, 'qtyReturned', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`defects-${logKey}`}>Defects</Label>
                                            <Input
                                                id={`defects-${logKey}`}
                                                type="number"
                                                placeholder="0"
                                                value={currentLog?.defects || ''}
                                                onChange={(e) => handleInputChange(item.productId, item.size, item.openingStock, 'defects', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )
                    })}
                </Accordion>
            </CardContent>
        </Card>
    );
}

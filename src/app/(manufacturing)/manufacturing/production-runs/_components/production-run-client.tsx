
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { StoreItem } from '@/lib/store-items.data';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Loader, Factory } from 'lucide-react';
import { manufacturingService } from '@/services/manufacturing.service';

interface ProductionRunClientProps {
  finishedGoods: StoreItem[];
}

export default function ProductionRunClient({ finishedGoods }: ProductionRunClientProps) {
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [quantityProduced, setQuantityProduced] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { toast } = useToast();
    const { user, userProfile } = useAuth();
    const router = useRouter();

    const handleSubmit = async () => {
        if (!selectedItemId || quantityProduced <= 0) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a product and enter a valid quantity.' });
            return;
        }
        if (!user || !userProfile) {
            toast({ variant: 'destructive', title: 'Authentication Error' });
            return;
        }

        setIsSubmitting(true);
        const selectedGood = finishedGoods.find(item => item.id === selectedItemId);
        if (!selectedGood) {
             toast({ variant: 'destructive', title: 'Invalid Product' });
             setIsSubmitting(false);
             return;
        }

        try {
            await manufacturingService.logProductionRun({
                finishedGoodItemId: selectedGood.id,
                productName: selectedGood.name,
                quantityProduced
            }, user.uid, userProfile.displayName);
            
            toast({
                title: "Production Logged!",
                description: `${quantityProduced} units of ${selectedGood.name} have been added to inventory. Raw materials have been deducted.`
            });
            
            // Reset form
            setSelectedItemId('');
            setQuantityProduced(0);
            router.refresh();

        } catch (error) {
            console.error("Error logging production run:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: 'destructive', title: 'Submission Failed', description: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>New Production Run</CardTitle>
                <CardDescription>Select the product and enter the quantity manufactured.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="grid gap-6 items-end md:grid-cols-3">
                    <div className="space-y-2 md:col-span-2">
                        <Label>Finished Product</Label>
                        <Select onValueChange={setSelectedItemId} value={selectedItemId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a product..." />
                            </SelectTrigger>
                            <SelectContent>
                                {finishedGoods.map(item => (
                                    <SelectItem key={item.id} value={item.id}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="quantity">Quantity Produced</Label>
                        <Input
                            id="quantity"
                            type="number"
                            placeholder="e.g., 1000"
                            value={quantityProduced || ''}
                            onChange={e => setQuantityProduced(Number(e.target.value))}
                            disabled={isSubmitting}
                        />
                    </div>
                 </div>
                 <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full mt-6" size="lg">
                    {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Factory className="mr-2 h-4 w-4" />}
                    Log Production & Update Inventory
                </Button>
            </CardContent>
        </Card>
    )
}

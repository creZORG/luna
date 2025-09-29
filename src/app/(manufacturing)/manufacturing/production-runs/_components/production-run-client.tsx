
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
import { Loader, Factory, PlusCircle, Trash2 } from 'lucide-react';
import { manufacturingService, ConsumedMaterial } from '@/services/manufacturing.service';
import { RawMaterial } from '@/lib/raw-materials.data';
import { Separator } from '@/components/ui/separator';

interface ProductionRunClientProps {
  finishedGoods: StoreItem[];
  rawMaterials: RawMaterial[];
}

export default function ProductionRunClient({ finishedGoods, rawMaterials }: ProductionRunClientProps) {
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [quantityProduced, setQuantityProduced] = useState<number>(0);
    const [consumedMaterials, setConsumedMaterials] = useState<ConsumedMaterial[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { toast } = useToast();
    const { user, userProfile } = useAuth();
    const router = useRouter();

    const handleAddMaterial = () => {
        setConsumedMaterials([...consumedMaterials, { rawMaterialId: '', quantityConsumed: 0 }]);
    };
    
    const handleRemoveMaterial = (index: number) => {
        setConsumedMaterials(consumedMaterials.filter((_, i) => i !== index));
    };

    const handleMaterialChange = (index: number, field: keyof ConsumedMaterial, value: string | number) => {
        const newConsumed = [...consumedMaterials];
        if(field === 'rawMaterialId') {
            const material = rawMaterials.find(m => m.id === value);
            newConsumed[index] = { ...newConsumed[index], rawMaterialId: value as string, rawMaterialName: material?.name || '' };
        } else {
            newConsumed[index] = { ...newConsumed[index], [field]: Number(value) };
        }
        setConsumedMaterials(newConsumed);
    };

    const handleSubmit = async () => {
        if (!selectedItemId || quantityProduced <= 0) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a product and enter a valid quantity produced.' });
            return;
        }
        if (consumedMaterials.length === 0 || consumedMaterials.some(m => !m.rawMaterialId || m.quantityConsumed <= 0)) {
            toast({ variant: 'destructive', title: 'Invalid Raw Materials', description: 'Please add at least one raw material with a valid quantity.' });
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
                quantityProduced,
                consumedMaterials
            }, user.uid, userProfile.displayName);
            
            toast({
                title: "Production Logged!",
                description: `${quantityProduced} units of ${selectedGood.name} have been added to inventory. Raw materials have been deducted.`
            });
            
            // Reset form
            setSelectedItemId('');
            setQuantityProduced(0);
            setConsumedMaterials([]);
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
        <Card>
            <CardHeader>
                <CardTitle>New Production Run</CardTitle>
                <CardDescription>Log the output of a manufacturing run to update inventory levels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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

                 <Separator />

                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-medium">Raw Materials Consumed</h3>
                            <p className="text-sm text-muted-foreground">Specify the exact materials and quantities used in this run.</p>
                        </div>
                         <Button variant="outline" size="sm" onClick={handleAddMaterial} disabled={isSubmitting}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Material
                        </Button>
                    </div>
                     <div className="space-y-4 rounded-lg border p-4">
                        {consumedMaterials.map((item, index) => (
                            <div key={index} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                                <Select onValueChange={(value) => handleMaterialChange(index, 'rawMaterialId', value)} value={item.rawMaterialId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a material..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rawMaterials.map(m => (
                                            <SelectItem key={m.id} value={m.id}>
                                                {m.name} (Available: {m.quantity.toLocaleString()} {m.unitOfMeasure})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                 <Input 
                                    type="number" 
                                    placeholder="Quantity"
                                    value={item.quantityConsumed || ''} 
                                    onChange={(e) => handleMaterialChange(index, 'quantityConsumed', e.target.value)}
                                    className="w-32"
                                />
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveMaterial(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                         {consumedMaterials.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No raw materials added.</p>}
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


'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RawMaterial, UnitOfMeasure } from '@/lib/raw-materials.data';
import { useToast } from '@/hooks/use-toast';
import { rawMaterialService } from '@/services/raw-material.service';
import { useAuth } from '@/hooks/use-auth';
import { Loader, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const UNITS_OF_MEASURE: UnitOfMeasure[] = ['kg', 'L', 'g', 'ml', 'units'];

export default function ManageMaterialsClient({ initialMaterials }: { initialMaterials: RawMaterial[] }) {
    const [materials, setMaterials] = useState(initialMaterials);
    const [changedQuantities, setChangedQuantities] = useState<Record<string, number>>({});
    const [isSaving, setIsSaving] = useState(false);
    
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newMaterialName, setNewMaterialName] = useState('');
    const [newMaterialUnit, setNewMaterialUnit] = useState<UnitOfMeasure | ''>('');
    const [newMaterialQuantity, setNewMaterialQuantity] = useState(0);
    const [isAdding, setIsAdding] = useState(false);

    const { toast } = useToast();
    const { user, userProfile } = useAuth();
    const router = useRouter();

    const handleQuantityChange = (materialId: string, value: string) => {
        const newQuantity = parseInt(value, 10);
        if (!isNaN(newQuantity)) {
            const originalMaterial = initialMaterials.find(m => m.id === materialId);
            if (originalMaterial && originalMaterial.quantity !== newQuantity) {
                setChangedQuantities(prev => ({ ...prev, [materialId]: newQuantity }));
            } else {
                 setChangedQuantities(prev => {
                     const newState = { ...prev };
                     delete newState[materialId];
                     return newState;
                 });
            }
            setMaterials(current => current.map(m => m.id === materialId ? { ...m, quantity: newQuantity } : m));
        }
    };
    
    const handleSaveQuantities = async () => {
        if (!user || !userProfile) return toast({ variant: 'destructive', title: 'Not authenticated.'});
        setIsSaving(true);
        try {
            const promises = Object.entries(changedQuantities).map(([id, quantity]) => 
                rawMaterialService.updateRawMaterialQuantity(id, quantity, user.uid, userProfile.displayName)
            );
            await Promise.all(promises);
            toast({ title: "Inventory Updated", description: "Raw material stock levels have been saved." });
            setChangedQuantities({});
             router.refresh();
        } catch (error) {
            toast({ variant: 'destructive', title: "Update Failed", description: "Could not save inventory levels." });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleAddMaterial = async () => {
        if (!user || !userProfile) return toast({ variant: 'destructive', title: 'Not authenticated.'});
        if (!newMaterialName || !newMaterialUnit) {
            return toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please provide a name and unit.' });
        }
        setIsAdding(true);
        try {
            const newMaterialId = await rawMaterialService.createRawMaterial({
                name: newMaterialName,
                unitOfMeasure: newMaterialUnit,
                quantity: newMaterialQuantity,
            }, user.uid, userProfile.displayName);
            
            const newMaterial: RawMaterial = {
                id: newMaterialId,
                name: newMaterialName,
                unitOfMeasure: newMaterialUnit,
                quantity: newMaterialQuantity,
            }
            setMaterials(prev => [...prev, newMaterial].sort((a,b) => a.name.localeCompare(b.name)));

            toast({ title: "Material Added", description: `${newMaterialName} has been added to the inventory.` });
            
            // Reset form and close dialog
            setNewMaterialName('');
            setNewMaterialUnit('');
            setNewMaterialQuantity(0);
            setIsAddDialogOpen(false);
            router.refresh();

        } catch (error) {
             toast({ variant: 'destructive', title: "Add Failed", description: "Could not add the new material." });
        } finally {
            setIsAdding(false);
        }
    };


    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Current Inventory</CardTitle>
                        <CardDescription>Directly edit quantities to set initial stock or make adjustments.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                         <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Material</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Raw Material</DialogTitle>
                                    <DialogDescription>Add a new item to the master list of raw materials.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Material Name</Label>
                                        <Input id="name" value={newMaterialName} onChange={e => setNewMaterialName(e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="quantity">Initial Quantity</Label>
                                            <Input id="quantity" type="number" value={newMaterialQuantity} onChange={e => setNewMaterialQuantity(Number(e.target.value))} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="unit">Unit</Label>
                                             <Select onValueChange={(v) => setNewMaterialUnit(v as UnitOfMeasure)} value={newMaterialUnit}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select unit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {UNITS_OF_MEASURE.map(unit => (
                                                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                             </Select>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleAddMaterial} disabled={isAdding}>
                                        {isAdding && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                        Add Material
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button size="sm" onClick={handleSaveQuantities} disabled={isSaving || Object.keys(changedQuantities).length === 0}>
                            {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Material Name</TableHead>
                            <TableHead className="w-[100px]">Unit</TableHead>
                            <TableHead className="w-[180px] text-right">Quantity In Stock</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {materials.map(mat => (
                            <TableRow key={mat.id}>
                                <TableCell className="font-medium">{mat.name}</TableCell>
                                <TableCell>{mat.unitOfMeasure}</TableCell>
                                <TableCell>
                                    <Input 
                                        type="number"
                                        className="text-right"
                                        value={mat.quantity}
                                        onChange={(e) => handleQuantityChange(mat.id, e.target.value)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

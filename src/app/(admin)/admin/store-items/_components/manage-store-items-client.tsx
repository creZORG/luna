
'use client';

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { StoreItem } from "@/lib/store-items.data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { storeItemService } from "@/services/store-item.service";
import { Loader, PlusCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ManageStoreItemsClientProps {
    initialItems: StoreItem[];
    title: string;
    description: string;
    canAddItem?: boolean;
    isReadOnly?: boolean;
}

export default function ManageStoreItemsClient({ initialItems, title, description, canAddItem = false, isReadOnly = false }: ManageStoreItemsClientProps) {
    const [items, setItems] = useState(initialItems);
    const [changedItems, setChangedItems] = useState<Record<string, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState<'Electronics' | 'Accessories' | 'Software' | ''>('');
    const [isAdding, setIsAdding] = useState(false);

    const { toast } = useToast();
    const { user, userProfile } = useAuth();

    const handleInventoryChange = (itemId: string, value: string) => {
        if (isReadOnly) return;

        const newInventory = parseInt(value, 10);
        if (!isNaN(newInventory)) {
            const originalItem = initialItems.find(i => i.id === itemId);
            if (originalItem && originalItem.inventory !== newInventory) {
                 setChangedItems(prev => ({ ...prev, [itemId]: newInventory }));
            } else {
                 setChangedItems(prev => {
                     const newState = { ...prev };
                     delete newState[itemId];
                     return newState;
                 });
            }
             setItems(currentItems => currentItems.map(i => i.id === itemId ? { ...i, inventory: newInventory } : i));
        }
    };

    const handleSave = async () => {
        if (!user || !userProfile) {
            toast({ variant: 'destructive', title: 'Not authenticated' });
            return;
        }
        if (isReadOnly) return;

        setIsSubmitting(true);
        try {
            const promises = Object.entries(changedItems).map(([itemId, inventory]) =>
                storeItemService.updateItemInventory(itemId, inventory, user.uid, userProfile.displayName)
            );
            await Promise.all(promises);
            toast({ title: "Inventory Updated!", description: "Stock levels have been saved."});
            setChangedItems({});
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: "Failed to update inventory." });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleAddItem = async () => {
        if (!user || !userProfile) return toast({ variant: 'destructive', title: 'Not authenticated.'});
        if (!newItemName || !newItemCategory) {
            return toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please provide a name and category.' });
        }
        setIsAdding(true);
        try {
            const newItem = await storeItemService.createStoreItem({
                name: newItemName,
                category: newItemCategory,
            }, user.uid, userProfile.displayName);

            setItems(prev => [...prev, newItem].sort((a,b) => a.name.localeCompare(b.name)));
            toast({ title: "Item Added", description: `${newItemName} has been added to the store.` });
            
            setNewItemName('');
            setNewItemCategory('');
            setIsAddDialogOpen(false);

        } catch (error) {
             toast({ variant: 'destructive', title: "Add Failed", description: "Could not add the new item." });
        } finally {
            setIsAdding(false);
        }
    };


    return (
         <Card>
            <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        {canAddItem && (
                            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline"><PlusCircle className="mr-2 h-4 w-4"/>Add Item</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Equipment/Supply</DialogTitle>
                                        <DialogDescription>Create a new item that can be requested by staff.</DialogDescription>
                                    </DialogHeader>
                                     <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Item Name</Label>
                                            <Input id="name" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="e.g., Ring Light Stand" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category</Label>
                                            <Select onValueChange={(v) => setNewItemCategory(v as any)} value={newItemCategory}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Electronics">Electronics</SelectItem>
                                                    <SelectItem value="Accessories">Accessories</SelectItem>
                                                    <SelectItem value="Software">Software</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                        <Button onClick={handleAddItem} disabled={isAdding}>
                                            {isAdding && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                            Create Item
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                        {!isReadOnly && (
                            <Button size="sm" onClick={handleSave} disabled={isSubmitting || Object.keys(changedItems).length === 0}>
                                {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead className="w-[150px]">Category</TableHead>
                            <TableHead className="w-[180px] text-right">Quantity In Stock</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell><Badge variant="secondary">{item.category}</Badge></TableCell>
                                <TableCell className="text-right">
                                     <Input 
                                        type="number" 
                                        className="text-right"
                                        value={item.inventory} 
                                        onChange={(e) => handleInventoryChange(item.id, e.target.value)}
                                        readOnly={isReadOnly}
                                        disabled={isReadOnly}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                         {items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    No items in this category.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

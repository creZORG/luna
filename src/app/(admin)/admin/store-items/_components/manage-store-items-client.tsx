
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
import { Loader } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface ManageStoreItemsClientProps {
    initialItems: StoreItem[];
    title: string;
    description: string;
}

export default function ManageStoreItemsClient({ initialItems, title, description }: ManageStoreItemsClientProps) {
    const [items, setItems] = useState(initialItems);
    const [changedItems, setChangedItems] = useState<Record<string, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { user, userProfile } = useAuth();

    const handleInventoryChange = (itemId: string, value: string) => {
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

    return (
         <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    <Button onClick={handleSave} disabled={isSubmitting || Object.keys(changedItems).length === 0}>
                        {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead className="w-[150px]">Category</TableHead>
                            <TableHead className="w-[150px] text-right">Quantity In Stock</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.category}</TableCell>
                                <TableCell className="text-right">
                                    <Input 
                                        type="number" 
                                        className="text-right"
                                        value={item.inventory} 
                                        onChange={(e) => handleInventoryChange(item.id, e.target.value)}
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

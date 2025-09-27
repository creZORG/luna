
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { StoreItem } from '@/lib/store-items.data';
import { useToast } from '@/hooks/use-toast';
import { storeItemService } from '@/services/store-item.service';
import { Loader } from 'lucide-react';

interface EquipmentRequestClientProps {
    items: StoreItem[];
}

export default function EquipmentRequestClient({ items }: EquipmentRequestClientProps) {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleCheckboxChange = (itemId: string) => {
        setSelectedItems(prev => 
            prev.includes(itemId) 
            ? prev.filter(id => id !== itemId) 
            : [...prev, itemId]
        );
    }

    const handleSubmit = async () => {
        if (selectedItems.length === 0) {
            toast({
                variant: 'destructive',
                title: "No items selected",
                description: "Please select at least one item to request.",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await storeItemService.createItemRequests(selectedItems);
            toast({
                title: "Request Submitted!",
                description: "Your equipment request has been sent to the admin for approval.",
            });
            setSelectedItems([]);
        } catch (error) {
            console.error("Error submitting request:", error);
            toast({
                variant: 'destructive',
                title: "Submission Error",
                description: "Could not submit your request. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Request Equipment</CardTitle>
                <CardDescription>Select the items you need from the company store for your marketing activities.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {items.map(item => (
                            <div key={item.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                                <Checkbox 
                                    id={item.id} 
                                    onCheckedChange={() => handleCheckboxChange(item.id)}
                                    checked={selectedItems.includes(item.id)}
                                />
                                <label
                                    htmlFor={item.id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {item.name}
                                </label>
                            </div>
                        ))}
                    </div>
                    <Button onClick={handleSubmit} disabled={isSubmitting || selectedItems.length === 0}>
                        {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Submit Request
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

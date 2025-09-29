'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FieldSalesFormProps {
    onProcessSale: (customerName: string, customerPhone: string, customerEmail: string) => void;
    isProcessing: boolean;
}

export default function FieldSalesForm({ onProcessSale, isProcessing }: FieldSalesFormProps) {
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerName || !customerPhone || !customerEmail) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please enter all customer details.' });
            return;
        }

        onProcessSale(customerName, customerPhone, customerEmail);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="customer-name">Customer Name</Label>
                <Input
                    id="customer-name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g., John Doe"
                    disabled={isProcessing}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="customer-phone">Customer Phone</Label>
                <Input
                    id="customer-phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g., 0712345678"
                    disabled={isProcessing}
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="customer-email">Customer Email</Label>
                <Input
                    id="customer-email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g., customer@email.com"
                    disabled={isProcessing}
                />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                {isProcessing ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Proceed to Payment
            </Button>
        </form>
    );
}

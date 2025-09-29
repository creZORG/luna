'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FieldSalesFormProps {
    onProcessSale: (customerName: string, customerPhone: string) => void;
    isProcessing: boolean;
}

export default function FieldSalesForm({ onProcessSale, isProcessing }: FieldSalesFormProps) {
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerName || !customerPhone) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please enter customer name and phone number.' });
            return;
        }

        // Minimal check, the backend will handle robust formatting.
        if (customerPhone.trim().length < 9) {
             toast({ variant: 'destructive', title: 'Invalid Phone Number', description: 'Please enter a valid Kenyan phone number.' });
            return;
        }

        onProcessSale(customerName, customerPhone);
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
                <Label htmlFor="customer-phone">Customer Phone (for M-Pesa)</Label>
                <Input
                    id="customer-phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g., 0712345678"
                    disabled={isProcessing}
                />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                {isProcessing ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Initiate STK Push
            </Button>
        </form>
    );
}

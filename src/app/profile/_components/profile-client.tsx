'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, User, Package, Shield, Mail } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Placeholder data for orders
const mockOrders = [
    { id: 'ORD-001', date: '2024-07-15', total: 450.00, status: 'Shipped' },
    { id: 'ORD-002', date: '2024-07-18', total: 1200.50, status: 'Processing' },
    { id: 'ORD-003', date: '2024-07-20', total: 290.00, status: 'Delivered' },
];


export default function ProfileClient() {
    const { user, userProfile, loading } = useAuth();
    
    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader className="h-8 w-8 animate-spin" />
            </div>
        )
    }
    
    // We can assume if there's a user but no userProfile, they are a regular customer
    // Or if they have a userProfile with no roles.
    const displayName = userProfile?.displayName || user.displayName || user.email;
    const email = user.email;

    return (
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>My Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <User className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold">{displayName}</p>
                                <p className="text-sm text-muted-foreground">{email}</p>
                            </div>
                        </div>
                         <Separator />
                         <div className="text-sm text-muted-foreground space-y-2">
                             <p>This is your personal account area. Here you can view your order history and manage your personal details.</p>
                         </div>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
                 <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                             <Package className="w-6 h-6 text-primary" />
                             <div>
                                <CardTitle>My Orders</CardTitle>
                                <CardDescription>A history of all your purchases with us.</CardDescription>
                             </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockOrders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.id}</TableCell>
                                        <TableCell>{order.date}</TableCell>
                                        <TableCell>
                                            <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'} className={order.status === 'Delivered' ? 'bg-green-600/80' : ''}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">Ksh {order.total.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         {mockOrders.length === 0 && (
                            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                                <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

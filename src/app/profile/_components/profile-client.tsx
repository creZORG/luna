
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
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { Order, orderService } from '@/services/order.service';
import { format } from 'date-fns';

export default function ProfileClient() {
    const { user, userProfile, loading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    
    useEffect(() => {
        if (user) {
            orderService.getOrdersByUserId(user.uid)
                .then(setOrders)
                .catch(err => console.error("Failed to fetch orders", err))
                .finally(() => setOrdersLoading(false));
        } else if (!loading) {
            setOrdersLoading(false);
        }
    }, [user, loading]);

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader className="h-8 w-8 animate-spin" />
            </div>
        )
    }
    
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
                         {ordersLoading ? (
                             <div className="flex justify-center py-10">
                                <Loader className="h-8 w-8 animate-spin" />
                             </div>
                         ) : (
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
                                    {orders.length > 0 ? (
                                        orders.map(order => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-mono text-xs">{order.id?.substring(0, 7).toUpperCase()}</TableCell>
                                                <TableCell>{format(order.orderDate.toDate(), 'PP')}</TableCell>
                                                <TableCell>
                                                    <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className={order.status === 'delivered' ? 'bg-green-600/80' : ''}>
                                                        {order.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">Ksh {order.totalAmount.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                You haven't placed any orders yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                         )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

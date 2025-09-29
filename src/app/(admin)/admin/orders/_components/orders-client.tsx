

'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Order, OrderStatus, orderService } from '@/services/order.service';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader, PackageCheck, Send, Truck } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface OrdersClientProps {
  initialOrders: Order[];
}

const getStatusBadge = (status: Order['status']) => {
    const variants = {
        'pending-payment': 'secondary',
        'paid': 'default',
        'processing': 'default',
        'shipped': 'default',
        'delivered': 'default',
        'cancelled': 'destructive',
    };
    const colors = {
        'paid': 'bg-blue-500/80',
        'processing': 'bg-yellow-500/80 text-black',
        'shipped': 'bg-purple-500/80',
        'delivered': 'bg-green-600/80',
    }

    return (
        <Badge
            variant={variants[status] as any}
            className={cn('capitalize', colors[status as keyof typeof colors])}
        >
            {status}
        </Badge>
    );
};

function OrderList({ orders, onStatusUpdate }: { orders: Order[]; onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void; }) {
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const getDate = (timestamp: any): Date => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    return new Date();
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (!user || !userProfile) {
        toast({variant: 'destructive', title: 'Authentication Error'});
        return;
    }
    setUpdatingOrderId(orderId);
    try {
        await orderService.updateOrderStatus(orderId, newStatus, user.uid, userProfile.displayName);
        onStatusUpdate(orderId, newStatus);
        toast({ title: 'Order Status Updated!', description: `Order has been marked as ${newStatus}.`});
    } catch (error) {
        toast({variant: 'destructive', title: 'Update Failed', description: 'Could not update order status.'});
    } finally {
        setUpdatingOrderId(null);
    }
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">No orders in this category.</p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="w-full space-y-4">
        {orders.map((order) => {
            const orderDate = getDate(order.orderDate);
            const isUpdating = updatingOrderId === order.id;

            return (
                <AccordionItem
                    key={order.id}
                    value={order.id!}
                    className="border bg-card rounded-lg overflow-hidden"
                >
                    <AccordionTrigger className="p-4 hover:no-underline data-[state=open]:border-b">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 sm:gap-8">
                        <div className="text-left flex-1">
                        <p className="font-semibold">
                            Order #{order.id!.substring(0, 7).toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {order.customerName}
                        </p>
                        </div>
                        <div className="text-left flex-1">
                            <p className="font-semibold">
                                {format(orderDate, 'PPP p')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {formatDistanceToNow(orderDate, { addSuffix: true })}
                            </p>
                        </div>
                        <div className="text-left flex-1">
                            <p className="font-semibold text-primary">
                                Ksh {order.totalAmount.toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {order.items.length} item(s)
                            </p>
                        </div>
                        <div className='flex-shrink-0'>
                            {getStatusBadge(order.status)}
                        </div>
                    </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 bg-muted/50">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-4 lg:col-span-1">
                            <h4 className="font-semibold">Items Ordered</h4>
                            {order.items.map(item => (
                                <div key={`${item.productId}-${item.size}`} className="flex items-center gap-4">
                                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-background">
                                        <Image
                                        src={item.imageUrl || '/placeholder.svg'}
                                        alt={item.productName}
                                        fill
                                        className="object-cover"
                                        />
                                        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                            {item.quantity}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.productName}</p>
                                        <p className="text-xs text-muted-foreground">{item.size}</p>
                                    </div>
                                    <p className="font-semibold text-sm">
                                        Ksh {(item.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-4 lg:col-span-1">
                            <h4 className="font-semibold">Customer & Delivery</h4>
                            <ul className="text-sm text-muted-foreground space-y-2">
                                <li><strong>Name:</strong> {order.customerName}</li>
                                <li><strong>Email:</strong> {order.customerEmail}</li>
                                <li><strong>Phone:</strong> {order.customerPhone}</li>
                                 <li className="capitalize"><strong>Method:</strong> {order.deliveryMethod?.replace('-', ' ')}</li>
                                <li><strong>Address:</strong> {order.shippingAddress}</li>
                                {order.county && <li><strong>County:</strong> {order.county}</li>}
                                {order.deliveryNotes && <li><strong>Notes:</strong> {order.deliveryNotes}</li>}
                            </ul>
                        </div>
                        <div className="space-y-4 lg:col-span-1">
                            <h4 className="font-semibold">Order Actions</h4>
                            <div className="flex flex-col gap-2">
                                {order.status === 'paid' && <Button onClick={() => handleUpdateStatus(order.id!, 'processing')} disabled={isUpdating}>{isUpdating ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}Start Processing</Button>}
                                {order.status === 'processing' && <Button onClick={() => handleUpdateStatus(order.id!, 'shipped')} disabled={isUpdating}>{isUpdating ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : <Truck className="mr-2 h-4 w-4"/>}Mark as Shipped</Button>}
                                {order.status === 'shipped' && <Button onClick={() => handleUpdateStatus(order.id!, 'delivered')} disabled={isUpdating}>{isUpdating ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : <PackageCheck className="mr-2 h-4 w-4"/>}Mark as Delivered</Button>}
                                {order.status === 'delivered' && <p className="text-sm text-green-600 font-medium">Order completed.</p>}
                            </div>
                        </div>
                    </div>
                    </AccordionContent>
                </AccordionItem>
            )
        })}
    </Accordion>
  );
}


export default function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    setOrders(currentOrders => 
        currentOrders.map(o => o.id === orderId ? {...o, status: newStatus} : o)
    );
  };
  
  const ordersByStatus = useMemo(() => {
    return orders.reduce((acc, order) => {
        const status = order.status;
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(order);
        return acc;
    }, {} as Record<OrderStatus, Order[]>);
  }, [orders]);
  
  const TABS: OrderStatus[] = ['paid', 'processing', 'shipped', 'delivered'];

  return (
    <Tabs defaultValue="paid">
        <TabsList className="grid w-full grid-cols-4">
            {TABS.map(tab => (
                <TabsTrigger key={tab} value={tab} className="capitalize">{tab}</TabsTrigger>
            ))}
        </TabsList>
        {TABS.map(tab => (
            <TabsContent key={tab} value={tab}>
                <OrderList orders={ordersByStatus[tab] || []} onStatusUpdate={handleStatusUpdate} />
            </TabsContent>
        ))}
    </Tabs>
  );
}

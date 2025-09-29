
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/services/order.service';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Image from 'next/image';

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
        'processing': 'bg-yellow-500/80',
        'shipped': 'bg-purple-500/80',
        'delivered': 'bg-green-600/80',
    }

    return (
        <Badge
            variant={variants[status] as any}
            className={cn(colors[status as keyof typeof colors])}
        >
            {status}
        </Badge>
    );
};

export default function OrdersClient({ initialOrders }: OrdersClientProps) {

  const getDate = (timestamp: any): Date => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    return new Date();
  }

  return (
    <Accordion type="multiple" className="w-full space-y-4">
        {initialOrders.map((order) => {
            const orderDate = getDate(order.orderDate);
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
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
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
                        <div className="space-y-4">
                            <h4 className="font-semibold">Customer & Delivery</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li><strong>Name:</strong> {order.customerName}</li>
                                <li><strong>Email:</strong> {order.customerEmail}</li>
                                <li><strong>Phone:</strong> {order.customerPhone}</li>
                                <li><strong>Address:</strong> {order.shippingAddress}</li>
                            </ul>
                        </div>
                    </div>
                    </AccordionContent>
                </AccordionItem>
            )
        })}
        {initialOrders.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No orders found yet.</p>
        </div>
        )}
    </Accordion>
  );
}

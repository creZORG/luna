
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PurchaseOrder } from '@/lib/purchase-orders.data';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface OrderHistoryClientProps {
  initialOrders: PurchaseOrder[];
}

export default function OrderHistoryClient({
  initialOrders,
}: OrderHistoryClientProps) {

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
    <Card>
      <CardHeader>
        <CardTitle>Purchase Order History</CardTitle>
        <CardDescription>
          A log of all raw material purchase orders sent to suppliers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-4">
          {initialOrders.map((order) => (
            <AccordionItem
              key={order.id}
              value={order.id}
              className="border bg-card rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="p-4 hover:no-underline data-[state=open]:border-b">
                <div className="grid grid-cols-4 items-center w-full gap-4 text-left">
                  <div className="col-span-2">
                    <p className="font-semibold">
                      PO #{order.id.substring(0, 6).toUpperCase()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      To: {order.supplierName}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">
                      {format(getDate(order.orderDate), 'PPP')}
                    </p>
                    <p className="text-sm text-muted-foreground">Order Date</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={cn(
                        order.status === 'completed' && 'bg-green-600/80',
                        order.status === 'ordered' && 'bg-blue-500/80'
                      )}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 bg-muted/50">
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.rawMaterialId}>
                          <TableCell>{item.rawMaterialName}</TableCell>
                          <TableCell className="text-right">
                            {item.quantity} {item.unit}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {order.notes && (
                    <div className="text-sm text-muted-foreground border-t pt-4 mt-4">
                        <strong>Notes:</strong> {order.notes}
                    </div>
                  )}
                   <div className="text-xs text-muted-foreground border-t pt-4 mt-4">
                       Ordered by {order.orderedBy.userName}
                    </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {initialOrders.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No purchase orders found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

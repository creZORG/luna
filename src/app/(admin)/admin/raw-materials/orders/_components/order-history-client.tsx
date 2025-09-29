
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
                <div className="flex justify-between items-center w-full">
                  <div className="text-left">
                    <p className="font-semibold">
                      PO #{order.id.substring(0, 6).toUpperCase()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      To: {order.supplierName}
                    </p>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="font-semibold">
                      {format(order.orderDate.toDate(), 'PPP')}
                    </p>
                    <p className="text-sm text-muted-foreground">Order Date</p>
                  </div>
                  <div>
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
              <AccordionContent className="p-4">
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
                    <div className="text-sm text-muted-foreground">
                        <strong>Notes:</strong> {order.notes}
                    </div>
                  )}
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

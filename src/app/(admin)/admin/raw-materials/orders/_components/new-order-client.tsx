
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { RawMaterial } from '@/lib/raw-materials.data';
import { PurchaseOrderItem } from '@/lib/purchase-orders.data';
import { PlusCircle, Trash2, CalendarIcon, Loader, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { purchaseOrderService } from '@/services/purchase-order.service';
import { sendPurchaseOrder } from '@/ai/flows/send-purchase-order-flow';
import { useRouter } from 'next/navigation';

interface NewOrderClientProps {
  rawMaterials: RawMaterial[];
}

export default function NewOrderClient({ rawMaterials }: NewOrderClientProps) {
  const [supplierName, setSupplierName] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [expectedDate, setExpectedDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const router = useRouter();


  const handleAddItem = () => {
    const defaultMaterial = rawMaterials[0];
    if (!defaultMaterial) return;

    setOrderItems([
      ...orderItems,
      {
        rawMaterialId: defaultMaterial.id,
        rawMaterialName: defaultMaterial.name,
        quantity: 1,
        unit: defaultMaterial.unitOfMeasure,
      },
    ]);
  };

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: string) => {
    const newItems = [...orderItems];
    const item = newItems[index];

    if (field === 'rawMaterialId') {
      const selectedMaterial = rawMaterials.find((m) => m.id === value);
      if (selectedMaterial) {
        item.rawMaterialId = selectedMaterial.id;
        item.rawMaterialName = selectedMaterial.name;
        item.unit = selectedMaterial.unitOfMeasure;
      }
    } else if (field === 'quantity') {
      item.quantity = Number(value);
    }
    
    setOrderItems(newItems);
  };
  
  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
      if (!supplierName || !supplierEmail || orderItems.length === 0) {
          toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill in supplier details and add at least one item.'});
          return;
      }
      if (!user || !userProfile) {
          toast({ variant: 'destructive', title: 'Authentication Error'});
          return;
      }

      setIsSubmitting(true);
      try {
          // 1. Create the PO in the database
          const orderId = await purchaseOrderService.createPurchaseOrder({
              supplierName,
              supplierEmail,
              items: orderItems,
              notes,
              expectedDeliveryDate: expectedDate,
              orderedBy: {
                  userId: user.uid,
                  userName: userProfile.displayName,
              }
          });

          // 2. Send the PO email via the AI flow
          await sendPurchaseOrder({
              orderId,
              supplierName,
              supplierEmail,
              items: orderItems,
              notes,
              expectedDeliveryDate: expectedDate ? format(expectedDate, 'PPP') : undefined,
              requesterName: userProfile.displayName,
          });

          toast({ title: "Order Sent!", description: `Purchase order #${orderId} has been sent to ${supplierName}.`});
          
          // Reset form
          setSupplierName('');
          setSupplierEmail('');
          setExpectedDate(undefined);
          setNotes('');
          setOrderItems([]);
          router.refresh();

      } catch (error) {
           console.error("Failed to submit purchase order:", error);
           toast({ variant: 'destructive', title: 'Submission Failed', description: 'There was an error creating or sending the purchase order.'});
      } finally {
          setIsSubmitting(false);
      }
  };


  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Order Details</CardTitle>
            <CardDescription>
              Fill in the supplier information and add the raw materials you
              want to order.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier-name">Supplier Name</Label>
                <Input
                  id="supplier-name"
                  placeholder="e.g., Chem Supplies Inc."
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-email">Supplier Email</Label>
                <Input
                  id="supplier-email"
                  type="email"
                  placeholder="orders@chemsupplies.com"
                  value={supplierEmail}
                  onChange={(e) => setSupplierEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
                 <Label>Order Items</Label>
                 <div className="space-y-4 rounded-lg border p-4">
                    {orderItems.map((item, index) => (
                        <div key={index} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
                            <select 
                                value={item.rawMaterialId} 
                                onChange={(e) => handleItemChange(index, 'rawMaterialId', e.target.value)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                             <Input 
                                type="number" 
                                value={item.quantity} 
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                className="w-24"
                            />
                            <span className="text-sm text-muted-foreground">{item.unit}</span>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={handleAddItem}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                 </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" placeholder="e.g., Please include certificate of analysis." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Scheduling & Submission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label>Expected Delivery Date (Optional)</Label>
                <Popover>
                <PopoverTrigger asChild>
                    <Button
                    variant={'outline'}
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !expectedDate && 'text-muted-foreground'
                    )}
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expectedDate ? format(expectedDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                    mode="single"
                    selected={expectedDate}
                    onSelect={setExpectedDate}
                    initialFocus
                    />
                </PopoverContent>
                </Popover>
            </div>
            <Button className="w-full" size="lg" onClick={handleSubmit} disabled={isSubmitting || orderItems.length === 0}>
                {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Save & Email Order
            </Button>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Current Inventory</CardTitle>
                <CardDescription>A quick look at current stock levels.</CardDescription>
            </CardHeader>
             <CardContent>
                 <div className="max-h-60 overflow-y-auto pr-2">
                     <ul className="space-y-2 text-sm">
                         {rawMaterials.map(m => (
                             <li key={m.id} className="flex justify-between">
                                 <span className="text-muted-foreground">{m.name}</span>
                                 <span className="font-medium">{m.quantity.toLocaleString()} {m.unit}</span>
                            </li>
                         ))}
                     </ul>
                 </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

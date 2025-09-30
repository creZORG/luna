
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserProfile } from '@/services/user.service';
import { StoreItem } from '@/lib/store-items.data';
import { ReconciliationLog, salesService } from '@/services/sales.service';
import { useToast } from '@/hooks/use-toast';
import { Loader, Send, User, Calculator, Printer } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

interface ReconciliationClientProps {
    assignableStock: StoreItem[];
    salespeople: UserProfile[];
}

type LogData = Omit<ReconciliationLog, 'date' | 'salespersonId' | 'salespersonName' | 'operatorId' | 'operatorName' | 'qtySold'>;

export default function ReconciliationClient({ assignableStock, salespeople }: ReconciliationClientProps) {
    const [selectedSalespersonId, setSelectedSalespersonId] = useState<string>('');
    const [logs, setLogs] = useState<Map<string, LogData>>(new Map());
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { toast } = useToast();
    const { user: operator, userProfile: operatorProfile } = useAuth();
    const router = useRouter();

    const handleLogChange = (itemId: string, field: keyof LogData, value: string) => {
        const numericValue = parseInt(value, 10);
        if (isNaN(numericValue) && value !== '') return;
        
        const key = itemId;
        setLogs(prev => {
            const newLogs = new Map(prev);
            const existingLog = newLogs.get(key) || {
                itemId,
                qtyIssued: 0,
                qtyReturned: 0,
                samples: 0,
                defects: 0,
            };
            newLogs.set(key, { ...existingLog, [field]: numericValue || 0 });
            return newLogs;
        });
    };
    
    const handleSubmit = async () => {
        if (!selectedSalespersonId) {
            toast({ variant: 'destructive', title: 'No Salesperson Selected' });
            return;
        }
        if (!operator || !operatorProfile) {
            toast({ variant: 'destructive', title: 'Authentication Error' });
            return;
        }
        if (logs.size === 0) {
            toast({ variant: 'destructive', title: 'No Data Entered' });
            return;
        }
        
        setIsSubmitting(true);
        const selectedSalesperson = salespeople.find(s => s.uid === selectedSalespersonId);
        if (!selectedSalesperson) {
             toast({ variant: 'destructive', title: 'Invalid Salesperson' });
             setIsSubmitting(false);
             return;
        }

        try {
            const logsToSubmit = Array.from(logs.values()).filter(
                log => log.qtyIssued > 0 || log.qtyReturned > 0 || log.samples > 0 || log.defects > 0
            );
            
            await salesService.createReconciliationLogs(
                logsToSubmit,
                selectedSalesperson.uid,
                selectedSalesperson.displayName,
                operator.uid,
                operatorProfile.displayName
            );

            toast({
                title: 'Reconciliation Log Submitted!',
                description: `Stock movements for ${selectedSalesperson.displayName} have been recorded.`
            });
            
            // Reset form
            setLogs(new Map());
            setSelectedSalespersonId('');
            router.refresh();

        } catch (error) {
            console.error("Error submitting reconciliation logs:", error);
            toast({ variant: 'destructive', title: 'Submission Error', description: 'Could not submit reconciliation logs.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handlePrint = () => {
        window.print();
    }

    const selectedSalespersonName = useMemo(() => {
        return salespeople.find(s => s.uid === selectedSalespersonId)?.displayName || '...';
    }, [selectedSalespersonId, salespeople]);

    return (
        <div className="grid gap-6 print:gap-0">
            <Card className="print:shadow-none print:border-none">
                <CardHeader>
                    <CardTitle>Select Salesperson</CardTitle>
                    <CardDescription>Choose the salesperson you are reconciling stock for.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <div className="max-w-sm">
                        <Select onValueChange={setSelectedSalespersonId} value={selectedSalespersonId}>
                            <SelectTrigger>
                                <User className="mr-2 h-4 w-4 text-muted-foreground"/>
                                <SelectValue placeholder="Select a salesperson..." />
                            </SelectTrigger>
                            <SelectContent>
                                {salespeople.map(person => (
                                    <SelectItem key={person.uid} value={person.uid}>
                                        {person.displayName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {selectedSalespersonId && (
                <Card id="reconciliation-card" className="print:shadow-none print:border-none">
                    <CardHeader>
                         <div className="flex justify-between items-start">
                             <div>
                                <CardTitle>Log Stock Movement for {selectedSalespersonName}</CardTitle>
                                <CardDescription>Enter the quantities for each product variant. The system will calculate sales.</CardDescription>
                             </div>
                             <div className="flex gap-2 print:hidden">
                                <Button variant="outline" onClick={handlePrint} disabled={logs.size === 0}>
                                    <Printer className="mr-2 h-4 w-4"/>
                                    Print
                                </Button>
                                <Button onClick={handleSubmit} disabled={isSubmitting || logs.size === 0}>
                                    {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                                    Submit Log
                                </Button>
                             </div>
                         </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="w-40">Qty Issued</TableHead>
                                    <TableHead className="w-40">Qty Returned</TableHead>
                                    <TableHead className="w-40">Samples Given</TableHead>
                                    <TableHead className="w-40">Defects</TableHead>
                                    <TableHead className="w-40 text-right font-bold">Qty Sold (Auto)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assignableStock.map(item => {
                                    const logData = logs.get(item.id) || { qtyIssued: 0, qtyReturned: 0, samples: 0, defects: 0 };
                                    const qtySold = logData.qtyIssued - logData.qtyReturned - logData.samples - logData.defects;
                                    
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>
                                                <Input type="number" placeholder="0" value={logData.qtyIssued || ''} onChange={e => handleLogChange(item.id, 'qtyIssued', e.target.value)} />
                                            </TableCell>
                                             <TableCell>
                                                <Input type="number" placeholder="0" value={logData.qtyReturned || ''} onChange={e => handleLogChange(item.id, 'qtyReturned', e.target.value)} />
                                            </TableCell>
                                             <TableCell>
                                                <Input type="number" placeholder="0" value={logData.samples || ''} onChange={e => handleLogChange(item.id, 'samples', e.target.value)} />
                                            </TableCell>
                                             <TableCell>
                                                <Input type="number" placeholder="0" value={logData.defects || ''} onChange={e => handleLogChange(item.id, 'defects', e.target.value)} />
                                            </TableCell>
                                             <TableCell className="text-right">
                                                 <div className="flex items-center justify-end gap-2">
                                                    <Calculator className="h-4 w-4 text-muted-foreground"/>
                                                    <span className={`font-bold text-lg ${qtySold < 0 ? 'text-destructive' : 'text-primary'}`}>{qtySold}</span>
                                                 </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

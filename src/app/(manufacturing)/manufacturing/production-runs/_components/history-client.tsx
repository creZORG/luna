
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProductionRun } from '@/services/manufacturing.service';
import { format } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface ProductionHistoryClientProps {
    initialRuns: ProductionRun[];
}

export default function ProductionHistoryClient({ initialRuns }: ProductionHistoryClientProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Production History</CardTitle>
                <CardDescription>A log of all past manufacturing runs.</CardDescription>
            </CardHeader>
            <CardContent>
                {initialRuns.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">No production runs have been logged yet.</p>
                    </div>
                ) : (
                     <Accordion type="multiple" className="w-full space-y-4">
                        {initialRuns.map((run) => (
                            <AccordionItem key={run.id} value={run.id} className="border bg-card rounded-lg overflow-hidden">
                                <AccordionTrigger className="p-4 hover:no-underline data-[state=open]:border-b">
                                    <div className="grid grid-cols-3 items-center w-full gap-4 text-left">
                                        <div>
                                            <p className="font-semibold">{run.productName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(run.createdAt.toDate(), 'PP p')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-semibold">{run.quantityProduced.toLocaleString()}</p>
                                            <p className="text-sm text-muted-foreground">Units Produced</p>
                                        </div>
                                         <div>
                                            <p className="font-semibold">{run.userName}</p>
                                            <p className="text-sm text-muted-foreground">Operator</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 bg-muted/50">
                                    <h4 className="font-semibold mb-2">Raw Materials Consumed</h4>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Material</TableHead>
                                                <TableHead className="text-right">Quantity Consumed</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {run.consumedMaterials.map((material, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{material.rawMaterialName}</TableCell>
                                                    <TableCell className="text-right">{material.quantityConsumed.toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </CardContent>
        </Card>
    );
}

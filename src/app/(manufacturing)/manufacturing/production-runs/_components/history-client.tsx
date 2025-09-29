
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProductionRun } from '@/services/manufacturing.service';
import { format } from 'date-fns';

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
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Operator</TableHead>
                            <TableHead className="text-right">Quantity Produced</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialRuns.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No production runs have been logged yet.
                                </TableCell>
                            </TableRow>
                        )}
                        {initialRuns.map(run => (
                            <TableRow key={run.id}>
                                <TableCell>{format(run.createdAt.toDate(), 'PP p')}</TableCell>
                                <TableCell className="font-medium">{run.productName}</TableCell>
                                <TableCell>{run.userName}</TableCell>
                                <TableCell className="text-right font-bold">{run.quantityProduced.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

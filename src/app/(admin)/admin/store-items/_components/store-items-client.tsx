
'use client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StoreItem, StoreItemRequest } from "@/lib/store-items.data";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface StoreItemsClientProps {
    items: StoreItem[];
    initialRequests: StoreItemRequest[];
}

export default function StoreItemsClient({ items, initialRequests }: StoreItemsClientProps) {

    const getItemName = (itemId: string) => {
        return items.find(i => i.id === itemId)?.name ?? 'Unknown Item';
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Equipment Requests</CardTitle>
                <CardDescription>
                    Review and approve equipment requests from various departments.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Requester</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialRequests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No equipment requests yet.
                                </TableCell>
                            </TableRow>
                        )}
                        {initialRequests.map(req => (
                            <TableRow key={req.id}>
                                <TableCell className="font-medium">{getItemName(req.itemId)}</TableCell>
                                <TableCell>{req.requesterName}</TableCell>
                                <TableCell>{req.department}</TableCell>
                                <TableCell>{format(new Date(req.requestDate.seconds * 1000), 'PPP')}</TableCell>
                                <TableCell>
                                    <Badge 
                                        variant={req.status === 'approved' ? 'default' : req.status === 'rejected' ? 'destructive' : 'secondary'}
                                        className={cn(req.status === 'approved' && 'bg-green-600/80')}
                                    >
                                        {req.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {/* Action buttons would go here */}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

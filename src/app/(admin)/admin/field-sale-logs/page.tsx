
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { fieldSaleLogService, FieldSaleLog } from "@/services/field-sale-log.service"
import { format } from 'date-fns';

export default async function FieldSaleLogsPage() {
  const logs: FieldSaleLog[] = await fieldSaleLogService.getLogs();

  const getGoogleMapsLink = (lat: number, lng: number) => {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Field Sale Location Logs</CardTitle>
        <CardDescription>
          A log of all successful in-person sales and the location where they occurred.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Salesperson</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Location</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                 {logs.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            No field sales have been logged yet.
                        </TableCell>
                    </TableRow>
                )}
                {logs.map((log) => (
                    <TableRow key={log.id}>
                        <TableCell>
                            {format(log.timestamp.toDate(), 'PP p')}
                        </TableCell>
                         <TableCell>{log.salespersonName}</TableCell>
                        <TableCell>
                            <div>{log.customerName}</div>
                            <div className="text-xs text-muted-foreground">{log.customerPhone}</div>
                        </TableCell>
                        <TableCell>
                            <a href={getGoogleMapsLink(log.latitude, log.longitude)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                View on Map
                            </a>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}


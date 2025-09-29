
import { financeService, FinanceData } from '@/services/finance.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, UserCheck, Undo2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Order } from '@/services/order.service';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function StatCard({ title, value, icon: Icon, description }: { title: string; value: string; icon: React.ElementType; description: string; }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

function getStatusBadge(status: Order['status']) {
    const variants = {
        'pending-payment': 'secondary',
        'paid': 'default',
        'processing': 'default',
        'ready-for-dispatch': 'default',
        'shipped': 'default',
        'delivered': 'default',
        'cancelled': 'destructive',
        'return-pending': 'destructive',
        'returned': 'destructive'
    };
    const colors = {
        'paid': 'bg-blue-500/80',
        'processing': 'bg-yellow-500/80 text-black',
        'ready-for-dispatch': 'bg-orange-500/80',
        'shipped': 'bg-purple-500/80',
        'delivered': 'bg-green-600/80',
        'return-pending': 'bg-pink-600/80',
        'returned': 'bg-red-700/80'
    }

    return (
        <Badge
            variant={variants[status] as any}
            className={cn('capitalize', colors[status as keyof typeof colors])}
        >
            {status.replace(/-/g, ' ')}
        </Badge>
    );
};


function OrderTable({ orders, showSalesperson }: { orders: Order[], showSalesperson?: boolean }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    {showSalesperson && <TableHead>Salesperson</TableHead>}
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={showSalesperson ? 6 : 5} className="h-24 text-center">
                            No sales recorded in this category yet.
                        </TableCell>
                    </TableRow>
                )}
                {orders.map(order => (
                    <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">{order.id?.substring(0, 7).toUpperCase()}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{format(order.orderDate.toDate(), 'PPP')}</TableCell>
                        {showSalesperson && <TableCell>{order.salespersonName || 'N/A'}</TableCell>}
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right font-medium">Ksh {order.totalAmount.toLocaleString()}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default async function FinanceDashboard() {
    const data: FinanceData = await financeService.getFinanceDashboardData();

    return (
        <div className="grid gap-6">
             <div>
                <h1 className="text-3xl font-bold">Finance Portal</h1>
                <p className="text-muted-foreground">A consolidated overview of all company revenue streams and financial operations.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-4">
                <StatCard 
                    title="Total Revenue"
                    value={`Ksh ${data.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    description="Combined revenue from all sales channels"
                />
                <StatCard 
                    title="Online Sales Revenue"
                    value={`Ksh ${data.onlineSalesRevenue.toLocaleString()}`}
                    icon={ShoppingCart}
                    description={`From ${data.onlineOrders.length} orders`}
                />
                <StatCard 
                    title="Field Sales Revenue"
                    value={`Ksh ${data.fieldSalesRevenue.toLocaleString()}`}
                    icon={UserCheck}
                    description={`From ${data.fieldSalesOrders.length} orders`}
                />
                 <StatCard 
                    title="Pending Refunds"
                    value={data.ordersForRefund.length.toString()}
                    icon={Undo2}
                    description="Orders awaiting refund processing"
                />
            </div>
            
            <Tabs defaultValue="all-sales">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all-sales">All Sales</TabsTrigger>
                    <TabsTrigger value="online-sales">Online Sales</TabsTrigger>
                    <TabsTrigger value="field-sales">Field Sales</TabsTrigger>
                    <TabsTrigger value="returns">Returns & Refunds</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all-sales">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Sales Transactions</CardTitle>
                            <CardDescription>A complete log of all orders from every sales channel.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <OrderTable orders={data.allOrders} showSalesperson={true} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="online-sales">
                     <Card>
                        <CardHeader>
                            <CardTitle>Online Sales</CardTitle>
                            <CardDescription>Orders placed directly by customers through the website.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <OrderTable orders={data.onlineOrders} />
                        </CardContent>
                    </Card>
                </TabsContent>

                 <TabsContent value="field-sales">
                     <Card>
                        <CardHeader>
                            <CardTitle>Field Sales</CardTitle>
                            <CardDescription>Orders processed in-person by the sales team.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <OrderTable orders={data.fieldSalesOrders} showSalesperson={true} />
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="returns">
                     <Card>
                        <CardHeader>
                            <CardTitle>Returns & Refunds</CardTitle>
                            <CardDescription>
                                A list of orders marked for return. Once an item is received by Operations and its status is "Returned", process the refund.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <OrderTable orders={data.ordersForRefund} showSalesperson={true}/>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

    
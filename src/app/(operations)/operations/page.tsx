
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Truck, Warehouse, Package, AlertTriangle, ListOrdered, Factory } from "lucide-react";
import Link from "next/link";
import { operationsService, OperationsDashboardData } from "@/services/operations.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button }from "@/components/ui/button";
import { format } from "date-fns";

function StatCard({ title, value, icon: Icon, description, href }: { title: string; value: string; icon: React.ElementType; description: string; href: string; }) {
    return (
        <Link href={href}>
            <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{value}</div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </CardContent>
            </Card>
        </Link>
    );
}


export default async function OperationsDashboard() {
    const data: OperationsDashboardData = await operationsService.getDashboardData();
    
    return (
       <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                    title="Finished Goods in Stock"
                    value={data.totalFinishedGoods.toLocaleString()}
                    icon={Package}
                    description="Total units of all products"
                    href="/admin/store-items"
                />
                 <StatCard 
                    title="Low Stock Materials"
                    value={data.lowStockRawMaterials.toString()}
                    icon={Factory}
                    description="Raw materials needing reorder"
                    href="/operations/raw-materials/inventory"
                />
                 <StatCard 
                    title="Pending Orders"
                    value={data.pendingOrdersCount.toString()}
                    icon={ListOrdered}
                    description="Orders awaiting processing"
                    href="/admin/orders"
                />
                 <StatCard 
                    title="Pickup Locations"
                    value={data.pickupLocationsCount.toString()}
                    icon={Warehouse}
                    description="Active customer pickup stations"
                    href="/operations/pickup-locations"
                />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>Low Inventory Alerts</CardTitle>
                        <CardDescription>Items that are below the stock threshold and need attention.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Qty Left</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {data.lowStockItems.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            No low stock items. Inventory is healthy.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {data.lowStockItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                                        <TableCell className="text-right font-bold text-destructive">{item.inventory.toLocaleString()} {item.unitOfMeasure || ''}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Recent Pending Orders</CardTitle>
                        <CardDescription>The latest orders that need to be processed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                 {data.recentPendingOrders.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            No pending orders right now.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {data.recentPendingOrders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <div className="font-medium">{order.customerName}</div>
                                            <div className="text-xs text-muted-foreground">{order.id?.substring(0, 7).toUpperCase()}</div>
                                        </TableCell>
                                        <TableCell>{format(order.orderDate.toDate(), 'PP')}</TableCell>
                                        <TableCell className="text-right font-semibold">Ksh {order.totalAmount.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         {data.pendingOrdersCount > 5 && (
                            <div className="text-center mt-4">
                                <Button asChild variant="secondary">
                                    <Link href="/admin/orders">View All {data.pendingOrdersCount} Pending Orders</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
       </div>
    );
}


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { orderService } from '@/services/order.service';
import OrdersClient from './_components/orders-client';


export default async function OrdersPage() {
    const orders = await orderService.getOrders();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Customer Orders</CardTitle>
                <CardDescription>
                    View and manage all incoming customer orders.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <OrdersClient initialOrders={orders} />
            </CardContent>
        </Card>
    );
}

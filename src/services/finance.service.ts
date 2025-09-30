

import { collection, getDocs, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, getOrders } from './order.service';
import { UserProfile, userService } from './user.service';

export interface FinanceData {
    allOrders: Order[];
    onlineOrders: Order[];
    fieldSalesOrders: Order[];
    ordersForRefund: Order[];
    totalRevenue: number;
    onlineSalesRevenue: number;
    fieldSalesRevenue: number;
}

class FinanceService {
    
    async getFinanceDashboardData(): Promise<FinanceData> {
        const allOrders = await getOrders();
        const users = await userService.getUsers();
        
        const salesUserIds = new Set(users.filter(u => u.roles.includes('sales')).map(u => u.uid));
        const userIdToNameMap = new Map(users.map(u => [u.uid, u.displayName]));

        const onlineOrders: Order[] = [];
        const fieldSalesOrders: Order[] = [];
        const ordersForRefund: Order[] = [];

        for (const order of allOrders) {
            // Categorize orders for refund processing
            if (order.status === 'return-pending' || order.status === 'returned') {
                ordersForRefund.push(order);
            }

            // If the order has a userId and that user is a salesperson, it's a field sale.
            // Otherwise, it's an online sale (guest checkout or customer account).
            if (order.userId && salesUserIds.has(order.userId)) {
                order.salespersonName = userIdToNameMap.get(order.userId) || 'Unknown';
                fieldSalesOrders.push(order);
            } else {
                order.salespersonName = 'Online'; // For clarity in the "All Sales" tab
                onlineOrders.push(order);
            }
        }
        
        const calculateTotal = (orders: Order[]) => orders.reduce((sum, order) => sum + order.totalAmount, 0);

        const totalRevenue = calculateTotal(allOrders);
        const onlineSalesRevenue = calculateTotal(onlineOrders);
        const fieldSalesRevenue = calculateTotal(fieldSalesOrders);

        return {
            allOrders,
            onlineOrders,
            fieldSalesOrders,
            ordersForRefund,
            totalRevenue,
            onlineSalesRevenue,
            fieldSalesRevenue,
        };
    }
}

export const financeService = new FinanceService();

    

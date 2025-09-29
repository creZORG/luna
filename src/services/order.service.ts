
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, runTransaction, doc, increment, getDocs, query, orderBy, where, limit } from 'firebase/firestore';
import { CartItem } from './cart.service';

export interface Order {
    id?: string;
    userId?: string; // Added to associate order with a user
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    items: CartItem[];
    totalAmount: number; // Final amount including all fees
    status: 'pending-payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    orderDate: any; // Firebase Timestamp
    paystackReference?: string;
}

export interface CustomerInfo {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    constituency: string;
    deliveryNotes?: string;
}


class OrderService {
    async createOrder(customer: CustomerInfo, items: CartItem[], totalAmount: number, paystackReference: string, userId?: string): Promise<string> {
        
        const inventoryRefs = items.map(item => doc(db, 'inventory', `${item.productId}-${item.size.replace(/\s/g, '')}`));

        try {
            const orderId = await runTransaction(db, async (transaction) => {
                const inventoryDocs = await Promise.all(inventoryRefs.map(ref => transaction.get(ref)));

                for (let i = 0; i < items.length; i++) {
                    const inventoryDoc = inventoryDocs[i];
                    const item = items[i];

                    if (!inventoryDoc.exists()) {
                        throw new Error(`Inventory for ${item.productName} (${item.size}) not found.`);
                    }

                    const currentStock = inventoryDoc.data().quantity;
                    if (currentStock < item.quantity) {
                        throw new Error(`Not enough stock for ${item.productName} (${item.size}). Only ${currentStock} left.`);
                    }
                }

                // Create the new order
                const newOrder: Omit<Order, 'id'> = {
                    customerName: customer.fullName,
                    customerEmail: customer.email,
                    customerPhone: customer.phone,
                    shippingAddress: `${customer.address}, ${customer.constituency}`,
                    items: items,
                    totalAmount: totalAmount,
                    status: 'paid',
                    orderDate: serverTimestamp(),
                    paystackReference,
                };
                if (userId) {
                    newOrder.userId = userId;
                }
                const orderRef = doc(collection(db, 'orders'));
                transaction.set(orderRef, newOrder);

                // Decrement inventory for each item
                for (let i = 0; i < items.length; i++) {
                    const inventoryRef = inventoryRefs[i];
                    const item = items[i];
                    transaction.update(inventoryRef, { quantity: increment(-item.quantity) });
                }

                return orderRef.id;
            });

            return orderId;

        } catch (error: any) {
            console.error("Error creating order and updating inventory:", error);
            throw new Error(`Failed to create order: ${error.message}`);
        }
    }

    async getOrders(): Promise<Order[]> {
        const q = query(collection(db, "orders"), orderBy("orderDate", "desc"));
        const querySnapshot = await getDocs(q);
        const orders: Order[] = [];
        querySnapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() } as Order);
        });
        return orders;
    }

    async getLastOrderByUserId(userId: string): Promise<Order | null> {
        const q = query(
            collection(db, "orders"), 
            where("userId", "==", userId),
            orderBy("orderDate", "desc"),
            limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() } as Order;
        }
        return null;
    }
}

export const orderService = new OrderService();


import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, runTransaction, doc, increment, getDocs, query, orderBy, where, limit, updateDoc, getDoc } from 'firebase/firestore';
import { CartItem } from './cart.service';
import { activityService } from './activity.service';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { createEmailTemplate } from '@/lib/email-template';
import { productService }from './product.service';

export type OrderStatus = 'pending-payment' | 'paid' | 'processing' | 'ready-for-dispatch' | 'shipped' | 'delivered' | 'cancelled' | 'return-pending' | 'returned';

export interface Order {
    id?: string;
    userId?: string; // Added to associate order with a user
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    deliveryMethod: 'door-to-door' | 'pickup';
    deliveryNotes?: string;
    county?: string;
    items: CartItem[];
    totalAmount: number; // Final amount including all fees
    status: OrderStatus;
    orderDate: any; // Firebase Timestamp
    paystackReference?: string;
    salespersonName?: string; // For finance dashboard
}

export interface CustomerInfo {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    county: string;
    deliveryNotes?: string;
    deliveryMethod: 'door-to-door' | 'pickup';
}


class OrderService {
    async createOrder(customer: CustomerInfo, items: CartItem[], totalAmount: number, paystackReference: string, userId?: string): Promise<string> {
        
        try {
            const orderId = await runTransaction(db, async (transaction) => {
               
                // Create the new order
                const newOrder: Omit<Order, 'id'> = {
                    customerName: customer.fullName,
                    customerEmail: customer.email,
                    customerPhone: customer.phone,
                    shippingAddress: customer.address,
                    deliveryMethod: customer.deliveryMethod,
                    deliveryNotes: customer.deliveryNotes || '',
                    county: customer.county || '',
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

                 // Decrement inventory for each item in the order
                for (const item of items) {
                    const inventoryId = `${item.productId}-${item.size.replace(/\s/g, '')}`;
                    const inventoryRef = doc(db, 'inventory', inventoryId);
                    const inventoryDoc = await transaction.get(inventoryRef);
                    if (inventoryDoc.exists() && inventoryDoc.data().quantity >= item.quantity) {
                        transaction.update(inventoryRef, { quantity: increment(-item.quantity) });
                    } else {
                        // Not enough stock, throw error to rollback transaction
                        throw new Error(`Not enough stock for ${item.productName} (${item.size}).`);
                    }
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
    
    async getOrdersByUserId(userId: string): Promise<Order[]> {
        const q = query(
            collection(db, "orders"),
            where("userId", "==", userId),
            orderBy("orderDate", "desc")
        );
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


'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, runTransaction, doc, increment, getDocs, query, orderBy, where, limit, updateDoc } from 'firebase/firestore';
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

    async updateOrderStatus(orderId: string, status: OrderStatus, userId: string, userName: string): Promise<void> {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status });

        // Log the activity
        await activityService.logActivity(
            `Updated order #${orderId.substring(0,6).toUpperCase()} to status: ${status.replace('-', ' ')}`,
            userId,
            userName
        );

        // If the order is delivered, send a follow-up email to ask for a review
        if (status === 'delivered') {
            const orderSnap = await getDoc(orderRef);
            if (orderSnap.exists()) {
                const orderData = orderSnap.data() as Order;
                
                // We only need the first product to link to.
                const firstItem = orderData.items[0];
                const product = await productService.getProductById(firstItem.productId);
                
                if (product) {
                    const subject = `How did you like your ${product.name}?`;
                    const body = `
                        <p>Hi ${orderData.customerName},</p>
                        <p>We hope you're enjoying your recent purchase from Luna Essentials! Now that you've had some time with your products, would you consider leaving a review?</p>
                        <p>Your feedback helps us improve and helps other customers make great choices.</p>
                        <br>
                        <p style="text-align:center;">
                            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/products/${product.slug}" style="background-color: hsl(195, 100%, 50%); color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 0.5rem; font-weight: bold;">
                                Review ${product.name}
                            </a>
                        </p>
                        <br>
                        <p>Thank you for being a valued member of the Luna Essentials family!</p>
                    `;
                    const emailHtml = createEmailTemplate(subject, body);
                    
                    await sendEmail({
                        to: { address: orderData.customerEmail, name: orderData.customerName },
                        subject: subject,
                        htmlbody: emailHtml,
                    });
                }
            }
        }
    }
}

export const orderService = new OrderService();

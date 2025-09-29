
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, runTransaction, doc } from 'firebase/firestore';

export interface Order {
    id?: string;
    paystackReference: string;
    customerEmail: string;
    productId: string;
    productName: string;
    size: string;
    quantity: number;
    amountPaid: number; // Amount in Kobo
    status: 'pending' | 'paid' | 'fulfilled' | 'cancelled';
    orderDate: any; // Firebase Timestamp
}

class OrderService {
    async createOrder(verifiedTx: any): Promise<string> {
        const metadata = verifiedTx.metadata;
        const inventoryId = `${metadata.product_id}-${metadata.size.replace(/\s/g, '')}`;
        const inventoryRef = doc(db, 'inventory', inventoryId);
        
        try {
            // Use a transaction to create the order and update inventory atomically
            const orderId = await runTransaction(db, async (transaction) => {
                const inventoryDoc = await transaction.get(inventoryRef);

                if (!inventoryDoc.exists()) {
                    throw new Error(`Inventory for ${inventoryId} not found.`);
                }

                const currentStock = inventoryDoc.data().quantity;
                const requestedQuantity = metadata.quantity;

                if (currentStock < requestedQuantity) {
                    throw new Error(`Not enough stock for ${metadata.product_name} (${metadata.size}).`);
                }

                // Create the new order
                const newOrder: Omit<Order, 'id'> = {
                    paystackReference: verifiedTx.reference,
                    customerEmail: verifiedTx.customer.email,
                    productId: metadata.product_id,
                    productName: metadata.product_name,
                    size: metadata.size,
                    quantity: requestedQuantity,
                    amountPaid: verifiedTx.amount,
                    status: 'paid',
                    orderDate: serverTimestamp()
                };
                const orderRef = doc(collection(db, 'orders'));
                transaction.set(orderRef, newOrder);

                // Decrement the inventory
                const newStock = currentStock - requestedQuantity;
                transaction.update(inventoryRef, { quantity: newStock });

                return orderRef.id;
            });

            return orderId;

        } catch (error: any) {
            console.error("Error creating order and updating inventory:", error);
            // Here you might want to log this failed transaction for manual review,
            // as the customer has paid but the order wasn't created.
            throw new Error(`Failed to create order: ${error.message}`);
        }
    }
}

export const orderService = new OrderService();

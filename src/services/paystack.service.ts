
import Paystack from 'paystack-node';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Product } from '@/lib/data';
import { orderService } from './order.service';

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY!);

interface TransactionData {
    email: string;
    amount: number; // Amount in Kobo
    productId: string;
    size: string;
    quantity: number;
}

class PaystackService {

    async initializeTransaction(data: TransactionData) {
        try {
            const productDoc = await getDoc(doc(db, 'products', data.productId));
            if (!productDoc.exists()) throw new Error('Product not found');
            
            const product = productDoc.data() as Product;
            
            const response = await paystack.initializeTransaction({
                email: data.email,
                amount: data.amount.toString(),
                metadata: {
                    product_id: data.productId,
                    product_name: product.name,
                    size: data.size,
                    quantity: data.quantity,
                    customer_email: data.email
                },
                callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/products/verify-payment`
            });
            
            if (!response.status || !response.data) {
                throw new Error(response.message || 'Failed to initialize transaction');
            }
            
            return response.data; // { authorization_url, access_code, reference }

        } catch (error: any) {
            console.error('Paystack initialization error:', error.response?.data || error.message);
            throw new Error('Could not start the payment process.');
        }
    }

    async verifyTransaction(reference: string) {
        try {
            const response = await paystack.verifyTransaction(reference);
            
            if (!response.status || !response.data) {
                throw new Error(response.message || 'Transaction verification failed');
            }

            // Check if payment was actually successful
            if (response.data.status !== 'success') {
                throw new Error(`Payment not successful. Status: ${response.data.status}`);
            }
            
            return response.data; // Full transaction data from Paystack

        } catch (error: any) {
            console.error('Paystack verification error:', error.response?.data || error.message);
            throw new Error('Could not verify the payment.');
        }
    }

    async processTransaction(reference: string) {
        try {
            // 1. Verify the transaction with Paystack
            const verifiedTransaction = await this.verifyTransaction(reference);

            // 2. If successful, create the order in our database
            const orderId = await orderService.createOrder(verifiedTransaction);
            
            // 3. Return a success response
            return {
                success: true,
                orderId,
                message: 'Payment successful and order created!',
            };

        } catch (error: any) {
            console.error(`[Payment Flow Error] Ref: ${reference} | Error: ${error.message}`);
            return {
                success: false,
                message: error.message || 'An unknown error occurred during payment processing.',
            };
        }
    }
}

export const paystackService = new PaystackService();

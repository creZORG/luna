
'use server';
/**
 * @fileOverview A flow to initialize a Paystack payment transaction.
 * - initializePayment - Creates a transaction with Paystack and returns the details needed by the frontend.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import Paystack from 'paystack-node';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/data';

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY!);

const InitializePaymentInputSchema = z.object({
  email: z.string().email(),
  amount: z.number().int().positive(),
  productId: z.string(),
  size: z.string(),
  quantity: z.number().int().positive(),
});

const InitializePaymentOutputSchema = z.object({
  authorization_url: z.string().url(),
  access_code: z.string(),
  reference: z.string(),
});

export type InitializePaymentInput = z.infer<typeof InitializePaymentInputSchema>;
export type InitializePaymentOutput = z.infer<typeof InitializePaymentOutputSchema>;


export async function initializePaymentFlow(input: InitializePaymentInput): Promise<InitializePaymentOutput> {
  return await initializePayment(input);
}


const initializePayment = ai.defineFlow(
  {
    name: 'initializePaymentFlow',
    inputSchema: InitializePaymentInputSchema,
    outputSchema: InitializePaymentOutputSchema,
  },
  async (data) => {
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
        
        return response.data;

    } catch (error: any) {
        console.error('Paystack initialization error:', error.response?.data || error.message);
        throw new Error('Could not start the payment process.');
    }
  }
);

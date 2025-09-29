
'use server';
/**
 * @fileOverview A flow to securely process a Paystack payment and create an order.
 * - processPayment - Verifies a payment reference, and if successful, creates an order.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import Paystack from 'paystack-node';
import { orderService } from '@/services/order.service';

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY!);

const ProcessPaymentInputSchema = z.object({
  reference: z.string().min(1, 'Payment reference is required.'),
});

const ProcessPaymentOutputSchema = z.object({
  success: z.boolean(),
  orderId: z.string().optional(),
  message: z.string(),
});

export type ProcessPaymentOutput = z.infer<typeof ProcessPaymentOutputSchema>;

export async function processPayment(reference: string): Promise<ProcessPaymentOutput> {
  return await processPaymentFlow({ reference });
}

const processPaymentFlow = ai.defineFlow(
  {
    name: 'processPaymentFlow',
    inputSchema: ProcessPaymentInputSchema,
    outputSchema: ProcessPaymentOutputSchema,
  },
  async ({ reference }) => {
    try {
        // 1. Verify the transaction with Paystack
        const response = await paystack.verifyTransaction(reference);
        
        if (!response.status || !response.data) {
            throw new Error(response.message || 'Transaction verification failed');
        }

        if (response.data.status !== 'success') {
            throw new Error(`Payment not successful. Status: ${response.data.status}`);
        }
        
        const verifiedTransaction = response.data;

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
);

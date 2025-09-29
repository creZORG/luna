
'use server';
/**
 * @fileOverview A flow to securely process a Paystack payment and create an order.
 * - processPayment - Verifies a payment reference, and if successful, creates an order.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { paystackService } from '@/services/paystack.service';

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
  // This flow now correctly calls the isolated service.
  return await paystackService.verifyAndCreateOrder(reference);
}

const processPaymentFlow = ai.defineFlow(
  {
    name: 'processPaymentFlow',
    inputSchema: ProcessPaymentInputSchema,
    outputSchema: ProcessPaymentOutputSchema,
  },
  async ({ reference }) => {
     return await paystackService.verifyAndCreateOrder(reference);
  }
);

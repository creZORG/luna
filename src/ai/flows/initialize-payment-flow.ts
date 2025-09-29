
'use server';
/**
 * @fileOverview A flow to initialize a Paystack payment transaction.
 * - initializePaymentFlow - Creates a transaction with Paystack and returns the details needed by the frontend.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { paystackService } from '@/services/paystack.service';

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


export async function initializePayment(input: InitializePaymentInput): Promise<InitializePaymentOutput> {
  // This flow now correctly calls the isolated service, which is never imported by the client.
  return await paystackService.initializeTransaction(input);
}


const initializePaymentFlow = ai.defineFlow(
  {
    name: 'initializePaymentFlow',
    inputSchema: InitializePaymentInputSchema,
    outputSchema: InitializePaymentOutputSchema,
  },
  async (data) => {
    // Note: The actual logic is in the service to prevent bundling issues.
    return await paystackService.initializeTransaction(data);
  }
);

export { initializePaymentFlow };

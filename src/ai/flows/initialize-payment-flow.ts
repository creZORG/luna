
'use server';
/**
 * @fileOverview A flow to initialize a Paystack payment transaction.
 * - initializePayment - Creates a transaction with Paystack and returns the details needed by the frontend.
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


// This is the exported server action that client components will call.
// It acts as a safe wrapper around our server-only logic.
export async function initializePayment(input: InitializePaymentInput): Promise<InitializePaymentOutput> {
  return await paystackService.initializeTransaction(input);
}


// The Genkit flow definition is kept for internal organization and potential reuse
// on the server, but it is no longer directly imported by the client.
const initializePaymentFlow = ai.defineFlow(
  {
    name: 'initializePaymentFlow',
    inputSchema: InitializePaymentInputSchema,
    outputSchema: InitializePaymentOutputSchema,
  },
  async (data) => {
    return await paystackService.initializeTransaction(data);
  }
);


'use server';
/**
 * @fileOverview A server action to securely process a Paystack payment and create an order.
 * - processPayment - Verifies a payment reference, and if successful, creates an order.
 */

import { z } from 'zod';
import { paystackService } from '@/services/paystack.service';

const ProcessPaymentOutputSchema = z.object({
  success: z.boolean(),
  orderId: z.string().optional(),
  message: z.string(),
});

export type ProcessPaymentOutput = z.infer<typeof ProcessPaymentOutputSchema>;

// This is the exported server action that client components will call.
export async function processPayment(reference: string): Promise<ProcessPaymentOutput> {
  // Directly call the service which contains the server-only 'paystack-node' import.
  // This file is now a pure server action module.
  return await paystackService.verifyAndCreateOrder(reference);
}

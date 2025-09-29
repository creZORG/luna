
'use server';
/**
 * @fileOverview A flow to verify a Paystack payment and process an order.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import axios from 'axios';
import { processOrder } from './process-order-flow';

const CartItemSchema = z.object({
    productId: z.string(),
    productName: z.string(),
    size: z.string(),
    quantity: z.number(),
    price: z.number(),
    imageUrl: z.string().optional(),
});

const CustomerInfoSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  county: z.string(),
  address: z.string(),
  deliveryNotes: z.string().optional(),
  deliveryMethod: z.enum(['door-to-door', 'pickup']),
});

const VerifyPaymentInputSchema = z.object({
  reference: z.string(),
  cartItems: z.array(CartItemSchema),
  customer: CustomerInfoSchema,
  userId: z.string().optional(), // Added userId
});

export type VerifyPaymentInput = z.infer<typeof VerifyPaymentInputSchema>;

export async function verifyPaymentAndProcessOrder(input: VerifyPaymentInput) {
    return await verifyPaymentAndProcessOrderFlow(input);
}


const verifyPaymentAndProcessOrderFlow = ai.defineFlow(
  {
    name: 'verifyPaymentAndProcessOrderFlow',
    inputSchema: VerifyPaymentInputSchema,
    outputSchema: z.string(), // Returns the order ID
  },
  async (input) => {
    
    // 1. Verify the payment with Paystack
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
        throw new Error("Paystack secret key is not configured.");
    }
    
    try {
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${input.reference}`,
            {
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                },
            }
        );

        const { status, data } = response.data;
        if (status !== true || data.status !== 'success') {
            throw new Error('Payment verification failed with Paystack.');
        }

        // 2. If verification is successful, proceed to create the order
        const orderId = await processOrder({
            cartItems: input.cartItems,
            customer: input.customer,
            paystackReference: input.reference,
            userId: input.userId, // Pass userId
        });

        return orderId;

    } catch (error: any) {
         if (axios.isAxiosError(error)) {
            console.error('Paystack API Error:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Failed to verify payment with Paystack.');
        }
        console.error('Generic Error in verification flow:', error);
        throw new Error('An unexpected error occurred during payment verification.');
    }
  }
);

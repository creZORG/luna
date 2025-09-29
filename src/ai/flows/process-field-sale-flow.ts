
'use server';
/**
 * @fileOverview A flow to process an in-person field sale via M-Pesa STK push.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import axios from 'axios';
import { processOrder } from './process-order-flow';
import { CartItem } from '@/services/cart.service';

const CartItemSchema = z.object({
    productId: z.string(),
    productName: z.string(),
    size: z.string(),
    quantity: z.number(),
    price: z.number(),
    imageUrl: z.string().optional(),
});

const ProcessFieldSaleInputSchema = z.object({
  items: z.array(CartItemSchema),
  customerName: z.string(),
  customerPhone: z.string(),
  salespersonId: z.string(),
  salespersonName: z.string(),
});

export type ProcessFieldSaleInput = z.infer<typeof ProcessFieldSaleInputSchema>;

export async function processFieldSale(input: ProcessFieldSaleInput) {
    return await processFieldSaleFlow(input);
}


const processFieldSaleFlow = ai.defineFlow(
  {
    name: 'processFieldSaleFlow',
    inputSchema: ProcessFieldSaleInputSchema,
    outputSchema: z.string(), // Returns the order ID
  },
  async (input) => {
    
    // 1. Calculate total amount
    const totalAmount = input.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // 2. Initiate Paystack STK Push
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
        throw new Error("Paystack secret key is not configured.");
    }
    
    try {
        const transactionRef = `luna-field-${Date.now()}`;
        
        // Step 2a: Initialize charge with mobile money
        const chargeResponse = await axios.post(
            'https://api.paystack.co/charge',
            {
                email: `sale-by-${input.salespersonId}@luna.co.ke`, // Create a dummy email
                amount: totalAmount * 100, // Amount in kobo
                metadata: {
                    custom_fields: [
                        { display_name: "Salesperson", variable_name: "salesperson_name", value: input.salespersonName },
                        { display_name: "Customer", variable_name: "customer_name", value: input.customerName },
                    ],
                    "send_receipt": false, // Disable Paystack receipt
                },
                mobile_money: {
                    phone: input.customerPhone,
                    provider: 'mpesa'
                },
                reference: transactionRef
            },
            {
                headers: { Authorization: `Bearer ${secretKey}` },
            }
        );

        let chargeData = chargeResponse.data.data;
        
        // Step 2b: Poll for status
        let status = chargeData.status;
        const maxRetries = 10; // Poll for ~1 minute
        let retries = 0;

        while (status === 'pending' && retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 6000)); // Wait 6 seconds

            const statusResponse = await axios.get(
                `https://api.paystack.co/charge/${chargeData.reference}`,
                { headers: { Authorization: `Bearer ${secretKey}` } }
            );
            status = statusResponse.data.data.status;
            retries++;
        }

        if (status !== 'success') {
            throw new Error(`Payment not completed. Final status: ${status}`);
        }

        // 3. If payment is successful, create the order
        const orderId = await processOrder({
            cartItems: input.items,
            customer: {
                fullName: input.customerName,
                phone: input.customerPhone,
                email: `pos-customer-${Date.now()}@luna.co.ke`, // Dummy email for POS
                address: `In-person sale by ${input.salespersonName}`,
                county: 'Field Sale',
            },
            paystackReference: chargeData.reference,
            userId: input.salespersonId, 
        });

        return orderId;

    } catch (error: any) {
         if (axios.isAxiosError(error)) {
            console.error('Paystack API Error:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Failed to initiate or verify payment with Paystack.');
        }
        console.error('Generic Error in field sale flow:', error);
        throw new Error('An unexpected error occurred during the sale process.');
    }
  }
);

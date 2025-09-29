
'use server';
/**
 * @fileOverview A flow to process a customer order.
 * This simulates a payment and then creates an order record.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { orderService, CustomerInfo } from '@/services/order.service';
import { CartItem, cartService } from '@/services/cart.service';
import { productService } from '@/services/product.service';
import { increment } from 'firebase/firestore';


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
  constituency: z.string(),
  address: z.string(),
  deliveryNotes: z.string().optional(),
});

const ProcessOrderInputSchema = z.object({
  cartItems: z.array(CartItemSchema),
  customer: CustomerInfoSchema,
  paystackReference: z.string(),
});

export type ProcessOrderInput = z.infer<typeof ProcessOrderInputSchema>;


export async function processOrder(input: ProcessOrderInput) {
  return await processOrderFlow(input);
}


const processOrderFlow = ai.defineFlow(
  {
    name: 'processOrderFlow',
    inputSchema: ProcessOrderInputSchema,
    outputSchema: z.string(), // Returns the order ID
  },
  async (input) => {
    // Recalculate total on the backend to prevent tampering
    let subtotal = 0;
    let totalDeliveryFee = 0;
    let totalPlatformFee = 0;
    const uniqueProductIds = new Set<string>();

    for (const item of input.cartItems) {
        subtotal += item.price * item.quantity;
        uniqueProductIds.add(item.productId);
    }
    
    const productFeePromises = Array.from(uniqueProductIds).map(id => productService.getProductById(id));
    const products = await Promise.all(productFeePromises);

    products.forEach(product => {
        if(product) {
            totalDeliveryFee += product.deliveryFee || 0;
            totalPlatformFee += product.platformFee || 0;
        }
    });

    const totalAmount = subtotal + totalDeliveryFee + totalPlatformFee;

    // Now that payment is "verified", create the order in the database.
    const orderId = await orderService.createOrder(
        input.customer,
        input.cartItems,
        totalAmount,
        input.paystackReference
    );

    return orderId;
  }
);

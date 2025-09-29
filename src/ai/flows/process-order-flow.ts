
'use server';
/**
 * @fileOverview A flow to process a customer order.
 * This simulates a payment and then creates an order record.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { orderService, CustomerInfo } from '@/services/order.service';
import { CartItem, cartService } from '@/services/cart.service';
import { getProductById } from '@/services/product.service';
import { increment } from 'firebase/firestore';
import { sendEmail } from './send-email-flow';
import { createEmailTemplate } from '@/lib/email-template';
import { userService } from '@/services/user.service';


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

const ProcessOrderInputSchema = z.object({
  cartItems: z.array(CartItemSchema),
  customer: CustomerInfoSchema,
  paystackReference: z.string(),
  userId: z.string().optional(), // Added userId
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
    
    const productFeePromises = Array.from(uniqueProductIds).map(id => getProductById(id));
    const products = await Promise.all(productFeePromises);

    products.forEach(product => {
        if(product) {
            totalDeliveryFee += product.deliveryFee || 0;
            totalPlatformFee += product.platformFee || 0;
        }
    });

    const totalAmount = input.customer.deliveryMethod === 'pickup'
        ? subtotal + totalPlatformFee
        : subtotal + totalDeliveryFee + totalPlatformFee;

    // Now that payment is "verified", create the order in the database.
    const orderId = await orderService.createOrder(
        input.customer,
        input.cartItems,
        totalAmount,
        input.paystackReference,
        input.userId // Pass userId to createOrder
    );

    // After successful order creation, send emails.
    if (orderId) {
        // 1. Send confirmation email to the customer
        const customerSubject = `Your Luna Essentials Order #${orderId.substring(0,6).toUpperCase()} is Confirmed!`;
        const customerBody = `
            <p>Hi ${input.customer.fullName},</p>
            <p>Thank you for your purchase! We've received your order and are getting it ready for you. We'll notify you once it has been shipped.</p>
            <h3>Order Summary</h3>
            <table border="0" cellpadding="10" cellspacing="0" style="width:100%;">
                ${input.cartItems.map(item => `
                    <tr>
                        <td>${item.productName} (${item.size}) x ${item.quantity}</td>
                        <td style="text-align: right;">Ksh ${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                `).join('')}
                 <tr>
                    <td>Delivery Fee</td>
                    <td style="text-align: right;">Ksh ${input.customer.deliveryMethod === 'pickup' ? '0.00' : totalDeliveryFee.toFixed(2)}</td>
                </tr>
                 <tr>
                    <td>Platform Fee</td>
                    <td style="text-align: right;">Ksh ${totalPlatformFee.toFixed(2)}</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                    <td style="font-weight: bold;">Total</td>
                    <td style="text-align: right; font-weight: bold;">Ksh ${totalAmount.toFixed(2)}</td>
                </tr>
            </table>
            <br>
            <p><strong>Shipping to:</strong><br>${input.customer.fullName}<br>${input.customer.address}</p>
        `;
        const customerEmailHtml = createEmailTemplate(customerSubject, customerBody);
        
        await sendEmail({
            to: { address: input.customer.email, name: input.customer.fullName },
            from: { address: 'sales@luna.co.ke', name: 'Luna Essentials Sales' },
            subject: customerSubject,
            htmlbody: customerEmailHtml
        });

        // 2. Send notification email to admins and sales people
        const allUsers = await userService.getUsers();
        const notificationRecipients = allUsers.filter(u => u.roles.includes('admin') || u.roles.includes('sales'));

        if (notificationRecipients.length > 0) {
            const internalSubject = `New Order Received: #${orderId.substring(0,6).toUpperCase()}`;
            const internalBody = `
                <p>A new order has been placed and paid for.</p>
                <h3>Order Details (ID: #${orderId.substring(0,6).toUpperCase()})</h3>
                <p><strong>Total Amount:</strong> Ksh ${totalAmount.toFixed(2)}</p>
                
                <h3>Customer Information</h3>
                <ul>
                    <li><strong>Name:</strong> ${input.customer.fullName}</li>
                    <li><strong>Email:</strong> ${input.customer.email}</li>
                    <li><strong>Phone:</strong> ${input.customer.phone}</li>
                    <li><strong>Delivery Method:</strong> ${input.customer.deliveryMethod.replace('-', ' ')}</li>
                    <li><strong>Delivery Address:</strong> ${input.customer.address}</li>
                    ${input.customer.deliveryNotes ? `<li><strong>Notes:</strong> ${input.customer.deliveryNotes}</li>` : ''}
                </ul>

                <h3>Items Ordered</h3>
                <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="text-align: left;">Product</th>
                            <th style="text-align: left;">Size</th>
                            <th style="text-align: right;">Qty</th>
                            <th style="text-align: right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${input.cartItems.map(item => `
                            <tr>
                                <td>${item.productName}</td>
                                <td>${item.size}</td>
                                <td style="text-align: right;">${item.quantity}</td>
                                <td style="text-align: right;">Ksh ${item.price.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            const internalEmailHtml = createEmailTemplate(internalSubject, internalBody);

            for(const user of notificationRecipients) {
                 await sendEmail({
                    to: { address: user.email, name: user.displayName },
                    from: { address: 'noreply@luna.co.ke', name: 'Luna System' },
                    subject: internalSubject,
                    htmlbody: internalEmailHtml
                });
            }
        }
    }

    return orderId;
  }
);

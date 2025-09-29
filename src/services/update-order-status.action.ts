
'use server';

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { activityService } from "./activity.service";
import { sendEmail } from "@/ai/flows/send-email-flow";
import { createEmailTemplate } from "@/lib/email-template";
import { getProductById } from "./product.service";
import type { Order, OrderStatus } from "./order.service";

export async function updateOrderStatus(orderId: string, status: OrderStatus, userId: string, userName: string): Promise<void> {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });

    // Log the activity
    await activityService.logActivity(
        `Updated order #${orderId.substring(0,6).toUpperCase()} to status: ${status.replace('-', ' ')}`,
        userId,
        userName
    );

    // If the order is delivered, send a follow-up email to ask for a review
    if (status === 'delivered') {
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
            const orderData = orderSnap.data() as Order;
            
            // We only need the first product to link to.
            const firstItem = orderData.items[0];
            const product = await getProductById(firstItem.productId);
            
            if (product) {
                const subject = `How did you like your ${product.name}?`;
                const body = `
                    <p>Hi ${orderData.customerName},</p>
                    <p>We hope you're enjoying your recent purchase from Luna Essentials! Now that you've had some time with your products, would you consider leaving a review?</p>
                    <p>Your feedback helps us improve and helps other customers make great choices.</p>
                    <br>
                    <p style="text-align:center;">
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/products/${product.slug}" style="background-color: hsl(195, 100%, 50%); color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 0.5rem; font-weight: bold;">
                            Review ${product.name}
                        </a>
                    </p>
                    <br>
                    <p>Thank you for being a valued member of the Luna Essentials family!</p>
                `;
                const emailHtml = createEmailTemplate(subject, body);
                
                await sendEmail({
                    to: { address: orderData.customerEmail, name: orderData.customerName },
                    subject: subject,
                    htmlbody: emailHtml,
                });
            }
        }
    }
}


'use server';
/**
 * @fileOverview A flow to draft and send a purchase order email to a supplier.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { sendEmail } from './send-email-flow';
import { createEmailTemplate } from '@/lib/email-template';

const PurchaseOrderItemSchema = z.object({
  rawMaterialName: z.string(),
  quantity: z.number(),
  unit: z.string(),
});

const SendPurchaseOrderInputSchema = z.object({
  supplierName: z.string(),
  supplierEmail: z.string().email(),
  items: z.array(PurchaseOrderItemSchema),
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().optional(),
  orderId: z.string(),
  requesterName: z.string(),
});
export type SendPurchaseOrderInput = z.infer<
  typeof SendPurchaseOrderInputSchema
>;

export async function sendPurchaseOrder(input: SendPurchaseOrderInput) {
  return await sendPurchaseOrderFlow(input);
}

const emailPrompt = ai.definePrompt({
    name: 'purchaseOrderEmailPrompt',
    input: { schema: SendPurchaseOrderInputSchema },
    prompt: `
        You are an AI assistant for Luna Essentials, a manufacturer of natural personal care products.
        Your task is to generate the body content for a purchase order email.
        The email should be professional, clear, and friendly.

        The purchase order ID is: {{{orderId}}}
        The person from our team placing the order is: {{{requesterName}}}

        Here are the items to order:
        {{#each items}}
        - {{quantity}} {{unit}} of {{rawMaterialName}}
        {{/each}}

        {{#if expectedDeliveryDate}}
        We would appreciate it if the order could be delivered by {{expectedDeliveryDate}}.
        {{/if}}

        {{#if notes}}
        Additional notes: {{{notes}}}
        {{/if}}

        Start the email by greeting the supplier, "{{{supplierName}}} Team".
        State clearly that this is a new purchase order from Luna Essentials.
        List the items exactly as provided.
        Include the expected delivery date and any notes if they are present.
        Conclude by asking them to confirm receipt of the order and to provide an estimated delivery timeline.
        Sign off from "{{{requesterName}}}".
    `,
});


const sendPurchaseOrderFlow = ai.defineFlow(
  {
    name: 'sendPurchaseOrderFlow',
    inputSchema: SendPurchaseOrderInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    // 1. Generate the email body using the AI prompt
    const { output: emailBody } = await emailPrompt(input);
    
    if (!emailBody) {
        throw new Error("Failed to generate email body.");
    }

    // 2. Construct the full HTML email
    const subject = `New Purchase Order from Luna Essentials - PO #${input.orderId}`;
    const emailHtml = createEmailTemplate(
      subject,
      `<p>${emailBody.replace(/\n/g, '<br>')}</p>`
    );

    // 3. Send the email
    await sendEmail({
      to: {
        address: input.supplierEmail,
        name: input.supplierName,
      },
      from: {
          address: 'orders@luna.co.ke',
          name: `${input.requesterName} (Luna Essentials)`
      },
      subject: subject,
      htmlbody: emailHtml,
    });
  }
);

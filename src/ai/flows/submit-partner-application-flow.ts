
'use server';
/**
 * @fileOverview A flow to handle a new partner application submission.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { partnerService } from '@/services/partner.service';
import { userService } from '@/services/user.service';
import { sendEmail } from './send-email-flow';
import { createEmailTemplate } from '@/lib/email-template';

const PartnerApplicationInputSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('A valid email is required.'),
  phone: z.string().min(10, 'A valid phone number is required.'),
  partnerType: z.enum(['influencer', 'delivery-partner', 'pickup-location']),
  message: z.string().min(10, 'Please tell us a bit about yourself.'),
});
export type PartnerApplicationInput = z.infer<typeof PartnerApplicationInputSchema>;

export async function submitPartnerApplication(input: PartnerApplicationInput) {
    return await submitPartnerApplicationFlow(input);
}

const submitPartnerApplicationFlow = ai.defineFlow(
    {
        name: 'submitPartnerApplicationFlow',
        inputSchema: PartnerApplicationInputSchema,
        outputSchema: z.void(),
    },
    async (input) => {
        // 1. Save the application to the database
        const applicationId = await partnerService.createApplication(input);

        // 2. Notify administrators
        const admins = await userService.getAdmins();
        if (admins.length > 0) {
            const subject = `New Partner Application: ${input.name}`;
            const body = `
                <p>A new partnership application has been submitted and requires your review.</p>
                <h3>Applicant Details</h3>
                <ul>
                    <li><strong>Name:</strong> ${input.name}</li>
                    <li><strong>Email:</strong> ${input.email}</li>
                    <li><strong>Phone:</strong> ${input.phone}</li>
                    <li><strong>Partnership Type:</strong> ${input.partnerType.replace(/-/g, ' ')}</li>
                    <li><strong>Message:</strong> ${input.message}</li>
                </ul>
                <p>Please visit the admin dashboard to approve or reject this application.</p>
            `;
            const emailHtml = createEmailTemplate(subject, body);
            
            for (const admin of admins) {
                await sendEmail({
                    to: { address: admin.email, name: admin.displayName },
                    subject: subject,
                    htmlbody: emailHtml,
                });
            }
        }
    }
);

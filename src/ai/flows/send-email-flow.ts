
'use server';
/**
 * @fileOverview An email sending flow using ZeptoMail.
 *
 * - sendEmail - A function that handles sending an email.
 * - SendEmailRequest - The input type for the sendEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {SendMailClient} from 'zeptomail';

export const SendEmailRequestSchema = z.object({
  to: z.object({
    address: z.string().email(),
    name: z.string(),
  }),
  subject: z.string(),
  htmlbody: z.string(),
});
export type SendEmailRequest = z.infer<typeof SendEmailRequestSchema>;

export async function sendEmail(req: SendEmailRequest) {
  return await sendEmailFlow(req);
}

const sendEmailFlow = ai.defineFlow(
  {
    name: 'sendEmailFlow',
    inputSchema: SendEmailRequestSchema,
    outputSchema: z.any(),
  },
  async (params: SendEmailRequest) => {
    const url = 'api.zeptomail.com/';
    const token = process.env.ZEPTO_TOKEN;

    if (!token) {
      console.error('ZEPTO_TOKEN is not defined in environment variables.');
      throw new Error('Email service is not configured.');
    }

    let client = new SendMailClient({url, token});

    try {
      const response = await client.sendMail({
        from: {
          address: 'noreply@luna.co.ke',
          name: 'Luna Essentials',
        },
        to: [
          {
            email_address: {
              address: params.to.address,
              name: params.to.name,
            },
          },
        ],
        subject: params.subject,
        htmlbody: params.htmlbody,
      });
      return response;
    } catch (error) {
      console.error('Error sending email via ZeptoMail:', error);
      throw new Error('Failed to send email.');
    }
  }
);

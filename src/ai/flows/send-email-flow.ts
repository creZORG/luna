
'use server';
/**
 * @fileOverview An email sending flow using ZeptoMail.
 *
 * - sendEmail - A function that handles sending an email.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {SendMailClient} from 'zeptomail';
import { SendEmailRequest, SendEmailRequestSchema } from './send-email-types';

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
        from: params.from || {
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


import {z} from 'genkit';

export const SendEmailRequestSchema = z.object({
  to: z.object({
    address: z.string().email(),
    name: z.string(),
  }),
  subject: z.string(),
  htmlbody: z.string(),
});
export type SendEmailRequest = z.infer<typeof SendEmailRequestSchema>;

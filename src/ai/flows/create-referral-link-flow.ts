
'use server';
/**
 * @fileOverview A flow to create a referral link for a digital marketer.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { referralService } from '@/services/referral.service';

const CreateReferralLinkInputSchema = z.object({
  destinationUrl: z.string().url('Must be a valid URL.'),
  marketerId: z.string(),
  marketerName: z.string(),
  campaignId: z.string().optional(),
  campaignName: z.string().optional(),
});

export type CreateReferralLinkInput = z.infer<typeof CreateReferralLinkInputSchema>;

export async function createReferralLink(input: CreateReferralLinkInput) {
  return await createReferralLinkFlow(input);
}

const createReferralLinkFlow = ai.defineFlow(
  {
    name: 'createReferralLinkFlow',
    inputSchema: CreateReferralLinkInputSchema,
    outputSchema: z.any(), // Returns the full ReferralLink object
  },
  async (input) => {
    const newLink = await referralService.createReferralLink(
      input.destinationUrl,
      input.marketerId,
      input.marketerName,
      input.campaignId,
      input.campaignName,
    );
    return newLink;
  }
);

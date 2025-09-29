
'use server';
/**
 * @fileOverview A flow to perform reverse geocoding using an AI model.
 *
 * - reverseGeocode - A function that takes latitude and longitude and returns a location name.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ReverseGeocodeInputSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

const ReverseGeocodeOutputSchema = z.object({
    city: z.string().describe("The city or major town for the given coordinates."),
    country: z.string().describe("The country for the given coordinates.")
});

export async function reverseGeocode(input: { latitude: number, longitude: number }) {
  return await reverseGeocodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reverseGeocodePrompt',
  input: { schema: ReverseGeocodeInputSchema },
  output: { schema: ReverseGeocodeOutputSchema },
  prompt: `Based on the provided latitude: {{{latitude}}} and longitude: {{{longitude}}}, identify the major city/town and country. Provide only the city/town and country name.`,
});

const reverseGeocodeFlow = ai.defineFlow(
  {
    name: 'reverseGeocodeFlow',
    inputSchema: ReverseGeocodeInputSchema,
    outputSchema: ReverseGeocodeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

'use server';

/**
 * @fileOverview An AI-powered tool to generate alternative advertising slogans.
 *
 * - generateAlternativeSlogans - A function that generates alternative advertising slogans.
 * - GenerateAlternativeSlogansInput - The input type for the generateAlternativeSlogans function.
 * - GenerateAlternativeSlogansOutput - The return type for the generateAlternativeSlogans function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAlternativeSlogansInputSchema = z.object({
  productCategory: z
    .string()
    .describe('The category of the product (e.g., Shower Gel, Fabric Softener, Dish Wash).'),
  coreIngredients: z
    .string()
    .describe('A comma-separated list of core ingredients in the product.'),
});
export type GenerateAlternativeSlogansInput = z.infer<
  typeof GenerateAlternativeSlogansInputSchema
>;

const GenerateAlternativeSlogansOutputSchema = z.object({
  slogans: z
    .array(z.string())
    .describe('An array of alternative advertising slogans.'),
});
export type GenerateAlternativeSlogansOutput = z.infer<
  typeof GenerateAlternativeSlogansOutputSchema
>;

export async function generateAlternativeSlogans(
  input: GenerateAlternativeSlogansInput
): Promise<GenerateAlternativeSlogansOutput> {
  return generateAlternativeSlogansFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAlternativeSlogansPrompt',
  input: {schema: GenerateAlternativeSlogansInputSchema},
  output: {schema: GenerateAlternativeSlogansOutputSchema},
  prompt: `You are a marketing expert specializing in creating catchy and effective advertising slogans.

  Generate 5 alternative advertising slogans for a product in the following category: {{productCategory}}.
  The product contains the following core ingredients: {{coreIngredients}}.

  Each slogan should be concise, memorable, and relevant to the product's category and ingredients.
  The slogans should highlight the product's benefits and appeal to the target audience. Make them unique and creative.

  Return the slogans as a JSON array.
  `,
});

const generateAlternativeSlogansFlow = ai.defineFlow(
  {
    name: 'generateAlternativeSlogansFlow',
    inputSchema: GenerateAlternativeSlogansInputSchema,
    outputSchema: GenerateAlternativeSlogansOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

'use server';

import { z } from 'zod';
import { generateAlternativeSlogans } from '@/ai/flows/generate-alternative-slogans';

const SloganSchema = z.object({
  productCategory: z.string().min(3, 'Product category must be at least 3 characters long.'),
  coreIngredients: z.string().min(3, 'Core ingredients must be at least 3 characters long.'),
});

export type SloganState = {
  message?: string;
  slogans?: string[];
  errors?: {
    productCategory?: string[];
    coreIngredients?: string[];
  };
};

export async function generateSlogansAction(
  prevState: SloganState,
  formData: FormData
): Promise<SloganState> {
  const validatedFields = SloganSchema.safeParse({
    productCategory: formData.get('productCategory'),
    coreIngredients: formData.get('coreIngredients'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check your inputs.',
    };
  }

  try {
    const { productCategory, coreIngredients } = validatedFields.data;
    const result = await generateAlternativeSlogans({
      productCategory,
      coreIngredients,
    });
    
    if (result.slogans && result.slogans.length > 0) {
      return { message: 'Slogans generated successfully!', slogans: result.slogans };
    } else {
      return { message: 'The AI could not generate any slogans. Please try different keywords.' };
    }
  } catch (error) {
    console.error('Error generating slogans:', error);
    return { message: 'An unexpected error occurred. Please try again later.' };
  }
}

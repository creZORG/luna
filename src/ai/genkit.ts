
'use server';

/**
 * @fileOverview A global AI object that is configured with the Google AI plugin.
 *
 * This file exports a singleton `ai` object that can be used to define and run
 * Genkit flows and prompts. It is configured with the Google AI plugin, which
 * allows it to use Google's generative AI models.
 *
 * This file is also where you can configure other Genkit plugins, such as
 * Firebase.
 *
 * It is marked with `'use server'` so that it can be used in both server-side
 * and client-side code.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Note: The genkit() call does not automatically pick up credentials from the
// environment. You must explicitly pass them in.
//
// Note: When you specify an API key, you may also need to specify the project
// ID. If you get an error that the project ID is missing, you can find it in
// the Firebase console.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    }),
  ],
});


'use server';
/**
 * @fileOverview A flow to upload an image to Cloudinary.
 *
 * - uploadImageFlow - A function that handles securely uploading an image.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const UploadImageInputSchema = z.object({
  imageDataUri: z.string().describe(
    "The image to upload, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  folder: z.string().optional().describe('The Cloudinary folder to upload the image into.'),
});

export type UploadImageInput = z.infer<typeof UploadImageInputSchema>;

export async function uploadImageFlow(input: UploadImageInput): Promise<string> {
    return await uploadImage(input);
}


const uploadImage = ai.defineFlow(
  {
    name: 'uploadImageFlow',
    inputSchema: UploadImageInputSchema,
    outputSchema: z.string().url(),
  },
  async (input) => {
    try {
      const result = await cloudinary.uploader.upload(input.imageDataUri, {
        folder: input.folder,
        // Other options like public_id can be added here if needed
      });
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw new Error('Failed to upload image.');
    }
  }
);

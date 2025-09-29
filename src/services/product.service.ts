
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, getDoc, doc, writeBatch, updateDoc, setDoc } from 'firebase/firestore';
import type { Product } from '@/lib/data';
import { uploadImageFlow } from '@/ai/flows/upload-image-flow';

export interface ProductUpdateData {
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  keyBenefits?: string | string[];
  ingredients?: string | string[];
  directions?: string;
  cautions?: string;
  imageUrl?: string; // Can be a data URI for new uploads or existing URL
  galleryImageUrls?: (string | undefined)[]; // Can contain data URIs or existing URLs
  sizes?: {
    size: string;
    price?: number;
    wholesalePrice?: number;
  }[];
  wholesaleDiscountPercentage?: number;
  wholesaleMoq?: number;
}

class ProductService {
    async createProduct(productData: Omit<Product, 'id'>): Promise<string> {
        try {
            // Handle image uploads first
            let finalImageUrl = productData.imageUrl;
            if (productData.imageUrl && productData.imageUrl.startsWith('data:')) {
                finalImageUrl = await uploadImageFlow({ imageDataUri: productData.imageUrl, folder: 'products' });
            }

            let finalGalleryUrls: string[] = [];
            if (productData.galleryImageUrls) {
                finalGalleryUrls = await Promise.all(
                    productData.galleryImageUrls.map(async (img) => {
                        if (img && img.startsWith('data:')) {
                            return await uploadImageFlow({ imageDataUri: img, folder: 'products' });
                        }
                        return img || ''; // Keep existing URLs
                    })
                );
            }
            
            const productToSave = {
                ...productData,
                imageUrl: finalImageUrl,
                galleryImageUrls: finalGalleryUrls.filter(url => url), // Filter out any empty strings
            }
            
            const batch = writeBatch(db);
            const productRef = doc(collection(db, "products"));
            
            batch.set(productRef, productToSave);

            productData.sizes.forEach(s => {
                const inventoryId = `${productRef.id}-${s.size.replace(/\s/g, '')}`;
                const inventoryRef = doc(db, 'inventory', inventoryId);
                batch.set(inventoryRef, { quantity: 0 });
            });

            await batch.commit();

            return productRef.id;
        } catch (e) {
            console.error("Error adding document: ", e);
            throw new Error("Could not create product");
        }
    }
    
    async updateProduct(id: string, productData: ProductUpdateData): Promise<void> {
        try {
            const productRef = doc(db, "products", id);
            
            const dataToUpdate: any = { ...productData };

            // Handle image uploads
            if (dataToUpdate.imageUrl && dataToUpdate.imageUrl.startsWith('data:')) {
                dataToUpdate.imageUrl = await uploadImageFlow({ imageDataUri: dataToUpdate.imageUrl, folder: 'products' });
            }

            if (dataToUpdate.galleryImageUrls) {
                dataToUpdate.galleryImageUrls = await Promise.all(
                    dataToUpdate.galleryImageUrls.map(async (img: string) => {
                        if (img && img.startsWith('data:')) {
                            return await uploadImageFlow({ imageDataUri: img, folder: 'products' });
                        }
                        return img; // Keep existing URLs
                    })
                );
                // Filter out any null/undefined from failed uploads if necessary, though flow throws error
                dataToUpdate.galleryImageUrls = dataToUpdate.galleryImageUrls.filter((url: string | null) => url);
            }

            if (productData.keyBenefits && typeof productData.keyBenefits === 'string') {
                dataToUpdate.keyBenefits = productData.keyBenefits.split('\n').filter(b => b.trim() !== '');
            }
            if (productData.ingredients && typeof productData.ingredients === 'string') {
                dataToUpdate.ingredients = productData.ingredients.split(',').map(i => i.trim()).filter(i => i !== '');
            }
            if (productData.sizes) {
                 dataToUpdate.sizes = productData.sizes.map(s => ({
                     size: s.size,
                     price: s.price || 0,
                     wholesalePrice: s.wholesalePrice || 0
                }));
            }
            
            await updateDoc(productRef, dataToUpdate);

        } catch (e) {
            console.error("Error updating document: ", e);
            throw new Error("Could not update product");
        }
    }


    async getProducts(): Promise<Product[]> {
        const querySnapshot = await getDocs(collection(db, "products"));
        const products: Product[] = [];
        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() } as Product);
        });
        return products;
    }

    async getProductBySlug(slug: string): Promise<Product | null> {
        const q = query(collection(db, "products"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return null;
        }
        const docSnap = querySnapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as Product;
    }

     async getProductById(id: string): Promise<Product | null> {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Product;
        }
        return null;
    }
}

export const productService = new ProductService();

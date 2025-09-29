
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, getDoc, doc, writeBatch, updateDoc, setDoc } from 'firebase/firestore';
import type { Product } from '@/lib/data';

export interface ProductUpdateData {
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  keyBenefits?: string[];
  ingredients?: string[];
  directions?: string;
  cautions?: string;
  imageUrl?: string;
  galleryImageUrls?: string[];
  sizes?: {
    size: string;
    price?: number;
    wholesalePrice?: number;
  }[];
  wholesaleDiscountPercentage?: number;
  wholesaleMoq?: number;
  rating?: number;
  reviewCount?: number;
}

class ProductService {
    async createProduct(productData: Omit<Product, 'id'>): Promise<string> {
        try {
            const productToSave: any = {
                 ...productData,
                 rating: 0,
                 reviewCount: 0,
            };
            
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
            const data = doc.data();
            products.push({ 
                id: doc.id,
                ...data,
                rating: data.rating ?? 0,
                reviewCount: data.reviewCount ?? 0,
            } as Product);
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
        const data = docSnap.data();
        return { 
            id: docSnap.id,
            ...data,
            rating: data.rating ?? 5,
            reviewCount: data.reviewCount ?? Math.floor(Math.random() * 50) + 5 
        } as Product;
    }

     async getProductById(id: string): Promise<Product | null> {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return { 
                id: docSnap.id,
                ...data,
                rating: data.rating ?? 0,
                reviewCount: data.reviewCount ?? 0,
            } as Product;
        }
        return null;
    }
}

export const productService = new ProductService();

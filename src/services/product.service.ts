
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, getDoc, doc, writeBatch } from 'firebase/firestore';
import type { Product } from '@/lib/data';

// A leaner version of the form data for this service
export interface ProductData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  scentProfile: string[];
  features: string[];
  keyBenefits: string;
  ingredients: string;
  directions: string;
  cautions: string;
  imageId: string;
  sizes: {
    size: string;
    price?: number;
  }[];
}

class ProductService {
    async createProduct(productData: ProductData): Promise<string> {
        try {
            const productToSave = {
                ...productData,
                keyBenefits: productData.keyBenefits.split('\n').filter(b => b.trim() !== ''),
                ingredients: productData.ingredients.split(',').map(i => i.trim()).filter(i => i !== ''),
                sizes: productData.sizes.map(s => ({ size: s.size, price: s.price || 0 })),
            }
            
            const batch = writeBatch(db);
            const productRef = doc(collection(db, "products"));
            
            batch.set(productRef, productToSave);

            // Also create initial inventory records for each size
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
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Product;
    }
}

export const productService = new ProductService();

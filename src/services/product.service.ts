
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, getDoc, doc, writeBatch, updateDoc } from 'firebase/firestore';
import type { Product } from '@/lib/data';

// A leaner version of the form data for this service
export interface ProductData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
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

export interface ProductUpdateData extends Partial<ProductData> {};

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
    
    async updateProduct(id: string, productData: ProductUpdateData): Promise<void> {
        try {
            const productRef = doc(db, "products", id);
            
            const dataToUpdate: any = { ...productData };

            if (productData.keyBenefits) {
                dataToUpdate.keyBenefits = productData.keyBenefits.split('\n').filter(b => b.trim() !== '');
            }
            if (productData.ingredients) {
                dataToUpdate.ingredients = productData.ingredients.split(',').map(i => i.trim()).filter(i => i !== '');
            }
            if (productData.sizes) {
                 dataToUpdate.sizes = productData.sizes.map(s => ({ size: s.size, price: s.price || 0 }));
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

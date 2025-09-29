

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, getDoc, doc, writeBatch, updateDoc, setDoc, increment } from 'firebase/firestore';
import type { Product } from '@/lib/data';
import { activityService } from './activity.service';
import { orderService, Order } from './order.service';

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
  platformFee?: number;
  rating?: number;
  reviewCount?: number;
}

class ProductService {
    async createProduct(productData: Omit<Product, 'id'>, userId: string, userName: string): Promise<string> {
        try {
            const productToSave: any = {
                 ...productData,
                 rating: 0,
                 reviewCount: 0,
                 orderCount: 0,
                 totalRevenue: 0,
                 viewCount: 0,
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

             activityService.logActivity(
                `Created new product: ${productData.name}`,
                userId,
                userName
            );

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
            // Remove undefined fields to avoid overwriting with null
            if (dataToUpdate.deliveryFee !== undefined) {
                delete dataToUpdate.deliveryFee;
            }
            
            await updateDoc(productRef, dataToUpdate);

        } catch (e) {
            console.error("Error updating document: ", e);
            throw new Error("Could not update product");
        }
    }


    async getProducts(): Promise<Product[]> {
        const productsSnapshot = await getDocs(collection(db, "products"));
        const allOrders = await orderService.getOrders();
        
        const productStats = new Map<string, { orderCount: number; totalRevenue: number }>();

        allOrders.forEach(order => {
            order.items.forEach(item => {
                const stats = productStats.get(item.productId) || { orderCount: 0, totalRevenue: 0 };
                stats.orderCount += 1;
                stats.totalRevenue += item.price * item.quantity;
                productStats.set(item.productId, stats);
            });
        });
        
        const products: Product[] = [];
        productsSnapshot.forEach((doc) => {
            let data = doc.data();
             // Temporary fix for incorrect category data
            if (data.slug === 'citrus-bloom-dish-wash') {
                data.category = 'dish-wash';
                 data.imageUrl = 'https://res.cloudinary.com/dvciksxcn/image/upload/v1720084013/luna-essentials/citrus-bloom-dish-wash.png';
            }
            const stats = productStats.get(doc.id) || { orderCount: 0, totalRevenue: 0 };
            
            products.push({ 
                id: doc.id,
                ...data,
                rating: data.rating ?? 0,
                reviewCount: data.reviewCount ?? 0,
                wholesaleMoq: data.wholesaleMoq ?? 120,
                platformFee: data.platformFee ?? 0,
                orderCount: stats.orderCount,
                totalRevenue: stats.totalRevenue,
                viewCount: data.viewCount ?? 0,
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
        let data = docSnap.data();

        // Temporary fix for incorrect category data
        if (slug === 'citrus-bloom-dish-wash') {
            data.category = 'dish-wash';
            data.imageUrl = 'https://res.cloudinary.com/dvciksxcn/image/upload/v1720084013/luna-essentials/citrus-bloom-dish-wash.png';
        }

        return { 
            id: docSnap.id,
            ...data,
            rating: data.rating ?? 5,
            reviewCount: data.reviewCount ?? Math.floor(Math.random() * 50) + 5,
            wholesaleMoq: data.wholesaleMoq ?? 120,
            platformFee: data.platformFee ?? 0,
        } as Product;
    }

     async getProductById(id: string): Promise<Product | null> {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            let data = docSnap.data();
             // Temporary fix for incorrect category data
            if (data.slug === 'citrus-bloom-dish-wash') {
                data.category = 'dish-wash';
                data.imageUrl = 'https://res.cloudinary.com/dvciksxcn/image/upload/v1720084013/luna-essentials/citrus-bloom-dish-wash.png';
            }
            return { 
                id: docSnap.id,
                ...data,
                rating: data.rating ?? 0,
                reviewCount: data.reviewCount ?? 0,
                wholesaleMoq: data.wholesaleMoq ?? 120,
                platformFee: data.platformFee ?? 0,
            } as Product;
        }
        return null;
    }

    async incrementViewCount(productId: string): Promise<void> {
        try {
            const productRef = doc(db, 'products', productId);
            await updateDoc(productRef, {
                viewCount: increment(1)
            });
        } catch (error) {
            // Non-critical error, so we just log it and don't throw
            console.error(`Failed to increment view count for product ${productId}:`, error);
        }
    }
}

export const productService = new ProductService();

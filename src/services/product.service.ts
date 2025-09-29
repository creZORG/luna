
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, getDoc, doc, writeBatch, updateDoc, setDoc, increment } from 'firebase/firestore';
import type { Product } from '@/lib/data';
import { activityService } from './activity.service';
import { getOrders } from './order.service';

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


export async function createProduct(productData: Omit<Product, 'id' | 'orderCount' | 'totalRevenue' | 'viewCount' >, userId: string, userName: string): Promise<string> {
    if (!productData.imageUrl) {
        throw new Error("A primary image (imageUrl) is required to create a product.");
    }

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

        await batch.commit();

        activityService.logActivity(
            `Created new product: ${productData.name}`,
            userId,
            userName
        );

        return productRef.id;
    } catch (e: any) {
        console.error("Error adding document: ", e);
        throw new Error(`Could not create product: ${e.message}`);
    }
}

export async function updateProduct(id: string, productData: ProductUpdateData): Promise<void> {
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


export async function getProducts(): Promise<Product[]> {
    // 1. Fetch all products and all orders in parallel.
    const [productsSnapshot, allOrders] = await Promise.all([
        getDocs(collection(db, "products")),
        getOrders()
    ]);
    
    // 2. Create a simple map to hold sales statistics.
    const productStats = new Map<string, { orderCount: number; totalRevenue: number }>();

    allOrders.forEach(order => {
        order.items.forEach(item => {
            if (!item.productId) return;
            const stats = productStats.get(item.productId) || { orderCount: 0, totalRevenue: 0 };
            stats.orderCount += 1;
            stats.totalRevenue += item.price * item.quantity;
            productStats.set(item.productId, stats);
        });
    });
    
    // 3. Map over the fetched products and safely merge the stats.
    const products: Product[] = productsSnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const stats = productStats.get(docSnap.id) || { orderCount: 0, totalRevenue: 0 };

        const product: Product = {
            id: docSnap.id,
            slug: data.slug,
            name: data.name,
            category: data.category,
            sizes: data.sizes || [],
            description: data.description,
            keyBenefits: data.keyBenefits || [],
            ingredients: data.ingredients || [],
            directions: data.directions,
            cautions: data.cautions,
            imageUrl: data.imageUrl || '',
            galleryImageUrls: data.galleryImageUrls || [],
            shortDescription: data.shortDescription,
            rating: data.rating ?? 0,
            reviewCount: data.reviewCount ?? 0,
            wholesaleMoq: data.wholesaleMoq ?? 120,
            platformFee: data.platformFee ?? 0,
            viewCount: data.viewCount ?? 0,
            orderCount: stats.orderCount,
            totalRevenue: stats.totalRevenue,
        };
        return product;
    });

    return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    const q = query(collection(db, "products"), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const docSnap = querySnapshot.docs[0];
    let data = docSnap.data();

    return { 
        id: docSnap.id,
        ...data,
        rating: data.rating ?? 5,
        reviewCount: data.reviewCount ?? Math.floor(Math.random() * 50) + 5,
        wholesaleMoq: data.wholesaleMoq ?? 120,
        platformFee: data.platformFee ?? 0,
    } as Product;
}

export async function getProductById(id: string): Promise<Product | null> {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        let data = docSnap.data();
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

export async function incrementViewCount(productId: string): Promise<void> {
    try {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, {
            viewCount: increment(1)
        });
    } catch (error) {
        // Non-critical error, so we just log it and don't interrupt the user.
        console.error(`Failed to increment view count for product ${productId}:`, error);
    }
}

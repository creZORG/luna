import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/lib/data';

export interface DashboardData {
    totalProducts: number;
    totalCategories: number;
    productsPerCategory: { category: string; count: number }[];
}

class DashboardService {
    async getDashboardData(): Promise<DashboardData> {
        const productsSnapshot = await getDocs(collection(db, "products"));
        const products: Product[] = [];
        productsSnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() } as Product);
        });

        const totalProducts = products.length;

        const categoryCounts = products.reduce((acc, product) => {
            const categoryName = product.category.replace(/-/g, ' ');
            acc[categoryName] = (acc[categoryName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const totalCategories = Object.keys(categoryCounts).length;

        const productsPerCategory = Object.entries(categoryCounts).map(([category, count]) => ({
            category,
            count,
        }));

        return {
            totalProducts,
            totalCategories,
            productsPerCategory,
        };
    }
}

export const dashboardService = new DashboardService();



import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/lib/data';
import { getOrders } from './order.service';
import { activityService, ActivityLog } from './activity.service';

export interface DashboardData {
    totalProducts: number;
    totalCategories: number;
    productsPerCategory: { category: string; count: number }[];
    totalSales: number;
    totalOrders: number;
    recentOrders: Order[];
    recentActivities: ActivityLog[];
}

class DashboardService {
    async getDashboardData(): Promise<DashboardData> {
        // Fetch products and categories
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

        // Fetch all orders to calculate total sales and count
        const allOrders = await getOrders();
        const totalOrders = allOrders.length;
        const totalSales = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Fetch recent orders
        const recentOrders = allOrders.slice(0, 5);

        // Fetch recent activities
        const recentActivities = await activityService.getRecentActivities(5);

        return {
            totalProducts,
            totalCategories,
            productsPerCategory,
            totalSales,
            totalOrders,
            recentOrders,
            recentActivities,
        };
    }
}

export const dashboardService = new DashboardService();

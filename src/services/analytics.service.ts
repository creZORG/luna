

import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, orderService } from './order.service';
import { Product, productService } from './product.service';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';
import { UserProfile, userService } from './user.service';
import { campaignService } from './campaign.service';


export interface SalesOverTimeData {
    date: string;
    sales: number;
}

export interface SalesByCategoryData {
    category: string;
    sales: number;
}

export interface SalespersonPerformance {
    id: string;
    name: string;
    email: string;
    photoUrl?: string;
    orderCount: number;
    totalRevenue: number;
}

export interface AnalyticsData {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    salesOverTime: SalesOverTimeData[];
    salesByCategory: SalesByCategoryData[];
    topProducts: Product[];
    topSalespeople: SalespersonPerformance[];
}

class AnalyticsService {
    
    async getDashboardAnalytics(): Promise<AnalyticsData> {
        const [orders, products, users, campaigns] = await Promise.all([
            orderService.getOrders(),
            productService.getProducts(),
            userService.getUsers(),
            campaignService.getCampaigns(),
        ]);

        // 1. Calculate Total Revenue and Orders
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalOrders = orders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // 2. Calculate Sales Over the Last 7 Days
        const salesOverTime: SalesOverTimeData[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const dayStart = startOfDay(date);
            const dayEnd = endOfDay(date);
            
            const dailySales = orders
                .filter(order => {
                    const orderDate = (order.orderDate as Timestamp).toDate();
                    return orderDate >= dayStart && orderDate <= dayEnd;
                })
                .reduce((sum, order) => sum + order.totalAmount, 0);
                
            salesOverTime.push({
                date: format(date, 'MMM d'),
                sales: dailySales,
            });
        }

        // 3. Calculate Sales by Category
        const salesByCategoryMap = new Map<string, number>();
        orders.forEach(order => {
            order.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    const currentSales = salesByCategoryMap.get(product.category) || 0;
                    salesByCategoryMap.set(product.category, currentSales + (item.price * item.quantity));
                }
            });
        });

        const salesByCategory: SalesByCategoryData[] = Array.from(salesByCategoryMap.entries()).map(([category, sales]) => ({
            category: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '),
            sales
        }));

        // 4. Get Top 5 Performing Products by Revenue
        const topProducts = [...products]
            .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
            .slice(0, 5);

        // 5. Calculate Salesperson & Marketer Performance
        const staffWithSalesRoles = users.filter(u => u.roles.includes('sales') || u.roles.includes('digital-marketing'));
        const performanceMap = new Map<string, SalespersonPerformance>();
        const campaignCodeToMarketerId = new Map(campaigns.map(c => [c.promoCode, c.marketerId]));

        staffWithSalesRoles.forEach(sp => {
            performanceMap.set(sp.uid, {
                id: sp.uid,
                name: sp.displayName,
                email: sp.email,
                photoUrl: sp.photoURL,
                orderCount: 0,
                totalRevenue: 0,
            });
        });
        
        orders.forEach(order => {
            let responsibleMarketerId: string | undefined = undefined;

            if (order.userId && performanceMap.has(order.userId)) {
                // This is a direct field sale by a salesperson
                responsibleMarketerId = order.userId;
            } else if (order.promoCode) {
                // This is an online sale with a promo code
                responsibleMarketerId = campaignCodeToMarketerId.get(order.promoCode);
            }

            if (responsibleMarketerId && performanceMap.has(responsibleMarketerId)) {
                const performance = performanceMap.get(responsibleMarketerId)!;
                performance.orderCount += 1;
                performance.totalRevenue += order.totalAmount;
                performanceMap.set(responsibleMarketerId, performance);
            }
        });
        
        const topSalespeople = Array.from(performanceMap.values())
            .filter(p => p.orderCount > 0) // Only show staff with actual sales
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5);
        
        return {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            salesOverTime,
            salesByCategory,
            topProducts,
            topSalespeople,
        };
    }
}

export const analyticsService = new AnalyticsService();

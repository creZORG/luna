
'use server';

import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, orderService } from './order.service';
import { RawMaterial, rawMaterialService } from './raw-material.service';
import { StoreItem, storeItemService } from './store-item.service';
import { pickupLocationService } from './pickup-location.service';

const LOW_STOCK_THRESHOLD = 10;

type LowStockItem = {
    id: string;
    name: string;
    inventory: number;
    category: string;
    unitOfMeasure?: string;
}

export interface OperationsDashboardData {
    totalFinishedGoods: number;
    lowStockRawMaterials: number;
    pendingOrdersCount: number;
    pickupLocationsCount: number;
    lowStockItems: LowStockItem[];
    recentPendingOrders: Order[];
}

class OperationsService {
    
    async getDashboardData(): Promise<OperationsDashboardData> {
        // Fetch all data in parallel
        const [
            allStoreItems,
            allRawMaterials,
            allPendingOrders,
            allPickupLocations
        ] = await Promise.all([
            storeItemService.getStoreItems(),
            rawMaterialService.getRawMaterials(),
            orderService.getOrders().then(orders => orders.filter(o => ['paid', 'processing'].includes(o.status))),
            pickupLocationService.getPickupLocations()
        ]);
        
        // 1. Calculate Total Finished Goods
        const totalFinishedGoods = allStoreItems
            .filter(item => item.category === 'Finished Goods')
            .reduce((sum, item) => sum + item.inventory, 0);

        // 2. Find Low Stock Items (Raw Materials and Finished Goods)
        const lowStockItems: LowStockItem[] = [];

        allRawMaterials.forEach(material => {
            if (material.quantity <= LOW_STOCK_THRESHOLD) {
                lowStockItems.push({
                    id: material.id,
                    name: material.name,
                    inventory: material.quantity,
                    category: 'Raw Material',
                    unitOfMeasure: material.unitOfMeasure,
                });
            }
        });
        
        allStoreItems.forEach(item => {
            if (item.inventory <= LOW_STOCK_THRESHOLD) {
                lowStockItems.push({
                    id: item.id,
                    name: item.name,
                    inventory: item.inventory,
                    category: item.category,
                    unitOfMeasure: 'units',
                });
            }
        });
        
        const lowStockRawMaterials = lowStockItems.filter(i => i.category === 'Raw Material').length;

        // 3. Count Pending Orders and get recent ones
        const pendingOrdersCount = allPendingOrders.length;
        const recentPendingOrders = allPendingOrders.slice(0, 5);
        
        // 4. Count pickup locations
        const pickupLocationsCount = allPickupLocations.length;
        
        return {
            totalFinishedGoods,
            lowStockRawMaterials,
            pendingOrdersCount,
            pickupLocationsCount,
            lowStockItems: lowStockItems.sort((a,b) => a.inventory - b.inventory),
            recentPendingOrders,
        };
    }
}

export const operationsService = new OperationsService();

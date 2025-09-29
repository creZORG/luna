
'use server';

import { db } from '@/lib/firebase';
import { runTransaction, doc } from 'firebase/firestore';
import { activityService } from './activity.service';
import { rawMaterialService } from './raw-material.service';
import { storeItemService } from './store-item.service';

export interface ProductionRunData {
    finishedGoodItemId: string; // The composite ID of the store item, e.g. "productId-size"
    productName: string;
    quantityProduced: number;
}

class ManufacturingService {
    async logProductionRun(
        data: ProductionRunData,
        userId: string,
        userName: string
    ): Promise<void> {
        try {
            await runTransaction(db, async (transaction) => {
                
                // 1. Consume Raw Materials based on a recipe
                await rawMaterialService.consumeRawMaterialsForProduction(
                    transaction,
                    data.productName,
                    data.quantityProduced
                );

                // 2. Increase the inventory of the finished good
                await storeItemService.incrementItemInventory(
                    transaction,
                    data.finishedGoodItemId,
                    data.quantityProduced
                );
            });
            
            // 3. Log the activity after the transaction is successful
            await activityService.logActivity(
                `Logged production of ${data.quantityProduced} units of ${data.productName}`,
                userId,
                userName
            );

        } catch (error) {
            console.error("Error logging production run:", error);
            if (error instanceof Error) {
                throw new Error(`Failed to log production run: ${error.message}`);
            }
            throw new Error("An unknown error occurred while logging the production run.");
        }
    }
}

export const manufacturingService = new ManufacturingService();

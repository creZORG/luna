

import { db } from '@/lib/firebase';
import { runTransaction, doc, collection, addDoc, serverTimestamp, query, orderBy, getDocs } from 'firebase/firestore';
import { activityService } from './activity.service';
import { rawMaterialService } from './raw-material.service';
import { storeItemService } from './store-item.service';

export interface ProductionRun {
    id: string;
    finishedGoodItemId: string;
    productName: string;
    quantityProduced: number;
    userId: string;
    userName: string;
    createdAt: any; // Firebase Timestamp
}

export type ProductionRunData = Omit<ProductionRun, 'id'| 'createdAt' | 'userId' | 'userName'>;

class ManufacturingService {
    async logProductionRun(
        data: ProductionRunData,
        userId: string,
        userName: string
    ): Promise<void> {
        const productionRunRef = doc(collection(db, 'productionRuns'));

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
                
                // 3. Create a record of the production run
                const productionRunRecord = {
                    ...data,
                    userId,
                    userName,
                    createdAt: serverTimestamp()
                };
                transaction.set(productionRunRef, productionRunRecord);
            });
            
            // 4. Log the activity after the transaction is successful
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
    
    async getProductionRuns(): Promise<ProductionRun[]> {
        try {
            const q = query(collection(db, 'productionRuns'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const runs: ProductionRun[] = [];
            querySnapshot.forEach(doc => {
                runs.push({ id: doc.id, ...doc.data() } as ProductionRun);
            });
            return runs;
        } catch (error) {
            console.error("Error fetching production runs:", error);
            throw new Error("Could not fetch production history.");
        }
    }
}

export const manufacturingService = new ManufacturingService();

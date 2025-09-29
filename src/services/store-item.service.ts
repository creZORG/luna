

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, writeBatch, serverTimestamp, doc, updateDoc, setDoc, Transaction, increment, orderBy } from 'firebase/firestore';
import type { StoreItem, StoreItemRequest, RequestStatus } from '@/lib/store-items.data';
import { activityService } from './activity.service';

class StoreItemService {
    async getStoreItems(): Promise<StoreItem[]> {
        const querySnapshot = await getDocs(query(collection(db, "storeItems"), orderBy("name")));
        
        const items: StoreItem[] = [];
        querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as StoreItem);
        });

        return items;
    }
    
    async createStoreItem(itemData: Omit<StoreItem, 'id' | 'inventory'>, adminId: string, adminName: string): Promise<StoreItem> {
        try {
            const docRef = await addDoc(collection(db, "storeItems"), {
                ...itemData,
                inventory: 0, // All new items start with 0 inventory
            });

             await activityService.logActivity(
                `Created new store item: ${itemData.name}`,
                adminId,
                adminName
            );

            return { id: docRef.id, ...itemData, inventory: 0 };

        } catch (error) {
             console.error("Error creating store item:", error);
            throw new Error("Could not create store item.");
        }
    }


    async getItemRequests(status?: RequestStatus): Promise<StoreItemRequest[]> {
        let q = query(collection(db, "itemRequests"));
        if (status) {
            q = query(q, where("status", "==", status));
        }
        const querySnapshot = await getDocs(q);
        const requests: StoreItemRequest[] = [];
        querySnapshot.forEach((doc) => {
            requests.push({ id: doc.id, ...doc.data() } as StoreItemRequest);
        });
        return requests.sort((a, b) => b.requestDate.seconds - a.requestDate.seconds);
    }
    
    async updateItemInventory(itemId: string, newInventory: number, adminId: string, adminName: string): Promise<void> {
        const itemRef = doc(db, 'inventory', itemId);
        await setDoc(itemRef, { quantity: newInventory }, { merge: true });
         activityService.logActivity(
            `Adjusted inventory for item ID ${itemId} to ${newInventory}.`,
            adminId,
            adminName
        );
    }

    // Helper for use within transactions
    async incrementItemInventory(transaction: Transaction, itemId: string, quantity: number): Promise<void> {
        const inventoryRef = doc(db, 'inventory', itemId);
        transaction.set(inventoryRef, { quantity: increment(quantity) }, { merge: true });
    }

    async createItemRequests(itemIds: string[], requesterId: string, requesterName: string): Promise<void> {
        try {
            // Determine department from user roles - simplified for now
            const department = "Digital Marketing";

            const batch = writeBatch(db);

            itemIds.forEach(itemId => {
                const docRef = doc(collection(db, "itemRequests"));
                const newRequest: Omit<StoreItemRequest, 'id'> = {
                    itemId,
                    requesterId,
                    requesterName,
                    department,
                    requestDate: serverTimestamp(),
                    status: 'pending'
                };
                batch.set(docRef, newRequest);
            });

            await batch.commit();
            
            activityService.logActivity(
                `Requested ${itemIds.length} store item(s).`,
                requesterId,
                requesterName
            );

        } catch (e) {
            console.error("Error creating item requests: ", e);
            throw new Error("Could not create item requests");
        }
    }

    async seedStoreItems(items: Omit<StoreItem, 'id' | 'inventory'>[]): Promise<void> {
        const storeItemsRef = collection(db, "storeItems");
        const snapshot = await getDocs(storeItemsRef);
        if (!snapshot.empty) {
            console.log("Store items collection already exists. Skipping seed.");
            return;
        }

        const batch = writeBatch(db);
        items.forEach(item => {
            const docRef = doc(storeItemsRef);
            batch.set(docRef, { ...item, inventory: 0 });
        });
        await batch.commit();
        console.log("Successfully seeded store items.");
    }
}

export const storeItemService = new StoreItemService();

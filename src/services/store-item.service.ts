
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, writeBatch, serverTimestamp, doc } from 'firebase/firestore';
import type { StoreItem, StoreItemRequest, RequestStatus } from '@/lib/store-items.data';

class StoreItemService {
    async getStoreItems(): Promise<StoreItem[]> {
        const querySnapshot = await getDocs(collection(db, "storeItems"));
        const items: StoreItem[] = [];
        querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as StoreItem);
        });
        return items;
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

    async createItemRequests(itemIds: string[]): Promise<void> {
        try {
            // In a real app, user details would come from the auth context
            const requesterId = "temp-digital-markerter-id";
            const requesterName = "Jane Doe"; 
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

        } catch (e) {
            console.error("Error creating item requests: ", e);
            throw new Error("Could not create item requests");
        }
    }

    // A function to seed the initial data.
    // This would typically only be run once.
    async seedStoreItems(items: Omit<StoreItem, 'id'>[]): Promise<void> {
        const storeItemsRef = collection(db, "storeItems");
        const snapshot = await getDocs(storeItemsRef);
        if (!snapshot.empty) {
            console.log("Store items collection already exists. Skipping seed.");
            return;
        }

        const batch = writeBatch(db);
        items.forEach(item => {
            const docRef = doc(storeItemsRef);
            batch.set(docRef, item);
        });
        await batch.commit();
        console.log("Successfully seeded store items.");
    }
}

export const storeItemService = new StoreItemService();

// Example of how you might seed the data (optional, could be run from a script)
// import { STORE_ITEMS } from '@/lib/store-items.data';
// storeItemService.seedStoreItems(STORE_ITEMS);

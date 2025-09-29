
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, writeBatch, serverTimestamp, doc, updateDoc, setDoc } from 'firebase/firestore';
import type { StoreItem, StoreItemRequest, RequestStatus } from '@/lib/store-items.data';
import { activityService } from './activity.service';
import { PlaceHolderImages } from '@/lib/placeholder-images';

class StoreItemService {
    async getStoreItems(): Promise<StoreItem[]> {
        const querySnapshot = await getDocs(query(collection(db, "storeItems"), where('category', '!=', 'Finished Goods')));
        const productSnapshot = await getDocs(collection(db, "products"));

        const items: StoreItem[] = [];
        querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as StoreItem);
        });

        productSnapshot.forEach((doc) => {
            const product = doc.data();
             product.sizes.forEach((size: { size: string, price: number}) => {
                const compositeId = `${doc.id}-${size.size.replace(/\s/g, '')}`;
                const placeholderImage = PlaceHolderImages.find(p => p.id === product.slug);

                // Do not add if it already exists from a dedicated storeItem entry
                if (!items.some(i => i.id === compositeId)) {
                    items.push({
                        id: compositeId,
                        name: `${product.name} (${size.size})`,
                        category: 'Finished Goods',
                        inventory: 0, // Default inventory
                        imageUrl: placeholderImage?.imageUrl,
                        price: size.price,
                        productId: doc.id,
                        size: size.size,
                    } as any);
                }
            });
        });

        // Get inventory levels from the central inventory collection
        const inventorySnapshot = await getDocs(collection(db, "inventory"));
        const inventoryMap = new Map<string, number>();
        inventorySnapshot.forEach(doc => {
            inventoryMap.set(doc.id, doc.data().quantity);
        });

        const finalItems = items.map(item => ({
            ...item,
            inventory: inventoryMap.get(item.id) ?? item.inventory ?? 0,
        }));
        
        return finalItems;
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

    // A function to seed the initial data.
    // This would typically only be run once.
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

// Example of how you might seed the data (optional, could be run from a script)
// import { STORE_ITEMS } from '@/lib/store-items.data';
// storeItemService.seedStoreItems(STORE_ITEMS);

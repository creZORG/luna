
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';

class InventoryService {

    async getStock(productId: string, size: string): Promise<number> {
        const inventoryId = `${productId}-${size.replace(/\s/g, '')}`;
        const inventoryRef = doc(db, 'inventory', inventoryId);
        const docSnap = await getDoc(inventoryRef);
        
        if (docSnap.exists()) {
            return docSnap.data().quantity || 0;
        }
        return 0;
    }

    async decrementStock(productId: string, size: string, quantity: number): Promise<void> {
        const inventoryId = `${productId}-${size.replace(/\s/g, '')}`;
        const inventoryRef = doc(db, 'inventory', inventoryId);
        
        await updateDoc(inventoryRef, {
            quantity: increment(-quantity)
        });
    }
}

export const inventoryService = new InventoryService();

    
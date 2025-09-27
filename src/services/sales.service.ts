import { db } from '@/lib/firebase';
import { collection, writeBatch, serverTimestamp, doc } from 'firebase/firestore';

export interface SalesLog {
    productId: string;
    size: string;
    openingStock: number;
    qtyIssued: number;
    qtySold: number;
    qtyReturned: number;
    defects: number;
    date: any; // Using 'any' for Firebase ServerTimestamp
    salespersonId: string; // This would be the logged-in user's ID
}

class SalesService {
    async createSalesLogs(salesLogs: Omit<SalesLog, 'date' | 'salespersonId'>[]): Promise<void> {
        try {
            // In a real app, you'd get the salespersonId from the auth state
            const salespersonId = "temp-salesperson-id"; 

            const batch = writeBatch(db);

            salesLogs.forEach(log => {
                // Create a ref with a new ID by calling doc() on the collection
                const docRef = doc(collection(db, "sales"));
                batch.set(docRef, {
                    ...log,
                    date: serverTimestamp(),
                    salespersonId,
                });
            });

            await batch.commit();
        } catch (e) {
            console.error("Error adding sales documents: ", e);
            throw new Error("Could not create sales logs");
        }
    }
}


export const salesService = new SalesService();

import { db } from '@/lib/firebase';
import { collection, addDoc, writeBatch, serverTimestamp } from 'firebase/firestore';

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
                const docRef = addDoc(collection(db, "sales"), {}); // Create a ref with a new ID
                const id = docRef.id;
                batch.set(doc(db, "sales", id), {
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

// Helper function to get a new document reference with an ID, needed for batch writes
// as addDoc cannot be used directly in a batch.
function doc(db: any, collectionName: string, id: string) {
    return {
        _key: {
            path: {
                segments: [collectionName, id]
            }
        },
        _firestore: db
    };
}


export const salesService = new SalesService();

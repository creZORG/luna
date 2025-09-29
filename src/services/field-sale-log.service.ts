import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs } from 'firebase/firestore';

export interface FieldSaleLog {
    id?: string;
    salespersonId: string;
    salespersonName: string;
    orderId: string;
    customerName: string;
    customerPhone: string;
    latitude: number;
    longitude: number;
    timestamp: any; // Firebase Timestamp
}

class FieldSaleLogService {

    async logSale(data: Omit<FieldSaleLog, 'id' | 'timestamp'>): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, "fieldSaleLogs"), {
                ...data,
                timestamp: serverTimestamp(),
            });
            return docRef.id;
        } catch (error) {
            console.error("Error logging field sale location:", error);
            // Non-critical, so we don't throw. The main order succeeded.
            return '';
        }
    }

    async getLogs(): Promise<FieldSaleLog[]> {
         try {
            const q = query(
                collection(db, "fieldSaleLogs"),
                orderBy("timestamp", "desc"),
            );
            const querySnapshot = await getDocs(q);
            const logs: FieldSaleLog[] = [];
            querySnapshot.forEach((doc) => {
                logs.push({ id: doc.id, ...doc.data() } as FieldSaleLog);
            });
            return logs;
        } catch (error) {
            console.error("Error fetching field sale logs:", error);
            throw new Error("Could not fetch field sale logs.");
        }
    }
}

export const fieldSaleLogService = new FieldSaleLogService();


import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import type { PurchaseOrder } from '@/lib/purchase-orders.data';
import { activityService } from './activity.service';

class PurchaseOrderService {
  async createPurchaseOrder(
    orderData: Omit<PurchaseOrder, 'id' | 'orderDate' | 'status'>
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'purchaseOrders'), {
        ...orderData,
        orderDate: serverTimestamp(),
        status: 'ordered',
      });

      activityService.logActivity(
        `Created purchase order #${docRef.id.substring(0,6).toUpperCase()} for supplier ${orderData.supplierName}.`,
        orderData.orderedBy.userId,
        orderData.orderedBy.userName
      );

      return docRef.id;
    } catch (e) {
      console.error('Error adding purchase order: ', e);
      throw new Error('Could not create purchase order.');
    }
  }

  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    try {
      const q = query(
        collection(db, 'purchaseOrders'),
        orderBy('orderDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const orders: PurchaseOrder[] = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as PurchaseOrder);
      });
      return orders;
    } catch (e) {
      console.error('Error fetching purchase orders: ', e);
      throw new Error('Could not fetch purchase orders.');
    }
  }
}

export const purchaseOrderService = new PurchaseOrderService();

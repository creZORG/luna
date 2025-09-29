import { UnitOfMeasure } from './raw-materials.data';

export type PurchaseOrderStatus = 'draft' | 'ordered' | 'partially-received' | 'completed' | 'cancelled';

export interface PurchaseOrderItem {
    rawMaterialId: string;
    rawMaterialName: string;
    quantity: number;
    unit: UnitOfMeasure;
}

export interface PurchaseOrder {
    id: string;
    supplierName: string;
    supplierEmail: string;
    items: PurchaseOrderItem[];
    status: PurchaseOrderStatus;
    orderDate: any; // Firebase Timestamp
    expectedDeliveryDate?: any; // Firebase Timestamp
    notes?: string;
    orderedBy: {
        userId: string;
        userName: string;
    };
}

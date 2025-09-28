
export type StoreItem = {
    id: string;
    name: string;
    category: 'Electronics' | 'Accessories' | 'Software' | 'Finished Goods';
    inventory: number; // Represents quantity in the main store
};

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface StoreItemRequest {
    id: string;
    itemId: string;
    requesterId: string; // User ID
    requesterName: string; // User Name
    department: 'Digital Marketing' | 'Sales' | 'Other';
    requestDate: any; // Firebase Timestamp
    status: RequestStatus;
    decisionDate?: any; // Firebase Timestamp
    adminId?: string; // Admin User ID who made the decision
}


export const STORE_ITEMS: Omit<StoreItem, 'id' | 'inventory'>[] = [
    { name: 'DSLR Camera', category: 'Electronics' },
    { name: 'Tripod', category: 'Accessories' },
    { name: 'Lavalier Microphone', category: 'Electronics' },
    { name: 'Gimbal Stabilizer', category: 'Electronics' },
    { name: 'Adobe Creative Cloud License', category: 'Software' },
    { name: 'LED Light Panel', category: 'Accessories' },
    { name: 'Drone', category: 'Electronics' },
    { name: 'External Hard Drive (1TB)', category: 'Accessories' },
];

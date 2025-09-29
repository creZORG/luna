
export type UnitOfMeasure = 'kg' | 'L' | 'g' | 'ml' | 'units';

export interface RawMaterial {
    id: string;
    name: string;
    unitOfMeasure: UnitOfMeasure;
    quantity: number;
}

export interface RawMaterialIntake {
    id: string;
    deliveryNoteId: string;
    supplier: string;
    rawMaterialId: string;
    quantityOnNote: number;
    actualQuantity: number;
    batchNumber: string;
    manufacturingDate: any; // Firebase Timestamp
    expiryDate: any; // Firebase Timestamp
    physicalCheck: string;
    deliveryNotePhotoUrl: string;
    certificateOfAnalysisUrl?: string;
    receivedAt: any; // Firebase Timestamp
    receivedBy: string; // User ID
}

// Initial seed data for raw materials
export const RAW_MATERIALS_SEED: Omit<RawMaterial, 'id' | 'quantity'>[] = [
    { name: 'SLES 70', unitOfMeasure: 'kg' },
    { name: 'CDE', unitOfMeasure: 'kg' },
    { name: 'NaCl', unitOfMeasure: 'kg' },
    { name: 'PQ7', unitOfMeasure: 'kg' },
    { name: 'Glycerine', unitOfMeasure: 'L' },
    { name: 'Titanium Dioxide', unitOfMeasure: 'g' },
    { name: 'Citric Acid', unitOfMeasure: 'kg' },
    { name: 'Mango Fragrance Oil', unitOfMeasure: 'ml' },
    { name: 'Phenoxy Ethanol', unitOfMeasure: 'L' },
    { name: 'Natural Colours', unitOfMeasure: 'g' },
    { name: 'Cationic Surfactants', unitOfMeasure: 'kg' },
    { name: 'Anionic Surfactants', unitOfMeasure: 'kg' },
    { name: 'Amphoteric Surfactants', unitOfMeasure: 'kg' },
    { name: 'Orange Fragrance Oil', unitOfMeasure: 'ml' },
    { name: 'Mint Fragrance Oil', unitOfMeasure: 'ml' },
    { name: 'Lemon Fragrance Oil', unitOfMeasure: 'ml' },
    { name: 'Water', unitOfMeasure: 'L' },
];

    
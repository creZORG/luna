
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, runTransaction, serverTimestamp, writeBatch, query, orderBy } from 'firebase/firestore';
import type { RawMaterial, RawMaterialIntake, RAW_MATERIALS_SEED } from '@/lib/raw-materials.data';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const storage = getStorage();

export interface IntakeFormData {
    supplier: string;
    deliveryNoteId: string;
    rawMaterialId: string;
    quantityOnNote: number;
    actualQuantity: number;
    alkalinity: string;
    batchNumber: string;
    expiryDate: Date;
    deliveryNotePhoto: File;
}

class RawMaterialService {

    async getRawMaterials(): Promise<RawMaterial[]> {
        const q = query(collection(db, 'rawMaterials'), orderBy('name'));
        const querySnapshot = await getDocs(q);
        const materials: RawMaterial[] = [];
        querySnapshot.forEach((doc) => {
            materials.push({ id: doc.id, ...doc.data() } as RawMaterial);
        });
        return materials;
    }
    
    async logIntakeAndupdateInventory(formData: IntakeFormData, userId: string): Promise<string> {
        // 1. Upload the photo
        const photoRef = ref(storage, `delivery-notes/${Date.now()}-${formData.deliveryNotePhoto.name}`);
        const photoSnapshot = await uploadBytes(photoRef, formData.deliveryNotePhoto);
        const deliveryNotePhotoUrl = await getDownloadURL(photoSnapshot.ref);

        // 2. Create the intake log and update inventory in a transaction
        const intakeRef = doc(collection(db, 'rawMaterialIntakes'));
        const materialRef = doc(db, 'rawMaterials', formData.rawMaterialId);

        try {
            await runTransaction(db, async (transaction) => {
                const materialDoc = await transaction.get(materialRef);
                if (!materialDoc.exists()) {
                    throw "Raw material document does not exist!";
                }

                const newQuantity = materialDoc.data().quantity + formData.actualQuantity;
                
                transaction.update(materialRef, { quantity: newQuantity });

                const intakeData: Omit<RawMaterialIntake, 'id'> = {
                    supplier: formData.supplier,
                    deliveryNoteId: formData.deliveryNoteId,
                    rawMaterialId: formData.rawMaterialId,
                    quantityOnNote: formData.quantityOnNote,
                    actualQuantity: formData.actualQuantity,
                    alkalinity: formData.alkalinity,
                    batchNumber: formData.batchNumber,
                    expiryDate: formData.expiryDate,
                    deliveryNotePhotoUrl: deliveryNotePhotoUrl,
                    receivedAt: serverTimestamp(),
                    receivedBy: userId,
                }
                transaction.set(intakeRef, intakeData);
            });
            return intakeRef.id;
        } catch (e) {
            console.error("Transaction failed: ", e);
            throw new Error("Failed to log intake and update inventory.");
        }
    }


    // SEED FUNCTION: To be run once to populate the rawMaterials collection
    async seedRawMaterials(materials: Omit<RawMaterial, 'id' | 'quantity'>[]): Promise<void> {
        const collectionRef = collection(db, "rawMaterials");
        const snapshot = await getDocs(collectionRef);
        if (!snapshot.empty) {
            console.log("Raw materials collection already has documents. Skipping seed.");
            return;
        }

        const batch = writeBatch(db);
        materials.forEach(material => {
            const docRef = doc(collectionRef);
            const newMaterial: Omit<RawMaterial, 'id'> = {
                ...material,
                quantity: 0, // All materials start with 0 quantity
            };
            batch.set(docRef, newMaterial);
        });

        await batch.commit();
        console.log("Successfully seeded raw materials inventory.");
    }
}

export const rawMaterialService = new RawMaterialService();

// Example of how to seed the data. You could run this from a special admin page or a script.
// import { RAW_MATERIALS_SEED } from '@/lib/raw-materials.data';
// rawMaterialService.seedRawMaterials(RAW_MATERIALS_SEED);

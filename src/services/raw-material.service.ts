
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, runTransaction, serverTimestamp, writeBatch, query, orderBy, setDoc, updateDoc, getDoc, Transaction, where } from 'firebase/firestore';
import type { RawMaterial, RawMaterialIntake, UnitOfMeasure } from '@/lib/raw-materials.data';
import { userService } from './user.service';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { createEmailTemplate } from '@/lib/email-template';
import { activityService } from './activity.service';
import { uploadImageFlow } from '@/ai/flows/upload-image-flow';


export interface IntakeFormData {
    supplier: string;
    deliveryNoteId: string;
    rawMaterialId: string;
    quantityOnNote: number;
    actualQuantity: number;
    batchNumber: string;
    manufacturingDate: Date;
    expiryDate: Date;
    physicalCheck: string;
    deliveryNotePhoto: File;
    certificateOfAnalysis?: File;
}

export interface NewRawMaterialData {
    name: string;
    unitOfMeasure: UnitOfMeasure;
    quantity: number;
}

// Helper to convert File to Data URI
const toDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};


class RawMaterialService {

    async getRawMaterials(): Promise<RawMaterial[]> {
        const materialsQuery = query(collection(db, 'rawMaterials'), orderBy('name'));
        const materialsSnapshot = await getDocs(materialsQuery);
        const materials: RawMaterial[] = [];
        materialsSnapshot.forEach((doc) => {
            materials.push({ id: doc.id, ...doc.data() } as RawMaterial);
        });
        
        // This is a simplified inventory fetch. For a large number of materials,
        // it would be more performant to fetch inventory on demand.
        const inventorySnapshot = await getDocs(collection(db, 'inventory'));
        const inventoryMap = new Map<string, number>();
        inventorySnapshot.forEach(doc => {
            inventoryMap.set(doc.id, doc.data().quantity);
        });

        const fullMaterials: RawMaterial[] = materials.map(material => ({
            ...material,
            quantity: inventoryMap.get(material.id) ?? 0,
        }));

        return fullMaterials;
    }
    
    async getRawMaterialByName(name: string): Promise<RawMaterial | null> {
        const q = query(collection(db, 'rawMaterials'), where('name', '==', name));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        const docData = snapshot.docs[0];
        return { id: docData.id, ...docData.data() } as RawMaterial;
    }
    
    async createRawMaterial(data: NewRawMaterialData, userId: string, userName: string): Promise<string> {
        const materialRef = doc(collection(db, 'rawMaterials'));
        const inventoryRef = doc(db, 'inventory', materialRef.id);
        
        const batch = writeBatch(db);
        batch.set(materialRef, { name: data.name, unitOfMeasure: data.unitOfMeasure });
        batch.set(inventoryRef, { quantity: data.quantity });
        await batch.commit();

        activityService.logActivity(`Created new raw material: ${data.name} with initial stock of ${data.quantity}.`, userId, userName);
        return materialRef.id;
    }

    async updateRawMaterialQuantity(materialId: string, quantity: number, userId: string, userName: string): Promise<void> {
        const inventoryRef = doc(db, 'inventory', materialId);
        await setDoc(inventoryRef, { quantity }, { merge: true });
        activityService.logActivity(`Adjusted inventory for material ID ${materialId} to ${quantity}.`, userId, userName);
    }
    
    // This is a simplified recipe for demonstration purposes. A real app would store this in the database.
    getRecipeForProduct(productName: string): { materialName: string, quantityPerUnit: number }[] {
        if (productName.toLowerCase().includes('shower gel')) {
            return [
                { materialName: 'SLES 70', quantityPerUnit: 0.1 }, // 100g per 1kg/1L product
                { materialName: 'CDE', quantityPerUnit: 0.02 },
                { materialName: 'NaCl', quantityPerUnit: 0.015 },
                { materialName: 'Water', quantityPerUnit: 0.85 }, // Example quantities
            ];
        }
         if (productName.toLowerCase().includes('fabric softener')) {
            return [
                { materialName: 'Cationic Surfactants', quantityPerUnit: 0.15 },
                { materialName: 'Water', quantityPerUnit: 0.83 },
            ];
        }
        if (productName.toLowerCase().includes('dish wash')) {
            return [
                { materialName: 'Anionic Surfactants', quantityPerUnit: 0.2 },
                { materialName: 'Water', quantityPerUnit: 0.78 },
            ];
        }
        return [];
    }

    async consumeRawMaterialsForProduction(
        transaction: Transaction,
        productName: string,
        quantityProduced: number
    ): Promise<void> {
        const recipe = this.getRecipeForProduct(productName);
        if (recipe.length === 0) {
            console.warn(`No recipe found for product: ${productName}. Skipping raw material consumption.`);
            return;
        }

        for (const ingredient of recipe) {
            const material = await this.getRawMaterialByName(ingredient.materialName);
            if (!material) {
                throw new Error(`Recipe ingredient "${ingredient.materialName}" not found in raw materials inventory.`);
            }

            const quantityToConsume = ingredient.quantityPerUnit * quantityProduced;
            const inventoryRef = doc(db, 'inventory', material.id);
            const inventoryDoc = await transaction.get(inventoryRef);
            
            const currentQuantity = inventoryDoc.exists() ? inventoryDoc.data().quantity : 0;
            if (currentQuantity < quantityToConsume) {
                throw new Error(`Not enough stock of "${ingredient.materialName}". Required: ${quantityToConsume}, Available: ${currentQuantity}`);
            }

            transaction.update(inventoryRef, { quantity: currentQuantity - quantityToConsume });
        }
    }


    async logIntakeAndupdateInventory(formData: IntakeFormData, userId: string): Promise<string> {
        // 1. Upload the delivery note photo
        const deliveryNoteDataUri = await toDataUri(formData.deliveryNotePhoto);
        const deliveryNotePhotoUrl = await uploadImageFlow({
            imageDataUri: deliveryNoteDataUri,
            folder: 'delivery-notes'
        });

        // 2. Upload the CoA if it exists
        let certificateOfAnalysisUrl: string | undefined = undefined;
        if (formData.certificateOfAnalysis) {
            const coaDataUri = await toDataUri(formData.certificateOfAnalysis);
            certificateOfAnalysisUrl = await uploadImageFlow({
                imageDataUri: coaDataUri,
                folder: 'certificates-of-analysis'
            });
        }


        // 3. Create the intake log and update inventory in a transaction
        const intakeRef = doc(collection(db, 'rawMaterialIntakes'));
        const materialRef = doc(db, 'rawMaterials', formData.rawMaterialId);
        const inventoryRef = doc(db, 'inventory', formData.rawMaterialId);

        let materialName = 'Unknown Material';
        let userProfile = await userService.getUserProfile(userId);

        try {
            await runTransaction(db, async (transaction) => {
                const materialDoc = await transaction.get(materialRef);
                const inventoryDoc = await transaction.get(inventoryRef);

                if (!materialDoc.exists()) {
                    throw "Raw material document does not exist!";
                }
                materialName = materialDoc.data().name;

                const currentQuantity = inventoryDoc.exists() ? inventoryDoc.data().quantity : 0;
                const newQuantity = currentQuantity + formData.actualQuantity;
                
                transaction.set(inventoryRef, { quantity: newQuantity }, { merge: true });

                const intakeData: Omit<RawMaterialIntake, 'id'> = {
                    supplier: formData.supplier,
                    deliveryNoteId: formData.deliveryNoteId,
                    rawMaterialId: formData.rawMaterialId,
                    quantityOnNote: formData.quantityOnNote,
                    actualQuantity: formData.actualQuantity,
                    batchNumber: formData.batchNumber,
                    manufacturingDate: formData.manufacturingDate,
                    expiryDate: formData.expiryDate,
                    physicalCheck: formData.physicalCheck,
                    deliveryNotePhotoUrl: deliveryNotePhotoUrl,
                    certificateOfAnalysisUrl: certificateOfAnalysisUrl,
                    receivedAt: serverTimestamp(),
                    receivedBy: userId,
                }
                transaction.set(intakeRef, intakeData);
            });
            
            // Log activity
            if (userProfile) {
                 activityService.logActivity(
                    `Logged intake of ${formData.actualQuantity} units of ${materialName} from ${formData.supplier}.`,
                    userId,
                    userProfile.displayName
                );
            }

            // 4. Check for discrepancy and send email if needed
            const discrepancy = formData.quantityOnNote - formData.actualQuantity;
            if (discrepancy !== 0 || formData.physicalCheck !== 'Seals OK') {
                const admins = await userService.getAdmins();
                const subject = `Alert: Delivery Issue from ${formData.supplier}`;
                const body = `
                    <p>Hello Admins,</p>
                    <p>An issue was noted during the raw material intake process from supplier <strong>${formData.supplier}</strong>, logged by ${userProfile?.displayName}.</p>
                    <ul>
                        <li>Material: ${materialName}</li>
                        <li>Quantity on Delivery Note: ${formData.quantityOnNote}</li>
                        <li>Actual Quantity Received: ${formData.actualQuantity}</li>
                        <li><strong>Discrepancy: ${discrepancy.toFixed(2)}</strong></li>
                        <li>Physical Check Status: <strong>${formData.physicalCheck}</strong></li>
                    </ul>
                    <p>This may require a follow-up with the supplier. The delivery note number is ${formData.deliveryNoteId}.</p>
                `;
                const emailHtml = createEmailTemplate(subject, body);
                for (const admin of admins) {
                    await sendEmail({
                        to: { address: admin.email, name: admin.displayName },
                        subject: subject,
                        htmlbody: emailHtml,
                    });
                }
            }

            return intakeRef.id;
        } catch (e) {
            console.error("Transaction or email notification failed: ", e);
            throw new Error("Failed to log intake and update inventory.");
        }
    }
}

export const rawMaterialService = new RawMaterialService();
